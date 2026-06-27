# Bulk Refund Feature Analysis

## Overview

This document provides a comprehensive analysis for implementing a bulk refund feature for event tickets. The feature will allow administrators to refund all tickets sold for an event in a single operation, particularly useful when events are canceled.

**Target Page**: `/admin/events/{eventId}/tickets/list`
**Backend Project Location**: `E:\project_workspace\malayalees-us-site-boot`

---

## Current State Analysis

### Frontend Implementation

#### Current Single Refund Flow
1. **Location**: `src/app/admin/events/[id]/tickets/list/`
2. **Files**:
   - `page.tsx` - Main tickets list page (server component)
   - `TicketTableClient.tsx` - Client component with refund modal
   - `ApiServerActions.ts` - Server action for single refund

#### Current Refund Process
```typescript
// Current single refund flow (ApiServerActions.ts)
export async function refundTicketTransactionServer(ticket: EventTicketTransactionDTO, reason: string) {
  1. Validate ticket has stripePaymentIntentId
  2. Create Stripe refund via stripe.refunds.create()
  3. Update ticket transaction via PATCH /api/proxy/event-ticket-transactions/{id}
     - Set status: 'REFUNDED'
     - Set refundAmount, refundDate, refundReason
     - Set stripePaymentStatus: 'refunded'
}
```

#### Current UI Components
- **Refund Button**: Individual "Refund" button per ticket row
- **Refund Modal**: `RefundModal` component with reason selection
- **Refund Reasons**: Predefined list (Duplicate purchase, Customer request, Event canceled, Payment error, Other)

### Backend API Structure

#### Current Endpoints
- **GET** `/api/event-ticket-transactions` - List tickets with filters
- **GET** `/api/event-ticket-transactions/{id}` - Get single ticket
- **PATCH** `/api/event-ticket-transactions/{id}` - Update ticket (used for refund status)
- **GET** `/api/event-ticket-transactions/statistics/{eventId}` - Get event statistics

#### Current Database Schema
**Table**: `event_ticket_transaction`

Key refund-related fields:
- `status` VARCHAR(255) - Current values: 'PENDING', 'COMPLETED', 'REFUNDED', etc.
- `refund_amount` NUMERIC(21,2) - Amount refunded
- `refund_date` TIMESTAMP - When refund occurred
- `refund_reason` VARCHAR(2048) - Reason for refund
- `stripe_payment_intent_id` VARCHAR(255) - Required for Stripe refund
- `stripe_payment_status` VARCHAR(50) - Payment status ('refunded', etc.)

**Constraints**:
- `unique_stripe_payment_intent` - Ensures unique payment intent IDs
- `check_transaction_amounts` - Validates refund_amount >= 0

---

## Requirements for Bulk Refund

### Functional Requirements

1. **Bulk Refund Button**
   - Should appear on tickets list page (`/admin/events/{eventId}/tickets/list`)
   - Should be prominently displayed, possibly near statistics dashboard
   - Should only be enabled when:
     - Event has tickets sold (statistics.totalTicketsSold > 0)
     - At least one ticket is refundable (status != 'REFUNDED')
     - User has admin permissions

2. **Refund Scope**
   - Refund ALL tickets for the event (not just visible page)
   - Filter criteria:
     - `eventId.equals={eventId}`
     - `status.equals=COMPLETED` (or other non-refunded statuses)
     - `tenantId.equals={tenantId}` (automatic via proxy)
   - Exclude already refunded tickets

3. **Bulk Refund Process**
   - Show confirmation modal with:
     - Total number of tickets to refund
     - Total refund amount
     - Refund reason selection (same as single refund)
     - Warning about irreversible action
   - Process refunds sequentially or in batches
   - Show progress indicator during processing
   - Handle partial failures gracefully
   - Provide summary of results (successful/failed)

4. **Error Handling**
   - Handle Stripe API failures
   - Handle tickets without payment intent IDs
   - Handle network failures
   - Continue processing remaining tickets if one fails
   - Log all failures for review

### Non-Functional Requirements

1. **Performance**
   - Should handle large numbers of tickets (100+)
   - Should not timeout on long-running operations
   - Should provide progress feedback to user

2. **Security**
   - Require admin authentication
   - Validate tenant isolation
   - Audit log all bulk refund operations

3. **User Experience**
   - Clear confirmation before bulk action
   - Progress indicator during processing
   - Clear success/failure feedback
   - Ability to review failed refunds

---

## Frontend Changes Required

### 1. New Server Action: Bulk Refund

**File**: `src/app/admin/events/[id]/tickets/list/ApiServerActions.ts`

**New Function**:
```typescript
export async function bulkRefundEventTicketsServer(
  eventId: number,
  reason: string,
  ticketIds?: number[] // Optional: specific tickets, or null for all
): Promise<BulkRefundResultDTO>
```

**Implementation Approach**:
- Option A: Process all refunds in single server action (may timeout for large events)
- Option B: Process in batches with progress updates (recommended)
- Option C: Queue job and return immediately (requires backend job queue)

**Recommended**: Option B - Batch processing with progress updates

### 2. New Client Component: Bulk Refund Button & Modal

**File**: `src/app/admin/events/[id]/tickets/list/BulkRefundButton.tsx`

**Components Needed**:
- `BulkRefundButton` - Button component
- `BulkRefundModal` - Confirmation modal with:
  - Ticket count display
  - Total refund amount calculation
  - Reason selection dropdown
  - Warning message
  - Progress indicator (during processing)
  - Results summary (after completion)

**UI Placement**:
- Add button near statistics dashboard
- Use destructive styling (red/orange) to indicate caution
- Icon: `FaMoneyBillWave` or `FaUndo`

### 3. Update Tickets List Page

**File**: `src/app/admin/events/[id]/tickets/list/page.tsx`

**Changes**:
- Add bulk refund button component
- Pass statistics data to client component
- Handle bulk refund completion (refresh page or update state)

### 4. New Types

**File**: `src/types/index.ts`

**New DTOs**:
```typescript
export interface BulkRefundRequestDTO {
  eventId: number;
  reason: string;
  ticketIds?: number[]; // Optional: specific tickets, or null for all refundable tickets
}

export interface BulkRefundResultDTO {
  totalTickets: number;
  successfulRefunds: number;
  failedRefunds: number;
  totalRefundAmount: number;
  results: BulkRefundItemResultDTO[];
}

export interface BulkRefundItemResultDTO {
  ticketId: number;
  success: boolean;
  error?: string;
  refundAmount?: number;
  stripeRefundId?: string;
}
```

---

## Backend Changes Required

### 1. New Bulk Refund Endpoint

**Recommended Approach**: Create dedicated bulk refund endpoint

**Endpoint**: `POST /api/event-ticket-transactions/bulk-refund`

**Location**: `E:\project_workspace\malayalees-us-site-boot\src\main\java\com\nextjstemplate\web\rest\EventTicketTransactionResource.java`

**Request Body**:
```json
{
  "eventId": 2,
  "reason": "Event canceled",
  "ticketIds": null  // null = all refundable tickets for event
}
```

**Response**:
```json
{
  "totalTickets": 50,
  "successfulRefunds": 48,
  "failedRefunds": 2,
  "totalRefundAmount": 2450.00,
  "results": [
    {
      "ticketId": 123,
      "success": true,
      "refundAmount": 50.00,
      "stripeRefundId": "re_1234567890"
    },
    {
      "ticketId": 124,
      "success": false,
      "error": "No Stripe payment intent ID found"
    }
  ]
}
```

### 2. Backend Service Method

**Location**: `EventTicketTransactionService.java`

**Method Signature**:
```java
public BulkRefundResultDTO bulkRefundEventTickets(
    Long eventId,
    String reason,
    List<Long> ticketIds,  // null = all refundable tickets
    String tenantId
) throws PaymentException
```

**Implementation Logic**:
1. Query refundable tickets:
   ```sql
   SELECT * FROM event_ticket_transaction
   WHERE event_id = :eventId
     AND tenant_id = :tenantId
     AND status = 'COMPLETED'  -- or other non-refunded statuses
     AND stripe_payment_intent_id IS NOT NULL
     AND (ticketIds IS NULL OR id IN (:ticketIds))
   ORDER BY id
   ```

2. Process refunds in batches (e.g., 10 at a time):
   - For each ticket:
     - Create Stripe refund via Stripe API
     - Update ticket status to 'REFUNDED'
     - Set refund_amount, refund_date, refund_reason
     - Set stripe_payment_status = 'refunded'
     - Record result (success/failure)

3. Return aggregated results

### 3. Error Handling Strategy

**Backend Should**:
- Continue processing if individual refund fails
- Log all errors with ticket ID and error message
- Return partial success results
- Validate tenant isolation
- Validate event exists and belongs to tenant

### 4. Transaction Management

**Considerations**:
- Use database transactions for ticket updates
- Stripe refunds are external API calls (not transactional)
- If Stripe refund succeeds but DB update fails, log for manual reconciliation
- Consider idempotency: check if ticket already refunded before processing

### 5. Audit Logging

**Recommendation**: Use existing `bulk_operation_log` table if available

**Log Entry Should Include**:
- Operation type: "BULK_REFUND"
- Target event ID
- Executed by (user ID)
- Execution time
- Total records processed
- Success/failure counts
- Operation details (JSON)

---

## Database Changes Required

### Analysis: No Schema Changes Needed

**Current Schema Supports Bulk Refund**:
- ✅ `status` field can be updated to 'REFUNDED'
- ✅ `refund_amount`, `refund_date`, `refund_reason` fields exist
- ✅ `stripe_payment_intent_id` is available for Stripe refunds
- ✅ Indexes on `event_id` and `tenant_id` support efficient queries

### Optional Enhancements (Not Required)

1. **Bulk Operation Log Table** (if not exists):
   ```sql
   CREATE TABLE bulk_operation_log (
     id BIGSERIAL PRIMARY KEY,
     operation_type VARCHAR(100) NOT NULL,
     target_event_id BIGINT,
     executed_by VARCHAR(255),
     execution_time TIMESTAMP DEFAULT NOW(),
     total_records INTEGER,
     success_count INTEGER,
     error_count INTEGER,
     operation_details JSONB,
     tenant_id VARCHAR(255),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Index for Bulk Queries**:
   ```sql
   CREATE INDEX idx_event_ticket_transaction_bulk_refund
   ON event_ticket_transaction(event_id, tenant_id, status, stripe_payment_intent_id)
   WHERE status != 'REFUNDED';
   ```

---

## API Design

### Frontend Proxy Endpoint

**File**: `src/pages/api/proxy/event-ticket-transactions/bulk-refund.ts`

**Implementation**:
```typescript
import { createProxyHandler } from '@/lib/proxyHandler';

// Use shared handler for JWT, tenantId, error handling
export default createProxyHandler({
  backendPath: '/api/event-ticket-transactions/bulk-refund',
  allowedMethods: ['POST']
});
```

**Note**: Since this is a POST endpoint (not a slug route), create dedicated handler file.

### Backend Endpoint Specification

**Method**: `POST`
**Path**: `/api/event-ticket-transactions/bulk-refund`
**Content-Type**: `application/json`

**Request**:
```typescript
interface BulkRefundRequest {
  eventId: number;
  reason: string;
  ticketIds?: number[]; // Optional: null = all refundable tickets
}
```

**Response**:
```typescript
interface BulkRefundResponse {
  totalTickets: number;
  successfulRefunds: number;
  failedRefunds: number;
  totalRefundAmount: number;
  results: Array<{
    ticketId: number;
    success: boolean;
    error?: string;
    refundAmount?: number;
    stripeRefundId?: string;
  }>;
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request (missing eventId, reason, etc.)
- `401 Unauthorized`: Missing/invalid JWT
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Event not found
- `500 Internal Server Error`: Server error during processing

---

## UI/UX Design

### Button Placement

**Location**: Above or below statistics dashboard

**Design**:
```tsx
<div className="mb-6">
  {/* Statistics Dashboard */}
  <div className="bg-gradient-to-r from-teal-100 to-blue-100 ...">
    {/* Existing statistics */}
  </div>

  {/* Bulk Refund Button */}
  <div className="mt-4 flex justify-end">
    <BulkRefundButton
      eventId={eventId}
      statistics={statistics}
      disabled={!canRefund}
    />
  </div>
</div>
```

### Button Styling

**Following UI Style Guide** (`ui_style_guide.mdc`):
- Use destructive color scheme (red/orange)
- Large, prominent button
- Icon + text label
- Disabled state when no refundable tickets

**Example**:
```tsx
<button
  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 font-semibold text-lg transition-all"
  disabled={disabled}
>
  <FaUndo className="text-xl" />
  Refund All Tickets
</button>
```

### Confirmation Modal

**Components**:
1. **Header**: "Bulk Refund Confirmation"
2. **Summary Section**:
   - Total tickets to refund: `X tickets`
   - Total refund amount: `$X,XXX.XX`
   - Event name and ID
3. **Reason Selection**: Dropdown (same options as single refund)
4. **Warning Message**:
   - "This action cannot be undone."
   - "All selected tickets will be refunded immediately."
   - "Refunds will be processed via Stripe."
5. **Action Buttons**:
   - Cancel (secondary)
   - Confirm Refund (primary, destructive)

### Progress Indicator

**During Processing**:
- Show progress bar or spinner
- Display: "Processing refunds... X of Y completed"
- Disable cancel button
- Show estimated time remaining (if possible)

### Results Summary

**After Completion**:
- Success count: `X tickets refunded successfully`
- Failure count: `Y tickets failed to refund`
- Total refunded: `$X,XXX.XX`
- Failed tickets list (expandable):
  - Ticket ID, Error message
  - Option to retry individual refunds

---

## Error Handling Strategy

### Frontend Error Handling

1. **Validation Errors**:
   - Check if event has refundable tickets
   - Require refund reason selection
   - Show validation messages in modal

2. **API Errors**:
   - Handle network failures
   - Handle timeout errors (for large batches)
   - Display user-friendly error messages
   - Allow retry for failed refunds

3. **Partial Failures**:
   - Show success/failure breakdown
   - Allow retry of failed tickets
   - Log all errors for admin review

### Backend Error Handling

1. **Input Validation**:
   - Validate eventId exists and belongs to tenant
   - Validate reason is provided
   - Validate ticketIds (if provided) exist and belong to event

2. **Stripe API Errors**:
   - Catch Stripe exceptions
   - Log error with ticket ID
   - Continue processing remaining tickets
   - Return error in results array

3. **Database Errors**:
   - Use transactions for ticket updates
   - Rollback on critical errors
   - Log database errors separately

4. **Idempotency**:
   - Check if ticket already refunded before processing
   - Skip already-refunded tickets
   - Return success for already-refunded tickets

---

## Performance Considerations

### Batch Processing

**Recommendation**: Process refunds in batches of 10-20 tickets

**Rationale**:
- Prevents timeout on large events (100+ tickets)
- Allows progress updates to user
- Reduces memory usage
- Better error isolation

**Implementation**:
```typescript
async function processBulkRefundInBatches(
  tickets: EventTicketTransactionDTO[],
  reason: string,
  batchSize: number = 10
): Promise<BulkRefundResultDTO> {
  const results: BulkRefundItemResultDTO[] = [];

  for (let i = 0; i < tickets.length; i += batchSize) {
    const batch = tickets.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(ticket => refundTicketTransactionServer(ticket, reason))
    );
    // Process batch results...
  }

  return aggregateResults(results);
}
```

### Timeout Handling

**Frontend**:
- Set reasonable timeout (e.g., 5 minutes for 100 tickets)
- Show progress updates during processing
- Allow cancellation (if possible)

**Backend**:
- Use async processing for large batches
- Consider job queue for very large operations (100+ tickets)
- Return immediately with job ID, poll for status

### Database Performance

**Query Optimization**:
- Use indexed fields (event_id, tenant_id, status)
- Limit query to refundable tickets only
- Use pagination if needed (though bulk refund should process all)

**Update Performance**:
- Batch database updates if possible
- Use prepared statements
- Consider bulk update queries

---

## Security Considerations

### Authentication & Authorization

1. **Frontend**:
   - Require admin authentication (already enforced by page route)
   - Validate user has permission to refund tickets

2. **Backend**:
   - Validate JWT token
   - Validate tenant isolation (tickets belong to user's tenant)
   - Check user has admin role (if role-based access control exists)

### Data Validation

1. **Event Ownership**:
   - Verify event belongs to tenant
   - Verify tickets belong to event
   - Prevent cross-tenant refunds

2. **Input Sanitization**:
   - Validate eventId is numeric
   - Validate reason is not empty
   - Validate ticketIds (if provided) are numeric array

### Audit Trail

1. **Logging**:
   - Log all bulk refund operations
   - Include: user ID, event ID, timestamp, results
   - Store in `bulk_operation_log` table (if exists)

2. **Stripe Metadata**:
   - Include bulk refund identifier in Stripe refund metadata
   - Include admin user ID
   - Include event ID

---

## Testing Strategy

### Unit Tests

1. **Frontend**:
   - Test bulk refund button rendering
   - Test modal opening/closing
   - Test reason selection
   - Test validation errors

2. **Backend**:
   - Test bulk refund service method
   - Test ticket query logic
   - Test Stripe refund integration
   - Test error handling

### Integration Tests

1. **End-to-End Flow**:
   - Test bulk refund for small event (5-10 tickets)
   - Test bulk refund for large event (50+ tickets)
   - Test partial failures
   - Test already-refunded tickets

2. **Error Scenarios**:
   - Test with invalid event ID
   - Test with tickets without payment intent IDs
   - Test with Stripe API failures
   - Test with network failures

### Manual Testing Checklist

- [ ] Bulk refund button appears on tickets list page
- [ ] Button is disabled when no refundable tickets
- [ ] Confirmation modal shows correct ticket count
- [ ] Confirmation modal shows correct total refund amount
- [ ] Reason selection works correctly
- [ ] Bulk refund processes all tickets
- [ ] Progress indicator shows during processing
- [ ] Results summary shows success/failure counts
- [ ] Failed tickets can be retried individually
- [ ] Page refreshes after successful bulk refund
- [ ] Statistics update correctly after refund
- [ ] Already-refunded tickets are skipped
- [ ] Tenant isolation is maintained

---

## Implementation Phases

### Phase 1: Backend API (Required)

1. Create bulk refund endpoint
2. Implement service method with batch processing
3. Add error handling and logging
4. Write unit tests

### Phase 2: Frontend UI (Required)

1. Create bulk refund button component
2. Create confirmation modal
3. Create progress indicator
4. Create results summary component
5. Integrate with tickets list page

### Phase 3: Server Actions (Required)

1. Create bulk refund server action
2. Implement batch processing logic
3. Add error handling
4. Add progress updates (if using streaming)

### Phase 4: Testing & Refinement (Required)

1. Unit tests
2. Integration tests
3. Manual testing
4. Performance testing
5. Error scenario testing

### Phase 5: Optional Enhancements

1. Job queue for very large events (100+ tickets)
2. Email notifications for bulk refunds
3. Detailed audit logs
4. Retry mechanism for failed refunds
5. Export failed refunds to CSV

---

## API Reference

### Swagger/OpenAPI Documentation

**Endpoint**: `POST /api/event-ticket-transactions/bulk-refund`

**Request Schema**:
```json
{
  "type": "object",
  "required": ["eventId", "reason"],
  "properties": {
    "eventId": {
      "type": "integer",
      "format": "int64",
      "description": "Event ID to refund all tickets for"
    },
    "reason": {
      "type": "string",
      "maxLength": 2048,
      "description": "Reason for bulk refund"
    },
    "ticketIds": {
      "type": "array",
      "items": {
        "type": "integer",
        "format": "int64"
      },
      "description": "Optional: Specific ticket IDs to refund. If null, refunds all refundable tickets for the event."
    }
  }
}
```

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "totalTickets": {
      "type": "integer",
      "description": "Total number of tickets processed"
    },
    "successfulRefunds": {
      "type": "integer",
      "description": "Number of successful refunds"
    },
    "failedRefunds": {
      "type": "integer",
      "description": "Number of failed refunds"
    },
    "totalRefundAmount": {
      "type": "number",
      "format": "double",
      "description": "Total amount refunded (sum of successful refunds)"
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "ticketId": {
            "type": "integer",
            "format": "int64"
          },
          "success": {
            "type": "boolean"
          },
          "error": {
            "type": "string"
          },
          "refundAmount": {
            "type": "number",
            "format": "double"
          },
          "stripeRefundId": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

---

## Dependencies

### Frontend Dependencies

- ✅ Existing: `stripe` library (already used for single refunds)
- ✅ Existing: `react-icons` (for icons)
- ✅ Existing: Modal component
- ✅ No new dependencies required

### Backend Dependencies

- ✅ Existing: Stripe Java SDK (already used)
- ✅ Existing: Spring Data JPA (for database queries)
- ✅ Existing: Transaction management
- ✅ No new dependencies required

---

## Risks & Mitigations

### Risk 1: Timeout on Large Events

**Risk**: Processing 100+ tickets may timeout

**Mitigation**:
- Implement batch processing (10-20 tickets per batch)
- Use async processing or job queue for very large events
- Show progress updates to user
- Allow cancellation if needed

### Risk 2: Partial Failures

**Risk**: Some refunds succeed, others fail

**Mitigation**:
- Continue processing remaining tickets on failure
- Return detailed results with success/failure breakdown
- Allow retry of failed tickets
- Log all errors for manual review

### Risk 3: Stripe API Rate Limits

**Risk**: Stripe may rate limit bulk refund requests

**Mitigation**:
- Implement rate limiting/throttling
- Add delays between batches if needed
- Monitor Stripe API usage
- Consider Stripe's batch refund API (if available)

### Risk 4: Database Lock Contention

**Risk**: Concurrent updates may cause database locks

**Mitigation**:
- Use appropriate transaction isolation levels
- Process updates in batches
- Use optimistic locking if needed
- Monitor database performance

### Risk 5: Accidental Bulk Refunds

**Risk**: Admin accidentally triggers bulk refund

**Mitigation**:
- Require explicit confirmation modal
- Show clear warning messages
- Require refund reason selection
- Consider requiring second confirmation for large events (50+ tickets)
- Implement audit logging

---

## Conclusion

### Summary

The bulk refund feature can be implemented with **minimal database changes** (none required, optional enhancements available). The implementation requires:

1. **Backend**: New bulk refund endpoint with batch processing
2. **Frontend**: New bulk refund button and modal components
3. **Server Actions**: Bulk refund server action with progress tracking

### Key Design Decisions

1. **Batch Processing**: Process refunds in batches of 10-20 to prevent timeouts
2. **Partial Success**: Continue processing on individual failures, return detailed results
3. **No Schema Changes**: Current database schema supports bulk refunds
4. **Dedicated Endpoint**: Create new `/bulk-refund` endpoint rather than extending existing endpoints

### Next Steps

1. Review and approve this analysis
2. Implement backend bulk refund endpoint
3. Implement frontend UI components
4. Test with small and large events
5. Deploy to staging environment
6. Perform user acceptance testing
7. Deploy to production

---

## References

- Current refund implementation: `src/app/admin/events/[id]/tickets/list/ApiServerActions.ts`
- Tickets list page: `src/app/admin/events/[id]/tickets/list/page.tsx`
- Database schema: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`
- UI style guide: `shared-cursor-rules/ui_style_guide.mdc`
- API documentation: `documentation/Swagger_API_Docs/api-docs.json`
- Next.js API routes rules: `.cursor/rules/nextjs_api_routes.mdc`

---

**Document Version**: 1.0
**Last Updated**: 2025-01-XX
**Author**: AI Assistant
**Status**: Analysis Complete - Ready for Implementation Review



