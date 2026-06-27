# Fixing TestSprite MCP Red Dot Error

## 🔴 **Problem: Red Dot in Cursor Settings**

TestSprite MCP shows a **red dot (error)** on this machine, but works fine on another machine with the same API key and settings.

## 🔍 **Root Causes Identified**

### **1. Node.js Version Issue** ⚠️ **CRITICAL**

**Current Node.js Version:** `v20.18.1`
**Required:** `Node.js 22+`

TestSprite MCP requires Node.js 22 or higher. Your current version (20.18.1) is too old.

**Check version:**
```bash
node --version
```

**Fix:**
```bash
# Using nvm (recommended)
nvm install 22
nvm use 22

# Or download from nodejs.org
# https://nodejs.org/
```

### **2. Module Resolution Error**

**Error:**
```
Error: Cannot find package 'punycode.js' imported from markdown-it
```

This is a dependency resolution issue, often caused by:
- Corrupted npm cache
- Node.js version mismatch
- npm/npx cache issues

**Fix:**
```bash
# Clear npm cache
npm cache clean --force

# Clear npx cache
rm -rf ~/.npm/_npx  # Linux/Mac
# OR
rmdir /s /q %APPDATA%\npm-cache\_npx  # Windows PowerShell
```

### **3. TestSprite MCP Not Installed Globally**

**Check:**
```bash
npm list -g @testsprite/testsprite-mcp
```

**Fix:**
```bash
npm install -g @testsprite/testsprite-mcp@latest
```

### **4. MCP Configuration Differences**

**Current config:**
```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx @testsprite/testsprite-mcp@latest",
      "env": {
        "API_KEY": "your-testsprite-api-key-here"
      },
      "args": []
    }
  }
}
```

**Alternative config (if above doesn't work):**
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

## ✅ **Step-by-Step Fix**

### **Step 1: Update Node.js to Version 22+**

```bash
# Check current version
node --version

# If below 22, update:
# Option A: Using nvm (recommended)
nvm install 22
nvm use 22

# Option B: Download from nodejs.org
# Visit: https://nodejs.org/
# Download and install Node.js 22 LTS
```

### **Step 2: Clear npm/npx Cache**

```bash
# Clear npm cache
npm cache clean --force

# Clear npx cache (Windows PowerShell)
Remove-Item -Recurse -Force "$env:APPDATA\npm-cache\_npx"

# Clear npx cache (Linux/Mac)
rm -rf ~/.npm/_npx
```

### **Step 3: Install TestSprite MCP Globally**

```bash
npm install -g @testsprite/testsprite-mcp@latest
```

### **Step 4: Verify Installation**

```bash
# Check if installed
npm list -g @testsprite/testsprite-mcp

# Test if it runs
npx @testsprite/testsprite-mcp@latest --version
```

### **Step 5: Update MCP Configuration**

**File:** `c:\Users\gain\.cursor\mcp.json`

**Option A (Current - try this first):**
```json
{
  "mcpServers": {
    "TestSprite": {
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

**Option B (Alternative):**
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

### **Step 6: Restart Cursor Completely**

1. **Close Cursor completely** (not just reload)
2. **Restart Cursor**
3. **Check MCP servers** in Settings → MCP
4. **Look for TestSprite** - should show green dot

## 🔍 **Why It Works on Another Machine**

The other machine likely has:
- ✅ Node.js 22+ installed
- ✅ Clean npm/npx cache
- ✅ TestSprite MCP installed globally
- ✅ Proper MCP configuration

## 🎯 **Quick Diagnostic Commands**

Run these to diagnose:

```bash
# 1. Check Node.js version
node --version
# Should be: v22.x.x or higher

# 2. Check npm version
npm --version

# 3. Check if TestSprite MCP is installed
npm list -g @testsprite/testsprite-mcp

# 4. Test TestSprite MCP directly
npx @testsprite/testsprite-mcp@latest --version

# 5. Check MCP config file
cat c:\Users\gain\.cursor\mcp.json  # Linux/Mac
type c:\Users\gain\.cursor\mcp.json  # Windows
```

## 📝 **Expected Results After Fix**

### **Before Fix:**
- ❌ Red dot in Cursor settings
- ❌ Error: "Cannot find package 'punycode.js'"
- ❌ Node.js v20.18.1 (too old)

### **After Fix:**
- ✅ Green dot in Cursor settings
- ✅ TestSprite MCP running successfully
- ✅ Node.js v22+ installed
- ✅ TestSprite MCP accessible in Cursor AI

## 🚨 **Most Likely Fix**

**The #1 issue is Node.js version.** Update to Node.js 22+:

```bash
# Using nvm
nvm install 22
nvm use 22

# Verify
node --version  # Should show v22.x.x
```

Then restart Cursor completely.

## 📚 **Additional Resources**

- [Node.js Download](https://nodejs.org/)
- [nvm Installation](https://github.com/nvm-sh/nvm)
- [TestSprite MCP Documentation](https://docs.testsprite.com)

---

**Priority Fix Order:**
1. ✅ Update Node.js to 22+ (CRITICAL)
2. ✅ Clear npm/npx cache
3. ✅ Install TestSprite MCP globally
4. ✅ Update MCP config
5. ✅ Restart Cursor completely



