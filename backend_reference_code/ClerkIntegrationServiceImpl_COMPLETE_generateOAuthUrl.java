// COMPLETE generateOAuthUrl() METHOD - READY TO COPY/PASTE
// Location: src/main/java/com/nextjstemplate/service/impl/ClerkIntegrationServiceImpl.java
//
// INSTRUCTIONS:
// 1. Open ClerkIntegrationServiceImpl.java in your backend project
// 2. Find the existing generateOAuthUrl() method
// 3. Replace the ENTIRE method with this code below
// 4. Save the file
// 5. Rebuild and restart backend

@Override
public String generateOAuthUrl(String provider, String redirectUri, String state) {
    log.debug("Generating OAuth URL for provider: {} with redirect: {}", provider, redirectUri);

    // FIXED: Use Frontend API URL instead of API URL
    String clerkFrontendApi = clerkProperties.getFrontendApi();

    log.debug("Raw Frontend API from properties: {}", clerkFrontendApi);

    // Ensure URL has https:// prefix
    if (!clerkFrontendApi.startsWith("http://") && !clerkFrontendApi.startsWith("https://")) {
        clerkFrontendApi = "https://" + clerkFrontendApi;
        log.debug("Added https:// prefix: {}", clerkFrontendApi);
    }

    // Remove trailing slash if present
    if (clerkFrontendApi.endsWith("/")) {
        clerkFrontendApi = clerkFrontendApi.substring(0, clerkFrontendApi.length() - 1);
        log.debug("Removed trailing slash: {}", clerkFrontendApi);
    }

    // Build OAuth URL using Frontend API
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
