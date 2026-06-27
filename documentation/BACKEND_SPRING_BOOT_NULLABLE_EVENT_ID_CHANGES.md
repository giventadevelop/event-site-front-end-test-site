# Backend Spring Boot Changes: Nullable event_id Support

## Overview

This document outlines all required changes to the Spring Boot backend (`E:\project_workspace\malayalees-us-site-boot`) to support nullable `event_id` fields in the following tables:

- `event_featured_performers`
- `event_contacts`
- `event_emails`
- `event_program_directors`

**Goal:** Allow entities to be associated with multiple events, disassociated from events (without deletion), and exist as tenant-level entities without event association.

---

## 1. Entity Classes Changes

### Files to Modify

1. `EventFeaturedPerformers.java`
2. `EventContacts.java`
3. `EventEmails.java`
4. `EventProgramDirectors.java`

### Required Changes

#### Change `@JoinColumn` to allow nullable events

**Before:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "event_id", nullable = false)
private EventDetails event;
```

**After:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "event_id", nullable = true)  // Changed from false to true
private EventDetails event;
```

### Complete Entity Examples

#### Example 1: EventFeaturedPerformers.java

```java
@Entity
@Table(name = "event_featured_performers")
public class EventFeaturedPerformers implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @Column(name = "tenant_id")
    private String tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = true)  // ✅ Changed to nullable = true
    private EventDetails event;

    @Column(name = "name", nullable = false)
    private String name;

    // ... rest of fields remain unchanged

    // Getters and setters
    public EventDetails getEvent() {
        return event;
    }

    public void setEvent(EventDetails event) {
        this.event = event;  // Can now be null
    }

    // ... rest of getters/setters
}
```

#### Example 2: EventContacts.java

```java
@Entity
@Table(name = "event_contacts")
public class EventContacts implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @Column(name = "tenant_id")
    private String tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = true)  // ✅ Changed to nullable = true
    private EventDetails event;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "email")
    private String email;

    // ... timestamps and other fields

    // Getters and setters
    public EventDetails getEvent() {
        return event;
    }

    public void setEvent(EventDetails event) {
        this.event = event;  // Can now be null
    }

    // ... rest of getters/setters
}
```

#### Example 3: EventEmails.java

```java
@Entity
@Table(name = "event_emails")
public class EventEmails implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @Column(name = "tenant_id")
    private String tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = true)  // ✅ Changed to nullable = true
    private EventDetails event;

    @Column(name = "email", nullable = false)
    private String email;

    // ... timestamps

    // Getters and setters
    public EventDetails getEvent() {
        return event;
    }

    public void setEvent(EventDetails event) {
        this.event = event;  // Can now be null
    }

    // ... rest of getters/setters
}
```

#### Example 4: EventProgramDirectors.java

```java
@Entity
@Table(name = "event_program_directors")
public class EventProgramDirectors implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @Column(name = "tenant_id")
    private String tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = true)  // ✅ Changed to nullable = true
    private EventDetails event;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "bio")
    private String bio;

    // ... timestamps

    // Getters and setters
    public EventDetails getEvent() {
        return event;
    }

    public void setEvent(EventDetails event) {
        this.event = event;  // Can now be null
    }

    // ... rest of getters/setters
}
```

---

## 2. DTO Classes Changes

### Files to Modify

1. `EventFeaturedPerformersDTO.java`
2. `EventContactsDTO.java`
3. `EventEmailsDTO.java`
4. `EventProgramDirectorsDTO.java`

### Required Changes

#### Ensure event field can be null in DTOs

**Before:**
```java
@JsonProperty("event")
private EventDetailsDTO event;
```

**After:**
```java
@JsonProperty("event")
private EventDetailsDTO event;  // Already nullable by default, but ensure validation allows null
```

#### Update Validation Annotations (if present)

Remove any `@NotNull` or `@Valid` annotations on the `event` field if they exist:

**Before:**
```java
@NotNull
@Valid
@JsonProperty("event")
private EventDetailsDTO event;
```

**After:**
```java
@Valid  // Keep @Valid if event is provided, but remove @NotNull
@JsonProperty("event")
private EventDetailsDTO event;  // Can be null
```

### Complete DTO Examples

#### Example: EventContactsDTO.java

```java
public class EventContactsDTO implements Serializable {

    private Long id;
    private String tenantId;
    private EventDetailsDTO event;  // ✅ Can be null - no @NotNull annotation
    private String name;
    private String phone;
    private String email;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    // Getters and setters
    public EventDetailsDTO getEvent() {
        return event;
    }

    public void setEvent(EventDetailsDTO event) {
        this.event = event;  // Can be null
    }

    // ... rest of getters/setters
}
```

---

## 3. Repository Changes

### Files to Modify

1. `EventFeaturedPerformersRepository.java`
2. `EventContactsRepository.java`
3. `EventEmailsRepository.java`
4. `EventProgramDirectorsRepository.java`

### Required Changes

#### Add methods to find tenant-level entities (where event_id IS NULL)

**Add these query methods to each repository:**

```java
@Repository
public interface EventContactsRepository extends JpaRepository<EventContacts, Long>, JpaSpecificationExecutor<EventContacts> {

    // Existing methods...

    // ✅ NEW: Find all contacts for a tenant that are NOT associated with any event
    @Query("SELECT ec FROM EventContacts ec WHERE ec.tenantId = :tenantId AND ec.event IS NULL")
    List<EventContacts> findByTenantIdAndEventIsNull(@Param("tenantId") String tenantId);

    // ✅ NEW: Find all contacts for a tenant that are NOT associated with a specific event
    @Query("SELECT ec FROM EventContacts ec WHERE ec.tenantId = :tenantId AND (ec.event IS NULL OR ec.event.id != :eventId)")
    List<EventContacts> findByTenantIdAndEventIsNullOrNotEqualToEventId(
        @Param("tenantId") String tenantId,
        @Param("eventId") Long eventId
    );

    // ✅ NEW: Find contacts by tenant and event (existing event or null)
    List<EventContacts> findByTenantIdAndEventId(String tenantId, Long eventId);

    // ✅ NEW: Find contacts by tenant only (all contacts regardless of event)
    List<EventContacts> findByTenantId(String tenantId);

    // ✅ NEW: Count tenant-level contacts (where event is null)
    long countByTenantIdAndEventIsNull(String tenantId);
}
```

#### Repeat for other repositories:

**EventFeaturedPerformersRepository.java:**
```java
@Query("SELECT efp FROM EventFeaturedPerformers efp WHERE efp.tenantId = :tenantId AND efp.event IS NULL")
List<EventFeaturedPerformers> findByTenantIdAndEventIsNull(@Param("tenantId") String tenantId);

@Query("SELECT efp FROM EventFeaturedPerformers efp WHERE efp.tenantId = :tenantId AND (efp.event IS NULL OR efp.event.id != :eventId)")
List<EventFeaturedPerformers> findByTenantIdAndEventIsNullOrNotEqualToEventId(
    @Param("tenantId") String tenantId,
    @Param("eventId") Long eventId
);

List<EventFeaturedPerformers> findByTenantIdAndEventId(String tenantId, Long eventId);
List<EventFeaturedPerformers> findByTenantId(String tenantId);
long countByTenantIdAndEventIsNull(String tenantId);
```

**EventEmailsRepository.java:**
```java
@Query("SELECT ee FROM EventEmails ee WHERE ee.tenantId = :tenantId AND ee.event IS NULL")
List<EventEmails> findByTenantIdAndEventIsNull(@Param("tenantId") String tenantId);

@Query("SELECT ee FROM EventEmails ee WHERE ee.tenantId = :tenantId AND (ee.event IS NULL OR ee.event.id != :eventId)")
List<EventEmails> findByTenantIdAndEventIsNullOrNotEqualToEventId(
    @Param("tenantId") String tenantId,
    @Param("eventId") Long eventId
);

List<EventEmails> findByTenantIdAndEventId(String tenantId, Long eventId);
List<EventEmails> findByTenantId(String tenantId);
long countByTenantIdAndEventIsNull(String tenantId);
```

**EventProgramDirectorsRepository.java:**
```java
@Query("SELECT epd FROM EventProgramDirectors epd WHERE epd.tenantId = :tenantId AND epd.event IS NULL")
List<EventProgramDirectors> findByTenantIdAndEventIsNull(@Param("tenantId") String tenantId);

@Query("SELECT epd FROM EventProgramDirectors epd WHERE epd.tenantId = :tenantId AND (epd.event IS NULL OR epd.event.id != :eventId)")
List<EventProgramDirectors> findByTenantIdAndEventIsNullOrNotEqualToEventId(
    @Param("tenantId") String tenantId,
    @Param("eventId") Long eventId
);

List<EventProgramDirectors> findByTenantIdAndEventId(String tenantId, Long eventId);
List<EventProgramDirectors> findByTenantId(String tenantId);
long countByTenantIdAndEventIsNull(String tenantId);
```

---

## 4. Service Layer Changes

### Files to Modify

1. `EventFeaturedPerformersService.java`
2. `EventContactsService.java`
3. `EventEmailsService.java`
4. `EventProgramDirectorsService.java`

### Required Changes

#### Update business logic to handle nullable events

#### Example: EventContactsService.java

```java
@Service
@Transactional
public class EventContactsService {

    private final EventContactsRepository eventContactsRepository;
    private final EventDetailsRepository eventDetailsRepository;

    // Constructor injection...

    /**
     * Save an event contact.
     * Event can be null for tenant-level contacts.
     */
    public EventContactsDTO save(EventContactsDTO eventContactsDTO) {
        log.debug("Request to save EventContacts : {}", eventContactsDTO);

        EventContacts eventContacts = eventContactsMapper.toEntity(eventContactsDTO);

        // ✅ Handle nullable event
        if (eventContactsDTO.getEvent() != null && eventContactsDTO.getEvent().getId() != null) {
            EventDetails event = eventDetailsRepository.findById(eventContactsDTO.getEvent().getId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
            eventContacts.setEvent(event);
        } else {
            eventContacts.setEvent(null);  // ✅ Explicitly set to null for tenant-level contact
        }

        eventContacts = eventContactsRepository.save(eventContacts);
        return eventContactsMapper.toDto(eventContacts);
    }

    /**
     * Get all tenant-level contacts (not associated with any event).
     */
    public List<EventContactsDTO> findAllTenantLevelContacts(String tenantId) {
        log.debug("Request to get all tenant-level EventContacts for tenant: {}", tenantId);
        List<EventContacts> contacts = eventContactsRepository.findByTenantIdAndEventIsNull(tenantId);
        return contacts.stream()
            .map(eventContactsMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get all contacts available to be associated with a specific event.
     * Returns tenant-level contacts + contacts from other events.
     */
    public List<EventContactsDTO> findAvailableContactsForEvent(String tenantId, Long eventId) {
        log.debug("Request to get available EventContacts for tenant: {} and event: {}", tenantId, eventId);
        List<EventContacts> contacts = eventContactsRepository
            .findByTenantIdAndEventIsNullOrNotEqualToEventId(tenantId, eventId);
        return contacts.stream()
            .map(eventContactsMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Disassociate a contact from an event (set event to null).
     */
    public EventContactsDTO disassociateFromEvent(Long contactId) {
        log.debug("Request to disassociate EventContact {} from event", contactId);

        EventContacts contact = eventContactsRepository.findById(contactId)
            .orElseThrow(() -> new EntityNotFoundException("Contact not found"));

        contact.setEvent(null);  // ✅ Disassociate by setting event to null
        contact = eventContactsRepository.save(contact);

        return eventContactsMapper.toDto(contact);
    }

    /**
     * Associate a contact with an event.
     * Checks for duplicate associations based on unique constraints.
     */
    public EventContactsDTO associateWithEvent(Long contactId, Long eventId) {
        log.debug("Request to associate EventContact {} with event {}", contactId, eventId);

        EventContacts contact = eventContactsRepository.findById(contactId)
            .orElseThrow(() -> new EntityNotFoundException("Contact not found"));

        EventDetails event = eventDetailsRepository.findById(eventId)
            .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        // ✅ Check for duplicate association
        List<EventContacts> existing = eventContactsRepository.findByTenantIdAndEventId(
            contact.getTenantId(),
            eventId
        );

        // Check if same contact (name+phone or email) already exists for this event
        boolean duplicate = existing.stream()
            .anyMatch(c ->
                (c.getName().equals(contact.getName()) &&
                 c.getPhone().equals(contact.getPhone())) ||
                (contact.getEmail() != null &&
                 contact.getEmail().equals(c.getEmail()) &&
                 c.getEmail() != null)
            );

        if (duplicate) {
            throw new BadRequestAlertException(
                "Contact already associated with this event",
                "eventContacts",
                "duplicateAssociation"
            );
        }

        contact.setEvent(event);
        contact = eventContactsRepository.save(contact);

        return eventContactsMapper.toDto(contact);
    }

    /**
     * Update existing methods to handle nullable events
     */
    @Transactional(readOnly = true)
    public List<EventContactsDTO> findAll(String tenantId) {
        log.debug("Request to get all EventContacts for tenant: {}", tenantId);
        return eventContactsRepository.findByTenantId(tenantId).stream()
            .map(eventContactsMapper::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EventContactsDTO> findByEventId(Long eventId) {
        log.debug("Request to get all EventContacts for event: {}", eventId);
        return eventContactsRepository.findByTenantIdAndEventId(null, eventId).stream()
            .map(eventContactsMapper::toDto)
            .collect(Collectors.toList());
    }
}
```

**Apply similar changes to:**
- `EventFeaturedPerformersService.java`
- `EventEmailsService.java`
- `EventProgramDirectorsService.java`

---

## 5. Controller/Resource Layer Changes

### Files to Modify

1. `EventFeaturedPerformersResource.java`
2. `EventContactsResource.java`
3. `EventEmailsResource.java`
4. `EventProgramDirectorsResource.java`

### Required Changes

#### Add endpoints for tenant-level entities and disassociation

#### Example: EventContactsResource.java

```java
@RestController
@RequestMapping("/api/event-contacts")
public class EventContactsResource {

    private final EventContactsService eventContactsService;

    // Constructor injection...

    /**
     * Create a new event contact.
     * Event can be null for tenant-level contacts.
     */
    @PostMapping("")
    public ResponseEntity<EventContactsDTO> createEventContacts(
        @Valid @RequestBody EventContactsDTO eventContactsDTO
    ) throws URISyntaxException {
        log.debug("REST request to save EventContacts : {}", eventContactsDTO);

        // ✅ Allow event to be null
        if (eventContactsDTO.getEvent() == null || eventContactsDTO.getEvent().getId() == null) {
            eventContactsDTO.setEvent(null);  // Ensure null for tenant-level contact
        }

        EventContactsDTO result = eventContactsService.save(eventContactsDTO);
        return ResponseEntity.created(new URI("/api/event-contacts/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(
                applicationName, true, ENTITY_NAME, result.getId().toString()
            ))
            .body(result);
    }

    /**
     * Get all tenant-level contacts (not associated with any event).
     */
    @GetMapping("/tenant-level")
    public ResponseEntity<List<EventContactsDTO>> getAllTenantLevelContacts(
        @RequestParam(required = false) String tenantId
    ) {
        log.debug("REST request to get all tenant-level EventContacts");

        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<EventContactsDTO> list = eventContactsService.findAllTenantLevelContacts(tenantId);
        return ResponseEntity.ok().body(list);
    }

    /**
     * Get all contacts available to be associated with a specific event.
     */
    @GetMapping("/available-for-event")
    public ResponseEntity<List<EventContactsDTO>> getAvailableContactsForEvent(
        @RequestParam(required = false) String tenantId,
        @RequestParam(required = false) Long eventId
    ) {
        log.debug("REST request to get available EventContacts for event: {}", eventId);

        if (tenantId == null || eventId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<EventContactsDTO> list = eventContactsService.findAvailableContactsForEvent(tenantId, eventId);
        return ResponseEntity.ok().body(list);
    }

    /**
     * Disassociate a contact from an event (set event to null).
     */
    @PatchMapping("/{id}/disassociate")
    public ResponseEntity<EventContactsDTO> disassociateFromEvent(@PathVariable Long id) {
        log.debug("REST request to disassociate EventContact {} from event", id);

        EventContactsDTO result = eventContactsService.disassociateFromEvent(id);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(
                applicationName, true, ENTITY_NAME, id.toString()
            ))
            .body(result);
    }

    /**
     * Associate a contact with an event.
     */
    @PatchMapping("/{id}/associate/{eventId}")
    public ResponseEntity<EventContactsDTO> associateWithEvent(
        @PathVariable Long id,
        @PathVariable Long eventId
    ) {
        log.debug("REST request to associate EventContact {} with event {}", id, eventId);

        try {
            EventContactsDTO result = eventContactsService.associateWithEvent(id, eventId);
            return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(
                    applicationName, true, ENTITY_NAME, id.toString()
                ))
                .body(result);
        } catch (BadRequestAlertException e) {
            return ResponseEntity.badRequest()
                .headers(HeaderUtil.createFailureAlert(
                    applicationName, true, ENTITY_NAME, "duplicateAssociation", e.getMessage()
                ))
                .body(null);
        }
    }

    /**
     * Update existing GET endpoint to handle nullable events
     */
    @GetMapping("")
    public ResponseEntity<List<EventContactsDTO>> getAllEventContacts(
        @RequestParam(required = false) String tenantId,
        @RequestParam(required = false) Long eventId
    ) {
        log.debug("REST request to get a page of EventContacts");

        List<EventContactsDTO> list;

        if (eventId != null && tenantId != null) {
            // Get contacts for specific event
            list = eventContactsService.findByEventId(eventId);
        } else if (tenantId != null) {
            // Get all contacts for tenant (including tenant-level)
            list = eventContactsService.findAll(tenantId);
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().body(list);
    }

    /**
     * Update existing GET by ID endpoint - no changes needed, but ensure it handles null event
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventContactsDTO> getEventContacts(@PathVariable Long id) {
        log.debug("REST request to get EventContacts : {}", id);
        Optional<EventContactsDTO> eventContactsDTO = eventContactsService.findOne(id);
        return ResponseUtil.wrapOrNotFound(eventContactsDTO);
    }

    /**
     * Update existing PUT endpoint to handle nullable events
     */
    @PutMapping("/{id}")
    public ResponseEntity<EventContactsDTO> updateEventContacts(
        @PathVariable Long id,
        @Valid @RequestBody EventContactsDTO eventContactsDTO
    ) throws URISyntaxException {
        log.debug("REST request to update EventContacts : {}", eventContactsDTO);

        // ✅ Allow event to be null
        if (eventContactsDTO.getEvent() == null || eventContactsDTO.getEvent().getId() == null) {
            eventContactsDTO.setEvent(null);
        }

        EventContactsDTO result = eventContactsService.save(eventContactsDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(
                applicationName, true, ENTITY_NAME, eventContactsDTO.getId().toString()
            ))
            .body(result);
    }

    /**
     * Update existing PATCH endpoint to handle nullable events
     */
    @PatchMapping(value = "/{id}", consumes = "application/merge-patch+json")
    public ResponseEntity<EventContactsDTO> partialUpdateEventContacts(
        @PathVariable Long id,
        @NotNull @RequestBody EventContactsDTO eventContactsDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update EventContacts partially : {}", eventContactsDTO);

        // ✅ Allow event to be null in partial update
        Optional<EventContactsDTO> result = eventContactsService.partialUpdate(eventContactsDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString())
        );
    }
}
```

**Apply similar changes to:**
- `EventFeaturedPerformersResource.java`
- `EventEmailsResource.java`
- `EventProgramDirectorsResource.java`

---

## 6. Mapper Changes (MapStruct)

### Files to Modify

1. `EventFeaturedPerformersMapper.java`
2. `EventContactsMapper.java`
3. `EventEmailsMapper.java`
4. `EventProgramDirectorsMapper.java`

### Required Changes

#### Ensure mappers handle null events correctly

**Example: EventContactsMapper.java**

```java
@Mapper(componentModel = "spring", uses = {EventDetailsMapper.class})
public interface EventContactsMapper extends EntityMapper<EventContactsDTO, EventContacts> {

    @Mapping(target = "event", source = "event")
    EventContacts toEntity(EventContactsDTO dto);

    @Mapping(target = "event", source = "event")
    EventContactsDTO toDto(EventContacts entity);

    // ✅ MapStruct automatically handles null events, but ensure mapping is explicit
    default EventContacts fromId(Long id) {
        if (id == null) {
            return null;
        }
        EventContacts eventContacts = new EventContacts();
        eventContacts.setId(id);
        return eventContacts;
    }
}
```

**No major changes needed** - MapStruct handles null values automatically, but ensure the mapping is explicit.

---

## 7. Validation Changes

### Check for any custom validators

If there are custom validators that check for non-null events, update them:

**Example:**

```java
// Before:
@AssertTrue(message = "Event must be provided")
public boolean isValid() {
    return event != null;
}

// After:
// ✅ Remove or update to allow null event
// Or create separate validation for event-specific vs tenant-level entities
```

---

## 8. Query/Specification Changes

### If using JPA Specifications

Update any specifications that assume `event` is always non-null:

**Example:**

```java
public static Specification<EventContacts> hasTenantId(String tenantId) {
    return (root, query, cb) ->
        cb.equal(root.get("tenantId"), tenantId);
}

public static Specification<EventContacts> hasEventId(Long eventId) {
    return (root, query, cb) -> {
        if (eventId == null) {
            // ✅ Return contacts where event is null
            return cb.isNull(root.get("event"));
        }
        return cb.equal(root.get("event").get("id"), eventId);
    };
}

public static Specification<EventContacts> isTenantLevel() {
    return (root, query, cb) ->
        cb.isNull(root.get("event"));  // ✅ New specification for tenant-level entities
}
```

---

## 9. Testing Changes

### Update Unit Tests

#### Example Test Cases

```java
@Test
void testCreateTenantLevelContact() {
    EventContactsDTO dto = new EventContactsDTO();
    dto.setTenantId("tenant_001");
    dto.setEvent(null);  // ✅ Tenant-level contact
    dto.setName("John Doe");
    dto.setPhone("+1-555-0100");
    dto.setEmail("john@example.com");

    EventContactsDTO result = eventContactsService.save(dto);

    assertThat(result.getEvent()).isNull();
    assertThat(result.getTenantId()).isEqualTo("tenant_001");
}

@Test
void testDisassociateContactFromEvent() {
    // Create contact associated with event
    EventContactsDTO dto = createContactWithEvent();
    EventContactsDTO saved = eventContactsService.save(dto);
    assertThat(saved.getEvent()).isNotNull();

    // Disassociate
    EventContactsDTO disassociated = eventContactsService.disassociateFromEvent(saved.getId());
    assertThat(disassociated.getEvent()).isNull();
}

@Test
void testAssociateContactWithEvent() {
    // Create tenant-level contact
    EventContactsDTO dto = createTenantLevelContact();
    EventContactsDTO saved = eventContactsService.save(dto);
    assertThat(saved.getEvent()).isNull();

    // Associate with event
    EventContactsDTO associated = eventContactsService.associateWithEvent(saved.getId(), 1L);
    assertThat(associated.getEvent()).isNotNull();
    assertThat(associated.getEvent().getId()).isEqualTo(1L);
}

@Test
void testDuplicateAssociationPrevention() {
    // Create contact and associate with event
    EventContactsDTO dto = createContactWithEvent();
    eventContactsService.save(dto);

    // Try to associate duplicate
    assertThrows(BadRequestAlertException.class, () -> {
        eventContactsService.associateWithEvent(dto.getId(), dto.getEvent().getId());
    });
}
```

---

## 10. Summary Checklist

### Entity Classes
- [ ] Change `@JoinColumn(name = "event_id", nullable = true)` in all 4 entity classes
- [ ] Ensure getters/setters handle null events correctly

### DTO Classes
- [ ] Remove `@NotNull` annotations on `event` field if present
- [ ] Ensure validation allows null events

### Repository Classes
- [ ] Add `findByTenantIdAndEventIsNull()` method
- [ ] Add `findByTenantIdAndEventIsNullOrNotEqualToEventId()` method
- [ ] Add `findByTenantId()` method
- [ ] Add `countByTenantIdAndEventIsNull()` method

### Service Classes
- [ ] Update `save()` method to handle null events
- [ ] Add `findAllTenantLevelContacts()` method
- [ ] Add `findAvailableContactsForEvent()` method
- [ ] Add `disassociateFromEvent()` method
- [ ] Add `associateWithEvent()` method with duplicate checking
- [ ] Update existing methods to handle nullable events

### Controller/Resource Classes
- [ ] Update `create` endpoint to allow null events
- [ ] Add `GET /tenant-level` endpoint
- [ ] Add `GET /available-for-event` endpoint
- [ ] Add `PATCH /{id}/disassociate` endpoint
- [ ] Add `PATCH /{id}/associate/{eventId}` endpoint
- [ ] Update existing GET endpoints to handle nullable events
- [ ] Update PUT/PATCH endpoints to allow null events

### Mapper Classes
- [ ] Verify mappings handle null events (usually automatic)

### Testing
- [ ] Add tests for tenant-level entity creation
- [ ] Add tests for disassociation
- [ ] Add tests for association
- [ ] Add tests for duplicate prevention
- [ ] Update existing tests to handle nullable events

---

## 11. Migration Order

1. **Database Migration First** - Run the SQL migration script to make `event_id` nullable
2. **Entity Classes** - Update entities to allow nullable events
3. **Repository Classes** - Add new query methods
4. **Service Classes** - Update business logic
5. **Controller Classes** - Add new endpoints and update existing ones
6. **Testing** - Update and add tests
7. **Documentation** - Update API documentation

---

## 12. Important Notes

### Unique Constraint Handling

The database has unique constraints that prevent duplicate associations. The backend should:

1. **Check for duplicates before saving** - Use repository queries to check if a similar entity already exists for the same event
2. **Handle constraint violations gracefully** - Catch `DataIntegrityViolationException` and return user-friendly error messages
3. **Validate at service layer** - Don't rely solely on database constraints; validate in service layer first

### Performance Considerations

- Use the new indexes (`idx_*_tenant_event` and `idx_*_tenant_null_event`) for queries
- When querying tenant-level entities, use `findByTenantIdAndEventIsNull()` which uses the index
- When querying by event, use `findByTenantIdAndEventId()` which uses the index

### Backward Compatibility

- Existing code that assumes `event` is non-null will continue to work
- New code should handle null events gracefully
- API responses may now include entities with `null` event fields

---

## 13. API Contract Changes

### Request Bodies

**Before:**
```json
{
  "name": "John Doe",
  "phone": "+1-555-0100",
  "email": "john@example.com",
  "event": {
    "id": 1
  }
}
```

**After (can omit event for tenant-level):**
```json
{
  "name": "John Doe",
  "phone": "+1-555-0100",
  "email": "john@example.com",
  "event": null  // ✅ Optional - null for tenant-level contact
}
```

### Response Bodies

**May now include:**
```json
{
  "id": 1,
  "tenantId": "tenant_001",
  "name": "John Doe",
  "phone": "+1-555-0100",
  "email": "john@example.com",
  "event": null  // ✅ Can be null
}
```

---

## End of Document

This document provides a comprehensive guide for implementing nullable `event_id` support in the Spring Boot backend. Follow the checklist in Section 10 to ensure all changes are implemented correctly.

