# Fix MCP Servers After Node.js Upgrade

## ✅ **Node.js 24 is Perfect!**

You installed Node.js 24.12.0 - this is **even better** than Node.js 22! ✅
- Node.js 24 is fully compatible with your app
- TestSprite MCP supports Node.js 22+ (24 is fine)
- All your dependencies work with Node.js 24

## 🔴 **Problem: Corrupted npx Cache**

After upgrading Node.js, the **npx cache gets corrupted**. This causes:
- ❌ TestSprite MCP can't start
- ❌ ByteRover MCP might have issues
- ❌ Error: `Cannot find package 'punycode.js'`

## 🛠️ **Solution Steps**

### **Step 1: Clear npx Cache** ✅ (Already done)

```powershell
# Clear npx cache
Remove-Item -Recurse -Force "$env:APPDATA\npm-cache\_npx" -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force
```

### **Step 2: Restart Machine** ⚠️ **REQUIRED**

**Why restart?**
- Windows needs to refresh PATH environment variables
- Cursor needs to pick up the new Node.js installation
- MCP servers need fresh environment

**Action:**
1. **Save all your work**
2. **Restart your computer** (not just Cursor)
3. **Wait for full restart**
4. **Open Cursor again**

### **Step 3: Verify After Restart**

After restarting, verify:

```powershell
# Check Node.js version
node --version
# Should show: v24.12.0

# Check npx works
npx --version
# Should show: 11.0.0

# Test TestSprite MCP can load
npx @testsprite/testsprite-mcp@latest --help
# Should work without errors
```

### **Step 4: Check Cursor MCP Settings**

After restart:
1. Open Cursor
2. Go to **Settings → MCP**
3. Check both servers:
   - **ByteRover**: Should show green dot ✅
   - **TestSprite**: Should show green dot ✅

## 🔧 **Alternative: Use Full Node.js Path (If Still Failing)**

If MCP servers still fail after restart, update `mcp.json` to use full Node.js path:

**Current config:**
```json
{
  "mcpServers": {
    "testsprite-mcp": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"]
    }
  }
}
```

**Updated config (if needed):**
```json
{
  "mcpServers": {
    "testsprite-mcp": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npx-cli.js",
        "@testsprite/testsprite-mcp@latest"
      ],
      "env": {
        "API_KEY": "your-testsprite-api-key-here"
      }
    }
  }
}
```

**Note:** Try restart first - this is usually not needed!

## 📋 **Troubleshooting Checklist**

After restart, if MCP servers still show red dot:

- [ ] **Node.js version correct?** (`node --version` shows v24.12.0)
- [ ] **npx works?** (`npx --version` shows 11.0.0)
- [ ] **npx cache cleared?** (Already done ✅)
- [ ] **Machine restarted?** (Required ⚠️)
- [ ] **Cursor restarted after machine restart?**
- [ ] **MCP config correct?** (Check `mcp.json`)
- [ ] **API key correct?** (TestSprite key is valid)

## 🎯 **Why Restart is Required**

1. **PATH Environment Variable**: Windows caches PATH. Restart refreshes it.
2. **Cursor Process**: Cursor needs to reload environment variables.
3. **MCP Server Process**: MCP servers spawn new processes that need fresh PATH.
4. **Node.js Installation**: System needs to recognize new Node.js location.

## ✅ **Expected Result After Restart**

1. ✅ Node.js 24.12.0 detected
2. ✅ npx cache cleared and working
3. ✅ TestSprite MCP shows green dot
4. ✅ ByteRover MCP shows green dot
5. ✅ Both MCP servers functional

## 🚨 **If Still Failing After Restart**

1. **Check Cursor logs:**
   - Help → Toggle Developer Tools
   - Check Console for MCP errors

2. **Verify Node.js installation:**
   ```powershell
   node --version
   npm --version
   npx --version
   ```

3. **Test MCP manually:**
   ```powershell
   npx @testsprite/testsprite-mcp@latest --help
   ```

4. **Reinstall TestSprite MCP:**
   ```powershell
   npm uninstall -g @testsprite/testsprite-mcp
   npx @testsprite/testsprite-mcp@latest --help
   ```

## 📝 **Summary**

**What you did:**
- ✅ Installed Node.js 24 (perfect!)
- ✅ Cleared npx cache
- ✅ Cleared npm cache

**What you need to do:**
- ⚠️ **RESTART YOUR COMPUTER** (required!)
- ⚠️ **Restart Cursor after machine restart**
- ✅ Check MCP servers show green dots

**Why restart is needed:**
- Windows PATH caching
- Cursor environment refresh
- MCP server process initialization

---

**Bottom Line:** Node.js 24 is perfect! Just restart your machine and everything should work! 🚀

