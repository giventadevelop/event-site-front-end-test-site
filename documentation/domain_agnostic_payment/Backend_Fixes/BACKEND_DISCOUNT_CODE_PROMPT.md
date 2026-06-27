# Backend Discount Code Implementation Prompt

## Context

**Frontend Project:** `E:\project_workspace\mosc-temp`
**Backend Project:** `E:\project_workspace\malayalees-us-site-boot`

The frontend checkout flow (`/events/[id]/checkout`) applies discount codes and sends `discountCode` (as string ID) in `PaymentInitializeRequest`. However, discount information is not being captured in the `event_ticket_transaction` table (`discount_code_id` and `discount_amount` remain NULL).

## Problem

1. Frontend sends `discountCode: "123"` in `PaymentInitializeRequest` to `/api/payments/initialize`
2. Backend `StripePaymentAdapter` does NOT add `discountCodeId` to Payment Intent metadata
3. Backend `TicketGenerationService` cannot extract discount information from Payment Intent
4. Database shows `discount_code_id = NULL` and `discount_amount = NULL` for transactions with discounts

## Required Changes

### 1. Add `discountCode` Field to Payment DTO

**File:** `src/main/java/com/nextjstemplate/service/payment/dto/PaymentSessionRequest.java` (or equivalent)

```java
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
```

### 2. Add `discountCodeId` to Payment Intent Metadata

**File:** `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`

**Location:** Method that creates Payment Intent (e.g., `createPaymentIntent()`)

**Add to metadata map:**
```java
// Add discount code ID if provided (similar to customerName/customerPhone)
if (request.getDiscountCode() != null && !request.getDiscountCode().isEmpty()) {
    metadata.put("discountCodeId", request.getDiscountCode());
}
```

**Reference:** Follow the same pattern as `customerName` and `customerPhone` metadata addition.

### 3. Extract and Apply Discount in TicketGenerationService

**File:** `src/main/java/com/nextjstemplate/service/payment/TicketGenerationService.java`

**Location:** `handlePaymentSuccess()` method, after extracting customer information

**Add discount extraction and application:**

```java
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
                    // Percentage discount: discountAmount = totalAmount * (discountValue / 100)
                    BigDecimal discountPercent = discountCode.getDiscountValue()
                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                    discountAmount = totalAmount.multiply(discountPercent)
                        .setScale(2, RoundingMode.HALF_UP);
                } else if ("FIXED_AMOUNT".equals(discountCode.getDiscountType())) {
                    // Fixed amount discount: discountAmount = min(totalAmount, discountValue)
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
```

**Add helper method:**
```java
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

## Database Schema Reference

From `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`:

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

## API Schema Reference

**Frontend sends:**
```typescript
{
  paymentUseCase: 'TICKET_SALE',
  amount: 2.50, // dollars (already discounted)
  currency: 'USD',
  items: [...],
  customerEmail: 'user@example.com',
  customerName: 'John Doe',
  customerPhone: '+1234567890',
  eventId: 2,
  discountCode: '123' // ← Discount code ID as string
}
```

**Expected Payment Intent metadata:**
```json
{
  "eventId": "2",
  "cart": "[{\"ticketTypeId\":4151,\"quantity\":1},{\"ticketTypeId\":4152,\"quantity\":3}]",
  "customerEmail": "user@example.com",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "paymentUseCase": "TICKET_SALE",
  "tenantId": "tenant_demo_002",
  "discountCodeId": "123"  // ← MUST BE ADDED
}
```

## Testing Checklist

- [ ] Frontend sends `discountCode` in `PaymentInitializeRequest`
- [ ] Backend receives `discountCode` in `PaymentSessionRequest`
- [ ] Payment Intent metadata includes `discountCodeId` field
- [ ] `TicketGenerationService` extracts `discountCodeId` from Payment Intent metadata
- [ ] Discount code is looked up from database successfully
- [ ] `discount_amount` is calculated correctly for PERCENTAGE discounts
- [ ] `discount_amount` is calculated correctly for FIXED_AMOUNT discounts
- [ ] `event_ticket_transaction.discount_code_id` is set correctly
- [ ] `event_ticket_transaction.discount_amount` is set correctly
- [ ] Transaction saves successfully with discount fields populated
- [ ] Handles missing/invalid discount codes gracefully (logs warning, continues without discount)

## Related Patterns

- **Similar implementation:** See `CUSTOMER_NAME_PHONE_FIX.md` for metadata extraction pattern
- **Payment Intent metadata:** See `BACKEND_TRANSACTION_ITEMS_FIX.md` for cart metadata pattern
- **Cursor rules:** Follow `nextjs_api_routes.mdc` for REST API call patterns

## Error Handling

- If discount code not found in database: Log warning, continue transaction creation without discount
- If discount calculation fails: Log error, continue transaction creation without discount
- Ensure NULL values are allowed for `discount_code_id` (for transactions without discounts)

## Notes

- Frontend already calculates discounted amount and sends it in `amount` field
- Backend should still calculate `discount_amount` for record-keeping purposes
- Discount amount calculation should use `totalAmount` (sum of all ticket prices before discount)
- Follow existing patterns for Payment Intent metadata extraction (similar to `customerName`/`customerPhone`)





