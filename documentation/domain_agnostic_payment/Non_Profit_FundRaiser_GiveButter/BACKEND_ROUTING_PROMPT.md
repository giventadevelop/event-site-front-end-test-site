# Backend Payment Provider Routing Fix - GiveButter for Fundraiser Events

## Date: 2025-11-17
## Event ID: 4101 (Fundraiser Event)
## Issue: Event 4101 is routing to Stripe instead of GiveButter

---

## Problem Summary

When a user purchases tickets for event 4101 (marked as fundraiser with GiveButter configured), the payment initialization is routing to **Stripe** instead of **GiveButter**, even though the event metadata indicates it should use GiveButter.

**Frontend URL**: `http://localhost:3000/events/4101/checkout`
**Success URL**: `http://localhost:3000/event/success?transactionId=4268&eventId=4101`

---

## Frontend Request Payload

The frontend sends the following request to `POST /api/payments/initialize`:

```json
{
  "paymentUseCase": "TICKET_SALE",
  "amount": 10.00,
  "currency": "USD",
  "items": [
    {
      "itemType": "TICKET",
      "itemId": 4151,
      "description": "Ticket Type Name",
      "quantity": 1,
      "unitPrice": 10.00
    }
  ],
  "customerEmail": "giventauser@gmail.com",
  "customerName": "Customer Name",
  "customerPhone": "1234567890",
  "returnUrl": "http://localhost:3000/event/success",
  "cancelUrl": "http://localhost:3000",
  "eventId": 4101,
  "discountCode": null
}
```

**Key Fields for Routing Decision:**
- ✅ `eventId: 4101` - **PRESENT** (required to look up event metadata)
- ✅ `paymentUseCase: "TICKET_SALE"` - **PRESENT** (indicates ticket purchase)
- ✅ `tenantId` - **AUTOMATICALLY INJECTED** by proxy handler (from `NEXT_PUBLIC_TENANT_ID`)

---

## Event Metadata Structure (Event 4101)

The event should have the following metadata structure in the `event_details` table:

```json
{
  "isFundraiserEvent": true,
  "isCharityEvent": false,
  "donationConfig": {
    "useZeroFeeProvider": true,
    "zeroFeeProvider": "GIVEBUTTER",
    "givebutterCampaignId": "campaign_id_here"
  }
}
```

**Database Query to Verify:**
```sql
SELECT id, title, metadata
FROM event_details
WHERE id = 4101;
```

**Expected Result:**
- `metadata` column should contain the JSON string above (stored as TEXT, not JSONB)

---

## Backend Routing Logic Required

### File: `PaymentOrchestrationService.java` (or equivalent)

### Method: `determineProvider(PaymentInitializeRequest request)`

**CRITICAL FIXES NEEDED:**

1. **Check `paymentUseCase` field (NOT `paymentType`)**
   - Frontend sends `paymentUseCase: "TICKET_SALE"`
   - Backend may be checking `paymentType` instead

2. **Look up Event by `eventId`**
   - Request includes `eventId: 4101`
   - Must fetch event from `eventRepository.findById(request.getEventId())`

3. **Parse Metadata JSON String**
   - `metadata` column is **TEXT** (not JSONB)
   - Must parse using Jackson ObjectMapper
   - Handle null/empty metadata gracefully

4. **Check Fundraiser Flags**
   - Check `isFundraiserEvent: true` OR `isCharityEvent: true`
   - Both flags should be checked (either one can trigger GiveButter routing)

5. **Verify GiveButter Configuration**
   - Check `donationConfig.useZeroFeeProvider: true`
   - Check `donationConfig.zeroFeeProvider: "GIVEBUTTER"`
   - Verify GiveButter provider exists for tenant

---

## Complete Implementation Code

```java
private ProviderType determineProvider(PaymentInitializeRequest request) {
    // CRITICAL: Check paymentUseCase (not paymentType) for TICKET_SALE
    if (PaymentUseCase.TICKET_SALE.equals(request.getPaymentUseCase())) {
        if (request.getEventId() != null) {
            // Fetch event from database
            EventDetails event = eventRepository.findById(request.getEventId())
                .orElse(null);

            if (event != null && event.getMetadata() != null) {
                // Parse metadata JSON string (stored as TEXT, not JSONB)
                Map<String, Object> metadata = parseMetadata(event.getMetadata());

                if (metadata != null) {
                    // Check both fundraiser flags (either one can trigger routing)
                    Boolean isFundraiserEvent = (Boolean) metadata.get("isFundraiserEvent");
                    Boolean isCharityEvent = (Boolean) metadata.get("isCharityEvent");

                    // Get donationConfig object
                    Map<String, Object> donationConfig =
                        (Map<String, Object>) metadata.get("donationConfig");

                    // Route to GiveButter if event is fundraiser/charity AND zero-fee provider is configured
                    if ((Boolean.TRUE.equals(isFundraiserEvent) ||
                         Boolean.TRUE.equals(isCharityEvent)) &&
                        donationConfig != null) {

                        Boolean useZeroFeeProvider =
                            (Boolean) donationConfig.get("useZeroFeeProvider");

                        if (Boolean.TRUE.equals(useZeroFeeProvider)) {
                            String zeroFeeProvider =
                                (String) donationConfig.get("zeroFeeProvider");

                            if ("GIVEBUTTER".equals(zeroFeeProvider)) {
                                // Verify GiveButter provider exists for tenant
                                String tenantId = request.getTenantId();
                                if (tenantId == null) {
                                    // Fallback: Get tenant from context or default
                                    tenantId = getTenantIdFromContext();
                                }

                                boolean hasGivebutter = configRepository
                                    .existsByTenantIdAndProviderType(
                                        tenantId,
                                        ProviderType.GIVEBUTTER
                                    );

                                if (hasGivebutter) {
                                    log.info("Routing ticket purchase for event {} to GiveButter (fundraiser event)",
                                        request.getEventId());
                                    return ProviderType.GIVEBUTTER;
                                } else {
                                    log.warn("Event {} is configured for GiveButter but provider not configured for tenant {}",
                                        request.getEventId(), tenantId);
                                }
                            }
                        }
                    }
                }
            } else {
                log.debug("Event {} not found or has no metadata, using default provider",
                    request.getEventId());
            }
        }
    }

    // Default to Stripe (primary provider for regular tickets)
    log.debug("Using default provider STRIPE for payment request");
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
        log.warn("Failed to parse event metadata JSON for event: {}", e.getMessage());
        return null;
    }
}

/**
 * Get tenant ID from request or context.
 * Frontend proxy handler injects tenantId automatically.
 */
private String getTenantIdFromContext() {
    // Try to get from request context first
    // Fallback to default tenant if not available
    return tenantService.getDefaultTenant().getId();
}
```

---

## Verification Checklist

### 1. Verify Event Metadata
```sql
SELECT id, title, metadata
FROM event_details
WHERE id = 4101;
```
- [ ] `metadata` contains `"isFundraiserEvent": true` OR `"isCharityEvent": true`
- [ ] `metadata` contains `"donationConfig.useZeroFeeProvider": true`
- [ ] `metadata` contains `"donationConfig.zeroFeeProvider": "GIVEBUTTER"`

### 2. Verify GiveButter Provider Configuration
```sql
SELECT id, tenant_id, provider_name, provider_type, is_active
FROM payment_provider_config
WHERE tenant_id = 'tenant_demo_002'
  AND provider_type = 'GIVEBUTTER'
  AND is_active = true;
```
- [ ] GiveButter provider exists and is active for tenant

### 3. Verify Payment Initialization Request
- [ ] Request includes `eventId: 4101`
- [ ] Request includes `paymentUseCase: "TICKET_SALE"` (NOT `paymentType`)
- [ ] Request includes `tenantId` (injected by proxy handler)

### 4. Test Payment Initialization
```bash
POST /api/payments/initialize
Content-Type: application/json

{
  "paymentUseCase": "TICKET_SALE",
  "eventId": 4101,
  "amount": 10.00,
  "currency": "USD",
  "items": [...],
  "customerEmail": "test@example.com"
}
```

**Expected Response:**
```json
{
  "transactionId": "...",
  "providerType": "GIVEBUTTER",  // ✅ Should be GIVEBUTTER, not STRIPE
  "sessionUrl": "https://givebutter.com/...",
  ...
}
```

---

## Common Issues & Solutions

### Issue 1: Backend Checking Wrong Field Name
**Problem**: Backend checks `paymentType` instead of `paymentUseCase`
**Solution**: Update code to check `request.getPaymentUseCase()` instead of `request.getPaymentType()`

### Issue 2: Metadata Not Parsed Correctly
**Problem**: Metadata is TEXT but code treats it as JSONB
**Solution**: Use Jackson ObjectMapper to parse JSON string: `mapper.readValue(metadataJson, Map.class)`

### Issue 3: Tenant ID Missing
**Problem**: `request.getTenantId()` returns null
**Solution**: Get tenant from context or use default tenant service

### Issue 4: Event Not Found
**Problem**: `eventRepository.findById()` returns null
**Solution**: Add null check and log warning, fallback to Stripe

### Issue 5: GiveButter Provider Not Configured
**Problem**: Provider exists but `is_active = false` or wrong tenant
**Solution**: Verify provider configuration in database

---

## Debugging Steps

1. **Add Logging to `determineProvider()` method:**
```java
log.debug("Determining provider for request: eventId={}, paymentUseCase={}, tenantId={}",
    request.getEventId(), request.getPaymentUseCase(), request.getTenantId());

EventDetails event = eventRepository.findById(request.getEventId()).orElse(null);
log.debug("Event found: {}, metadata: {}", event != null, event != null ? event.getMetadata() : "null");
```

2. **Check Backend Logs:**
   - Look for "Determining provider" log messages
   - Verify event is found and metadata is parsed
   - Check if GiveButter provider exists

3. **Test with Direct API Call:**
```bash
curl -X POST http://localhost:8080/api/payments/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "paymentUseCase": "TICKET_SALE",
    "eventId": 4101,
    "amount": 10.00,
    "currency": "USD",
    "items": [{"itemType": "TICKET", "itemId": 4151, "quantity": 1, "unitPrice": 10.00}],
    "customerEmail": "test@example.com"
  }'
```

---

## Summary

**Frontend is sending all required information:**
- ✅ `eventId: 4101` - Present
- ✅ `paymentUseCase: "TICKET_SALE"` - Present
- ✅ `tenantId` - Automatically injected by proxy handler

**Backend needs to:**
1. Check `paymentUseCase` (not `paymentType`)
2. Look up event by `eventId`
3. Parse metadata JSON string (TEXT column)
4. Check `isFundraiserEvent` OR `isCharityEvent` flags
5. Verify `donationConfig.useZeroFeeProvider: true` and `zeroFeeProvider: "GIVEBUTTER"`
6. Verify GiveButter provider exists for tenant
7. Return `ProviderType.GIVEBUTTER` if all conditions met

**If all conditions are met, backend should route to GiveButter, not Stripe.**


