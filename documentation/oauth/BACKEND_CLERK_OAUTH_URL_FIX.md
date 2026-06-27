# Backend Clerk OAuth URL Fix

## Problem

The backend is generating the **wrong Clerk OAuth URL**:

```
https://api.clerk.com/oauth/authorize
```

This URL returns **404 Page Not Found** because `https://api.clerk.com` is Clerk's **REST API endpoint**, not the OAuth authorization endpoint.

## Root Cause

In `ClerkIntegrationServiceImpl.java`, the `generateOAuthUrl()` method is using:

```java
String clerkOAuthBaseUrl = clerkProperties.getApiUrl().replace("/v1", "") + "/oauth/authorize";
```

This creates: `https://api.clerk.com/oauth/authorize` (WRONG)

## Correct URL Format

Clerk OAuth URLs should use your **Clerk Frontend API URL**, which looks like:

```
https://your-app-id.clerk.accounts.dev/oauth/authorize
```

OR for custom domains:

```
https://accounts.yourdomain.com/oauth/authorize
```

## Solution

You need to add a new configuration property for the Clerk Frontend API URL.

### Step 1: Add Configuration Property

**File**: `backend/src/main/resources/application-dev.yml`

Add a new property under your Clerk configuration:

```yaml
clerk:
  api-url: https://api.clerk.com/v1
  secret-key: ${CLERK_SECRET_KEY}
  publishable-key: ${CLERK_PUBLISHABLE_KEY}
  frontend-api: ${CLERK_FRONTEND_API:https://your-app-id.clerk.accounts.dev}  # ADD THIS LINE
```

**Important**: Replace `your-app-id` with your actual Clerk application ID.

### How to Find Your Clerk Frontend API URL:

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Go to **API Keys** section
4. Look for **Frontend API** - it will show something like:
   - `your-app-id.clerk.accounts.dev` (for development)
   - OR your custom domain if configured

### Step 2: Update ClerkProperties.java

**File**: `backend/src/main/java/com/nextjstemplate/config/ClerkProperties.java`

Add the new property:

```java
@ConfigurationProperties(prefix = "clerk")
public class ClerkProperties {
    private String apiUrl;
    private String secretKey;
    private String publishableKey;
    private String frontendApi;  // ADD THIS FIELD

    // Getters and Setters
    public String getFrontendApi() {
        return frontendApi;
    }

    public void setFrontendApi(String frontendApi) {
        this.frontendApi = frontendApi;
    }
}
```

### Step 3: Update ClerkIntegrationServiceImpl.java

**File**: `backend/src/main/java/com/nextjstemplate/service/impl/ClerkIntegrationServiceImpl.java`

Change the `generateOAuthUrl()` method:

**BEFORE (Wrong)**:
```java
@Override
public String generateOAuthUrl(String provider, String redirectUri, String state) {
    // WRONG: Uses API URL
    String clerkOAuthBaseUrl = clerkProperties.getApiUrl().replace("/v1", "") + "/oauth/authorize";

    StringBuilder urlBuilder = new StringBuilder(clerkOAuthBaseUrl);
    urlBuilder.append("?provider=").append(provider);
    urlBuilder.append("&redirect_uri=").append(URLEncoder.encode(redirectUri, StandardCharsets.UTF_8));
    urlBuilder.append("&state=").append(state);

    return urlBuilder.toString();
}
```

**AFTER (Correct)**:
```java
@Override
public String generateOAuthUrl(String provider, String redirectUri, String state) {
    // CORRECT: Uses Frontend API URL
    String clerkFrontendApi = clerkProperties.getFrontendApi();

    // Ensure the URL has https:// prefix
    if (!clerkFrontendApi.startsWith("http://") && !clerkFrontendApi.startsWith("https://")) {
        clerkFrontendApi = "https://" + clerkFrontendApi;
    }

    String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";

    log.debug("Building OAuth URL with frontend API: {}", clerkFrontendApi);

    StringBuilder urlBuilder = new StringBuilder(clerkOAuthBaseUrl);
    urlBuilder.append("?provider=").append(provider);
    urlBuilder.append("&redirect_uri=").append(URLEncoder.encode(redirectUri, StandardCharsets.UTF_8));
    urlBuilder.append("&state=").append(state);

    String oauthUrl = urlBuilder.toString();
    log.debug("Generated OAuth URL: {}", oauthUrl);

    return oauthUrl;
}
```

## Environment Variable Setup

Add to your environment variables or `.env` file:

```bash
CLERK_FRONTEND_API=your-app-id.clerk.accounts.dev
```

Or in your `application-dev.yml`:

```yaml
clerk:
  frontend-api: your-app-id.clerk.accounts.dev
```

## Expected Behavior After Fix

### Before (404 Error):
```
Generated OAuth URL: https://api.clerk.com/oauth/authorize?provider=google&...
Browser: 404 Page Not Found
```

### After (Success):
```
Generated OAuth URL: https://your-app-id.clerk.accounts.dev/oauth/authorize?provider=google&...
Browser: Redirects to Google OAuth consent screen
```

## Complete Flow After Fix

1. User clicks "Sign in with Google" on frontend
2. Frontend proxy adds JWT and tenant ID
3. Backend generates OAuth URL using **Frontend API**:
   ```
   https://your-app-id.clerk.accounts.dev/oauth/authorize?provider=google&...
   ```
4. Browser redirects to Clerk OAuth page
5. Clerk redirects to Google OAuth
6. User authenticates with Google
7. Google redirects back to Clerk
8. Clerk redirects back to backend callback:
   ```
   http://localhost:8080/api/oauth/google/callback?code=...&state=...
   ```
9. Backend exchanges code for user data
10. Backend redirects to frontend callback
11. User is logged in!

## Verification

After applying the fix, check backend logs:

**Look for**:
```
DEBUG [ClerkIntegrationServiceImpl] Building OAuth URL with frontend API: your-app-id.clerk.accounts.dev
DEBUG [ClerkIntegrationServiceImpl] Generated OAuth URL: https://your-app-id.clerk.accounts.dev/oauth/authorize?provider=google&...
```

**Should NOT see**:
```
Generated OAuth URL: https://api.clerk.com/oauth/authorize?...
```

## Common Mistakes

### ❌ Wrong: Using API URL
```java
String url = clerkProperties.getApiUrl() + "/oauth/authorize";
// Results in: https://api.clerk.com/v1/oauth/authorize (404)
```

### ✅ Correct: Using Frontend API URL
```java
String url = clerkProperties.getFrontendApi() + "/oauth/authorize";
// Results in: https://your-app-id.clerk.accounts.dev/oauth/authorize (Works!)
```

## Additional Notes

### Development vs Production

You may need different Frontend API URLs for different environments:

**development**:
```yaml
clerk:
  frontend-api: your-app-id.clerk.accounts.dev
```

**production**:
```yaml
clerk:
  frontend-api: accounts.yourdomain.com  # Your custom domain
```

### Custom Domains

If you've configured a custom domain in Clerk Dashboard, use that instead:

```yaml
clerk:
  frontend-api: accounts.yourdomain.com
```

### Clerk Account Types

- **Development**: `your-app-id.clerk.accounts.dev`
- **Production**: `your-app-id.clerk.accounts.com` OR custom domain
- **Staging**: Similar pattern with different app ID

## Testing After Fix

1. **Restart backend server**
2. **Click social login button**
3. **Check browser URL** - should redirect to:
   ```
   https://your-app-id.clerk.accounts.dev/oauth/authorize?provider=google&...
   ```
4. **Should see Clerk OAuth page** (not 404)
5. **Click "Continue with Google"**
6. **Should see Google OAuth consent screen**

## Summary

The fix involves:
1. ✅ Add `clerk.frontend-api` configuration property
2. ✅ Update `ClerkProperties.java` with new field
3. ✅ Update `generateOAuthUrl()` to use Frontend API instead of API URL
4. ✅ Set environment variable with your Clerk Frontend API URL
5. ✅ Restart backend and test

**Key Point**: Clerk has two different URLs:
- **API URL** (`api.clerk.com`) - For backend REST API calls
- **Frontend API** (`your-app-id.clerk.accounts.dev`) - For OAuth and frontend operations

You must use the **Frontend API** for OAuth authorization URLs!
