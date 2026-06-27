@echo off
REM ===================================================
REM Clerk Clock Skew Error Fix - Windows Batch File
REM ===================================================
REM This batch file fixes Clerk authentication clock skew errors
REM by synchronizing the Windows system clock with internet time servers.
REM
REM IMPORTANT: Run this batch file as Administrator
REM ===================================================

echo.
echo ===================================================
echo Clerk Clock Skew Error Fix
echo ===================================================
echo.
echo This script will fix Clerk authentication clock skew errors
echo by synchronizing your Windows system clock.
echo.
echo IMPORTANT: This script must be run as Administrator!
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running as Administrator - OK
) else (
    echo [ERROR] This script must be run as Administrator!
    echo Please right-click on this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo.
echo [STEP 1] Starting Windows Time Service synchronization...
echo.

REM Step 1: Force immediate time synchronization
echo [1/6] Forcing immediate time synchronization...
w32tm /resync
if %errorLevel% == 0 (
    echo [SUCCESS] Time synchronization completed
) else (
    echo [WARNING] Time synchronization may have failed
)

echo.
echo [2/6] Configuring manual peer list with Windows time servers...
w32tm /config /manualpeerlist:"time.windows.com,0x1" /syncfromflags:manual
if %errorLevel% == 0 (
    echo [SUCCESS] Manual peer list configured
) else (
    echo [ERROR] Failed to configure manual peer list
)

echo.
echo [3/6] Setting Windows Time Service as reliable...
w32tm /config /reliable:yes
if %errorLevel% == 0 (
    echo [SUCCESS] Windows Time Service set as reliable
) else (
    echo [ERROR] Failed to set Windows Time Service as reliable
)

echo.
echo [4/6] Stopping Windows Time Service...
net stop w32time
if %errorLevel% == 0 (
    echo [SUCCESS] Windows Time Service stopped
) else (
    echo [WARNING] Windows Time Service may not have been running
)

echo.
echo [5/6] Starting Windows Time Service...
net start w32time
if %errorLevel% == 0 (
    echo [SUCCESS] Windows Time Service started
) else (
    echo [ERROR] Failed to start Windows Time Service
)

echo.
echo [6/6] Performing final time synchronization...
w32tm /resync
if %errorLevel% == 0 (
    echo [SUCCESS] Final time synchronization completed
) else (
    echo [WARNING] Final time synchronization may have failed
)

echo.
echo ===================================================
echo Clock Skew Fix Complete
echo ===================================================
echo.
echo The following actions have been performed:
echo - Forced immediate time synchronization
echo - Configured Windows time servers as reliable sources
echo - Restarted Windows Time Service
echo - Performed final synchronization
echo.
echo Next steps:
echo 1. Restart your development server
echo 2. Clear browser cookies and cache
echo 3. Test Clerk authentication
echo.
echo If you still experience clock skew errors:
echo - Check that your system clock is accurate
echo - Verify internet connectivity
echo - Consider increasing clock skew tolerance in middleware
echo.

REM Display current system time for verification
echo Current system time:
echo %date% %time%
echo.

echo Press any key to exit...
pause >nul
