# Backend Fix: Event Deactivation for Parent Events

## Problem
When deactivating a parent recurring event, the backend is calling `generateRecurringEvents()` for ALL events being updated, even if they are not recurring events. This causes `IllegalStateException: Recurrence configuration is missing for event: X` errors.

## Root Cause
In `EventDetailsServiceImpl.update()`, the code calls `generateRecurringEvents()` without checking if `isRecurring=true`. This happens at line 204.

## Fix Location
**File**: `src/main/java/com/nextjstemplate/service/impl/EventDetailsServiceImpl.java`

**Method**: `update(Long id, EventDetailsDTO dto)`

## Required Fix

Find the line where `generateRecurringEvents()` is called (around line 204) and add a conditional check:

```java
// BEFORE (WRONG):
// After saving the event, generate recurring events if needed
recurringEventGenerationService.generateRecurringEvents(eventDetails.getId());

// AFTER (CORRECT):
// After saving the event, generate recurring events ONLY if isRecurring is true
if (eventDetails.getIsRecurring() != null && eventDetails.getIsRecurring()) {
    recurringEventGenerationService.generateRecurringEvents(eventDetails.getId());
}
```

## Complete Context

The fix should be in the `update()` method, after the event has been saved and refreshed. The code should look something like this:

```java
public EventDetailsDTO update(Long id, EventDetailsDTO dto) {
    EventDetails eventDetails = eventDetailsRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Event not found"));

    // ... map fields from DTO to entity ...

    eventDetails = eventDetailsRepository.save(eventDetails);
    eventDetailsRepository.refresh(eventDetails);

    // CRITICAL FIX: Only generate recurring events if isRecurring is true
    if (eventDetails.getIsRecurring() != null && eventDetails.getIsRecurring()) {
        try {
            recurringEventGenerationService.generateRecurringEvents(eventDetails.getId());
        } catch (Exception e) {
            log.error("Failed to generate child events for parent event: {}", eventDetails.getId(), e);
            // Optionally rethrow or handle gracefully
        }
    }

    return eventDetailsMapper.toDto(eventDetails);
}
```

## Why This Fix Works

1. **Prevents Unnecessary Calls**: Only calls `generateRecurringEvents()` when the event is actually recurring
2. **Prevents Errors**: Non-recurring events (like events 1 and 2) won't trigger recurrence generation
3. **Maintains Functionality**: Recurring events still generate child events correctly
4. **Handles Null Safety**: Checks both `isRecurring != null` and `isRecurring == true`

## Additional Considerations

### For Parent Event Deactivation
When deactivating a parent event, the frontend sends `isRecurring: false` explicitly. However, the backend should also check the **database value** of `isRecurring` before generating events, not just the DTO value.

### For Child Event Updates
Child events should never trigger recurrence generation, so this fix also prevents that issue.

## Testing
After applying this fix:
1. Deactivate a parent recurring event - should work without errors
2. Deactivate a child event - should work without errors
3. Deactivate a non-recurring event - should work without errors
4. Update a recurring event - should still generate child events correctly

