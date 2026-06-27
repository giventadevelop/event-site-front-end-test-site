package com.nextjstemplate.config;

import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * S3 Configuration for path generation.
 *
 * ADD THIS METHOD to your existing S3Config.java file:
 * LOCATION: src/main/java/com/nextjstemplate/config/S3Config.java
 */
@Component
public class S3Config {

    /**
     * Generate S3 path for event-sponsor poster images
     * Path format: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}
     *
     * Example: dev/events/tenantId/tenant_demo_002/event-id/2/sponsors/sponsor_id/4/custom_poster_1762568938282_cb7bb032.jpeg
     *
     * @param tenantId Tenant ID
     * @param eventId Event ID
     * @param sponsorId Sponsor ID
     * @param originalFilename Original filename from upload
     * @return S3 path string
     */
    public String generateEventSponsorPosterPath(String tenantId, Long eventId, Long sponsorId, String originalFilename) {
        // Sanitize filename
        String sanitizedFilename = sanitizeFilename(originalFilename);
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uniqueFilename = generateUniqueFilename(sanitizedFilename, timestamp);

        return String.format(
            "dev/events/tenantId/%s/event-id/%d/sponsors/sponsor_id/%d/%s",
            tenantId,
            eventId,
            sponsorId,
            uniqueFilename
        );
    }

    /**
     * Sanitize filename - remove special characters, keep alphanumeric, dots, hyphens, underscores
     *
     * @param filename Original filename
     * @return Sanitized filename
     */
    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "file";
        }
        // Remove special characters, keep alphanumeric, dots, hyphens, underscores
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    /**
     * Generate unique filename with timestamp and random string
     *
     * @param filename Base filename
     * @param timestamp Timestamp string
     * @return Unique filename with timestamp and UUID
     */
    private String generateUniqueFilename(String filename, String timestamp) {
        String baseName = filename;
        String extension = "";

        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
            baseName = filename.substring(0, lastDot);
            extension = filename.substring(lastDot);
        }

        // Generate random UUID (first 8 characters)
        String uuid = UUID.randomUUID().toString().substring(0, 8);

        return String.format("%s_%s_%s%s", baseName, timestamp, uuid, extension);
    }
}

