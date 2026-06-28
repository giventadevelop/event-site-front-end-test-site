@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM Database export, reorder, schema refresh, import, and sync
REM ============================================================
REM Usage:
REM   database_export_import_refresh.bat WORKSPACE_ROOT [CONTAINER_ID] [flags...]
REM
REM Flags:
REM   /FORCE         Skip confirmation before schema rebuild
REM   /PROD          Import corrected_event_media_inserts.ordered_PROD.sql
REM   /SKIP-EXPORT   Skip pg_dump and steps 2-4; reuse export.sql and
REM                  corrected_event_media_inserts.ordered.sql unchanged
REM   /REMOTE        Steps 5-7 target remote Postgres (mosc-temp\.env.local first)
REM   /SCHEMA-ONLY   Apply schema (step 5) only; skip export 1-4 and import/sync 6-7
REM   /IMPORT-FILE   Override default import SQL (next arg or /IMPORT-FILE=path)
REM   /REGEN-MOSC    Regenerate mosc_malankara_orthodox_2 SQL from ordered source
REM   /PRE-CLEAN-MOSC  Run delete_mosc_tenant.sql before import (auto for MOSC files)
REM   /IMPORT-DUP-ONLY Import mosc_dup_only.sql (implies /PRE-CLEAN-MOSC, use with /DATA-ONLY)
REM   /DATA-ONLY     Skip schema rebuild (step 5); import + sequence sync only
REM ============================================================

set "CONTAINER_ID="
set "FORCE=0"
set "USE_PROD=0"
set "SKIP_EXPORT=0"
set "USE_REMOTE=0"
set "SCHEMA_ONLY=0"
set "CUSTOM_IMPORT_FILE="
set "REGEN_MOSC=0"
set "PRE_CLEAN_MOSC=0"
set "DATA_ONLY=0"
set "IMPORT_DUP_ONLY=0"
set "FINAL_EXIT=0"
set "RUN_MODE=FULL"
set "PSQL_MODE="
set "PSQL_CMD="
set "PSQL_DOCKER_IMAGE=postgres:16"

set "S0=--"
set "S1=--"
set "S2=--"
set "S3=--"
set "S4=--"
set "S5=--"
set "S6=--"
set "S7=--"

if "%~1"=="" goto :usage
if /i "%~1"=="/?" goto :usage
if /i "%~1"=="-h" goto :usage
if /i "%~1"=="--help" goto :usage

set "WORKSPACE_ROOT=%~1"
set "BATCH_DIR=%~dp0"
set "TARGET_ENV=%BATCH_DIR%database_target.local.env"
shift

:parse_loop
if "%~1"=="" goto :args_done
set "ARG=%~1"
if /i "!ARG!"=="/FORCE" (
  set "FORCE=1"
  shift
  goto :parse_loop
)
if /i "!ARG!"=="/PROD" (
  set "USE_PROD=1"
  shift
  goto :parse_loop
)
if /i "!ARG!"=="/SKIP-EXPORT" (
  set "SKIP_EXPORT=1"
  shift
  goto :parse_loop
)
if /i "!ARG!"=="/REMOTE" (
  set "USE_REMOTE=1"
  shift
  goto :parse_loop
)
if /i "!ARG!"=="/SCHEMA-ONLY" (
  set "SCHEMA_ONLY=1"
  shift
  goto :parse_loop
)
if /i "!ARG!"=="/IMPORT-FILE" goto :parse_import_file_path
if /i "!ARG!"=="/REGEN-MOSC" (
  set "REGEN_MOSC=1"
  shift
  goto :parse_loop
)
if /i "!ARG!"=="/PRE-CLEAN-MOSC" (
  set "PRE_CLEAN_MOSC=1"
  shift
  goto :parse_loop
)
if /i "!ARG!"=="/IMPORT-DUP-ONLY" (
  set "IMPORT_DUP_ONLY=1"
  set "PRE_CLEAN_MOSC=1"
  shift
  goto :parse_loop
)
if /i "!ARG!"=="/DATA-ONLY" (
  set "DATA_ONLY=1"
  set "SKIP_EXPORT=1"
  shift
  goto :parse_loop
)
if /i "!ARG:~0,13!"=="/IMPORT-FILE=" (
  set "CUSTOM_IMPORT_FILE=!ARG:~13!"
  shift
  goto :parse_loop
)
if /i "!ARG:~0,14!"=="/import-file=" (
  set "CUSTOM_IMPORT_FILE=!ARG:~14!"
  shift
  goto :parse_loop
)
if not "!ARG:~0,1!"=="/" (
  if not defined CONTAINER_ID (
    set "CONTAINER_ID=!ARG!"
    shift
    goto :parse_loop
  )
)
call :log_warn "Ignoring extra argument: !ARG!"
shift
goto :parse_loop

:parse_import_file_path
shift
if "%~1"=="" (
  call :log_err "/IMPORT-FILE requires a file path argument."
  exit /b 1
)
set "CUSTOM_IMPORT_FILE=%~1"
shift
goto :parse_loop

:args_done

if "%SCHEMA_ONLY%"=="1" (
  set "SKIP_EXPORT=1"
)

if "%USE_REMOTE%"=="1" (
  set "TARGET_MODE=REMOTE POSTGRES"
  if "%USE_PROD%"=="0" (
    set "USE_PROD=1"
    call :log_info "/REMOTE enabled - auto-enabling /PROD import file for production Clerk user IDs."
  )
)

set "MOSC_TEMP=%WORKSPACE_ROOT%\mosc-temp"
set "SQLS_DIR=%MOSC_TEMP%\code_html_template\SQLS"
set "SCHEMA_FILE=%SQLS_DIR%\Current_Sqls\Latest_Schema_Post__Blob_Claude_12.sql"
set "EXPORT_FILE=%SQLS_DIR%\export.sql"
set "ORDERED_FILE=%SQLS_DIR%\corrected_event_media_inserts.ordered.sql"
set "RENUMBERED_FILE=%SQLS_DIR%\sequence_fix_inserts\corrected_event_media_inserts.renumbered.sql"
set "PROD_FILE=%SQLS_DIR%\corrected_event_media_inserts.ordered_PROD.sql"
set "SYNC_BOOT=%WORKSPACE_ROOT%\event-site-manager-service\src\main\resources\sqls\sync_all_table_sequences.sql"
set "SYNC_MOSC=%SQLS_DIR%\Current_Sqls\sync_all_table_sequences.sql"
set "SYNC_BATCH_MOSC=%SQLS_DIR%\Current_Sqls\sync_spring_batch_sequences.sql"
set "DELETE_MOSC_FILE=%SQLS_DIR%\delete_mosc_tenant.sql"
set "MOSC_DUP_FILE=%SQLS_DIR%\mosc_dup_only.sql"
set "MOSC_FULL_FILE=%SQLS_DIR%\corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql"

if "%IMPORT_DUP_ONLY%"=="1" (
  set "CUSTOM_IMPORT_FILE=%MOSC_DUP_FILE%"
)

set "DB_USER=event_site_admin"
set "DB_NAME=event_site_manager_db"

call :log_banner "Database Export / Import / Refresh"
echo( Workspace root : %WORKSPACE_ROOT%
echo( SQLS folder    : %SQLS_DIR%
echo( Target mode    : !TARGET_MODE!
echo(

if not exist "%MOSC_TEMP%" (
  call :log_err "mosc-temp not found: %MOSC_TEMP%"
  goto :fail
)
if not exist "%SQLS_DIR%" (
  call :log_err "SQLS folder not found: %SQLS_DIR%"
  goto :fail
)

if defined CUSTOM_IMPORT_FILE (
  if not exist "!CUSTOM_IMPORT_FILE!" (
    call :log_err "Custom import file not found: !CUSTOM_IMPORT_FILE!"
    goto :fail
  )
)

if "%SCHEMA_ONLY%"=="1" (
  call :log_info "/SCHEMA-ONLY enabled - steps 1-4 and 6-7 will be skipped (schema apply only)."
)
if defined CUSTOM_IMPORT_FILE (
  call :log_info "Using custom import file: !CUSTOM_IMPORT_FILE!"
  if "%SCHEMA_ONLY%"=="1" (
    call :log_warn "/IMPORT-FILE ignored with /SCHEMA-ONLY (no data import will run)."
  )
  if "%PRE_CLEAN_MOSC%"=="0" (
    echo !CUSTOM_IMPORT_FILE! | findstr /i "mosc_malankara_orthodox_2 mosc_dup_only" >nul 2>&1
    if not errorlevel 1 (
      set "PRE_CLEAN_MOSC=1"
      call :log_info "Auto-enabling /PRE-CLEAN-MOSC for MOSC tenant import file."
    )
  )
)
if "%REGEN_MOSC%"=="1" (
  call :log_info "/REGEN-MOSC enabled - will regenerate MOSC SQL before import."
)
if "%DATA_ONLY%"=="1" (
  call :log_info "/DATA-ONLY enabled - step 5 schema rebuild will be skipped."
)

where node >nul 2>&1
if errorlevel 1 (
  call :log_err "node is not on PATH. Install Node.js and retry."
  goto :fail
)

if "%USE_REMOTE%"=="1" (
  call :load_remote_config
  if errorlevel 1 goto :fail
  call :resolve_psql
  if errorlevel 1 goto :fail
)

if "%SKIP_EXPORT%"=="1" if "%USE_REMOTE%"=="1" (
  set "S0=SKIP"
  call :log_info "Step 0 skipped - /SKIP-EXPORT with /REMOTE (no local Docker export needed)."
  if "%SCHEMA_ONLY%"=="1" (
    set "S1=SKIP"
    set "S2=SKIP"
    set "S3=SKIP"
    set "S4=SKIP"
    goto :before_confirm
  )
  goto :step1
)

where docker >nul 2>&1
if errorlevel 1 (
  call :log_err "docker is not on PATH. Install Docker Desktop or use /SKIP-EXPORT with existing export.sql"
  goto :fail
)

docker info >nul 2>&1
if errorlevel 1 (
  call :log_err "Docker is not running. Start Docker Desktop and retry."
  goto :fail
)

REM --- STEP 0: Resolve Postgres container (local export source) ---
call :log_step "0" "Detecting local PostgreSQL Docker container"
if not defined CONTAINER_ID goto :detect_container
call :log_info "Using container ID from argument: %CONTAINER_ID%"
goto :verify_container

:detect_container
for /f "tokens=1" %%C in ('docker ps 2^>nul ^| findstr /i postgres') do (
  set "CONTAINER_ID=%%C"
  goto :verify_container
)
set "S0=FAIL"
call :log_err "No running postgres container found."
call :log_info "Run: docker ps ^| findstr postgres"
call :log_info "Or pass container ID as second argument, or use /SKIP-EXPORT with existing export.sql"
goto :fail

:verify_container
echo(          Container ID: !CONTAINER_ID!
docker ps --filter "id=!CONTAINER_ID!" --format "table {{.ID}}\t{{.Names}}\t{{.Image}}"
if errorlevel 1 call :log_warn "Could not verify container details; continuing anyway."
set "S0=OK"
call :log_ok "Step 0 complete - local container resolved"

if "%SCHEMA_ONLY%"=="1" (
  set "S1=SKIP"
  set "S2=SKIP"
  set "S3=SKIP"
  set "S4=SKIP"
  goto :before_confirm
)

REM --- STEP 1: pg_dump export ---
:step1
call :log_step "1" "Export data-only INSERTs from local Docker"
if "%SKIP_EXPORT%"=="1" goto :step1_skip
pushd "%SQLS_DIR%"
docker exec -i !CONTAINER_ID! pg_dump -U %DB_USER% -d %DB_NAME% --data-only --column-inserts > "%EXPORT_FILE%"
set "DUMP_ERR=!errorlevel!"
popd
if !DUMP_ERR! neq 0 (
  set "S1=FAIL"
  call :log_err "pg_dump failed with exit code !DUMP_ERR!"
  goto :fail
)
if not exist "%EXPORT_FILE%" (
  set "S1=FAIL"
  call :log_err "export file was not created"
  goto :fail
)
set "S1=OK"
call :log_ok "Step 1 complete - wrote export file"
call :log_info "File: %EXPORT_FILE%"
goto :step2

:step1_skip
set "S1=SKIP"
call :log_ok "Step 1 skipped (/SKIP-EXPORT) - export.sql left unchanged"
if exist "%EXPORT_FILE%" (
  call :log_info "File: %EXPORT_FILE% (not read; import uses ordered SQL below)"
) else (
  call :log_info "export.sql not present (OK for /SKIP-EXPORT)"
)
goto :step2

REM --- STEP 2: Reorder ---
:step2
call :log_step "2" "Reorder INSERT statements"
if "%SKIP_EXPORT%"=="1" goto :step2_skip
pushd "%SQLS_DIR%"
node reorder_sql_inserts_final.cjs
set "REORDER_ERR=!errorlevel!"
popd
if !REORDER_ERR! neq 0 (
  set "S2=FAIL"
  call :log_err "reorder_sql_inserts_final.cjs failed with exit code !REORDER_ERR!"
  goto :fail
)
if not exist "%ORDERED_FILE%" (
  set "S2=FAIL"
  call :log_err "ordered output file not found"
  goto :fail
)
set "S2=OK"
call :log_ok "Step 2 complete - ordered INSERT file created"
call :log_info "File: %ORDERED_FILE%"
call :renumber_import_sql
if errorlevel 1 goto :fail
goto :step3

:step2_skip
if not exist "%ORDERED_FILE%" (
  set "S2=FAIL"
  call :log_err "ordered import file not found: %ORDERED_FILE%"
  call :log_info "Restore from git or run without /SKIP-EXPORT to regenerate from export.sql"
  goto :fail
)
for %%F in ("%ORDERED_FILE%") do set "ORDERED_SIZE=%%~zF"
if !ORDERED_SIZE! LSS 100 (
  set "S2=FAIL"
  call :log_err "ordered import file is empty or too small (!ORDERED_SIZE! bytes): %ORDERED_FILE%"
  call :log_info "Restore from git: git checkout HEAD -- code_html_template/SQLS/corrected_event_media_inserts.ordered.sql"
  goto :fail
)
set "S2=SKIP"
call :log_ok "Step 2 skipped (/SKIP-EXPORT) - ordered file left unchanged"
call :log_info "File: %ORDERED_FILE% (!ORDERED_SIZE! bytes)"
if not defined CUSTOM_IMPORT_FILE (
  call :renumber_import_sql
  if errorlevel 1 goto :fail
)

REM --- STEP 3: PROD user ID copy ---
:step3
call :log_step "3" "Create PROD SQL copy with user ID replacements"
if "%SKIP_EXPORT%"=="1" goto :step3_skip
pushd "%MOSC_TEMP%"
node scripts\replace-user-profile-ids-in-sql.mjs
set "PROD_ERR=!errorlevel!"
popd
if !PROD_ERR! neq 0 (
  set "S3=FAIL"
  call :log_err "replace-user-profile-ids-in-sql.mjs failed with exit code !PROD_ERR!"
  goto :fail
)
if not exist "%PROD_FILE%" (
  set "S3=FAIL"
  call :log_err "PROD output file not found"
  goto :fail
)
set "S3=OK"
call :log_ok "Step 3 complete - PROD copy created"
call :log_info "File: %PROD_FILE%"
goto :step4_setup

:step3_skip
if "%USE_PROD%"=="1" (
  if not exist "%PROD_FILE%" (
    set "S3=FAIL"
    call :log_err "PROD import file not found: %PROD_FILE%"
    call :log_info "Run without /SKIP-EXPORT once to generate it, or copy from a backup"
    goto :fail
  )
  for %%F in ("%PROD_FILE%") do set "PROD_SIZE=%%~zF"
  if !PROD_SIZE! LSS 100 (
    set "S3=FAIL"
    call :log_err "PROD import file is empty or too small (!PROD_SIZE! bytes): %PROD_FILE%"
    goto :fail
  )
  set "S3=SKIP"
  call :log_ok "Step 3 skipped (/SKIP-EXPORT) - PROD file left unchanged"
  call :log_info "File: %PROD_FILE% (!PROD_SIZE! bytes)"
) else (
  set "S3=SKIP"
  call :log_ok "Step 3 skipped (/SKIP-EXPORT) - PROD copy not regenerated"
)

REM --- STEP 4: Comment pg_dump lines ---
:step4_setup
if defined CUSTOM_IMPORT_FILE (
  set "IMPORT_FILE=!CUSTOM_IMPORT_FILE!"
) else if "%USE_PROD%"=="1" (
  set "IMPORT_FILE=%PROD_FILE%"
) else if exist "%RENUMBERED_FILE%" (
  set "IMPORT_FILE=%RENUMBERED_FILE%"
  call :log_info "Default import: renumbered SQL (low local IDs, no 600k user_profile)"
) else (
  set "IMPORT_FILE=%ORDERED_FILE%"
  call :log_warn "Renumbered import file missing - using ordered.sql (may contain 600k IDs)"
)

:step4
call :log_step "4" "Comment pg_dump header lines in import file"
if "%SKIP_EXPORT%"=="1" goto :step4_skip
powershell -NoProfile -Command "$path = '%IMPORT_FILE%'; $lines = Get-Content -LiteralPath $path; $out = $lines | ForEach-Object { if ($_ -match '^\s*pg_dump') { $_ -replace 'pg_dump','-- pg_dump' } else { $_ } }; Set-Content -LiteralPath $path -Value $out -Encoding UTF8"
if errorlevel 1 (
  set "S4=FAIL"
  call :log_err "Failed to patch pg_dump lines"
  goto :fail
)
set "S4=OK"
call :log_ok "Step 4 complete - import file patched"
call :log_info "File: !IMPORT_FILE!"
goto :step4_done

:step4_skip
if not exist "!IMPORT_FILE!" (
  set "S4=FAIL"
  call :log_err "import file not found: !IMPORT_FILE!"
  goto :fail
)
set "S4=SKIP"
call :log_ok "Step 4 skipped (/SKIP-EXPORT) - import file left unchanged"
call :log_info "File: !IMPORT_FILE!"

:step4_done

if "%REGEN_MOSC%"=="1" (
  call :log_step "4b" "Regenerate MOSC tenant SQL (duplicate + patch + dup extract)"
  call :regen_mosc_sql
  if errorlevel 1 goto :fail
)

:before_confirm
REM --- Confirm destructive steps ---
if "%DATA_ONLY%"=="1" (
  call :log_banner "WARNING: /DATA-ONLY - import and sequence sync only (schema unchanged)"
) else if "%SCHEMA_ONLY%"=="1" (
  call :log_banner "WARNING: Step 5 will rebuild schema only (no data import)"
) else (
  call :log_banner "WARNING: Steps 5-7 rebuild schema and replace data"
)
if "%USE_REMOTE%"=="1" (
  echo( Target     : REMOTE - !REMOTE_HOST!:!REMOTE_PORT! / !REMOTE_DB!
  echo( User       : !REMOTE_USER!
  echo( SSL mode   : !REMOTE_SSLMODE!
) else (
  echo( Target     : LOCAL DOCKER container !CONTAINER_ID!
  echo( Database   : %DB_NAME%
)
echo(

if "%USE_REMOTE%"=="1" (
  set /p "CONFIRM=Type PRODUCTION to continue with REMOTE schema rebuild and import: "
  if /i not "!CONFIRM!"=="PRODUCTION" goto :confirm_abort
  goto :confirm_ok
)

if "%FORCE%"=="0" (
  if "%DATA_ONLY%"=="1" (
    set /p "CONFIRM=Type Y or YES to continue with MOSC data-only import (no schema rebuild): "
  ) else if "%SCHEMA_ONLY%"=="1" (
    set /p "CONFIRM=Type Y or YES to continue with schema-only rebuild (no import): "
  ) else (
    set /p "CONFIRM=Type Y or YES to continue with schema rebuild and import: "
  )
  if /i "!CONFIRM!"=="YES" goto :confirm_ok
  if /i "!CONFIRM!"=="Y" goto :confirm_ok
  goto :confirm_abort
)
:confirm_ok

if not exist "%SCHEMA_FILE%" (
  if not "%DATA_ONLY%"=="1" (
    set "S5=FAIL"
    call :log_err "Schema file not found: %SCHEMA_FILE%"
    goto :fail
  )
)

if "%DATA_ONLY%"=="1" (
  set "S5=SKIP"
  call :log_ok "Step 5 skipped (/DATA-ONLY) - schema left unchanged"
  goto :step6_pre_clean
)

REM --- STEP 5: Schema ---
call :log_step "5" "Apply database schema"
if "%USE_REMOTE%"=="1" (
  call :run_psql_file "%SCHEMA_FILE%" 1
  set "PSQL_ERR=!errorlevel!"
) else (
  docker exec -i !CONTAINER_ID! psql -U %DB_USER% -d %DB_NAME% -v ON_ERROR_STOP=1 < "%SCHEMA_FILE%"
  set "PSQL_ERR=!errorlevel!"
)
if !PSQL_ERR! neq 0 (
  set "S5=FAIL"
  call :log_err "Schema apply failed"
  goto :fail
)
set "S5=OK"
call :log_ok "Step 5 complete - schema applied"
call :log_info "File: %SCHEMA_FILE%"

if "%SCHEMA_ONLY%"=="1" (
  set "S6=SKIP"
  set "S7=SKIP"
  if "%USE_REMOTE%"=="1" (
    set "RUN_MODE=SCHEMA-ONLY-REMOTE"
  ) else (
    set "RUN_MODE=SCHEMA-ONLY"
  )
  goto :print_summary
)

:step6_pre_clean
if "%PRE_CLEAN_MOSC%"=="1" if not "%SCHEMA_ONLY%"=="1" (
  call :log_step "5b" "Pre-clean MOSC tenant rows (delete_mosc_tenant.sql)"
  if not exist "%DELETE_MOSC_FILE%" (
    set "S6=FAIL"
    call :log_err "delete_mosc_tenant.sql not found: %DELETE_MOSC_FILE%"
    goto :fail
  )
  if "%USE_REMOTE%"=="1" (
    call :run_psql_file "%DELETE_MOSC_FILE%" 1
    set "PSQL_ERR=!errorlevel!"
  ) else (
    docker exec -i !CONTAINER_ID! psql -U %DB_USER% -d %DB_NAME% -v ON_ERROR_STOP=1 < "%DELETE_MOSC_FILE%"
    set "PSQL_ERR=!errorlevel!"
  )
  if !PSQL_ERR! neq 0 (
    set "S6=FAIL"
    call :log_err "MOSC pre-clean failed"
    goto :fail
  )
  call :log_ok "Step 5b complete - MOSC tenant rows removed"
)

REM --- STEP 6: Import ---
call :log_step "6" "Import data"
if not exist "!IMPORT_FILE!" (
  set "S6=FAIL"
  call :log_err "Import file not found: !IMPORT_FILE!"
  goto :fail
)
if defined CUSTOM_IMPORT_FILE (
  set "IMPORT_STOP_ON_ERR=1"
  call :log_info "Custom /IMPORT-FILE: strict mode ON_ERROR_STOP=1 (import fails on first SQL error)"
) else (
  set "IMPORT_STOP_ON_ERR=0"
)
if "%USE_REMOTE%"=="1" (
  call :run_psql_file "!IMPORT_FILE!" !IMPORT_STOP_ON_ERR!
  set "PSQL_ERR=!errorlevel!"
) else (
  docker exec -i !CONTAINER_ID! psql -U %DB_USER% -d %DB_NAME% -v ON_ERROR_STOP=!IMPORT_STOP_ON_ERR! < "!IMPORT_FILE!"
  set "PSQL_ERR=!errorlevel!"
)
if !PSQL_ERR! neq 0 (
  if defined CUSTOM_IMPORT_FILE (
    set "S6=FAIL"
    call :log_err "Import failed - custom /IMPORT-FILE uses strict ON_ERROR_STOP=1"
    call :log_info "Fix SQL errors above, then re-run with /SKIP-EXPORT /IMPORT-FILE ... /FORCE"
    goto :fail
  ) else (
    set "S6=WARN"
    call :log_warn "Import reported errors - review psql output above"
    call :log_info "Partial imports may need manual cleanup (see DATABASE_EXPORT_IMPORT_GUIDE.html)"
  )
) else (
  set "S6=OK"
  call :log_ok "Step 6 complete - data import finished"
)
call :log_info "File: !IMPORT_FILE!"

REM --- STEP 7: Sequence sync ---
if exist "%SYNC_MOSC%" (
  set "SYNC_FILE=%SYNC_MOSC%"
) else if exist "%SYNC_BOOT%" (
  set "SYNC_FILE=%SYNC_BOOT%"
) else (
  set "S7=FAIL"
  call :log_err "sync_all_table_sequences.sql not found"
  call :log_info "Tried: %SYNC_BOOT%"
  call :log_info "Tried: %SYNC_MOSC%"
  goto :fail
)

call :log_step "7" "Sync per-table id sequences (application tables)"
if "%USE_REMOTE%"=="1" (
  call :run_psql_file "!SYNC_FILE!" 1
  set "PSQL_ERR=!errorlevel!"
) else (
  docker exec -i !CONTAINER_ID! psql -U %DB_USER% -d %DB_NAME% -v ON_ERROR_STOP=1 < "!SYNC_FILE!"
  set "PSQL_ERR=!errorlevel!"
)
if !PSQL_ERR! neq 0 (
  set "S7=FAIL"
  call :log_err "Sequence sync failed"
  goto :fail
)
set "S7=OK"
call :log_ok "Step 7 complete - sequences synchronized"
call :log_info "File: !SYNC_FILE!"

if exist "%SYNC_BATCH_MOSC%" (
  call :log_step "7b" "Sync Spring Batch sequences"
  if "%USE_REMOTE%"=="1" (
    call :run_psql_file "%SYNC_BATCH_MOSC%" 1
    set "PSQL_ERR=!errorlevel!"
  ) else (
    docker exec -i !CONTAINER_ID! psql -U %DB_USER% -d %DB_NAME% -v ON_ERROR_STOP=1 < "%SYNC_BATCH_MOSC%"
    set "PSQL_ERR=!errorlevel!"
  )
  if !PSQL_ERR! neq 0 (
    set "S7=FAIL"
    call :log_err "Spring Batch sequence sync failed"
    goto :fail
  )
  call :log_ok "Step 7b complete - Spring Batch sequences synchronized"
  call :log_info "File: %SYNC_BATCH_MOSC%"
)

if "%USE_REMOTE%"=="1" (
  set "RUN_MODE=FULL-REMOTE"
) else if "%DATA_ONLY%"=="1" (
  set "RUN_MODE=DATA-ONLY"
) else (
  set "RUN_MODE=FULL"
)
goto :print_summary

:confirm_abort
set "RUN_MODE=PARTIAL"
set "S5=--"
set "S6=--"
set "S7=--"
call :log_warn "Aborted before schema rebuild (confirmation not accepted)."
if "%USE_REMOTE%"=="1" (
  call :log_info "For remote production, type PRODUCTION when prompted."
) else (
  call :log_info "For local Docker, type Y or YES when prompted."
)
call :log_info "Re-run with /FORCE to skip this prompt. Steps 1-4 outputs were kept."
goto :print_summary

:print_summary
if "%USE_REMOTE%"=="1" call :cleanup_remote_secrets
echo(
call :log_banner "Run summary"
echo( Mode: !RUN_MODE!
echo( Target: !TARGET_MODE!
echo(
echo(  Step  Description                              Status
echo(  ---- ---------------------------------------- ------
echo(  0    Resolve Postgres container               !S0!
echo(  1    pg_dump export                           !S1!
echo(  2    Reorder INSERTs                          !S2!
echo(  3    PROD user ID copy                        !S3!
echo(  4    Comment pg_dump lines                    !S4!
echo(  5    Apply schema                             !S5!
echo(  6    Import data                              !S6!
echo(  7    Sync sequences                           !S7!
echo(

if /i "!RUN_MODE!"=="FULL" (
  if /i "!S6!"=="WARN" (
    set "FINAL_EXIT=2"
    call :log_warn "OVERALL: COMPLETED WITH WARNINGS (import had errors)"
  ) else (
    set "FINAL_EXIT=0"
    call :log_ok "OVERALL: SUCCESS - all steps completed"
  )
) else if /i "!RUN_MODE!"=="FULL-REMOTE" (
  if /i "!S6!"=="WARN" (
    set "FINAL_EXIT=2"
    call :log_warn "OVERALL: REMOTE COMPLETED WITH WARNINGS (import had errors)"
  ) else (
    set "FINAL_EXIT=0"
    call :log_ok "OVERALL: REMOTE SUCCESS - production target updated"
  )
) else if /i "!RUN_MODE!"=="PARTIAL" (
  set "FINAL_EXIT=0"
  call :log_ok "OVERALL: PARTIAL SUCCESS - export/reorder/PROD files ready"
  call :log_info "Re-run with /FORCE when ready for schema rebuild and import"
) else if /i "!RUN_MODE!"=="SCHEMA-ONLY" (
  set "FINAL_EXIT=0"
  call :log_ok "OVERALL: SUCCESS - schema applied (no data import)"
) else if /i "!RUN_MODE!"=="SCHEMA-ONLY-REMOTE" (
  set "FINAL_EXIT=0"
  call :log_ok "OVERALL: REMOTE SUCCESS - schema applied (no data import)"
) else (
  set "FINAL_EXIT=1"
  call :log_err "OVERALL: FAILED"
)

echo(
echo( Exit code: !FINAL_EXIT!  (0=success, 1=failed, 2=completed with warnings)
echo(
if "!FINAL_EXIT!"=="0" (
  endlocal
  exit /b 0
)
if "!FINAL_EXIT!"=="2" (
  endlocal
  exit /b 2
)
endlocal
exit /b 1

:fail
set "FINAL_EXIT=1"
set "RUN_MODE=FAILED"
goto :print_summary

:usage
echo(
echo( Usage:
echo(   %~nx0 WORKSPACE_ROOT [CONTAINER_ID] [flags...]
echo(
echo(   WORKSPACE_ROOT  Parent folder containing mosc-temp (e.g. F:\project_workspace)
echo(   CONTAINER_ID    Docker Postgres container ID (auto-detected if omitted)
echo(   /FORCE          Skip confirmation before schema rebuild
echo(   /PROD           Import corrected_event_media_inserts.ordered_PROD.sql
echo(   /SKIP-EXPORT    Skip export/reorder/PROD/patch; import existing ordered SQL as-is
echo(   /REMOTE         Apply steps 5-7 to remote Postgres (reads mosc-temp\.env.local)
echo(   /SCHEMA-ONLY    Apply schema only (step 5); skip export 1-4 and import/sync 6-7
echo(   /IMPORT-FILE    Override import SQL file (next arg or /IMPORT-FILE=path)
echo(   /REGEN-MOSC     Regenerate mosc_malankara_orthodox_2 SQL before import
echo(   /PRE-CLEAN-MOSC Run delete_mosc_tenant.sql before import (auto for MOSC files)
echo(   /IMPORT-DUP-ONLY Import mosc_dup_only.sql only (fast MOSC tenant refresh)
echo(   /DATA-ONLY      Skip schema rebuild; import + sequence sync only
echo(
echo( MOSC examples:
echo(   %~nx0 F:\project_workspace /REGEN-MOSC /SKIP-EXPORT /IMPORT-FILE "...\mosc_malankara_orthodox_2.sql" /FORCE
echo(   %~nx0 F:\project_workspace /REGEN-MOSC /SKIP-EXPORT /DATA-ONLY /IMPORT-DUP-ONLY /FORCE
echo(
echo( Remote config (first match wins):
echo(   1. WORKSPACE_ROOT\mosc-temp\.env.local  - RDS_ENDPOINT, DB_NAME, DB_USERNAME, DB_PASSWORD
echo(   2. %~dp0database_target.local.env       - fallback (DB_HOST, DB_USER, ...)
echo(
echo( Example:
echo(   %~nx0 F:\project_workspace
echo(   %~nx0 F:\project_workspace /SKIP-EXPORT /REMOTE /FORCE
echo(   %~nx0 F:\project_workspace /SCHEMA-ONLY /FORCE
echo(   %~nx0 F:\project_workspace /IMPORT-FILE "F:\path\to\custom_import.sql" /FORCE
exit /b 1

REM --- Load remote DB config: mosc-temp\.env.local first, then database_target.local.env ---
:load_remote_config
set "ENV_FILE="
set "ENV_SOURCE="
if exist "%MOSC_TEMP%\.env.local" (
  set "ENV_FILE=%MOSC_TEMP%\.env.local"
  set "ENV_SOURCE=mosc-temp\.env.local"
) else if exist "%TARGET_ENV%" (
  set "ENV_FILE=%TARGET_ENV%"
  set "ENV_SOURCE=database_target.local.env"
) else (
  call :log_err "No remote DB config found."
  call :log_info "Primary: %MOSC_TEMP%\.env.local with RDS_ENDPOINT, DB_NAME, DB_USERNAME, DB_PASSWORD"
  call :log_info "Fallback: %TARGET_ENV% (copy from database_target.local.env.example)"
  exit /b 1
)

set "REMOTE_HOST="
set "REMOTE_PORT=5432"
set "REMOTE_DB="
set "REMOTE_USER="
set "REMOTE_PASSWORD="
set "REMOTE_SSLMODE=require"
set "REMOTE_PASS_FILE=%TEMP%\db_import_remote_%RANDOM%%RANDOM%.pass"
for /f "usebackq tokens=1,* delims==" %%A in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='%ENV_FILE%'; $m=@{}; Get-Content -LiteralPath $p | ForEach-Object { $line=$_.Trim(); if ($line -eq '' -or $line.StartsWith('#')) { return }; $i=$line.IndexOf('='); if ($i -lt 1) { return }; $k=$line.Substring(0,$i).Trim(); $v=$line.Substring($i+1); $m[$k]=$v }; $h=$m['RDS_ENDPOINT']; if (-not $h) { $h=$m['DB_HOST'] }; $u=$m['DB_USERNAME']; if (-not $u) { $u=$m['DB_USER'] }; $pt=$m['DB_PORT']; if (-not $pt) { $pt='5432' }; $ssl=$m['DB_SSLMODE']; if (-not $ssl) { $ssl='require' }; if (-not $h -or -not $m['DB_NAME'] -or -not $u -or -not $m['DB_PASSWORD']) { Write-Error 'missing keys'; exit 1 }; [IO.File]::WriteAllText('%REMOTE_PASS_FILE%', $m['DB_PASSWORD']); Write-Output ('HOST='+$h); Write-Output ('PORT='+$pt); Write-Output ('DB='+$m['DB_NAME']); Write-Output ('USER='+$u); Write-Output ('SSL='+$ssl)"`) do (
  if /i "%%A"=="HOST" set "REMOTE_HOST=%%B"
  if /i "%%A"=="PORT" set "REMOTE_PORT=%%B"
  if /i "%%A"=="DB" set "REMOTE_DB=%%B"
  if /i "%%A"=="USER" set "REMOTE_USER=%%B"
  if /i "%%A"=="SSL" set "REMOTE_SSLMODE=%%B"
)
if errorlevel 1 goto :remote_config_missing

if not exist "%REMOTE_PASS_FILE%" goto :remote_config_missing
set /p REMOTE_PASSWORD=<"%REMOTE_PASS_FILE%"

if not defined REMOTE_HOST goto :remote_config_missing
if not defined REMOTE_DB goto :remote_config_missing
if not defined REMOTE_USER goto :remote_config_missing
if not defined REMOTE_PASSWORD goto :remote_config_missing
call :log_ok "Loaded remote target from !ENV_SOURCE!"
call :log_info "Host: !REMOTE_HOST!  Port: !REMOTE_PORT!  DB: !REMOTE_DB!  User: !REMOTE_USER!"
exit /b 0

:remote_config_missing
call :cleanup_remote_secrets
call :log_err "Remote DB config incomplete in %ENV_FILE%"
call :log_info "Required: RDS_ENDPOINT (or DB_HOST), DB_NAME, DB_USERNAME (or DB_USER), DB_PASSWORD"
exit /b 1

REM --- Find psql: native PATH/install, else Docker postgres image ---
:resolve_psql
set "PSQL_MODE="
set "PSQL_CMD="
where psql >nul 2>&1
if not errorlevel 1 (
  set "PSQL_MODE=native"
  set "PSQL_CMD=psql"
  call :log_info "Using native psql from PATH for /REMOTE steps."
  exit /b 0
)
for /d %%D in ("C:\Program Files\PostgreSQL\*") do (
  if exist "%%D\bin\psql.exe" (
    set "PSQL_MODE=native"
    set "PSQL_CMD=%%D\bin\psql.exe"
    call :log_info "Using native psql: %%D\bin\psql.exe"
    exit /b 0
  )
)
where docker >nul 2>&1
if errorlevel 1 (
  call :log_err "psql not found and Docker is not on PATH."
  call :log_info "Install PostgreSQL client tools, or install Docker Desktop for automatic psql via container."
  exit /b 1
)
docker info >nul 2>&1
if errorlevel 1 (
  call :log_err "Docker is not running. Start Docker Desktop for /REMOTE psql fallback."
  exit /b 1
)
set "PSQL_MODE=docker"
call :log_info "psql not on PATH - using Docker image !PSQL_DOCKER_IMAGE! for /REMOTE steps."
exit /b 0

:cleanup_remote_secrets
if exist "%REMOTE_PASS_FILE%" del /f /q "%REMOTE_PASS_FILE%" >nul 2>&1
goto :eof

REM --- Run psql against remote target. Arg1=file path, Arg2=stop on error (1=yes 0=no) ---
:run_psql_file
set "SQL_FILE=%~1"
set "STOP_ON_ERR=%~2"
if /i "!PSQL_MODE!"=="docker" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%BATCH_DIR%run_remote_psql.ps1" -SqlFile "!SQL_FILE!" -HostName "!REMOTE_HOST!" -Port "!REMOTE_PORT!" -User "!REMOTE_USER!" -Database "!REMOTE_DB!" -PassFile "!REMOTE_PASS_FILE!" -SslMode "!REMOTE_SSLMODE!" -StopOnError !STOP_ON_ERR! -UseDocker -DockerImage "!PSQL_DOCKER_IMAGE!"
  exit /b !errorlevel!
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%BATCH_DIR%run_remote_psql.ps1" -SqlFile "!SQL_FILE!" -HostName "!REMOTE_HOST!" -Port "!REMOTE_PORT!" -User "!REMOTE_USER!" -Database "!REMOTE_DB!" -PassFile "!REMOTE_PASS_FILE!" -SslMode "!REMOTE_SSLMODE!" -StopOnError !STOP_ON_ERR! -PsqlCmd "!PSQL_CMD!"
exit /b !errorlevel!

:run_psql_file_docker
call :log_err "Internal error: run_psql_file_docker should not be called directly."
exit /b 1

REM --- Logging helpers ---
:log_banner
echo(
echo( ============================================================
echo( %~1
echo( ============================================================
goto :eof

:log_step
echo(
echo( [STEP %~1] %~2 ...
goto :eof

:log_ok
echo( [OK] %~1
goto :eof

:log_err
echo( [ERROR] %~1
goto :eof

:log_warn
echo( [WARNING] %~1
goto :eof

:log_info
echo(          %~1
goto :eof

REM --- Step 2b: Renumber INSERT PKs to local 1..N (replaces legacy 600k MOSC patch) ---
:renumber_import_sql
call :log_step "2b" "Renumber INSERT ids and fix display_name mojibake"
if not exist "%ORDERED_FILE%" (
  call :log_err "ordered import file not found: %ORDERED_FILE%"
  exit /b 1
)
pushd "%SQLS_DIR%\sequence_fix_inserts"
node renumber_sql_insert_ids.cjs
set "REN_ERR=!errorlevel!"
if !REN_ERR! neq 0 (
  popd
  call :log_err "renumber_sql_insert_ids.cjs failed with exit code !REN_ERR!"
  exit /b 1
)
node fix_mojibake_display_names.cjs
set "MOJ_ERR=!errorlevel!"
popd
if !MOJ_ERR! neq 0 (
  call :log_err "fix_mojibake_display_names.cjs failed with exit code !MOJ_ERR!"
  exit /b 1
)
if not exist "%RENUMBERED_FILE%" (
  call :log_err "renumbered import file not created: %RENUMBERED_FILE%"
  exit /b 1
)
call :log_ok "Step 2b complete - renumbered import ready (no 600k user_profile IDs)"
call :log_info "File: %RENUMBERED_FILE%"
exit /b 0

:regen_mosc_sql
if not exist "%ORDERED_FILE%" (
  call :log_err "Source ordered file not found: %ORDERED_FILE%"
  exit /b 1
)
pushd "%MOSC_TEMP%"
python scripts\duplicate_tenant_sql.py "%ORDERED_FILE%" "%MOSC_FULL_FILE%"
set "REGEN_ERR=!errorlevel!"
if !REGEN_ERR! neq 0 (
  popd
  call :log_err "duplicate_tenant_sql.py failed with exit code !REGEN_ERR!"
  exit /b 1
)
node "%SQLS_DIR%\patch_mosc_malankara_import_block.cjs"
set "REGEN_ERR=!errorlevel!"
if !REGEN_ERR! neq 0 (
  popd
  call :log_err "patch_mosc_malankara_import_block.cjs failed with exit code !REGEN_ERR!"
  exit /b 1
)
python scripts\patch_mosc_shared_s3_urls.py "%MOSC_FULL_FILE%"
set "REGEN_ERR=!errorlevel!"
if !REGEN_ERR! neq 0 (
  popd
  call :log_err "patch_mosc_shared_s3_urls.py failed with exit code !REGEN_ERR!"
  exit /b 1
)
python scripts\patch_mosc_fk_remap.py "%MOSC_FULL_FILE%"
set "REGEN_ERR=!errorlevel!"
if !REGEN_ERR! neq 0 (
  popd
  call :log_err "patch_mosc_fk_remap.py failed with exit code !REGEN_ERR!"
  exit /b 1
)
python scripts\extract_dup_tenant_sql.py "%MOSC_FULL_FILE%" "%MOSC_DUP_FILE%"
set "REGEN_ERR=!errorlevel!"
popd
if !REGEN_ERR! neq 0 (
  call :log_err "extract_dup_tenant_sql.py failed with exit code !REGEN_ERR!"
  exit /b 1
)
if "%IMPORT_DUP_ONLY%"=="1" (
  set "IMPORT_FILE=%MOSC_DUP_FILE%"
) else if defined CUSTOM_IMPORT_FILE (
  set "IMPORT_FILE=!CUSTOM_IMPORT_FILE!"
)
call :log_ok "MOSC SQL regenerated: !MOSC_FULL_FILE! and !MOSC_DUP_FILE!"
exit /b 0
