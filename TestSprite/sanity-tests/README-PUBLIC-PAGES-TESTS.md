# Public Pages Test Suite

## 🎯 **Overview**

A fast, focused test suite that tests **only public pages** (no authentication required). This is ideal for quick sanity checks during development.

## ⚡ **Quick Start**

```bash
# Run public pages tests only
npm run test:public
```

## 📊 **Test Coverage**

The public pages test suite covers **16 public pages**:

### **Core Pages (Critical Priority)**
- ✅ Homepage (`/`)
- ✅ Events Listing (`/events`)
- ✅ Event Details (`/events/1`)

### **Content Pages (High Priority)**
- ✅ Sponsors Listing (`/sponsors`)
- ✅ Gallery (`/gallery`)

### **Feature Pages (Medium Priority)**
- ✅ Sponsor Details (`/sponsors/1`)
- ✅ Polls Listing (`/polls`)
- ✅ Calendar (`/calendar`)
- ✅ Pricing (`/pricing`)
- ✅ About (`/about`)
- ✅ Contact (`/contact`)

### **MOSC Pages (Medium Priority)**
- ✅ MOSC Homepage (`/mosc`)
- ✅ MOSC Holy Synod (`/mosc/holy-synod`)
- ✅ MOSC Gallery (`/mosc/gallery`)
- ✅ MOSC Directory (`/mosc/directory`)

### **Theme Pages (Low Priority)**
- ✅ Charity Theme (`/charity-theme`)

## ⏱️ **Duration**

- **Expected Duration:** 3-5 minutes
- **Much faster** than comprehensive tests (15-20 minutes)
- **No authentication required** - tests run immediately

## 🔧 **Features**

### **Simplified Test Suite**
- ✅ **No authentication logic** - Public pages don't need auth
- ✅ **Faster execution** - Only tests public pages
- ✅ **Focused validation** - Core functionality checks
- ✅ **Quick feedback** - Get results in minutes

### **Test Capabilities**
- ✅ **Page load verification** - Ensures pages load successfully
- ✅ **Element checking** - Verifies expected elements are present
- ✅ **JavaScript error detection** - Catches console errors
- ✅ **React warning handling** - Treats React warnings as non-critical
- ✅ **Connection error retry** - Handles server compilation delays
- ✅ **Screenshot on failure** - Captures screenshots for debugging

## 📋 **Test Structure**

Each test includes:
- **Expected Elements** - CSS selectors to verify page structure
- **Validation Checks** - List of validations to perform
- **Interactions** - Optional user interactions (wait, check)
- **Skip Conditions** - Conditions to skip tests (e.g., "No events available")

## 🚀 **Usage**

### **Run All Public Page Tests**
```bash
npm run test:public
```

### **Prerequisites**
1. **Dev server running** on `http://localhost:3000`
2. **Playwright installed** (run `npm run test:install-playwright` if needed)

### **Example Output**
```
🚀 Starting Public Pages Test Suite
📍 Base URL: http://localhost:3000
⏱️  Expected Duration: 3-5 minutes
🧪 Test Engine: Playwright (Browser automation)
📦 Testing: Public pages only (no authentication required)
======================================================================

🧪 [public-001] Running: Homepage Load Test
   Priority: critical
   URL: http://localhost:3000/
   ✅ PASSED (1234ms)

🧪 [public-002] Running: Events Listing Page Test
   Priority: critical
   URL: http://localhost:3000/events
   ✅ PASSED (2345ms)

...

📊 Test Summary
======================================================================
Total Tests: 16
✅ Passed: 14
❌ Failed: 2
⏭️  Skipped: 0
Success Rate: 87.5%
```

## 🔄 **Comparison with Comprehensive Tests**

| Feature | Public Pages Tests | Comprehensive Tests |
|---------|-------------------|---------------------|
| **Duration** | 3-5 minutes | 15-20 minutes |
| **Test Count** | 16 tests | 50+ tests |
| **Authentication** | Not required | Required for admin pages |
| **Coverage** | Public pages only | All pages (public + admin) |
| **Use Case** | Quick sanity checks | Full regression testing |

## 📝 **Configuration**

### **Environment Variables**

Optional (uses defaults if not set):
- `TEST_BASE_URL` - Base URL for tests (default: `http://localhost:3000`)

### **Test Configuration**

Edit `TestSprite/sanity-tests/run-public-pages-tests.js` to customize:
- `timeout` - Test timeout (default: 30000ms)
- `screenshotOnFailure` - Capture screenshots (default: true)
- `testDuration` - Expected duration (default: '3-5 minutes')

## 🐛 **Troubleshooting**

### **Connection Errors**
If you see `ERR_CONNECTION_RESET` or `ERR_CONNECTION_REFUSED`:
1. **Ensure dev server is running**: `npm run dev`
2. **Wait for server to compile** - First page load may be slower
3. **Check server logs** - Look for compilation errors

### **Missing Elements**
If tests report missing elements:
- Check if page structure has changed
- Verify CSS selectors match actual page elements
- Missing elements are warnings (not errors) if page loads successfully

### **React Warnings**
React `setState` warnings are treated as **warnings** (not errors):
- These don't fail tests
- Fix them separately if needed
- They indicate React best practice violations

## 📚 **Related Documentation**

- **Comprehensive Tests**: See `README-comprehensive.md` for full test suite
- **TestSprite MCP**: See `TEST-DURATION-AND-MCP-USAGE.md` for MCP server usage
- **Troubleshooting**: See `TROUBLESHOOTING.md` for common issues

---

**Status:** ✅ **Ready to use!** Run `npm run test:public` to test public pages.

