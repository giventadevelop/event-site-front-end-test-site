# Frontend Cart Metadata Issue - Payment Intent Missing Cart Data

## 🚨 Problem Statement

**Issue:** When using `UniversalPaymentCheckout` component, the Payment Intent created by the backend payment API (`/api/payments/initialize`) does NOT include cart metadata, causing transaction items to not be created.

**Symptoms:**
- Only ONE `event_ticket_transaction` record is created (quantity = 1)
- NO `event_ticket_transaction_item` records are created
- Backend logs show: `Payment Intent pi_XXX metadata has no 'cart' field`
- Backend logs show: `No cart items found for Payment Intent pi_XXX, transaction items not created`

**Evidence from Backend Logs:**
```
2025-11-26T11:12:41.301-05:00  WARN  TicketGenerationService: Payment Intent pi_3SXlKAK5BrggeAHM1eoAtTiv metadata has no 'cart' field
2025-11-26T11:12:43.338-05:00  WARN  TicketGenerationService: No cart items found for Payment Intent pi_3SXlKAK5BrggeAHM1eoAtTiv, transaction items not created
```

**Payment Intent Metadata (from logs):**
```json
{
  "customerEmail": "giventauser@gmail.com",
  "eventId": "2",
  "paymentUseCase": "TICKET_SALE",
  "tenantId": "tenant_demo_002"
}
```

**Missing:** `cart` field with JSON string of cart items

---

## 🔍 Root Cause Analysis

### Current Flow

1. **Frontend:** `UniversalPaymentCheckout` sends `PaymentInitializeRequest` with `items` array to `/api/proxy/payments/initialize`
2. **Frontend Proxy:** Forwards request to backend `/api/payments/initialize`
3. **Backend:** Creates Payment Intent via Stripe adapter but **does NOT include cart in metadata**
4. **Backend:** `TicketGenerationService` tries to read cart from Payment Intent metadata → **NOT FOUND**
5. **Result:** Transaction created with quantity=1, no transaction items

### What Frontend Sends

**Request to `/api/proxy/payments/initialize`:**
```typescript
{
  paymentUseCase: 'TICKET_SALE',
  amount: 1.90, // dollars
  currency: 'USD',
  items: [
    { itemType: 'TICKET', itemId: 4151, description: 'Balcony', quantity: 1, unitPrice: 0.70 },
    { itemType: 'TICKET', itemId: 4152, description: 'FirstClass', quantity: 2, unitPrice: 0.60 }
  ],
  customerEmail: 'giventauser@gmail.com',
  customerName: '...',
  customerPhone: '...',
  eventId: 2,
  discountCode: '...'
}
```

### What Backend Should Do

The backend payment API should:
1. Extract `items` array from `PaymentInitializeRequest`
2. Convert `items` to cart metadata format: `[{ ticketTypeId: number, quantity: number }]`
3. Include cart as JSON string in Payment Intent metadata: `metadata.cart = JSON.stringify(cartMetadata)`

### Expected Payment Intent Metadata

```json
{
  "eventId": "2",
  "cart": "[{\"ticketTypeId\":4151,\"quantity\":1},{\"ticketTypeId\":4152,\"quantity\":2}]",
  "customerEmail": "giventauser@gmail.com",
  "customerName": "...",
  "customerPhone": "...",
  "paymentUseCase": "TICKET_SALE",
  "tenantId": "tenant_demo_002",
  "discountCodeId": "..."
}
```

---

## ✅ Solution

### Backend Fix Required

**File:** `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java` (or wherever Payment Intent is created)

**Changes Required:**

1. **Extract items from PaymentInitializeRequest**
2. **Convert items to cart metadata format**
3. **Include cart in Payment Intent metadata**

**Example Implementation:**

```java
// In StripePaymentAdapter.createPaymentIntent() or similar method

// Extract items from request
List<PaymentItem> items = request.getItems();
if (items != null && !items.isEmpty()) {
    // Convert items to cart metadata format
    List<Map<String, Object>> cartMetadata = new ArrayList<>();
    for (PaymentItem item : items) {
        if ("TICKET".equals(item.getItemType())) {
            Map<String, Object> cartItem = new HashMap<>();
            cartItem.put("ticketTypeId", item.getItemId());
            cartItem.put("quantity", item.getQuantity());
            cartMetadata.add(cartItem);
        }
    }

    // Add cart to metadata
    if (!cartMetadata.isEmpty()) {
        try {
            String cartJson = objectMapper.writeValueAsString(cartMetadata);
            metadata.put("cart", cartJson);
            log.info("Added cart metadata to Payment Intent: {} items", cartMetadata.size());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize cart metadata", e);
        }
    }
}
```

### Alternative: Frontend Workaround (NOT RECOMMENDED)

If backend fix is not immediately available, we could:
1. Use direct `/api/stripe/payment-intent` endpoint instead of backend payment API
2. This endpoint already includes cart metadata correctly

**However, this breaks the domain-agnostic payment architecture and is NOT recommended.**

---

## 📋 Testing Checklist

After backend fix:

- [ ] Payment Intent metadata includes `cart` field
- [ ] Cart JSON format matches expected: `[{ ticketTypeId: number, quantity: number }]`
- [ ] Backend `TicketGenerationService` can parse cart metadata
- [ ] Transaction items are created correctly
- [ ] Transaction quantity equals sum of all cart item quantities
- [ ] Multiple ticket types work correctly
- [ ] Single ticket type works correctly

---

## 🔗 Related Files

**Frontend:**
- `src/components/UniversalPaymentCheckout.tsx` - Sends payment request
- `src/lib/payments/paymentApi.ts` - Payment API client
- `src/pages/api/proxy/payments/initialize.ts` - Proxy handler

**Backend (in `malayalees-us-site-boot` workspace):**
- `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java` - Creates Payment Intent
- `src/main/java/com/nextjstemplate/service/payment/TicketGenerationService.java` - Reads cart from metadata

**Documentation:**
- `documentation/domain_agnostic_payment/Backend_Fixes/BACKEND_TRANSACTION_ITEMS_FIX.md` - Backend fix documentation

---

## 📝 Notes

- The frontend `/api/stripe/payment-intent` endpoint correctly includes cart metadata
- The issue only affects the backend payment API flow (`UniversalPaymentCheckout`)
- Backend fix is required to maintain domain-agnostic payment architecture
- Frontend is sending correct data; backend needs to include it in Payment Intent metadata

---

## 🔍 Customer Name/Phone Issue

### Problem

Even after backend fix, `first_name`, `last_name`, and `phone` fields are NULL in the database.

### Root Cause

The frontend form fields (`firstName`, `lastName`, `phone`) are **optional** (not required). If users don't fill them in:
- `customerName` will be `undefined` (if both firstName and lastName are empty)
- `customerPhone` will be `undefined` (if phone is empty)
- These `undefined` values are not sent to the backend

### Frontend Code

**CheckoutClient.tsx:**
```typescript
// Form fields are optional (no 'required' attribute)
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [phone, setPhone] = useState('');

// customerName construction
customerName: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || undefined,
customerPhone: phone || undefined,
```

**UniversalPaymentCheckout.tsx:**
```typescript
const request: PaymentInitializeRequest = {
  customerEmail: email,
  customerName,  // undefined if not filled
  customerPhone, // undefined if not filled
  // ...
};
```

### Solution Options

**Option 1: Make fields required (RECOMMENDED)**
- Add `required` attribute to firstName, lastName, and phone inputs
- Add validation to prevent checkout if fields are empty
- Ensures data is always captured

**Option 2: Keep optional but improve UX**
- Add placeholder text indicating fields are recommended
- Add visual indicators (asterisks) for recommended fields
- Keep optional for user convenience

**Option 3: Auto-populate from user profile**
- If user is logged in, pre-fill firstName, lastName, phone from user profile
- Still allow editing
- Reduces friction while ensuring data capture

### Debugging

Added console logging in `UniversalPaymentCheckout.tsx` to log what's being sent:
```typescript
console.log('[UniversalPaymentCheckout] Payment initialization request:', {
  customerEmail: request.customerEmail,
  customerName: request.customerName || 'NOT_PROVIDED',
  customerPhone: request.customerPhone || 'NOT_PROVIDED',
  // ...
});
```

Check browser console to verify if `customerName` and `customerPhone` are being sent.

### Backend Verification

Backend should log Payment Intent metadata to verify:
- `customerName` is in metadata
- `customerPhone` is in metadata
- Both are extracted correctly by `TicketGenerationService`

If backend logs show these fields are present in Payment Intent metadata but still NULL in database, the issue is in the extraction logic, not the frontend.

