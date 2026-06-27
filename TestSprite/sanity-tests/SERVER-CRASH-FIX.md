# Server Crash Fix - Tailwind Config and Connection Errors

## 🎯 **Problem**

When running Playwright tests, the server was crashing with:
```
ReferenceError: module is not defined
    at file:///E:/project_workspace/mosc-temp/tailwind.config.js:2:1
```

This caused:
- `ERR_CONNECTION_RESET` errors
- `ERR_CONNECTION_REFUSED` errors
- Server crashes during page compilation

## ✅ **Root Cause**

The project has `"type": "module"` in `package.json`, which means all `.js` files are treated as ES modules. However, `tailwind.config.js` was using CommonJS syntax (`module.exports` and `require()`), causing a conflict.

## 🔧 **Solution**

### **1. Fixed `tailwind.config.js`**

Converted from CommonJS to ES module syntax:

**Before:**
```javascript
module.exports = {
  // ...
  plugins: [require("tailwindcss-animate")],
}
```

**After:**
```javascript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default {
  // ...
  plugins: [require("tailwindcss-animate")],
}
```

### **2. Added Test Delays**

Added 500ms delay between tests to prevent overwhelming the server:
```javascript
// Add small delay between tests to prevent overwhelming the server
if (test.id !== 'sanity-001') {
  await new Promise(resolve => setTimeout(resolve, 500));
}
```

### **3. Added Connection Error Retry Logic**

Added retry logic for connection errors (server might be compiling):
```javascript
try {
  response = await page.goto(testUrl, {
    waitUntil: 'domcontentloaded',
    timeout: config.timeout
  });
} catch (navigationError) {
  if (navigationError.message.includes('ERR_CONNECTION_RESET') ||
      navigationError.message.includes('ERR_CONNECTION_REFUSED')) {
    // Wait 2 seconds and retry
    await new Promise(resolve => setTimeout(resolve, 2000));
    response = await page.goto(testUrl, { ... });
  }
}
```

### **4. Improved Navigation Strategy**

Changed from `networkidle` to `domcontentloaded` first, then wait for `networkidle`:
- Faster initial page load
- Gives Next.js time to compile pages
- More resilient to compilation delays

## 📋 **Changes Made**

1. ✅ **`tailwind.config.js`** - Converted to ES module syntax
2. ✅ **Test script** - Added delays between tests
3. ✅ **Test script** - Added connection error retry logic
4. ✅ **Test script** - Improved navigation strategy

## 🧪 **Testing**

After these fixes:

1. **Restart dev server** (required):
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Run tests**:
   ```bash
   npm run test:comprehensive
   ```

## ✅ **Expected Results**

- ✅ **No more `module is not defined` errors**
- ✅ **No more connection reset/refused errors**
- ✅ **Server stays running during tests**
- ✅ **Pages compile successfully**

## 🔍 **Why This Works**

1. **ES Module Compatibility**: `createRequire` allows using `require()` in ES modules
2. **Test Delays**: Prevents overwhelming the server with rapid requests
3. **Retry Logic**: Handles temporary connection issues during compilation
4. **Better Navigation**: `domcontentloaded` is faster and more reliable than `networkidle` alone

## ⚠️ **Important Notes**

- **Server must be running** before tests start
- **First page load may be slower** (Next.js compilation)
- **Subsequent loads are faster** (cached compilation)
- **Connection errors are retried once** automatically

---

**Status:** ✅ **Fixed!** Server should no longer crash during tests.

