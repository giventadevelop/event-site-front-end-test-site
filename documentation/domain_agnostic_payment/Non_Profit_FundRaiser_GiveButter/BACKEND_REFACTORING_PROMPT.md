# Backend Refactoring Prompt: Givebutter Integration & Schema Cleanup

**Project:** Givebutter Integration for Zero-Fee Fundraising
**Backend Repository:** `E:\project_workspace\malayalees-us-site-boot` (Spring Boot)
**Date:** January 2025
**Priority:** High - Required for Givebutter integration

---

## Executive Summary

This document provides a comprehensive prompt for backend refactoring to:
1. **Remove deprecated columns** from `user_payment_transaction` table (`settlement_batch_id`, `platform_invoice_id`, `manual_payment_reference`)
2. **Implement Givebutter payment provider** integration following existing Stripe adapter pattern
3. **Add event metadata support** for fundraiser configuration
4. **Update payment provider enums** to include GIVEBUTTER

---

## Part 1: Database Schema Refactoring

### 1.1 Remove Deprecated Columns from `user_payment_transaction`

**Issue:** The `user_payment_transaction` table contains three columns that were removed during refactoring but still exist in the database schema:
- `settlement_batch_id` (bigint)
- `platform_invoice_id` (bigint)
- `manual_payment_reference` (character varying)

**Action Required:**

```sql
-- Migration: Remove deprecated columns from user_payment_transaction
-- WARNING: Backup data before running if these columns contain important data

BEGIN;

-- Step 1: Drop foreign key constraints if they exist
ALTER TABLE public.user_payment_transaction
    DROP CONSTRAINT IF EXISTS fk_user_payment_transaction_settlement_batch;

ALTER TABLE public.user_payment_transaction
    DROP CONSTRAINT IF EXISTS fk_user_payment_transaction_platform_invoice;

-- Step 2: Remove columns
ALTER TABLE public.user_payment_transaction
    DROP COLUMN IF EXISTS settlement_batch_id CASCADE;

ALTER TABLE public.user_payment_transaction
    DROP COLUMN IF EXISTS platform_invoice_id CASCADE;

ALTER TABLE public.user_payment_transaction
    DROP COLUMN IF EXISTS manual_payment_reference CASCADE;

-- Step 3: Verify removal
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'user_payment_transaction'
  AND column_name IN ('settlement_batch_id', 'platform_invoice_id', 'manual_payment_reference');
-- Should return 0 rows

COMMIT;
```

**Backend Code Changes Required:**

1. **Entity Class (`UserPaymentTransaction.java`):**
   - Remove fields: `settlementBatchId`, `platformInvoiceId`, `manualPaymentReference`
   - Remove getters/setters for these fields
   - Update JPA annotations if present

2. **DTO Classes:**
   - Remove fields from `UserPaymentTransactionDTO`
   - Remove fields from any related DTOs (e.g., `PaymentTransactionDTO` if it extends this)

3. **Repository Methods:**
   - Remove any queries that reference these columns
   - Update any `@Query` annotations that use these fields

4. **Service Classes:**
   - Remove any business logic that sets/reads these fields
   - Update any methods that reference these fields

5. **API Controllers:**
   - Remove these fields from request/response DTOs
   - Update OpenAPI/Swagger documentation

**Example Entity Refactoring:**

```java
// BEFORE
@Entity
@Table(name = "user_payment_transaction")
public class UserPaymentTransaction {
    // ... existing fields ...

    @Column(name = "settlement_batch_id")
    private Long settlementBatchId;

    @Column(name = "platform_invoice_id")
    private Long platformInvoiceId;

    @Column(name = "manual_payment_reference")
    private String manualPaymentReference;

    // getters/setters...
}

// AFTER
@Entity
@Table(name = "user_payment_transaction")
public class UserPaymentTransaction {
    // ... existing fields ...
    // REMOVED: settlementBatchId, platformInvoiceId, manualPaymentReference
    // REMOVED: All getters/setters for these fields
}
```

---

### 1.2 Add `metadata` Column to `event_details` Table

**Issue:** The `event_details` table needs a `metadata` TEXT column to store fundraiser configuration for Givebutter integration.

**Action Required:**

```sql
-- Migration: Add metadata column to event_details
ALTER TABLE public.event_details
    ADD COLUMN IF NOT EXISTS metadata TEXT DEFAULT NULL;

COMMENT ON COLUMN public.event_details.metadata IS
    'Flexible TEXT field for event configuration stored as JSON string.
     Stores fundraiser settings, donation config, etc.
     Parse JSON in application code using Jackson ObjectMapper (Spring Boot).';

-- Example metadata structure (stored as JSON string):
-- {
--   "isFundraiserEvent": true,
--   "isCharityEvent": true,
--   "donationConfig": {
--     "useZeroFeeProvider": true,
--     "zeroFeeProvider": "GIVEBUTTER",
--     "givebutterCampaignId": "campaign_123"
--   }
-- }
```

**Backend Code Changes Required:**

1. **Entity Class (`EventDetails.java`):**
   ```java
   @Entity
   @Table(name = "event_details")
   public class EventDetails {
       // ... existing fields ...

       @Column(name = "metadata", columnDefinition = "TEXT")
       private String metadata;  // JSON string, parse with ObjectMapper

       // Helper method to parse metadata
       public Map<String, Object> getMetadataAsMap() {
           if (metadata == null || metadata.isEmpty()) {
               return new HashMap<>();
           }
           try {
               ObjectMapper mapper = new ObjectMapper();
               return mapper.readValue(metadata, new TypeReference<Map<String, Object>>() {});
           } catch (Exception e) {
               log.error("Failed to parse metadata JSON", e);
               return new HashMap<>();
           }
       }

       // Helper method to set metadata from Map
       public void setMetadataFromMap(Map<String, Object> metadataMap) {
           try {
               ObjectMapper mapper = new ObjectMapper();
               this.metadata = mapper.writeValueAsString(metadataMap);
           } catch (Exception e) {
               log.error("Failed to serialize metadata to JSON", e);
               this.metadata = null;
           }
       }
   }
   ```

2. **DTO Class (`EventDetailsDTO.java`):**
   ```java
   public class EventDetailsDTO {
       // ... existing fields ...

       private String metadata;  // JSON string

       // Optional: Add typed getter for parsed metadata
       public Map<String, Object> getMetadataMap() {
           // Parse JSON string to Map
       }
   }
   ```

3. **Service Classes:**
   - Update methods that create/update events to handle metadata
   - Add helper methods to check if event is a fundraiser event:
     ```java
     public boolean isFundraiserEvent(EventDetails event) {
         Map<String, Object> meta = event.getMetadataAsMap();
         return Boolean.TRUE.equals(meta.get("isFundraiserEvent"));
     }

     public String getGivebutterCampaignId(EventDetails event) {
         Map<String, Object> meta = event.getMetadataAsMap();
         Map<String, Object> donationConfig = (Map<String, Object>) meta.get("donationConfig");
         return donationConfig != null ? (String) donationConfig.get("givebutterCampaignId") : null;
     }
     ```

---

### 1.3 Add GIVEBUTTER to Payment Provider Enum

**Issue:** The `payment_provider_type` enum needs to include `GIVEBUTTER` to support Givebutter as a payment provider.

**Action Required:**

```sql
-- Migration: Add GIVEBUTTER to payment_provider_type enum
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_provider_type') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'GIVEBUTTER'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_provider_type')
        ) THEN
            ALTER TYPE payment_provider_type ADD VALUE 'GIVEBUTTER';
        END IF;
    ELSE
        CREATE TYPE payment_provider_type AS ENUM (
            'STRIPE', 'PAYPAL', 'ACP', 'AP2', 'SQUARE', 'CRYPTO', 'GIVEBUTTER'
        );
    END IF;
END $$;
```

**Backend Code Changes Required:**

1. **Enum Class (`PaymentProviderType.java`):**
   ```java
   public enum PaymentProviderType {
       STRIPE,
       PAYPAL,
       ACP,
       AP2,
       SQUARE,
       CRYPTO,
       GIVEBUTTER  // ADD THIS
   }
   ```

2. **Update all switch statements** that handle payment provider types to include GIVEBUTTER case

---

### 1.4 Verify Payment Type Enum

**Issue:** Ensure `payment_type` enum includes required values for Givebutter routing.

**Action Required:**

```sql
-- Verify payment_type enum has required values
-- Required: TICKET_SALE, DONATION, OFFERING
-- Optional: DONATION_ZERO_FEE

SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_type')
ORDER BY enumsortorder;
```

**Backend Code Changes Required:**

1. **Enum Class (`PaymentType.java`):**
   ```java
   public enum PaymentType {
       TICKET_SALE,
       DONATION,
       OFFERING,
       SUBSCRIPTION,
       MERCHANDISE,
       MEMBERSHIP,
       REFUND,
       DONATION_ZERO_FEE  // Optional: for explicit zero-fee donations
   }
   ```

---

## Part 2: Givebutter Payment Adapter Implementation

### 2.1 Create GivebutterPaymentAdapter

**Pattern:** Follow the existing `StripePaymentAdapter` implementation pattern.

**File Structure:**
```
src/main/java/com/example/eventmanagement/payment/
├── adapter/
│   ├── PaymentAdapter.java (interface - already exists)
│   ├── stripe/
│   │   └── StripePaymentAdapter.java (reference implementation)
│   └── givebutter/
│       ├── GivebutterPaymentAdapter.java (NEW)
│       ├── GivebutterApiClient.java (NEW)
│       ├── GivebutterDonationRequest.java (NEW)
│       ├── GivebutterDonationResponse.java (NEW)
│       └── GivebutterWebhookHandler.java (NEW)
```

**Key Requirements:**

1. **Multi-Tenant Configuration:**
   - Retrieve Givebutter config from `payment_provider_config` table dynamically
   - Decrypt API key from `config_data` field using existing `EncryptionService`
   - Extract Givebutter-specific config from `metadata` JSONB field

2. **Payment Initialization:**
   ```java
   @Service
   @RequiredArgsConstructor
   @Slf4j
   public class GivebutterPaymentAdapter implements PaymentAdapter {

       private final PaymentProviderConfigRepository configRepository;
       private final EncryptionService encryptionService;
       private final RestTemplate restTemplate;

       @Override
       public PaymentSession initializePayment(PaymentInitializeRequest request) {
           // 1. Resolve tenant's Givebutter configuration
           PaymentProviderConfig config = resolveProviderConfig(
               request.getTenantId(),
               request.getPaymentType()
           );

           // 2. Decrypt API key
           String apiKey = decryptApiKey(config);

           // 3. Extract campaign ID from metadata
           String campaignId = extractCampaignId(config, request);

           // 4. Build Givebutter donation request
           GivebutterDonationRequest gbRequest = buildDonationRequest(request, campaignId);

           // 5. Call Givebutter API
           GivebutterDonationResponse response = callGivebutterApi(apiKey, gbRequest);

           // 6. Create payment transaction record
           PaymentTransaction transaction = createPaymentTransaction(request, response);

           // 7. Return payment session
           return PaymentSession.builder()
               .providerType(PaymentProviderType.GIVEBUTTER)
               .providerTransactionId(response.getDonationId())
               .sessionUrl(response.getCheckoutUrl())
               .build();
       }

       private PaymentProviderConfig resolveProviderConfig(String tenantId, PaymentType paymentType) {
           // Determine use case based on payment type
           String useCase = paymentType == PaymentType.OFFERING ? "OFFERING" : "DONATION_ZERO_FEE";

           return configRepository.findByTenantIdAndProviderTypeAndIsActive(
               tenantId,
               PaymentProviderType.GIVEBUTTER,
               true
           ).stream()
           .filter(config -> useCase.equals(config.getMetadata().get("useCase")))
           .findFirst()
           .orElseThrow(() -> new PaymentProviderNotFoundException(
               "Givebutter config not found for tenant: " + tenantId + ", use case: " + useCase
           ));
       }

       private String decryptApiKey(PaymentProviderConfig config) {
           String encryptedConfig = config.getConfigData();
           String decryptedJson = encryptionService.decrypt(encryptedConfig);

           ObjectMapper mapper = new ObjectMapper();
           Map<String, String> configMap = mapper.readValue(decryptedJson, Map.class);
           return configMap.get("api_key");
       }

       private String extractCampaignId(PaymentProviderConfig config, PaymentInitializeRequest request) {
           // First try event-specific campaign ID from event metadata
           if (request.getEventId() != null) {
               EventDetails event = eventRepository.findById(request.getEventId())
                   .orElseThrow();
               String eventCampaignId = getGivebutterCampaignId(event);
               if (eventCampaignId != null) {
                   return eventCampaignId;
               }
           }

           // Fallback to provider config campaign ID
           Map<String, Object> metadata = config.getMetadata();
           return (String) metadata.get("campaignId");
       }
   }
   ```

3. **Payment Confirmation:**
   ```java
   @Override
   public PaymentResult confirmPayment(String providerTransactionId, String tenantId) {
       // Retrieve payment transaction by provider transaction ID
       // Call Givebutter API to verify payment status
       // Update payment transaction status
       // Return payment result
   }
   ```

4. **Refund Support:**
   ```java
   @Override
   public RefundResult refundPayment(String providerTransactionId, BigDecimal amount, String tenantId) {
       // Call Givebutter API to process refund
       // Update payment transaction with refund information
       // Return refund result
   }
   ```

---

### 2.2 Givebutter Webhook Handler

**Requirements:**

1. **Webhook Endpoint:**
   ```java
   @RestController
   @RequestMapping("/api/webhooks/givebutter")
   @RequiredArgsConstructor
   public class GivebutterWebhookController {

       private final GivebutterWebhookHandler webhookHandler;

       @PostMapping
       public ResponseEntity<String> handleWebhook(
           @RequestHeader("X-Givebutter-Signature") String signature,
           @RequestBody String payload
       ) {
           webhookHandler.handleWebhook(signature, payload);
           return ResponseEntity.ok().build();
       }
   }
   ```

2. **Webhook Handler:**
   ```java
   @Service
   @RequiredArgsConstructor
   @Slf4j
   public class GivebutterWebhookHandler {

       private final PaymentTransactionRepository transactionRepository;
       private final EncryptionService encryptionService;

       public void handleWebhook(String signature, String payload) {
           // 1. Verify webhook signature
           // 2. Parse webhook payload
           // 3. Extract donation ID and status
           // 4. Find payment transaction by provider transaction ID
           // 5. Update transaction status
           // 6. Log webhook event
       }

       private void verifySignature(String signature, String payload, String webhookSecret) {
           // Implement HMAC signature verification
       }
   }
   ```

---

### 2.3 Payment Orchestration Service Updates

**Update `PaymentOrchestrationService` to route Givebutter payments:**

```java
@Service
@RequiredArgsConstructor
public class PaymentOrchestrationService {

    private final StripePaymentAdapter stripeAdapter;
    private final GivebutterPaymentAdapter givebutterAdapter;  // ADD THIS
    private final PaymentProviderConfigRepository configRepository;

    public PaymentSession initializePayment(PaymentInitializeRequest request) {
        // Determine payment provider based on event configuration
        PaymentProviderType providerType = determinePaymentProvider(request);

        PaymentAdapter adapter = getAdapter(providerType);
        return adapter.initializePayment(request);
    }

    private PaymentProviderType determinePaymentProvider(PaymentInitializeRequest request) {
        // Check if event is configured for Givebutter
        if (request.getEventId() != null) {
            EventDetails event = eventRepository.findById(request.getEventId())
                .orElseThrow();

            if (isFundraiserEvent(event)) {
                String zeroFeeProvider = getZeroFeeProvider(event);
                if ("GIVEBUTTER".equals(zeroFeeProvider)) {
                    return PaymentProviderType.GIVEBUTTER;
                }
            }
        }

        // Default to Stripe for ticket sales
        return PaymentProviderType.STRIPE;
    }

    private PaymentAdapter getAdapter(PaymentProviderType providerType) {
        switch (providerType) {
            case STRIPE:
                return stripeAdapter;
            case GIVEBUTTER:
                return givebutterAdapter;  // ADD THIS
            default:
                throw new UnsupportedPaymentProviderException("Provider not supported: " + providerType);
        }
    }
}
```

---

## Part 3: Testing Requirements

### 3.1 Unit Tests

1. **GivebutterPaymentAdapter Tests:**
   - Test payment initialization
   - Test payment confirmation
   - Test refund processing
   - Test error handling
   - Test multi-tenant configuration resolution

2. **GivebutterWebhookHandler Tests:**
   - Test webhook signature verification
   - Test webhook payload parsing
   - Test transaction status updates

3. **EventDetails Metadata Tests:**
   - Test metadata JSON parsing
   - Test fundraiser event detection
   - Test campaign ID extraction

### 3.2 Integration Tests

1. **Payment Flow Tests:**
   - Test end-to-end payment initialization with Givebutter
   - Test webhook processing
   - Test refund flow

2. **Database Migration Tests:**
   - Test column removal from `user_payment_transaction`
   - Test metadata column addition to `event_details`
   - Test enum value addition

---

## Part 4: Migration Checklist

### Database Migrations

- [ ] Create migration script to remove deprecated columns
- [ ] Create migration script to add metadata column
- [ ] Create migration script to add GIVEBUTTER enum value
- [ ] Test migrations on development database
- [ ] Backup production database before running migrations
- [ ] Run migrations on production during maintenance window

### Backend Code Changes

- [ ] Remove deprecated fields from `UserPaymentTransaction` entity
- [ ] Remove deprecated fields from related DTOs
- [ ] Update repository queries
- [ ] Update service methods
- [ ] Update API controllers
- [ ] Add metadata field to `EventDetails` entity
- [ ] Add metadata parsing helper methods
- [ ] Create `GivebutterPaymentAdapter` class
- [ ] Create `GivebutterApiClient` class
- [ ] Create `GivebutterWebhookHandler` class
- [ ] Update `PaymentOrchestrationService` to route Givebutter payments
- [ ] Add GIVEBUTTER to `PaymentProviderType` enum
- [ ] Update all switch statements for payment providers

### Testing

- [ ] Write unit tests for Givebutter adapter
- [ ] Write integration tests for payment flow
- [ ] Test webhook handling
- [ ] Test multi-tenant configuration
- [ ] Test error scenarios

### Documentation

- [ ] Update API documentation (Swagger/OpenAPI)
- [ ] Update developer documentation
- [ ] Document Givebutter configuration process
- [ ] Document webhook setup process

---

## Part 5: Configuration Example

### Givebutter Provider Configuration

```sql
-- Configure Givebutter for Mass Offerings
INSERT INTO payment_provider_config (
    tenant_id,
    provider_type,
    provider_name,
    is_active,
    is_primary,
    priority,
    config_data,        -- Encrypted: {"api_key": "gb_live_xxx"}
    webhook_secret,     -- Encrypted: Givebutter webhook secret
    supports_wallets,
    supports_subscriptions,
    supports_refunds,
    metadata
) VALUES (
    'tenant_demo_001',
    'GIVEBUTTER',
    'Givebutter Mass Offerings',
    true,
    false,
    1,
    encrypt('{"api_key": "gb_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}'),
    encrypt('whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
    true,
    true,
    true,
    '{
        "supportsZeroFee": true,
        "useCase": "OFFERING",
        "apiBaseUrl": "https://api.givebutter.com/v1",
        "campaignId": "campaign_123abc",
        "presetAmounts": [5, 10, 25, 50],
        "allowCustomAmount": true,
        "allowPrayerIntention": true,
        "allowAnonymous": true,
        "recurringEnabled": true
    }'::jsonb
);
```

### Event Configuration Example

```sql
-- Configure event as fundraiser with Givebutter
UPDATE event_details
SET metadata = '{
    "isFundraiserEvent": true,
    "isCharityEvent": true,
    "donationConfig": {
        "useZeroFeeProvider": true,
        "zeroFeeProvider": "GIVEBUTTER",
        "givebutterCampaignId": "campaign_123abc"
    }
}'
WHERE id = 123;
```

---

## Part 6: Critical Notes

### ⚠️ Important Considerations

1. **Backward Compatibility:**
   - Removing columns from `user_payment_transaction` may break existing code
   - Ensure all references to removed columns are updated before running migration
   - Consider a phased rollout: update code first, then run migration

2. **Data Migration:**
   - If `settlement_batch_id`, `platform_invoice_id`, or `manual_payment_reference` contain important data, export it before removal
   - Consider creating a backup table with this data if needed for historical reference

3. **Multi-Tenant Configuration:**
   - **DO NOT** hardcode Givebutter credentials in `application.properties`
   - All credentials must be stored per tenant in `payment_provider_config` table
   - Use existing `EncryptionService` for credential encryption

4. **Error Handling:**
   - Implement proper error handling for Givebutter API failures
   - Log all Givebutter API calls for debugging
   - Handle webhook signature verification failures gracefully

5. **Testing:**
   - Test with Givebutter sandbox/test API keys first
   - Verify webhook handling with test webhooks
   - Test multi-tenant scenarios with different tenant configurations

---

## Part 7: References

- **Database Schema Changes:** `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/GIVEBUTTER_DATABASE_SCHEMA_CHANGES.md`
- **Backend PRD:** `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/GIVEBUTTER_BACKEND_PRD.html`
- **Frontend PRD:** `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/GIVEBUTTER_FRONTEND_PRD.html`
- **Stripe Adapter Reference:** `src/main/java/com/example/eventmanagement/payment/adapter/stripe/StripePaymentAdapter.java`

---

## Summary

This refactoring requires:

1. **Database Changes:**
   - Remove 3 deprecated columns from `user_payment_transaction`
   - Add `metadata` TEXT column to `event_details`
   - Add `GIVEBUTTER` to `payment_provider_type` enum

2. **Backend Code Changes:**
   - Remove deprecated fields from entities/DTOs
   - Add metadata support to `EventDetails`
   - Implement `GivebutterPaymentAdapter`
   - Implement `GivebutterWebhookHandler`
   - Update `PaymentOrchestrationService` routing logic

3. **Testing:**
   - Unit tests for new components
   - Integration tests for payment flow
   - Webhook handling tests

**Estimated Effort:** 2-3 weeks for full implementation and testing



