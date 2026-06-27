# Comprehensive Admin Test Suite

This test suite provides **extensive automated testing** for all admin pages and sub-pages using Playwright.

## 🎯 Features

- ✅ **Complete Admin Coverage**: Tests all admin pages and sub-pages
- ✅ **Configurable Credentials**: Uses `auth.json` for secure credential management
- ✅ **Authentication State Persistence**: Saves auth state to avoid re-authentication
- ✅ **Screenshot Capture**: Automatically captures screenshots on test failures
- ✅ **HTML Reports**: Generates detailed HTML test reports
- ✅ **Dynamic Event Testing**: Automatically discovers and tests event-specific pages
- ✅ **Category Organization**: Tests organized by category (core, events, membership, etc.)

## 📋 Test Coverage

### Core Admin Pages (3 tests)
- Admin Dashboard
- Manage Users (Usage)
- Manage Events

### Event Management Pages (2 tests)
- Event Analytics Dashboard
- Event Registrations

### Dynamic Event Pages (9 tests per event)
- Event Overview
- Event Edit
- Event Media Management
- Event Sponsors
- Event Ticket Types
- Event Tickets
- Event Contacts
- Event Emails
- Event Program Directors

### Polls & Focus Groups (2 tests)
- Poll Management
- Focus Groups

### Membership Management (2 tests)
- Membership Plans
- Membership Subscriptions

### Email Management (3 tests)
- Email Addresses
- Bulk Email
- Newsletter Emails

### Media & Content (7 tests)
- Media Management
- Executive Committee
- Event Sponsors (Global)
- Global Performers
- Global Contacts
- Global Emails
- Global Program Directors

### Tenant Management (3 tests)
- Organizations
- Tenant Settings
- Test CRUD

### Utilities (1 test)
- Test Stripe

**Total: 23+ static tests + 9 dynamic tests per event (up to 2 events)**

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install --save-dev playwright
npm run test:install-playwright
```

### Step 2: Configure Credentials

1. Copy the example auth config:
   ```bash
   cp TestSprite/admin-tests/auth.json.example TestSprite/admin-tests/auth.json
   ```

2. Edit `TestSprite/admin-tests/auth.json` and fill in your admin credentials:
   ```json
   {
     "email": "your-admin-email@example.com",
     "password": "your-admin-password",
     "baseUrl": "http://localhost:3000",
     "timeout": 30000,
     "headless": true,
     "screenshotOnFailure": true
   }
   ```

   **Note**: Set `"headless": false` to see the browser during testing (useful for debugging). Default is `true` for faster execution.

### Step 3: Run Tests

```bash
npm run test:admin
```

Or directly:
```bash
node TestSprite/admin-tests/comprehensive-admin-test-suite.js
```

## 📁 File Structure

```
TestSprite/admin-tests/
├── auth.json.example          # Example auth configuration
├── auth.json                  # Your actual credentials (not in git)
├── .auth-state.json          # Saved authentication state (not in git)
├── comprehensive-admin-test-suite.js  # Main test script
├── screenshots/               # Screenshots of failed tests
├── admin-test-report.html     # Generated test report
└── README.md                  # This file
```

## ⚙️ Configuration Options

### `auth.json` Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `email` | Admin user email (required) | - |
| `password` | Admin user password (required) | - |
| `baseUrl` | Base URL of the application | `http://localhost:3000` |
| `timeout` | Page load timeout in ms | `30000` |
| `headless` | Run browser in headless mode | `true` |
| `screenshotOnFailure` | Capture screenshots on failures | `true` |

## 🔐 Authentication

The test suite uses Clerk authentication (similar to `npm run test:public` but with authentication):

1. **First Run**: Authenticates using credentials from `auth.json`
2. **Subsequent Runs**: Uses saved authentication state from `.auth-state.json`
3. **Re-authentication**: Delete `.auth-state.json` to force re-authentication

### Headless Mode

- **Default**: `headless: true` (runs without opening browser window)
- **Debugging**: Set `headless: false` in `auth.json` to see the browser during testing
- **Similar to Public Tests**: Uses the same Playwright setup as `npm run test:public`, but adds authentication

### Authentication State

- **Location**: `TestSprite/admin-tests/.auth-state.json`
- **Purpose**: Stores cookies and session data for reuse
- **Security**: Contains sensitive session tokens - **DO NOT commit to git**

## 📊 Test Reports

After running tests, an HTML report is generated at:
- `TestSprite/admin-tests/admin-test-report.html`

The report includes:
- Test summary statistics
- Detailed results for each test
- Screenshots of failed tests
- Test duration and error messages
- Category-based organization

## 🐛 Troubleshooting

### Authentication Fails

1. **Check credentials**: Verify `auth.json` has correct email and password
2. **Check user role**: Ensure the user has `ADMIN` role in the database
3. **Delete auth state**: Remove `.auth-state.json` and re-authenticate
4. **Check base URL**: Verify `baseUrl` in `auth.json` matches your dev server
5. **Check authentication method**: Ensure the user account uses email/password (not OAuth/social login)

### Tests Fail with 401 Errors

- Ensure the user is logged in and has admin access
- Check that `user_role = 'ADMIN'` in the `user_profile` table
- Verify `NEXT_PUBLIC_TENANT_ID` matches the tenant with admin role

### Tests Fail with 404 Errors

- Some pages may not exist yet (e.g., `/admin/test-stripe`)
- These will be marked as failed but won't break the test suite
- Check the HTML report for specific error details

### Screenshots Not Captured

- Ensure `screenshotOnFailure: true` in `auth.json`
- Check that `TestSprite/admin-tests/screenshots/` directory exists
- Verify write permissions for the screenshots directory

### Dynamic Event Pages Not Tested

- The test suite automatically discovers events from `/admin/manage-events`
- If no events are found, dynamic event page tests are skipped
- Create at least one event to test event-specific pages

## 📝 Adding New Tests

To add a new admin page test, add an entry to `adminTestPages` array in `comprehensive-admin-test-suite.js`:

```javascript
{
  id: 'admin-XXX',
  name: 'New Admin Page',
  url: '/admin/new-page',
  category: 'category-name',
  priority: 'high|medium|low',
  expectedElements: ['h1', 'table', 'button'],
  validation: ['Page loads', 'Content visible']
}
```

## 🔒 Security Notes

### ⚠️ Important:

1. **Never commit `auth.json`** to git (contains passwords)
2. **Never commit `.auth-state.json`** to git (contains session tokens)
3. **Use test accounts only** (not production accounts)
4. **Rotate test passwords** regularly

### Gitignore

Make sure these are in `.gitignore`:

```
TestSprite/admin-tests/auth.json
TestSprite/admin-tests/.auth-state.json
TestSprite/admin-tests/screenshots/
```

## 📈 Test Execution Flow

```
1. Load auth.json configuration
2. Launch Playwright browser
3. Load or create authentication state
4. Run static admin page tests (23 tests)
5. Discover available events
6. Run dynamic event page tests (9 tests × events)
7. Generate HTML report
8. Print summary statistics
```

## 🎯 Best Practices

1. **Run tests regularly**: Catch regressions early
2. **Review failed tests**: Check screenshots and error messages
3. **Update tests**: Add new tests when new admin pages are created
4. **Keep credentials secure**: Never share `auth.json` or commit it
5. **Monitor test duration**: Long-running tests may indicate performance issues

## 📚 Related Documentation

- [TestSprite Integration Guide](../sanity-tests/README-TESTSPRITE-INTEGRATION.md)
- [Authentication Setup](../sanity-tests/AUTHENTICATION-SETUP.md)
- [Public Pages Tests](../sanity-tests/README-PUBLIC-PAGES-TESTS.md)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the HTML test report for detailed error messages
3. Check browser console logs in non-headless mode
4. Verify admin user has correct role in database


