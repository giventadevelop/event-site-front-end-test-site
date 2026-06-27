# Data Verification and Individual Occurrence Management

## Data Verification Analysis

### ✅ What's Working Correctly

Based on your INSERT statements:

1. **`event_recurrence_series` table** - ✅ Created correctly
   ```sql
   INSERT INTO event_recurrence_series VALUES(
       6051, 'tenant_demo_002', 4101, 'DAILY', 1, 'OCCURRENCES',
       NULL, 2, NULL, NULL, '2025-11-19 04:13:46.612', '2025-11-19 04:13:46.612'
   );
   ```
   - `parent_event_id=4101` ✅
   - `pattern='DAILY'` ✅
   - `interval=1` ✅
   - `end_type='OCCURRENCES'` ✅
   - `occurrences=2` ✅

2. **`event_details` recurrence columns** - ✅ Populated correctly
   ```sql
   is_recurring=true ✅
   recurrence_pattern='DAILY' ✅
   recurrence_interval=1 ✅
   recurrence_end_type='OCCURRENCES' ✅
   recurrence_occurrences=2 ✅
   ```

### ❌ Issues Found

1. **`recurrence_series_id` is NULL** - Should be 4101
   ```sql
   -- Current (WRONG):
   recurrence_series_id=NULL

   -- Should be:
   recurrence_series_id=4101  -- Set to parent event ID for grouping
   ```

2. **No Child Events Generated** - Missing individual occurrence records
   ```sql
   -- Expected child events (NOT created):
   -- Child 1: start_date='2026-01-01', parent_event_id=4101, recurrence_series_id=4101
   -- Child 2: start_date='2026-01-02', parent_event_id=4101, recurrence_series_id=4101
   ```

3. **Parent Event Still Has Recurrence Columns** - This is correct, but children should have them NULL

---

## Individual Occurrence Management Design

### Current Table Design: ✅ **Supports Individual Occurrence Management**

The current design **already supports** editing/deleting individual occurrences:

#### How It Works

1. **Parent Event** (ID: 4101):
   - `parent_event_id=NULL` (it's the parent)
   - `recurrence_series_id=4101` (should be set to its own ID)
   - `is_recurring=true`
   - Has all recurrence columns populated

2. **Child Events** (should be generated):
   - `parent_event_id=4101` (references parent)
   - `recurrence_series_id=4101` (groups all events in series)
   - `is_recurring=false` (children are not recurring themselves)
   - Recurrence columns are NULL (they inherit from parent)

### Scenario 1: Edit a Single Occurrence

**Use Case**: Change location/time for just one occurrence

**Current Design**: ✅ **Fully Supported**

```sql
-- Parent event (ID: 4101) - Dec 31, 2025
UPDATE event_details
SET location='Original Venue', start_time='05:00 PM'
WHERE id=4101;

-- Child event (ID: 4102) - Jan 1, 2026 - Edit only this occurrence
UPDATE event_details
SET location='Different Venue', start_time='06:00 PM'  -- Changed for this occurrence only
WHERE id=4102 AND parent_event_id=4101;

-- Other occurrences remain unchanged
```

**Backend Implementation**:
```java
// When editing an event, check if it's a child occurrence
if (eventDetails.getParentEventId() != null) {
    // This is a child occurrence - allow independent editing
    // Changes only affect this occurrence, not parent or siblings
    eventDetailsRepository.save(eventDetails);
} else {
    // This is a parent event
    // Option 1: Update only parent (default)
    // Option 2: Sync to all children (if flag is set)
    if (syncToAllOccurrences) {
        syncChangesToChildren(eventDetails);
    } else {
        eventDetailsRepository.save(eventDetails);
    }
}
```

### Scenario 2: Delete a Single Occurrence

**Use Case**: Cancel just one occurrence

**Current Design**: ✅ **Fully Supported**

```sql
-- Delete only the second occurrence (ID: 4102)
DELETE FROM event_details
WHERE id=4102 AND parent_event_id=4101;

-- Parent event (4101) and other occurrences remain
-- The recurrence series continues with remaining occurrences
```

**Backend Implementation**:
```java
public void deleteOccurrence(Long occurrenceId) {
    EventDetails occurrence = eventDetailsRepository.findById(occurrenceId)
        .orElseThrow(() -> new NotFoundException("Occurrence not found"));

    if (occurrence.getParentEventId() == null) {
        throw new BadRequestException("Cannot delete parent event. Use deleteSeries() instead.");
    }

    // Delete only this occurrence
    eventDetailsRepository.delete(occurrence);
    // Parent and siblings remain unchanged
}
```

### Scenario 3: Edit Parent Event (Sync to All Occurrences)

**Use Case**: Change title/description for all occurrences

**Current Design**: ⚠️ **Needs Implementation**

**Backend Implementation**:
```java
public void updateParentEvent(Long parentEventId, EventDetailsDTO updates,
                               boolean syncToChildren) {
    EventDetails parent = eventDetailsRepository.findById(parentEventId)
        .orElseThrow(() -> new NotFoundException("Parent event not found"));

    // Update parent
    updateEventFields(parent, updates);
    eventDetailsRepository.save(parent);

    if (syncToChildren) {
        // Sync changes to all child occurrences (except dates)
        List<EventDetails> children = eventDetailsRepository
            .findByRecurrenceSeriesId(parentEventId);

        for (EventDetails child : children) {
            // Copy non-date fields from parent
            child.setTitle(parent.getTitle());
            child.setDescription(parent.getDescription());
            child.setLocation(parent.getLocation());
            child.setStartTime(parent.getStartTime());
            child.setEndTime(parent.getEndTime());
            // Keep child's own dates
            eventDetailsRepository.save(child);
        }
    }
}
```

### Scenario 4: Delete Entire Series

**Use Case**: Cancel all occurrences

**Current Design**: ✅ **Supports with CASCADE**

```sql
-- Option 1: Delete parent (children deleted via CASCADE if configured)
DELETE FROM event_details WHERE id=4101;

-- Option 2: Delete recurrence series first, then parent
DELETE FROM event_recurrence_series WHERE parent_event_id=4101;
DELETE FROM event_details WHERE id=4101;
```

**Backend Implementation**:
```java
public void deleteRecurringSeries(Long parentEventId) {
    // Delete recurrence series record
    recurrenceSeriesRepository.deleteByParentEventId(parentEventId);

    // Delete parent event (children are deleted via CASCADE)
    eventDetailsRepository.deleteById(parentEventId);
}
```

---

## Required Backend Fixes

### Fix 1: Set `recurrence_series_id` on Parent Event

**Current Issue**: `recurrence_series_id=NULL` in your INSERT

**Fix**:
```java
private void populateRecurrenceColumns(EventDetails eventDetails,
                                      Map<String, Object> recurrenceConfig) {
    // ... existing code ...

    // CRITICAL FIX: Set recurrence_series_id to parent event ID
    eventDetails.setRecurrenceSeriesId(eventDetails.getId());  // Was NULL!
    eventDetails.setParentEventId(null);  // Parent has no parent
}
```

### Fix 2: Generate Child Events

**Current Issue**: No child events are being created

**Fix**:
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
        childEvent.setEndDate(occurrenceDate);

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
```

---

## Recommended API Endpoints

### 1. Get All Occurrences in Series
```java
// GET /api/event-details/:id/occurrences
public List<EventDetailsDTO> getOccurrences(Long parentEventId) {
    return eventDetailsRepository
        .findByRecurrenceSeriesId(parentEventId)
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
}
```

### 2. Update Single Occurrence
```java
// PUT /api/event-details/:id/occurrence/:occurrenceId
public EventDetailsDTO updateOccurrence(Long occurrenceId, EventDetailsDTO updates) {
    EventDetails occurrence = eventDetailsRepository.findById(occurrenceId)
        .orElseThrow(() -> new NotFoundException("Occurrence not found"));

    if (occurrence.getParentEventId() == null) {
        throw new BadRequestException("This is not a child occurrence");
    }

    // Update only this occurrence
    updateEventFields(occurrence, updates);
    eventDetailsRepository.save(occurrence);

    return toDTO(occurrence);
}
```

### 3. Delete Single Occurrence
```java
// DELETE /api/event-details/:id/occurrence/:occurrenceId
public void deleteOccurrence(Long occurrenceId) {
    EventDetails occurrence = eventDetailsRepository.findById(occurrenceId)
        .orElseThrow(() -> new NotFoundException("Occurrence not found"));

    if (occurrence.getParentEventId() == null) {
        throw new BadRequestException("Cannot delete parent event. Use deleteSeries() instead.");
    }

    eventDetailsRepository.delete(occurrence);
}
```

### 4. Sync Parent Changes to All Children
```java
// PUT /api/event-details/:id/sync-to-children
public void syncToChildren(Long parentEventId, EventDetailsDTO updates) {
    EventDetails parent = eventDetailsRepository.findById(parentEventId)
        .orElseThrow(() -> new NotFoundException("Parent event not found"));

    // Update parent first
    updateEventFields(parent, updates);
    eventDetailsRepository.save(parent);

    // Sync to all children (except dates)
    List<EventDetails> children = eventDetailsRepository
        .findByRecurrenceSeriesId(parentEventId)
        .stream()
        .filter(e -> e.getParentEventId() != null)  // Only children
        .collect(Collectors.toList());

    for (EventDetails child : children) {
        child.setTitle(parent.getTitle());
        child.setDescription(parent.getDescription());
        child.setLocation(parent.getLocation());
        child.setStartTime(parent.getStartTime());
        child.setEndTime(parent.getEndTime());
        // Keep child's own dates
        eventDetailsRepository.save(child);
    }
}
```

---

## Optional Table Enhancements

### Enhancement 1: Track Modified Occurrences

**Purpose**: Know which occurrences have been customized

```sql
ALTER TABLE event_details
ADD COLUMN is_occurrence_modified BOOLEAN DEFAULT false;

-- When child is edited independently
UPDATE event_details
SET is_occurrence_modified=true
WHERE id=4102;
```

**Use Case**:
- When syncing parent changes, skip modified occurrences
- Show indicator in UI that occurrence was customized

### Enhancement 2: Sequence Number

**Purpose**: Track order of occurrences

```sql
ALTER TABLE event_details
ADD COLUMN occurrence_sequence_number INTEGER NULL;

-- Parent: sequence_number = 0 or NULL
-- Child 1: sequence_number = 1
-- Child 2: sequence_number = 2
```

**Use Case**:
- Display "Occurrence 1 of 10" in UI
- Easier sorting and display

### Enhancement 3: Ensure CASCADE Delete

**Verify CASCADE is configured**:
```sql
-- Check current foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'event_details'
  AND ccu.table_name = 'event_details';
```

**If not CASCADE, add it**:
```sql
ALTER TABLE event_details
DROP CONSTRAINT IF EXISTS fk_parent_event;

ALTER TABLE event_details
ADD CONSTRAINT fk_parent_event
FOREIGN KEY (parent_event_id)
REFERENCES event_details(id)
ON DELETE CASCADE;
```

---

## Summary

### ✅ Current Design is Good

The table design **supports** individual occurrence management:
- Each occurrence is a separate record
- Can be edited/deleted independently
- Parent-child relationships are clear

### 🔧 Immediate Fixes Needed

1. **Set `recurrence_series_id=4101`** on parent event (currently NULL)
2. **Generate child events** when creating recurring event
3. **Add endpoints** for individual occurrence management

### 📋 Optional Enhancements

1. Add `is_occurrence_modified` flag
2. Add `occurrence_sequence_number` for ordering
3. Ensure CASCADE delete is configured

### 🎯 Next Steps

1. **Backend**: Fix `recurrence_series_id` being NULL
2. **Backend**: Implement child event generation
3. **Backend**: Add individual occurrence edit/delete endpoints
4. **Frontend**: Add UI for managing individual occurrences

