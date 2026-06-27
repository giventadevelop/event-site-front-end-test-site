# Backend Implementation Guide - Event Recurrence Feature

## Current Status

✅ **Frontend Complete**: The frontend is successfully sending recurrence configuration. The frontend currently stores this in the `metadata` JSON field as a temporary measure, but **the backend should use the dedicated recurrence columns in the `event_details` table instead**.

**Important**: The `metadata` field in `event_details` is primarily for fundraiser/charity configuration and other flexible JSON data. Recurrence data should be stored in the dedicated columns, not in metadata.

**Frontend sends recurrence config in metadata** (temporary - for backend to parse and extract):
```json
{
  "isRecurring": true,
  "recurrenceConfig": {
    "pattern": "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY",
    "interval": 2,
    "endType": "END_DATE" | "OCCURRENCES",
    "endDate": "2026-01-02",
    "occurrences": 2,
    "weeklyDays": [1, 3, 5],  // For WEEKLY/BIWEEKLY: [0=Sunday, 1=Monday, ..., 6=Saturday]
    "monthlyDay": 15  // For MONTHLY: day of month (1-31), or "LAST" for last day
  }
}
```

❌ **Backend Missing**: The backend is NOT currently:
1. Parsing the recurrence config from metadata (temporary source)
2. Populating the dedicated `event_details` recurrence columns
3. Creating records in `event_recurrence_series` table
4. Generating individual event occurrences in `event_details` table

---

## Database Schema

### Tables Involved

#### 1. `event_details` Table
The following recurrence columns exist in the database and **MUST be populated** (not stored in metadata):

```sql
is_recurring BOOLEAN DEFAULT false
recurrence_pattern VARCHAR(50) NULL
recurrence_interval INTEGER NULL
recurrence_end_type VARCHAR(20) NULL
recurrence_end_date DATE NULL
recurrence_occurrences INTEGER NULL
recurrence_weekly_days TEXT NULL  -- TEXT field (store as JSON array string: "[1,3,5]")
recurrence_monthly_day INTEGER NULL
parent_event_id BIGINT NULL  -- Set for child occurrences
recurrence_series_id BIGINT NULL  -- Set to parent event ID for all events in series
```

**Critical Notes:**
- **`recurrence_weekly_days` is `TEXT`**, NOT `INTEGER[]`. Store as JSON array string: `"[1,3,5]"` or comma-separated string
- **`metadata` field is for other purposes** (fundraiser/charity config, etc.) - recurrence should use dedicated columns
- `parent_event_id` should be NULL for parent events, set to parent ID for child occurrences
- `recurrence_series_id` should be set to parent event ID for ALL events in a series (including parent)

#### 2. `event_recurrence_series` Table
This table stores the recurrence configuration (separate from `event_details`):

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
    weekly_days INTEGER[] NULL,  -- PostgreSQL array: [0,1,2,3,4,5,6] (NOTE: This table uses INTEGER[], different from event_details)
    monthly_day INTEGER NULL,  -- 1-31, or NULL if using last day
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_recurrence_series_parent_event
        FOREIGN KEY (parent_event_id) REFERENCES event_details(id) ON DELETE CASCADE
);
```

**Note**: The `event_recurrence_series.weekly_days` column is `INTEGER[]` (PostgreSQL array), but `event_details.recurrence_weekly_days` is `TEXT`. This is a schema difference to be aware of.

---

## Backend Implementation Requirements

### Phase 1: Parse Metadata and Populate Recurrence Columns

**Location**: `EventDetailsService.java` (or equivalent service)

**When**: On `POST /api/event-details` (create) or `PUT /api/event-details/:id` (update)

**Important**: The frontend currently sends recurrence config in `metadata` as a temporary measure. The backend should:
1. Parse it from metadata (temporary source)
2. **Extract and populate the dedicated `event_details` recurrence columns** (primary storage)
3. Create/update `event_recurrence_series` record (for series management)

**Steps**:

1. **Parse Metadata JSON** (temporary - frontend sends it here)
   ```java
   // Parse metadata to extract recurrence config (temporary source)
   String metadata = eventDetails.getMetadata();
   Map<String, Object> recurrenceConfig = null;

   if (metadata != null && !metadata.isEmpty()) {
       try {
           ObjectMapper mapper = new ObjectMapper();
           Map<String, Object> metadataMap = mapper.readValue(metadata, Map.class);

           Boolean isRecurring = (Boolean) metadataMap.get("isRecurring");
           if (Boolean.TRUE.equals(isRecurring)) {
               recurrenceConfig = (Map<String, Object>) metadataMap.get("recurrenceConfig");

               // Populate event_details recurrence columns (PRIMARY STORAGE)
               populateRecurrenceColumns(eventDetails, recurrenceConfig);

               // Create or update event_recurrence_series record
               createOrUpdateRecurrenceSeries(eventDetails.getId(), recurrenceConfig);
           } else {
               // Clear recurrence columns if not recurring
               clearRecurrenceColumns(eventDetails);
           }
       } catch (Exception e) {
           log.error("Failed to parse recurrence metadata", e);
       }
   }
   ```

2. **Populate `event_details` Recurrence Columns** (PRIMARY STORAGE - NOT metadata)
   ```java
   private void populateRecurrenceColumns(EventDetails eventDetails,
                                          Map<String, Object> recurrenceConfig) {
       // Set is_recurring flag
       eventDetails.setIsRecurring(true);

       // Set pattern, interval, end type
       eventDetails.setRecurrencePattern((String) recurrenceConfig.get("pattern"));
       eventDetails.setRecurrenceInterval(((Number) recurrenceConfig.get("interval")).intValue());
       eventDetails.setRecurrenceEndType((String) recurrenceConfig.get("endType"));

       // Handle endDate
       if (recurrenceConfig.containsKey("endDate")) {
           eventDetails.setRecurrenceEndDate(LocalDate.parse((String) recurrenceConfig.get("endDate")));
       }

       // Handle occurrences
       if (recurrenceConfig.containsKey("occurrences")) {
           eventDetails.setRecurrenceOccurrences(((Number) recurrenceConfig.get("occurrences")).intValue());
       }

       // CRITICAL: recurrence_weekly_days is TEXT, not INTEGER[]
       // Store as JSON array string: "[1,3,5]" or comma-separated: "1,3,5"
       if (recurrenceConfig.containsKey("weeklyDays")) {
           List<Integer> weeklyDaysList = (List<Integer>) recurrenceConfig.get("weeklyDays");
           // Option 1: Store as JSON array string
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
       if (recurrenceConfig.containsKey("monthlyDay")) {
           Object monthlyDayObj = recurrenceConfig.get("monthlyDay");
           if (monthlyDayObj instanceof Number) {
               eventDetails.setRecurrenceMonthlyDay(((Number) monthlyDayObj).intValue());
           } else if ("LAST".equals(monthlyDayObj)) {
               eventDetails.setRecurrenceMonthlyDay(null);  // NULL means last day of month
           }
       }

       // Set series ID to parent event ID (for grouping)
       eventDetails.setRecurrenceSeriesId(eventDetails.getId());
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

3. **Create/Update `event_recurrence_series` Record**
   ```java
   private void createOrUpdateRecurrenceSeries(Long parentEventId,
                                                Map<String, Object> recurrenceConfig) {
       EventRecurrenceSeries series = recurrenceSeriesRepository
           .findByParentEventId(parentEventId)
           .orElse(new EventRecurrenceSeries());

       series.setParentEventId(parentEventId);
       series.setPattern((String) recurrenceConfig.get("pattern"));
       series.setInterval(((Number) recurrenceConfig.get("interval")).intValue());
       series.setEndType((String) recurrenceConfig.get("endType"));

       // Handle endDate
       if (recurrenceConfig.containsKey("endDate")) {
           String endDateStr = (String) recurrenceConfig.get("endDate");
           series.setEndDate(LocalDate.parse(endDateStr));
       }

       // Handle occurrences
       if (recurrenceConfig.containsKey("occurrences")) {
           series.setOccurrences(((Number) recurrenceConfig.get("occurrences")).intValue());
       }

       // Handle weeklyDays (event_recurrence_series.weekly_days is INTEGER[])
       if (recurrenceConfig.containsKey("weeklyDays")) {
           List<Integer> weeklyDaysList = (List<Integer>) recurrenceConfig.get("weeklyDays");
           // This table uses INTEGER[] array (different from event_details.recurrence_weekly_days which is TEXT)
           series.setWeeklyDays(weeklyDaysList.toArray(new Integer[0]));  // Convert to array
       }

       // Handle monthlyDay
       if (recurrenceConfig.containsKey("monthlyDay")) {
           Object monthlyDayObj = recurrenceConfig.get("monthlyDay");
           if (monthlyDayObj instanceof Number) {
               series.setMonthlyDay(((Number) monthlyDayObj).intValue());
           } else if ("LAST".equals(monthlyDayObj)) {
               series.setMonthlyDay(null);  // NULL means last day of month
           }
       }

       recurrenceSeriesRepository.save(series);
   }
   ```

---

### Phase 2: Generate Individual Event Occurrences

**When**: After creating/updating the parent event and recurrence series

**Steps**:

1. **Calculate Occurrence Dates**
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
   ```

2. **Generate Child Events**
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

           // Set parent and series relationships
           childEvent.setParentEventId(parentEvent.getId());
           childEvent.setRecurrenceSeriesId(parentEvent.getId());
           childEvent.setIsRecurring(false);  // Child events are not recurring themselves

           // Clear recurrence columns for child events (they inherit from parent)
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
   ```

3. **Calculate Next Occurrence Logic**
   ```java
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
               // Find next valid weekday
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

### Phase 3: Handle Updates

**When**: `PUT /api/event-details/:id` is called on a recurring event

**Steps**:

1. **Check if recurrence config changed**
   ```java
   // Compare old and new metadata
   if (recurrenceConfigChanged) {
       // Delete old child events
       deleteChildEvents(parentEventId);

       // Update recurrence series
       createOrUpdateRecurrenceSeries(parentEventId, newRecurrenceConfig);

       // Regenerate child events
       generateRecurringEvents(updatedParentEvent, updatedSeries);
   }
   ```

2. **Handle parent event updates**
   - Option 1: Update only parent event (children unchanged)
   - Option 2: Update parent and sync to all children (except dates)
   - Option 3: Regenerate all children (if dates/time changed)

---

## Critical Implementation Notes

### 1. `recurrence_weekly_days` Type Handling

**CRITICAL**: `event_details.recurrence_weekly_days` is `TEXT`, NOT `INTEGER[]`. The backend MUST:

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
eventDetails.setRecurrenceWeeklyDays(weeklyDaysArray);  // This will cause type mismatch error
```

**JPA/Hibernate Mapping for `event_details.recurrence_weekly_days`**:
```java
@Column(name = "recurrence_weekly_days", columnDefinition = "TEXT")
private String recurrenceWeeklyDays;  // TEXT field, store as JSON string or comma-separated
```

**Note**: The `event_recurrence_series.weekly_days` column IS `INTEGER[]` (PostgreSQL array), but `event_details.recurrence_weekly_days` is `TEXT`. This is a schema difference.

### 2. Metadata vs. Database Columns

**Important**: The `metadata` field in `event_details` is primarily for:
- Fundraiser/charity configuration
- Other flexible JSON data
- **NOT for recurrence data** (use dedicated columns)

**Correct Approach**:
1. Parse recurrence config from metadata (temporary - frontend sends it here)
2. **Extract and populate dedicated `event_details` recurrence columns** (PRIMARY STORAGE)
3. Create/update `event_recurrence_series` record (for series management)
4. **Do NOT store recurrence data in metadata** - use the dedicated columns

**When Saving**:
1. Parse metadata JSON (temporary source from frontend)
2. Extract recurrence config
3. Populate `event_details` recurrence columns (primary storage)
4. Create/update `event_recurrence_series` record

### 3. Child Event Generation Strategy

**Options**:
- **Option A**: Generate all occurrences immediately (current requirement)
- **Option B**: Generate on-demand (lazy generation)
- **Option C**: Generate in background job (for large series)

**Recommendation**: Start with Option A, migrate to Option C if performance issues arise.

### 4. Validation Rules

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
  "metadata": "{\"isRecurring\":true,\"recurrenceConfig\":{\"pattern\":\"DAILY\",\"interval\":2,\"endType\":\"OCCURRENCES\",\"occurrences\":2}}"
}
```

**Backend Should**:
1. Save `event_details` record (ID: 4101)
2. Parse metadata and extract recurrence config
3. Create `event_recurrence_series` record:
   - `parent_event_id`: 4101
   - `pattern`: "DAILY"
   - `interval`: 2
   - `end_type`: "OCCURRENCES"
   - `occurrences`: 2
4. Update `event_details` columns:
   - `is_recurring`: true
   - `recurrence_pattern`: "DAILY"
   - `recurrence_interval`: 2
   - `recurrence_end_type`: "OCCURRENCES"
   - `recurrence_occurrences`: 2
   - `recurrence_series_id`: 4101
5. Generate child events:
   - Child 1: `start_date`: 2026-01-02, `parent_event_id`: 4101, `recurrence_series_id`: 4101

---

## Testing Checklist

- [ ] Create recurring event with DAILY pattern
- [ ] Create recurring event with WEEKLY pattern and weeklyDays
- [ ] Create recurring event with MONTHLY pattern
- [ ] Verify `event_recurrence_series` record is created
- [ ] Verify `event_details` recurrence columns are populated
- [ ] Verify child events are generated with correct dates
- [ ] Verify `event_details.recurrence_weekly_days` is stored as TEXT (JSON string or comma-separated)
- [ ] Verify `event_recurrence_series.weekly_days` is stored as INTEGER[] (PostgreSQL array)
- [ ] Verify parent event has `recurrence_series_id` = its own ID
- [ ] Verify child events have `parent_event_id` and `recurrence_series_id` set
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
2. `EventDetails.java` - Ensure recurrence columns are mapped correctly
3. `EventDetailsDTO.java` - Add recurrence fields (optional, can parse from metadata)

---

## Next Steps for Backend Team

1. **Immediate**: Parse metadata (temporary source) and populate `event_details` recurrence columns
2. **Immediate**: Create/update `event_recurrence_series` record
3. **Immediate**: Ensure `event_details.recurrence_weekly_days` is stored as TEXT (not INTEGER[])
3. **Next**: Implement date calculation logic
4. **Next**: Generate child events
5. **Future**: Add endpoints for managing recurring series

---

## Questions for Backend Team

1. Should child events be generated immediately or on-demand?
2. Should updating parent event sync changes to children?
3. Should deleting parent event cascade delete children?
4. Do we need background job for generating large series (1000+ events)?

---

## Frontend Metadata Format Reference

The frontend sends recurrence config in this exact format:

```json
{
  "isRecurring": true,
  "recurrenceConfig": {
    "pattern": "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY",
    "interval": 1-999,
    "endType": "END_DATE" | "OCCURRENCES",
    "endDate": "YYYY-MM-DD",  // Only if endType is "END_DATE"
    "occurrences": 1-1000,  // Only if endType is "OCCURRENCES"
    "weeklyDays": [0,1,2,3,4,5,6],  // Only for WEEKLY/BIWEEKLY, 0=Sunday
    "monthlyDay": 1-31 | "LAST"  // Only for MONTHLY
  }
}
```

**Note**: Fields are only included if they have values (null/undefined are omitted).

