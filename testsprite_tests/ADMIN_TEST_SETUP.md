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

### Basic Usage

```bash
# With environment variables (recommended)
$env:TEST_ADMIN_EMAIL="admin@example.com"
$env:TEST_ADMIN_PASSWORD="password123"
node scripts/run-admin-pages-tests.js
```

### Custom Test Plan

```bash
node scripts/run-admin-pages-tests.js --test-plan=testsprite_tests/admin_pages_sanity_test_plan.json
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

The admin pages sanity test plan includes:

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

## Test Execution Flow

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

- Test Plan: `testsprite_tests/admin_pages_sanity_test_plan.json`
- Test Config: `testsprite_tests/admin_pages_test_config.json`
- Test Script: `scripts/run-admin-pages-tests.js`
- Filter Script: `scripts/filter-testsprite-errors.js`

## Next Steps

After sanity tests pass:
1. Create comprehensive test plan with functional tests
2. Add tests for form submissions
3. Add tests for data modifications
4. Add tests for complex workflows

