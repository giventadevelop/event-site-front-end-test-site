# Comprehensive Test Suite with TestSprite MCP Integration

## 🚀 Overview

This comprehensive test suite provides **real browser testing** with:
- ✅ **TestSprite MCP Server Integration** - Uses TestSprite for browser automation when available
- ✅ **Playwright Fallback** - Automatically falls back to Playwright if TestSprite MCP is not available
- ✅ **Real DOM Element Checking** - Actually checks for elements in the browser
- ✅ **JavaScript Error Detection** - Captures console errors and page errors
- ✅ **Enhanced Validation** - Comprehensive validation checks for all pages
- ✅ **Screenshot Capture** - Automatically captures screenshots on failures
- ✅ **45+ Test Scenarios** - Covers all major pages and features

## 📋 Test Coverage

### **Public Pages (14 tests)**
- Homepage, Events listing, Event details
- Sponsors listing/details
- Gallery, Polls, Calendar
- MOSC homepage, Holy Synod, Gallery, Directory
- Charity theme, Pricing

### **Admin Pages (24 tests)**
- Admin dashboard, Events management hub
- Event overview, Edit, Media, Sponsors
- Ticket types, Tickets, Performers
- Contacts, Emails, Program directors
- Registrations, Membership plans/subscriptions
- Manage usage, Executive committee
- Focus groups, Polls, Tenant management
- Bulk email, Email addresses, QR scanner

### **User Pages (3 tests)**
- User profile, Dashboard, Settings

### **Authentication (2 tests)**
- Sign in, Sign up

### **Legal Pages (2 tests)**
- Privacy policy, Terms of service

**Total: 45 comprehensive tests**

## 🛠️ Setup

### 1. Install Dependencies

```bash
# Install Playwright (required for fallback)
npm install --save-dev playwright

# Install Playwright browsers
npm run test:install-playwright
# OR
npx playwright install chromium
```

### 2. Configure TestSprite MCP (Optional)

TestSprite MCP server is already configured in your `mcp.json`. After restarting Cursor, TestSprite MCP will be available.

If TestSprite MCP is not available, the script will automatically use Playwright.

### 3. Set Base URL (Optional)

```bash
# Default: http://localhost:3000
# Custom:
export TEST_BASE_URL=http://localhost:3001
```

## 🧪 Running Tests

### Basic Execution

```bash
# Using npm script
npm run test:comprehensive

# Direct execution
node TestSprite/sanity-tests/run-comprehensive-sanity-tests-with-testsprite.js

# With custom base URL
TEST_BASE_URL=http://localhost:3001 npm run test:comprehensive
```

### Test Execution Flow

1. **TestSprite MCP Check**: Script first tries to use TestSprite MCP server
2. **Playwright Fallback**: If TestSprite MCP is not available, automatically uses Playwright
3. **Real Browser Testing**: Opens actual browser (Chromium) and tests pages
4. **DOM Element Checking**: Verifies all expected elements exist and are visible
5. **Error Detection**: Captures JavaScript console errors and page errors
6. **Screenshot Capture**: Takes screenshots on test failures
7. **Report Generation**: Generates comprehensive HTML report

## 📊 What Gets Tested

### **For Each Page:**

1. **Page Load**
   - Page loads successfully (HTTP 200)
   - No network errors
   - Page title is correct

2. **DOM Element Checking**
   - All expected elements exist
   - Elements are visible (not hidden)
   - Element counts match expectations

3. **JavaScript Error Detection**
   - Console errors captured
   - Page errors captured
   - No unhandled exceptions

4. **Form Validation**
   - Form elements present
   - Input fields accessible
   - Submit buttons functional

5. **Interactive Elements**
   - Buttons clickable
   - Links functional
   - Navigation works

6. **Visual Validation**
   - Images load correctly
   - Layout is correct
   - No broken elements

## 🎯 Enhanced Validation Features

### **Element Checking**
- Checks for element existence
- Verifies element visibility
- Validates element counts (min/max)
- Supports CSS selectors and complex queries

### **Error Detection**
- JavaScript console errors
- Page-level errors
- Network errors
- Unhandled promise rejections

### **Interaction Testing**
- Wait for elements to appear
- Check element visibility
- Verify element counts
- Form field validation

### **Screenshot Capture**
- Automatic screenshots on failure
- Full-page screenshots
- Saved to `TestSprite/sanity-tests/screenshots/`

## 📈 Test Results

### **Console Output**
- Real-time test execution status
- Pass/fail indicators
- Error details
- Missing elements listed
- Warnings displayed

### **HTML Report**
- Comprehensive test summary
- Category-wise breakdown
- Detailed test results
- Screenshot links for failures
- Missing elements highlighted
- Error details included

**Report Location**: `TestSprite/sanity-tests/comprehensive-test-report.html`

## 🔧 Configuration

### **Test Configuration**

Edit `run-comprehensive-sanity-tests-with-testsprite.js`:

```javascript
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,              // 30 seconds per test
  retries: 1,                  // Retry failed tests once
  testDuration: '15-20 minutes',
  screenshotOnFailure: true,   // Capture screenshots on failures
  performanceTiming: true,      // Track performance metrics
  useTestSprite: true,         // Use TestSprite MCP if available
  usePlaywright: true          // Fallback to Playwright
};
```

### **Adding New Tests**

Add test scenarios to the `testScenarios` array:

```javascript
{
  id: 'sanity-XXX',
  name: 'Test Name',
  url: '/path/to/page',
  category: 'public-pages',
  priority: 'critical',
  expectedElements: [
    'h1',
    'nav',
    'main'
  ],
  validation: [
    'Page loads without errors',
    'Navigation works'
  ],
  interactions: [
    { type: 'wait', selector: 'main', timeout: 5000 },
    { type: 'check', selector: 'h1', visible: true }
  ],
  requiresAuth: false,  // Set to true for admin/user pages
  skipIf: 'Optional skip condition'
}
```

## 🐛 Troubleshooting

### **Playwright Not Installed**

```bash
npm install --save-dev playwright
npx playwright install chromium
```

### **TestSprite MCP Not Available**

The script will automatically fall back to Playwright. To verify TestSprite MCP:
1. Restart Cursor after configuring `mcp.json`
2. Check MCP servers list in Cursor settings
3. Verify TestSprite MCP appears and is active

### **Tests Failing**

1. **Check Base URL**: Ensure `TEST_BASE_URL` matches your running application
2. **Check Authentication**: Admin/user pages require authentication
3. **Check Missing Elements**: Review HTML report for missing element details
4. **Check Screenshots**: View failure screenshots in `screenshots/` folder
5. **Check Console Errors**: Review JavaScript errors in test output

### **Slow Test Execution**

- Tests run sequentially for reliability
- Each test waits for page load and element checks
- Expected duration: 15-20 minutes for full suite
- Consider running specific categories for faster feedback

## 📝 Test Priority Levels

- **Critical**: Must pass for core functionality (homepage, events, admin dashboard)
- **High**: Important features (gallery, sponsors, media management)
- **Medium**: Secondary features (polls, calendar, settings)
- **Low**: Nice-to-have features (legal pages, optional settings)

## 🎉 Benefits

### **Real Browser Testing**
- Tests run in actual browser (Chromium)
- Real DOM interaction
- Actual JavaScript execution
- Real network requests

### **Comprehensive Coverage**
- 45+ test scenarios
- All major pages covered
- Critical paths tested
- Edge cases validated

### **Enhanced Validation**
- DOM element checking
- JavaScript error detection
- Form validation
- Visual verification

### **Developer-Friendly**
- Clear error messages
- Screenshot capture
- Detailed HTML reports
- Easy to extend

## 🔄 Integration with CI/CD

### **GitHub Actions Example**

```yaml
name: Comprehensive Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:install-playwright
      - run: npm run test:comprehensive
        env:
          TEST_BASE_URL: http://localhost:3000
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-report
          path: TestSprite/sanity-tests/comprehensive-test-report.html
```

## 📚 Additional Resources

- [TestSprite Documentation](https://docs.testsprite.com)
- [Playwright Documentation](https://playwright.dev)
- [Test Configuration Guide](./README-comprehensive.md)

## 🎯 Next Steps

1. **Run Tests**: Execute `npm run test:comprehensive`
2. **Review Results**: Check HTML report for details
3. **Fix Issues**: Address any failing tests
4. **Add More Tests**: Extend test coverage as needed
5. **Integrate CI/CD**: Add to your CI/CD pipeline

---

**Created with**: TestSprite MCP + Playwright Integration
**Last Updated**: 2025-01-XX
**Test Coverage**: 45+ scenarios across all major pages



