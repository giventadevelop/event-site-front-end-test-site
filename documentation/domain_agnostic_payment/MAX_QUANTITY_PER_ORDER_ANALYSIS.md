# Max Quantity Per Order Validation Analysis

## ✅ Current Implementation

Yes, there **IS** logic that uses `maxQuantityPerOrder` to limit the maximum number of tickets a user can purchase per ticket type.

### Frontend Implementation

**Location**: `src/app/events/[id]/checkout/CheckoutClient.tsx`

**Code Flow**:

1. **In `handleTicketChange()` (line 211-213)**:
   ```typescript
   const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? 10; // Defaults to 10 if not set
   const maxSelectable = Math.min(remaining, maxOrderQuantity); // Takes minimum of remaining tickets OR max per order
   const newQuantity = Math.max(0, Math.min(quantity, maxSelectable)); // Clamps quantity to max selectable
   ```

2. **In UI "+" button (line 824)**:
   ```typescript
   disabled={isSoldOut || (selectedTickets[ticket.id] || 0) >= Math.min(remainingQuantity, maxOrderQuantity)}
   ```
   - Button is disabled when user reaches either:
     - The remaining available tickets, OR
     - The maximum quantity per order limit

### How It Works

**Example Scenario**:
- Ticket type has `maxQuantityPerOrder = 5`
- `remainingQuantity = 10` tickets available
- User can select maximum: `Math.min(10, 5) = 5` tickets
- Even though 10 tickets are available, user is limited to 5 per order

**Another Example**:
- Ticket type has `maxQuantityPerOrder = 10`
- `remainingQuantity = 3` tickets available
- User can select maximum: `Math.min(3, 10) = 3` tickets
- Limited by availability, not max per order

---

## ⚠️ Issues & Gaps

### 1. **No User-Friendly Message for Max Limit**

**Problem**: When user reaches `maxQuantityPerOrder` limit, there's no clear message explaining why they can't add more.

**Current Behavior**:
- "+" button just becomes disabled
- No explanation shown to user
- User might think tickets are sold out when they're actually hitting the per-order limit

**Example**:
- `maxQuantityPerOrder = 5`
- `remainingQuantity = 20`
- User selects 5 tickets → "+" button disabled
- **User sees**: Button disabled, no explanation
- **User thinks**: "Are tickets sold out?" ❌

### 2. **Warning Message Doesn't Account for Max Limit**

**Current Warning (line 830-833)**:
```typescript
{selectedTickets[ticket.id] > 0 && selectedTickets[ticket.id] > remainingQuantity && (
  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
    ⚠️ Only {remainingQuantity} tickets available for this selection
  </div>
)}
```

**Issue**: This only shows when `selected > remainingQuantity`, but doesn't show when user hits `maxQuantityPerOrder` limit.

**Missing**: Message like "Maximum {maxOrderQuantity} tickets per order"

### 3. **Backend Validation Unknown**

**Question**: Does the backend validate `maxQuantityPerOrder` when processing payment?

**Current Backend Validation** (from database trigger):
- Only validates `available_quantity >= requested_quantity`
- **Does NOT validate** `max_quantity_per_order`

**Risk**: If frontend validation is bypassed (e.g., API call), user could purchase more than `maxQuantityPerOrder`

### 4. **Default Value May Not Be Appropriate**

**Current**: `maxQuantityPerOrder ?? 10`

**Issue**:
- Defaults to 10 if field is `null` or `undefined`
- But database schema shows default is 10: `max_quantity_per_order integer DEFAULT 10`
- If backend sends `null`, frontend uses 10, but this might not match backend's actual limit

---

## ✅ Recommendations

### **1. Add User-Friendly Max Limit Message**

**Add to UI** (after line 833):
```typescript
{selectedTickets[ticket.id] > 0 && selectedTickets[ticket.id] >= maxOrderQuantity && remainingQuantity > maxOrderQuantity && (
  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
    ℹ️ Maximum {maxOrderQuantity} tickets per order for this ticket type
  </div>
)}
```

### **2. Show Max Limit in Ticket Description**

**Add to ticket info display** (around line 787):
```typescript
<p className="text-sm text-gray-600 mt-2">{ticket.description}</p>
{maxOrderQuantity < Infinity && (
  <p className="text-xs text-gray-500 mt-1">
    Max {maxOrderQuantity} per order
  </p>
)}
```

### **3. Improve Warning Message Logic**

**Update warning logic** (replace lines 830-834):
```typescript
{selectedTickets[ticket.id] > 0 && (
  <>
    {selectedTickets[ticket.id] > remainingQuantity && (
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
        ⚠️ Only {remainingQuantity} tickets available for this selection
      </div>
    )}
    {selectedTickets[ticket.id] >= maxOrderQuantity && remainingQuantity > maxOrderQuantity && (
      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
        ℹ️ Maximum {maxOrderQuantity} tickets per order for this ticket type
      </div>
    )}
  </>
)}
```

### **4. Backend Validation** (Recommended)

**Add to backend payment validation**:
```java
// In PaymentController or TicketValidationService
for (CartItem item : request.getItems()) {
    EventTicketType ticketType = ticketTypeRepository.findById(item.getTicketTypeId());

    // Validate max quantity per order
    Integer maxPerOrder = ticketType.getMaxQuantityPerOrder();
    if (maxPerOrder != null && item.getQuantity() > maxPerOrder) {
        throw new ValidationException(
            String.format("Maximum %d tickets per order for ticket type '%s'. Requested: %d",
                maxPerOrder, ticketType.getName(), item.getQuantity())
        );
    }

    // Validate availability (existing check)
    // ...
}
```

### **5. Replace Magic Number with Constant**

**Current**:
```typescript
const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? 10;
```

**Better**:
```typescript
const DEFAULT_MAX_QUANTITY_PER_ORDER = 10;
const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? DEFAULT_MAX_QUANTITY_PER_ORDER;
```

---

## 📊 Current Behavior Summary

| Scenario | Max Per Order | Remaining | User Can Select | "+" Button Disabled At | Message Shown? |
|----------|---------------|-----------|-----------------|------------------------|----------------|
| Normal | 10 | 20 | 10 | 10 | ❌ No |
| Limited by availability | 10 | 3 | 3 | 3 | ✅ Yes (availability) |
| Limited by max order | 5 | 20 | 5 | 5 | ❌ No |
| Both limited | 5 | 3 | 3 | 3 | ✅ Yes (availability) |

**Issue**: When limited by max order (not availability), no message is shown.

---

## 🎯 Recommended Implementation

### **Frontend Changes**:

1. **Add max limit message** when user hits `maxQuantityPerOrder`
2. **Show max limit** in ticket description
3. **Improve warning logic** to handle both cases
4. **Use constant** instead of magic number

### **Backend Changes** (Recommended):

1. **Add validation** in payment initialization endpoint
2. **Validate `maxQuantityPerOrder`** before processing payment
3. **Return clear error** if limit exceeded

---

## ✅ Conclusion

**Current Status**: ✅ `maxQuantityPerOrder` **IS** being used and enforced in the frontend.

**Gaps**:
- ⚠️ No user-friendly message when limit is reached
- ⚠️ Backend validation may be missing
- ⚠️ Warning messages don't account for max limit

**Recommendation**: Add UI messages and backend validation to improve user experience and prevent bypassing frontend limits.





