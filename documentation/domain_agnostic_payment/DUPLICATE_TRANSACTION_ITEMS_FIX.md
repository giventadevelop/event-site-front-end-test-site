# Duplicate Transaction Items Fix

## 🚨 Problem Statement

**Issue:** Duplicate `event_ticket_transaction_item` records are being created when:
- User refreshes the success page
- Multiple requests hit the API simultaneously (race condition)
- Webhook and frontend call happen at the same time

**Root Cause:** Frontend idempotency checks are **not atomic**. When two requests check for existing items simultaneously, both see "no items" and both create items, resulting in duplicates.

**Evidence:**
```sql
INSERT INTO public.event_ticket_transaction_item
(id, tenant_id, transaction_id, ticket_type_id, quantity, price_per_unit, total_amount, created_at, updated_at)
VALUES(12101, 'tenant_demo_002', 12051, 4152, 2, 0.60, 1.20, '2025-11-27 14:20:39.565', '2025-11-27 14:20:39.565');
INSERT INTO public.event_ticket_transaction_item
(id, tenant_id, transaction_id, ticket_type_id, quantity, price_per_unit, total_amount, created_at, updated_at)
VALUES(12102, 'tenant_demo_002', 12051, 4152, 2, 0.60, 1.20, '2025-11-27 14:23:45.428', '2025-11-27 14:23:45.428');
-- Same transaction_id (12051) and ticket_type_id (4152) - DUPLICATE!
```

---

## 🔍 Why Frontend Fixes Are Insufficient

### Current Frontend Approach
1. Check if items exist: `GET /api/event-ticket-transaction-items?transactionId.equals=X&ticketTypeId.equals=Y`
2. If no items found, create them: `POST /api/event-ticket-transaction-items/bulk`

### Race Condition Scenario
```
Time    Request A                    Request B
─────────────────────────────────────────────────────
T0      Check for items → None      Check for items → None
T1      Create items ✓              Create items ✓
T2      Items created               Items created
Result: DUPLICATES! ❌
```

**Problem:** The check-and-create operation is **not atomic**. Between checking and creating, another request can also check and create.

---

## ✅ Backend Solution (Required)

The backend must enforce **database-level uniqueness** to prevent duplicates, even in race conditions.

### Option 1: Database Unique Constraint (Recommended)

Add a **unique constraint** on `(transaction_id, ticket_type_id, tenant_id)`:

```sql
-- PostgreSQL example
ALTER TABLE event_ticket_transaction_item
ADD CONSTRAINT unique_transaction_ticket_type_tenant
UNIQUE (transaction_id, ticket_type_id, tenant_id);
```

**Benefits:**
- ✅ Prevents duplicates at database level (atomic)
- ✅ Works even with concurrent requests
- ✅ No code changes needed (database enforces it)
- ✅ Fast (indexed constraint)

**Backend Code Changes:**
```java
// In EventTicketTransactionItem entity
@Entity
@Table(name = "event_ticket_transaction_item",
       uniqueConstraints = {
           @UniqueConstraint(
               name = "unique_transaction_ticket_type_tenant",
               columnNames = {"transaction_id", "ticket_type_id", "tenant_id"}
           )
       })
public class EventTicketTransactionItem {
    // ... existing fields
}
```

### Option 2: Backend Idempotency Check (Alternative)

If unique constraint is not possible, add idempotency check in the bulk create endpoint:

```java
@PostMapping("/api/event-ticket-transaction-items/bulk")
public ResponseEntity<List<EventTicketTransactionItemDTO>> createBulk(
    @RequestBody List<EventTicketTransactionItemDTO> items,
    @RequestHeader("X-Tenant-Id") String tenantId
) {
    List<EventTicketTransactionItemDTO> createdItems = new ArrayList<>();

    for (EventTicketTransactionItemDTO item : items) {
        // Check if item already exists (atomic database query)
        Optional<EventTicketTransactionItem> existing = repository.findByTransactionIdAndTicketTypeIdAndTenantId(
            item.getTransactionId(),
            item.getTicketTypeId(),
            tenantId
        );

        if (existing.isPresent()) {
            log.info("Transaction item already exists - skipping: transactionId={}, ticketTypeId={}",
                item.getTransactionId(), item.getTicketTypeId());
            continue; // Skip duplicate
        }

        // Create new item
        EventTicketTransactionItem newItem = mapper.toEntity(item);
        newItem.setTenantId(tenantId);
        EventTicketTransactionItem saved = repository.save(newItem);
        createdItems.add(mapper.toDTO(saved));
    }

    return ResponseEntity.ok(createdItems);
}
```

**Benefits:**
- ✅ Prevents duplicates
- ✅ More flexible than unique constraint
- ⚠️ Requires code changes
- ⚠️ Still vulnerable to race conditions unless using database transactions with proper isolation

### Option 3: Database Transaction with SELECT FOR UPDATE (Most Robust)

Use database-level locking to ensure atomicity:

```java
@Transactional
@PostMapping("/api/event-ticket-transaction-items/bulk")
public ResponseEntity<List<EventTicketTransactionItemDTO>> createBulk(
    @RequestBody List<EventTicketTransactionItemDTO> items,
    @RequestHeader("X-Tenant-Id") String tenantId
) {
    List<EventTicketTransactionItemDTO> createdItems = new ArrayList<>();

    for (EventTicketTransactionItemDTO item : items) {
        // Use SELECT FOR UPDATE to lock the row (prevents concurrent inserts)
        Optional<EventTicketTransactionItem> existing = repository
            .findByTransactionIdAndTicketTypeIdAndTenantIdForUpdate(
                item.getTransactionId(),
                item.getTicketTypeId(),
                tenantId
            );

        if (existing.isPresent()) {
            log.info("Transaction item already exists - skipping: transactionId={}, ticketTypeId={}",
                item.getTransactionId(), item.getTicketTypeId());
            continue;
        }

        // Create new item (within transaction)
        EventTicketTransactionItem newItem = mapper.toEntity(item);
        newItem.setTenantId(tenantId);
        EventTicketTransactionItem saved = repository.save(newItem);
        createdItems.add(mapper.toDTO(saved));
    }

    return ResponseEntity.ok(createdItems);
}
```

**Repository Method:**
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT e FROM EventTicketTransactionItem e " +
       "WHERE e.transactionId = :transactionId " +
       "AND e.ticketTypeId = :ticketTypeId " +
       "AND e.tenantId = :tenantId")
Optional<EventTicketTransactionItem> findByTransactionIdAndTicketTypeIdAndTenantIdForUpdate(
    @Param("transactionId") Long transactionId,
    @Param("ticketTypeId") Long ticketTypeId,
    @Param("tenantId") String tenantId
);
```

---

## 📋 Recommendation

**Use Option 1 (Unique Constraint)** because:
1. ✅ Simplest and most reliable
2. ✅ No code changes needed (database enforces it)
3. ✅ Prevents duplicates at the source
4. ✅ Fast (indexed constraint)
5. ✅ Works even if frontend has bugs

**If unique constraint is not possible**, use **Option 3 (SELECT FOR UPDATE)** for maximum robustness.

---

## 🔧 Frontend Improvements (Already Implemented)

The frontend has been enhanced with:
1. ✅ Per-item idempotency checks (not just count-based)
2. ✅ Retry logic with delays to handle race conditions
3. ✅ Comprehensive logging for debugging

However, **frontend fixes alone are not sufficient** - backend must enforce uniqueness.

---

## 🧪 Testing

After implementing backend fix:

1. **Test Race Condition:**
   - Open success page in two browser tabs simultaneously
   - Refresh both tabs at the same time
   - Verify only one set of transaction items is created

2. **Test Webhook + Frontend:**
   - Trigger webhook and frontend call simultaneously
   - Verify no duplicates are created

3. **Test Multiple Refreshes:**
   - Refresh success page multiple times
   - Verify no duplicates are created

---

## 📝 Summary

- **Problem:** Race conditions cause duplicate transaction items
- **Root Cause:** Frontend checks are not atomic
- **Solution:** Backend must enforce uniqueness (unique constraint or idempotency check)
- **Recommendation:** Use database unique constraint (Option 1)
- **Status:** Frontend improvements implemented, backend fix required



