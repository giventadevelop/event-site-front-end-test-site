# Frontend-Backend Triple Validation Implementation Guide

## Overview

This document describes how to implement triple validation (`tenantId`, `paymentMethodDomainId`, `webhookSecret`) for frontend API calls that create ticket transactions and transaction items. The backend will perform all validation and lookups, ensuring data integrity and security.

## Architecture Decision

**Key Principle**: Backend performs all validation - frontend only passes the values it has from environment variables.

**Why This Approach:**
- ✅ Backend has access to encrypted webhook secrets in database
- ✅ Backend can validate the triple combination exists
- ✅ Prevents frontend from needing to decrypt secrets
- ✅ Centralizes security logic in backend
- ✅ Ensures unique constraint is respected

## Frontend Implementation

### 1. Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_TENANT_ID=tenant_demo_002
NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID=pmd_1SWrMSK5BrggeAHMmHxUd9F2
```

**Note**: `webhook_secret_encrypted` is NOT passed from frontend - backend looks it up from database.

### 2. Update DTOs

Add optional fields to `EventTicketTransactionDTO` and `EventTicketTransactionItemDTO`:

```typescript
// src/types/index.ts

export interface EventTicketTransactionDTO {
  // ... existing fields ...

  // Triple validation fields (optional - backend will validate)
  paymentMethodDomainId?: string; // Stripe Payment Method Domain ID (pmd_*)
  // tenantId is already present
  // webhookSecret is NOT included - backend looks it up from database
}

export interface EventTicketTransactionItemDTO {
  // ... existing fields ...

  // Triple validation fields (optional - backend will validate)
  paymentMethodDomainId?: string; // Stripe Payment Method Domain ID (pmd_*)
  // tenantId is already present
  // webhookSecret is NOT included - backend looks it up from database
}
```

### 3. Update Frontend API Calls

**File**: `src/app/event/success/ApiServerActions.ts`

```typescript
import { getTenantId, getPaymentMethodDomainId } from '@/lib/env';

// Update createTransaction function
async function createTransaction(
  transactionData: Omit<EventTicketTransactionDTO, 'id'>
): Promise<EventTicketTransactionDTO> {
  // Get values from environment variables
  const tenantId = getTenantId();
  const paymentMethodDomainId = getPaymentMethodDomainId();

  // Add triple validation fields to payload
  const payload = {
    ...transactionData,
    tenantId, // Already included via withTenantId(), but ensure it's present
    paymentMethodDomainId, // Add Payment Method Domain ID
  };

  const response = await fetchWithJwtRetry(
    `${getAppUrl()}/api/proxy/event-ticket-transactions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to create transaction:', response.status, errorBody);
    throw new Error(`Failed to create transaction: ${errorBody}`);
  }

  return response.json();
}

// Update createTransactionItemsBulk function
async function createTransactionItemsBulk(items: any[]): Promise<any[]> {
  const baseUrl = getAppUrl();
  const tenantId = getTenantId();
  const paymentMethodDomainId = getPaymentMethodDomainId();

  // Add triple validation fields to each item
  const payload = items.map(item => ({
    ...item,
    tenantId, // Ensure tenantId is present
    paymentMethodDomainId, // Add Payment Method Domain ID
  }));

  const response = await fetchWithJwtRetry(
    `${baseUrl}/api/proxy/event-ticket-transaction-items/bulk`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to create transaction items:', response.status, errorBody);
    throw new Error(`Failed to create transaction items: ${errorBody}`);
  }

  return response.json();
}
```

**File**: `src/app/api/webhooks/stripe/ApiServerActions.ts`

```typescript
import { getTenantId, getPaymentMethodDomainId } from '@/lib/env';

export async function createEventTicketTransactionServer(
  transaction: Omit<EventTicketTransactionDTO, 'id'>
): Promise<EventTicketTransactionDTO> {
  const url = `${API_BASE_URL}/api/event-ticket-transactions`;

  // Get values from environment variables
  const tenantId = getTenantId();
  const paymentMethodDomainId = getPaymentMethodDomainId();

  // Add triple validation fields to payload
  const payload = {
    ...transaction,
    tenantId, // Ensure tenantId is present
    paymentMethodDomainId, // Add Payment Method Domain ID
  };

  // ... rest of function
}
```

### 4. Update Proxy Handlers (Optional - for logging)

**File**: `src/pages/api/proxy/event-ticket-transactions/index.ts`

The proxy handler can log the triple validation fields but doesn't need to validate them - backend will do that:

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const payload = req.body;

    // Log triple validation fields (for debugging)
    console.log('[PROXY] Transaction creation with triple validation fields:', {
      tenantId: payload.tenantId,
      paymentMethodDomainId: payload.paymentMethodDomainId,
      hasWebhookSecret: false, // Not passed from frontend
    });

    // Forward to backend - backend will validate
    const response = await fetchWithJwtRetry(`${API_BASE_URL}/api/event-ticket-transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // ... rest of handler
  }
}
```

## Backend Implementation

### 1. Update DTOs (Java/Rust)

**Java Example**:

```java
public class EventTicketTransactionDTO {
    // ... existing fields ...

    // Triple validation fields (optional)
    @JsonProperty("paymentMethodDomainId")
    private String paymentMethodDomainId; // Stripe Payment Method Domain ID (pmd_*)

    // tenantId is already present
    // webhookSecret is NOT in DTO - backend looks it up from database
}
```

**Rust Example**:

```rust
#[derive(Deserialize, Serialize)]
pub struct EventTicketTransactionDTO {
    // ... existing fields ...

    // Triple validation fields (optional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub payment_method_domain_id: Option<String>, // Stripe Payment Method Domain ID (pmd_*)

    // tenant_id is already present
    // webhook_secret is NOT in DTO - backend looks it up from database
}
```

### 2. Backend Validation Logic

**Java Example**:

```java
@Service
public class EventTicketTransactionService {

    @Autowired
    private PaymentProviderConfigRepository paymentProviderConfigRepository;

    public EventTicketTransactionDTO createTransaction(
        EventTicketTransactionDTO dto,
        String authenticatedTenantId // From JWT/security context
    ) {
        // Step 1: Extract tenant ID (prioritize authenticated tenant ID over DTO)
        String tenantId = authenticatedTenantId != null
            ? authenticatedTenantId
            : dto.getTenantId();

        if (tenantId == null) {
            throw new ValidationException("Tenant ID is required");
        }

        // Step 2: Extract Payment Method Domain ID from DTO
        String paymentMethodDomainId = dto.getPaymentMethodDomainId();

        if (paymentMethodDomainId == null) {
            // Log warning but don't fail - some transactions might not have this
            log.warn("Payment Method Domain ID missing from transaction DTO for tenant: {}", tenantId);
        }

        // Step 3: Lookup webhook_secret_encrypted from database
        // Query payment_provider_config for matching (tenantId, paymentMethodDomainId)
        PaymentProviderConfig config = null;

        if (paymentMethodDomainId != null) {
            config = paymentProviderConfigRepository
                .findByTenantIdAndPaymentMethodDomainId(tenantId, paymentMethodDomainId)
                .orElse(null);

            if (config == null) {
                log.error(
                    "Triple validation failed: No payment_provider_config found for tenantId={}, paymentMethodDomainId={}",
                    tenantId, paymentMethodDomainId
                );
                throw new ValidationException(
                    String.format(
                        "Invalid tenant/payment method domain combination: tenantId=%s, paymentMethodDomainId=%s",
                        tenantId, paymentMethodDomainId
                    )
                );
            }
        } else {
            // Fallback: Lookup by tenantId only (for backward compatibility)
            config = paymentProviderConfigRepository
                .findByTenantIdAndProviderName(tenantId, "STRIPE")
                .orElse(null);

            if (config == null) {
                log.warn("No payment_provider_config found for tenantId={}, providerName=STRIPE", tenantId);
            }
        }

        // Step 4: Validate triple combination exists
        if (config != null && paymentMethodDomainId != null) {
            // Verify the combination matches
            if (!config.getPaymentMethodDomainId().equals(paymentMethodDomainId)) {
                log.error(
                    "Triple validation failed: Payment Method Domain ID mismatch. Expected={}, Got={}",
                    config.getPaymentMethodDomainId(), paymentMethodDomainId
                );
                throw new ValidationException("Payment Method Domain ID mismatch");
            }

            // Verify webhook_secret_encrypted exists (it should, since config was found)
            if (config.getWebhookSecretEncrypted() == null) {
                log.error(
                    "Triple validation failed: webhook_secret_encrypted is NULL for tenantId={}, paymentMethodDomainId={}",
                    tenantId, paymentMethodDomainId
                );
                throw new ValidationException("Webhook secret not configured");
            }

            log.info(
                "Triple validation successful: tenantId={}, paymentMethodDomainId={}, webhookSecretExists=true",
                tenantId, paymentMethodDomainId
            );
        }

        // Step 5: Use validated tenantId for all database operations
        dto.setTenantId(tenantId); // Ensure DTO has correct tenantId

        // Step 6: Create transaction (unique constraint will be enforced by database)
        return eventTicketTransactionRepository.save(dto);
    }
}
```

**Rust Example**:

```rust
pub async fn create_transaction(
    dto: EventTicketTransactionDTO,
    authenticated_tenant_id: Option<String>, // From JWT/security context
) -> Result<EventTicketTransactionDTO, Error> {
    // Step 1: Extract tenant ID (prioritize authenticated tenant ID over DTO)
    let tenant_id = authenticated_tenant_id
        .or(dto.tenant_id.clone())
        .ok_or_else(|| Error::new(StatusCode::BAD_REQUEST, "Tenant ID is required"))?;

    // Step 2: Extract Payment Method Domain ID from DTO
    let payment_method_domain_id = dto.payment_method_domain_id.clone();

    // Step 3: Lookup webhook_secret_encrypted from database
    let config = if let Some(pmd_id) = &payment_method_domain_id {
        // Query payment_provider_config for matching (tenant_id, payment_method_domain_id)
        payment_provider_config_repository
            .find_by_tenant_id_and_payment_method_domain_id(&tenant_id, pmd_id)
            .await?
            .ok_or_else(|| {
                Error::new(
                    StatusCode::FORBIDDEN,
                    format!(
                        "Invalid tenant/payment method domain combination: tenantId={}, paymentMethodDomainId={}",
                        tenant_id, pmd_id
                    )
                )
            })?
    } else {
        // Fallback: Lookup by tenant_id only (for backward compatibility)
        payment_provider_config_repository
            .find_by_tenant_id_and_provider_name(&tenant_id, "STRIPE")
            .await?
            .ok_or_else(|| {
                Error::new(
                    StatusCode::NOT_FOUND,
                    format!("No payment_provider_config found for tenantId={}", tenant_id)
                )
            })?
    };

    // Step 4: Validate triple combination exists
    if let Some(pmd_id) = &payment_method_domain_id {
        // Verify the combination matches
        if config.payment_method_domain_id.as_ref() != Some(pmd_id) {
            return Err(Error::new(
                StatusCode::FORBIDDEN,
                format!(
                    "Payment Method Domain ID mismatch. Expected={:?}, Got={}",
                    config.payment_method_domain_id, pmd_id
                )
            ));
        }

        // Verify webhook_secret_encrypted exists
        if config.webhook_secret_encrypted.is_none() {
            return Err(Error::new(
                StatusCode::INTERNAL_SERVER_ERROR,
                format!(
                    "Webhook secret not configured for tenantId={}, paymentMethodDomainId={}",
                    tenant_id, pmd_id
                )
            ));
        }

        log::info!(
            "Triple validation successful: tenantId={}, paymentMethodDomainId={}, webhookSecretExists=true",
            tenant_id, pmd_id
        );
    }

    // Step 5: Use validated tenant_id for all database operations
    let mut dto = dto;
    dto.tenant_id = Some(tenant_id.clone());

    // Step 6: Create transaction (unique constraint will be enforced by database)
    event_ticket_transaction_repository.save(dto).await
}
```

### 3. Backend Repository Methods

**Java Example**:

```java
@Repository
public interface PaymentProviderConfigRepository extends JpaRepository<PaymentProviderConfig, Long> {

    // Find by tenant ID and Payment Method Domain ID
    Optional<PaymentProviderConfig> findByTenantIdAndPaymentMethodDomainId(
        String tenantId,
        String paymentMethodDomainId
    );

    // Find by tenant ID and provider name (fallback)
    Optional<PaymentProviderConfig> findByTenantIdAndProviderName(
        String tenantId,
        String providerName
    );
}
```

**Rust Example**:

```rust
pub trait PaymentProviderConfigRepository {
    async fn find_by_tenant_id_and_payment_method_domain_id(
        &self,
        tenant_id: &str,
        payment_method_domain_id: &str,
    ) -> Result<Option<PaymentProviderConfig>, Error>;

    async fn find_by_tenant_id_and_provider_name(
        &self,
        tenant_id: &str,
        provider_name: &str,
    ) -> Result<Option<PaymentProviderConfig>, Error>;
}
```

### 4. Database Query Examples

**SQL Query**:

```sql
-- Find payment_provider_config by tenant_id and payment_method_domain_id
SELECT *
FROM payment_provider_config
WHERE tenant_id = $1
  AND payment_method_domain_id = $2
  AND provider_name = 'STRIPE'
  AND is_active = true;

-- Fallback: Find by tenant_id and provider_name only
SELECT *
FROM payment_provider_config
WHERE tenant_id = $1
  AND provider_name = 'STRIPE'
  AND is_active = true
LIMIT 1;
```

## Error Handling

### Frontend Error Handling

```typescript
try {
  const transaction = await createTransaction(transactionData);
} catch (error: any) {
  if (error.message?.includes('Invalid tenant/payment method domain')) {
    console.error('Triple validation failed:', error.message);
    // Show user-friendly error message
    throw new Error('Payment configuration error. Please contact support.');
  }
  throw error;
}
```

### Backend Error Responses

**Success Response** (200 OK):
```json
{
  "id": 123,
  "tenantId": "tenant_demo_002",
  "email": "customer@example.com",
  // ... other transaction fields
}
```

**Validation Error** (403 Forbidden):
```json
{
  "error": "Invalid tenant/payment method domain combination",
  "message": "No payment_provider_config found for tenantId=tenant_demo_002, paymentMethodDomainId=pmd_XXXXX",
  "code": "TRIPLE_VALIDATION_FAILED"
}
```

**Missing Field Error** (400 Bad Request):
```json
{
  "error": "Tenant ID is required",
  "code": "MISSING_TENANT_ID"
}
```

## Security Considerations

1. **✅ Backend Validates Everything**: Frontend only passes values - backend validates
2. **✅ Webhook Secret Never Sent**: Backend looks up encrypted secret from database
3. **✅ Authenticated Tenant ID Priority**: Backend uses JWT/security context tenant ID over DTO tenant ID
4. **✅ Database Constraint**: Unique constraint ensures no duplicate combinations
5. **✅ Logging**: All validation failures are logged for security monitoring

## Migration Strategy

### Phase 1: Add Fields (Non-Breaking)
- Add `paymentMethodDomainId` to DTOs (optional)
- Frontend starts sending `paymentMethodDomainId`
- Backend accepts but doesn't validate yet (backward compatible)

### Phase 2: Backend Validation (Soft Enforcement)
- Backend validates triple combination
- Logs warnings for missing/invalid combinations
- Still allows transactions (for backward compatibility)

### Phase 3: Strict Enforcement
- Backend rejects transactions with invalid combinations
- All transactions must have valid triple combination
- Database constraint ensures uniqueness

## Testing

### Frontend Tests

```typescript
describe('createTransaction with triple validation', () => {
  it('should include paymentMethodDomainId in payload', async () => {
    const transactionData = { /* ... */ };
    const result = await createTransaction(transactionData);

    expect(result).toBeDefined();
    // Verify backend received paymentMethodDomainId
  });
});
```

### Backend Tests

```java
@Test
void testTripleValidationSuccess() {
    // Given
    EventTicketTransactionDTO dto = new EventTicketTransactionDTO();
    dto.setTenantId("tenant_demo_002");
    dto.setPaymentMethodDomainId("pmd_1SWrMSK5BrggeAHMmHxUd9F2");

    // When
    EventTicketTransactionDTO result = service.createTransaction(dto, "tenant_demo_002");

    // Then
    assertNotNull(result);
    assertEquals("tenant_demo_002", result.getTenantId());
}

@Test
void testTripleValidationFailure() {
    // Given
    EventTicketTransactionDTO dto = new EventTicketTransactionDTO();
    dto.setTenantId("tenant_demo_002");
    dto.setPaymentMethodDomainId("pmd_INVALID");

    // When/Then
    assertThrows(ValidationException.class, () -> {
        service.createTransaction(dto, "tenant_demo_002");
    });
}
```

## Summary

**Frontend Responsibilities:**
- ✅ Read `NEXT_PUBLIC_TENANT_ID` and `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` from environment
- ✅ Include `tenantId` and `paymentMethodDomainId` in API request payloads
- ✅ Handle validation errors from backend

**Backend Responsibilities:**
- ✅ Extract `tenantId` from JWT/security context (most secure)
- ✅ Extract `paymentMethodDomainId` from request DTO
- ✅ Lookup `webhook_secret_encrypted` from `payment_provider_config` table
- ✅ Validate triple combination exists in database
- ✅ Reject requests with invalid combinations
- ✅ Use validated `tenantId` for all database operations
- ✅ Enforce unique constraint on `(tenant_id, payment_method_domain_id, webhook_secret_encrypted)`

**Key Benefits:**
- ✅ Backend controls all validation logic
- ✅ Webhook secrets never exposed to frontend
- ✅ Database constraint ensures data integrity
- ✅ Centralized security and validation

