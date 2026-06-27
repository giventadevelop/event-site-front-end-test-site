# How to Verify Test Completion and Ensure Correct Test Plan

## 🔍 **How TestSprite Selects the Test Plan**

### **Default Test Plan File**

TestSprite MCP **automatically looks for** this file:
```
testsprite_tests/testsprite_frontend_test_plan.json
```

**This is the default test plan file** that TestSprite uses when you run:
```bash
node .../testsprite-mcp/dist/index.js generateCodeAndExecute
```

### **How Test Plan Selection Works**

1. **TestSprite looks for**: `testsprite_frontend_test_plan.json` in the project root or `testsprite_tests/` directory
2. **If found**: Uses that file to generate tests
3. **If not found**: May generate tests based on codebase analysis or fail

### **Current Setup**

✅ **We replaced the old test plan** with the public pages test plan:
- **Old file**: `testsprite_frontend_test_plan.json` (backed up as `.backup`)
- **New file**: `testsprite_frontend_test_plan.json` (now contains public pages tests)
- **Source**: Copied from `public_pages_sanity_test_plan.json`

## ✅ **How to Verify Which Test Plan is Being Used**

### **Method 1: Check the Test Plan File Content**

```bash
# View first few lines to see test IDs
Get-Content testsprite_tests\testsprite_frontend_test_plan.json | Select-Object -First 30
```

**Look for:**
- ✅ `"id": "PUBLIC-001"` = Public pages test plan (CORRECT)
- ❌ `"id": "TC001"` = Old comprehensive test plan (WRONG)

### **Method 2: Check Test Results**

After tests complete, check `test_results.json`:

```bash
# Check test titles in results
Get-Content testsprite_tests\tmp\test_results.json | Select-String "title"
```

**Look for:**
- ✅ `"title": "Homepage Load and Components"` = Public pages tests (CORRECT)
- ❌ `"title": "User Authentication via Social Login"` = Old tests (WRONG)

### **Method 3: Count Test Cases**

```bash
# Count test cases in test plan
(Get-Content testsprite_tests\testsprite_frontend_test_plan.json | ConvertFrom-Json).Count
```

**Expected:**
- ✅ **8 tests** = Public pages test plan (CORRECT)
- ❌ **15+ tests** = Old comprehensive test plan (WRONG)

## 🕐 **How to Know When Tests Are Complete**

### **Method 1: Check Lock File**

```powershell
# Check if execution lock file exists
Test-Path testsprite_tests\tmp\execution.lock
```

- ✅ **`False`** = Tests completed (lock file removed)
- ❌ **`True`** = Tests still running (lock file present)

### **Method 2: Check Process Status**

```powershell
# Check if TestSprite process is running
Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.CommandLine -like "*testsprite*"}
```

- ✅ **No results** = Tests completed (process finished)
- ❌ **Process found** = Tests still running

### **Method 3: Check Test Results File Timestamp**

```powershell
# Check when test_results.json was last modified
Get-ChildItem testsprite_tests\tmp\test_results.json | Select-Object LastWriteTime
```

- ✅ **Recent timestamp** (< 5 minutes ago) = Tests just completed
- ❌ **Old timestamp** (> 15 minutes ago) = Tests completed earlier

### **Method 4: Check Terminal Output**

If you ran tests in foreground (not background), you'll see:
```
✅ Test execution completed
The AI assistant will generate a report for you.
```

### **Method 5: Check for HTML Report**

```powershell
# Check if HTML report exists and is recent
Get-ChildItem testsprite_tests\tmp\test_report.html | Select-Object LastWriteTime
```

- ✅ **File exists with recent timestamp** = Tests completed
- ❌ **File doesn't exist or old** = Tests not completed yet

## 📋 **How to Specify Which Test Plan to Use**

### **Option 1: Replace Default Test Plan File** (Current Method)

```powershell
# Backup old test plan
Copy-Item testsprite_tests\testsprite_frontend_test_plan.json testsprite_tests\testsprite_frontend_test_plan.json.backup

# Replace with your test plan
Copy-Item testsprite_tests\public_pages_sanity_test_plan.json testsprite_tests\testsprite_frontend_test_plan.json -Force
```

**Pros:**
- ✅ Simple - just replace the file
- ✅ Works automatically with TestSprite MCP

**Cons:**
- ❌ Overwrites default test plan
- ❌ Need to restore backup for other tests

### **Option 2: Use Additional Instructions** (Recommended)

When calling TestSprite MCP, provide detailed instructions:

```typescript
mcp_TestSprite_testsprite_generate_code_and_execute({
  projectName: "mosc-temp",
  projectPath: "E:\\project_workspace\\mosc-temp",
  testIds: [],
  additionalInstruction: `
    Use the test plan at testsprite_tests/public_pages_sanity_test_plan.json

    Test only these pages:
    - Homepage (/)
    - Events listing (/events)
    - Gallery (/gallery)
    - About (/about)
    - Contact (/contact)
    - Polls (/polls)
    - Calendar (/calendar)
    - Pricing (/pricing)

    Do NOT test admin pages, login flows, or complex interactions.
  `
})
```

**Pros:**
- ✅ Doesn't modify default test plan
- ✅ Can specify different test plans per run
- ✅ More flexible

**Cons:**
- ❌ TestSprite may still use default file if instructions unclear

### **Option 3: Reference Test Plan in Chat** (Best Practice)

When asking Cursor AI to run tests:

```
Use the test plan at testsprite_tests/public_pages_sanity_test_plan.json
to run public pages sanity tests.
```

**Pros:**
- ✅ Clear and explicit
- ✅ Cursor AI can read the file and use it
- ✅ No file modifications needed

## 🔄 **Complete Workflow: Verify Test Plan and Completion**

### **Step 1: Before Running Tests**

```powershell
# Verify which test plan is active
Get-Content testsprite_tests\testsprite_frontend_test_plan.json | Select-Object -First 5

# Should show: "id": "PUBLIC-001" (public pages) or "id": "TC001" (old tests)
```

### **Step 2: Run Tests**

```bash
# Via Cursor AI chat (recommended)
"Run public pages sanity tests using testsprite_tests/public_pages_sanity_test_plan.json"

# Or via command line
node E:\.npm-cache\_npx\8ddf6bea01b2519d\node_modules\@testsprite\testsprite-mcp\dist\index.js generateCodeAndExecute
```

### **Step 3: Monitor Progress**

```powershell
# Check if tests are running (every 30 seconds)
while ($true) {
    $lockExists = Test-Path testsprite_tests\tmp\execution.lock
    $processRunning = Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.CommandLine -like "*testsprite*"}

    if (-not $lockExists -and -not $processRunning) {
        Write-Host "✅ Tests completed!"
        break
    }

    Write-Host "⏳ Tests still running... ($(Get-Date -Format 'HH:mm:ss'))"
    Start-Sleep -Seconds 30
}
```

### **Step 4: Verify Test Plan Was Used**

```powershell
# Check test results to confirm correct test plan
$results = Get-Content testsprite_tests\tmp\test_results.json | ConvertFrom-Json
$results | Select-Object -First 3 title

# Should show:
# - "Homepage Load and Components"
# - "Events Listing Page Load"
# - "Gallery Page Load"
# NOT:
# - "User Authentication via Social Login"
# - "Event Creation Workflow"
```

### **Step 5: Filter and View Results**

```bash
# Filter expected errors
node scripts/filter-testsprite-errors.js

# View HTML report
start testsprite_tests\tmp\test_report.html
```

## 📊 **Quick Reference: Test Plan Files**

| File | Purpose | When to Use |
|------|---------|-------------|
| `testsprite_frontend_test_plan.json` | **Default test plan** (TestSprite looks for this) | Default behavior |
| `public_pages_sanity_test_plan.json` | Public pages only (8 tests) | Public pages sanity checks |
| `testsprite_frontend_test_plan.json.backup` | Backup of old comprehensive tests | Restore if needed |

## 🎯 **Current Status**

✅ **Test Plan**: `testsprite_frontend_test_plan.json` = Public pages test plan (8 tests)
✅ **Backup**: `testsprite_frontend_test_plan.json.backup` = Old comprehensive tests (15 tests)
✅ **Source**: `public_pages_sanity_test_plan.json` = Original public pages plan

## ⚠️ **Troubleshooting**

### **Problem: Tests using wrong test plan**

**Solution:**
```powershell
# Verify current test plan
Get-Content testsprite_tests\testsprite_frontend_test_plan.json | Select-String "PUBLIC-001"

# If not found, restore public pages plan
Copy-Item testsprite_tests\public_pages_sanity_test_plan.json testsprite_tests\testsprite_frontend_test_plan.json -Force
```

### **Problem: Can't tell if tests completed**

**Solution:**
```powershell
# Check all indicators
$lockExists = Test-Path testsprite_tests\tmp\execution.lock
$processRunning = Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.CommandLine -like "*testsprite*"}
$resultsTime = (Get-ChildItem testsprite_tests\tmp\test_results.json -ErrorAction SilentlyContinue).LastWriteTime

Write-Host "Lock file exists: $lockExists"
Write-Host "Process running: $($processRunning -ne $null)"
Write-Host "Results last updated: $resultsTime"

# If lock doesn't exist AND no process AND recent results = COMPLETE
```

## 📝 **Summary**

**To ensure correct test plan:**
1. ✅ Replace `testsprite_frontend_test_plan.json` with your desired test plan
2. ✅ Or reference test plan file in `additionalInstruction`
3. ✅ Verify test plan by checking first test ID (`PUBLIC-001` vs `TC001`)

**To verify tests completed:**
1. ✅ Check lock file: `Test-Path testsprite_tests\tmp\execution.lock` = `False`
2. ✅ Check process: No TestSprite node process running
3. ✅ Check results timestamp: Recent `LastWriteTime` on `test_results.json`
4. ✅ Check HTML report: File exists with recent timestamp

