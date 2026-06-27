# Ticket Sold-Out Validation Analysis & Recommendations

## 📋 Current Implementation Analysis

### Current Approach

The checkout page (`/events/[id]/checkout`) uses **client-side validation** based on ticket availability data fetched once on page load:

1. **Data Fetching**: Ticket types are fetched server-side with `remainingQuantity`, `availableQuantity`, and `soldQuantity` fields
2. **Availability Calculation**: Uses `calculateRemainingQuantity()` helper:
   - Prefers `remainingQuantity` if available
   - Falls back to `availableQuantity - soldQuantity`
   - Treats `availableQuantity === null/undefined/0` as unlimited (999999)
3. **Validation Points**:
   - **Selection Prevention**: Blocks ticket selection if `remaining <= 0`
   - **Checkout Blocking**: Uses `hasUnavailableTickets` flag to disable checkout
   - **UI Feedback**: Shows sold-out badges, low stock warnings, and error messages

### Code Locations

**Frontend Validation:**
- `src/app/events/[id]/checkout/CheckoutClient.tsx`:
  - `calculateRemainingQuantity()` (lines 181-197)
  - `handleTicketChange()` (lines 199-227)
  - `hasUnavailableTickets` check (lines 236-251)
  - UI rendering with sold-out indicators (lines 759-836)

**Backend Validation:**
- Database trigger: `manage_ticket_inventory()` validates availability when `event_ticket_transaction_item` is inserted
- Only validates **AFTER** payment succeeds (when transaction status = 'COMPLETED')
- Raises exception if insufficient tickets: `'Insufficient tickets available. Requested: X, Available: Y'`

---

## ⚠️ Issues & Limitations

### 1. **Race Condition - Stale Data**
**Problem**: Ticket availability is fetched once on page load and never refreshed.

**Scenario**:
- User A loads checkout page at 10:00 AM → sees 10 tickets available
- User B purchases 5 tickets at 10:05 AM
- User A still sees 10 tickets available (stale data)
- User A selects 8 tickets and proceeds to checkout
- **Result**: User A may get through payment flow before backend validation catches it

**Impact**:
- Poor user experience (payment fails after entering card details)
- Potential for overselling if backend validation is delayed
- Wasted payment processing attempts

### 2. **No Real-Time Updates**
**Problem**: No mechanism to refresh availability when other users purchase tickets.

**Impact**:
- Users see outdated availability
- Multiple users can select the same "last ticket"
- No WebSocket or polling to update availability

### 3. **Backend Validation Timing**
**Problem**: Backend only validates availability **AFTER** payment succeeds.

**Current Flow**:
1. Frontend validates (stale data) ✅
2. Payment initialized ✅
3. Payment succeeds ✅
4. **Backend validates availability** ⚠️ (too late!)
5. If insufficient → Exception raised ❌

**Issue**: Payment has already been processed, but tickets may not be available.

**Better Flow**:
1. Frontend validates (optimistic) ✅
2. Payment initialized ✅
3. **Backend validates availability BEFORE payment** ✅ (reserve tickets)
4. Payment succeeds ✅
5. Tickets confirmed ✅

### 4. **Inconsistent Logic**
**Problem**: Different validation logic in different places:

- `calculateRemainingQuantity()`: Uses `remainingQuantity` OR `availableQuantity - soldQuantity`
- `hasUnavailableTickets`: Duplicates logic with slightly different checks
- UI rendering: Third implementation of sold-out check

**Impact**: Hard to maintain, potential for bugs if logic diverges

### 5. **Magic Number for Unlimited**
**Problem**: Uses `999999` as magic number for unlimited tickets.

```typescript
if (availableQty === null || availableQty === undefined || availableQty === 0) {
  return 999999; // Treat as unlimited
}
```

**Issue**:
- Not clear what "unlimited" means
- Could cause issues if someone actually has 999,999+ tickets
- Better to use `Infinity` or a constant

### 6. **No Server-Side Pre-Payment Validation**
**Problem**: No API endpoint to validate availability before payment initialization.

**Missing**:
- `/api/tickets/validate-availability` endpoint
- Reservation system (hold tickets temporarily)
- Atomic availability check

---

## ✅ Recommendations

### **Option 1: Optimistic UI + Backend Pre-Payment Validation** (Recommended)

**Approach**: Keep current UI validation, but add backend validation **before** payment initialization.

#### Frontend Changes:
1. **Add availability validation API call** before payment initialization
2. **Refresh availability** on payment initialization
3. **Show user-friendly errors** if availability changed

#### Backend Changes:
1. **Add pre-payment validation endpoint**: `/api/payments/validate-availability`
2. **Reserve tickets** temporarily (5-10 minutes) when payment initialized
3. **Release reservation** if payment fails or times out
4. **Validate reservation** when payment succeeds

#### Implementation:

**Backend Endpoint** (New):
```java
@PostMapping("/api/payments/validate-availability")
public ResponseEntity<?> validateTicketAvailability(@RequestBody CartValidationRequest request) {
    // Validate each ticket type has sufficient availability
    for (CartItem item : request.items) {
        EventTicketType ticketType = ticketTypeRepository.findById(item.ticketTypeId)
            .orElseThrow(() -> new NotFoundException("Ticket type not found"));

        int available = calculateAvailableQuantity(ticketType);
        if (available < item.quantity) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Insufficient tickets available",
                    Map.of("ticketTypeId", item.ticketTypeId,
                           "requested", item.quantity,
                           "available", available)));
        }
    }

    // Reserve tickets temporarily (optional but recommended)
    String reservationId = reserveTickets(request.items, 10); // 10 minutes

    return ResponseEntity.ok(new ValidationResponse(true, reservationId));
}
```

**Frontend Integration**:
```typescript
const initializePaymentSession = async () => {
  // Step 1: Validate availability with backend
  const validationRes = await fetch('/api/proxy/payments/validate-availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart }),
  });

  if (!validationRes.ok) {
    const error = await validationRes.json();
    setInitializationError(error.message || 'Tickets are no longer available');
    return;
  }

  // Step 2: Proceed with payment initialization
  const session = await initializePaymentApi(request);
  // ...
};
```

**Benefits**:
- ✅ Prevents overselling
- ✅ Better user experience (fails early)
- ✅ No major UI changes needed
- ✅ Backend is source of truth

**Drawbacks**:
- ⚠️ Requires backend changes
- ⚠️ Additional API call (minimal impact)

---

### **Option 2: Real-Time Availability Updates** (Advanced)

**Approach**: Use WebSockets or polling to update availability in real-time.

#### Implementation:
1. **WebSocket connection** to backend
2. **Broadcast availability changes** when tickets are purchased
3. **Update UI** when availability changes
4. **Disable selection** if tickets become unavailable

**Benefits**:
- ✅ Real-time updates
- ✅ Best user experience
- ✅ Prevents race conditions

**Drawbacks**:
- ⚠️ Complex implementation
- ⚠️ Requires WebSocket infrastructure
- ⚠️ Higher server load

---

### **Option 3: Polling-Based Refresh** (Simpler Alternative)

**Approach**: Periodically refresh availability data.

#### Implementation:
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    // Refresh ticket types
    const updated = await fetchTicketTypes(eventId);
    setTicketTypes(updated);
  }, 30000); // Every 30 seconds

  return () => clearInterval(interval);
}, [eventId]);
```

**Benefits**:
- ✅ Simple to implement
- ✅ No backend changes needed
- ✅ Reduces stale data

**Drawbacks**:
- ⚠️ Still has race condition window (up to 30 seconds)
- ⚠️ Additional API calls
- ⚠️ Not real-time

---

## 🎯 Recommended Solution: Hybrid Approach

### **Phase 1: Immediate Improvements** (No Backend Changes)

1. **Consolidate validation logic**:
   ```typescript
   // Single source of truth for availability
   const useTicketAvailability = (ticket: TicketType) => {
     return useMemo(() => {
       if (ticket.remainingQuantity != null) {
         return ticket.remainingQuantity;
       }
       const available = ticket.availableQuantity ?? 0;
       const sold = ticket.soldQuantity ?? 0;
       return available > 0 ? Math.max(0, available - sold) : Infinity;
     }, [ticket]);
   };
   ```

2. **Add polling refresh** (every 30 seconds):
   ```typescript
   useEffect(() => {
     const interval = setInterval(async () => {
       const updated = await fetchTicketTypes(eventId);
       setTicketTypes(updated);
     }, 30000);
     return () => clearInterval(interval);
   }, [eventId]);
   ```

3. **Refresh on payment initialization**:
   ```typescript
   const initializePaymentSession = async () => {
     // Refresh availability right before payment
     const freshData = await getCheckoutData(eventId);
     setTicketTypes(freshData.ticketTypes);

     // Validate again with fresh data
     const hasUnavailable = validateAvailability(freshData.ticketTypes);
     if (hasUnavailable) {
       setInitializationError('Tickets are no longer available. Please refresh and try again.');
       return;
     }

     // Proceed with payment...
   };
   ```

4. **Replace magic number**:
   ```typescript
   const UNLIMITED_TICKETS = Infinity; // or Number.MAX_SAFE_INTEGER
   ```

### **Phase 2: Backend Pre-Payment Validation** (Recommended)

1. **Add validation endpoint**: `/api/payments/validate-availability`
2. **Call before payment initialization**
3. **Reserve tickets** (optional but recommended)
4. **Release reservation** on timeout or failure

### **Phase 3: Real-Time Updates** (Future Enhancement)

1. **WebSocket support** for live availability
2. **Broadcast updates** when tickets purchased
3. **Update UI** in real-time

---

## 🔧 Backend Changes Needed

### **1. Add Pre-Payment Validation Endpoint**

**File**: `PaymentController.java` or `TicketValidationController.java`

```java
@PostMapping("/api/payments/validate-availability")
public ResponseEntity<?> validateTicketAvailability(
    @RequestBody CartValidationRequest request,
    @RequestHeader("X-Tenant-Id") String tenantId
) {
    List<ValidationError> errors = new ArrayList<>();

    for (CartItem item : request.getItems()) {
        EventTicketType ticketType = ticketTypeRepository
            .findByIdAndTenantId(item.getTicketTypeId(), tenantId)
            .orElse(null);

        if (ticketType == null) {
            errors.add(new ValidationError(
                item.getTicketTypeId(),
                "Ticket type not found"
            ));
            continue;
        }

        int available = calculateAvailableQuantity(ticketType);
        if (available < item.getQuantity()) {
            errors.add(new ValidationError(
                item.getTicketTypeId(),
                String.format("Insufficient tickets. Requested: %d, Available: %d",
                    item.getQuantity(), available)
            ));
        }
    }

    if (!errors.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(new ValidationResponse(false, errors));
    }

    return ResponseEntity.ok(new ValidationResponse(true, null));
}

private int calculateAvailableQuantity(EventTicketType ticketType) {
    if (ticketType.getRemainingQuantity() != null) {
        return Math.max(0, ticketType.getRemainingQuantity());
    }

    Integer available = ticketType.getAvailableQuantity();
    Integer sold = ticketType.getSoldQuantity();

    if (available == null || available == 0) {
        return Integer.MAX_VALUE; // Unlimited
    }

    return Math.max(0, available - (sold != null ? sold : 0));
}
```

### **2. Optional: Ticket Reservation System**

**File**: `TicketReservationService.java`

```java
@Service
public class TicketReservationService {

    // Reserve tickets for 10 minutes
    public String reserveTickets(List<CartItem> items, int minutes) {
        String reservationId = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(minutes);

        for (CartItem item : items) {
            reservationRepository.save(new TicketReservation(
                reservationId,
                item.getTicketTypeId(),
                item.getQuantity(),
                expiresAt
            ));
        }

        // Schedule cleanup job to release expired reservations
        scheduleCleanup(reservationId, expiresAt);

        return reservationId;
    }

    public void releaseReservation(String reservationId) {
        reservationRepository.deleteByReservationId(reservationId);
    }

    public boolean isReserved(int ticketTypeId, int quantity) {
        int reserved = reservationRepository
            .sumReservedQuantity(ticketTypeId);
        int available = calculateAvailableQuantity(ticketTypeId);
        return (available - reserved) >= quantity;
    }
}
```

---

## 📊 Comparison Table

| Approach | Race Condition Risk | User Experience | Implementation Complexity | Backend Changes |
|----------|---------------------|-----------------|--------------------------|-----------------|
| **Current (Client-only)** | ⚠️ High | ⚠️ Poor | ✅ Simple | ❌ None |
| **Polling Refresh** | ⚠️ Medium | ✅ Good | ✅ Simple | ❌ None |
| **Pre-Payment Validation** | ✅ Low | ✅ Good | ⚠️ Medium | ✅ Required |
| **Reservation System** | ✅ Very Low | ✅ Excellent | ⚠️ Complex | ✅ Required |
| **Real-Time (WebSocket)** | ✅ Very Low | ✅ Excellent | ⚠️ Complex | ✅ Required |

---

## 🎯 Final Recommendation

### **Immediate Actions** (No Backend Changes):
1. ✅ Consolidate validation logic into single helper
2. ✅ Add polling refresh (30 seconds)
3. ✅ Refresh availability before payment initialization
4. ✅ Replace magic number with constant

### **Short-Term** (Backend Changes):
1. ✅ Add `/api/payments/validate-availability` endpoint
2. ✅ Call endpoint before payment initialization
3. ✅ Show user-friendly errors if validation fails

### **Long-Term** (Future Enhancement):
1. ⏳ Implement ticket reservation system
2. ⏳ Add WebSocket support for real-time updates
3. ⏳ Add optimistic UI updates

---

## 📝 Code Changes Summary

### Frontend Changes Needed:
1. **Consolidate validation logic** (refactor)
2. **Add polling refresh** (new useEffect)
3. **Add pre-payment validation** (new API call)
4. **Replace magic number** (constant)

### Backend Changes Needed:
1. **Add validation endpoint** (new controller method)
2. **Optional: Reservation system** (new service + table)

### Database Changes Needed:
1. **Optional: `ticket_reservation` table** (if implementing reservations)
   ```sql
   CREATE TABLE ticket_reservation (
     id BIGSERIAL PRIMARY KEY,
     reservation_id VARCHAR(255) NOT NULL,
     ticket_type_id BIGINT NOT NULL,
     quantity INTEGER NOT NULL,
     expires_at TIMESTAMP NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

---

## ✅ Conclusion

**Current approach is functional but has race condition risks.**

**Best path forward:**
1. **Immediate**: Add polling refresh + consolidate logic (no backend changes)
2. **Short-term**: Add backend pre-payment validation (recommended)
3. **Long-term**: Consider reservation system or WebSocket updates

The **pre-payment validation** approach provides the best balance of:
- ✅ Preventing overselling
- ✅ Good user experience
- ✅ Reasonable implementation complexity
- ✅ No major infrastructure changes





