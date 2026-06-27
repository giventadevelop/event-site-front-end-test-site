# Backend Fixes Required for Fundraiser Event Payment Flow

## Date: 2025-11-17
## Backend Location: `E:\project_workspace\malayalees-us-site-boot`

## Critical Issues to Fix

### 1. Payment Provider Routing for Fundraiser Events

**File**: `PaymentOrchestrationService.java` (or equivalent service class)

**Issue**: Event 4101 is marked as fundraiser with Givebutter configured, but payment initialization still routes to Stripe.

**Required Fix**:
Update `determineProvider()` method to check event metadata before defaulting to Stripe.

**Implementation**:
```java
private ProviderType determineProvider(PaymentInitializeRequest request) {
    // For TICKET_SALE payment type, check if event is configured as fundraiser
    if (PaymentType.TICKET_SALE.equals(request.getPaymentType())) {
        if (request.getEventId() != null) {
            EventDetails event = eventRepository.findById(request.getEventId())
                .orElse(null);

            if (event != null && event.getMetadata() != null) {
                // Parse metadata JSON string (stored as TEXT, not JSONB)
                Map<String, Object> metadata = parseMetadata(event.getMetadata());

                if (metadata != null) {
                    Boolean isFundraiserEvent = (Boolean) metadata.get("isFundraiserEvent");
                    Boolean isCharityEvent = (Boolean) metadata.get("isCharityEvent");

                    Map<String, Object> donationConfig =
                        (Map<String, Object>) metadata.get("donationConfig");

                    if ((Boolean.TRUE.equals(isFundraiserEvent) ||
                         Boolean.TRUE.equals(isCharityEvent)) &&
                        donationConfig != null) {

                        Boolean useZeroFeeProvider =
                            (Boolean) donationConfig.get("useZeroFeeProvider");

                        if (Boolean.TRUE.equals(useZeroFeeProvider)) {
                            String zeroFeeProvider =
                                (String) donationConfig.get("zeroFeeProvider");

                            if ("GIVEBUTTER".equals(zeroFeeProvider)) {
                                boolean hasGivebutter = configRepository
                                    .existsByTenantIdAndProviderType(
                                        request.getTenantId(),
                                        ProviderType.GIVEBUTTER
                                    );

                                if (hasGivebutter) {
                                    // Route ticketed fundraiser event to Givebutter
                                    return ProviderType.GIVEBUTTER;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Default to Stripe (primary provider for regular tickets)
    return ProviderType.STRIPE;
}

/**
 * Parse metadata JSON string from TEXT column.
 * Metadata is stored as TEXT (not JSONB) matching existing codebase pattern.
 */
private Map<String, Object> parseMetadata(String metadataJson) {
    if (metadataJson == null || metadataJson.trim().isEmpty()) {
        return null;
    }
    try {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(metadataJson, Map.class);
    } catch (Exception e) {
        log.warn("Failed to parse event metadata JSON: {}", e.getMessage());
        return null;
    }
}
```

**Reference**: See `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/GIVEBUTTER_BACKEND_PRD.html` lines 232-340

---

### 2. Ticket Transaction Creation for Givebutter Payments

**File**: Givebutter webhook handler (or payment completion handler)

**Issue**: Ticket transactions are not being created after Givebutter payment succeeds.

**Logs Show**:
- Payment transaction exists (status: SUCCEEDED)
- But ticket transaction query returns 0 results
- Query: `stripePaymentIntentId.equals=pi_3SULY2K5BrggeAHM0mJtXf84&eventId.equals=4101`

**Required Fix**:
1. Ensure Givebutter webhook handler creates `event_ticket_transaction` record
2. Store Givebutter payment reference in `stripePaymentIntentId` field (or create equivalent field)
3. Link ticket transaction to payment transaction via `paymentReference` or equivalent

**Implementation Checklist**:
- [ ] Givebutter webhook handler creates ticket transaction
- [ ] Ticket transaction includes `eventId`, `email`, `firstName`, `lastName`
- [ ] Payment reference stored in `stripePaymentIntentId` or equivalent field
- [ ] Ticket transaction linked to payment transaction

**Reference**: See Stripe webhook handler implementation for pattern

---

### 3. QR Code Generation for Givebutter Transactions

**File**: QR code generation endpoint

**Issue**: QR code endpoint may not work for Givebutter transactions if it relies on Stripe-specific fields.

**Required Fix**:
- Ensure QR code endpoint works for all payment providers
- Use `event_ticket_transaction.id` as primary identifier (not Stripe-specific fields)
- Verify QR code generation doesn't depend on Stripe payment intent ID

**Endpoint**: `/api/events/{eventId}/transactions/{transactionId}/qrcode`

**Check**:
- [ ] QR code endpoint accepts ticket transaction ID (not payment intent ID)
- [ ] QR code generation works for Givebutter transactions
- [ ] QR code URL is returned correctly

---

### 4. Email Confirmation for Givebutter Transactions

**File**: Email sending service

**Issue**: Email confirmation may not be sent for Givebutter transactions.

**Required Fix**:
- Ensure email sending works for all payment providers
- Verify email template doesn't depend on Stripe-specific data
- Test email sending for Givebutter transactions

**Endpoint**: `/api/events/{eventId}/transactions/{transactionId}/send-ticket-email`

**Check**:
- [ ] Email endpoint works for Givebutter transactions
- [ ] Email template includes correct event details
- [ ] QR code is included in email (if available)

---

## Testing Checklist

### For Event 4101 (Fundraiser Event):

1. **Payment Initialization**:
   - [ ] Call `POST /api/payments/initialize` with `eventId: 4101`, `paymentUseCase: TICKET_SALE`
   - [ ] Verify response includes `providerType: "GIVEBUTTER"`
   - [ ] Verify response includes `sessionUrl` pointing to Givebutter checkout

2. **Payment Completion**:
   - [ ] Complete payment on Givebutter checkout page
   - [ ] Verify Givebutter webhook is received
   - [ ] Verify `user_payment_transaction` record is created with status `SUCCEEDED`
   - [ ] Verify `event_ticket_transaction` record is created
   - [ ] Verify ticket transaction has correct `eventId`, `email`, and payment reference

3. **Success Page**:
   - [ ] Navigate to success page with `transactionId`
   - [ ] Verify ticket transaction is found by payment reference
   - [ ] Verify QR code is generated and displayed
   - [ ] Verify email confirmation is sent

---

## Database Verification

**Check Event 4101 Metadata**:
```sql
SELECT id, title, metadata
FROM event_details
WHERE id = 4101;
```

**Expected Metadata** (JSON string):
```json
{
  "isFundraiserEvent": true,
  "isCharityEvent": false,
  "donationConfig": {
    "useZeroFeeProvider": true,
    "zeroFeeProvider": "GIVEBUTTER",
    "givebutterCampaignId": "<campaign_id>"
  }
}
```

**Check Payment Provider Config**:
```sql
SELECT id, tenant_id, provider_name, provider_type, is_active
FROM payment_provider_config
WHERE tenant_id = 'tenant_demo_002'
  AND provider_name = 'GIVEBUTTER';
```

**Verify GIVEBUTTER in Enum**:
```sql
-- Check if GIVEBUTTER is in payment_provider_type enum
SELECT unnest(enum_range(NULL::payment_provider_type));
```

---

## References

- Backend PRD: `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/GIVEBUTTER_BACKEND_PRD.html`
- Database Schema: `code_html_template/SQLS/Latest_Schema_Post__Blob_Claude_11.sql`
- Frontend Analysis: `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/FRONTEND_BACKEND_ISSUES_ANALYSIS.md`



