# Backend Clerk URL Implementation Guide

## Overview

You need to update the backend to use the correct Clerk Frontend API URL for OAuth authorization.

**Your Clerk Frontend API URL**: `https://humble-monkey-3.clerk.accounts.dev`

## Files to Modify

You need to modify **3 files** in your backend project:

1. `ClerkProperties.java` - Add new property
2. `ClerkIntegrationServiceImpl.java` - Update OAuth URL generation
3. `application-dev.yml` - Add Frontend API configuration

---

## Step 1: Update ClerkProperties.java

**File Location**: `src/main/java/com/nextjstemplate/config/ClerkProperties.java`

### Add New Field

Add the `frontendApi` field and its getter/setter to the class:

```java
@Component
@ConfigurationProperties(prefix = "clerk")
public class ClerkProperties {

    private String apiUrl;
    private String secretKey;
    private String publishableKey;
    private String frontendApi;  // ADD THIS LINE

    // ... existing getters/setters ...

    // ADD THIS GETTER
    public String getFrontendApi() {
        return frontendApi;
    }

    // ADD THIS SETTER
    public void setFrontendApi(String frontendApi) {
        this.frontendApi = frontendApi;
    }
}
```

### Reference File

I've created a complete reference file at:
- `backend_reference_code/ClerkProperties.java`

You can copy this entire file to replace your existing one, or just add the new field and methods.

---

## Step 2: Update ClerkIntegrationServiceImpl.java

**File Location**: `src/main/java/com/nextjstemplate/service/impl/ClerkIntegrationServiceImpl.java`

### Find the `generateOAuthUrl()` Method

Look for this method in the file:

```java
@Override
public String generateOAuthUrl(String provider, String redirectUri, String state) {
    // ... existing code ...
}
```

### Replace the Method

Replace the **entire method** with this updated version:

```java
@Override
public String generateOAuthUrl(String provider, String redirectUri, String state) {
    log.debug("Generating OAuth URL for provider: {} with redirect: {}", provider, redirectUri);

    // CHANGED: Use Frontend API URL instead of API URL
    String clerkFrontendApi = clerkProperties.getFrontendApi();

    // Ensure the URL has https:// prefix
    if (!clerkFrontendApi.startsWith("http://") && !clerkFrontendApi.startsWith("https://")) {
        clerkFrontendApi = "https://" + clerkFrontendApi;
    }

    // Remove trailing slash if present
    if (clerkFrontendApi.endsWith("/")) {
        clerkFrontendApi = clerkFrontendApi.substring(0, clerkFrontendApi.length() - 1);
    }

    // Build OAuth authorization URL
    String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";

    log.debug("Using Clerk Frontend API: {}", clerkFrontendApi);
    log.debug("OAuth base URL: {}", clerkOAuthBaseUrl);

    // Build URL with query parameters
    StringBuilder urlBuilder = new StringBuilder(clerkOAuthBaseUrl);
    urlBuilder.append("?provider=").append(provider);
    urlBuilder.append("&redirect_uri=").append(URLEncoder.encode(redirectUri, StandardCharsets.UTF_8));
    urlBuilder.append("&state=").append(state);

    String oauthUrl = urlBuilder.toString();
    log.debug("Generated OAuth URL: {}", oauthUrl);

    return oauthUrl;
}
```

### What Changed?

**BEFORE**:
```java
String clerkOAuthBaseUrl = clerkProperties.getApiUrl().replace("/v1", "") + "/oauth/authorize";
// Resulted in: https://api.clerk.com/oauth/authorize (404!)
```

**AFTER**:
```java
String clerkFrontendApi = clerkProperties.getFrontendApi();
String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";
// Results in: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize (Works!)
```

### Reference File

I've created a reference method at:
- `backend_reference_code/ClerkIntegrationServiceImpl_generateOAuthUrl.java`

---

## Step 3: Update application-dev.yml

**File Location**: `src/main/resources/application-dev.yml`

### Find Your Clerk Configuration Section

Look for the `clerk:` section in your YAML file:

```yaml
clerk:
  api-url: ${CLERK_API_URL:https://api.clerk.com/v1}
  secret-key: ${CLERK_SECRET_KEY}
  publishable-key: ${CLERK_PUBLISHABLE_KEY}
```

### Add the Frontend API Property

Add the `frontend-api` line to this section:

```yaml
clerk:
  api-url: ${CLERK_API_URL:https://api.clerk.com/v1}
  secret-key: ${CLERK_SECRET_KEY}
  publishable-key: ${CLERK_PUBLISHABLE_KEY}
  frontend-api: ${CLERK_FRONTEND_API:https://humble-monkey-3.clerk.accounts.dev}  # ADD THIS LINE
```

### Reference File

I've created a reference configuration at:
- `backend_reference_code/application-dev.yml_clerk_section`

---

## Step 4: Set Environment Variable (Optional)

You can either:

**Option A**: Use the default in YAML (already done above)
```yaml
frontend-api: ${CLERK_FRONTEND_API:https://humble-monkey-3.clerk.accounts.dev}
```

**Option B**: Set environment variable
```bash
export CLERK_FRONTEND_API=https://humble-monkey-3.clerk.accounts.dev
```

**Option C**: Add to your `.env` file (if using one)
```env
CLERK_FRONTEND_API=https://humble-monkey-3.clerk.accounts.dev
```

I recommend **Option A** (using the default in YAML) since you already have the URL.

---

## Step 5: Restart Backend Server

After making all the changes:

1. **Save all files**
2. **Stop the backend server** (Ctrl+C)
3. **Rebuild** (if necessary):
   ```bash
   ./mvnw clean install
   ```
4. **Restart the server**:
   ```bash
   ./mvnw spring-boot:run
   ```

---

## Step 6: Verify the Changes

### Check Backend Logs on Startup

You should see no errors about missing configuration.

### Trigger OAuth Flow

1. Go to frontend: `http://localhost:3000/sign-in`
2. Click "Sign in with Google"
3. **Check backend logs** for:

```
DEBUG [ClerkIntegrationServiceImpl] Using Clerk Frontend API: https://humble-monkey-3.clerk.accounts.dev
DEBUG [ClerkIntegrationServiceImpl] OAuth base URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize
DEBUG [ClerkIntegrationServiceImpl] Generated OAuth URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?provider=google&redirect_uri=...&state=...
```

### Expected Behavior

**Before (404 Error)**:
```
Generated OAuth URL: https://api.clerk.com/oauth/authorize?...
Browser: 404 Page Not Found
```

**After (Success)**:
```
Generated OAuth URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?...
Browser: Redirects to Clerk OAuth page → Google OAuth consent screen
```

---

## Troubleshooting

### Issue 1: NullPointerException on getFrontendApi()

**Error**:
```
java.lang.NullPointerException: Cannot invoke "String.startsWith()" because "clerkFrontendApi" is null
```

**Cause**: The `frontend-api` property is not set in YAML or the default is missing.

**Fix**: Make sure you added the line to `application-dev.yml`:
```yaml
frontend-api: ${CLERK_FRONTEND_API:https://humble-monkey-3.clerk.accounts.dev}
```

### Issue 2: Still Getting api.clerk.com URL

**Error**: Backend logs still show `https://api.clerk.com/oauth/authorize`

**Cause**: Changes not applied or server not restarted.

**Fix**:
1. Verify all 3 files were updated
2. Restart backend server
3. Clear any cached builds

### Issue 3: Configuration Property Not Found

**Error**:
```
Binding to target ... failed:
Property: clerk.frontend-api
```

**Cause**: Typo in YAML or property name mismatch.

**Fix**: Ensure YAML uses `frontend-api` (with hyphen) and Java uses `frontendApi` (camelCase).

---

## Testing Checklist

After implementation:

- [ ] `ClerkProperties.java` has `frontendApi` field and getter/setter
- [ ] `ClerkIntegrationServiceImpl.java` `generateOAuthUrl()` method updated
- [ ] `application-dev.yml` has `frontend-api` property
- [ ] Backend server restarted
- [ ] No startup errors
- [ ] Click social login button in frontend
- [ ] Backend logs show correct Frontend API URL
- [ ] Browser redirects to `humble-monkey-3.clerk.accounts.dev` (not `api.clerk.com`)
- [ ] Clerk OAuth page loads (not 404)

---

## Summary of Changes

| File | Change | Purpose |
|------|--------|---------|
| `ClerkProperties.java` | Add `frontendApi` field | Store Frontend API URL |
| `ClerkIntegrationServiceImpl.java` | Update `generateOAuthUrl()` | Use Frontend API instead of REST API |
| `application-dev.yml` | Add `frontend-api` property | Configure Frontend API URL |

**Key Concept**:
- **REST API URL** (`api.clerk.com`) = Backend API calls (user management, etc.)
- **Frontend API URL** (`humble-monkey-3.clerk.accounts.dev`) = OAuth and user-facing operations

OAuth requires the **Frontend API URL**, not the REST API URL!

---

## Next Steps After Implementation

Once the OAuth redirect works:

1. **Configure OAuth Provider in Clerk Dashboard**:
   - Go to Clerk Dashboard
   - Select your application
   - Go to **SSO** → **Social Connections**
   - Enable **Google** (or other providers)
   - Add redirect URI: `http://localhost:8080/api/oauth/google/callback`

2. **Test Complete OAuth Flow**:
   - Click social login button
   - Should redirect to Clerk
   - Then to Google OAuth
   - Then back to your backend callback
   - Then to frontend with user session

3. **Implement OAuth Callback Handler** (if not done):
   - Handle the callback at `/api/oauth/{provider}/callback`
   - Exchange authorization code for user data
   - Create user session
   - Redirect to frontend

---

## Support Files

All reference files are in: `backend_reference_code/`

1. `ClerkProperties.java` - Complete class
2. `ClerkIntegrationServiceImpl_generateOAuthUrl.java` - Updated method
3. `application-dev.yml_clerk_section` - YAML configuration

You can copy these files directly or use them as reference while updating your existing files.

---

## Questions?

If you encounter any issues:
1. Check backend logs for detailed error messages
2. Verify all 3 files were updated correctly
3. Ensure backend server was restarted
4. Test with `curl` to isolate frontend vs backend issues
