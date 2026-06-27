@echo off
echo 🧪 TestSprite Admin Events Quick Test
echo =====================================
echo.

echo 🔍 Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

echo 📦 Installing dependencies...
call npm run install-deps
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

echo 🎭 Setting up Playwright...
call npm run setup
if errorlevel 1 (
    echo ❌ Failed to setup Playwright
    pause
    exit /b 1
)

echo ✅ Playwright setup complete
echo.

echo 🚀 Running admin events tests...
call npm test

echo.
echo 📊 Test execution complete!
echo 📄 Check admin-events-test-results.json for detailed results
echo.
pause
