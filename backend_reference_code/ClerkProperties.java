package com.nextjstemplate.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Clerk Configuration Properties
 *
 * Binds clerk.* properties from application.yml
 */
@Component
@ConfigurationProperties(prefix = "clerk")
public class ClerkProperties {

    private String apiUrl;
    private String secretKey;
    private String publishableKey;
    private String frontendApi;  // NEW: Frontend API URL for OAuth

    /**
     * Clerk REST API URL (for backend API calls)
     * Example: https://api.clerk.com/v1
     */
    public String getApiUrl() {
        return apiUrl;
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    /**
     * Clerk Secret Key (for backend authentication)
     */
    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    /**
     * Clerk Publishable Key (for frontend)
     */
    public String getPublishableKey() {
        return publishableKey;
    }

    public void setPublishableKey(String publishableKey) {
        this.publishableKey = publishableKey;
    }

    /**
     * Clerk Frontend API URL (for OAuth and user-facing operations)
     * Example: https://humble-monkey-3.clerk.accounts.dev
     *
     * NEW PROPERTY ADDED FOR OAUTH
     */
    public String getFrontendApi() {
        return frontendApi;
    }

    public void setFrontendApi(String frontendApi) {
        this.frontendApi = frontendApi;
    }
}
