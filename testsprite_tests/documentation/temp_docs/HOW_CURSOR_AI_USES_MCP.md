# How Cursor AI Knows to Use TestSprite MCP Server

## 🔍 Understanding MCP (Model Context Protocol)

**MCP (Model Context Protocol)** is a protocol that allows AI assistants (like Cursor AI) to connect to external tools and services. When you ask Cursor AI to run tests, it automatically detects and uses available MCP servers.

## 🎯 How Cursor AI Detects MCP Servers

### 1. **MCP Server Configuration**

Cursor AI reads MCP server configurations from your `mcp.json` file (usually in your Cursor settings). The TestSprite MCP server is configured there.

**Example MCP Configuration:**
```json
{
  "mcpServers": {
    "testsprite": {
      "command": "npx",
      "args": ["-y", "@testsprite/testsprite-mcp"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### 2. **Available Tools Detection**

When you send a message to Cursor AI, it:
1. ✅ **Scans available MCP servers** - Checks which MCP servers are connected (green dot = active)
2. ✅ **Lists available tools** - Each MCP server exposes tools (like `testsprite_bootstrap_tests`, `testsprite_generate_code_and_execute`)
3. ✅ **Matches intent to tools** - Analyzes your prompt to find relevant tools

### 3. **Intent Matching**

When you say:
```
"Run public pages sanity tests..."
```

Cursor AI analyzes this and recognizes:
- **Keywords**: "run", "test", "sanity", "pages"
- **Context**: Testing-related request
- **Available Tools**: Finds `testsprite_generate_code_and_execute` tool
- **Action**: Automatically uses the TestSprite MCP tool

## 🔧 How It Works Behind the Scenes

### Step-by-Step Process

1. **Your Prompt**:
   ```
   "Run public pages sanity tests..."
   ```

2. **Cursor AI Analysis**:
   - Detects testing-related keywords
   - Checks available MCP tools
   - Finds `mcp_TestSprite_testsprite_generate_code_and_execute`

3. **Tool Selection**:
   - Cursor AI sees the TestSprite MCP server is available (green dot)
   - Identifies the appropriate tool for testing
   - Prepares tool call with your instructions

4. **Tool Execution**:
   - Calls `testsprite_bootstrap_tests` first (if needed)
   - Calls `testsprite_generate_code_and_execute` with your instructions
   - TestSprite MCP executes tests via cloud service

5. **Results Returned**:
   - Test results come back through MCP
   - Cursor AI processes and displays results
   - HTML report generated in `testsprite_tests/tmp/`

## 📋 MCP Tool Naming Convention

TestSprite MCP tools follow this pattern:
- `mcp_TestSprite_testsprite_{action}`

Examples:
- `mcp_TestSprite_testsprite_bootstrap_tests` - Initialize testing
- `mcp_TestSprite_testsprite_generate_code_and_execute` - Run tests
- `mcp_TestSprite_testsprite_generate_code_summary` - Generate code summary
- `mcp_TestSprite_testsprite_generate_frontend_test_plan` - Create test plan

## 🎯 What Makes Cursor AI Choose TestSprite MCP?

### Trigger Keywords

When you use these keywords, Cursor AI is more likely to use TestSprite MCP:

| Keyword Category | Examples |
|-----------------|----------|
| **Testing** | "test", "testing", "run tests", "execute tests" |
| **Pages/URLs** | "test pages", "test homepage", "test /events" |
| **Verification** | "verify", "check", "validate", "sanity check" |
| **TestSprite** | "testsprite", "test sprite", "MCP test" |

### Explicit Instructions

You can also be explicit:
```
"Use TestSprite MCP to run tests..."
"Run tests using TestSprite..."
"Execute TestSprite tests..."
```

## 🔍 How to Verify MCP is Working

### Check MCP Server Status

1. **In Cursor AI Chat**:
   - Look for MCP server indicators
   - Green dot = MCP server is active
   - Red/gray dot = MCP server is offline

2. **Check Available Tools**:
   - Cursor AI automatically lists available tools
   - TestSprite tools appear as `testsprite_*` functions

3. **Test Connection**:
   ```
   "What MCP servers are available?"
   "List TestSprite tools"
   ```

## 💡 Best Practices

### 1. **Be Specific About Testing**

**Good**:
```
"Run public pages sanity tests for homepage, events, gallery..."
```

**Better**:
```
"Use TestSprite MCP to run public pages sanity tests..."
```

### 2. **Include Test Scope**

Always specify:
- ✅ Which pages to test
- ✅ What to verify
- ✅ What NOT to test

### 3. **Reference Test Plans**

If you have saved test plans:
```
"Use the test plan at testsprite_tests/public_pages_sanity_test_plan.json"
```

## 🚫 When Cursor AI Won't Use MCP

Cursor AI will **NOT** use MCP if:

1. **MCP Server Offline**: TestSprite MCP server is not running (red/gray dot)
2. **No Matching Tools**: Your request doesn't match any available MCP tools
3. **Explicit Alternative**: You explicitly ask for a different tool (e.g., "use Playwright directly")
4. **Wrong Context**: Your request is not testing-related

## 🔄 Alternative: Direct Command Execution

If Cursor AI doesn't use MCP automatically, you can:

1. **Run Command Directly**:
   ```bash
   node E:\.npm-cache\_npx\8ddf6bea01b2519d\node_modules\@testsprite\testsprite-mcp\dist\index.js generateCodeAndExecute
   ```

2. **Explicitly Request MCP**:
   ```
   "Use the TestSprite MCP server to run tests..."
   ```

## 📚 Summary

**How Cursor AI Knows to Use TestSprite MCP:**

1. ✅ **MCP Configuration**: TestSprite MCP is configured in `mcp.json`
2. ✅ **Tool Detection**: Cursor AI scans available MCP tools
3. ✅ **Intent Matching**: Your prompt keywords match testing tools
4. ✅ **Automatic Selection**: Cursor AI chooses the appropriate tool
5. ✅ **Tool Execution**: TestSprite MCP runs tests via cloud service

**You don't need to explicitly say "use MCP"** - Cursor AI automatically detects and uses it when:
- Your request is testing-related
- TestSprite MCP server is available
- Your intent matches available tools

## 🎯 Quick Reference

**To Use TestSprite MCP:**
```
"Run public pages sanity tests..."
```

**To Check MCP Status:**
```
"What MCP servers are available?"
```

**To Force MCP Usage:**
```
"Use TestSprite MCP to run tests..."
```

**To Run Without MCP:**
```
"Run tests using Playwright directly..."
```

