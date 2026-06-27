package com.nextjstemplate.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Clerk Configuration Properties
 *
 * Maps to clerk.* properties in application.yml
 */
@Component
@ConfigurationProperties(prefix = "clerk")
public class ClerkProperties {

    private String publishableKey;
    private String secretKey;
    private String webhookSecret;
    private String frontendApi;  // NEW: Added for OAuth

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
     * Clerk Secret Key (for backend authentication)
     */
    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    /**
     * Clerk Webhook Secret (for webhook signature verification)
     */
    public String getWebhookSecret() {
        return webhookSecret;
    }

    public void setWebhookSecret(String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }

    /**
     * Clerk Frontend API URL (for OAuth and user-facing operations)
     *
     * Example: https://humble-monkey-3.clerk.accounts.dev
     *
     * This is different from the REST API URL (api.clerk.com) which is used
     * for backend API calls. The Frontend API URL is used for OAuth authorization
     * and other user-facing Clerk operations.
     *
     * NEW PROPERTY - Added for OAuth implementation
     */
    public String getFrontendApi() {
        return frontendApi;
    }

    public void setFrontendApi(String frontendApi) {
        this.frontendApi = frontendApi;
    }
}
