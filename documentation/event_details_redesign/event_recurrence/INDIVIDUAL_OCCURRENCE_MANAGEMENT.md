# Individual Occurrence Management - Design Analysis

## Current Data Analysis

Based on the provided INSERT statements, here's what's happening:

### ✅ What's Working
1. `event_recurrence_series` record is created correctly
2. `event_details` recurrence columns are populated:
   - `is_recurring=true`
   - `recurrence_pattern='DAILY'`
   - `recurrence_interval=1`
   - `recurrence_end_type='OCCURRENCES'`
   - `recurrence_occurrences=2`

### ❌ Issues Found

1. **`recurrence_series_id` is NULL** - Should be set to parent event ID (4101)
   ```sql
   -- Current (WRONG):
   recurrence_series_id=NULL

   -- Should be:
   recurrence_series_id=4101  -- Set to parent event ID for grouping
   ```

2. **No Child Events Generated** - The backend should create individual occurrence records
   - For DAILY pattern with interval=1 and occurrences=2, there should be:
     - Parent event: ID 4101, start_date='2025-12-31'
     - Child event 1: start_date='2026-01-01', parent_event_id=4101, recurrence_series_id=4101

3. **Parent Event Still Has Recurrence Columns** - Parent should keep recurrence config, but children should have:
   - `is_recurring=false` (children are not recurring themselves)
   - `parent_event_id=4101` (reference to parent)
   - `recurrence_series_id=4101` (for grouping)
   - Recurrence columns (pattern, interval, etc.) should be NULL for children

---

## Individual Occurrence Management Scenarios

### Scenario 1: Edit a Single Occurrence

**Use Case**: User wants to change the location or time for just one occurrence (e.g., "The second occurrence is at a different venue")

**Current Design**: ✅ **Supports this**

**How it works**:
1. Each occurrence is a separate `event_details` record
2. Child events have `parent_event_id` set to parent event ID
3. Child events can be edited independently
4. Editing a child event does NOT affect parent or siblings

**Example**:
```sql
-- Parent event (ID: 4101)
UPDATE event_details
SET location='Original Venue', start_time='05:00 PM'
WHERE id=4101;

-- Child event (ID: 4102) - Edit only this occurrence
UPDATE event_details
SET location='Different Venue', start_time='06:00 PM'  -- Changed for this occurrence only
WHERE id=4102 AND parent_event_id=4101;
```

**Backend Implementation**:
```java
// When editing an event, check if it's a child occurrence
if (eventDetails.getParentEventId() != null) {
    // This is a child occurrence - allow independent editing
    // Changes only affect this occurrence, not parent or siblings
    eventDetailsRepository.save(eventDetails);
} else {
    // This is a parent event - check if user wants to sync to all children
    if (syncToAllOccurrences) {
        syncChangesToChildren(eventDetails);
    } else {
        // Update only parent
        eventDetailsRepository.save(eventDetails);
    }
}
```

---

### Scenario 2: Delete a Single Occurrence

**Use Case**: User wants to cancel just one occurrence (e.g., "Cancel the event on Jan 1st due to holiday")

**Current Design**: ✅ **Supports this**

**How it works**:
1. Delete the child event record directly
2. Parent and other children remain unchanged
3. The recurrence series continues with remaining occurrences

**Example**:
```sql
-- Delete only the second occurrence (ID: 4102)
DELETE FROM event_details
WHERE id=4102 AND parent_event_id=4101;

-- Parent event (4101) and other occurrences remain
```

**Backend Implementation**:
```java
// Delete single occurrence
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

---

### Scenario 3: Edit Parent Event (Sync to All Occurrences)

**Use Case**: User wants to change the title or description for all occurrences

**Current Design**: ⚠️ **Needs Implementation**

**Options**:
1. **Option A**: Update parent only (children unchanged) - Default behavior
2. **Option B**: Update parent and sync to all children (except dates) - Needs flag
3. **Option C**: Regenerate all children (if dates/time changed) - Complex

**Backend Implementation**:
```java
public void updateParentEvent(Long parentEventId, EventDetailsDTO updates,
                               boolean syncToChildren, boolean regenerateChildren) {
    EventDetails parent = eventDetailsRepository.findById(parentEventId)
        .orElseThrow(() -> new NotFoundException("Parent event not found"));

    // Update parent
    updateEventFields(parent, updates);
    eventDetailsRepository.save(parent);

    if (syncToChildren) {
        // Sync changes to all child occurrences (except dates)
        List<EventDetails> children = eventDetailsRepository
            .findByParentEventId(parentEventId);

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

    if (regenerateChildren) {
        // Delete old children and regenerate based on new recurrence config
        deleteChildEvents(parentEventId);
        generateRecurringEvents(parent, getRecurrenceSeries(parentEventId));
    }
}
```

---

### Scenario 4: Delete Entire Series

**Use Case**: User wants to cancel all occurrences of a recurring event

**Current Design**: ✅ **Supports this with CASCADE**

**How it works**:
1. Delete parent event
2. Foreign key constraint with `ON DELETE CASCADE` deletes all children
3. `event_recurrence_series` record should also be deleted (or use CASCADE)

**Example**:
```sql
-- Delete parent event - children are automatically deleted via CASCADE
DELETE FROM event_details WHERE id=4101;

-- Or delete recurrence series first (if CASCADE is set up)
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

## Table Design Analysis

### Current Design: ✅ **Good for Individual Occurrence Management**

The current table design **supports** individual occurrence management:

**Strengths**:
1. ✅ Each occurrence is a separate record - can be edited/deleted independently
2. ✅ `parent_event_id` links children to parent - easy to query
3. ✅ `recurrence_series_id` groups all events in series - useful for queries
4. ✅ Parent keeps recurrence config - children inherit but can override

**Potential Improvements**:

#### 1. Add `is_occurrence_modified` Flag (Optional)

**Purpose**: Track if a child occurrence has been manually edited

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

#### 2. Add `occurrence_sequence_number` (Optional)

**Purpose**: Track the order of occurrences in the series

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

#### 3. Ensure CASCADE Delete is Set Up

**Current**: Check if foreign keys have CASCADE

```sql
-- Verify CASCADE is set up
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

**Should be**:
```sql
-- Ensure CASCADE delete for parent_event_id
ALTER TABLE event_details
DROP CONSTRAINT IF EXISTS fk_parent_event;

ALTER TABLE event_details
ADD CONSTRAINT fk_parent_event
FOREIGN KEY (parent_event_id)
REFERENCES event_details(id)
ON DELETE CASCADE;
```

---

## Recommended Backend Implementation

### 1. Fix Current Issues

```java
// When creating/updating parent event
private void populateRecurrenceColumns(EventDetails eventDetails,
                                      Map<String, Object> recurrenceConfig) {
    // ... existing code ...

    // CRITICAL FIX: Set recurrence_series_id to parent event ID
    eventDetails.setRecurrenceSeriesId(eventDetails.getId());  // Was NULL!
    eventDetails.setParentEventId(null);  // Parent has no parent
}

// When generating child events
private void generateRecurringEvents(EventDetails parentEvent,
                                    EventRecurrenceSeries series) {
    List<LocalDate> occurrenceDates = calculateOccurrenceDates(...);

    // Skip first date (it's the parent event)
    for (int i = 1; i < occurrenceDates.size(); i++) {
        EventDetails childEvent = copyEventFields(parentEvent);
        childEvent.setStartDate(occurrenceDates.get(i));
        childEvent.setEndDate(occurrenceDates.get(i));

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

### 2. Add Individual Occurrence Management Endpoints

```java
// GET /api/event-details/:id/occurrences
// Get all occurrences in a series
public List<EventDetailsDTO> getOccurrences(Long parentEventId) {
    return eventDetailsRepository
        .findByRecurrenceSeriesId(parentEventId)
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
}

// PUT /api/event-details/:id/occurrence/:occurrenceId
// Update single occurrence
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

// DELETE /api/event-details/:id/occurrence/:occurrenceId
// Delete single occurrence
public void deleteOccurrence(Long occurrenceId) {
    EventDetails occurrence = eventDetailsRepository.findById(occurrenceId)
        .orElseThrow(() -> new NotFoundException("Occurrence not found"));

    if (occurrence.getParentEventId() == null) {
        throw new BadRequestException("Cannot delete parent event. Use deleteSeries() instead.");
    }

    eventDetailsRepository.delete(occurrence);
}

// PUT /api/event-details/:id/sync-to-children
// Sync parent changes to all children (except dates)
public void syncToChildren(Long parentEventId, EventDetailsDTO updates) {
    EventDetails parent = eventDetailsRepository.findById(parentEventId)
        .orElseThrow(() -> new NotFoundException("Parent event not found"));

    List<EventDetails> children = eventDetailsRepository
        .findByParentEventId(parentEventId);

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
```

---

## Frontend UI Considerations

### Display Recurring Events

1. **List View**: Show parent event with expandable list of occurrences
2. **Calendar View**: Show all occurrences as separate events
3. **Edit Mode**:
   - Edit parent: Option to "Apply to all occurrences" or "This occurrence only"
   - Edit child: Only affects that occurrence

### Example UI Flow

```
[Recurring Event: New Year 2026]
├── Occurrence 1: Dec 31, 2025 (Parent) [Edit] [Delete Series]
├── Occurrence 2: Jan 1, 2026 [Edit] [Delete This]
└── Occurrence 3: Jan 2, 2026 [Edit] [Delete This]

[Edit Parent Event]
☐ Apply changes to all occurrences
☑ Apply changes to this occurrence only
```

---

## Summary

### ✅ Current Design is Good

The current table design **supports** individual occurrence management:
- Each occurrence is a separate record
- Can be edited/deleted independently
- Parent-child relationships are clear

### 🔧 Fixes Needed

1. **Set `recurrence_series_id`** on parent event (currently NULL)
2. **Generate child events** when creating recurring event
3. **Add endpoints** for individual occurrence management
4. **Ensure CASCADE delete** is configured

### 📋 Optional Enhancements

1. Add `is_occurrence_modified` flag to track customizations
2. Add `occurrence_sequence_number` for ordering
3. Add sync-to-children functionality

### 🎯 Recommended Next Steps

1. **Immediate**: Fix `recurrence_series_id` being NULL
2. **Immediate**: Implement child event generation
3. **Next**: Add individual occurrence edit/delete endpoints
4. **Future**: Add sync-to-children and modification tracking

