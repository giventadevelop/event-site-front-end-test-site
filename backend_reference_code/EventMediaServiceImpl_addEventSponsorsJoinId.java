package com.nextjstemplate.service.impl;

import com.nextjstemplate.domain.EventMedia;
import com.nextjstemplate.repository.EventMediaRepository;
import com.nextjstemplate.repository.EventSponsorsJoinRepository;
import com.nextjstemplate.service.EventMediaService;
import com.nextjstemplate.service.S3Service;
import com.nextjstemplate.service.dto.EventMediaDTO;
import com.nextjstemplate.service.dto.EventSponsorsJoinDTO;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service implementation for Event Media operations.
 *
 * UPDATE THE uploadFile METHOD to:
 * 1. Accept eventSponsorsJoinId parameter
 * 2. Set eventSponsorsJoinId on EventMediaDTO before saving
 * 3. If eventMediaType is "EVENT_SPONSOR_POSTER" and eventSponsorsJoinId is provided:
 *    - Update event_sponsors_join.custom_poster_url with the S3 URL
 *    - Generate S3 path: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}
 *
 * LOCATION: src/main/java/com/nextjstemplate/service/impl/EventMediaServiceImpl.java
 */
@Service
@Transactional
public class EventMediaServiceImpl implements EventMediaService {

    private final EventMediaRepository eventMediaRepository;
    private final EventSponsorsJoinRepository eventSponsorsJoinRepository;
    private final S3Service s3Service;
    private final S3Config s3Config;

    public EventMediaServiceImpl(
        EventMediaRepository eventMediaRepository,
        EventSponsorsJoinRepository eventSponsorsJoinRepository,
        S3Service s3Service,
        S3Config s3Config
    ) {
        this.eventMediaRepository = eventMediaRepository;
        this.eventSponsorsJoinRepository = eventSponsorsJoinRepository;
        this.s3Service = s3Service;
        this.s3Config = s3Config;
    }

    /**
     * Upload file method - ADD eventSponsorsJoinId parameter and handle EVENT_SPONSOR_POSTER type
     *
     * ADD THIS PARAMETER to method signature:
     * Long eventSponsorsJoinId,
     * Long sponsorId,
     * String eventMediaType,
     * String storageType
     */
    @Override
    public EventMediaDTO uploadFile(
        MultipartFile file,
        Long eventId,
        Long executiveTeamMemberID,
        String title,
        String description,
        String tenantId,
        Boolean isPublic,
        Boolean eventFlyer,
        Boolean isEventManagementOfficialDocument,
        Boolean isHeroImage,
        Boolean isActiveHeroImage,
        Boolean isTeamMemberProfileImage,
        Boolean isHomePageHeroImage,
        Boolean isFeaturedEventImage,
        Boolean isLiveEventImage,
        String startDisplayingFromDate,
        Boolean isFeaturedPerformerPortrait,
        Boolean isFeaturedPerformerPerformance,
        Boolean isFeaturedPerformerGallery,
        Boolean isSponsorLogo,
        Boolean isSponsorHero,
        Boolean isSponsorBanner,
        Boolean isContactPhoto,
        Boolean isProgramDirectorPhoto,
        Long entityId,
        String entityType,
        String imageType,
        Long eventSponsorsJoinId,  // ✅ ADD THIS PARAMETER
        Long sponsorId,             // ✅ ADD THIS PARAMETER
        String eventMediaType,      // ✅ ADD THIS PARAMETER
        String storageType,         // ✅ ADD THIS PARAMETER
        Authentication authentication
    ) {
        // ... existing upload logic ...

        // ✅ ADD THIS: Handle EVENT_SPONSOR_POSTER type
        if (eventMediaType != null && eventMediaType.equals("EVENT_SPONSOR_POSTER")
            && eventSponsorsJoinId != null && eventId != null && sponsorId != null) {

            // 1. Generate S3 path for event-sponsor poster
            String s3Path = s3Config.generateEventSponsorPosterPath(
                tenantId,
                eventId,
                sponsorId,
                file.getOriginalFilename()
            );

            // 2. Upload to S3
            String s3Url = s3Service.uploadFile(file, s3Path);

            // 3. Create EventMediaDTO
            EventMediaDTO mediaDTO = new EventMediaDTO();
            mediaDTO.setEventId(eventId);
            mediaDTO.setSponsorId(sponsorId);
            mediaDTO.setEventSponsorsJoinId(eventSponsorsJoinId); // ✅ SET THIS FIELD
            mediaDTO.setTitle(title);
            mediaDTO.setDescription(description != null ? description : "Custom poster for event-sponsor combination");
            mediaDTO.setFileUrl(s3Url);
            mediaDTO.setEventMediaType(eventMediaType);
            mediaDTO.setStorageType(storageType != null ? storageType : "S3");
            mediaDTO.setIsPublic(isPublic != null ? isPublic : true);
            mediaDTO.setTenantId(tenantId);
            mediaDTO.setPriorityRanking(0);

            // Set startDisplayingFromDate
            if (startDisplayingFromDate != null && !startDisplayingFromDate.isEmpty()) {
                try {
                    mediaDTO.setStartDisplayingFromDate(LocalDate.parse(startDisplayingFromDate));
                } catch (Exception e) {
                    mediaDTO.setStartDisplayingFromDate(LocalDate.now());
                }
            } else {
                mediaDTO.setStartDisplayingFromDate(LocalDate.now());
            }

            // Set timestamps
            mediaDTO.setCreatedAt(LocalDateTime.now());
            mediaDTO.setUpdatedAt(LocalDateTime.now());

            // Set other required boolean fields
            mediaDTO.setEventFlyer(eventFlyer != null ? eventFlyer : false);
            mediaDTO.setIsEventManagementOfficialDocument(isEventManagementOfficialDocument != null ? isEventManagementOfficialDocument : false);
            mediaDTO.setIsHeroImage(isHeroImage != null ? isHeroImage : false);
            mediaDTO.setIsActiveHeroImage(isActiveHeroImage != null ? isActiveHeroImage : false);
            mediaDTO.setIsHomePageHeroImage(isHomePageHeroImage != null ? isHomePageHeroImage : false);
            mediaDTO.setIsFeaturedEventImage(isFeaturedEventImage != null ? isFeaturedEventImage : false);
            mediaDTO.setIsLiveEventImage(isLiveEventImage != null ? isLiveEventImage : false);

            // 4. Save EventMedia record
            EventMediaDTO savedMedia = eventMediaRepository.save(mediaDTO);

            // 5. Update event_sponsors_join.custom_poster_url
            try {
                EventSponsorsJoinDTO joinRecord = eventSponsorsJoinRepository.findById(eventSponsorsJoinId)
                    .orElseThrow(() -> new RuntimeException(
                        "Event-sponsor association not found: eventSponsorsJoinId=" + eventSponsorsJoinId
                    ));

                joinRecord.setCustomPosterUrl(s3Url);
                eventSponsorsJoinRepository.save(joinRecord);
            } catch (Exception e) {
                // Log error but don't fail the upload
                System.err.println("Warning: Could not update event_sponsors_join.custom_poster_url: " + e.getMessage());
            }

            return savedMedia;
        }

        // ... existing logic for other upload types ...
        // Make sure to set eventSponsorsJoinId on EventMediaDTO if provided:
        // if (eventSponsorsJoinId != null) {
        //     mediaDTO.setEventSponsorsJoinId(eventSponsorsJoinId);
        // }

        // Return existing logic result
        return null; // Replace with actual return
    }
}

