# Recurring Events Feature - Requirements Analysis

## Date: 2025-01-XX
## Feature: Recurring Events Functionality

---

## Executive Summary

This document outlines the requirements for implementing recurring event functionality in the event management system. The feature will allow users to create events that repeat on a schedule (daily, weekly, biweekly, monthly) with configurable end dates (maximum 5 years) or number of occurrences.

---

## Current System Analysis

### Existing Event Structure

**Database Table**: `event_details`
- `start_date` (date, NOT NULL)
- `end_date` (date, NOT NULL)
- `start_time` (varchar(100), NOT NULL)
- `end_time` (varchar(100), NOT NULL)
- `timezone` (varchar(64), NOT NULL)
- `metadata` (TEXT) - Currently used for fundraiser/charity configuration (JSON)

**Current API Endpoints**:
- `GET /api/proxy/event-details/:id` - Get single event
- `POST /api/proxy/event-details` - Create event
- `PUT /api/proxy/event-details/:id` - Update event
- `GET /api/proxy/event-details` - List events (with filters)

**Frontend Components**:
- `EventForm.tsx` - Main event creation/editing form
- `EventDetailsDTO` - TypeScript interface for event data
- Uses `metadata` field (JSON string) for extended configuration

**Key Finding**: The `metadata` field is already used for storing JSON configuration, making it a suitable place to store recurrence rules without requiring immediate database schema changes.

---

## Requirements

### 1. Recurrence Patterns

Users must be able to select from the following recurrence patterns:

1. **Daily** - Event repeats every N days
2. **Weekly** - Event repeats every N weeks on specific weekdays
3. **Biweekly** - Event repeats every 2 weeks on specific weekdays
4. **Monthly** - Event repeats every N months on the same day of month

### 2. End Conditions

Users must be able to specify when the recurrence ends:

1. **End Date** - Recurrence ends on a specific date (maximum 5 years from start date)
2. **Number of Occurrences** - Recurrence ends after N occurrences (e.g., "Repeat 5 times")

### 3. Validation Rules

- Maximum end date: 5 years from the start date
- Minimum occurrences: 1
- Maximum occurrences: 1000 (to prevent excessive event generation)
- Start date must be before end date
- Recurrence end date must be within 5 years of start date

---

## Data Structure Design

### Recurrence Configuration (Stored in `metadata` field)

```json
{
  "isRecurring": true,
  "recurrenceConfig": {
    "pattern": "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY",
    "interval": 1,  // For DAILY: every N days, WEEKLY: every N weeks, MONTHLY: every N months
    "endType": "END_DATE" | "OCCURRENCES",
    "endDate": "2026-01-15",  // Required if endType is "END_DATE"
    "occurrences": 10,  // Required if endType is "OCCURRENCES"
    "weeklyDays": [1, 3, 5],  // For WEEKLY/BIWEEKLY: [0=Sunday, 1=Monday, ..., 6=Saturday]
    "monthlyDay": 15  // For MONTHLY: day of month (1-31), or "LAST" for last day
  }
}
```

### Example Configurations

**Daily for 30 days:**
```json
{
  "isRecurring": true,
  "recurrenceConfig": {
    "pattern": "DAILY",
    "interval": 1,
    "endType": "OCCURRENCES",
    "occurrences": 30
  }
}
```

**Weekly every Monday and Wednesday for 3 months:**
```json
{
  "isRecurring": true,
  "recurrenceConfig": {
    "pattern": "WEEKLY",
    "interval": 1,
    "endType": "END_DATE",
    "endDate": "2025-04-15",
    "weeklyDays": [1, 3]  // Monday, Wednesday
  }
}
```

**Biweekly on Fridays:**
```json
{
  "isRecurring": true,
  "recurrenceConfig": {
    "pattern": "BIWEEKLY",
    "interval": 2,
    "endType": "OCCURRENCES",
    "occurrences": 10,
    "weeklyDays": [5]  // Friday
  }
}
```

**Monthly on the 15th for 1 year:**
```json
{
  "isRecurring": true,
  "recurrenceConfig": {
    "pattern": "MONTHLY",
    "interval": 1,
    "endType": "END_DATE",
    "endDate": "2026-01-15",
    "monthlyDay": 15
  }
}
```

---

## Frontend Requirements

### 1. UI Components

#### 1.1 Recurring Event Toggle
- **Location**: EventForm.tsx, after "Max Guests Per Attendee" section
- **Component**: Checkbox with label "Make this event recurring"
- **Behavior**: When checked, shows recurrence configuration section

#### 1.2 Recurrence Pattern Selection
- **Component**: Radio button group
- **Options**:
  - Daily
  - Weekly
  - Biweekly
  - Monthly
- **Default**: None selected (required if recurring is enabled)

#### 1.3 Pattern-Specific Fields

**For Daily:**
- Number input: "Repeat every [N] days" (min: 1, default: 1)

**For Weekly:**
- Number input: "Repeat every [N] weeks" (min: 1, default: 1)
- Checkbox group: "On days of week"
  - Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
  - At least one day must be selected

**For Biweekly:**
- Read-only text: "Every 2 weeks"
- Checkbox group: "On days of week" (same as Weekly)
  - At least one day must be selected

**For Monthly:**
- Number input: "Repeat every [N] months" (min: 1, default: 1)
- Radio buttons: "On day of month"
  - Option 1: "Day [N]" (number input, 1-31)
  - Option 2: "Last day of month"

#### 1.4 End Condition Selection
- **Component**: Radio button group
- **Options**:
  - "End on date" (shows date picker)
  - "End after [N] occurrences" (shows number input)
- **Default**: "End on date"

#### 1.5 End Date Input
- **Component**: Date picker (same style as existing start/end date pickers)
- **Validation**:
  - Must be after start date
  - Maximum: 5 years from start date
  - Required if "End on date" is selected

#### 1.6 Occurrences Input
- **Component**: Number input
- **Validation**:
  - Minimum: 1
  - Maximum: 1000
  - Required if "End after occurrences" is selected

#### 1.7 Preview Section
- **Component**: Collapsible section showing "Preview of recurring events"
- **Content**: List of first 10 occurrence dates (with "Show more" if applicable)
- **Format**: "Event 1: Monday, January 15, 2025 at 6:00 PM"
- **Update**: Real-time as user changes recurrence settings

### 2. Form Validation

**Client-Side Validation:**
- If recurring is enabled:
  - Pattern must be selected
  - End condition must be selected
  - If "End on date": end date must be valid and within 5 years
  - If "End after occurrences": occurrences must be 1-1000
  - For WEEKLY/BIWEEKLY: At least one weekday must be selected
  - For MONTHLY: Day of month must be specified

**Visual Feedback:**
- Red border on invalid fields
- Error messages below fields
- Disable "Save Event" button if validation fails

### 3. State Management

**New State Variables in EventForm:**
```typescript
const [isRecurring, setIsRecurring] = useState(false);
const [recurrencePattern, setRecurrencePattern] = useState<'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | ''>('');
const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
const [recurrenceEndType, setRecurrenceEndType] = useState<'END_DATE' | 'OCCURRENCES'>('END_DATE');
const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>('');
const [recurrenceOccurrences, setRecurrenceOccurrences] = useState<number>(1);
const [recurrenceWeeklyDays, setRecurrenceWeeklyDays] = useState<number[]>([]);
const [recurrenceMonthlyDay, setRecurrenceMonthlyDay] = useState<number | 'LAST' | null>(null);
const [recurrencePreview, setRecurrencePreview] = useState<string[]>([]);
```

### 4. Metadata Serialization

**Update `handleSubmit` in EventForm.tsx:**
- Parse existing metadata
- Add recurrence configuration if `isRecurring` is true
- Merge with existing metadata (fundraiser/charity config)
- Serialize to JSON string before submission

**Helper Function:**
```typescript
function createRecurrenceMetadata(options: {
  isRecurring: boolean;
  pattern?: string;
  interval?: number;
  endType?: string;
  endDate?: string;
  occurrences?: number;
  weeklyDays?: number[];
  monthlyDay?: number | 'LAST';
}): Record<string, any> {
  // Implementation
}
```

### 5. Date Calculation Utilities

**New Utility Functions:**
```typescript
// Calculate next occurrence date based on pattern
function calculateNextOccurrence(
  startDate: Date,
  pattern: string,
  interval: number,
  currentDate: Date,
  weeklyDays?: number[],
  monthlyDay?: number | 'LAST'
): Date | null;

// Generate list of occurrence dates
function generateOccurrenceDates(
  startDate: Date,
  pattern: string,
  interval: number,
  endDate?: Date,
  maxOccurrences?: number,
  weeklyDays?: number[],
  monthlyDay?: number | 'LAST'
): Date[];

// Validate recurrence end date (max 5 years)
function validateRecurrenceEndDate(startDate: Date, endDate: Date): boolean;
```

---

## Backend Requirements

### 1. Database Schema Changes

#### Option A: Extend `event_details` table (Recommended for MVP)

**Add new columns:**
```sql
ALTER TABLE event_details
ADD COLUMN is_recurring BOOLEAN DEFAULT false,
ADD COLUMN recurrence_pattern VARCHAR(50) NULL,
ADD COLUMN recurrence_interval INTEGER NULL,
ADD COLUMN recurrence_end_type VARCHAR(20) NULL,
ADD COLUMN recurrence_end_date DATE NULL,
ADD COLUMN recurrence_occurrences INTEGER NULL,
ADD COLUMN recurrence_weekly_days INTEGER[] NULL,
ADD COLUMN recurrence_monthly_day INTEGER NULL,
ADD COLUMN parent_event_id BIGINT NULL,
ADD COLUMN recurrence_series_id BIGINT NULL;

-- Add foreign key for parent event
ALTER TABLE event_details
ADD CONSTRAINT fk_parent_event
FOREIGN KEY (parent_event_id) REFERENCES event_details(id);

-- Add index for series lookup
CREATE INDEX idx_recurrence_series_id ON event_details(recurrence_series_id);
```

**OR**

#### Option B: Use `metadata` field (Faster implementation, no migration)

Store recurrence configuration in existing `metadata` JSON field (same approach as fundraiser config).

**Recommendation**: Use Option B for MVP, migrate to Option A later if needed for performance.

### 2. New Database Table (For Advanced Features - Future)

**Table: `event_recurrence_series`**
```sql
CREATE TABLE event_recurrence_series (
    id BIGINT PRIMARY KEY DEFAULT nextval('sequence_generator'),
    tenant_id VARCHAR(255),
    parent_event_id BIGINT NOT NULL,
    pattern VARCHAR(50) NOT NULL,
    interval INTEGER NOT NULL,
    end_type VARCHAR(20) NOT NULL,
    end_date DATE NULL,
    occurrences INTEGER NULL,
    weekly_days INTEGER[] NULL,
    monthly_day INTEGER NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_parent_event FOREIGN KEY (parent_event_id) REFERENCES event_details(id)
);
```

### 3. API Endpoint Changes

#### 3.1 Event Creation/Update

**Current**: `POST /api/event-details` and `PUT /api/event-details/:id`

**Changes Required**:
- Accept recurrence configuration in request body
- Validate recurrence rules
- If recurring, generate child events (or schedule generation)

**Request Body Example:**
```json
{
  "title": "Weekly Meeting",
  "startDate": "2025-01-15",
  "endDate": "2025-01-15",
  "startTime": "18:00",
  "endTime": "19:00",
  "timezone": "America/New_York",
  "metadata": "{\"isRecurring\":true,\"recurrenceConfig\":{...}}",
  // ... other fields
}
```

#### 3.2 New Endpoint: Generate Recurring Events

**Endpoint**: `POST /api/event-details/:id/generate-recurring-events`

**Purpose**: Generate all child events for a recurring event series

**Request**: None (uses parent event configuration)

**Response**:
```json
{
  "parentEventId": 123,
  "generatedEvents": [
    {"id": 124, "startDate": "2025-01-15", ...},
    {"id": 125, "startDate": "2025-01-22", ...},
    ...
  ],
  "totalGenerated": 10
}
```

#### 3.3 New Endpoint: Get Recurring Series

**Endpoint**: `GET /api/event-details/:id/recurring-series`

**Purpose**: Get all events in a recurring series

**Response**:
```json
{
  "parentEvent": {...},
  "childEvents": [
    {"id": 124, "startDate": "2025-01-15", ...},
    {"id": 125, "startDate": "2025-01-22", ...},
    ...
  ],
  "totalOccurrences": 10
}
```

#### 3.4 New Endpoint: Update Recurring Series

**Endpoint**: `PUT /api/event-details/:id/recurring-series`

**Purpose**: Update recurrence configuration and regenerate events

**Request Body**:
```json
{
  "recurrenceConfig": {
    "pattern": "WEEKLY",
    "interval": 1,
    "endType": "OCCURRENCES",
    "occurrences": 20,
    "weeklyDays": [1, 3, 5]
  },
  "regenerateEvents": true  // Whether to regenerate child events
}
```

#### 3.5 New Endpoint: Delete Recurring Series

**Endpoint**: `DELETE /api/event-details/:id/recurring-series`

**Purpose**: Delete parent event and all child events in series

**Response**: `204 No Content`

### 4. Service Layer Implementation

#### 4.1 Recurrence Calculation Service

**File**: `RecurrenceCalculationService.java`

**Methods**:
```java
public List<LocalDate> calculateOccurrences(
    LocalDate startDate,
    RecurrencePattern pattern,
    int interval,
    LocalDate endDate,
    Integer maxOccurrences,
    List<Integer> weeklyDays,
    Integer monthlyDay
);

public LocalDate calculateNextOccurrence(
    LocalDate startDate,
    RecurrencePattern pattern,
    int interval,
    LocalDate currentDate,
    List<Integer> weeklyDays,
    Integer monthlyDay
);

public boolean validateRecurrenceEndDate(LocalDate startDate, LocalDate endDate);
```

#### 4.2 Event Generation Service

**File**: `RecurringEventGenerationService.java`

**Methods**:
```java
public List<EventDetailsDTO> generateRecurringEvents(
    EventDetailsDTO parentEvent,
    RecurrenceConfig recurrenceConfig
);

public void updateRecurringSeries(
    Long parentEventId,
    RecurrenceConfig newConfig,
    boolean regenerateEvents
);

public void deleteRecurringSeries(Long parentEventId);
```

### 5. Business Logic Rules

1. **Event Generation**:
   - Generate child events when parent event is created/updated
   - Each child event inherits all properties from parent except dates
   - Child events have `parent_event_id` set to parent event ID
   - Child events have `recurrence_series_id` set to parent event ID (for grouping)

2. **Event Updates**:
   - Updating parent event can optionally update all child events
   - Updating individual child event does not affect parent or siblings
   - Changing recurrence config regenerates all child events

3. **Event Deletion**:
   - Deleting parent event deletes all child events (cascade)
   - Deleting individual child event does not affect parent or siblings
   - Option to "Delete this occurrence only" vs "Delete entire series"

4. **Validation**:
   - Maximum 5 years from start date for end date
   - Maximum 1000 occurrences
   - At least one weekday selected for WEEKLY/BIWEEKLY
   - Valid day of month for MONTHLY (handle month-end edge cases)

---

## Implementation Phases

### Phase 1: Frontend UI (Week 1-2)
- [ ] Add recurring event toggle checkbox
- [ ] Add recurrence pattern radio buttons
- [ ] Add pattern-specific input fields
- [ ] Add end condition selection
- [ ] Add date/occurrence inputs
- [ ] Add preview section
- [ ] Implement form validation
- [ ] Update metadata serialization

### Phase 2: Backend API - Metadata Storage (Week 2-3)
- [ ] Update EventDetailsDTO to parse recurrence config from metadata
- [ ] Add validation for recurrence rules
- [ ] Update create/update endpoints to accept recurrence config
- [ ] Store recurrence config in metadata field

### Phase 3: Backend API - Event Generation (Week 3-4)
- [ ] Implement RecurrenceCalculationService
- [ ] Implement RecurringEventGenerationService
- [ ] Add generate-recurring-events endpoint
- [ ] Add get-recurring-series endpoint
- [ ] Add update-recurring-series endpoint
- [ ] Add delete-recurring-series endpoint

### Phase 4: Database Schema (Week 4-5) - Optional
- [ ] Create migration script for new columns
- [ ] Migrate existing metadata-based recurrence to columns
- [ ] Update DTOs and services to use columns instead of metadata

### Phase 5: Testing & Refinement (Week 5-6)
- [ ] Unit tests for recurrence calculation
- [ ] Integration tests for API endpoints
- [ ] Frontend E2E tests
- [ ] Performance testing (large series generation)
- [ ] User acceptance testing

---

## Technical Considerations

### 1. Performance

**Concerns**:
- Generating 1000+ events could be slow
- Database queries for recurring series could be expensive

**Solutions**:
- Generate events asynchronously (background job)
- Use pagination for large series
- Add database indexes on `recurrence_series_id` and `parent_event_id`
- Consider lazy generation (generate on-demand)

### 2. Data Consistency

**Concerns**:
- Parent event update should sync to children
- Partial failures during generation

**Solutions**:
- Use database transactions
- Implement rollback on failure
- Add "sync to series" option for updates

### 3. Edge Cases

**Monthly Recurrence**:
- Handle months with different day counts (e.g., Jan 31 → Feb 28/29)
- Strategy: Use "last day of month" or "closest valid day"

**Timezone Handling**:
- All occurrences use same timezone as parent event
- Daylight saving time transitions handled automatically by timezone library

**Holiday/Exception Handling** (Future Enhancement):
- Allow excluding specific dates
- Allow modifying individual occurrences

---

## API Examples

### Create Recurring Event

**Request**:
```http
POST /api/proxy/event-details
Content-Type: application/json

{
  "title": "Weekly Team Meeting",
  "startDate": "2025-01-15",
  "endDate": "2025-01-15",
  "startTime": "14:00",
  "endTime": "15:00",
  "timezone": "America/New_York",
  "location": "Conference Room A",
  "metadata": "{\"isRecurring\":true,\"recurrenceConfig\":{\"pattern\":\"WEEKLY\",\"interval\":1,\"endType\":\"OCCURRENCES\",\"occurrences\":10,\"weeklyDays\":[2]}}"
}
```

**Response**:
```json
{
  "id": 123,
  "title": "Weekly Team Meeting",
  "startDate": "2025-01-15",
  "isRecurring": true,
  "recurrenceSeriesId": 123,
  "generatedEventsCount": 10
}
```

### Get Recurring Series

**Request**:
```http
GET /api/proxy/event-details/123/recurring-series
```

**Response**:
```json
{
  "parentEvent": {
    "id": 123,
    "title": "Weekly Team Meeting",
    "startDate": "2025-01-15",
    ...
  },
  "childEvents": [
    {
      "id": 124,
      "parentEventId": 123,
      "startDate": "2025-01-15",
      "endDate": "2025-01-15",
      ...
    },
    {
      "id": 125,
      "parentEventId": 123,
      "startDate": "2025-01-22",
      "endDate": "2025-01-22",
      ...
    }
  ],
  "totalOccurrences": 10
}
```

---

## Frontend File Changes Summary

### New Files
1. `src/lib/recurrenceUtils.ts` - Recurrence calculation utilities
2. `src/components/RecurrenceConfigSection.tsx` - Recurrence configuration UI component
3. `src/components/RecurrencePreview.tsx` - Preview of occurrence dates

### Modified Files
1. `src/components/EventForm.tsx` - Add recurrence section
2. `src/types/index.ts` - Add recurrence-related types
3. `src/lib/eventUtils.ts` - Add recurrence metadata helpers

---

## Backend File Changes Summary

### New Files
1. `RecurrenceCalculationService.java` - Calculate occurrence dates
2. `RecurringEventGenerationService.java` - Generate child events
3. `RecurrenceConfig.java` - DTO for recurrence configuration
4. `RecurringEventResource.java` - REST controller for recurring events

### Modified Files
1. `EventDetailsDTO.java` - Add recurrence fields or parse from metadata
2. `EventDetailsService.java` - Handle recurrence on create/update
3. `EventDetailsResource.java` - Add recurring event endpoints

---

## Testing Requirements

### Frontend Tests
- [ ] Recurrence toggle shows/hides configuration
- [ ] Pattern selection shows correct fields
- [ ] Validation prevents invalid configurations
- [ ] Preview updates correctly
- [ ] Metadata serialization includes recurrence config

### Backend Tests
- [ ] Recurrence calculation for all patterns
- [ ] Event generation creates correct number of events
- [ ] End date validation (5 year limit)
- [ ] Occurrences limit (1000 max)
- [ ] Series queries return correct events
- [ ] Update/delete operations work correctly

### Integration Tests
- [ ] Create recurring event via API
- [ ] Generate events endpoint
- [ ] Get series endpoint
- [ ] Update series endpoint
- [ ] Delete series endpoint

---

## Success Criteria

1. ✅ Users can create recurring events with all supported patterns
2. ✅ Recurrence end date is limited to 5 years maximum
3. ✅ Users can specify end by date or occurrences
4. ✅ Preview shows upcoming occurrences
5. ✅ All child events are generated correctly
6. ✅ Parent and child events are linked properly
7. ✅ Updates to parent can sync to children
8. ✅ Series can be deleted as a whole
9. ✅ Performance is acceptable for up to 1000 occurrences
10. ✅ UI follows existing design patterns and style guide

---

## Future Enhancements (Out of Scope)

1. **Exception Dates**: Exclude specific dates from recurrence
2. **Individual Occurrence Modifications**: Modify single occurrences without affecting series
3. **Complex Patterns**: "First Monday of month", "Last Friday", etc.
4. **Yearly Recurrence**: Annual events
5. **Recurrence Templates**: Save common recurrence patterns
6. **Bulk Operations**: Update/delete multiple series at once
7. **Recurrence Analytics**: Statistics on recurring event attendance

---

## References

- Current Event Form: `src/components/EventForm.tsx`
- Event Details DTO: `src/types/index.ts`
- Metadata Pattern: `src/lib/eventUtils.ts` (createFundraiserMetadata)
- UI Style Guide: `shared-cursor-rules/ui_style_guide.mdc`
- Database Schema: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`

---

## Questions for Clarification

1. Should child events be editable individually, or only through parent?
2. Should we generate all events immediately, or lazily (on-demand)?
3. What happens to existing registrations if recurrence config changes?
4. Should we support "infinite" recurrence (no end date)?
5. How should we handle timezone changes for recurring events?

---

## Conclusion

This requirements analysis provides a comprehensive roadmap for implementing recurring events functionality. The recommended approach is to:

1. **Start with metadata-based storage** (no database migration needed)
2. **Implement frontend UI first** (validate user experience)
3. **Add backend event generation** (core functionality)
4. **Consider database migration later** (if performance requires it)

The feature can be implemented incrementally, with each phase delivering value independently.

