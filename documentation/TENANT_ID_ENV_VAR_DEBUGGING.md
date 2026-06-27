# Tenant ID Environment Variable Not Being Read - Debugging Guide

## 🔍 Current Configuration

Your `.env.local` file contains:
```
NEXT_PUBLIC_TENANT_ID=tenant_demo_002
AMPLIFY_NEXT_PUBLIC_TENANT_ID=tenant_demo_002
#NEXT_PUBLIC_TENANT_ID=tenant_demo_002  (commented out)
```

## ⚠️ Why It Might Not Be Working

### **1. Next.js Dev Server Needs Restart** ⚠️ **MOST LIKELY**

**Problem**: Next.js loads environment variables **only at startup**. Changes to `.env.local` are **NOT** picked up automatically.

**Solution**:
```bash
# Stop your dev server (Ctrl+C)
# Then restart it
npm run dev
# or
yarn dev
```

**Why**: Next.js reads `.env.local` when the server starts, not on every request. This is different from some frameworks that reload env vars dynamically.

---

### **2. Environment Variable Priority**

**How the code reads it** (`src/lib/env.ts`):
```typescript
export function getTenantId() {
  const tenantId =
    process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ||  // Checks this FIRST
    process.env.NEXT_PUBLIC_TENANT_ID;            // Falls back to this
  return tenantId;
}
```

**Priority Order**:
1. ✅ `AMPLIFY_NEXT_PUBLIC_TENANT_ID` (checked first)
2. ✅ `NEXT_PUBLIC_TENANT_ID` (fallback)

Since both are set to `tenant_demo_002`, it should work.

---

### **3. Next.js Config Declaration**

**Status**: ✅ **VERIFIED** - The env var IS declared in `next.config.mjs` (line 159):
```javascript
env: {
  NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID,
  // ...
}
```

This is **required** for environment variables to be available at runtime in Next.js.

---

### **4. Server vs Client Context**

**Important**: `NEXT_PUBLIC_*` variables are available on both server and client.

**Server-side** (`src/app/layout.tsx`):
```typescript
const tenantId = getTenantId(); // ✅ Should work
```

**Client-side** (browser):
```typescript
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID; // ✅ Should work
```

---

## 🔧 How to Debug

### **Step 1: Verify Environment Variable is Loaded**

Add temporary logging in `src/app/layout.tsx`:

```typescript
// Around line 99 in src/app/layout.tsx
const tenantId = getTenantId();
console.log('[Layout] Tenant ID Debug:', {
  tenantId,
  AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID,
  NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID,
  NODE_ENV: process.env.NODE_ENV,
});
```

**Check your server console** (not browser console) for this log.

---

### **Step 2: Check Network Request**

1. Open browser DevTools → Network tab
2. Look for request: `/api/proxy/user-profiles?userId.equals=...&tenantId.equals=...`
3. Check what `tenantId.equals` value is being sent

**Expected**: `tenantId.equals=tenant_demo_002`

---

### **Step 3: Verify Database Query**

Check your server logs for:
```
[Layout] Found existing profile. Admin status: true/false
```

This log shows:
- Whether the query succeeded
- What tenant ID was used
- What userRole was found

---

## 🎯 Most Common Issues

### **Issue 1: Dev Server Not Restarted**

**Symptom**: Changed `.env.local` but changes not reflected

**Fix**:
```bash
# Stop server (Ctrl+C)
npm run dev  # Restart
```

---

### **Issue 2: Multiple .env Files**

**Problem**: Next.js loads env files in this order:
1. `.env.local` (highest priority)
2. `.env.development` or `.env.production`
3. `.env`

**Check**: Make sure you don't have conflicting values in other `.env` files:
```bash
# Check all .env files
ls -la .env*
```

---

### **Issue 3: Cached Build**

**Problem**: Next.js might cache environment variables from previous builds.

**Fix**:
```bash
# Clear Next.js cache
rm -rf .next
# Restart dev server
npm run dev
```

---

### **Issue 4: Production vs Development**

**Problem**: In production (AWS Amplify), environment variables are set in the AWS console, not `.env.local`.

**Local Development**: Uses `.env.local`
**Production**: Uses AWS Amplify environment variables (with `AMPLIFY_` prefix)

---

## ✅ Verification Checklist

- [ ] **Restarted dev server** after changing `.env.local`
- [ ] **Verified** `.env.local` has correct value: `NEXT_PUBLIC_TENANT_ID=tenant_demo_002`
- [ ] **Checked** no conflicting values in other `.env` files
- [ ] **Verified** `next.config.mjs` declares the env var (line 159)
- [ ] **Checked server console** for tenant ID debug logs
- [ ] **Checked Network tab** to see what tenantId is sent in API requests
- [ ] **Cleared `.next` cache** if still not working

---

## 🚀 Quick Fix Steps

1. **Stop your dev server** (Ctrl+C)

2. **Verify `.env.local`**:
   ```bash
   cat .env.local | grep TENANT
   ```
   Should show: `NEXT_PUBLIC_TENANT_ID=tenant_demo_002`

3. **Clear Next.js cache** (optional but recommended):
   ```bash
   rm -rf .next
   ```

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

5. **Check server console** for logs:
   ```
   [Layout] Found existing profile. Admin status: true
   ```

6. **Check browser Network tab**:
   - Look for `/api/proxy/user-profiles` request
   - Verify `tenantId.equals=tenant_demo_002` in query params

---

## 📊 Expected Behavior

**If tenant ID is correctly loaded**:

1. **Server Console** should show:
   ```
   [Layout] Found existing profile. Admin status: true
   ```

2. **Network Request** should show:
   ```
   GET /api/proxy/user-profiles?userId.equals=user_2vVLxhPnsIPGYf6qpfozk383Slr&tenantId.equals=tenant_demo_002&size=1
   ```

3. **Response** should return:
   ```json
   {
     "id": ...,
     "userId": "user_2vVLxhPnsIPGYf6qpfozk383Slr",
     "tenantId": "tenant_demo_002",
     "userRole": "ADMIN",
     "userStatus": "APPROVED",
     ...
   }
   ```

4. **Admin Menu** should appear in header ✅

---

## 🔍 If Still Not Working

### **Add Debug Logging**

Add this to `src/app/layout.tsx` around line 99:

```typescript
const tenantId = getTenantId();
console.log('[Layout] 🔍 Tenant ID Debug:', {
  tenantId,
  'AMPLIFY_NEXT_PUBLIC_TENANT_ID': process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID,
  'NEXT_PUBLIC_TENANT_ID': process.env.NEXT_PUBLIC_TENANT_ID,
  'process.env keys': Object.keys(process.env).filter(k => k.includes('TENANT')),
});
```

This will show you exactly what values are available.

---

## 📝 Summary

**Most Likely Cause**: Dev server needs to be restarted after changing `.env.local`

**Quick Fix**:
1. Stop dev server
2. Restart: `npm run dev`
3. Check server console logs
4. Verify Network tab shows correct tenantId

**If still not working**: Add debug logging to see what values are actually loaded.

---

**Last Updated**: 2025-01-22


