# Public Pages Sanity Test - Quick Start Guide

## ✅ What Was Created

1. **Test Plan**: `public_pages_sanity_test_plan.json`
   - 8 test cases for public pages only
   - No admin pages, no login, no complex interactions
   - Just page load and component visibility checks

2. **Test Config**: `public_pages_test_config.json`
   - Configuration for public pages testing
   - Excludes admin paths
   - Skips authentication and menu navigation

3. **Documentation**: `HOW_TO_REUSE_TESTS.md`
   - Complete guide on saving and reusing test configurations

## 🚀 How to Run Public Pages Tests

### Method 1: Using Cursor AI Chat (Recommended)

**Copy and paste this into Cursor AI chat:**

```
Run public pages sanity tests. Test only these pages:
- Homepage (/)
- Events listing (/events)
- Gallery (/gallery)
- About (/about)
- Contact (/contact)
- Polls (/polls)
- Calendar (/calendar)
- Pricing (/pricing)

For each page, verify:
1. Page loads without errors (HTTP 200, no console errors)
2. Main components are visible
3. Navigation menu is present

Do NOT test:
- Admin pages (/admin/*)
- Login/signup pages
- Clicking through menu items
- Complex interactions

This is a simple sanity check - just verify pages render correctly.
```

### Method 2: Using Command Line

```bash
# Run TestSprite MCP
node E:\.npm-cache\_npx\8ddf6bea01b2519d\node_modules\@testsprite\testsprite-mcp\dist\index.js generateCodeAndExecute
```

Then in the Cursor AI chat, reference the test plan:
```
Use the test plan at testsprite_tests/public_pages_sanity_test_plan.json
```

## 📋 Test Cases Included

| Test ID | Page | What It Checks |
|---------|------|----------------|
| PUBLIC-001 | `/` | Homepage loads, Hero section, Events sections, Navigation, Footer |
| PUBLIC-002 | `/events` | Events listing page loads, Page title, Events grid container |
| PUBLIC-003 | `/gallery` | Gallery page loads, Gallery tabs, Gallery grid |
| PUBLIC-004 | `/about` | About page loads, Page content visible |
| PUBLIC-005 | `/contact` | Contact page loads, Contact form/info visible |
| PUBLIC-006 | `/polls` | Polls page loads, Polls container visible |
| PUBLIC-007 | `/calendar` | Calendar page loads, Calendar component visible |
| PUBLIC-008 | `/pricing` | Pricing page loads, Pricing content visible |

## 🔄 How to Reuse This Test Configuration

### Save Test Results

After running tests, results are saved to:
- `testsprite_tests/tmp/test_results.json`
- `testsprite_tests/tmp/test_report.html` ⭐ **Best for review**

### Filter Expected Errors

```bash
# Filter out expected Next.js 15 warnings
node scripts/filter-testsprite-errors.js
```

This will:
- Filter expected warnings
- Generate HTML report
- Show actual failures

### View HTML Report

```bash
# Open HTML report in browser
start testsprite_tests\tmp\test_report.html
```

### Run Again Later

**Option 1: Use Cursor AI Chat**
```
Run the public pages sanity tests again using the same configuration as before.
```

**Option 2: Reference Test Plan**
```
Use testsprite_tests/public_pages_sanity_test_plan.json to test public pages only.
```

## 📝 Naming Your Test Configurations

### Current Configuration

**Name**: `public_pages_sanity_test_plan.json`
- **Scope**: `public_pages` (what pages)
- **Type**: `sanity` (what kind of test)
- **Format**: `test_plan.json` (file type)

### Future Configurations You Can Create

1. **Admin Pages Tests**
   - Name: `admin_pages_functional_test_plan.json`
   - Tests: Admin dashboard, event management, user management

2. **Full Regression Tests**
   - Name: `full_regression_test_plan.json`
   - Tests: All pages, all features, complete flows

3. **Mobile Responsive Tests**
   - Name: `mobile_responsive_test_plan.json`
   - Tests: Mobile viewport, responsive layouts

4. **Performance Tests**
   - Name: `performance_test_plan.json`
   - Tests: Page load times, rendering performance

## 🎯 Test Configuration Structure

```
testsprite_tests/
├── public_pages_sanity_test_plan.json    ← Test cases (WHAT to test)
├── public_pages_test_config.json         ← Configuration (HOW to test)
├── HOW_TO_REUSE_TESTS.md                 ← Complete guide
└── PUBLIC_PAGES_TEST_INSTRUCTIONS.md      ← This file
```

## 💡 Tips

1. **Run tests frequently**: Use public pages tests before committing code
2. **Check HTML report**: Always review `test_report.html` for failures
3. **Filter errors**: Run `filter-testsprite-errors.js` to remove expected warnings
4. **Save results**: Copy results with timestamps for comparison
5. **Document changes**: Update test plan when adding new public pages

## 🔍 Troubleshooting

### TestSprite Tunnel Error

If you see:
```
Error: Failed to set up testing tunnel: Request failed: 500 Internal Server Error
```

**Solution**: This is a temporary TestSprite cloud service issue. Try again in a few minutes.

### Tests Running Admin Pages

If tests are still checking admin pages:

**Solution**: Explicitly tell TestSprite in Cursor AI chat:
```
Do NOT test any pages under /admin path. Only test public pages.
```

### Tests Trying to Login

If tests are attempting login:

**Solution**: Add to your instructions:
```
Do NOT test login or authentication. These are public pages that don't require login.
```

## 📚 Related Files

- `HOW_TO_REUSE_TESTS.md` - Complete guide on saving/reusing tests
- `REPORT_FILES_GUIDE.md` - Understanding test reports
- `README.md` - Test suite overview

