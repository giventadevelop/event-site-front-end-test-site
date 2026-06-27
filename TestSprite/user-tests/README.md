# Regular User Comprehensive Test Suite

This directory contains Playwright-based tests for regular user functionality, including login, logout, profile management, and access to public pages.

## Overview

The comprehensive user test suite (`comprehensive-user-test-suite.js`) tests all regular user functionality as defined in `testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json`.

## Prerequisites

1. **Node.js** installed (v18 or higher)
2. **Playwright** installed:
   ```bash
   npm install playwright
   ```
3. **Next.js dev server** running at `http://localhost:3000` (or configure `TEST_BASE_URL`)
4. **User credentials** - A regular user account with appropriate permissions

## Setup

### 1. Install Dependencies

```bash
npm install playwright
```

### 2. Set Environment Variables

Set the following environment variables before running tests:

**PowerShell:**
```powershell
$env:TEST_USER_EMAIL="mosc.regular.user@keleno.com"
$env:TEST_USER_PASSWORD="mosctest1234"
$env:TEST_BASE_URL="http://localhost:3000"  # Optional, defaults to http://localhost:3000
```

**Bash/Linux:**
```bash
export TEST_USER_EMAIL="mosc.regular.user@keleno.com"
export TEST_USER_PASSWORD="mosctest1234"
export TEST_BASE_URL="http://localhost:3000"  # Optional
```

**Or create `.env.local` file:**
```env
TEST_USER_EMAIL=mosc.regular.user@keleno.com
TEST_USER_PASSWORD=mosctest1234
TEST_BASE_URL=http://localhost:3000
```

### 3. Ensure Dev Server is Running

```bash
npm run dev
```

## Running Tests

### Run All Tests (Command-Line Arguments - Single Line)

**PowerShell (Recommended - Easy Copy/Paste):**
```powershell
node TestSprite/user-tests/comprehensive-user-test-suite.js --user-email=mosc.regular.user@keleno.com --user-password=mosctest1234
```

**Bash/Linux:**
```bash
node TestSprite/user-tests/comprehensive-user-test-suite.js --user-email=mosc.regular.user@keleno.com --user-password=mosctest1234
```

### Run All Tests (Multi-Line - For Readability)

**PowerShell (with backtick for line continuation):**
```powershell
node TestSprite/user-tests/comprehensive-user-test-suite.js `
  --user-email=mosc.regular.user@keleno.com `
  --user-password=mosctest1234
```

**Bash/Linux (with backslash for line continuation):**
```bash
node TestSprite/user-tests/comprehensive-user-test-suite.js \
  --user-email=mosc.regular.user@keleno.com \
  --user-password=mosctest1234
```

### Run All Tests (Environment Variables)

**PowerShell:**
```powershell
$env:TEST_USER_EMAIL="mosc.regular.user@keleno.com"
$env:TEST_USER_PASSWORD="mosctest1234"
node TestSprite/user-tests/comprehensive-user-test-suite.js
```

**Bash/Linux:**
```bash
export TEST_USER_EMAIL="mosc.regular.user@keleno.com"
export TEST_USER_PASSWORD="mosctest1234"
node TestSprite/user-tests/comprehensive-user-test-suite.js
```

### Run with Custom Base URL

**Command-line:**
```bash
node TestSprite/user-tests/comprehensive-user-test-suite.js \
  --user-email=user@example.com \
  --user-password=password123 \
  --base-url=http://localhost:3001
```

**Environment variable:**
```bash
$env:TEST_BASE_URL="http://localhost:3001"
node TestSprite/user-tests/comprehensive-user-test-suite.js --user-email=... --user-password=...
```

### Run in Headed Mode (See Browser)

```bash
$env:HEADLESS="false"
node TestSprite/user-tests/comprehensive-user-test-suite.js --user-email=... --user-password=...
```

### Show Help

```bash
node TestSprite/user-tests/comprehensive-user-test-suite.js --help
```

## Test Cases

The suite includes **20 comprehensive test cases**:

### Authentication Tests
- **USER-001**: User Login and Authentication (Critical)
- **USER-019**: Re-Login After Logout (High)
- **USER-017**: User Sign Out (Critical)

### Profile Management Tests
- **USER-003**: Profile Page Access (Critical)
- **USER-004**: Profile Edit - Personal Information (High)
- **USER-005**: Profile Edit - Address Information (Medium)
- **USER-006**: Profile Save - Save Changes (Critical)
- **USER-020**: Profile Page - Email Subscription Toggle (Low)

### Public Page Access Tests
- **USER-002**: Homepage Access After Login (High)
- **USER-007**: Events Listing Page Access (High)
- **USER-008**: Event Details Page Access (High)
- **USER-009**: Gallery Page Access (Medium)
- **USER-010**: Gallery Search and Filter (Medium)
- **USER-011**: About Page Access (Medium)
- **USER-012**: Contact Page Access (Medium)
- **USER-013**: Polls Page Access (Medium)
- **USER-014**: Calendar Page Access (Medium)
- **USER-015**: Pricing Page Access (Medium)

### Navigation Tests
- **USER-016**: Navigation - Profile Link from Features Menu (High)
- **USER-018**: Post-Logout Public Page Access (Medium)

## Test Results

### Console Output

The test suite provides real-time console output showing:
- Test execution progress
- Pass/fail status for each test
- Error messages for failed tests
- Screenshot paths for failures
- Final summary statistics

### HTML Report

After test execution, an HTML report is generated at:
```
TestSprite/user-tests/user-test-report.html
```

The report includes:
- Summary statistics (total, passed, failed)
- Detailed test results table
- Error messages for failed tests
- Links to failure screenshots
- Test duration and timing information

### Screenshots

Screenshots are automatically captured for failed tests and saved to:
```
TestSprite/user-tests/screenshots/
```

Screenshot naming format: `failure-{TEST_ID}-{TIMESTAMP}.png`

## Troubleshooting

### Authentication Fails

**Problem**: Tests fail at USER-001 (login)

**Solutions**:
1. Verify credentials are correct:
   ```powershell
   echo $env:TEST_USER_EMAIL
   echo $env:TEST_USER_PASSWORD
   ```
2. Check that the user account exists and is active
3. Verify Clerk authentication is working in the browser
4. Check that `/sign-in` page loads correctly

### Tests Timeout

**Problem**: Tests timeout waiting for elements

**Solutions**:
1. Increase timeout in test configuration (edit `comprehensive-user-test-suite.js`)
2. Check that dev server is running and responsive
3. Verify network connectivity
4. Check browser console for JavaScript errors

### Screenshots Not Generated

**Problem**: No screenshots in `screenshots/` directory

**Solutions**:
1. Verify `screenshots/` directory exists (created automatically)
2. Check file permissions
3. Ensure `screenshotOnFailure` is set to `true` in config

### Page Elements Not Found

**Problem**: Tests fail with "element not found" errors

**Solutions**:
1. Verify page structure hasn't changed
2. Check that selectors match current DOM structure
3. Review failure screenshots to see actual page state
4. Update selectors in test file if needed

## Comparison with TestSprite MCP

This Playwright test suite is equivalent to running:
```bash
node scripts/run-user-pages-tests.js \
  --user-email=mosc.regular.user@keleno.com \
  --user-password=mosctest1234 \
  --test-plan=testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json
```

**Advantages of Playwright version**:
- ✅ Runs locally without cloud service
- ✅ Faster execution (no network latency)
- ✅ Full control over browser and environment
- ✅ Easy debugging with headed mode
- ✅ No dependency on TestSprite MCP service

**Advantages of TestSprite MCP version**:
- ✅ Cloud-based execution
- ✅ Video recordings of test runs
- ✅ Centralized test management
- ✅ No local setup required

## File Structure

```
TestSprite/user-tests/
├── comprehensive-user-test-suite.js  # Main test suite
├── README.md                          # This file
├── user-test-report.html              # Generated HTML report
├── .user-auth-state.json              # Cached auth state (if used)
└── screenshots/                       # Failure screenshots
    └── failure-*.png
```

## Configuration Options

Edit `comprehensive-user-test-suite.js` to customize:

- **Timeout**: Default 30 seconds per test
- **Headless mode**: Set `headless: false` to see browser
- **Screenshot on failure**: Enable/disable automatic screenshots
- **Base URL**: Override via `TEST_BASE_URL` environment variable

## Related Documentation

- **Test Plan**: `testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json`
- **Test Config**: `testsprite_tests/user_pages_comprehensive_test_config.json`
- **TestSprite MCP Script**: `scripts/run-user-pages-tests.js`
- **User Test Setup**: `testsprite_tests/USER_TEST_SETUP.md`

## Support

For issues or questions:
1. Check the HTML report for detailed error messages
2. Review failure screenshots
3. Check browser console logs in headed mode
4. Verify environment variables are set correctly
5. Ensure dev server is running and accessible

