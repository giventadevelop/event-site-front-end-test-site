# TestSprite MCP Troubleshooting Guide

## 🔴 Why TestSprite MCP Shows Red Dot in Cursor Settings

### **Understanding MCP Servers**

**Important**: MCP (Model Context Protocol) servers work **ONLY** within Cursor's AI context, **NOT** in Node.js scripts.

- ✅ **MCP servers work**: When you chat with AI in Cursor and ask it to run tests
- ❌ **MCP servers DON'T work**: When you run `node script.js` or `npm run test` from terminal

### **Why Your Script Shows "TestSprite MCP not available"**

When you run:
```bash
npm run test:comprehensive
# OR
node TestSprite/sanity-tests/run-comprehensive-sanity-tests-with-testsprite.js
```

The script runs in **Node.js**, not in Cursor's AI context. MCP servers are not accessible from Node.js scripts.

### **Solution: Use Playwright Directly**

The script now uses **Playwright** directly for browser automation, which works perfectly in Node.js scripts. The TestSprite API key from `.env.local` can be used for future TestSprite REST API integration.

## 🔧 Fixing the Red Dot in Cursor Settings

If TestSprite MCP shows a red dot (error) in Cursor settings:

### **1. Check Node.js Version**

TestSprite MCP requires **Node.js 22+**:

```bash
node --version
```

If version is below 22:
```bash
# Using nvm (recommended)
nvm install 22
nvm use 22

# Or download from nodejs.org
```

### **2. Verify TestSprite MCP Installation**

```bash
# Check if installed globally
npm list -g @testsprite/testsprite-mcp

# If not installed, install it
npm install -g @testsprite/testsprite-mcp@latest

# Test if it runs
npx @testsprite/testsprite-mcp@latest --version
```

### **3. Verify MCP Configuration**

Your `mcp.json` should look like:

```json
{
  "mcpServers": {
    "testsprite-mcp": {
      "command": "npx",
      "args": [
        "@testsprite/testsprite-mcp@latest"
      ],
      "env": {
        "API_KEY": "your-testsprite-api-key-here"
      }
    }
  }
}
```

### **4. Restart Cursor**

After making changes:
1. **Completely close Cursor** (not just reload)
2. **Restart Cursor**
3. Check MCP servers in Settings → MCP

### **5. Check MCP Server Logs**

In Cursor:
1. Open **Settings → MCP**
2. Click on TestSprite MCP server
3. Check for error messages
4. Look for connection issues

### **6. Test MCP Server Manually**

```bash
# Run MCP server directly to see errors
npx @testsprite/testsprite-mcp@latest

# Should show MCP server starting (not for direct use)
```

## 📝 Using TestSprite API Key in Node.js Scripts

### **Current Implementation**

The script now:
1. ✅ Loads `TESTSPRITE_KEY` from `.env.local`
2. ✅ Uses Playwright for browser automation (works in Node.js)
3. ✅ Can be extended to use TestSprite REST API if available

### **Add API Key to .env.local**

```bash
# Add to .env.local file
TESTSPRITE_KEY=your-testsprite-api-key-here
```

### **How It Works**

1. **Script loads `.env.local`** using `dotenv`
2. **Reads `TESTSPRITE_KEY`** from environment
3. **Uses Playwright** for browser testing (always works)
4. **Future**: Can call TestSprite REST API with the key

## 🎯 Summary

### **For Node.js Scripts (npm run test)**
- ✅ **Use Playwright** - Works perfectly in Node.js
- ✅ **Load API key from .env.local** - For future TestSprite API integration
- ❌ **Don't use MCP** - MCP servers don't work in Node.js scripts

### **For Cursor AI Chat**
- ✅ **Use MCP servers** - When chatting with AI in Cursor
- ✅ **AI can call TestSprite MCP** - For test generation and execution
- ❌ **Don't expect MCP in scripts** - Scripts run outside AI context

## 🔍 Verification

### **Check if API Key is Loaded**

When you run the test script, you should see:

```
🧪 Test Engine: Playwright (TestSprite API key found: sk-user-...)
```

If you see:

```
🧪 Test Engine: Playwright (TestSprite API key not found in .env.local)
```

Then add `TESTSPRITE_KEY` to your `.env.local` file.

### **Test Playwright Installation**

```bash
# Check if Playwright is installed
npm list playwright

# Install if missing
npm install --save-dev playwright

# Install browsers
npx playwright install chromium
```

## 🚀 Running Tests

```bash
# This will use Playwright (works in Node.js)
npm run test:comprehensive

# Script will:
# 1. Load TESTSPRITE_KEY from .env.local (if available)
# 2. Use Playwright for browser automation
# 3. Execute all 45+ test scenarios
# 4. Generate HTML report
```

## 📚 Additional Resources

- [TestSprite Documentation](https://docs.testsprite.com)
- [Playwright Documentation](https://playwright.dev)
- [MCP Protocol Documentation](https://modelcontextprotocol.io)

---

**Key Takeaway**: MCP servers are for Cursor AI, Playwright is for Node.js scripts. Both can work together! 🎉



