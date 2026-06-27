// THIS IS A PARTIAL FILE - ONLY THE METHOD THAT NEEDS TO BE UPDATED
// Location: src/main/java/com/nextjstemplate/service/impl/ClerkIntegrationServiceImpl.java

/**
 * Generate OAuth authorization URL for a given provider
 *
 * UPDATED: Now uses Frontend API URL instead of REST API URL
 *
 * @param provider OAuth provider (google, facebook, github, etc.)
 * @param redirectUri Backend callback URL
 * @param state CSRF protection state token
 * @return Full OAuth authorization URL
 */
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
