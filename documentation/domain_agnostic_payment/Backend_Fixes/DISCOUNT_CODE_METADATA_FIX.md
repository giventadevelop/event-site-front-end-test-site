# Discount Code Metadata Capture Fix

## 🚨 Problem Statement

**Issue:** Discount codes applied during checkout are not being captured in the `event_ticket_transaction` table. The `discount_code_id` and `discount_amount` fields remain NULL even when a discount code is applied.

**Symptoms:**
- Frontend sends `discountCode` in `PaymentInitializeRequest`
- Payment Intent metadata does NOT include `discountCodeId`
- `TicketGenerationService` cannot extract discount information
- Database shows `discount_code_id = NULL` and `discount_amount = NULL` for transactions with applied discounts

**Evidence from Backend Logs:**

Payment Intent metadata (from recent transaction):
```json
{
  "cart": "[{\"quantity\":1,\"ticketTypeId\":4151},{\"quantity\":3,\"ticketTypeId\":4152}]",
  "customerEmail": "giventauser@gmail.com",
  "customerName": "Gain Joseph",
  "customerPhone": "3123430073",
  "eventId": "2",
  "paymentUseCase": "TICKET_SALE",
  "tenantId": "tenant_demo_002"
}
```

**Missing:** `discountCodeId` field in metadata

**Database Schema (from `Latest_Schema_Post__Blob_Claude_11.sql`):**
```sql
CREATE TABLE public.event_ticket_transaction (
    ...
    discount_code_id bigint,
    discount_amount numeric(21,2) DEFAULT 0,
    ...
    CONSTRAINT fk_ticket_transaction__discount_code_id
        FOREIGN KEY (discount_code_id) REFERENCES public.discount_code(id) ON DELETE SET NULL
);
```

---

## 🔍 Root Cause Analysis

### Current Flow

1. **Frontend:** `CheckoutClient` applies discount and passes `discountCodeId` to `UniversalPaymentCheckout`
2. **Frontend:** `UniversalPaymentCheckout` sends `discountCode: String(discountCodeId)` in `PaymentInitializeRequest` to `/api/proxy/payments/initialize`
3. **Backend:** `PaymentResource.initialize()` receives `PaymentInitializeRequest` with `discountCode` field
4. **Backend:** `StripePaymentAdapter.createPaymentIntent()` creates Payment Intent but **does NOT add `discountCodeId` to metadata**
5. **Backend:** `TicketGenerationService.handlePaymentSuccess()` tries to extract discount from Payment Intent metadata → **NOT FOUND**
6. **Result:** Transaction created with `discount_code_id = NULL` and `discount_amount = NULL`

### What Frontend Sends

**Request to `/api/proxy/payments/initialize`:**
```typescript
{
  paymentUseCase: 'TICKET_SALE',
  amount: 2.50, // dollars (already discounted)
  currency: 'USD',
  items: [
    { itemType: 'TICKET', itemId: 4151, description: 'Balcony', quantity: 1, unitPrice: 0.70 },
    { itemType: 'TICKET', itemId: 4152, description: 'FirstClass', quantity: 3, unitPrice: 0.60 }
  ],
  customerEmail: 'giventauser@gmail.com',
  customerName: 'Gain Joseph',
  customerPhone: '3123430073',
  eventId: 2,
  discountCode: '123' // ← Discount code ID as string
}
```

### Expected Payment Intent Metadata

```json
{
  "eventId": "2",
  "cart": "[{\"ticketTypeId\":4151,\"quantity\":1},{\"ticketTypeId\":4152,\"quantity\":3}]",
  "customerEmail": "giventauser@gmail.com",
  "customerName": "Gain Joseph",
  "customerPhone": "3123430073",
  "paymentUseCase": "TICKET_SALE",
  "tenantId": "tenant_demo_002",
  "discountCodeId": "123"  // ← MUST BE ADDED
}
```

---

## ✅ Solution Approach

### Strategy

**Two-Part Fix Required:**

1. **Part 1: Add `discountCodeId` to Payment Intent Metadata** (in `StripePaymentAdapter`)
   - Extract `discountCode` from `PaymentInitializeRequest` (or `PaymentSessionRequest`)
   - Add `discountCodeId` to Payment Intent metadata when creating Payment Intent
   - Similar to how `customerName` and `customerPhone` are added

2. **Part 2: Extract and Apply Discount in `TicketGenerationService`**
   - Extract `discountCodeId` from Payment Intent metadata
   - Look up discount code details from database
   - Calculate `discount_amount` based on discount type (PERCENTAGE or FIXED_AMOUNT)
   - Set `discount_code_id` and `discount_amount` on `event_ticket_transaction`

---

## 📋 Implementation Steps

### Step 1: Update `StripePaymentAdapter` to Add Discount Code to Metadata

**File:** `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`

**Location:** Method that creates Payment Intent (likely `createPaymentIntent()` or similar)

**Changes Required:**

1. **Extract `discountCode` from request DTO**
   - Check if `PaymentSessionRequest` (or equivalent DTO) has `discountCode` field
   - If not present, add `discountCode` field to DTO

2. **Add `discountCodeId` to Payment Intent metadata**
   - Similar to how `customerName` and `customerPhone` are added
   - Use conditional: `if (request.getDiscountCode() != null) { metadata.put("discountCodeId", request.getDiscountCode()); }`

**Example Implementation:**

```java
// In StripePaymentAdapter.createPaymentIntent() or similar method

// Build metadata map
Map<String, String> metadata = new HashMap<>();
metadata.put("tenantId", request.getTenantId());
metadata.put("eventId", String.valueOf(request.getEventId()));
metadata.put("paymentUseCase", request.getPaymentUseCase().name());
metadata.put("customerEmail", request.getCustomerEmail());

// Add customer name if provided
if (request.getCustomerName() != null && !request.getCustomerName().isEmpty()) {
    metadata.put("customerName", request.getCustomerName());
}

// Add customer phone if provided
if (request.getCustomerPhone() != null && !request.getCustomerPhone().isEmpty()) {
    metadata.put("customerPhone", request.getCustomerPhone());
}

// CRITICAL: Add discount code ID if provided
if (request.getDiscountCode() != null && !request.getDiscountCode().isEmpty()) {
    metadata.put("discountCodeId", request.getDiscountCode());
}

// Add cart metadata (if items are available)
if (request.getItems() != null && !request.getItems().isEmpty()) {
    List<Map<String, Object>> cartMetadata = request.getItems().stream()
        .filter(item -> "TICKET".equals(item.getItemType()))
        .map(item -> Map.of(
            "ticketTypeId", item.getItemId(),
            "quantity", item.getQuantity()
        ))
        .collect(Collectors.toList());
    metadata.put("cart", new ObjectMapper().writeValueAsString(cartMetadata));
}

// Create Payment Intent with metadata
PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
    .setAmount(amountCents)
    .setCurrency(request.getCurrency().toLowerCase())
    .setReceiptEmail(request.getCustomerEmail())
    .putAllMetadata(metadata)
    // ... other params
```

### Step 2: Update `TicketGenerationService` to Extract and Apply Discount

**File:** `src/main/java/com/nextjstemplate/service/payment/TicketGenerationService.java`

**Location:** `handlePaymentSuccess()` method, after extracting customer information

**Changes Required:**

1. **Extract `discountCodeId` from Payment Intent metadata**
   - Similar to `extractFirstNameFromPayment()` and `extractPhoneFromPayment()` methods
   - Check Payment Intent metadata for `discountCodeId` field

2. **Look up discount code details**
   - Query `DiscountCode` repository using `discountCodeId`
   - Get discount type (`PERCENTAGE` or `FIXED_AMOUNT`) and discount value

3. **Calculate discount amount**
   - If `PERCENTAGE`: `discountAmount = totalAmount * (discountValue / 100)`
   - If `FIXED_AMOUNT`: `discountAmount = Math.min(totalAmount, discountValue)`

4. **Set discount fields on transaction**
   - Set `discountCodeId` on `EventTicketTransaction`
   - Set `discountAmount` on `EventTicketTransaction`
   - Update `finalAmount` if needed (should already be calculated by frontend)

**Example Implementation:**

```java
// In TicketGenerationService.handlePaymentSuccess()

// Extract discount code ID from Payment Intent metadata
Long discountCodeId = extractDiscountCodeIdFromPayment(paymentIntent, paymentTransaction);

// If discount code is present, look up details and calculate discount
BigDecimal discountAmount = BigDecimal.ZERO;
if (discountCodeId != null) {
    try {
        Optional<DiscountCode> discountCodeOpt = discountCodeRepository.findById(discountCodeId);
        if (discountCodeOpt.isPresent()) {
            DiscountCode discountCode = discountCodeOpt.get();

            // Calculate discount amount based on type
            BigDecimal totalAmount = ticketTransaction.getTotalAmount();
            if (totalAmount != null && totalAmount.compareTo(BigDecimal.ZERO) > 0) {
                if ("PERCENTAGE".equals(discountCode.getDiscountType())) {
                    // Percentage discount
                    BigDecimal discountPercent = discountCode.getDiscountValue()
                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                    discountAmount = totalAmount.multiply(discountPercent)
                        .setScale(2, RoundingMode.HALF_UP);
                } else if ("FIXED_AMOUNT".equals(discountCode.getDiscountType())) {
                    // Fixed amount discount
                    discountAmount = discountCode.getDiscountValue()
                        .min(totalAmount)
                        .setScale(2, RoundingMode.HALF_UP);
                }
            }

            // Set discount fields on transaction
            ticketTransaction.setDiscountCodeId(discountCodeId);
            ticketTransaction.setDiscountAmount(discountAmount);

            log.info("Applied discount code {} to transaction {}: amount={}, type={}",
                discountCodeId, ticketTransaction.getId(), discountAmount, discountCode.getDiscountType());
        } else {
            log.warn("Discount code {} not found in database for transaction {}",
                discountCodeId, ticketTransaction.getId());
        }
    } catch (Exception e) {
        log.error("Failed to apply discount code {} to transaction {}: {}",
            discountCodeId, ticketTransaction.getId(), e.getMessage(), e);
        // Continue without discount rather than failing transaction
    }
}

// Helper method to extract discount code ID
private Long extractDiscountCodeIdFromPayment(PaymentIntent paymentIntent, UserPaymentTransaction paymentTransaction) {
    // First check Payment Intent metadata (primary source)
    if (paymentIntent != null && paymentIntent.getMetadata() != null) {
        String discountCodeIdStr = paymentIntent.getMetadata().get("discountCodeId");
        if (discountCodeIdStr != null && !discountCodeIdStr.isEmpty()) {
            try {
                return Long.parseLong(discountCodeIdStr);
            } catch (NumberFormatException e) {
                log.warn("Invalid discountCodeId format in Payment Intent metadata: {}", discountCodeIdStr);
            }
        }
    }

    // Fallback: Check payment transaction metadata (for backward compatibility)
    if (paymentTransaction != null && paymentTransaction.getMetadata() != null) {
        Object discountCodeIdObj = paymentTransaction.getMetadata().get("discountCodeId");
        if (discountCodeIdObj != null) {
            try {
                if (discountCodeIdObj instanceof String) {
                    return Long.parseLong((String) discountCodeIdObj);
                } else if (discountCodeIdObj instanceof Number) {
                    return ((Number) discountCodeIdObj).longValue();
                }
            } catch (Exception e) {
                log.warn("Failed to parse discountCodeId from payment transaction metadata: {}", e.getMessage());
            }
        }
    }

    return null;
}
```

### Step 3: Update DTO to Include Discount Code Field

**File:** `src/main/java/com/nextjstemplate/service/payment/dto/PaymentSessionRequest.java` (or equivalent)

**Changes Required:**

1. **Add `discountCode` field** if not present
   - Type: `String` (to match frontend `discountCode?: string`)
   - Getter and setter methods

**Example:**

```java
public class PaymentSessionRequest {
    // ... existing fields ...

    /**
     * Discount code ID (as string from frontend)
     */
    private String discountCode;

    public String getDiscountCode() {
        return discountCode;
    }

    public void setDiscountCode(String discountCode) {
        this.discountCode = discountCode;
    }
}
```

---

## 🧪 Testing Checklist

After implementation:

- [ ] Frontend sends `discountCode` in `PaymentInitializeRequest`
- [ ] Backend receives `discountCode` in `PaymentSessionRequest`
- [ ] Payment Intent metadata includes `discountCodeId` field
- [ ] `TicketGenerationService` extracts `discountCodeId` from Payment Intent metadata
- [ ] Discount code is looked up from database successfully
- [ ] `discount_amount` is calculated correctly (PERCENTAGE and FIXED_AMOUNT)
- [ ] `event_ticket_transaction.discount_code_id` is set correctly
- [ ] `event_ticket_transaction.discount_amount` is set correctly
- [ ] Transaction saves successfully with discount fields populated
- [ ] Works for both PERCENTAGE and FIXED_AMOUNT discount types
- [ ] Handles missing/invalid discount codes gracefully (logs warning, continues without discount)

---

## 📝 Notes

- **Discount amount calculation**: The frontend already calculates the discounted amount and sends it in the `amount` field. The backend should still calculate `discount_amount` for record-keeping purposes.
- **Backward compatibility**: If `discountCodeId` is not in Payment Intent metadata, the transaction should still be created successfully (without discount).
- **Error handling**: If discount code lookup fails, log a warning but don't fail the transaction creation.
- **Database constraints**: Ensure `discount_code_id` foreign key constraint allows NULL values (it should, based on schema).

---

## 🔗 Related Files

**Frontend:**
- `src/app/events/[id]/checkout/CheckoutClient.tsx` - Applies discount and passes `discountCodeId`
- `src/components/UniversalPaymentCheckout.tsx` - Sends `discountCode` in `PaymentInitializeRequest`
- `src/types/index.ts` - Defines `PaymentInitializeRequest` interface with `discountCode` field

**Backend (in `malayalees-us-site-boot` workspace):**
- `StripePaymentAdapter.java` - Should add `discountCodeId` to Payment Intent metadata
- `TicketGenerationService.java` - Should extract `discountCodeId` and apply discount
- `PaymentSessionRequest.java` (or equivalent DTO) - Should include `discountCode` field
- `DiscountCode` entity/repository - For looking up discount code details

**Database Schema:**
- `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql` - Defines `discount_code_id` and `discount_amount` fields

**Documentation:**
- `FRONTEND_CART_METADATA_ISSUE.md` - Related cart metadata issue
- `CUSTOMER_NAME_PHONE_FIX.md` - Similar metadata extraction pattern
- `BACKEND_TRANSACTION_ITEMS_FIX.md` - Related transaction items fix

---

## 📋 Backend Implementation Prompt

**For Backend Team:**

Please implement discount code capture in the ticket transaction flow:

1. **Add `discountCodeId` to Payment Intent metadata** in `StripePaymentAdapter`:
   - Extract `discountCode` from `PaymentSessionRequest` (add field if missing)
   - Add `discountCodeId` to Payment Intent metadata when creating Payment Intent
   - Follow the same pattern as `customerName` and `customerPhone` metadata

2. **Extract and apply discount in `TicketGenerationService`**:
   - Extract `discountCodeId` from Payment Intent metadata (similar to `extractFirstNameFromPayment()`)
   - Look up `DiscountCode` entity using `discountCodeId`
   - Calculate `discount_amount` based on discount type:
     - `PERCENTAGE`: `discountAmount = totalAmount * (discountValue / 100)`
     - `FIXED_AMOUNT`: `discountAmount = min(totalAmount, discountValue)`
   - Set `discount_code_id` and `discount_amount` on `EventTicketTransaction` before saving

3. **Error handling**:
   - If discount code not found, log warning but continue transaction creation
   - If discount calculation fails, log error but don't fail transaction
   - Ensure NULL values are allowed for `discount_code_id` (for transactions without discounts)

**Reference Implementation:**
- See `CUSTOMER_NAME_PHONE_FIX.md` for similar metadata extraction pattern
- See `BACKEND_TRANSACTION_ITEMS_FIX.md` for Payment Intent metadata reading pattern

**Database Schema Reference:**
- `event_ticket_transaction.discount_code_id` (bigint, nullable, FK to `discount_code.id`)
- `event_ticket_transaction.discount_amount` (numeric(21,2), default 0)

**API Schema Reference:**
- See `documentation/Swagger_API_Docs/api-docs.json` for `PaymentInitializeRequest` schema
- Frontend sends `discountCode` as string (discount code ID)





