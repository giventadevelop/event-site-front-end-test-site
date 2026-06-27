package com.nextjstemplate.web.rest;

import com.nextjstemplate.service.EventMediaService;
import com.nextjstemplate.service.dto.EventMediaDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for Event Media operations.
 * Add this endpoint to your existing EventMediaResource.java file.
 */
@RestController
@RequestMapping("/api/event-medias")
public class EventMediaResource {

    private final EventMediaService eventMediaService;

    public EventMediaResource(EventMediaService eventMediaService) {
        this.eventMediaService = eventMediaService;
    }

    /**
     * Upload custom poster for event-sponsor combination
     * POST /api/event-medias/upload/event-sponsor-poster
     *
     * Creates EventMedia record and updates event_sponsors_join.custom_poster_url
     *
     * S3 Path Format: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}
     */
    @PostMapping("/upload/event-sponsor-poster")
    public ResponseEntity<EventMediaDTO> uploadEventSponsorPoster(
        @RequestParam Long eventId,
        @RequestParam Long sponsorId,
        @RequestParam("file") MultipartFile file,
        @RequestParam String tenantId,
        @RequestParam(required = false, defaultValue = "true") Boolean isPublic,
        @RequestParam(required = false) String title,
        @RequestParam(required = false) String description,
        @RequestParam(required = false) String startDisplayingFromDate
    ) {
        EventMediaDTO media = eventMediaService.uploadEventSponsorJoinPoster(
            eventId,
            sponsorId,
            file,
            tenantId,
            isPublic,
            title,
            description,
            startDisplayingFromDate
        );
        return ResponseEntity.ok(media);
    }
}


