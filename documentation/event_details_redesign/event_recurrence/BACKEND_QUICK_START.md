# Backend Quick Start - Event Recurrence Implementation

## Problem Statement

The frontend is successfully saving recurrence configuration in the `metadata` JSON field, but:

1. ❌ **`event_recurrence_series` table is NOT being populated**
2. ❌ **`event_details` recurrence columns are NOT being updated**
3. ❌ **Individual event occurrences are NOT being generated**

## What the Frontend Sends

When a user creates/updates a recurring event, the frontend sends:

```json
{
  "title": "New Year 2026",
  "startDate": "2025-12-31",
  "metadata": "{\"isRecurring\":true,\"recurrenceConfig\":{\"pattern\":\"DAILY\",\"interval\":2,\"endType\":\"OCCURRENCES\",\"occurrences\":2}}"
}
```

The `metadata` field contains a JSON string with:
- `isRecurring`: boolean
- `recurrenceConfig`: object with pattern, interval, endType, etc.

## What the Backend Must Do

### Step 1: Parse Metadata (CRITICAL - Missing)

**Location**: `EventDetailsService.create()` and `EventDetailsService.update()`

```java
// After saving event_details, parse metadata
String metadata = eventDetails.getMetadata();
if (metadata != null) {
    ObjectMapper mapper = new ObjectMapper();
    Map<String, Object> metadataMap = mapper.readValue(metadata, Map.class);

    Boolean isRecurring = (Boolean) metadataMap.get("isRecurring");
    if (Boolean.TRUE.equals(isRecurring)) {
        Map<String, Object> recurrenceConfig =
            (Map<String, Object>) metadataMap.get("recurrenceConfig");

        // TODO: Create event_recurrence_series record
        // TODO: Update event_details recurrence columns
        // TODO: Generate child events
    }
}
```

### Step 2: Create `event_recurrence_series` Record (CRITICAL - Missing)

```java
EventRecurrenceSeries series = new EventRecurrenceSeries();
series.setParentEventId(eventDetails.getId());
series.setPattern((String) recurrenceConfig.get("pattern"));
series.setInterval(((Number) recurrenceConfig.get("interval")).intValue());
series.setEndType((String) recurrenceConfig.get("endType"));

// Handle weeklyDays - MUST be Integer[] array, not String!
if (recurrenceConfig.containsKey("weeklyDays")) {
    List<Integer> weeklyDaysList = (List<Integer>) recurrenceConfig.get("weeklyDays");
    series.setWeeklyDays(weeklyDaysList.toArray(new Integer[0]));
}

recurrenceSeriesRepository.save(series);
```

### Step 3: Update `event_details` Columns (CRITICAL - Missing)

**IMPORTANT**: Use dedicated columns, NOT metadata. The `metadata` field is for fundraiser/charity config.

```java
// Update recurrence columns in event_details (PRIMARY STORAGE)
eventDetails.setIsRecurring(true);
eventDetails.setRecurrencePattern((String) recurrenceConfig.get("pattern"));
eventDetails.setRecurrenceInterval(((Number) recurrenceConfig.get("interval")).intValue());
eventDetails.setRecurrenceEndType((String) recurrenceConfig.get("endType"));

if (recurrenceConfig.containsKey("endDate")) {
    eventDetails.setRecurrenceEndDate(LocalDate.parse((String) recurrenceConfig.get("endDate")));
}

if (recurrenceConfig.containsKey("occurrences")) {
    eventDetails.setRecurrenceOccurrences(((Number) recurrenceConfig.get("occurrences")).intValue());
}

// CRITICAL: recurrence_weekly_days is TEXT, not INTEGER[]!
if (recurrenceConfig.containsKey("weeklyDays")) {
    List<Integer> weeklyDaysList = (List<Integer>) recurrenceConfig.get("weeklyDays");
    // Store as JSON array string
    ObjectMapper mapper = new ObjectMapper();
    String weeklyDaysJson = mapper.writeValueAsString(weeklyDaysList);
    eventDetails.setRecurrenceWeeklyDays(weeklyDaysJson);  // "[1,3,5]"
}

if (recurrenceConfig.containsKey("monthlyDay")) {
    Object monthlyDayObj = recurrenceConfig.get("monthlyDay");
    if (monthlyDayObj instanceof Number) {
        eventDetails.setRecurrenceMonthlyDay(((Number) monthlyDayObj).intValue());
    } else if ("LAST".equals(monthlyDayObj)) {
        eventDetails.setRecurrenceMonthlyDay(null);  // NULL = last day
    }
}

// Set series ID to parent event ID
eventDetails.setRecurrenceSeriesId(eventDetails.getId());
eventDetails.setParentEventId(null);  // Parent has no parent

eventDetailsRepository.save(eventDetails);
```

### Step 4: Generate Child Events (OPTIONAL - Can be done later)

```java
// Calculate occurrence dates
List<LocalDate> occurrenceDates = calculateOccurrenceDates(...);

// Create child events for each occurrence (skip first - it's the parent)
for (int i = 1; i < occurrenceDates.size(); i++) {
    EventDetails childEvent = copyEventFields(parentEvent);
    childEvent.setStartDate(occurrenceDates.get(i));
    childEvent.setEndDate(occurrenceDates.get(i));
    childEvent.setParentEventId(parentEvent.getId());
    childEvent.setRecurrenceSeriesId(parentEvent.getId());
    childEvent.setIsRecurring(false);
    // Clear recurrence columns for child events
    eventDetailsRepository.save(childEvent);
}
```

## Critical Type Issue

**ERROR**: `column "recurrence_weekly_days" is of type integer[] but expression is of type character varying`

**CAUSE**: The schema shows `event_details.recurrence_weekly_days` is `TEXT`, but the backend might be trying to set it incorrectly.

**IMPORTANT**: According to the actual schema:
- `event_details.recurrence_weekly_days` is `TEXT` (not INTEGER[])
- `event_recurrence_series.weekly_days` is `INTEGER[]` (PostgreSQL array)

**FIX for `event_details.recurrence_weekly_days`**:
```java
// ✅ CORRECT: Store as TEXT (JSON string or comma-separated)
List<Integer> weeklyDaysList = Arrays.asList(1, 3, 5);

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
eventDetails.setRecurrenceWeeklyDays(weeklyDaysList.toArray(new Integer[0]));  // Type mismatch
```

**JPA Mapping for `event_details.recurrence_weekly_days`**:
```java
@Column(name = "recurrence_weekly_days", columnDefinition = "TEXT")
private String recurrenceWeeklyDays;  // TEXT field
```

**JPA Mapping for `event_recurrence_series.weekly_days`** (different table):
```java
@Column(name = "weekly_days", columnDefinition = "integer[]")
@Type(type = "com.vladmihalcea.hibernate.type.array.IntArrayType")
private Integer[] weeklyDays;  // INTEGER[] array
```

## Database Schema Reference

### `event_recurrence_series` Table
```sql
CREATE TABLE event_recurrence_series (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(255),
    parent_event_id BIGINT NOT NULL,  -- References event_details.id
    pattern VARCHAR(50) NOT NULL,
    interval INTEGER NOT NULL,
    end_type VARCHAR(20) NOT NULL,
    end_date DATE NULL,
    occurrences INTEGER NULL,
    weekly_days INTEGER[] NULL,  -- PostgreSQL array
    monthly_day INTEGER NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### `event_details` Recurrence Columns
```sql
is_recurring BOOLEAN
recurrence_pattern VARCHAR(50)
recurrence_interval INTEGER
recurrence_end_type VARCHAR(20)
recurrence_end_date DATE
recurrence_occurrences INTEGER
recurrence_weekly_days TEXT  -- TEXT field (store as JSON string: "[1,3,5]" or comma-separated)
recurrence_monthly_day INTEGER
parent_event_id BIGINT  -- NULL for parent, set for children
recurrence_series_id BIGINT  -- Set to parent event ID for all events in series
```

**Note**: `event_recurrence_series.weekly_days` is `INTEGER[]` (PostgreSQL array), but `event_details.recurrence_weekly_days` is `TEXT`.

## Testing

After implementation, verify:

1. ✅ `event_recurrence_series` table has a record for the recurring event
2. ✅ `event_details.is_recurring` = true
3. ✅ `event_details.recurrence_pattern` is set
4. ✅ `event_details.recurrence_weekly_days` is stored as TEXT (JSON string or comma-separated, NOT INTEGER[])
5. ✅ `event_recurrence_series.weekly_days` is stored as INTEGER[] (PostgreSQL array)
6. ✅ No more "type integer[] but expression is of type character varying" errors
7. ✅ Recurrence data is in dedicated columns, NOT in metadata field

## Full Implementation Guide

See `BACKEND_IMPLEMENTATION_GUIDE.md` for complete implementation details, code examples, and edge cases.

