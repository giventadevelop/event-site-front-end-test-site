# Apply Backend Fix - Step by Step

## Your Backend Repository Location

You need to navigate to your **backend repository** (not the frontend).

The backend is the Spring Boot project with these directories:
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/nextjstemplate/
│   │   └── resources/
│   │       └── application-dev.yml
```

---

## Step 1: Verify ClerkProperties.java

**File**: `src/main/java/com/nextjstemplate/config/ClerkProperties.java`

Open this file and verify it has these lines:

```java
private String frontendApi;

public String getFrontendApi() {
    return frontendApi;
}

public void setFrontendApi(String frontendApi) {
    this.frontendApi = frontendApi;
}
```

**If missing**, add them to the class. See `backend_reference_code/ClerkProperties.java` for the complete file.

---

## Step 2: Update ClerkIntegrationServiceImpl.java ⭐ CRITICAL

**File**: `src/main/java/com/nextjstemplate/service/impl/ClerkIntegrationServiceImpl.java`

### Option A: Replace Entire Method (EASIEST)

1. Open the file
2. Find the `generateOAuthUrl()` method
3. **Delete the entire method**
4. **Copy/paste** the method from:
   - `backend_reference_code/ClerkIntegrationServiceImpl_COMPLETE_generateOAuthUrl.java`
5. Save the file

### Option B: Replace Specific Lines

Find this line:
```java
String clerkOAuthBaseUrl = clerkProperties.getApiUrl().replace("/v1", "") + "/oauth/authorize";
```

Replace with:
```java
String clerkFrontendApi = clerkProperties.getFrontendApi();

log.debug("Raw Frontend API from properties: {}", clerkFrontendApi);

if (!clerkFrontendApi.startsWith("http://") && !clerkFrontendApi.startsWith("https://")) {
    clerkFrontendApi = "https://" + clerkFrontendApi;
    log.debug("Added https:// prefix: {}", clerkFrontendApi);
}

if (clerkFrontendApi.endsWith("/")) {
    clerkFrontendApi = clerkFrontendApi.substring(0, clerkFrontendApi.length() - 1);
    log.debug("Removed trailing slash: {}", clerkFrontendApi);
}

String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";

log.debug("Using Clerk Frontend API: {}", clerkFrontendApi);
log.debug("OAuth base URL: {}", clerkOAuthBaseUrl);
```

---

## Step 3: Verify application-dev.yml

**File**: `src/main/resources/application-dev.yml`

Verify you have this line under `clerk:`:
```yaml
clerk:
  publishable-key: ${CLERK_PUBLISHABLE_KEY}
  secret-key: ${CLERK_SECRET_KEY}
  webhook-secret: ${CLERK_WEBHOOK_SECRET}
  frontend-api: ${CLERK_FRONTEND_API:https://humble-monkey-3.clerk.accounts.dev}  # ← VERIFY THIS LINE
```

**Status**: ✅ You already confirmed this is done

---

## Step 4: Rebuild and Restart Backend

### Stop Backend Server
Press `Ctrl+C` in the terminal running the backend

### Clean Build
```bash
./mvnw clean install
```

### Start Backend
```bash
./mvnw spring-boot:run
```

### Wait for Startup
Look for log message indicating server is ready

---

## Step 5: Test OAuth Flow

### Click Social Login Button
Go to frontend and click "Sign in with Google"

### Check Backend Logs

**✅ SUCCESS - You should see**:
```
DEBUG [ClerkIntegrationServiceImpl] Generating OAuth URL for provider: google with redirect: http://localhost:8080/api/oauth/google/callback
DEBUG [ClerkIntegrationServiceImpl] Raw Frontend API from properties: https://humble-monkey-3.clerk.accounts.dev
DEBUG [ClerkIntegrationServiceImpl] Using Clerk Frontend API: https://humble-monkey-3.clerk.accounts.dev
DEBUG [ClerkIntegrationServiceImpl] OAuth base URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize
DEBUG [ClerkIntegrationServiceImpl] Generated OAuth URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?provider=google&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth%2Fgoogle%2Fcallback&state=...
```

**❌ FAILURE - If you still see**:
```
DEBUG [ClerkIntegrationServiceImpl] Generated OAuth URL: https://api.clerk.com/oauth/authorize?...
```
**Then**: Go back to Step 2 and verify the code change was applied correctly

### Check Browser

**✅ SUCCESS**: Browser redirects to:
```
https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?provider=google&...
```

You should see the Clerk OAuth page, then Google login

**❌ FAILURE**: Browser shows 404 or redirects to:
```
https://api.clerk.com/oauth/authorize?...
```

Go back to Step 2

---

## Quick Reference: What Changed

### BEFORE (Wrong):
```java
String clerkOAuthBaseUrl = clerkProperties.getApiUrl().replace("/v1", "") + "/oauth/authorize";
// Results in: https://api.clerk.com/oauth/authorize (404!)
```

### AFTER (Correct):
```java
String clerkFrontendApi = clerkProperties.getFrontendApi();
// ... validation code ...
String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";
// Results in: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize (Works!)
```

---

## Files Changed Summary

| File | Change | Status |
|------|--------|--------|
| `application-dev.yml` | Added `frontend-api` property | ✅ DONE |
| `ClerkProperties.java` | Added `frontendApi` field & getter/setter | ❓ VERIFY |
| `ClerkIntegrationServiceImpl.java` | Updated `generateOAuthUrl()` method | ❌ TODO |

---

## Troubleshooting

### Issue: NullPointerException
```
java.lang.NullPointerException: Cannot invoke "String.startsWith()" because "clerkFrontendApi" is null
```

**Cause**: `ClerkProperties.java` doesn't have the `getFrontendApi()` method

**Fix**: Add the getter/setter to `ClerkProperties.java` (Step 1)

### Issue: Still generating api.clerk.com URL

**Cause**: `ClerkIntegrationServiceImpl.java` wasn't updated

**Fix**: Double-check Step 2 - ensure you replaced the code

### Issue: Method not found
```
java.lang.NoSuchMethodError: ...getFrontendApi()
```

**Cause**: Code updated but not recompiled

**Fix**: Run `./mvnw clean install` again

---

## Reference Files in This Repo

All in `backend_reference_code/`:
1. `ClerkIntegrationServiceImpl_COMPLETE_generateOAuthUrl.java` - Complete method ready to copy
2. `ClerkProperties.java` - Complete class with frontendApi field
3. `EXACT_CODE_TO_CHANGE.md` - Detailed before/after comparison
4. `BACKEND_FIX_CHECKLIST.md` - Complete checklist

---

## Summary

**What to do**:
1. ❓ Check `ClerkProperties.java` has `frontendApi` field
2. ⭐ Update `ClerkIntegrationServiceImpl.java` method (MAIN FIX)
3. ✅ Verify `application-dev.yml` has `frontend-api` (already done)
4. 🔄 Rebuild and restart backend
5. ✅ Test - should work!

**The key fix**: Change ONE method in `ClerkIntegrationServiceImpl.java` to use `getFrontendApi()` instead of `getApiUrl()`
