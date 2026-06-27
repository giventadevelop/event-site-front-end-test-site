# Comprehensive Sanity Test Suite
## Malayalees US Site Event Registration Platform

This comprehensive sanity test suite covers **all major features and pages** of the Malayalees US Site application, providing a complete health check of the entire platform.

## 📋 Test Coverage

### **Public Pages (10 tests)**
- ✅ Homepage (`/`)
- ✅ Events listing (`/events`)
- ✅ Event details (`/events/[id]`)
- ✅ Sponsors listing (`/sponsors`)
- ✅ Sponsor details (`/sponsors/[id]`)
- ✅ Gallery (`/gallery`)
- ✅ Polls listing (`/polls`)
- ✅ Calendar (`/calendar`)
- ✅ MOSC homepage (`/mosc`)
- ✅ Charity theme (`/charity-theme`)

### **Admin Pages (16 tests)**
- ✅ Admin dashboard (`/admin`)
- ✅ Events management hub (`/admin/events`)
- ✅ Event overview (`/admin/events/[id]`)
- ✅ Event media management (`/admin/events/[id]/media`)
- ✅ Event sponsors management (`/admin/events/[id]/sponsors`)
- ✅ Event contacts management (`/admin/event-contacts`)
- ✅ Event emails management (`/admin/event-emails`)
- ✅ Event performers management (`/admin/event-featured-performers`)
- ✅ Event program directors (`/admin/event-program-directors`)
- ✅ Event registrations (`/admin/events/registrations`)
- ✅ Executive committee (`/admin/executive-committee`)
- ✅ Focus groups (`/admin/focus-groups`)
- ✅ Polls management (`/admin/polls`)
- ✅ Tenant management (`/admin/tenant-management`)
- ✅ WhatsApp settings (`/admin/whatsapp-settings`)
- ✅ QR code scanner (`/admin/qrcode-scan/tickets`)

### **User Pages (3 tests)**
- ✅ User profile (`/profile`)
- ✅ User dashboard (`/dashboard`)
- ✅ User settings (`/settings`)

### **Authentication (2 tests)**
- ✅ Sign in page (`/sign-in`)
- ✅ Sign up page (`/sign-up`)

### **Legal & Utility Pages (3 tests)**
- ✅ Privacy policy (`/privacy`)
- ✅ Terms of service (`/terms`)
- ✅ Pricing page (`/pricing`)

**Total: 34 comprehensive tests**

## 🚀 Quick Start

### **Prerequisites**
1. **Node.js 18+** installed
2. **Frontend running** on `http://localhost:3000` (or set `TEST_BASE_URL` env variable)
3. **Backend API running** (for admin/user pages)
4. **Admin authentication** set up with Clerk (for admin tests)

### **Run Comprehensive Tests**

```bash
# Navigate to test directory
cd TestSprite/sanity-tests

# Run comprehensive sanity tests
node run-comprehensive-sanity-tests.js

# Or with custom base URL
TEST_BASE_URL=http://localhost:3001 node run-comprehensive-sanity-tests.js
```

### **Using TestSprite MCP Server** (if available)

```bash
# If TestSprite MCP server is configured
testsprite run --config testsprite-mcp-config.json --comprehensive
```

## 📊 Test Execution

### **Test Duration**
- **Expected Duration**: 10-15 minutes
- **Per Test Timeout**: 15 seconds
- **Retries**: 1 attempt per failed test

### **Test Categories**
Tests are organized by category:
- **public-pages**: Public-facing pages (no auth required)
- **admin-pages**: Admin management pages (requires admin auth)
- **user-pages**: User profile and settings (requires user auth)
- **authentication**: Sign in/sign up pages
- **legal-pages**: Privacy, terms, etc.

### **Test Priority Levels**
- **critical**: Must pass for core functionality
- **high**: Important features
- **medium**: Secondary features
- **low**: Nice-to-have features

## 📈 Test Results

### **Console Output**
The test runner provides:
- Real-time test execution status
- Category-wise progress tracking
- Detailed error messages for failures
- Summary statistics by category

### **HTML Report**
After execution, a comprehensive HTML report is generated:
- **Location**: `TestSprite/sanity-tests/comprehensive-test-report.html`
- **Features**:
  - Overall summary with pass/fail rates
  - Category breakdown
  - Detailed test results with expected elements
  - Error details for failed tests
  - Test duration metrics

### **Report Sections**
1. **Summary Dashboard**: Total tests, passed, failed, skipped, success rate
2. **Category Breakdown**: Results organized by test category
3. **Detailed Results**: Each test with:
   - Status (✅ passed, ❌ failed, ⏭️ skipped)
   - Priority level
   - Expected elements
   - Validation criteria
   - Error messages (if failed)

## 🔧 Configuration

### **Environment Variables**
```bash
# Set custom base URL
export TEST_BASE_URL=http://localhost:3001

# Run tests
node run-comprehensive-sanity-tests.js
```

### **Test Configuration**
Edit `run-comprehensive-sanity-tests.js` to customize:
- `baseUrl`: Application base URL
- `timeout`: Per-test timeout (default: 15000ms)
- `retries`: Number of retries for failed tests
- `screenshotOnFailure`: Enable screenshot capture
- `performanceTiming`: Enable performance metrics

### **Skipping Tests**
Tests can be conditionally skipped by adding `skipIf` property:
```javascript
{
  id: 'sanity-003',
  name: 'Event Details Page Test',
  url: '/events/1',
  skipIf: 'No events available'
}
```

## 🧪 Test Structure

Each test includes:
- **ID**: Unique test identifier (e.g., `sanity-001`)
- **Name**: Descriptive test name
- **URL**: Page URL to test
- **Category**: Test category for organization
- **Priority**: Test priority level
- **Expected Elements**: CSS selectors for elements that must be present
- **Validation**: List of validation criteria
- **Requires Auth**: Whether authentication is required

## 📝 Example Test

```javascript
{
  id: 'sanity-012',
  name: 'Admin Events Management Hub Test',
  url: '/admin/events',
  category: 'admin-pages',
  priority: 'critical',
  requiresAuth: true,
  expectedElements: [
    'h1',
    '[class*="grid"], [class*="card"]',
    'a[href*="/admin/events/new"], button'
  ],
  validation: [
    'Events management hub loads',
    'Event cards or list displayed',
    'Create new event button visible',
    'Search/filter controls present'
  ]
}
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Tests failing due to authentication**
   - Ensure user is logged in before running admin/user tests
   - Check Clerk authentication configuration
   - Verify session cookies are valid

2. **Tests timing out**
   - Check if application is running on specified URL
   - Verify backend API is accessible
   - Increase timeout in configuration if needed

3. **Tests skipping unexpectedly**
   - Check `skipIf` conditions in test definitions
   - Ensure test data exists (e.g., events, sponsors)

4. **Missing elements**
   - Verify CSS selectors match current UI
   - Check if page structure has changed
   - Update selectors in test definitions

### **Debug Mode**
Enable detailed logging by modifying the test execution function to include:
- Network requests
- Console errors
- Element visibility checks
- Screenshot capture on failures

## 🎯 Best Practices

1. **Run tests regularly**: Execute before deployments and after major changes
2. **Review failures**: Investigate failed tests immediately
3. **Update selectors**: Keep CSS selectors in sync with UI changes
4. **Add new tests**: Include new pages/features in test suite
5. **Monitor trends**: Track success rates over time

## 📚 Related Documentation

- **Basic Sanity Tests**: See `run-sanity-tests.js` for quick 3-minute tests
- **Event-Specific Tests**: See `../events-related-tests/` for detailed event management tests
- **TestSprite MCP**: See `testsprite-mcp-config.json` for MCP server configuration

## 🔄 Integration with CI/CD

### **GitHub Actions Example**
```yaml
name: Comprehensive Sanity Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm start &
      - run: |
          sleep 10
          cd TestSprite/sanity-tests
          node run-comprehensive-sanity-tests.js
      - uses: actions/upload-artifact@v2
        if: always()
        with:
          name: test-report
          path: TestSprite/sanity-tests/comprehensive-test-report.html
```

## 📞 Support

For issues or questions:
1. Check test logs and HTML report
2. Review test configuration
3. Verify application is running correctly
4. Check TestSprite MCP server status (if using)

---

**Last Updated**: 2025-01-08
**Test Suite Version**: 1.0.0
**Total Tests**: 34


