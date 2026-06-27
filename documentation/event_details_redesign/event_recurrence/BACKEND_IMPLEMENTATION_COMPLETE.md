# Backend Implementation Guide - Event Recurrence Feature

## Overview

This document provides complete implementation instructions for the backend team to support recurring events functionality. The frontend is already implemented. The backend must populate the dedicated recurrence columns in the `event_details` table and create records in the `event_recurrence_series` table.

---

## Current Status

✅ **Frontend**: Complete and functional
❌ **Backend**: Missing implementation

### Important Note About Metadata

**The `metadata` field is NOT for recurrence data**. The `metadata` field is reserved for:
- Fundraiser/charity configuration
- Other flexible JSON data

**Recurrence data must be stored in the dedicated recurrence columns** in the `event_details` table, not in metadata.

**Note**: The backend should read recurrence configuration from `EventDetailsDTO` fields and populate the dedicated recurrence columns. Metadata parsing for recurrence (if needed) is already handled in the backend - this documentation focuses on using the dedicated columns.

---

## Database Schema

### `event_details` Table - Recurrence Columns

```sql
is_recurring BOOLEAN DEFAULT false
recurrence_pattern VARCHAR(50) NULL
recurrence_interval INTEGER NULL
recurrence_end_type VARCHAR(20) NULL
recurrence_end_date DATE NULL
recurrence_occurrences INTEGER NULL
recurrence_weekly_days TEXT NULL  -- TEXT field (store as JSON string: "[1,3,5]" or comma-separated)
recurrence_monthly_day INTEGER NULL
parent_event_id BIGINT NULL  -- NULL for parent, set to parent ID for children
recurrence_series_id BIGINT NULL  -- Set to parent event ID for ALL events in series
```

**Critical Notes**:
- `recurrence_weekly_days` is `TEXT`, NOT `INTEGER[]` - Store as JSON string `"[1,3,5]"` or comma-separated `"1,3,5"`
- `recurrence_series_id` must be set to parent event ID (currently being set to NULL - **MUST FIX**)
- `parent_event_id` is NULL for parent events, set to parent ID for child occurrences

### `event_recurrence_series` Table

```sql
CREATE TABLE event_recurrence_series (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(255),
    parent_event_id BIGINT NOT NULL,  -- References event_details.id
    pattern VARCHAR(50) NOT NULL,  -- 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'
    interval INTEGER NOT NULL,
    end_type VARCHAR(20) NOT NULL,  -- 'END_DATE' or 'OCCURRENCES'
    end_date DATE NULL,
    occurrences INTEGER NULL,
    weekly_days INTEGER[] NULL,  -- PostgreSQL array: [0,1,2,3,4,5,6] (NOTE: Different from event_details.recurrence_weekly_days which is TEXT)
    monthly_day INTEGER NULL,  -- 1-31, or NULL if using last day
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_recurrence_series_parent_event
        FOREIGN KEY (parent_event_id) REFERENCES event_details(id) ON DELETE CASCADE
);
```

**Note**: `event_recurrence_series.weekly_days` is `INTEGER[]` (PostgreSQL array), but `event_details.recurrence_weekly_days` is `TEXT`. This is a schema difference.

---

## Implementation Steps

### Step 1: Populate Recurrence Columns from EventDetailsDTO

**Location**: `EventDetailsService.java` (or equivalent service)

**When**: On `POST /api/event-details` (create) or `PUT /api/event-details/:id` (update)

**Important**: The `EventDetailsDTO` should include recurrence fields. The backend should read recurrence configuration from the DTO fields and populate the database columns.

```java
// When creating/updating event_details
if (eventDetailsDTO.getIsRecurring() != null && eventDetailsDTO.getIsRecurring()) {
    // Populate event_details recurrence columns from DTO
    populateRecurrenceColumns(eventDetails, eventDetailsDTO);

    // Create or update event_recurrence_series record
    createOrUpdateRecurrenceSeries(eventDetails.getId(), eventDetailsDTO);

    // Generate child events
    generateRecurringEvents(eventDetails, getRecurrenceSeries(eventDetails.getId()));
} else {
    // Clear recurrence columns if not recurring
    clearRecurrenceColumns(eventDetails);
}
```

### Step 2: Populate `event_details` Recurrence Columns

```java
private void populateRecurrenceColumns(EventDetails eventDetails,
                                      EventDetailsDTO dto) {
    // Set is_recurring flag
    eventDetails.setIsRecurring(true);

    // Set pattern, interval, end type from DTO fields
    eventDetails.setRecurrencePattern(dto.getRecurrencePattern());
    eventDetails.setRecurrenceInterval(dto.getRecurrenceInterval());
    eventDetails.setRecurrenceEndType(dto.getRecurrenceEndType());

    // Handle endDate
    if (dto.getRecurrenceEndDate() != null) {
        eventDetails.setRecurrenceEndDate(dto.getRecurrenceEndDate());
    }

    // Handle occurrences
    if (dto.getRecurrenceOccurrences() != null) {
        eventDetails.setRecurrenceOccurrences(dto.getRecurrenceOccurrences());
    }

    // CRITICAL: recurrence_weekly_days is TEXT, not INTEGER[]
    // Store as JSON array string: "[1,3,5]" or comma-separated: "1,3,5"
    if (dto.getRecurrenceWeeklyDays() != null && dto.getRecurrenceWeeklyDays().length > 0) {
        List<Integer> weeklyDaysList = Arrays.asList(dto.getRecurrenceWeeklyDays());
        // Option 1: Store as JSON array string (recommended)
        ObjectMapper mapper = new ObjectMapper();
        try {
            String weeklyDaysJson = mapper.writeValueAsString(weeklyDaysList);
            eventDetails.setRecurrenceWeeklyDays(weeklyDaysJson);  // "[1,3,5]"
        } catch (Exception e) {
            // Option 2: Store as comma-separated string
            String weeklyDaysStr = weeklyDaysList.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
            eventDetails.setRecurrenceWeeklyDays(weeklyDaysStr);  // "1,3,5"
        }
    }

    // Handle monthlyDay
    if (dto.getRecurrenceMonthlyDay() != null) {
        eventDetails.setRecurrenceMonthlyDay(dto.getRecurrenceMonthlyDay());
    }

    // CRITICAL FIX: Set recurrence_series_id to parent event ID (currently NULL)
    eventDetails.setRecurrenceSeriesId(eventDetails.getId());  // Set to parent event ID
    eventDetails.setParentEventId(null);  // Parent has no parent
}

private void clearRecurrenceColumns(EventDetails eventDetails) {
    eventDetails.setIsRecurring(false);
    eventDetails.setRecurrencePattern(null);
    eventDetails.setRecurrenceInterval(null);
    eventDetails.setRecurrenceEndType(null);
    eventDetails.setRecurrenceEndDate(null);
    eventDetails.setRecurrenceOccurrences(null);
    eventDetails.setRecurrenceWeeklyDays(null);
    eventDetails.setRecurrenceMonthlyDay(null);
    eventDetails.setRecurrenceSeriesId(null);
    eventDetails.setParentEventId(null);
}
```

### Step 3: Create/Update `event_recurrence_series` Record

```java
private void createOrUpdateRecurrenceSeries(Long parentEventId,
                                            EventDetailsDTO dto) {
    EventRecurrenceSeries series = recurrenceSeriesRepository
        .findByParentEventId(parentEventId)
        .orElse(new EventRecurrenceSeries());

    series.setParentEventId(parentEventId);
    series.setPattern(dto.getRecurrencePattern());
    series.setInterval(dto.getRecurrenceInterval());
    series.setEndType(dto.getRecurrenceEndType());

    // Handle endDate
    if (dto.getRecurrenceEndDate() != null) {
        series.setEndDate(dto.getRecurrenceEndDate());
    }

    // Handle occurrences
    if (dto.getRecurrenceOccurrences() != null) {
        series.setOccurrences(dto.getRecurrenceOccurrences());
    }

    // Handle weeklyDays (event_recurrence_series.weekly_days is INTEGER[])
    if (dto.getRecurrenceWeeklyDays() != null && dto.getRecurrenceWeeklyDays().length > 0) {
        // This table uses INTEGER[] array (different from event_details.recurrence_weekly_days which is TEXT)
        series.setWeeklyDays(dto.getRecurrenceWeeklyDays());  // Already Integer[] from DTO
    }

    // Handle monthlyDay
    if (dto.getRecurrenceMonthlyDay() != null) {
        series.setMonthlyDay(dto.getRecurrenceMonthlyDay());
    }

    recurrenceSeriesRepository.save(series);
}
```

### Step 4: Generate Child Events

```java
private void generateRecurringEvents(EventDetails parentEvent,
                                     EventRecurrenceSeries series) {
    // Calculate all occurrence dates
    List<LocalDate> occurrenceDates = calculateOccurrenceDates(
        parentEvent.getStartDate(),
        series.getPattern(),
        series.getInterval(),
        series.getEndType(),
        series.getEndDate(),
        series.getOccurrences(),
        series.getWeeklyDays(),
        series.getMonthlyDay()
    );

    // Skip first date (it's the parent event)
    for (int i = 1; i < occurrenceDates.size(); i++) {
        LocalDate occurrenceDate = occurrenceDates.get(i);

        // Create child event
        EventDetails childEvent = new EventDetails();
        // Copy all fields from parent
        copyEventFields(parentEvent, childEvent);

        // Update dates
        childEvent.setStartDate(occurrenceDate);
        childEvent.setEndDate(occurrenceDate);  // Or calculate based on duration

        // CRITICAL: Set parent and series relationships
        childEvent.setParentEventId(parentEvent.getId());
        childEvent.setRecurrenceSeriesId(parentEvent.getId());  // Group all events

        // Children are NOT recurring themselves
        childEvent.setIsRecurring(false);

        // Clear recurrence columns for children (they inherit from parent)
        childEvent.setRecurrencePattern(null);
        childEvent.setRecurrenceInterval(null);
        childEvent.setRecurrenceEndType(null);
        childEvent.setRecurrenceEndDate(null);
        childEvent.setRecurrenceOccurrences(null);
        childEvent.setRecurrenceWeeklyDays(null);
        childEvent.setRecurrenceMonthlyDay(null);

        eventDetailsRepository.save(childEvent);
    }
}

// Helper method to copy event fields
private void copyEventFields(EventDetails source, EventDetails target) {
    target.setTenantId(source.getTenantId());
    target.setTitle(source.getTitle());
    target.setCaption(source.getCaption());
    target.setDescription(source.getDescription());
    target.setLocation(source.getLocation());
    target.setStartTime(source.getStartTime());
    target.setEndTime(source.getEndTime());
    target.setTimezone(source.getTimezone());
    target.setCapacity(source.getCapacity());
    target.setAdmissionType(source.getAdmissionType());
    // ... copy all other fields except dates and recurrence columns
}
```

### Step 5: Date Calculation Logic

```java
public List<LocalDate> calculateOccurrenceDates(
        LocalDate startDate,
        String pattern,
        Integer interval,
        String endType,
        LocalDate endDate,
        Integer occurrences,
        Integer[] weeklyDays,
        Integer monthlyDay) {

    List<LocalDate> dates = new ArrayList<>();
    LocalDate currentDate = startDate;
    int count = 0;
    int maxOccurrences = (endType.equals("OCCURRENCES")) ? occurrences : 1000;

    while (count < maxOccurrences) {
        if (endType.equals("END_DATE") && currentDate.isAfter(endDate)) {
            break;
        }

        dates.add(currentDate);
        count++;

        // Calculate next occurrence
        currentDate = calculateNextOccurrence(
            currentDate, pattern, interval, weeklyDays, monthlyDay);

        if (currentDate == null) break;
    }

    return dates;
}

private LocalDate calculateNextOccurrence(LocalDate currentDate,
                                          String pattern,
                                          Integer interval,
                                          Integer[] weeklyDays,
                                          Integer monthlyDay) {
    switch (pattern) {
        case "DAILY":
            return currentDate.plusDays(interval);

        case "WEEKLY":
        case "BIWEEKLY":
            int weeksToAdd = (pattern.equals("BIWEEKLY")) ? 2 : interval;
            LocalDate nextDate = currentDate.plusWeeks(weeksToAdd);

            // Adjust to next valid weekday if needed
            if (weeklyDays != null && weeklyDays.length > 0) {
                // Find next weekday in the list
                int currentDayOfWeek = nextDate.getDayOfWeek().getValue() % 7;
                // Logic to find next valid day...
            }
            return nextDate;

        case "MONTHLY":
            LocalDate nextMonth = currentDate.plusMonths(interval);
            if (monthlyDay == null) {
                // Last day of month
                return nextMonth.withDayOfMonth(nextMonth.lengthOfMonth());
            } else {
                // Specific day of month (handle month-end edge cases)
                int dayOfMonth = Math.min(monthlyDay, nextMonth.lengthOfMonth());
                return nextMonth.withDayOfMonth(dayOfMonth);
            }

        default:
            return null;
    }
}
```

---

## Critical Implementation Notes

### 1. `recurrence_weekly_days` Type Handling

**CRITICAL**: `event_details.recurrence_weekly_days` is `TEXT`, NOT `INTEGER[]`.

```java
// ✅ CORRECT: Store as JSON array string or comma-separated string
List<Integer> weeklyDaysList = (List<Integer>) recurrenceConfig.get("weeklyDays");

// Option 1: JSON array string (recommended)
ObjectMapper mapper = new ObjectMapper();
String weeklyDaysJson = mapper.writeValueAsString(weeklyDaysList);
eventDetails.setRecurrenceWeeklyDays(weeklyDaysJson);  // "[1,3,5]"

// Option 2: Comma-separated string
String weeklyDaysStr = weeklyDaysList.stream()
    .map(String::valueOf)
    .collect(Collectors.joining(","));
eventDetails.setRecurrenceWeeklyDays(weeklyDaysStr);  // "1,3,5"

// ❌ WRONG: Trying to set as Integer[] array
Integer[] weeklyDaysArray = weeklyDaysList.toArray(new Integer[0]);
eventDetails.setRecurrenceWeeklyDays(weeklyDaysArray);  // Type mismatch error
```

**JPA/Hibernate Mapping**:
```java
@Column(name = "recurrence_weekly_days", columnDefinition = "TEXT")
private String recurrenceWeeklyDays;  // TEXT field
```

**Note**: `event_recurrence_series.weekly_days` IS `INTEGER[]` (PostgreSQL array), but `event_details.recurrence_weekly_days` is `TEXT`.

### 2. Recurrence Data Storage

**Important**: The `metadata` field is reserved for:
- Fundraiser/charity configuration
- Other flexible JSON data
- **NOT for storing recurrence data**

**Correct Approach**:
1. **Read recurrence configuration from `EventDetailsDTO` fields** (recurrence_pattern, recurrence_interval, etc.)
2. **Populate dedicated `event_details` recurrence columns** (PRIMARY STORAGE)
3. Create/update `event_recurrence_series` record
4. **Do NOT store recurrence data in metadata** - use the dedicated columns only

**Note**: If metadata parsing is needed (e.g., frontend sends data there temporarily), that logic should already exist in the backend. This documentation focuses on using the dedicated recurrence columns.

### 3. Known Issues from Production Data

Based on actual database INSERT statements:

1. **`recurrence_series_id` is NULL** - Should be set to parent event ID (4101)
   - **Fix**: `eventDetails.setRecurrenceSeriesId(eventDetails.getId());`

2. **No child events generated** - Backend should create individual occurrence records
   - **Fix**: Implement `generateRecurringEvents()` method

3. **Parent event has recurrence columns** - This is correct, but children should have them NULL
   - **Fix**: Clear recurrence columns when creating child events

---

## Validation Rules

```java
// Validate recurrence config
if (isRecurring) {
    // Pattern required
    if (pattern == null || pattern.isEmpty()) {
        throw new ValidationException("Recurrence pattern is required");
    }

    // Interval must be > 0
    if (interval == null || interval <= 0) {
        throw new ValidationException("Recurrence interval must be greater than 0");
    }

    // End type validation
    if (endType.equals("END_DATE") && endDate == null) {
        throw new ValidationException("End date is required for END_DATE end type");
    }
    if (endType.equals("OCCURRENCES") && occurrences == null) {
        throw new ValidationException("Occurrences count is required for OCCURRENCES end type");
    }

    // End date must be within 5 years
    if (endDate != null) {
        LocalDate maxEndDate = startDate.plusYears(5);
        if (endDate.isAfter(maxEndDate)) {
            throw new ValidationException("Recurrence end date cannot be more than 5 years from start date");
        }
    }

    // Occurrences limit
    if (occurrences != null && occurrences > 1000) {
        throw new ValidationException("Maximum 1000 occurrences allowed");
    }

    // Weekly days required for WEEKLY/BIWEEKLY
    if ((pattern.equals("WEEKLY") || pattern.equals("BIWEEKLY"))
        && (weeklyDays == null || weeklyDays.length == 0)) {
        throw new ValidationException("At least one weekday must be selected for weekly recurrence");
    }
}
```

---

## Individual Occurrence Management (Future Enhancement)

The current table design supports individual occurrence management. See `DATA_VERIFICATION_AND_OCCURRENCE_MANAGEMENT.md` for:
- Editing single occurrences
- Deleting single occurrences
- Syncing parent changes to children
- Recommended API endpoints

---

## Testing Checklist

- [ ] Create recurring event with DAILY pattern
- [ ] Create recurring event with WEEKLY pattern and weeklyDays
- [ ] Create recurring event with MONTHLY pattern
- [ ] Verify `event_recurrence_series` record is created
- [ ] Verify `event_details` recurrence columns are populated
- [ ] Verify `recurrence_series_id` is set to parent event ID (not NULL)
- [ ] Verify child events are generated with correct dates
- [ ] Verify `event_details.recurrence_weekly_days` is stored as TEXT (JSON string or comma-separated)
- [ ] Verify `event_recurrence_series.weekly_days` is stored as INTEGER[] (PostgreSQL array)
- [ ] Verify parent event has `recurrence_series_id` = its own ID
- [ ] Verify child events have `parent_event_id` and `recurrence_series_id` set
- [ ] Verify child events have `is_recurring=false` and recurrence columns are NULL
- [ ] Update parent event and verify recurrence series is updated
- [ ] Delete parent event and verify cascade delete works

---

## Files to Create/Modify

### New Files
1. `EventRecurrenceSeries.java` - Entity
2. `EventRecurrenceSeriesRepository.java` - Repository
3. `EventRecurrenceSeriesDTO.java` - DTO
4. `RecurrenceCalculationService.java` - Service for date calculations
5. `RecurringEventGenerationService.java` - Service for generating child events

### Modified Files
1. `EventDetailsService.java` - Add recurrence parsing and generation logic
2. `EventDetails.java` - Ensure recurrence columns are mapped correctly (especially `recurrence_weekly_days` as TEXT)
3. `EventDetailsDTO.java` - Add recurrence fields (isRecurring, recurrencePattern, recurrenceInterval, etc.)

---

## Example Request/Response

### Create Recurring Event

**Request**:
```json
POST /api/event-details
{
  "title": "New Year 2026",
  "startDate": "2025-12-31",
  "endDate": "2025-12-31",
  "startTime": "05:00 PM",
  "endTime": "09:00 PM",
  "timezone": "America/New_York",
  "isRecurring": true,
  "recurrencePattern": "DAILY",
  "recurrenceInterval": 1,
  "recurrenceEndType": "OCCURRENCES",
  "recurrenceOccurrences": 2
}
```

**Backend Should**:
1. Save `event_details` record (ID: 4101)
2. Read recurrence fields from DTO and populate recurrence columns
3. Create `event_recurrence_series` record:
   - `parent_event_id`: 4101
   - `pattern`: "DAILY"
   - `interval`: 1
   - `end_type`: "OCCURRENCES"
   - `occurrences`: 2
4. Update `event_details` columns:
   - `is_recurring`: true
   - `recurrence_pattern`: "DAILY"
   - `recurrence_interval`: 1
   - `recurrence_end_type`: "OCCURRENCES"
   - `recurrence_occurrences`: 2
   - `recurrence_series_id`: 4101 (CRITICAL - currently NULL)
5. Generate child events:
   - Child 1: `start_date`: 2026-01-01, `parent_event_id`: 4101, `recurrence_series_id`: 4101
   - Child 2: `start_date`: 2026-01-02, `parent_event_id`: 4101, `recurrence_series_id`: 4101

---

## Priority Implementation Order

1. **CRITICAL**: Fix `recurrence_series_id` being NULL
2. **CRITICAL**: Read recurrence fields from `EventDetailsDTO` and populate `event_details` recurrence columns
3. **CRITICAL**: Create/update `event_recurrence_series` record
4. **CRITICAL**: Ensure `recurrence_weekly_days` is stored as TEXT (not INTEGER[])
5. **HIGH**: Implement date calculation logic
6. **HIGH**: Generate child events
7. **MEDIUM**: Add endpoints for managing recurring series
8. **LOW**: Add individual occurrence management endpoints

---

## References

- Database Schema: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`
- Data Verification: `DATA_VERIFICATION_AND_OCCURRENCE_MANAGEMENT.md`
- Individual Occurrence Management: `DATA_VERIFICATION_AND_OCCURRENCE_MANAGEMENT.md`

