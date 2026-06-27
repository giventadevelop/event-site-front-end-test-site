package com.nextjstemplate.service.impl;

import com.nextjstemplate.domain.EventMedia;
import com.nextjstemplate.repository.EventMediaRepository;
import com.nextjstemplate.repository.EventSponsorsJoinRepository;
import com.nextjstemplate.service.EventMediaService;
import com.nextjstemplate.service.S3Service;
import com.nextjstemplate.service.dto.EventMediaDTO;
import com.nextjstemplate.service.dto.EventSponsorsJoinDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service implementation for Event Media operations.
 * Add this method to your existing EventMediaServiceImpl.java file.
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
     * Upload custom poster for event-sponsor combination
     * Updates event_sponsors_join.custom_poster_url field
     *
     * @param eventId Event ID
     * @param sponsorId Sponsor ID
     * @param file Uploaded file
     * @param tenantId Tenant ID
     * @param isPublic Whether the media is public
     * @param title Optional title
     * @param description Optional description
     * @param startDisplayingFromDate Optional start date (YYYY-MM-DD format)
     * @return Created EventMediaDTO
     */
    @Override
    public EventMediaDTO uploadEventSponsorJoinPoster(
        Long eventId,
        Long sponsorId,
        MultipartFile file,
        String tenantId,
        Boolean isPublic,
        String title,
        String description,
        String startDisplayingFromDate
    ) {
        // 1. Find or create event_sponsors_join record
        EventSponsorsJoinDTO joinRecord = eventSponsorsJoinRepository
            .findByEventIdAndSponsorId(eventId, sponsorId)
            .orElseThrow(() -> new RuntimeException(
                "Event-sponsor association not found: eventId=" + eventId + ", sponsorId=" + sponsorId
            ));

        // 2. Generate S3 path using the specified format:
        // dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsors/sponsor_id/{sponsorId}/{filename}
        String s3Path = s3Config.generateEventSponsorPosterPath(
            tenantId,
            eventId,
            sponsorId,
            file.getOriginalFilename()
        );

        // 3. Upload to S3
        String s3Url = s3Service.uploadFile(file, s3Path);

        // 4. Create EventMedia record
        EventMediaDTO mediaDTO = new EventMediaDTO();
        mediaDTO.setEventSponsorsJoinId(joinRecord.getId());
        mediaDTO.setEventId(eventId);
        mediaDTO.setSponsorId(sponsorId);
        mediaDTO.setTitle(title != null && !title.isEmpty()
            ? title
            : "Custom Poster - Event " + eventId + " - Sponsor " + sponsorId);
        mediaDTO.setDescription(description != null && !description.isEmpty()
            ? description
            : "Custom poster for event-sponsor combination");
        mediaDTO.setFileUrl(s3Url);
        mediaDTO.setEventMediaType("EVENT_SPONSOR_POSTER");
        mediaDTO.setStorageType("S3");
        mediaDTO.setIsPublic(isPublic != null ? isPublic : true);
        mediaDTO.setTenantId(tenantId);
        mediaDTO.setPriorityRanking(0); // Default to highest priority

        // Set startDisplayingFromDate (required field)
        if (startDisplayingFromDate != null && !startDisplayingFromDate.isEmpty()) {
            try {
                mediaDTO.setStartDisplayingFromDate(LocalDate.parse(startDisplayingFromDate));
            } catch (Exception e) {
                // If parsing fails, use today's date
                mediaDTO.setStartDisplayingFromDate(LocalDate.now());
            }
        } else {
            mediaDTO.setStartDisplayingFromDate(LocalDate.now());
        }

        // Set other required fields
        mediaDTO.setCreatedAt(LocalDateTime.now());
        mediaDTO.setUpdatedAt(LocalDateTime.now());

        EventMediaDTO savedMedia = eventMediaRepository.save(mediaDTO);

        // 5. Update event_sponsors_join table
        joinRecord.setCustomPosterUrl(s3Url);
        eventSponsorsJoinRepository.save(joinRecord);

        return savedMedia;
    }
}


