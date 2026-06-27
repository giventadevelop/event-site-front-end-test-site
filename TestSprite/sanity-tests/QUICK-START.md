# Comprehensive Sanity Test Suite - Quick Reference

## 🚀 Running the Tests

### Basic Execution
```bash
cd TestSprite/sanity-tests
node run-comprehensive-sanity-tests.js
```

### With Custom Base URL
```bash
TEST_BASE_URL=http://localhost:3001 node run-comprehensive-sanity-tests.js
```

### Using TestSprite MCP Server (if configured)
```bash
testsprite run --config testsprite-mcp-config.json --comprehensive
```

## 📊 Test Statistics

- **Total Tests**: 34
- **Public Pages**: 10 tests
- **Admin Pages**: 16 tests
- **User Pages**: 3 tests
- **Authentication**: 2 tests
- **Legal Pages**: 3 tests

## ⏱️ Expected Duration

- **Full Suite**: 10-15 minutes
- **Per Test**: ~300-1100ms (simulated)
- **Timeout**: 15 seconds per test

## 📄 Output Files

- **HTML Report**: `TestSprite/sanity-tests/comprehensive-test-report.html`
- **Console Output**: Real-time test execution logs

## 🔍 Test Categories

1. **Public Pages** - No authentication required
2. **Admin Pages** - Requires admin authentication
3. **User Pages** - Requires user authentication
4. **Authentication** - Sign in/sign up pages
5. **Legal Pages** - Privacy, terms, etc.

## ✅ What Gets Tested

Each test verifies:
- ✅ Page loads without errors
- ✅ Expected UI elements are present
- ✅ Navigation works correctly
- ✅ Forms/buttons are accessible
- ✅ No JavaScript console errors

## 🎯 Priority Levels

- **Critical**: Core functionality (must pass)
- **High**: Important features
- **Medium**: Secondary features
- **Low**: Nice-to-have features

## 📝 Notes

- Tests assume user is already logged in for admin/user pages
- Some tests may skip if required data doesn't exist (e.g., events)
- Update test URLs (like `/events/1`) based on your actual data
- Screenshots are captured on failures (if enabled)

## 🔧 Customization

Edit `run-comprehensive-sanity-tests.js` to:
- Change base URL
- Adjust timeouts
- Add/remove tests
- Modify expected elements
- Enable performance timing

## 📚 Related Files

- `run-sanity-tests.js` - Quick 3-minute basic tests (7 tests)
- `README-comprehensive.md` - Full documentation
- `sanity-test-config.json` - Basic test configuration
- `testsprite-mcp-config.json` - TestSprite MCP configuration


