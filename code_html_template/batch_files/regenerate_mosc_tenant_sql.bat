@echo off
setlocal EnableDelayedExpansion
REM Regenerate MOSC tenant SQL from corrected_event_media_inserts.ordered.sql
REM Usage: regenerate_mosc_tenant_sql.bat [WORKSPACE_ROOT]
REM Default WORKSPACE_ROOT = parent of mosc-temp (F:\project_workspace)

set "WORKSPACE_ROOT=%~1"
if "%WORKSPACE_ROOT%"=="" set "WORKSPACE_ROOT=F:\project_workspace"
set "MOSC_TEMP=%WORKSPACE_ROOT%\mosc-temp"
set "SQLS=%MOSC_TEMP%\code_html_template\SQLS"

if not exist "%MOSC_TEMP%" (
  echo [ERROR] mosc-temp not found: %MOSC_TEMP%
  exit /b 1
)

where python >nul 2>&1 || (echo [ERROR] python not on PATH & exit /b 1)
where node >nul 2>&1 || (echo [ERROR] node not on PATH & exit /b 1)

echo [1/3] duplicate_tenant_sql.py ...
pushd "%MOSC_TEMP%"
python scripts\duplicate_tenant_sql.py "%SQLS%\corrected_event_media_inserts.ordered.sql" "%SQLS%\corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql"
if errorlevel 1 goto :fail
echo [2/4] patch_mosc_malankara_import_block.cjs ...
node "%SQLS%\patch_mosc_malankara_import_block.cjs"
if errorlevel 1 goto :fail
echo [3/4] patch_mosc_shared_s3_urls.py ...
python scripts\patch_mosc_shared_s3_urls.py "%SQLS%\corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql"
if errorlevel 1 goto :fail
echo [4/4] patch_mosc_fk_remap.py ...
python scripts\patch_mosc_fk_remap.py "%SQLS%\corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql"
if errorlevel 1 goto :fail
echo [5/5] extract_dup_tenant_sql.py ...
python scripts\extract_dup_tenant_sql.py "%SQLS%\corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql" "%SQLS%\mosc_dup_only.sql"
if errorlevel 1 goto :fail
popd

echo [OK] Generated:
echo   %SQLS%\corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql
echo   %SQLS%\mosc_dup_only.sql
exit /b 0

:fail
popd
exit /b 1
