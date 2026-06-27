# Test Duration & TestSprite MCP Usage Guide

## ⏱️ **How Long Does `npm run test:comprehensive` Take?**

### **Expected Duration: 15-20 minutes** ⏱️

**Breakdown:**
- **Total Test Scenarios**: 45 tests
- **Timeout per Test**: 30 seconds
- **Retries**: 1 retry per failed test
- **Expected Duration**: 15-20 minutes

### **Time Calculation:**

```
45 tests × ~20 seconds average = ~15 minutes
+ Retries (if any) = +2-5 minutes
+ Report generation = +1 minute
= Total: ~15-20 minutes
```

### **Factors Affecting Duration:**

| Factor | Impact |
|--------|--------|
| **Page Load Speed** | Faster pages = shorter tests |
| **Network Speed** | Faster network = shorter tests |
| **Test Failures** | Retries add time |
| **Screenshot Capture** | Adds ~1-2 seconds per failure |
| **System Resources** | Slower system = longer tests |

### **What Happens During Execution:**

1. **Test Execution** (15-18 minutes)
   - Each test navigates to a page
   - Waits for elements to load
   - Validates page structure
   - Checks for JavaScript errors
   - Captures screenshots on failure

2. **Report Generation** (1-2 minutes)
   - Creates HTML report
   - Generates summary statistics
   - Saves screenshots

3. **Total Time**: ~15-20 minutes

### **Progress Indicators:**

The script shows:
```
🧪 [sanity-001] Running: Homepage Load Test
   ✅ PASSED: 2.5s

🧪 [sanity-002] Running: Events Listing Page Test
   ✅ PASSED: 3.1s

...

📊 Test Summary:
   Total: 45 | Passed: 42 | Failed: 3 | Skipped: 0
   Success Rate: 93.3%
   Duration: 18m 32s
```

## 🎯 **How to Run TestSprite Commands from Cursor AI Chat**

### **Understanding TestSprite MCP**

TestSprite MCP is **only available in Cursor's AI chat**, not in Node.js scripts. You interact with it through **natural language** in Cursor's AI chat.

### **Step 1: Ensure TestSprite MCP is Configured**

1. **Check MCP Settings:**
   - Open Cursor
   - Go to **Settings → MCP**
   - Verify **TestSprite MCP** shows **green dot** ✅
   - If red dot, see troubleshooting guide

2. **Verify Configuration:**
   ```json
   // c:\Users\gain\.cursor\mcp.json
   {
     "mcpServers": {
       "testsprite-mcp": {
         "command": "npx",
         "args": ["@testsprite/testsprite-mcp@latest"],
         "env": {
           "API_KEY": "your-testsprite-api-key-here"
         }
       }
     }
   }
   ```

### **Step 2: Use Natural Language in Cursor AI Chat**

Simply **ask the AI** to run tests using natural language:

#### **Example Commands:**

1. **Basic Test Request:**
   ```
   Run tests for the homepage
   ```

2. **Specific Page Test:**
   ```
   Test the events page at http://localhost:3000/events
   ```

3. **Multiple Pages:**
   ```
   Test the homepage, events page, and admin dashboard
   ```

4. **Admin Pages:**
   ```
   Test all admin pages for the application
   ```

5. **Custom Test:**
   ```
   Create a test that checks if the sign-in form loads correctly
   ```

6. **Comprehensive Testing:**
   ```
   Run comprehensive sanity tests for all pages
   ```

### **Step 3: AI Uses TestSprite MCP Tools**

When you ask the AI to run tests, it will:
1. ✅ **Use TestSprite MCP tools** (if available)
2. ✅ **Generate test code** if needed
3. ✅ **Execute tests** via TestSprite cloud
4. ✅ **Report results** back to you

### **Example Conversation:**

**You:**
```
Test the homepage at http://localhost:3000/
```

**AI (using TestSprite MCP):**
```
I'll test the homepage for you using TestSprite.

[AI uses TestSprite MCP tools]
- Navigating to http://localhost:3000/
- Checking for required elements
- Validating page structure
- Checking for JavaScript errors

✅ Test Results:
- Page loads successfully
- Navigation menu visible
- Main content present
- No JavaScript errors
- All required elements found
```

### **Available TestSprite MCP Commands (via AI):**

The AI can use TestSprite MCP to:

1. **Run Page Tests:**
   - Test specific URLs
   - Validate page structure
   - Check for errors

2. **Generate Tests:**
   - Create test scenarios
   - Write test code
   - Define test cases

3. **Analyze Results:**
   - Review test results
   - Identify issues
   - Suggest fixes

4. **Custom Testing:**
   - Test specific features
   - Validate user flows
   - Check accessibility

### **Limitations:**

⚠️ **TestSprite MCP:**
- ✅ Works in Cursor AI chat
- ❌ Does NOT work in Node.js scripts (`npm run test`)
- ❌ Does NOT have REST API
- ✅ Requires MCP server to be running (green dot)

⚠️ **For Node.js Scripts:**
- ✅ Use Playwright (current implementation)
- ✅ Run `npm run test:comprehensive`
- ❌ Cannot use TestSprite MCP directly

## 📊 **Comparison: TestSprite MCP vs npm run test**

| Aspect | TestSprite MCP (AI Chat) | `npm run test:comprehensive` |
|--------|---------------------------|------------------------------|
| **How to Use** | Ask AI in Cursor chat | Run command in terminal |
| **Execution** | Cloud-based (TestSprite) | Local (Playwright) |
| **Duration** | Varies (cloud speed) | 15-20 minutes |
| **Setup** | MCP server configured | Playwright installed |
| **Test Count** | Custom (AI decides) | 45 predefined tests |
| **Reports** | AI summarizes | HTML report generated |
| **CI/CD** | ❌ Not available | ✅ Works in CI/CD |

## 🎯 **Best Practices**

### **Use TestSprite MCP When:**
- ✅ **Quick ad-hoc testing** - "Test this page"
- ✅ **AI-assisted testing** - Let AI create tests
- ✅ **Interactive testing** - Ask questions about results
- ✅ **Custom scenarios** - Test specific features

### **Use `npm run test:comprehensive` When:**
- ✅ **Comprehensive testing** - All 45 scenarios
- ✅ **Automated testing** - CI/CD pipelines
- ✅ **Scheduled testing** - Regular test runs
- ✅ **Detailed reports** - HTML reports with screenshots

## 📝 **Quick Reference**

### **Run Comprehensive Tests (Node.js):**
```bash
npm run test:comprehensive
# Duration: 15-20 minutes
# Uses: Playwright
# Output: HTML report
```

### **Run Tests via AI Chat:**
```
Ask AI: "Test the homepage"
# Duration: Varies
# Uses: TestSprite MCP
# Output: AI summary
```

## 🚀 **Summary**

### **Test Duration:**
- **`npm run test:comprehensive`**: **15-20 minutes** ⏱️
- **45 test scenarios** covering all pages
- **HTML report** generated automatically

### **TestSprite MCP Usage:**
- **Available in Cursor AI chat** only
- **Use natural language** to request tests
- **AI uses MCP tools** to execute tests
- **Cloud-based execution** via TestSprite

### **Both Methods:**
- ✅ **TestSprite MCP**: Quick, AI-assisted, interactive
- ✅ **npm run test**: Comprehensive, automated, detailed reports

**Use both for complete testing coverage!** 🎯

