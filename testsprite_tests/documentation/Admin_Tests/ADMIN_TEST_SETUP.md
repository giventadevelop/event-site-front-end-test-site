# Admin Pages Test Setup Guide

## Overview

This guide explains how to set up and run TestSprite tests for admin pages. Admin pages require authentication with an admin user account.

## Prerequisites

1. **Admin User Account**: You need an admin user account with ADMIN role in the database
2. **Admin Credentials**: Email and password for the admin account
3. **Next.js Dev Server**: Must be running at `http://localhost:3000` (or custom port)
4. **TestSprite MCP**: Must be installed and configured

## Admin User Requirements

The admin user must have:
- ✅ Valid Clerk account (can sign in via `/sign-in`)
- ✅ User profile in database with `user_role = 'ADMIN'`
- ✅ Profile must match the tenant ID (`NEXT_PUBLIC_TENANT_ID`)

### How to Create/Verify Admin User

1. **Sign up** at `http://localhost:3000/sign-up` (or use existing account)
2. **Assign ADMIN role** via:
   - Admin dashboard: `/admin/manage-usage` → Edit user → Change Role to `ADMIN`
   - Direct database: `UPDATE user_profile SET user_role = 'ADMIN' WHERE user_id = '...' AND tenant_id = '...'`
3. **Verify** by logging in and checking if `/admin` page is accessible

## Providing Admin Credentials

### Method 1: Environment Variables (Recommended)

**Windows PowerShell:**
```powershell
$env:TEST_ADMIN_EMAIL="admin@example.com"
$env:TEST_ADMIN_PASSWORD="password123"
node scripts/run-admin-pages-tests.js
```

**Windows CMD:**
```cmd
set TEST_ADMIN_EMAIL=admin@example.com
set TEST_ADMIN_PASSWORD=password123
node scripts/run-admin-pages-tests.js
```

**Linux/Mac:**
```bash
export TEST_ADMIN_EMAIL="admin@example.com"
export TEST_ADMIN_PASSWORD="password123"
node scripts/run-admin-pages-tests.js
```

### Method 2: Command-Line Arguments

```bash
node scripts/run-admin-pages-tests.js --admin-email=admin@example.com --admin-password=password123
```

### Method 3: .env.local File (Not Recommended)

**⚠️ Security Warning**: Storing credentials in `.env.local` is not recommended for security reasons. Use environment variables or command-line arguments instead.

If you must use `.env.local`:
```bash
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=password123
```

Then run:
```bash
node scripts/run-admin-pages-tests.js
```

## Running Admin Tests

### Basic Usage - Sanity Tests

```bash
# With environment variables (recommended)
$env:TEST_ADMIN_EMAIL="admin@example.com"
$env:TEST_ADMIN_PASSWORD="password123"
node scripts/run-admin-pages-tests.js
```

This runs the sanity test plan by default (17 tests, ~5-10 minutes).

### Running Comprehensive Tests

```bash
# Run comprehensive test plan (28 tests, ~15-30 minutes)
$env:TEST_ADMIN_EMAIL="admin@example.com"
$env:TEST_ADMIN_PASSWORD="password123"
node scripts/run-admin-pages-tests.js --test-plan=testsprite_tests/admin_pages_comprehensive_test_plan.json
```

### Custom Test Plan

```bash
# Run sanity tests explicitly
node scripts/run-admin-pages-tests.js --test-plan=testsprite_tests/admin_pages_sanity_test_plan.json

# Run comprehensive tests
node scripts/run-admin-pages-tests.js --test-plan=testsprite_tests/admin_pages_comprehensive_test_plan.json
```

### Custom Base URL

```bash
node scripts/run-admin-pages-tests.js --base-url=http://localhost:3001
```

### View Help

```bash
node scripts/run-admin-pages-tests.js --help
```

## Test Plan Structure

### Sanity Test Plan (17 tests)

The admin pages sanity test plan includes basic page load verification:

1. **ADMIN-001**: Login and Authentication (Critical)
   - Navigates to `/sign-in`
   - Fills in admin credentials
   - Verifies successful login
   - Verifies admin dashboard access

2. **ADMIN-002 through ADMIN-017**: Page Load Tests
   - Admin Home (`/admin`)
   - Manage Users (`/admin/manage-usage`)
   - Manage Events (`/admin/manage-events`)
   - Event Analytics (`/admin/events/dashboard`)
   - Event Registrations (`/admin/events/registrations`)
   - Poll Management (`/admin/polls`)
   - Focus Groups (`/admin/focus-groups`)
   - Membership Plans (`/admin/membership/plans`)
   - Membership Subscriptions (`/admin/membership/subscriptions`)
   - Bulk Email (`/admin/bulk-email`)
   - Test Stripe (`/admin/test-stripe`)
   - Media Management (`/admin/media`)
   - Executive Committee (`/admin/executive-committee`)
   - Event Sponsors (`/admin/event-sponsors`)
   - Tenant Organizations (`/admin/tenant-management/organizations`)
   - Tenant Settings (`/admin/tenant-management/settings`)

### Comprehensive Test Plan (28 tests)

The comprehensive test plan includes functional tests beyond page loads:

1. **ADMIN-001**: Login and Authentication (Critical)
   - Same as sanity test

2. **ADMIN-002**: Admin Home Page Navigation (Critical)
   - Verifies navigation buttons work correctly
   - Tests clicking on "Manage Users" and "Manage Events" buttons
   - Verifies correct page navigation

3. **ADMIN-003**: Manage Users - List and Display (High)
   - Verifies user list table displays correctly
   - Verifies table headers and columns
   - Verifies pagination controls

4. **ADMIN-004**: Manage Users - Search and Filter (High)
   - Verifies search input field is visible
   - Tests search functionality
   - Verifies filter options

5. **ADMIN-005**: Manage Users - Edit User Role (High)
   - Clicks Edit button for a user
   - Verifies edit modal opens
   - Verifies form fields are visible
   - Closes modal without saving

6. **ADMIN-006**: Manage Events - List and Display (High)
   - Verifies events list displays correctly
   - Verifies event cards/rows show proper information
   - Verifies pagination controls

7. **ADMIN-007**: Manage Events - Future/Past Toggle (Medium)
   - Verifies toggle switch is visible
   - Tests switching between Future and Past events
   - Verifies events list updates

8. **ADMIN-008**: Manage Events - Navigate to Event Details (High)
   - Clicks on an event card
   - Verifies navigation to event details page
   - Verifies event information displays

9. **ADMIN-009**: Event Details - Navigation Buttons (Medium)
   - Verifies navigation button group is visible
   - Tests clicking "Tickets" button
   - Tests clicking "Media" button
   - Verifies correct page navigation

10. **ADMIN-010**: Event Tickets List - Display and Pagination (Medium)
    - Verifies tickets list displays correctly
    - Verifies ticket information columns
    - Tests pagination controls

11. **ADMIN-011**: Event Media List - Display and Actions (Medium)
    - Verifies media grid displays correctly
    - Verifies Edit and Delete buttons are visible
    - Tests clicking Edit button
    - Verifies edit modal opens

12. **ADMIN-012**: Media Management - Grid Display (Medium)
    - Verifies media grid with gradient background
    - Verifies media cards display correctly
    - Verifies pagination controls

13. **ADMIN-013**: Media Management - Edit Media Modal (Medium)
    - Clicks Edit button for media item
    - Verifies edit modal opens
    - Verifies form fields are visible
    - Closes modal without saving

14. **ADMIN-014**: Poll Management - List and Create (Medium)
    - Verifies polls list displays correctly
    - Clicks "Create Poll" button
    - Verifies create modal opens
    - Verifies form fields are visible

15. **ADMIN-015**: Membership Plans - List Display (Medium)
    - Verifies membership plans list displays correctly
    - Verifies plan information columns
    - Verifies create button is visible

16. **ADMIN-016**: Membership Subscriptions - List and Filter (Medium)
    - Verifies subscriptions list displays correctly
    - Verifies subscription information columns
    - Verifies filter options

17. **ADMIN-017**: Executive Committee - List and Actions (Medium)
    - Verifies team members list displays correctly
    - Verifies member information
    - Verifies action buttons are visible

18. **ADMIN-018**: Executive Committee - Create Member Modal (Medium)
    - Clicks "Add Member" button
    - Verifies create modal opens
    - Verifies form fields are visible
    - Closes modal without saving

19. **ADMIN-019**: Event Sponsors - List and Create (Medium)
    - Verifies sponsors list displays correctly
    - Clicks "Add Sponsor" button
    - Verifies create modal opens
    - Verifies form fields are visible

20. **ADMIN-020**: Tenant Organizations - List Display (Medium)
    - Verifies organizations list displays correctly
    - Verifies organization information columns
    - Verifies action buttons

21. **ADMIN-021**: Tenant Settings - List and View (Medium)
    - Verifies settings list displays correctly
    - Clicks "View" button for a setting
    - Verifies view details page/modal opens

22. **ADMIN-022**: Bulk Email - Page Load and Interface (Low)
    - Verifies bulk email page loads
    - Verifies email interface is visible

23. **ADMIN-023**: Test Stripe - Page Load (Low)
    - Verifies test Stripe page loads
    - Verifies payment testing interface is visible

24. **ADMIN-024**: Event Analytics Dashboard - Display (Medium)
    - Verifies analytics dashboard loads
    - Verifies charts/statistics are displayed
    - Verifies filters are visible

25. **ADMIN-025**: Event Registrations - List and Details (Medium)
    - Verifies registrations list displays correctly
    - Verifies registration information columns
    - Verifies filter options and pagination

26. **ADMIN-026**: Global Contacts - List and Create (Medium)
    - Verifies contacts list displays correctly
    - Clicks "Add Contact" button
    - Verifies create modal opens
    - Verifies form fields are visible

27. **ADMIN-027**: Global Performers - List Display (Medium)
    - Verifies performers list displays correctly
    - Verifies performer information
    - Verifies action buttons

28. **ADMIN-028**: Admin Navigation - All Pages Accessible (High)
    - Tests all navigation buttons from admin home
    - Verifies each page loads correctly
    - Verifies appropriate content displays

## Test Execution Flow

### Sanity Tests Flow

1. **Authentication** (ADMIN-001):
   - Navigate to `/sign-in`
   - Fill in email and password
   - Submit form
   - Verify redirect to admin dashboard
   - Session is maintained for subsequent tests

2. **Page Load Tests** (ADMIN-002 through ADMIN-017):
   - Navigate to each admin page
   - Verify page loads without errors
   - Verify main components are visible
   - No complex interactions (just sanity checks)

### Comprehensive Tests Flow

1. **Authentication** (ADMIN-001):
   - Same as sanity tests

2. **Navigation Tests** (ADMIN-002, ADMIN-008, ADMIN-009, ADMIN-028):
   - Test navigation between admin pages
   - Verify buttons lead to correct pages
   - Verify page transitions work correctly

3. **List Display Tests** (ADMIN-003, ADMIN-006, ADMIN-010, ADMIN-012, etc.):
   - Verify data lists/tables display correctly
   - Verify columns and headers are visible
   - Verify pagination controls work

4. **Form Interaction Tests** (ADMIN-005, ADMIN-013, ADMIN-014, ADMIN-018, ADMIN-019, ADMIN-026):
   - Click Create/Edit buttons
   - Verify modals open correctly
   - Verify form fields are visible
   - Close modals without saving (no data modification)

5. **Filter and Search Tests** (ADMIN-004, ADMIN-007, ADMIN-016):
   - Verify search input fields are visible
   - Test toggle switches (Future/Past events)
   - Verify filter options work

6. **Pagination Tests** (ADMIN-010, ADMIN-012):
   - Verify pagination controls are visible
   - Test clicking Next/Previous buttons
   - Verify page updates correctly

## Expected Results

### Success Criteria

- ✅ All pages load without HTTP errors (200 status)
- ✅ No console errors (except expected Next.js 15 warnings)
- ✅ Main components are visible
- ✅ Navigation menu is present
- ✅ Page titles/headers are correct

### Common Issues

1. **Authentication Fails**:
   - Check admin credentials are correct
   - Verify admin user has ADMIN role in database
   - Check tenant ID matches `NEXT_PUBLIC_TENANT_ID`
   - Verify Clerk account is active

2. **Page Access Denied**:
   - Verify admin user has ADMIN role (not just APPROVED status)
   - Check `user_profile.user_role = 'ADMIN'` in database
   - Verify tenant ID matches

3. **Server Not Running**:
   - Start Next.js dev server: `npm run dev`
   - Verify server is accessible at base URL
   - Check for port conflicts

4. **Test Execution Errors**:
   - Check TestSprite MCP is installed
   - Verify test plan file is valid JSON
   - Check lock file: `testsprite_tests/tmp/execution.lock` (delete if stuck)

## Filtering Test Results

After running tests, filter expected errors:

```bash
node scripts/filter-testsprite-errors.js
```

This filters out:
- Next.js 15 `headers()` warnings
- React hydration warnings
- Image aspect ratio warnings
- Network timing errors
- MobileDebugConsole warnings

## Viewing Test Reports

```bash
# View filtered HTML report
start testsprite_tests\tmp\test_report.html

# Generate unfiltered report (for debugging)
node scripts/generate-testsprite-html-report-unfiltered.js
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** instead of hardcoding credentials
3. **Use test-specific admin account** (not production admin)
4. **Rotate test credentials** periodically
5. **Don't share credentials** in chat or documentation

## Troubleshooting

### "Admin credentials are required" Error

**Solution**: Provide credentials via environment variables or command-line arguments:
```bash
$env:TEST_ADMIN_EMAIL="admin@example.com"
$env:TEST_ADMIN_PASSWORD="password123"
node scripts/run-admin-pages-tests.js
```

### "Cannot connect to server" Error

**Solution**:
1. Start Next.js dev server: `npm run dev`
2. Verify server is running: Open `http://localhost:3000` in browser
3. Check base URL matches server port

### "Authentication failed" Error

**Solution**:
1. Verify admin credentials are correct
2. Check admin user has ADMIN role in database
3. Verify tenant ID matches `NEXT_PUBLIC_TENANT_ID`
4. Test login manually in browser first

### "Page access denied" Error

**Solution**:
1. Verify `user_profile.user_role = 'ADMIN'` in database
2. Check tenant ID matches
3. Verify user profile exists for the tenant
4. Log out and log back in after role change

## Related Files

### Sanity Tests
- Test Plan: `testsprite_tests/admin_pages_sanity_test_plan.json`
- Test Config: `testsprite_tests/admin_pages_test_config.json`
- Test Script: `scripts/run-admin-pages-tests.js`
- Filter Script: `scripts/filter-testsprite-errors.js`

### Comprehensive Tests
- Test Plan: `testsprite_tests/admin_pages_comprehensive_test_plan.json`
- Test Config: `testsprite_tests/admin_pages_comprehensive_test_config.json`
- Test Script: `scripts/run-admin-pages-tests.js` (same script, different test plan)
- Filter Script: `scripts/filter-testsprite-errors.js`

## Test Plan Comparison

| Feature | Sanity Tests | Comprehensive Tests |
|---------|-------------|-------------------|
| **Number of Tests** | 17 tests | 28 tests |
| **Execution Time** | ~5-10 minutes | ~15-30 minutes |
| **Test Types** | Page loads only | Page loads + Navigation + Forms + Modals + Pagination + Search |
| **Interactions** | None (read-only) | Button clicks, modal opens, form verification |
| **Data Modification** | None | None (modals open but don't submit) |
| **Use Case** | Quick verification that pages are accessible | Full functional testing of admin interface |

## Next Steps

After sanity tests pass:
1. ✅ Run comprehensive test plan to verify all functionality
2. Add tests for form submissions (with test data)
3. Add tests for data modifications (create/edit/delete operations)
4. Add tests for complex workflows (multi-step processes)
5. Add tests for error handling and edge cases

