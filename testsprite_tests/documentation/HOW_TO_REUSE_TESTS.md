# How to Save and Reuse TestSprite Test Configurations

## 📋 Overview

TestSprite MCP allows you to save test configurations and reuse them for consistent testing. This guide explains how to organize, name, and reuse your test configurations.

## 📚 Understanding Test Plan vs Test Config Files

### **Test Plan File** (`*_test_plan.json`)

**Purpose**: Defines **WHAT** to test - the actual test cases, steps, and assertions.

**Structure**: Array of test case objects, each containing:
- `id`: Unique test identifier (e.g., "PUBLIC-001")
- `title`: Test case title
- `description`: What the test verifies
- `category`: Test type (sanity, functional, regression, etc.)
- `priority`: Test priority (Critical, High, Medium, Low)
- `steps`: Array of actions and assertions

**Example Structure**:
```json
[
  {
    "id": "PUBLIC-001",
    "title": "Homepage Load and Components",
    "description": "Verify homepage loads successfully",
    "category": "sanity",
    "priority": "Critical",
    "steps": [
      {
        "type": "action",
        "description": "Navigate to homepage (/)"
      },
      {
        "type": "assertion",
        "description": "Verify page loads without errors"
      }
    ]
  }
]
```

**Key Points**:
- ✅ **Required** - TestSprite MCP uses this file to generate and execute tests
- ✅ Contains the actual test logic and steps
- ✅ Can be used standalone without a config file
- ✅ Referenced directly in Cursor AI chat or command line

### **Test Config File** (`*_test_config.json`)

**Purpose**: Defines **HOW** to test - configuration, settings, and metadata about the test execution.

**Structure**: Single object containing:
- `testPlanName`: Human-readable name for the test suite
- `testPlanDescription`: Description of what this configuration tests
- `testPlanFile`: **Reference to the test plan file** (path to `*_test_plan.json`)
- `project`: Project metadata (name, baseUrl, type)
- `testConfiguration`: Execution settings (scope, exclusions, timeouts, retries)
- `additionalInstructions`: Instructions for TestSprite MCP
- `notes`: Additional documentation

**Example Structure**:
```json
{
  "testPlanName": "Public Pages Sanity Tests",
  "testPlanDescription": "Simple sanity tests for public pages only",
  "testPlanFile": "testsprite_tests/public_pages_sanity_test_plan.json",
  "project": {
    "name": "mosc-temp",
    "baseUrl": "http://localhost:3000",
    "type": "frontend"
  },
  "testConfiguration": {
    "scope": "public-pages-only",
    "excludePaths": ["/admin", "/sign-in"],
    "skipInteractions": true,
    "skipAuthentication": true
  },
  "additionalInstructions": "Test only public pages..."
}
```

**Key Points**:
- ⚠️ **Optional** - Used primarily for documentation and reference
- ⚠️ Contains metadata and execution settings
- ⚠️ References the test plan file via `testPlanFile` field
- ⚠️ TestSprite MCP may not directly use this file - it primarily uses the test plan file
- ✅ Useful for documenting test suite purpose and settings

### **Key Differences**

| Aspect | Test Plan File | Test Config File |
|--------|----------------|------------------|
| **Purpose** | **WHAT** to test (test cases) | **HOW** to test (configuration) |
| **Required** | ✅ Yes - Required for execution | ⚠️ No - Optional documentation |
| **Structure** | Array of test objects | Single configuration object |
| **Contains** | Test steps, assertions, logic | Settings, metadata, instructions |
| **Used By** | TestSprite MCP directly | Documentation/reference |
| **Standalone** | ✅ Can be used alone | ❌ References test plan file |

### **When to Use Each**

**Use Test Plan File When**:
- ✅ Running tests via Cursor AI chat
- ✅ Running tests via command line
- ✅ TestSprite MCP needs to know what tests to execute
- ✅ You want to execute tests immediately

**Use Test Config File When**:
- ✅ Documenting test suite purpose and settings
- ✅ Sharing test configuration with team
- ✅ Keeping metadata about test execution settings
- ✅ Reference for understanding test scope and exclusions

## 🗂️ File Organization

### Recommended Structure

```
testsprite_tests/
├── public_pages_sanity_test_plan.json      # Test plan (what to test)
├── public_pages_test_config.json           # Test configuration (how to test)
├── admin_pages_test_plan.json              # Future: Admin tests
├── admin_pages_test_config.json            # Future: Admin config
├── full_regression_test_plan.json          # Future: Full regression
├── full_regression_test_config.json        # Future: Full config
└── tmp/                                    # Test results (auto-generated)
    ├── test_results.json
    ├── test_report.html
    └── raw_report.md
```

## 📝 Naming Conventions

### Test Plan Files (`*_test_plan.json`)
Format: `{scope}_{type}_test_plan.json`

Examples:
- `public_pages_sanity_test_plan.json` - Public pages sanity tests
- `admin_pages_functional_test_plan.json` - Admin pages functional tests
- `api_endpoints_test_plan.json` - API endpoint tests
- `mobile_responsive_test_plan.json` - Mobile responsive tests

### Test Config Files (`*_test_config.json`)
Format: `{scope}_test_config.json`

Examples:
- `public_pages_test_config.json` - Public pages configuration
- `admin_pages_test_config.json` - Admin pages configuration
- `full_regression_test_config.json` - Full regression configuration

### Test Types

| Type | Description | Use Case |
|------|-------------|----------|
| `sanity` | Quick checks - pages load, components visible | Daily checks, pre-commit |
| `functional` | Full feature testing with interactions | Feature validation |
| `regression` | Comprehensive testing of all features | Release testing |
| `performance` | Load time, rendering performance | Performance validation |
| `accessibility` | A11y checks, screen reader tests | Accessibility compliance |

## 🚀 How to Run Saved Tests

### Method 1: Using TestSprite MCP (Recommended)

**In Cursor AI Chat:**

```
Run the public pages sanity tests using the test plan at testsprite_tests/public_pages_sanity_test_plan.json
```

Or:

```
Test only public pages (homepage, events, gallery, about, contact, polls, calendar, pricing).
Verify pages load without errors and main components are visible.
Do NOT test admin pages, login flows, or click through menu items.
```

### Method 2: Using Command Line

```bash
# Run with specific test plan
node E:\.npm-cache\_npx\8ddf6bea01b2519d\node_modules\@testsprite\testsprite-mcp\dist\index.js generateCodeAndExecute

# The MCP will use the test plan file if you reference it in the chat
```

### Method 3: Using Configuration File

**Important**: You typically only need to specify the **test plan file**, not the config file. The config file is optional and used primarily for documentation/reference.

Create a script wrapper:

```bash
# scripts/run-public-pages-tests.js
const { execSync } = require('child_process');

// Only specify the test plan file - this is what TestSprite MCP uses
const testPlanPath = 'testsprite_tests/public_pages_sanity_test_plan.json';
const command = `node E:\\.npm-cache\\_npx\\8ddf6bea01b2519d\\node_modules\\@testsprite\\testsprite-mcp\\dist\\index.js generateCodeAndExecute`;

console.log(`Running public pages sanity tests...`);
console.log(`Test plan: ${testPlanPath}`);
console.log(`Note: Config file (public_pages_test_config.json) is optional - used for reference only`);

execSync(command, { stdio: 'inherit' });
```

Then run:
```bash
node scripts/run-public-pages-tests.js
```

**Alternative: Using Config File for Reference**

If you want to use the config file for documentation purposes, you can read it to get the test plan path:

```bash
# scripts/run-public-pages-tests.js
const { execSync } = require('child_process');
const fs = require('fs');

// Read config file to get test plan path (optional)
const configPath = 'testsprite_tests/public_pages_test_config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const testPlanPath = config.testPlanFile; // References the actual test plan file

const command = `node E:\\.npm-cache\\_npx\\8ddf6bea01b2519d\\node_modules\\@testsprite\\testsprite-mcp\\dist\\index.js generateCodeAndExecute`;

console.log(`Running: ${config.testPlanName}`);
console.log(`Description: ${config.testPlanDescription}`);
console.log(`Test plan: ${testPlanPath}`);

execSync(command, { stdio: 'inherit' });
```

**Summary for Method 3**:
- ✅ **Test Plan File**: Required - specify this directly or read from config file
- ⚠️ **Test Config File**: Optional - useful for documentation, but TestSprite MCP uses the test plan file directly
- 💡 **Best Practice**: Reference the test plan file directly in your script, use config file for documentation only

## 📊 Current Test Configurations

### 1. Public Pages Sanity Tests ⭐ **CURRENT**

**Files:**
- `public_pages_sanity_test_plan.json` - Test cases
- `public_pages_test_config.json` - Configuration

**What it tests:**
- Homepage (`/`)
- Events listing (`/events`)
- Gallery (`/gallery`)
- About (`/about`)
- Contact (`/contact`)
- Polls (`/polls`)
- Calendar (`/calendar`)
- Pricing (`/pricing`)

**What it does:**
- ✅ Verifies pages load without errors
- ✅ Checks main components are visible
- ✅ No admin pages
- ✅ No login/authentication
- ✅ No menu navigation
- ✅ No complex interactions

**How to run:**
```bash
# In Cursor AI chat:
"Run public pages sanity tests - test only homepage, events, gallery, about, contact, polls, calendar, pricing. Verify pages load and components are visible. No admin pages, no login."
```

### 2. Future: Admin Pages Tests

**Files:** (To be created)
- `admin_pages_functional_test_plan.json`
- `admin_pages_test_config.json`

**What it will test:**
- Admin dashboard
- Event management
- User management
- Settings pages

### 3. Future: Full Regression Tests

**Files:** (To be created)
- `full_regression_test_plan.json`
- `full_regression_test_config.json`

**What it will test:**
- All public pages
- All admin pages
- Authentication flows
- Complete user journeys

## 🔄 Reusing Tests

### Quick Reference

**Run Public Pages Tests:**
```
Run public pages sanity tests using testsprite_tests/public_pages_sanity_test_plan.json
```

**Run Specific Test:**
```
Test only the homepage (/) - verify it loads and main sections are visible
```

**Run Custom Test:**
```
Test these public pages: /events, /gallery, /about.
Verify each page loads without errors and main content is visible.
```

### Saving Test Results

Test results are automatically saved to:
- `testsprite_tests/tmp/test_results.json` - JSON results
- `testsprite_tests/tmp/test_report.html` - HTML report
- `testsprite_tests/tmp/raw_report.md` - Markdown report

**To save results with a specific name:**
```bash
# After running tests, copy results with timestamp
cp testsprite_tests/tmp/test_results.json testsprite_tests/results/public_pages_$(date +%Y%m%d_%H%M%S).json
cp testsprite_tests/tmp/test_report.html testsprite_tests/results/public_pages_$(date +%Y%m%d_%H%M%S).html
```

## 📝 Creating New Test Configurations

### Step 1: Create Test Plan

Create `testsprite_tests/{scope}_{type}_test_plan.json`:

```json
[
  {
    "id": "TEST-001",
    "title": "Page Load Test",
    "description": "Verify page loads successfully",
    "category": "sanity",
    "priority": "Critical",
    "steps": [
      {
        "type": "action",
        "description": "Navigate to page"
      },
      {
        "type": "assertion",
        "description": "Verify page loads without errors"
      }
    ]
  }
]
```

### Step 2: Create Test Config

Create `testsprite_tests/{scope}_test_config.json`:

```json
{
  "testPlanName": "Your Test Suite Name",
  "testPlanDescription": "Description of what this tests",
  "testPlanFile": "testsprite_tests/{scope}_{type}_test_plan.json",
  "project": {
    "name": "mosc-temp",
    "baseUrl": "http://localhost:3000",
    "type": "frontend"
  },
  "testConfiguration": {
    "scope": "your-scope",
    "excludePaths": ["/admin", "/sign-in"],
    "testTypes": ["page-load"],
    "skipInteractions": true,
    "skipAuthentication": true
  },
  "additionalInstructions": "Your specific instructions for TestSprite"
}
```

### Step 3: Document Usage

Add to this file (`HOW_TO_REUSE_TESTS.md`) how to run your new test configuration.

## 🎯 Best Practices

1. **Name clearly**: Use descriptive names that indicate scope and type
2. **Document**: Add comments in config files explaining what's tested
3. **Version control**: Commit test plans and configs to git
4. **Organize**: Group related tests in the same directory
5. **Reuse**: Reference existing test plans when creating new ones
6. **Update**: Keep test plans in sync with application changes

## 📚 Related Documentation

- `README.md` - Test suite overview
- `REPORT_FILES_GUIDE.md` - Understanding test reports
- `NEXTJS_15_HEADERS_ERROR_HANDLING.md` - Expected errors
- `TESTSPRITE_CONSOLE_ERROR_FILTERING.md` - Filtering guide

