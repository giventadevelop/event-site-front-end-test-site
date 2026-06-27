# Backend Fix Checklist

## Issue
Backend is still generating: `https://api.clerk.com/oauth/authorize`
Should generate: `https://humble-monkey-3.clerk.accounts.dev/oauth/authorize`

---

## Required Changes

### ✅ DONE: application-dev.yml
You already added this:
```yaml
clerk:
  publishable-key: ${CLERK_PUBLISHABLE_KEY}
  secret-key: ${CLERK_SECRET_KEY}
  webhook-secret: ${CLERK_WEBHOOK_SECRET}
  frontend-api: ${CLERK_FRONTEND_API:https://humble-monkey-3.clerk.accounts.dev}
```
**Status**: ✅ COMPLETE

---

### ❓ CHECK: ClerkProperties.java

**File**: `src/main/java/com/nextjstemplate/config/ClerkProperties.java`

**Check if you have this field and methods**:

```java
@Component
@ConfigurationProperties(prefix = "clerk")
public class ClerkProperties {

    private String publishableKey;
    private String secretKey;
    private String webhookSecret;
    private String frontendApi;  // ← DO YOU HAVE THIS?

    // ... other getters/setters ...

    // ← DO YOU HAVE THIS GETTER?
    public String getFrontendApi() {
        return frontendApi;
    }

    // ← DO YOU HAVE THIS SETTER?
    public void setFrontendApi(String frontendApi) {
        this.frontendApi = frontendApi;
    }
}
```

**Action Required**:
- [ ] Open `ClerkProperties.java`
- [ ] Check if `frontendApi` field exists
- [ ] Check if `getFrontendApi()` method exists
- [ ] Check if `setFrontendApi()` method exists
- [ ] If missing, ADD them

**If you don't have these, ADD**:
```java
private String frontendApi;

public String getFrontendApi() {
    return frontendApi;
}

public void setFrontendApi(String frontendApi) {
    this.frontendApi = frontendApi;
}
```

---

### ❌ TODO: ClerkIntegrationServiceImpl.java

**File**: `src/main/java/com/nextjstemplate/service/impl/ClerkIntegrationServiceImpl.java`

**Current code (WRONG)**:
```java
String clerkOAuthBaseUrl = clerkProperties.getApiUrl().replace("/v1", "") + "/oauth/authorize";
```

**Must change to (CORRECT)**:
```java
String clerkFrontendApi = clerkProperties.getFrontendApi();

if (!clerkFrontendApi.startsWith("http://") && !clerkFrontendApi.startsWith("https://")) {
    clerkFrontendApi = "https://" + clerkFrontendApi;
}

if (clerkFrontendApi.endsWith("/")) {
    clerkFrontendApi = clerkFrontendApi.substring(0, clerkFrontendApi.length() - 1);
}

String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";

log.debug("Using Clerk Frontend API: {}", clerkFrontendApi);
log.debug("OAuth base URL: {}", clerkOAuthBaseUrl);
```

**Action Required**:
- [ ] Open `ClerkIntegrationServiceImpl.java`
- [ ] Find the `generateOAuthUrl()` method
- [ ] Replace the URL generation code
- [ ] See `EXACT_CODE_TO_CHANGE.md` for detailed instructions

---

## Quick Test Commands

### After Making Changes:

```bash
# 1. Stop backend (Ctrl+C)

# 2. Rebuild
./mvnw clean install

# 3. Restart
./mvnw spring-boot:run

# 4. Wait for startup to complete

# 5. Click social login button in browser

# 6. Check backend console logs
```

---

## Expected Backend Logs After Fix

### ✅ SUCCESS - You should see:
```
DEBUG [ClerkIntegrationServiceImpl] Generating OAuth URL for provider: google with redirect: http://localhost:8080/api/oauth/google/callback
DEBUG [ClerkIntegrationServiceImpl] Using Clerk Frontend API: https://humble-monkey-3.clerk.accounts.dev
DEBUG [ClerkIntegrationServiceImpl] OAuth base URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize
DEBUG [ClerkIntegrationServiceImpl] Generated OAuth URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?provider=google&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth%2Fgoogle%2Fcallback&state=...
```

### ❌ FAILURE - If you still see:
```
DEBUG [ClerkIntegrationServiceImpl] Generated OAuth URL: https://api.clerk.com/oauth/authorize?...
```
**Then**: The Java code wasn't updated properly. Double-check `ClerkIntegrationServiceImpl.java`.

---

## Most Likely Issue

Based on your logs, you probably:
1. ✅ Updated `application-dev.yml` correctly
2. ❓ May or may not have updated `ClerkProperties.java`
3. ❌ Did NOT update `ClerkIntegrationServiceImpl.java` yet

**The main fix needed**: Update `ClerkIntegrationServiceImpl.java` to use `getFrontendApi()` instead of `getApiUrl()`

---

## Reference Files

All in `backend_reference_code/`:
1. `EXACT_CODE_TO_CHANGE.md` - **START HERE** for the exact code change
2. `ClerkProperties.java` - Complete file with frontendApi field
3. `ClerkIntegrationServiceImpl_generateOAuthUrl.java` - Complete method

---

## Questions to Answer

1. **Did you update ClerkProperties.java?**
   - Does it have the `frontendApi` field?
   - Does it have `getFrontendApi()` method?

2. **Did you update ClerkIntegrationServiceImpl.java?**
   - Did you change the `generateOAuthUrl()` method?
   - Does it call `clerkProperties.getFrontendApi()` now?

3. **Did you restart the backend after making changes?**
   - Changes only take effect after restart

---

## Summary

**Most likely you need to**:
1. Open `ClerkIntegrationServiceImpl.java`
2. Find `generateOAuthUrl()` method
3. Replace the line that creates `clerkOAuthBaseUrl`
4. See `EXACT_CODE_TO_CHANGE.md` for the exact replacement
5. Save file
6. Restart backend
7. Test again

**The key issue**: The Java code is still calling `getApiUrl()` instead of `getFrontendApi()`
