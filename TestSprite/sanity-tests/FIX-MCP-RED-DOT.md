# Fix TestSprite MCP Red Dot - Step by Step

## 🔴 **Problem**

TestSprite MCP shows **red dot (error)** on this machine, but works fine on another machine with the same API key and settings.

## ✅ **Root Causes Found**

### **1. Node.js Version Too Old** ⚠️ **CRITICAL**

**Your Current:** `v20.18.1`
**Required:** `v22.0.0 or higher`

TestSprite MCP requires Node.js 22+. This is the **#1 reason** it works on the other machine but not here.

### **2. MCP Config Format Issue**

**Current (Wrong):**
```json
"TestSprite": {
  "command": "npx @testsprite/testsprite-mcp@latest",
  "args": []
}
```

**Fixed (Correct):**
```json
"testsprite-mcp": {
  "command": "npx",
  "args": ["@testsprite/testsprite-mcp@latest"]
}
```

### **3. npm/npx Cache Corruption**

Module resolution errors suggest corrupted cache.

## 🚀 **Fix Steps (In Order)**

### **Step 1: Update Node.js to Version 22+** ⚠️ **MOST IMPORTANT**

```bash
# Check current version
node --version
# Output: v20.18.1 (too old!)

# Option A: Using nvm (if installed)
nvm install 22
nvm use 22

# Option B: Download from nodejs.org
# Visit: https://nodejs.org/
# Download: Node.js 22 LTS
# Install and restart terminal

# Verify after update
node --version
# Should show: v22.x.x or higher
```

**Why this matters:** TestSprite MCP won't start with Node.js 20. The other machine likely has Node.js 22+.

### **Step 2: Clear npm/npx Cache**

```bash
# Clear npm cache
npm cache clean --force

# Clear npx cache (Windows PowerShell)
Remove-Item -Recurse -Force "$env:APPDATA\npm-cache\_npx" -ErrorAction SilentlyContinue

# Clear npx cache (Command Prompt)
rmdir /s /q %APPDATA%\npm-cache\_npx
```

### **Step 3: Fix MCP Configuration**

**File:** `c:\Users\gain\.cursor\mcp.json`

**Changed:**
- Server name: `"TestSprite"` → `"testsprite-mcp"` (matches working machine)
- Command format: Split into `command` + `args` array
- Removed empty `args: []`

**New config:**
```json
{
  "mcpServers": {
    "byterover-mcp": {
      "url": "https://mcp.byterover.dev/mcp?machineId=1f08f082-2a1b-6a20-aa0d-05863159a8d6"
    },
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

### **Step 4: Install TestSprite MCP Globally**

```bash
npm install -g @testsprite/testsprite-mcp@latest
```

### **Step 5: Test TestSprite MCP**

```bash
# Test if it runs (after Node.js 22+ update)
npx @testsprite/testsprite-mcp@latest --version
```

**Expected:** Should show version number (not error)

### **Step 6: Restart Cursor Completely**

1. **Close Cursor completely** (not just reload window)
2. **Wait 5 seconds**
3. **Restart Cursor**
4. **Go to Settings → MCP**
5. **Check TestSprite** - should show **green dot** ✅

## 🔍 **Why It Works on Other Machine**

The other machine likely has:
- ✅ **Node.js 22+** (most important!)
- ✅ **Clean npm cache**
- ✅ **Correct MCP config format**
- ✅ **TestSprite MCP installed globally**

## 📊 **Quick Diagnostic**

Run these commands to check:

```bash
# 1. Node.js version (MUST be 22+)
node --version

# 2. npm version
npm --version

# 3. Check TestSprite MCP installation
npm list -g @testsprite/testsprite-mcp

# 4. Test TestSprite MCP directly
npx @testsprite/testsprite-mcp@latest --version
```

## 🎯 **Expected Results**

### **Before Fix:**
- ❌ Node.js v20.18.1
- ❌ Red dot in Cursor
- ❌ Error: "Cannot find package 'punycode.js'"
- ❌ MCP config format wrong

### **After Fix:**
- ✅ Node.js v22+
- ✅ Green dot in Cursor
- ✅ TestSprite MCP running
- ✅ MCP config correct

## ⚡ **Quick Fix (If You Can't Update Node.js Right Now)**

If you can't update Node.js immediately, you can:

1. **Use Playwright in scripts** (already working)
2. **Fix MCP config** (done above)
3. **Update Node.js later** for MCP to work

The scripts will work fine with Playwright, but MCP won't work until Node.js is updated.

## 📝 **Summary**

**Priority Order:**
1. ✅ **Update Node.js to 22+** (CRITICAL - this is why it works on other machine)
2. ✅ **Fix MCP config** (done above)
3. ✅ **Clear npm cache** (done above)
4. ✅ **Restart Cursor** (after Node.js update)

**The #1 issue is Node.js version.** Once you update to Node.js 22+, the red dot should turn green! 🎉



