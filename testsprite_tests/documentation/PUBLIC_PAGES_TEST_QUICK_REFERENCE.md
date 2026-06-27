# Public Pages Test Quick Reference

## 📋 Test Plans Available

### 1. **Comprehensive Test Plan** (25 tests) ⭐ **RECOMMENDED FOR FULL TESTING**
- **File**: `testsprite_tests/public_pages_comprehensive_test_plan.json`
- **Config**: `testsprite_tests/public_pages_comprehensive_test_config.json`
- **Coverage**: All public pages + functional interactions
- **Duration**: ~10-15 minutes
- **Use Case**: Full regression testing, release validation

**Test Coverage**:
- ✅ Homepage (load, components)
- ✅ Events listing (load, pagination, search)
- ✅ Event details (load, media gallery)
- ✅ Gallery (load, tabs, search, filter)
- ✅ About/Contact (via dropdown)
- ✅ Polls (listing, details)
- ✅ Calendar
- ✅ Pricing
- ✅ Sponsors (listing, details)
- ✅ Focus Groups (listing, details)
- ✅ MOSC pages
- ✅ Charity theme
- ✅ Navigation menu
- ✅ Footer
- ✅ Responsive design
- ✅ Search functionality
- ✅ Pagination

### 2. **Sanity Test Plan** (8 tests) ⚡ **QUICK CHECKS**
- **File**: `testsprite_tests/public_pages_sanity_test_plan.json`
- **Config**: `testsprite_tests/public_pages_test_config.json`
- **Coverage**: Basic page loads only
- **Duration**: ~3-5 minutes
- **Use Case**: Daily checks, pre-commit validation

**Test Coverage**:
- ✅ Homepage load
- ✅ Events listing load
- ✅ Gallery load
- ✅ About page load
- ✅ Contact page load
- ✅ Polls page load
- ✅ Calendar page load
- ✅ Pricing page load

## 🚀 Quick Start

### Run Comprehensive Tests (Default)
```bash
node scripts/run-public-pages-tests.js
```

### Run Sanity Tests Only
```bash
node scripts/run-public-pages-tests.js --test-plan=testsprite_tests/public_pages_sanity_test_plan.json
```

### Run with Custom Base URL
```bash
node scripts/run-public-pages-tests.js --base-url=http://localhost:3001
```

### View Help
```bash
node scripts/run-public-pages-tests.js --help
```

## 📊 After Test Execution

### 1. Filter Expected Errors
```bash
node scripts/filter-testsprite-errors.js
```

### 2. View HTML Report
```bash
# Windows
start testsprite_tests\tmp\test_report.html

# Mac/Linux
open testsprite_tests/tmp/test_report.html
```

### 3. Review JSON Results
```bash
# View test results
cat testsprite_tests/tmp/test_results.json
```

## 📝 Test Plan Structure

### Test Case Format
```json
{
  "id": "PUBLIC-XXX",
  "title": "Test Title",
  "description": "What this test verifies",
  "category": "sanity|functional",
  "priority": "Critical|High|Medium|Low",
  "steps": [
    {
      "type": "action|assertion",
      "description": "Step description"
    }
  ]
}
```

### Categories
- **sanity**: Quick checks - pages load, components visible
- **functional**: Full feature testing with interactions

### Priorities
- **Critical**: Core pages (homepage, events, gallery)
- **High**: Important pages (polls, calendar, pricing)
- **Medium**: Secondary pages (sponsors, focus groups)
- **Low**: Optional pages (MOSC, charity theme)

## 🔧 Troubleshooting

### Server Not Running
```bash
# Start Next.js dev server first
npm run dev
```

### Test Plan Not Found
```bash
# Verify test plan exists
ls testsprite_tests/*test_plan.json

# Use absolute path if needed
node scripts/run-public-pages-tests.js --test-plan=./testsprite_tests/public_pages_comprehensive_test_plan.json
```

### Tests Timing Out
- Increase timeout in test config file
- Check server performance
- Reduce number of tests (use sanity plan)

### Tests Failing
1. Check server logs for errors
2. Verify pages are accessible manually
3. Review HTML report for screenshots
4. Check console errors in browser

## 📚 Related Documentation

- `HOW_TO_REUSE_TESTS.md` - Detailed guide on test plans vs config files
- `PUBLIC_PAGES_TEST_INSTRUCTIONS.md` - Step-by-step instructions
- `HOW_TO_TRIGGER_TESTS_FROM_CURSOR_AI.md` - Using Cursor AI for tests
- `TESTSPRITE_SOLUTION_SUMMARY.md` - TestSprite setup and configuration

## 🎯 Best Practices

1. **Run sanity tests** before committing code
2. **Run comprehensive tests** before releases
3. **Filter expected errors** after test execution
4. **Review HTML reports** for visual debugging
5. **Keep test plans updated** as pages change
6. **Document new pages** in test plans

