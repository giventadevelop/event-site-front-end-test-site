# TestSprite HTML Report Generation Guide

## Overview

There are two ways to generate HTML reports from TestSprite test results:

1. **Filtered Report** (recommended for most cases)
2. **Unfiltered Report** (shows all errors, including expected warnings)

## Filtered Report (Recommended)

**Script**: `scripts/filter-testsprite-errors.js`

**What it does**:
- Filters out expected errors (Next.js 15 headers() warnings, MobileDebugConsole warnings, etc.)
- Changes test status from `FAILED` to `PASSED` if failure was only due to expected warnings
- Generates HTML report with filtered results
- Updates the test results JSON file

**Usage**:
```bash
# Use default paths
node scripts/filter-testsprite-errors.js

# Specify custom test results path
node scripts/filter-testsprite-errors.js path/to/test_results.json
```

**Output**:
- `testsprite_tests/tmp/test_results.json` (updated with filtered results)
- `testsprite_tests/tmp/test_report.html` (filtered HTML report)

**When to use**:
- ✅ Normal test runs
- ✅ CI/CD pipelines
- ✅ When you want to see actual test failures (not expected warnings)
- ✅ Sharing results with team/Cursor AI

## Unfiltered Report

**Script**: `scripts/generate-testsprite-html-report-unfiltered.js`

**What it does**:
- Generates HTML report directly from raw test results
- Shows ALL errors and warnings without filtering
- Does NOT modify the test results JSON file
- Useful for debugging and seeing all console output

**Usage**:
```bash
# Use default paths
node scripts/generate-testsprite-html-report-unfiltered.js

# Specify custom paths
node scripts/generate-testsprite-html-report-unfiltered.js path/to/test_results.json path/to/output.html
```

**Output**:
- `testsprite_tests/tmp/test_report_unfiltered.html` (unfiltered HTML report)
- Original test results JSON file is NOT modified

**When to use**:
- ✅ Debugging test failures
- ✅ Investigating console warnings
- ✅ When you need to see ALL errors (including expected ones)
- ✅ Comparing filtered vs unfiltered results

## Comparison

| Feature | Filtered Report | Unfiltered Report |
|---------|----------------|-------------------|
| **Script** | `filter-testsprite-errors.js` | `generate-testsprite-html-report-unfiltered.js` |
| **Filters Errors** | ✅ Yes | ❌ No |
| **Modifies JSON** | ✅ Yes | ❌ No |
| **Shows Expected Warnings** | ❌ No | ✅ Yes |
| **Output File** | `test_report.html` | `test_report_unfiltered.html` |
| **Use Case** | Normal testing | Debugging |

## Filtered Error Patterns

The filtered report automatically removes these expected errors:

1. **Next.js 15 headers() warnings**:
   - `Route.*used.*headers()`
   - `headers() should be awaited`

2. **MobileDebugConsole warnings**:
   - `MobileDebugConsole` references
   - `webpack-internal.*MobileDebugConsole`
   - `at.*MobileDebugConsole.tsx`

3. **Image warnings**:
   - `Image with src.*has either width or height modified`
   - `Image.*has "fill" and parent element with invalid "position"`

4. **External resource errors**:
   - `net::ERR_SOCKET_NOT_CONNECTED`
   - `net::ERR_CONNECTION_CLOSED`
   - `Failed to load resource.*fonts.googleapis`
   - `Failed to load resource.*cdnjs`

5. **React hydration warnings**:
   - `Cannot update a component.*while rendering`
   - `Hydration.*failed`

## Workflow Examples

### Example 1: Normal Test Run (Filtered)

```bash
# Run tests
node scripts/run-public-pages-tests.js

# Generate filtered report (automatically done by filter script)
node scripts/filter-testsprite-errors.js

# Open report
start testsprite_tests/tmp/test_report.html  # Windows
open testsprite_tests/tmp/test_report.html   # Mac
```

### Example 2: Debugging Test Failures (Unfiltered)

```bash
# Run tests
node scripts/run-public-pages-tests.js

# Generate unfiltered report to see all errors
node scripts/generate-testsprite-html-report-unfiltered.js

# Compare both reports
start testsprite_tests/tmp/test_report.html           # Filtered
start testsprite_tests/tmp/test_report_unfiltered.html # Unfiltered
```

### Example 3: Custom Paths

```bash
# Filtered report with custom paths
node scripts/filter-testsprite-errors.js custom/path/results.json

# Unfiltered report with custom paths
node scripts/generate-testsprite-html-report-unfiltered.js custom/path/results.json custom/path/report.html
```

## Report Features

Both HTML reports include:

- ✅ **Summary Dashboard**: Total tests, passed, failed, success rate
- ✅ **Test Details**: Individual test results with full error messages
- ✅ **Console Logs**: Browser console output for each test
- ✅ **Visualization Links**: Links to test videos/visualizations (if available)
- ✅ **Color Coding**: Green for passed, red for failed, orange for filtered
- ✅ **Searchable**: Use browser search (Ctrl+F / Cmd+F) to find specific tests

## Tips

1. **Always run filtered report first** - It shows actual failures
2. **Use unfiltered report for debugging** - When you need to see all console output
3. **Share filtered reports** - They're cleaner and focus on real issues
4. **Compare both reports** - Helps identify which errors are expected vs actual failures

## Related Files

- Filter script: `scripts/filter-testsprite-errors.js`
- Unfiltered generator: `scripts/generate-testsprite-html-report-unfiltered.js`
- HTML generator: `scripts/generate-testsprite-html-report.js` (shared function)
- Test runner: `scripts/run-public-pages-tests.js`
- Test results: `testsprite_tests/tmp/test_results.json`

