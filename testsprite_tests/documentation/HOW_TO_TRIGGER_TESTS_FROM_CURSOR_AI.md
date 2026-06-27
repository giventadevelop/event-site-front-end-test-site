# How to Trigger TestSprite Tests from Cursor AI Chat

## 🎯 **Problem**

Tests are only running when manually executed from command prompt, not when triggered via Cursor AI chat.

## ✅ **Solution: Explicit Test Execution Instructions**

### **Method 1: Explicit MCP Tool Call** (Recommended)

When asking Cursor AI to run tests, be **explicit** about using TestSprite MCP:

```
Use the TestSprite MCP server to run public pages sanity tests.
Use the test plan at testsprite_tests/public_pages_sanity_test_plan.json
```

Or more detailed:

```
Run TestSprite tests using the MCP server:
- Use test plan: testsprite_tests/public_pages_sanity_test_plan.json
- Test only public pages (homepage, events, gallery, about, contact, polls, calendar, pricing)
- Verify pages load without errors and main components are visible
- Do NOT test admin pages or login flows
```

### **Method 2: Reference the Test Plan File**

Always reference the test plan file explicitly:

```
Run tests using testsprite_tests/public_pages_sanity_test_plan.json
```

### **Method 3: Use Complete Command**

If Cursor AI doesn't trigger MCP automatically, provide the exact command:

```
Execute this command to run TestSprite tests:
node E:\.npm-cache\_npx\8ddf6bea01b2519d\node_modules\@testsprite\testsprite-mcp\dist\index.js generateCodeAndExecute
```

## 🔍 **Why Cursor AI Might Not Trigger Tests Automatically**

### **Common Reasons:**

1. **Vague Instructions**:
   - ❌ "Run tests" (too vague)
   - ✅ "Run TestSprite MCP tests using public_pages_sanity_test_plan.json"

2. **Missing Test Plan Reference**:
   - ❌ "Test the homepage"
   - ✅ "Use TestSprite MCP to test homepage using testsprite_tests/public_pages_sanity_test_plan.json"

3. **MCP Server Not Active**:
   - Check if TestSprite MCP server shows green dot in Cursor AI
   - If red/gray, MCP server is offline

4. **Context Not Clear**:
   - Cursor AI needs to understand you want to use TestSprite MCP
   - Mention "TestSprite" or "MCP" explicitly

## 📋 **Best Practice: Complete Prompt Template**

Use this template when asking Cursor AI to run tests:

```
Use the TestSprite MCP server to run public pages sanity tests.

Test Plan: testsprite_tests/public_pages_sanity_test_plan.json

Test Scope:
- Homepage (/)
- Events listing (/events)
- Gallery (/gallery)
- About (via dropdown menu)
- Contact (/contact)
- Polls (/polls)
- Calendar (/calendar)
- Pricing (/pricing)

Verification:
- Pages load without errors (HTTP 200, no console errors)
- Main components are visible
- Navigation menu is present

Do NOT test:
- Admin pages (/admin/*)
- Login/signup pages
- Complex interactions

Execute the tests and provide results.
```

## 🔧 **Troubleshooting**

### **If Cursor AI Still Doesn't Trigger Tests:**

1. **Check MCP Server Status**:
   ```
   "What MCP servers are available?"
   "Is TestSprite MCP server active?"
   ```

2. **Explicitly Request MCP Tool**:
   ```
   "Use the mcp_TestSprite_testsprite_generate_code_and_execute tool to run tests"
   ```

3. **Provide Full Context**:
   ```
   "I want to run automated browser tests using TestSprite MCP.
   The test plan is at testsprite_tests/public_pages_sanity_test_plan.json.
   Please use the TestSprite MCP server to execute these tests."
   ```

4. **Fallback: Manual Execution**:
   If Cursor AI still doesn't trigger, run manually:
   ```bash
   node E:\.npm-cache\_npx\8ddf6bea01b2519d\node_modules\@testsprite\testsprite-mcp\dist\index.js generateCodeAndExecute
   ```

## 📝 **Updated Test Plan**

The test plan has been updated to handle the About dropdown menu:

- **PUBLIC-004**: Now includes steps to:
  1. Navigate to homepage
  2. Hover over "About" menu item
  3. Wait for dropdown to appear
  4. Click on "About Us" submenu item
  5. Verify page loads correctly

This fixes the test failure where clicking "About" opened a dropdown instead of navigating directly.

## 🎯 **Summary**

**To trigger tests from Cursor AI:**
1. ✅ Be explicit: Mention "TestSprite MCP"
2. ✅ Reference test plan: Include file path
3. ✅ Provide context: What to test, what not to test
4. ✅ Use complete prompt: Follow the template above

**If tests don't trigger:**
1. Check MCP server status (green dot)
2. Use explicit MCP tool names
3. Provide full command as fallback
4. Run manually if needed

