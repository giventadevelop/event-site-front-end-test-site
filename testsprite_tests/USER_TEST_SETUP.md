# User Pages Comprehensive Test Setup

## Overview

This document provides setup instructions, prerequisites, and execution guidelines for running comprehensive tests on regular user pages using TestSprite. These tests cover login, logout, profile editing, and access to all public pages.

## Prerequisites

### 1. Test User Account

You need a valid Clerk user account with regular user permissions (not admin). This account will be used for authentication during tests.

**Required Information:**
- User email address
- User password

**Note:** The user account must exist in your Clerk instance and be able to log in successfully.

### 2. Environment Variables

Set the following environment variables before running tests:

**PowerShell:**
```powershell
$env:TEST_USER_EMAIL="user@example.com"
$env:TEST_USER_PASSWORD="password123"
```

**Bash/Linux:**
```bash
export TEST_USER_EMAIL="user@example.com"
export TEST_USER_PASSWORD="password123"
```

**Windows CMD:**
```cmd
set TEST_USER_EMAIL=user@example.com
set TEST_USER_PASSWORD=password123
```

### 3. Next.js Development Server

Ensure your Next.js development server is running:

```bash
npm run dev
```

The server should be accessible at `http://localhost:3000` (or your configured port).

### 4. TestSprite MCP

TestSprite MCP should be installed and accessible. The script uses the default TestSprite MCP path.

## Test Plan Structure

### Comprehensive Test Plan (20 tests)

The user pages comprehensive test plan includes functional tests covering:

1. **USER-001**: Login and Authentication (Critical)
   - Navigates to `/sign-in`
   - Fills in user credentials
   - Verifies successful login
   - Verifies user menu/profile visible

2. **USER-002**: Homepage Access After Login (High)
   - Verifies homepage loads correctly for authenticated user
   - Verifies user profile avatar/menu is visible

3. **USER-003**: Profile Page Access (Critical)
   - Verifies user can access profile page (`/profile`)
   - Verifies profile form is visible
   - Verifies form fields are displayed

4. **USER-004**: Profile Edit - Personal Information (High)
   - Tests editing First Name, Last Name, Phone fields
   - Verifies form fields accept input

5. **USER-005**: Profile Edit - Address Information (Medium)
   - Tests editing address fields (Address Line 1, City, State, Zip Code)
   - Verifies address fields accept input

6. **USER-006**: Profile Save - Save Changes (Critical)
   - Makes a change to profile
   - Clicks Save button
   - Verifies success message appears
   - Verifies changes persist after page refresh

7. **USER-007**: Events Listing Page Access (High)
   - Verifies authenticated user can access events listing page
   - Verifies events grid/list container is present

8. **USER-008**: Event Details Page Access (High)
   - Clicks on an event card
   - Verifies event details page loads
   - Verifies event information is displayed

9. **USER-009**: Gallery Page Access (Medium)
   - Verifies authenticated user can access gallery page
   - Verifies gallery grid/container is present

10. **USER-010**: Gallery Search and Filter (Medium)
    - Tests search functionality
    - Tests clear/reset functionality
    - Verifies search results update

11. **USER-011**: About Page Access (Medium)
    - Tests navigation via About dropdown menu
    - Verifies about section content is visible

12. **USER-012**: Contact Page Access (Medium)
    - Tests navigation to contact section
    - Verifies contact form/information is visible

13. **USER-013**: Polls Page Access (Medium)
    - Verifies authenticated user can access polls page
    - Verifies polls list/container is present

14. **USER-014**: Calendar Page Access (Medium)
    - Verifies authenticated user can access calendar page
    - Verifies calendar component is present

15. **USER-015**: Pricing Page Access (Medium)
    - Verifies authenticated user can access pricing page
    - Verifies pricing plans/information is visible

16. **USER-016**: Navigation - Profile Link from Features Menu (High)
    - Tests navigation to profile page from Features dropdown
    - Verifies profile page loads correctly

17. **USER-017**: User Sign Out (Critical)
    - Clicks user profile avatar
    - Clicks Sign Out button
    - Verifies user is signed out
    - Verifies redirect to homepage or sign-in page

18. **USER-018**: Post-Logout Public Page Access (Medium)
    - Verifies public pages are accessible after logout
    - Verifies Sign In button is visible (not profile avatar)

19. **USER-019**: Re-Login After Logout (High)
    - Tests logging in again after signing out
    - Verifies successful re-login
    - Verifies profile page is accessible

20. **USER-020**: Profile Page - Email Subscription Toggle (Low)
    - Tests toggling email subscription checkbox
    - Verifies save operation completes successfully

## Running Tests

### Basic Usage

**With environment variables:**
```bash
node scripts/run-user-pages-tests.js
```

**With command-line credentials:**
```bash
node scripts/run-user-pages-tests.js --user-email=user@example.com --user-password=password123
```

**With custom test plan:**
```bash
node scripts/run-user-pages-tests.js --test-plan=testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json
```

**With custom base URL:**
```bash
node scripts/run-user-pages-tests.js --base-url=http://localhost:3001
```

### Command-Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--test-plan=<path>` | Path to test plan file | `testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json` |
| `--config=<path>` | Path to test config file (optional, for reference only) | None |
| `--base-url=<url>` | Base URL for testing | `http://localhost:3000` |
| `--user-email=<email>` | User email for authentication | From `TEST_USER_EMAIL` env var |
| `--user-password=<pwd>` | User password for authentication | From `TEST_USER_PASSWORD` env var |
| `--help`, `-h` | Show help message | - |

### Examples

**Example 1: Run with environment variables (recommended)**
```powershell
$env:TEST_USER_EMAIL="user@example.com"
$env:TEST_USER_PASSWORD="password123"
node scripts/run-user-pages-tests.js
```

**Example 2: Run with command-line credentials**
```bash
node scripts/run-user-pages-tests.js --user-email=user@example.com --user-password=password123 --test-plan=testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json
```

**Example 3: Run with custom base URL**
```bash
node scripts/run-user-pages-tests.js --base-url=http://localhost:3001 --user-email=user@example.com --user-password=password123
```

## Test Execution Flow

1. **Login (USER-001)**: User logs in with provided credentials
2. **Authenticated Tests (USER-002 to USER-016)**: Tests run assuming user is authenticated
3. **Logout (USER-017)**: User signs out
4. **Post-Logout Tests (USER-018)**: Tests verify public pages are accessible
5. **Re-Login (USER-019)**: User logs in again to verify re-authentication works
6. **Additional Tests (USER-020)**: Email subscription toggle test

## Test Results

After test execution, results are saved to:

- **JSON Results**: `testsprite_tests/tmp/test_results.json`
- **HTML Report**: `testsprite_tests/tmp/test_report.html`

### Viewing Results

**Filter expected errors:**
```bash
node scripts/filter-testsprite-errors.js
```

**View HTML report:**
```bash
start testsprite_tests\tmp\test_report.html
```

**Or open manually:**
Open `testsprite_tests/tmp/test_report.html` in your browser.

## Troubleshooting

### Common Issues

**1. Credentials Not Provided**
```
❌ Error: User credentials are required for user page tests
```
**Solution:** Set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` environment variables or provide via command-line arguments.

**2. Server Not Running**
```
❌ Cannot connect to server at http://localhost:3000
```
**Solution:** Start your Next.js development server with `npm run dev` and verify it's accessible in your browser.

**3. Invalid Credentials**
```
❌ Test execution failed
```
**Solution:** Verify your user credentials are correct and the user account exists in Clerk. Test login manually in the browser first.

**4. Lock File Error**
```
Error: Code generation and execution is already running
```
**Solution:** Delete the lock file: `testsprite_tests/tmp/execution.lock` or wait for the previous test run to complete.

**5. Test Plan Not Found**
```
❌ Error: Test plan file not found
```
**Solution:** Verify the test plan file path is correct. Default path is `testsprite_tests/regular_user_with_login_pages_comprehensive_test_plan.json`.

### Debugging Tips

1. **Verify Server Accessibility**: Open `http://localhost:3000` in your browser before running tests
2. **Test Login Manually**: Verify you can log in with the test credentials in the browser
3. **Check Test Plan**: Ensure the test plan JSON file is valid and contains all required test cases
4. **Review Console Logs**: Check browser console for any errors during test execution
5. **Check TestSprite Logs**: Review TestSprite output for detailed error messages

## Test Configuration

The test configuration file (`user_pages_comprehensive_test_config.json`) specifies:

- **Authentication Type**: Clerk
- **Login URL**: `/sign-in`
- **Included Paths**: `/`, `/events`, `/gallery`, `/polls`, `/calendar`, `/pricing`, `/profile`
- **Excluded Paths**: `/admin`, `/admin/*`, `/sign-up`
- **Timeout**: 30 seconds per test
- **Retries**: 1 retry on failure

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit credentials**: Do not commit `.env.local` files or hardcode credentials in scripts
2. **Use environment variables**: Prefer environment variables over command-line arguments for credentials
3. **Use test accounts**: Use dedicated test accounts, not production user accounts
4. **Rotate credentials**: Regularly rotate test account passwords
5. **Limit access**: Restrict access to test credentials to authorized personnel only

## Related Documentation

- **Admin Tests**: See `testsprite_tests/documentation/Admin_Tests/ADMIN_TEST_SETUP.md` for admin page tests
- **Public Pages Tests**: See `testsprite_tests/public_pages_comprehensive_test_plan.json` for public-only tests
- **TestSprite Setup**: See `testsprite_tests/HOW_TO_TRIGGER_TESTS_FROM_CURSOR_AI.md` for TestSprite usage

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test execution logs
3. Verify server and credentials are correct
4. Check TestSprite documentation

