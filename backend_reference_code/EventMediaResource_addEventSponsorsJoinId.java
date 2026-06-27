package com.nextjstemplate.web.rest;

import com.nextjstemplate.service.EventMediaService;
import com.nextjstemplate.service.dto.EventMediaDTO;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.NotNull;
import java.net.URISyntaxException;

/**
 * REST Controller for Event Media operations.
 *
 * ADD THIS PARAMETER to the existing uploadFile method:
 * @RequestParam(value = "eventSponsorsJoinId", required = false) Long eventSponsorsJoinId
 *
 * And ensure the service method sets it on the EventMediaDTO and updates event_sponsors_join.custom_poster_url
 */
@RestController
@RequestMapping("/api/event-medias")
public class EventMediaResource {

    private final EventMediaService eventMediaService;

    public EventMediaResource(EventMediaService eventMediaService) {
        this.eventMediaService = eventMediaService;
    }

    /**
     * Upload file endpoint - ADD eventSponsorsJoinId parameter here
     *
     * LOCATION: src/main/java/com/nextjstemplate/web/rest/EventMediaResource.java
     * METHOD: uploadFile
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EventMediaDTO> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "eventId", required = false) Long eventId,
        @RequestParam(value = "executiveTeamMemberID", required = false) Long executiveTeamMemberID,
        @RequestParam("title") @NotNull String title,
        @RequestParam(value = "description", required = false) String description,
        @RequestParam("tenantId") String tenantId,
        @RequestParam(value = "isPublic", required = false) Boolean isPublic,
        @RequestParam(value = "eventFlyer", required = false) Boolean eventFlyer,
        @RequestParam(value = "isEventManagementOfficialDocument", required = false) Boolean isEventManagementOfficialDocument,
        @RequestParam(value = "isHeroImage", required = false) Boolean isHeroImage,
        @RequestParam(value = "isActiveHeroImage", required = false) Boolean isActiveHeroImage,
        @RequestParam(value = "isTeamMemberProfileImage", required = false) Boolean isTeamMemberProfileImage,
        @RequestParam(value = "isHomePageHeroImage", required = false) Boolean isHomePageHeroImage,
        @RequestParam(value = "isFeaturedEventImage", required = false) Boolean isFeaturedEventImage,
        @RequestParam(value = "isLiveEventImage", required = false) Boolean isLiveEventImage,
        @RequestParam(value = "startDisplayingFromDate", required = false) String startDisplayingFromDate,

        // New entity-specific upload parameters
        @RequestParam(value = "isFeaturedPerformerPortrait", required = false) Boolean isFeaturedPerformerPortrait,
        @RequestParam(value = "isFeaturedPerformerPerformance", required = false) Boolean isFeaturedPerformerPerformance,
        @RequestParam(value = "isFeaturedPerformerGallery", required = false) Boolean isFeaturedPerformerGallery,
        @RequestParam(value = "isSponsorLogo", required = false) Boolean isSponsorLogo,
        @RequestParam(value = "isSponsorHero", required = false) Boolean isSponsorHero,
        @RequestParam(value = "isSponsorBanner", required = false) Boolean isSponsorBanner,
        @RequestParam(value = "isContactPhoto", required = false) Boolean isContactPhoto,
        @RequestParam(value = "isProgramDirectorPhoto", required = false) Boolean isProgramDirectorPhoto,
        @RequestParam(value = "entityId", required = false) Long entityId,
        @RequestParam(value = "entityType", required = false) String entityType,
        @RequestParam(value = "imageType", required = false) String imageType,

        // ✅ ADD THIS PARAMETER:
        @RequestParam(value = "eventSponsorsJoinId", required = false) Long eventSponsorsJoinId,

        // ✅ ADD THESE PARAMETERS FOR EVENT-SPONSOR POSTER:
        @RequestParam(value = "sponsorId", required = false) Long sponsorId,
        @RequestParam(value = "eventMediaType", required = false) String eventMediaType,
        @RequestParam(value = "storageType", required = false) String storageType,

        Authentication authentication
    ) throws URISyntaxException {

        // Call service method - pass eventSponsorsJoinId
        EventMediaDTO mediaDTO = eventMediaService.uploadFile(
            file,
            eventId,
            executiveTeamMemberID,
            title,
            description,
            tenantId,
            isPublic,
            eventFlyer,
            isEventManagementOfficialDocument,
            isHeroImage,
            isActiveHeroImage,
            isTeamMemberProfileImage,
            isHomePageHeroImage,
            isFeaturedEventImage,
            isLiveEventImage,
            startDisplayingFromDate,
            isFeaturedPerformerPortrait,
            isFeaturedPerformerPerformance,
            isFeaturedPerformerGallery,
            isSponsorLogo,
            isSponsorHero,
            isSponsorBanner,
            isContactPhoto,
            isProgramDirectorPhoto,
            entityId,
            entityType,
            imageType,
            eventSponsorsJoinId,  // ✅ PASS THIS PARAMETER
            sponsorId,             // ✅ PASS THIS PARAMETER
            eventMediaType,        // ✅ PASS THIS PARAMETER
            storageType,           // ✅ PASS THIS PARAMETER
            authentication
        );

        return ResponseEntity.ok(mediaDTO);
    }
}

