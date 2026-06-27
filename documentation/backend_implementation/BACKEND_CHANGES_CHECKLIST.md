# Backend Changes Checklist - Quick Action Guide

Your Clerk Frontend API URL: **`https://humble-monkey-3.clerk.accounts.dev`**

## Quick Checklist

### ✅ File 1: ClerkProperties.java

**Location**: `src/main/java/com/nextjstemplate/config/ClerkProperties.java`

**Add these lines**:
```java
private String frontendApi;  // Add this field

// Add this getter
public String getFrontendApi() {
    return frontendApi;
}

// Add this setter
public void setFrontendApi(String frontendApi) {
    this.frontendApi = frontendApi;
}
```

**Reference**: See `backend_reference_code/ClerkProperties.java` for complete file

---

### ✅ File 2: ClerkIntegrationServiceImpl.java

**Location**: `src/main/java/com/nextjstemplate/service/impl/ClerkIntegrationServiceImpl.java`

**Find** the `generateOAuthUrl()` method and **replace this line**:

```java
// REMOVE THIS:
String clerkOAuthBaseUrl = clerkProperties.getApiUrl().replace("/v1", "") + "/oauth/authorize";

// REPLACE WITH:
String clerkFrontendApi = clerkProperties.getFrontendApi();
if (!clerkFrontendApi.startsWith("http://") && !clerkFrontendApi.startsWith("https://")) {
    clerkFrontendApi = "https://" + clerkFrontendApi;
}
if (clerkFrontendApi.endsWith("/")) {
    clerkFrontendApi = clerkFrontendApi.substring(0, clerkFrontendApi.length() - 1);
}
String clerkOAuthBaseUrl = clerkFrontendApi + "/oauth/authorize";
```

**Reference**: See `backend_reference_code/ClerkIntegrationServiceImpl_generateOAuthUrl.java` for complete method

---

### ✅ File 3: application-dev.yml

**Location**: `src/main/resources/application-dev.yml`

**Add this line** to your `clerk:` section:

```yaml
clerk:
  api-url: ${CLERK_API_URL:https://api.clerk.com/v1}
  secret-key: ${CLERK_SECRET_KEY}
  publishable-key: ${CLERK_PUBLISHABLE_KEY}
  frontend-api: ${CLERK_FRONTEND_API:https://humble-monkey-3.clerk.accounts.dev}  # ADD THIS
```

**Reference**: See `backend_reference_code/application-dev.yml_clerk_section`

---

## Quick Commands

```bash
# Stop backend server
# Press Ctrl+C in terminal

# Restart backend server
./mvnw spring-boot:run

# Or if using Gradle:
./gradlew bootRun
```

---

## Expected Result

### Before:
```
Generated OAuth URL: https://api.clerk.com/oauth/authorize?...
Browser: 404 Page Not Found ❌
```

### After:
```
Generated OAuth URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?...
Browser: Clerk OAuth page loads → Google login ✅
```

---

## Verification

After restarting backend, click social login button and check logs:

**Look for**:
```
DEBUG [ClerkIntegrationServiceImpl] Using Clerk Frontend API: https://humble-monkey-3.clerk.accounts.dev
DEBUG [ClerkIntegrationServiceImpl] Generated OAuth URL: https://humble-monkey-3.clerk.accounts.dev/oauth/authorize?...
```

**Should NOT see**:
```
Generated OAuth URL: https://api.clerk.com/oauth/authorize?...
```

---

## All Reference Files Created

In `backend_reference_code/` directory:
1. ✅ `ClerkProperties.java` - Complete updated class
2. ✅ `ClerkIntegrationServiceImpl_generateOAuthUrl.java` - Updated method
3. ✅ `application-dev.yml_clerk_section` - YAML configuration

---

## Full Documentation

For detailed step-by-step guide, see: **`BACKEND_CLERK_URL_IMPLEMENTATION_GUIDE.md`**
