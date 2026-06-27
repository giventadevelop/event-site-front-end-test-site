# Deployment Guide: CORS Fixes + Robust Logging

## Problem Diagnosis

Looking at your CloudWatch logs, **NO console.log output is appearing**. This means either:
1. The code wasn't deployed yet (most likely)
2. Next.js is stripping console.log in production builds

## Solution Applied

We've implemented **TWO layers of fixes**:

### Layer 1: CORS Fixes (Original Issue)
- Added CORS headers to proxy handler
- Added CORS headers to client log endpoint
- Added global CORS configuration
- Added OPTIONS preflight handling

### Layer 2: Robust Logging (New Issue)
- Created `src/lib/logger.ts` using `process.stderr.write` (can't be stripped)
- Updated middleware to use robust logger
- Updated proxy handler to use robust logger
- Created deployment verification endpoint

---

## Step-by-Step Deployment Instructions

### Step 1: Commit All Changes

```bash
# Add all modified files
git add src/lib/proxyHandler.ts
git add src/app/api/logs/client/route.ts
git add src/middleware.ts
git add next.config.mjs
git add src/lib/logger.ts
git add src/pages/api/diagnostic/deployment-check.ts
git add documentation/

# Create commit
git commit -m "fix: Add CORS headers and robust logging for mobile browsers

- Add CORS headers to proxy handler (all routes)
- Add OPTIONS preflight handling
- Add global CORS configuration in next.config.mjs
- Implement robust logging using process.stderr.write
- Add deployment verification endpoint
- Fixes mobile browser API call failures"

# Push to your branch
git push origin release/v1.0.0
```

**IMPORTANT**: Verify this command shows your changes:
```bash
git diff HEAD~1
```

You should see the CORS headers and logger imports.

### Step 2: Verify Git Push Succeeded

```bash
# Check that push succeeded
git log --oneline -1

# Should show your new commit at the top
```

### Step 3: Trigger AWS Amplify Build

AWS Amplify should auto-deploy when you push to your branch. If not:

1. Go to AWS Amplify Console
2. Find your app
3. Click "Run build" or wait for automatic build
4. Monitor build logs for errors

### Step 4: Wait for Deployment (Usually 5-10 Minutes)

Watch for:
- Build step: `npm run build` should succeed
- Deploy step: Should complete without errors
- Domain update: New version should be live

### Step 5: Verify Deployment Using Verification Endpoint

Once deployed, test from ANY browser (desktop or mobile):

```javascript
// Open browser console and run:
fetch('https://your-domain.com/api/diagnostic/deployment-check')
  .then(res => res.json())
  .then(data => {
    console.log('Deployment Info:', data);
    if (data.version === 'v2.0-cors-fixes-20231123') {
      console.log('✅ NEW CODE IS DEPLOYED!');
    } else {
      console.log('❌ OLD CODE STILL RUNNING');
    }
  });
```

**Expected Output**:
```json
{
  "success": true,
  "version": "v2.0-cors-fixes-20231123",
  "deploymentChecks": {
    "corsFixesApplied": true,
    "proxyHandlerCORS": true,
    "clientLogCORS": true,
    "globalCORS": true,
    "robustLogging": true
  }
}
```

---

## Step 6: Test Mobile Browser

Once verification endpoint confirms new code is deployed:

1. Open mobile browser (Safari iOS / Chrome Android / WhatsApp)
2. Navigate to: `https://your-domain.com/events/2/checkout`
3. Page should load with event details (no "Event not found")

---

## Step 7: Check CloudWatch Logs

After mobile browser test, check CloudWatch for **NEW log format**:

Search for: `[ROBUST-LOG]`

**Expected**:
```json
[ROBUST-LOG] {"timestamp":"2023-11-23T21:30:00.000Z","level":"INFO","tag":"MIDDLEWARE","message":"API REQUEST DETECTED","data":{"pathname":"/api/proxy/event-details/2","method":"GET","isMobile":true}}

[ROBUST-LOG] {"timestamp":"2023-11-23T21:30:00.100Z","level":"INFO","tag":"PROXY-HANDLER","message":"PROXY HANDLER INVOKED","data":{"backendPath":"/event-details/[id]","method":"GET","isMobile":true}}
```

Also search for traditional logs (may or may not appear):
- `[MIDDLEWARE] API REQUEST DETECTED`
- `[PROXY-HANDLER-START] HANDLER INVOKED`

---

## Troubleshooting

### Issue: "Deployment verification endpoint returns 404"

**Solution**: Build hasn't completed or failed. Check AWS Amplify build logs.

### Issue: "Version still shows old version"

**Solution**:
1. Clear browser cache (hard reload: Ctrl+Shift+R)
2. Check AWS Amplify console - is new build deployed?
3. Wait 2-3 minutes for CDN to update
4. Try from incognito/private browsing window

### Issue: "Mobile still shows 'Event not found'"

**Debug Steps**:
1. Verify deployment check shows new version
2. Check CloudWatch for `[ROBUST-LOG]` entries
3. If no logs: Build may have failed or not deployed
4. If logs present but still failing: Check for different error

### Issue: "Build fails with module errors"

**Solution**: The logger.ts file uses process.stderr which requires Node.js environment. This should work in Next.js API routes but if build fails:

```bash
# Check build errors
npm run build

# Look for TypeScript errors or module resolution issues
```

### Issue: "Still no logs in CloudWatch"

**Possible causes**:
1. **AWS Amplify logging disabled**: Check Amplify console settings
2. **CloudWatch log group not receiving logs**: Verify log group exists
3. **Logs in different CloudWatch log stream**: Check all streams in the log group
4. **Deployment didn't happen**: Verify git push succeeded and Amplify built

**Check Amplify logging**:
1. Go to AWS Amplify Console
2. Click on your app
3. Go to "App settings" > "Environment variables"
4. Verify logging isn't disabled

---

## Success Criteria

✅ Git commit created and pushed
✅ AWS Amplify build completed successfully
✅ Deployment verification endpoint returns `v2.0-cors-fixes-20231123`
✅ CloudWatch shows `[ROBUST-LOG]` entries
✅ Mobile browser loads checkout page successfully
✅ Event details display correctly
✅ No "Event not found" error

---

## What Changed

### Files Modified:
1. **`src/lib/proxyHandler.ts`** - Added CORS headers and robust logging
2. **`src/app/api/logs/client/route.ts`** - Added CORS headers and OPTIONS
3. **`src/middleware.ts`** - Added robust logging
4. **`next.config.mjs`** - Added global CORS configuration

### Files Created:
1. **`src/lib/logger.ts`** - Robust logging utility using process.stderr.write
2. **`src/pages/api/diagnostic/deployment-check.ts`** - Deployment verification

### Why This Fixes Mobile Browser Issue:

**Original Problem**: Next.js proxy routes didn't have CORS headers, causing mobile browsers to reject responses.

**Solution**:
- Added CORS headers to ALL proxy routes
- Added OPTIONS preflight handling
- Backend CORS doesn't help because mobile browsers request Next.js, not backend

**Why Robust Logging**:
- console.log may be stripped in production builds
- process.stderr.write is ALWAYS preserved
- Ensures we can debug even if console.log is removed

---

## Alternative: Manual Build Verification

If you want to verify locally before deploying:

```bash
# Build locally
npm run build

# Check if logger.ts is included
ls -la .next/server/chunks/

# Start production server locally
npm start

# Test locally
curl http://localhost:3000/api/diagnostic/deployment-check
```

---

## Next Steps After Successful Deployment

1. Monitor CloudWatch logs for mobile traffic
2. Verify no CORS errors
3. Test across different mobile browsers
4. Remove old diagnostic logging if everything works
5. Consider adding monitoring/alerting for mobile errors

---

## Contact / Support

If issues persist:
1. Share CloudWatch logs (search for `[ROBUST-LOG]`)
2. Share AWS Amplify build logs
3. Share deployment verification endpoint response
4. Share mobile browser console errors (if accessible)
