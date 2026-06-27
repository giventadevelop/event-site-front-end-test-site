# EXACT CODE TO CHANGE - ClerkIntegrationServiceImpl.java

## File Location
`src/main/java/com/nextjstemplate/service/impl/ClerkIntegrationServiceImpl.java`

---

## FIND THIS CODE (Current - WRONG):

```java
@Override
public String generateOAuthUrl(String provider, String redirectUri, String state) {
    log.debug("Generating OAuth URL for provider: {} with redirect: {}", provider, redirectUri);

    // THIS LINE IS WRONG - IT USES API URL
    String clerkOAuthBaseUrl = clerkProperties.getApiUrl().replace("/v1", "") + "/oauth/authorize";

    StringBuilder urlBuilder = new StringBuilder(clerkOAuthBaseUrl);
    urlBuilder.append("?provider=").append(provider);
    urlBuilder.append("&redirect_uri=").append(URLEncoder.encode(redirectUri, StandardCharsets.UTF_8));
    urlBuilder.append("&state=").append(state);

    String oauthUrl = urlBuilder.toString();
    log.debug("Generated OAuth URL: {}", oauthUrl);

    return oauthUrl;
}
```

---

## REPLACE WITH THIS CODE (CORRECT):

```java
@Override
public String generateOAuthUrl(String provider, String redirectUri, String state) {
    log.debug("Generating OAuth URL for provider: {} with redirect: {}", provider, redirectUri);

    // FIXED: Use Frontend API URL instead of API URL
    String clerkFrontendApi = clerkProperties.getFrontendApi();

    // Ensure URL has https:// prefix
    if (!clerkFrontendApi.startsWith("http://") && !clerkFrontendApi.startsWith("https://")) {
        clerkFrontendApi = "https://" + clerkFrontendApi;
    }

    // Remove trailing slash if present
    if (clerkFrontendApi.endsWith("/")) {
        clerkFrontendApi = clerkFrontendApi.substring(0, clerkFrontendApi.length() - 1);
    }

    // Build OAuth URL using Frontend API
    String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";

    log.debug("Using Clerk Frontend API: {}", clerkFrontendApi);
    log.debug("OAuth base URL: {}", clerkOAuthBaseUrl);

    StringBuilder urlBuilder = new StringBuilder(clerkOAuthBaseUrl);
    urlBuilder.append("?provider=").append(provider);
    urlBuilder.append("&redirect_uri=").append(URLEncoder.encode(redirectUri, StandardCharsets.UTF_8));
    urlBuilder.append("&state=").append(state);

    String oauthUrl = urlBuilder.toString();
    log.debug("Generated OAuth URL: {}", oauthUrl);

    return oauthUrl;
}
```

---

## WHAT CHANGED?

### OLD (Line that needs to be removed):
```java
String clerkOAuthBaseUrl = clerkProperties.getApiUrl().replace("/v1", "") + "/oauth/authorize";
```
**This creates**: `https://api.clerk.com/oauth/authorize` ❌

### NEW (Lines to add):
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
**This creates**: `https://humble-monkey-3.clerk.accounts.dev/oauth/authorize` ✅

---

## Visual Diff

```diff
@Override
public String generateOAuthUrl(String provider, String redirectUri, String state) {
    log.debug("Generating OAuth URL for provider: {} with redirect: {}", provider, redirectUri);

-   // OLD: Uses API URL (WRONG)
-   String clerkOAuthBaseUrl = clerkProperties.getApiUrl().replace("/v1", "") + "/oauth/authorize";
+   // NEW: Uses Frontend API URL (CORRECT)
+   String clerkFrontendApi = clerkProperties.getFrontendApi();
+
+   // Ensure URL has https:// prefix
+   if (!clerkFrontendApi.startsWith("http://") && !clerkFrontendApi.startsWith("https://")) {
+       clerkFrontendApi = "https://" + clerkFrontendApi;
+   }
+
+   // Remove trailing slash if present
+   if (clerkFrontendApi.endsWith("/")) {
+       clerkFrontendApi = clerkFrontendApi.substring(0, clerkFrontendApi.length() - 1);
+   }
+
+   // Build OAuth URL using Frontend API
+   String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";
+
+   log.debug("Using Clerk Frontend API: {}", clerkFrontendApi);
+   log.debug("OAuth base URL: {}", clerkOAuthBaseUrl);

    StringBuilder urlBuilder = new StringBuilder(clerkOAuthBaseUrl);
    urlBuilder.append("?provider=").append(provider);
    urlBuilder.append("&redirect_uri=").append(URLEncoder.encode(redirectUri, StandardCharsets.UTF_8));
    urlBuilder.append("&state=").append(state);

    String oauthUrl = urlBuilder.toString();
    log.debug("Generated OAuth URL: {}", oauthUrl);

    return oauthUrl;
}
```

---

## After Making the Change

### 1. Save the file

### 2. Rebuild (if needed):
```bash
./mvnw clean install
```

### 3. Restart backend:
```bash
./mvnw spring-boot:run
```

### 4. Test - Click social login button

### 5. Check backend logs - You should see:
```
DEBUG [ClerkIntegrationServiceImpl] Using Clerk Frontend API: https://humble-monkey-3.clerk.accounts.dev
DEBUG [ClerkIntegrationServiceImpl] OAuth base URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize
DEBUG [ClerkIntegrationServiceImpl] Generated OAuth URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?provider=google&redirect_uri=...&state=...
```

### 6. Browser should redirect to:
```
https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?...
```
(NOT `api.clerk.com`)

---

## Verification

**Backend logs BEFORE fix**:
```
Generated OAuth URL: https://api.clerk.com/oauth/authorize?...
```

**Backend logs AFTER fix**:
```
Using Clerk Frontend API: https://humble-monkey-3.clerk.accounts.dev
OAuth base URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize
Generated OAuth URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?...
```

---

## Summary

**Problem**: The `generateOAuthUrl()` method is still using `getApiUrl()` instead of `getFrontendApi()`

**Solution**: Replace ONE line with MULTIPLE lines to use the Frontend API URL

**Key Change**:
- Remove: `clerkProperties.getApiUrl().replace("/v1", "")`
- Add: `clerkProperties.getFrontendApi()` with proper URL validation

This is the ONLY change needed in ClerkIntegrationServiceImpl.java!
