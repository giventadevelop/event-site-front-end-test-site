# Backend Webhook Implementation Prompt

## Context
The frontend Next.js application (`E:\project_workspace\code_backup\mosc-temp`) currently forwards all Stripe webhook events to the backend Rust API (`E:\project_workspace\malayalees-us-site-boot`). The frontend webhook handler at `src/app/api/webhooks/stripe/route.ts` is now a simple proxy that forwards raw webhook body and signature to the backend endpoint `POST /api/webhooks/stripe`.

## Problem Statement
When multiple Stripe webhook endpoints point to the same URL (Stripe's fan-out behavior), Stripe sends the same event to ALL endpoints. Each webhook endpoint has its own unique webhook secret. We need the backend to:
1. Verify webhook signature against all tenant webhook secrets from `payment_provider_config` table
2. Identify which tenant initiated the payment by finding the matching webhook secret
3. Create transactions with the correct tenant ID
4. Ignore requests that don't match any tenant's webhook secret

## Backend Database Schema
The backend has a `payment_provider_config` table with the following structure:
```sql
CREATE TABLE payment_provider_config (
  tenant_id VARCHAR NOT NULL,
  provider_name VARCHAR NOT NULL,
  webhook_secret_encrypted VARCHAR,  -- Encrypted webhook secret
  provider_secret_key_encrypted VARCHAR,  -- Encrypted Stripe secret key
  publishable_key VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  -- ... other fields
  PRIMARY KEY (tenant_id, provider_name)
);
```

Example data:
```sql
INSERT INTO payment_provider_config (
  tenant_id, provider_name, is_active,
  provider_secret_key_encrypted, webhook_secret_encrypted, publishable_key,
  created_at, updated_at
) VALUES (
  'tenant_demo_002', 'STRIPE', true,
  '88byaTekKyZfq96Ca4X8VGtyT4SHmvW9Wnjxl0CfE73+yOFA4r0dlIfF+OTqS2P9b8N0vx3lrrI1aS6oB/7m9Unz5Pt9bvCcogJ5B5B84b2FpiGDmU1P5qcupcJZN9NRifUszfLAVii7XlA6p23QsYPffYW+f4WcaU7qDC0DfsUmiCKvz0IC',
  'xvbHVRPMb5hQBiJG1Qd/1WAoH5VU8iU3Vq+RhiDgcJTa4CijlRgIprofUWTIlsf8YH1sEXgtqG5HClhE+Mfb4SH8',
  'pk_live_***REDACTED***',
  '2025-11-27 16:41:22.719508', '2025-11-27 16:41:22.719508'
);
```

## Implementation Requirements

### 1. Webhook Endpoint: `POST /api/webhooks/stripe`

**Request Headers:**
- `Stripe-Signature`: Stripe webhook signature (forwarded from frontend)
- `Content-Type`: `application/json`

**Request Body:**
- Raw JSON body (as received from Stripe, forwarded as-is from frontend)

### 2. Multi-Secret Verification Logic

```rust
// Pseudocode for backend implementation
fn verify_webhook_signature(
    raw_body: &[u8],
    signature: &str,
) -> Result<String, WebhookError> {
    // 1. Query all active Stripe payment provider configs
    let configs = payment_provider_config_repository
        .find_by_provider_name_and_is_active("STRIPE", true)
        .await?;

    // 2. Try each webhook secret until one matches
    for config in configs {
        // Decrypt webhook secret
        let webhook_secret = decrypt(config.webhook_secret_encrypted)?;

        // Verify signature with Stripe SDK
        match stripe::webhooks::construct_event(
            raw_body,
            signature,
            &webhook_secret
        ) {
            Ok(event) => {
                // Signature verified! Return tenant ID
                return Ok(config.tenant_id);
            }
            Err(_) => {
                // Wrong secret, try next one
                continue;
            }
        }
    }

    // No matching secret found
    Err(WebhookError::SignatureVerificationFailed)
}
```

### 3. Webhook Handler Flow

```rust
#[post("/api/webhooks/stripe")]
async fn handle_stripe_webhook(
    req: HttpRequest,
    body: web::Bytes,
) -> Result<HttpResponse, Error> {
    // 1. Extract signature from header
    let signature = req.headers()
        .get("Stripe-Signature")
        .ok_or_else(|| WebhookError::MissingSignature)?
        .to_str()?;

    // 2. Get raw body as bytes
    let raw_body = body.as_ref();

    // 3. Verify signature against all tenant secrets
    let tenant_id = verify_webhook_signature(raw_body, signature)
        .map_err(|e| {
            log::warn!("Webhook signature verification failed: {}", e);
            // Return 200 OK to prevent Stripe retries for invalid signatures
            return HttpResponse::Ok().json(json!({
                "received": true,
                "message": "Webhook signature verification failed",
                "ignored": true
            }));
        })?;

    log::info!("Webhook verified for tenant: {}", tenant_id);

    // 4. Parse Stripe event
    let event: StripeEvent = serde_json::from_slice(raw_body)?;

    // 5. Process event with identified tenant ID
    match event.type_.as_str() {
        "checkout.session.completed" => {
            process_checkout_session_completed(&event, &tenant_id).await?;
        }
        "payment_intent.succeeded" => {
            process_payment_intent_succeeded(&event, &tenant_id).await?;
        }
        "charge.refunded" => {
            process_charge_refunded(&event, &tenant_id).await?;
        }
        "charge.succeeded" | "charge.updated" => {
            process_charge_fee_update(&event, &tenant_id).await?;
        }
        "customer.subscription.updated" | "customer.subscription.deleted" => {
            process_subscription_update(&event, &tenant_id).await?;
        }
        _ => {
            log::info!("Unhandled event type: {}", event.type_);
        }
    }

    // 6. Return success to Stripe
    Ok(HttpResponse::Ok().json(json!({ "received": true })))
}
```

### 4. Transaction Creation with Tenant ID

**CRITICAL**: All transaction creation must use the tenant ID identified from webhook signature verification, NOT from event metadata.

```rust
async fn process_payment_intent_succeeded(
    event: &StripeEvent,
    tenant_id: &str,
) -> Result<(), Error> {
    let pi = event.data.object.as_payment_intent()?;

    // CRITICAL: Use tenant_id from signature verification, NOT from metadata
    // This ensures we use the correct tenant even if metadata is wrong

    // Check if transaction already exists (idempotency)
    let existing = event_ticket_transaction_repository
        .find_by_stripe_payment_intent_id_and_tenant_id(
            &pi.id,
            tenant_id
        )
        .await?;

    if existing.is_some() {
        log::info!("Transaction already exists for PI {} and tenant {}", pi.id, tenant_id);
        return Ok(());
    }

    // Create transaction with verified tenant ID
    let transaction = EventTicketTransactionDTO {
        // ... extract from payment intent ...
        tenant_id: tenant_id.to_string(),  // Use verified tenant ID
        stripe_payment_intent_id: Some(pi.id.clone()),
        // ... other fields ...
    };

    event_ticket_transaction_repository.create(&transaction).await?;

    Ok(())
}
```

### 5. Database Constraint Consideration

**IMPORTANT**: The `unique_stripe_payment_intent` constraint should be scoped by `tenant_id`. If it's currently global, consider modifying it to be tenant-scoped:

```sql
-- Current (global uniqueness - causes issues):
ALTER TABLE event_ticket_transaction
ADD CONSTRAINT unique_stripe_payment_intent
UNIQUE (stripe_payment_intent_id);

-- Recommended (tenant-scoped uniqueness):
ALTER TABLE event_ticket_transaction
ADD CONSTRAINT unique_stripe_payment_intent_per_tenant
UNIQUE (stripe_payment_intent_id, tenant_id);
```

This allows the same payment intent ID to be used by different tenants (if needed) while preventing duplicates within the same tenant.

### 6. Error Handling

- **Signature Verification Failed**: Return `200 OK` with `{"received": true, "ignored": true}` to prevent Stripe retries
- **Invalid Event Data**: Log error and return `200 OK` (don't retry)
- **Database Errors**: Log error and return `500` (Stripe will retry)
- **Tenant Not Found**: Log warning and return `200 OK` with `{"received": true, "ignored": true}`

### 7. Logging Requirements

Log the following for debugging:
- Webhook received (event type, event ID)
- Signature verification attempts (which tenant secrets were tried)
- Tenant ID identified from signature verification
- Transaction creation/update operations
- Any errors or warnings

## Benefits of This Approach

1. **Single Responsibility**: Backend handles all webhook processing logic
2. **Security**: Webhook secrets never exposed to frontend
3. **Simplicity**: Frontend just proxies, backend does everything
4. **Consistency**: All webhook logic in one place
5. **Tenant Isolation**: Correct tenant ID guaranteed from signature verification
6. **Idempotency**: Backend can check for existing transactions before creating

## Testing Checklist

- [ ] Webhook signature verification works with correct secret
- [ ] Webhook signature verification fails with wrong secret
- [ ] Multiple tenant secrets are tried until one matches
- [ ] Transaction created with correct tenant ID from signature verification
- [ ] Duplicate transactions prevented (idempotency check)
- [ ] Invalid signatures return 200 OK (prevent retries)
- [ ] Database constraint violations handled gracefully
- [ ] All event types processed correctly (`checkout.session.completed`, `payment_intent.succeeded`, etc.)

## Frontend Changes Made

The frontend webhook handler (`src/app/api/webhooks/stripe/route.ts`) has been simplified to:
1. Read raw body and signature from Stripe
2. Forward to backend: `POST ${API_BASE_URL}/api/webhooks/stripe`
3. Return backend response to Stripe

No webhook processing logic remains in the frontend.

---

## CRITICAL: Tenant ID Validation for ALL API Endpoints

**IMPORTANT**: The backend must validate and enforce tenant ID for **ALL** transaction-related API endpoints, not just webhook endpoints. This prevents frontend calls from creating transactions with incorrect tenant IDs.

### Frontend API Calls That Need Tenant Validation

The frontend makes the following API calls that **MUST** be validated by the backend:

#### 1. Create Transaction (`POST /api/event-ticket-transactions`)

**Called From:**
- Event success page fallback (`src/app/event/success/ApiServerActions.ts`)
- Webhook server actions (legacy, now forwarded to backend webhook)

**Backend Validation Required:**
```rust
#[post("/api/event-ticket-transactions")]
async fn create_event_ticket_transaction(
    req: HttpRequest,
    body: web::Json<EventTicketTransactionDTO>,
) -> Result<HttpResponse, Error> {
    let transaction = body.into_inner();

    // CRITICAL: Validate tenant ID from JWT or request context
    let request_tenant_id = extract_tenant_id_from_request(&req)?;

    // CRITICAL: Reject if tenant ID doesn't match
    if transaction.tenant_id != request_tenant_id {
        log::warn!(
            "Transaction creation rejected: tenant ID mismatch. Request tenant: {}, Transaction tenant: {}",
            request_tenant_id,
            transaction.tenant_id
        );
        return Err(WebError::Forbidden("Tenant ID mismatch".to_string()));
    }

    // CRITICAL: Override tenant ID with validated tenant ID from request
    let mut validated_transaction = transaction;
    validated_transaction.tenant_id = request_tenant_id;

    // Create transaction with validated tenant ID
    event_ticket_transaction_repository.create(&validated_transaction).await?;

    Ok(HttpResponse::Ok().json(validated_transaction))
}
```

#### 2. Query Transactions (`GET /api/event-ticket-transactions`)

**Called From:**
- Event success page (`findTransactionByPaymentIntentId`, `findTransactionBySessionId`)
- Admin pages
- Various query operations

**Backend Validation Required:**
```rust
#[get("/api/event-ticket-transactions")]
async fn get_event_ticket_transactions(
    req: HttpRequest,
    query: web::Query<TransactionQueryParams>,
) -> Result<HttpResponse, Error> {
    // CRITICAL: Extract tenant ID from JWT or request context
    let request_tenant_id = extract_tenant_id_from_request(&req)?;

    // CRITICAL: Always add tenant filter, even if not in query params
    let mut query_params = query.into_inner();
    query_params.tenant_id = Some(request_tenant_id.clone());

    // CRITICAL: If query params include tenantId, validate it matches request tenant
    if let Some(query_tenant_id) = &query_params.tenant_id {
        if query_tenant_id != &request_tenant_id {
            log::warn!(
                "Transaction query rejected: tenant ID mismatch. Request tenant: {}, Query tenant: {}",
                request_tenant_id,
                query_tenant_id
            );
            return Err(WebError::Forbidden("Tenant ID mismatch".to_string()));
        }
    }

    // Query with validated tenant ID
    let transactions = event_ticket_transaction_repository
        .find_by_criteria(&query_params, &request_tenant_id)
        .await?;

    Ok(HttpResponse::Ok().json(transactions))
}
```

#### 3. Create Transaction Items (`POST /api/event-ticket-transaction-items/bulk`)

**Called From:**
- Event success page (`processStripeSessionServer`, `createTransactionFromPaymentIntent`)
- Webhook server actions (legacy)

**Backend Validation Required:**
```rust
#[post("/api/event-ticket-transaction-items/bulk")]
async fn create_transaction_items_bulk(
    req: HttpRequest,
    body: web::Json<Vec<EventTicketTransactionItemDTO>>,
) -> Result<HttpResponse, Error> {
    let items = body.into_inner();

    // CRITICAL: Validate tenant ID from JWT or request context
    let request_tenant_id = extract_tenant_id_from_request(&req)?;

    // CRITICAL: Validate all items have matching tenant ID
    for item in &items {
        if item.tenant_id != request_tenant_id {
            log::warn!(
                "Transaction item creation rejected: tenant ID mismatch. Request tenant: {}, Item tenant: {}",
                request_tenant_id,
                item.tenant_id
            );
            return Err(WebError::Forbidden("Tenant ID mismatch".to_string()));
        }
    }

    // CRITICAL: Override tenant ID with validated tenant ID from request
    let validated_items: Vec<EventTicketTransactionItemDTO> = items
        .into_iter()
        .map(|mut item| {
            item.tenant_id = request_tenant_id.clone();
            item
        })
        .collect();

    // Create items with validated tenant ID
    let created_items = event_ticket_transaction_item_repository
        .create_bulk(&validated_items)
        .await?;

    Ok(HttpResponse::Ok().json(created_items))
}
```

#### 4. Query Transaction Items (`GET /api/event-ticket-transaction-items`)

**Called From:**
- Event success page (idempotency checks)
- Admin pages

**Backend Validation Required:**
```rust
#[get("/api/event-ticket-transaction-items")]
async fn get_transaction_items(
    req: HttpRequest,
    query: web::Query<TransactionItemQueryParams>,
) -> Result<HttpResponse, Error> {
    // CRITICAL: Extract tenant ID from JWT or request context
    let request_tenant_id = extract_tenant_id_from_request(&req)?;

    // CRITICAL: Always add tenant filter, even if not in query params
    let mut query_params = query.into_inner();
    query_params.tenant_id = Some(request_tenant_id.clone());

    // CRITICAL: If query params include tenantId, validate it matches request tenant
    if let Some(query_tenant_id) = &query_params.tenant_id {
        if query_tenant_id != &request_tenant_id {
            log::warn!(
                "Transaction item query rejected: tenant ID mismatch. Request tenant: {}, Query tenant: {}",
                request_tenant_id,
                query_tenant_id
            );
            return Err(WebError::Forbidden("Tenant ID mismatch".to_string()));
        }
    }

    // Query with validated tenant ID
    let items = event_ticket_transaction_item_repository
        .find_by_criteria(&query_params, &request_tenant_id)
        .await?;

    Ok(HttpResponse::Ok().json(items))
}
```

### Tenant ID Extraction from Request

**CRITICAL**: The backend must extract tenant ID from multiple sources in priority order. The frontend sends tenant ID via `X-Tenant-ID` header, but the backend should validate it against the request origin (domain/subdomain) for security.

```rust
fn extract_tenant_id_from_request(req: &HttpRequest) -> Result<String, WebError> {
    // PRIORITY 1: Extract from domain/subdomain (most secure - cannot be spoofed)
    // This is especially important for Payment Method Domain scenarios where
    // each subdomain corresponds to a different tenant
    if let Some(host) = req.headers().get("Host") {
        if let Ok(host_str) = host.to_str() {
            // Extract subdomain from host (e.g., "tenant1.payments.example.com" -> "tenant1")
            // Or use full domain mapping (e.g., "payments-tenant1.example.com" -> "tenant_demo_001")
            if let Some(tenant_id) = extract_tenant_from_domain(host_str) {
                log::info!("Tenant ID extracted from domain: {} -> {}", host_str, tenant_id);
                return Ok(tenant_id);
            }
        }
    }

    // PRIORITY 2: Extract from Origin header (for CORS requests)
    if let Some(origin) = req.headers().get("Origin") {
        if let Ok(origin_str) = origin.to_str() {
            if let Some(tenant_id) = extract_tenant_from_domain(origin_str) {
                log::info!("Tenant ID extracted from Origin: {} -> {}", origin_str, tenant_id);
                return Ok(tenant_id);
            }
        }
    }

    // PRIORITY 3: Extract from X-Tenant-ID header (sent by frontend)
    // CRITICAL: Validate this against domain-based tenant ID if available
    if let Some(tenant_header) = req.headers().get("X-Tenant-ID") {
        if let Ok(tenant_id) = tenant_header.to_str() {
            // Validate tenant ID matches domain (if domain-based tenant ID was found)
            // This prevents frontend from sending wrong tenant ID
            if let Some(domain_tenant) = extract_tenant_from_domain(
                req.headers().get("Host").and_then(|h| h.to_str().ok()).unwrap_or("")
            ) {
                if tenant_id != domain_tenant {
                    log::warn!(
                        "Tenant ID mismatch: Header says {}, Domain says {}",
                        tenant_id,
                        domain_tenant
                    );
                    return Err(WebError::Forbidden(
                        format!("Tenant ID mismatch: header={}, domain={}", tenant_id, domain_tenant)
                    ));
                }
            }
            return Ok(tenant_id.to_string());
        }
    }

    // PRIORITY 4: Extract from JWT token claims (if JWT contains tenant ID)
    if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                if let Ok(claims) = decode_jwt_token(token) {
                    if let Some(tenant_id) = claims.get("tenant_id") {
                        return Ok(tenant_id.to_string());
                    }
                }
            }
        }
    }

    // PRIORITY 5: Extract from request context (if middleware sets it)
    if let Some(tenant_id) = req.extensions().get::<String>() {
        return Ok(tenant_id.clone());
    }

    Err(WebError::Unauthorized("Tenant ID not found in request".to_string()))
}

/// Extract tenant ID from domain/subdomain
/// This maps Payment Method Domain subdomains to tenant IDs
fn extract_tenant_from_domain(domain: &str) -> Option<String> {
    // Example mappings:
    // - "payments-tenant1.example.com" -> "tenant_demo_001"
    // - "payments-tenant2.example.com" -> "tenant_demo_002"
    // - "tenant1.payments.example.com" -> "tenant_demo_001"

    // Option 1: Query database for domain-to-tenant mapping
    // This should be cached for performance
    if let Some(tenant_id) = domain_tenant_mapping_cache.get(domain) {
        return Some(tenant_id.clone());
    }

    // Option 2: Extract from subdomain pattern
    // Example: "tenant1.payments.example.com" -> extract "tenant1" -> map to "tenant_demo_001"
    if let Some(subdomain) = extract_subdomain(domain) {
        if let Some(tenant_id) = map_subdomain_to_tenant_id(subdomain) {
            return Some(tenant_id);
        }
    }

    None
}

/// Map Payment Method Domain subdomain to tenant ID
/// This should query the payment_provider_config table or a tenant_domain_mapping table
fn map_subdomain_to_tenant_id(subdomain: &str) -> Option<String> {
    // Query database: SELECT tenant_id FROM payment_provider_config
    // WHERE payment_method_domain LIKE '%{subdomain}%' OR domain_subdomain = '{subdomain}'
    // OR query a dedicated tenant_domain_mapping table

    // For now, return None - backend should implement this mapping
    None
}
```

### Payment Method Domain Tenant Identification

**CRITICAL**: When using Stripe Payment Method Domain with subdomains, each subdomain corresponds to a different tenant. The backend must map the request domain/subdomain to the correct tenant ID.

**Architecture:**
```
Stripe Payment Method Domain Setup:
- tenant1.payments.example.com → tenant_demo_001
- tenant2.payments.example.com → tenant_demo_002
- payments-tenant1.example.com → tenant_demo_001
```

**Backend Implementation Required:**

1. **Domain-to-Tenant Mapping Table** (recommended):
```sql
CREATE TABLE tenant_domain_mapping (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    domain_pattern VARCHAR NOT NULL,  -- e.g., "tenant1.payments.example.com" or "*.payments.example.com"
    payment_method_domain VARCHAR,     -- Stripe Payment Method Domain
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(domain_pattern, tenant_id)
);

-- Example data:
INSERT INTO tenant_domain_mapping (tenant_id, domain_pattern, payment_method_domain, is_active)
VALUES
    ('tenant_demo_001', 'tenant1.payments.example.com', 'tenant1.payments.example.com', true),
    ('tenant_demo_002', 'tenant2.payments.example.com', 'tenant2.payments.example.com', true),
    ('tenant_demo_001', 'payments-tenant1.example.com', 'payments-tenant1.example.com', true);
```

2. **Backend Domain-to-Tenant Lookup**:
```rust
async fn lookup_tenant_from_domain(domain: &str) -> Result<Option<String>, Error> {
    // Query tenant_domain_mapping table
    let mapping = tenant_domain_mapping_repository
        .find_by_domain_pattern(domain)
        .await?;

    if let Some(m) = mapping {
        if m.is_active {
            return Ok(Some(m.tenant_id));
        }
    }

    // Fallback: Try pattern matching (e.g., "*.payments.example.com")
    let pattern_mappings = tenant_domain_mapping_repository
        .find_by_pattern_match(domain)
        .await?;

    for mapping in pattern_mappings {
        if mapping.is_active && domain_matches_pattern(domain, &mapping.domain_pattern) {
            return Ok(Some(mapping.tenant_id));
        }
    }

    Ok(None)
}
```

3. **Payment Method Domain in payment_provider_config**:
```sql
-- Add payment_method_domain column to payment_provider_config
ALTER TABLE payment_provider_config
ADD COLUMN payment_method_domain VARCHAR;

-- Update existing records:
UPDATE payment_provider_config
SET payment_method_domain = 'tenant1.payments.example.com'
WHERE tenant_id = 'tenant_demo_001';

UPDATE payment_provider_config
SET payment_method_domain = 'tenant2.payments.example.com'
WHERE tenant_id = 'tenant_demo_002';
```

**Backend can then query:**
```rust
// Find tenant by Payment Method Domain
let tenant_id = payment_provider_config_repository
    .find_by_payment_method_domain(domain)
    .await?
    .map(|config| config.tenant_id);
```

### Why Frontend Fallback Still Exists

**Question**: If webhooks handle transaction creation, why does the frontend success page still create transactions?

**Answer**: The frontend fallback exists for **reliability** reasons:

1. **Webhook Delays**: Stripe webhooks may be delayed (network issues, Stripe retries)
2. **Webhook Failures**: Webhooks may fail to process (backend errors, timeouts)
3. **User Navigation**: Users may navigate to success page before webhook processes
4. **Idempotency**: Frontend checks for existing transactions before creating (prevents duplicates)

**However**, the backend **MUST** still validate tenant ID for frontend API calls to prevent:
- Cross-tenant data access
- Incorrect tenant ID injection
- Security vulnerabilities

### Backend Enforcement Strategy

**CRITICAL**: The backend should enforce tenant isolation at **multiple layers**:

1. **Request Layer**: Extract tenant ID from JWT/headers and validate
2. **Service Layer**: Always use validated tenant ID, never trust client-provided tenant ID
3. **Repository Layer**: Always filter by tenant ID in queries
4. **Database Layer**: Consider tenant-scoped unique constraints (see Section 5)

### Summary: Tenant Validation Requirements

| Endpoint | Method | Validation Required | Tenant Source |
|----------|--------|-------------------|---------------|
| `/api/event-ticket-transactions` | POST | ✅ Validate tenant ID matches request | JWT/Headers |
| `/api/event-ticket-transactions` | GET | ✅ Always filter by request tenant ID | JWT/Headers |
| `/api/event-ticket-transactions/{id}` | GET | ✅ Verify transaction belongs to request tenant | JWT/Headers |
| `/api/event-ticket-transactions/{id}` | PATCH | ✅ Verify transaction belongs to request tenant | JWT/Headers |
| `/api/event-ticket-transaction-items/bulk` | POST | ✅ Validate all items have matching tenant ID | JWT/Headers |
| `/api/event-ticket-transaction-items` | GET | ✅ Always filter by request tenant ID | JWT/Headers |
| `/api/webhooks/stripe` | POST | ✅ Identify tenant from webhook signature | Webhook Secret |

**Key Principle**: **NEVER trust tenant ID from request body or query parameters. Always extract from authenticated request context (JWT, headers, domain/subdomain, or webhook signature).**

---

## Tenant Identification: How Backend Knows Which Tenant Initiated the Request

### Question: How does the backend differentiate between tenants when multiple tenants exist?

**Answer**: The backend uses different identification methods depending on the request source:

### 1. Webhook Requests (`POST /api/webhooks/stripe`)

**How Backend Identifies Tenant:**
- **Webhook Signature Verification**: Backend receives `Stripe-Signature` header
- **Multi-Secret Verification**: Backend queries `payment_provider_config` table for all active Stripe webhook secrets
- **Tenant Identification**: Backend tries each webhook secret until one successfully verifies the signature
- **Result**: The matching webhook secret identifies the tenant (from `payment_provider_config.tenant_id`)

**Why This Works:**
- Each Stripe Payment Method Domain has its own unique webhook secret
- Webhook secret is stored in `payment_provider_config.webhook_secret_encrypted` per tenant
- Signature verification is cryptographically secure - cannot be spoofed
- Backend identifies tenant **before** processing any transaction data

**Example Flow:**
```
Stripe sends webhook → Frontend forwards to backend → Backend verifies signature:
  - Try tenant_demo_001 webhook secret → ❌ Fails
  - Try tenant_demo_002 webhook secret → ✅ Matches!
  - Use tenant_demo_002 for transaction creation
```

#### **CRITICAL: What the Stripe Webhook Signature Contains**

**Question**: Can we extract tenant ID or domain metadata from the webhook signature itself?

**Answer**: **NO** - The Stripe webhook signature is a **cryptographic hash** and does **NOT** contain any metadata (tenant ID, domain, etc.).

**Stripe Webhook Signature Structure:**
```
Stripe-Signature: t=1234567890,v1=abc123def456...
```

**Components:**
- `t=1234567890`: Unix timestamp when Stripe created the signature
- `v1=abc123def456...`: HMAC-SHA256 signature value (cryptographic hash)

**How Stripe Computes the Signature:**
```rust
// Stripe's signature computation (simplified)
let signed_payload = format!("{}.{}", timestamp, raw_body);
let signature = HMAC_SHA256(signed_payload, webhook_secret);
```

**What This Means:**
- ✅ The signature is a **cryptographic hash** - it's just a hash value, not metadata
- ❌ The signature does **NOT** contain tenant ID, domain name, or any other metadata
- ❌ You **CANNOT** extract tenant information directly from the signature string
- ✅ Tenant identification happens **indirectly** through signature verification

**How Tenant Identification Actually Works:**

1. **Backend receives webhook** with `Stripe-Signature` header
2. **Backend queries** all webhook secrets from `payment_provider_config` table
3. **Backend tries each secret** to verify the signature:
   ```rust
   for each webhook_secret in payment_provider_config {
       if verify_signature(raw_body, signature_header, webhook_secret) {
           // Found matching secret!
           tenant_id = payment_provider_config.tenant_id; // Look up tenant from config
           break;
       }
   }
   ```
4. **The matching secret** identifies which `payment_provider_config` record was used
5. **Tenant ID is extracted** from the `payment_provider_config.tenant_id` field (not from signature)

**Why This Approach is Secure:**
- ✅ **Cryptographic verification**: Only the correct webhook secret can verify the signature
- ✅ **Cannot be spoofed**: An attacker cannot create a valid signature without the secret
- ✅ **Tenant isolation**: Each tenant's webhook secret is unique and stored encrypted
- ✅ **No metadata leakage**: The signature doesn't reveal which tenant it belongs to until verified

**Comparison with Other Tenant Identification Methods:**

| Method | Contains Tenant Info? | How Tenant is Identified |
|--------|----------------------|-------------------------|
| **Webhook Signature** | ❌ No (just hash) | Indirectly via secret verification → lookup tenant from `payment_provider_config` |
| **Payment Method Domain ID Metadata** | ✅ Yes (if added) (`pmd_1SWrMSK5BrggeAHMmHxUd9F2`) | Extract from `metadata.paymentMethodDomainId` → lookup tenant from `payment_provider_config` |
| **Domain/Subdomain** | ✅ Yes (`tenant1.payments.example.com`) | Directly from `Host` header → map to tenant ID |
| **X-Tenant-ID Header** | ✅ Yes (`tenant_demo_001`) | Directly from header value (must be validated) |
| **JWT Token Claims** | ✅ Yes (if included) | Directly from JWT `tenant_id` claim |

**Important Security Note:**
- The webhook signature verification process is the **ONLY** way to identify tenant from webhook events
- You **CANNOT** compare the signature against JWT headers or query params because:
  - Webhooks come from Stripe's servers (not from your frontend)
  - Webhooks don't include JWT tokens or custom headers
  - The signature is the **only** authentication mechanism for webhooks
- The signature verification **IS** the tenant identification mechanism (via secret matching)

---

#### **CRITICAL: Triple Validation Approach (Tenant ID + Payment Method Domain ID + Webhook Secret)**

**Question**: Can we add tenant ID and Payment Method Domain ID directly to metadata when creating PaymentIntents/Checkout Sessions and validate the combination in the backend?

**Answer**: **YES** - This is the **most secure approach**. You add both `tenantId` and `paymentMethodDomainId` to metadata when creating PaymentIntents/Checkout Sessions. The backend then performs **triple validation** by verifying that the combination of (tenantId, paymentMethodDomainId, webhookSecret) exists in the `payment_provider_config` table. If the combination doesn't match, the request is rejected.

**How It Works:**

1. **Add tenant ID and Payment Method Domain ID to metadata** when creating PaymentIntents/Checkout Sessions (frontend)
2. **Stripe includes this metadata** in all webhook events automatically
3. **Extract tenant ID and Payment Method Domain ID from metadata** in webhook events (backend)
4. **Verify webhook signature** to identify the webhook secret used (backend)
5. **Query database** to verify the combination (tenantId, paymentMethodDomainId, webhookSecret) exists (backend)
6. **Reject request** if combination doesn't match (backend)

**Security Benefits:**

- ✅ **Triple Validation**: Requires matching tenantId, paymentMethodDomainId, AND webhookSecret
- ✅ **Prevents Cross-Tenant Attacks**: Even if metadata is modified, webhook secret must match
- ✅ **Database-Backed**: All valid combinations stored in `payment_provider_config` table
- ✅ **Reject Invalid Requests**: Any request with non-matching combination is immediately rejected

**Frontend Implementation** (Already Updated):

**Environment Variables Required:**
```bash
NEXT_PUBLIC_TENANT_ID=tenant_demo_002
NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID=pmd_1SWrMSK5BrggeAHMmHxUd9F2
```

**Checkout Session** (`src/lib/stripe/checkout.ts`):
```typescript
const tenantId = getTenantId();
const paymentMethodDomainId = getPaymentMethodDomainId();

const sessionParams: Stripe.Checkout.SessionCreateParams = {
  // ... other params ...
  metadata: {
    // ... existing metadata ...
    tenantId: tenantId, // ✅ Added tenant ID to metadata
    paymentMethodDomainId: paymentMethodDomainId, // ✅ Added Payment Method Domain ID for triple validation
  },
  payment_intent_data: {
    metadata: {
      // ... existing metadata ...
      tenantId: tenantId, // ✅ Added tenant ID to PaymentIntent metadata
      paymentMethodDomainId: paymentMethodDomainId, // ✅ Added Payment Method Domain ID for triple validation
    },
  },
};
```

**Payment Intent** (`src/app/api/stripe/payment-intent/route.ts`):
```typescript
const tenantId = getTenantId();
const paymentMethodDomainId = getPaymentMethodDomainId();

const pi = await stripe().paymentIntents.create({
  // ... other params ...
  metadata: {
    // ... existing metadata ...
    tenantId: tenantId, // ✅ Added tenant ID to metadata
    paymentMethodDomainId: paymentMethodDomainId, // ✅ Added Payment Method Domain ID for triple validation
  },
});
```

**Backend Implementation** (Rust) - **CRITICAL: Triple Validation**:

```rust
#[post("/api/webhooks/stripe")]
async fn handle_stripe_webhook(
    req: HttpRequest,
    body: web::Bytes,
) -> Result<HttpResponse, Error> {
    // 1. Extract signature and raw body
    let signature = req.headers().get("Stripe-Signature")?;
    let raw_body = body.as_ref();

    // 2. Parse Stripe event
    let event: StripeEvent = serde_json::from_slice(raw_body)?;

    // 3. Extract tenant ID and Payment Method Domain ID from metadata
    let (tenant_id_from_metadata, payment_method_domain_id_from_metadata) =
        extract_tenant_and_payment_method_domain_id_from_metadata(&event);

    // 4. Verify webhook signature and identify webhook secret used
    let webhook_secret_used = verify_webhook_signature_and_get_secret(raw_body, signature)?;

    // 5. CRITICAL: Triple Validation - Verify combination exists in database
    let validation_result = validate_triple_combination(
        &tenant_id_from_metadata,
        &payment_method_domain_id_from_metadata,
        &webhook_secret_used
    ).await?;

    // 6. REJECT if combination doesn't match
    if !validation_result.is_valid {
        log::error!(
            "TRIPLE VALIDATION FAILED: tenantId={}, paymentMethodDomainId={}, webhookSecret={}",
            tenant_id_from_metadata.as_deref().unwrap_or("MISSING"),
            payment_method_domain_id_from_metadata.as_deref().unwrap_or("MISSING"),
            webhook_secret_used
        );
        return Err(Error::new(
            StatusCode::FORBIDDEN,
            "Invalid tenant/payment method domain/webhook secret combination"
        ));
    }

    // 7. Use validated tenant ID from database (most secure)
    let tenant_id = validation_result.tenant_id.expect("Tenant ID should be present after validation");

    log::info!(
        "TRIPLE VALIDATION SUCCESS: tenantId={}, paymentMethodDomainId={}, webhookSecret={}",
        tenant_id,
        payment_method_domain_id_from_metadata.as_deref().unwrap_or("MISSING"),
        webhook_secret_used
    );

    // 8. Process event with validated tenant ID
    match event.type_.as_str() {
        "checkout.session.completed" => {
            process_checkout_session_completed(&event, &tenant_id).await?;
        }
        "payment_intent.succeeded" => {
            process_payment_intent_succeeded(&event, &tenant_id).await?;
        }
        "charge.refunded" => {
            process_charge_refunded(&event, &tenant_id).await?;
        }
        "charge.succeeded" | "charge.updated" => {
            process_charge_fee_update(&event, &tenant_id).await?;
        }
        _ => {
            log::info!("Unhandled event type: {}", event.type_);
        }
    }

    Ok(HttpResponse::Ok().json(json!({"received": true})))
}

/// Extract tenant ID and Payment Method Domain ID from event metadata
fn extract_tenant_and_payment_method_domain_id_from_metadata(
    event: &StripeEvent
) -> (Option<String>, Option<String>) {
    match &event.data.object {
        StripeEventObject::PaymentIntent(pi) => {
            let tenant_id = pi.metadata.get("tenantId")
                .or_else(|| pi.metadata.get("tenant_id"))
                .cloned();
            let payment_method_domain_id = pi.metadata.get("paymentMethodDomainId")
                .or_else(|| pi.metadata.get("payment_method_domain_id"))
                .cloned();
            (tenant_id, payment_method_domain_id)
        }
        StripeEventObject::CheckoutSession(cs) => {
            let tenant_id = cs.metadata.get("tenantId")
                .or_else(|| cs.metadata.get("tenant_id"))
                .cloned();
            let payment_method_domain_id = cs.metadata.get("paymentMethodDomainId")
                .or_else(|| cs.metadata.get("payment_method_domain_id"))
                .cloned();
            (tenant_id, payment_method_domain_id)
        }
        StripeEventObject::Charge(charge) => {
            // Charge events might reference PaymentIntent
            // Would need to fetch PaymentIntent to get metadata
            // For now, return None - signature verification will handle it
            (None, None)
        }
        _ => (None, None),
    }
}

/// Verify webhook signature and return the webhook secret that was used
fn verify_webhook_signature_and_get_secret(
    raw_body: &[u8],
    signature_header: &str
) -> Result<String, Error> {
    // Query all webhook secrets from payment_provider_config
    let all_secrets = payment_provider_config_repository
        .find_all_webhook_secrets()
        .await?;

    // Try each secret until one matches
    for secret_config in all_secrets {
        if verify_stripe_signature(raw_body, signature_header, &secret_config.webhook_secret_decrypted) {
            return Ok(secret_config.webhook_secret_decrypted);
        }
    }

    Err(Error::new(
        StatusCode::UNAUTHORIZED,
        "Webhook signature verification failed"
    ))
}

/// CRITICAL: Validate that the combination (tenantId, paymentMethodDomainId, webhookSecret) exists in database
async fn validate_triple_combination(
    tenant_id: &Option<String>,
    payment_method_domain_id: &Option<String>,
    webhook_secret: &str
) -> Result<ValidationResult, Error> {
    // Check if all three values are present
    let tenant_id = match tenant_id {
        Some(id) => id,
        None => {
            log::warn!("Tenant ID missing from metadata");
            return Ok(ValidationResult {
                is_valid: false,
                tenant_id: None,
            });
        }
    };

    let payment_method_domain_id = match payment_method_domain_id {
        Some(id) => id,
        None => {
            log::warn!("Payment Method Domain ID missing from metadata");
            return Ok(ValidationResult {
                is_valid: false,
                tenant_id: None,
            });
        }
    };

    // Query database for matching combination
    let config = payment_provider_config_repository
        .find_by_triple_combination(tenant_id, payment_method_domain_id, webhook_secret)
        .await?;

    if let Some(c) = config {
        // Combination exists - validation successful
        Ok(ValidationResult {
            is_valid: true,
            tenant_id: Some(c.tenant_id),
        })
    } else {
        // Combination doesn't exist - validation failed
        log::error!(
            "Triple combination not found: tenantId={}, paymentMethodDomainId={}, webhookSecret={}",
            tenant_id, payment_method_domain_id, webhook_secret
        );
        Ok(ValidationResult {
            is_valid: false,
            tenant_id: None,
        })
    }
}

struct ValidationResult {
    is_valid: bool,
    tenant_id: Option<String>,
}
```

**Backend Database Schema Update Required:**

**Option 1: Full DDL (for new tables)**

See `payment_provider_config_ddl.sql` for the complete table definition with all constraints.

**Option 2: Migration Script (for existing tables)**

See `payment_provider_config_migration.sql` for the migration script that:
1. Adds `payment_method_domain_id` column if it doesn't exist
2. Updates existing records with Payment Method Domain IDs
3. Adds the triple validation unique constraint
4. Creates an index for faster lookups
5. Adds documentation comments

**Quick Migration (if column already exists):**

```sql
-- Step 1: Update existing records with Payment Method Domain IDs
UPDATE payment_provider_config
SET payment_method_domain_id = 'pmd_1SWrMSK5BrggeAHMmHxUd9F2'
WHERE tenant_id = 'tenant_demo_001'
  AND provider_name = 'STRIPE'
  AND payment_method_domain_id IS NULL;

UPDATE payment_provider_config
SET payment_method_domain_id = 'pmd_1RuQeUK5BrggeAHMnD3Jejvh'
WHERE tenant_id = 'tenant_demo_002'
  AND provider_name = 'STRIPE'
  AND payment_method_domain_id IS NULL;

-- Step 2: Add triple validation unique constraint
ALTER TABLE payment_provider_config
ADD CONSTRAINT unique_tenant_payment_domain_webhook
UNIQUE (tenant_id, payment_method_domain_id, webhook_secret_encrypted);

-- Step 3: Create index for faster lookups (optional but recommended)
CREATE INDEX idx_payment_provider_config_triple_validation
ON payment_provider_config (tenant_id, payment_method_domain_id, webhook_secret_encrypted);
```

**Important Notes:**

- ⚠️ **Ensure all records have `payment_method_domain_id` set** before adding the constraint
- ⚠️ **Check for duplicate combinations** before adding the constraint (constraint will fail if duplicates exist)
- ✅ **Use the migration script** (`payment_provider_config_migration.sql`) for safe migration with validation checks

**Backend Repository Method Required:**

```rust
/// Find payment_provider_config by triple combination
async fn find_by_triple_combination(
    &self,
    tenant_id: &str,
    payment_method_domain_id: &str,
    webhook_secret: &str
) -> Result<Option<PaymentProviderConfig>, Error> {
    // Decrypt webhook_secret_encrypted for comparison
    // Query database for matching combination
    // Return matching config if found
}
```

**Benefits:**

1. ✅ **Simplest Implementation**: Just add `tenantId` to metadata - no database lookups needed
2. ✅ **Fast Tenant Identification**: Direct extraction from metadata - no need to try all webhook secrets
3. ✅ **Available in All Events**: Works for `checkout.session.completed`, `payment_intent.succeeded`, etc.
4. ✅ **Better Debugging**: Tenant ID visible in Stripe Dashboard and webhook logs
5. ✅ **Redundancy**: Provides backup tenant identification if signature verification fails

**Security Considerations:**

- ⚠️ **Always verify signature**: Metadata is not cryptographically protected - can be modified
- ✅ **Cross-validate**: Metadata tenant ID must match signature verification tenant ID
- ✅ **Trust signature over metadata**: If they don't match, use signature result
- ✅ **Log mismatches**: Alert on tenant ID mismatches for security monitoring

---

#### **Alternative Approach: Payment Method Domain ID in Metadata**

**Question**: Can we extract Payment Method Domain ID (`pmd_1SWrMSK5BrggeAHMmHxUd9F2`) from webhook events to identify tenant?

**Answer**: **Stripe does NOT automatically include Payment Method Domain ID in webhook events**, but you **CAN add it as custom metadata** when creating PaymentIntents/Checkout Sessions. However, **adding tenant ID directly is simpler** - Payment Method Domain ID requires an additional database lookup to map to tenant ID.

**How Payment Method Domain ID Works:**

1. **Each Payment Method Domain has a unique ID** (e.g., `pmd_1SWrMSK5BrggeAHMmHxUd9F2`)
2. **Each Payment Method Domain maps to a tenant** (via `payment_provider_config.payment_method_domain`)
3. **You can add Payment Method Domain ID to metadata** when creating PaymentIntents/Checkout Sessions
4. **Webhook events will include this metadata**, allowing tenant identification without signature verification

**Implementation Strategy:**

**Step 1: Store Payment Method Domain ID in Database**

Add `payment_method_domain_id` column to `payment_provider_config`:

```sql
ALTER TABLE payment_provider_config
ADD COLUMN payment_method_domain_id VARCHAR;

-- Update existing records with Payment Method Domain IDs from Stripe Dashboard
UPDATE payment_provider_config
SET payment_method_domain_id = 'pmd_1SWrMSK5BrggeAHMmHxUd9F2'
WHERE tenant_id = 'tenant_demo_001' AND payment_method_domain = 'www.mosc-temp.com';

UPDATE payment_provider_config
SET payment_method_domain_id = 'pmd_1RuQeUK5BrggeAHMnD3Jejvh'
WHERE tenant_id = 'tenant_demo_002' AND payment_method_domain = 'adwiise.com';
```

**Step 2: Add Payment Method Domain ID to Metadata When Creating PaymentIntents/Checkout Sessions**

**Frontend Implementation** (`src/lib/stripe/checkout.ts`):

```typescript
export async function createStripeCheckoutSession(
  cart: CartItem[],
  user: { email: string; userId?: string; phone?: string; ... },
  discountCodeId: number | null | undefined,
  eventId: number
) {
  // Get tenant ID and Payment Method Domain ID
  const tenantId = getTenantId();

  // Query backend for Payment Method Domain ID (or cache it)
  const paymentMethodDomainId = await getPaymentMethodDomainId(tenantId);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    // ... existing params ...
    metadata: {
      // ... existing metadata ...
      tenantId: tenantId, // Add tenant ID to metadata
      paymentMethodDomainId: paymentMethodDomainId, // Add Payment Method Domain ID
    },
    payment_intent_data: {
      metadata: {
        // ... existing metadata ...
        tenantId: tenantId, // Add tenant ID to PaymentIntent metadata
        paymentMethodDomainId: paymentMethodDomainId, // Add Payment Method Domain ID
      },
    },
  };

  // ... rest of function
}
```

**Frontend Implementation** (`src/app/api/stripe/payment-intent/route.ts`):

```typescript
// Create PaymentIntent with Payment Method Domain ID in metadata
const pi = await stripe().paymentIntents.create({
  amount: totalCents,
  currency: 'usd',
  receipt_email: email,
  automatic_payment_methods: { enabled: true },
  metadata: {
    // ... existing metadata ...
    tenantId: getTenantId(), // Add tenant ID
    paymentMethodDomainId: await getPaymentMethodDomainId(getTenantId()), // Add Payment Method Domain ID
  },
});
```

**Step 3: Extract Tenant ID from Webhook Events (Simpler Approach)**

**Backend Implementation** (Rust):

```rust
#[post("/api/webhooks/stripe")]
async fn handle_stripe_webhook(
    req: HttpRequest,
    body: web::Bytes,
) -> Result<HttpResponse, Error> {
    // 1. Extract signature and raw body
    let signature = req.headers().get("Stripe-Signature")?;
    let raw_body = body.as_ref();

    // 2. Parse Stripe event
    let event: StripeEvent = serde_json::from_slice(raw_body)?;

    // 3. Try to extract tenant ID directly from metadata (FAST PATH)
    let tenant_id_from_metadata = extract_tenant_id_from_metadata(&event);

    // 4. Verify signature and get tenant ID (SECURITY CHECK)
    let tenant_id_from_signature = verify_webhook_signature(raw_body, signature)?;

    // 5. Cross-validate: metadata tenant ID must match signature tenant ID
    let tenant_id = if let Some(metadata_tenant_id) = tenant_id_from_metadata {
        if metadata_tenant_id != tenant_id_from_signature {
            log::warn!(
                "Tenant ID mismatch: metadata says {}, signature says {}. Using signature.",
                metadata_tenant_id, tenant_id_from_signature
            );
            tenant_id_from_signature // Trust signature over metadata
        } else {
            log::info!("Tenant ID verified from both metadata and signature: {}", metadata_tenant_id);
            metadata_tenant_id // Both match - use metadata (faster)
        }
    } else {
        log::info!("No tenant ID in metadata, using signature verification: {}", tenant_id_from_signature);
        tenant_id_from_signature // No metadata - use signature verification
    };

    // 6. Process event with identified tenant ID
    match event.type_.as_str() {
        "checkout.session.completed" => {
            process_checkout_session_completed(&event, &tenant_id).await?;
        }
        "payment_intent.succeeded" => {
            process_payment_intent_succeeded(&event, &tenant_id).await?;
        }
        "charge.refunded" => {
            process_charge_refunded(&event, &tenant_id).await?;
        }
        "charge.succeeded" | "charge.updated" => {
            process_charge_fee_update(&event, &tenant_id).await?;
        }
        _ => {
            log::info!("Unhandled event type: {}", event.type_);
        }
    }

    Ok(HttpResponse::Ok().json(json!({"received": true})))
}

/// Extract tenant ID directly from event metadata (SIMPLER - no database lookup needed)
fn extract_tenant_id_from_metadata(event: &StripeEvent) -> Option<String> {
    match &event.data.object {
        StripeEventObject::PaymentIntent(pi) => {
            // Try both camelCase and snake_case variants
            pi.metadata.get("tenantId")
                .or_else(|| pi.metadata.get("tenant_id"))
                .cloned()
        }
        StripeEventObject::CheckoutSession(cs) => {
            // Try both camelCase and snake_case variants
            cs.metadata.get("tenantId")
                .or_else(|| cs.metadata.get("tenant_id"))
                .cloned()
        }
        StripeEventObject::Charge(charge) => {
            // Charge events might reference PaymentIntent
            // Would need to fetch PaymentIntent to get metadata
            // For now, return None - signature verification will handle it
            None
        }
        _ => None,
    }
}
```

**Alternative: Extract Tenant ID from Payment Method Domain ID** (if you prefer this approach):

```rust
/// Extract tenant ID from Payment Method Domain ID in event metadata
/// Requires database lookup to map Payment Method Domain ID to tenant ID
async fn extract_tenant_from_payment_method_domain_id(
    event: &StripeEvent
) -> Result<Option<String>, Error> {
    // Extract Payment Method Domain ID from event data
    let payment_method_domain_id = match &event.data.object {
        StripeEventObject::PaymentIntent(pi) => {
            pi.metadata.get("paymentMethodDomainId")
                .or_else(|| pi.metadata.get("payment_method_domain_id"))
        }
        StripeEventObject::CheckoutSession(cs) => {
            cs.metadata.get("paymentMethodDomainId")
                .or_else(|| cs.metadata.get("payment_method_domain_id"))
        }
        _ => None,
    };

    if let Some(pmd_id) = payment_method_domain_id {
        // Query payment_provider_config for tenant ID
        let config = payment_provider_config_repository
            .find_by_payment_method_domain_id(pmd_id)
            .await?;

        if let Some(c) = config {
            return Ok(Some(c.tenant_id));
        }
    }

    Ok(None)
}
```

**Benefits of Using Tenant ID Metadata (Recommended Approach):**

1. ✅ **Simplest Implementation**: Just add `tenantId` to metadata - no database lookups needed
2. ✅ **Fast Tenant Identification**: Direct extraction from metadata - no need to try all webhook secrets
3. ✅ **Available in All Events**: Works for `checkout.session.completed`, `payment_intent.succeeded`, etc.
4. ✅ **Better Debugging**: Tenant ID visible in Stripe Dashboard and webhook logs
5. ✅ **Redundancy**: Provides backup tenant identification if signature verification fails
6. ✅ **Additional Validation**: Can cross-validate metadata tenant ID against signature verification

**Benefits of Using Payment Method Domain ID Metadata (Alternative):**

1. **Faster Tenant Identification**: No need to try all webhook secrets - direct lookup from metadata
2. **Additional Validation**: Can cross-validate metadata tenant ID against signature verification
3. **Better Debugging**: Payment Method Domain ID in metadata helps trace which domain initiated payment
4. **Redundancy**: Provides backup tenant identification if signature verification fails

**Limitations:**

1. **Requires Frontend Changes**: Must add tenant ID (or Payment Method Domain ID) to metadata when creating PaymentIntents/Checkout Sessions
2. **Metadata Can Be Modified**: Unlike signature verification, metadata is not cryptographically protected
3. **Not Available for All Events**: Some events (like `charge.succeeded`) might not have PaymentIntent metadata directly accessible
4. **Still Requires Signature Verification**: Should always verify signature for security, even if metadata is present

**Recommended Approach: Hybrid Method**

Use **both** Payment Method Domain ID metadata **and** signature verification:

1. **Primary**: Extract tenant ID from Payment Method Domain ID metadata (fast)
2. **Validation**: Verify signature matches the same tenant (secure)
3. **Fallback**: If metadata not available, use signature verification only (existing logic)

**Security Considerations:**

- ✅ **Always verify signature** - even if metadata is present
- ✅ **Cross-validate** - metadata tenant ID must match signature verification tenant ID
- ✅ **Trust signature over metadata** - if they don't match, use signature result
- ⚠️ **Metadata is not secure** - can be modified by frontend, so signature verification is still required

### 2. Frontend API Requests (`POST /api/event-ticket-transactions`, etc.)

**How Backend Identifies Tenant:**

The backend extracts tenant ID using **priority order** (most secure first):

#### **Priority 1: Domain/Subdomain (Most Secure - Cannot Be Spoofed)**

**Payment Method Domain Scenario:**
- Each Stripe Payment Method Domain subdomain corresponds to a specific tenant
- Example: `tenant1.payments.example.com` → `tenant_demo_001`
- Backend extracts domain from `Host` or `Origin` header
- Maps domain to tenant ID via `tenant_domain_mapping` table or `payment_provider_config.payment_method_domain`

**Why This is Most Secure:**
- Browser automatically sets `Host` and `Origin` headers based on actual domain
- JavaScript **cannot modify** these headers (browser security policy)
- Each Payment Method Domain subdomain is configured in Stripe Dashboard per tenant
- Backend can reliably map domain → tenant ID

**Implementation:**
```rust
// Extract from Host header
let host = req.headers().get("Host")?.to_str()?;
// Example: "tenant1.payments.example.com"

// Query domain-to-tenant mapping
let tenant_id = tenant_domain_mapping_repository
    .find_by_domain_pattern(host)
    .await?
    .map(|m| m.tenant_id);

// Or query payment_provider_config
let tenant_id = payment_provider_config_repository
    .find_by_payment_method_domain(host)
    .await?
    .map(|config| config.tenant_id);
```

#### **Priority 2: X-Tenant-ID Header (Sent by Frontend)**

**How It Works:**
- Frontend sends `X-Tenant-ID: tenant_demo_001` header in all API calls
- Frontend gets tenant ID from `NEXT_PUBLIC_TENANT_ID` environment variable
- Each deployment/environment has its own `NEXT_PUBLIC_TENANT_ID` value

**CRITICAL Validation:**
- Backend should **validate** `X-Tenant-ID` header against domain-based tenant ID
- If domain-based tenant ID is available and doesn't match header, **reject the request**
- This prevents frontend from sending wrong tenant ID

**Implementation:**
```rust
// Extract X-Tenant-ID header
let header_tenant_id = req.headers().get("X-Tenant-ID")?.to_str()?;

// If domain-based tenant ID is available, validate match
if let Some(domain_tenant_id) = extract_tenant_from_domain(host) {
    if header_tenant_id != domain_tenant_id {
        return Err(WebError::Forbidden(
            format!("Tenant ID mismatch: header={}, domain={}",
                header_tenant_id, domain_tenant_id)
        ));
    }
}

// Use validated tenant ID
let tenant_id = domain_tenant_id.unwrap_or(header_tenant_id);
```

#### **Priority 3: JWT Token Claims (If Available)**

**How It Works:**
- JWT token may contain `tenant_id` claim
- Backend validates JWT signature and extracts claim
- Used as additional validation layer

**Implementation:**
```rust
let token = extract_jwt_from_header(req)?;
let claims = decode_jwt_token(token)?;
let jwt_tenant_id = claims.get("tenant_id");

// Validate JWT tenant ID matches domain/header tenant ID
if let Some(jwt_tenant) = jwt_tenant_id {
    if jwt_tenant != validated_tenant_id {
        return Err(WebError::Forbidden("JWT tenant ID mismatch"));
    }
}
```

### Complete Example: Frontend API Call Flow

**Scenario**: User on `tenant1.payments.example.com` makes payment, frontend calls `POST /api/event-ticket-transactions`

**Request Headers:**
```
Host: tenant1.payments.example.com
Origin: https://tenant1.payments.example.com
X-Tenant-ID: tenant_demo_001
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Backend Processing:**
```rust
1. Extract domain from Host header: "tenant1.payments.example.com"
2. Query tenant_domain_mapping table:
   SELECT tenant_id FROM tenant_domain_mapping
   WHERE domain_pattern = 'tenant1.payments.example.com'
   → Found: tenant_demo_001
3. Extract X-Tenant-ID header: "tenant_demo_001"
4. Validate: domain_tenant_id (tenant_demo_001) == header_tenant_id (tenant_demo_001) ✅
5. Use tenant_demo_001 for transaction creation
6. Reject if tenant ID in request body doesn't match tenant_demo_001
```

### Payment Method Domain Configuration

**Stripe Dashboard Setup:**
- Each tenant has its own Payment Method Domain subdomain
- Example:
  - Tenant 1: `tenant1.payments.example.com` → Webhook Secret: `whsec_xxx`
  - Tenant 2: `tenant2.payments.example.com` → Webhook Secret: `whsec_yyy`

**Backend Database Mapping:**

**Option 1: Use `payment_provider_config.payment_method_domain`**
```sql
ALTER TABLE payment_provider_config
ADD COLUMN payment_method_domain VARCHAR;

UPDATE payment_provider_config
SET payment_method_domain = 'tenant1.payments.example.com'
WHERE tenant_id = 'tenant_demo_001';

UPDATE payment_provider_config
SET payment_method_domain = 'tenant2.payments.example.com'
WHERE tenant_id = 'tenant_demo_002';
```

**Option 2: Create `tenant_domain_mapping` Table**
```sql
CREATE TABLE tenant_domain_mapping (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR NOT NULL,
    domain_pattern VARCHAR NOT NULL,
    payment_method_domain VARCHAR,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(domain_pattern, tenant_id)
);

INSERT INTO tenant_domain_mapping (tenant_id, domain_pattern, payment_method_domain, is_active)
VALUES
    ('tenant_demo_001', 'tenant1.payments.example.com', 'tenant1.payments.example.com', true),
    ('tenant_demo_002', 'tenant2.payments.example.com', 'tenant2.payments.example.com', true);
```

### Summary: Tenant Identification Methods

| Request Source | Tenant Identification Method | Security Level |
|---------------|----------------------------|----------------|
| **Webhook** (`POST /api/webhooks/stripe`) | Webhook signature verification against `payment_provider_config` webhook secrets | ⭐⭐⭐⭐⭐ Highest (Cryptographic) |
| **Frontend API** (`POST /api/event-ticket-transactions`) | Domain/subdomain from `Host`/`Origin` header | ⭐⭐⭐⭐⭐ Highest (Cannot be spoofed) |
| **Frontend API** (Fallback) | `X-Tenant-ID` header (validated against domain) | ⭐⭐⭐⭐ High (Validated) |
| **Frontend API** (Additional) | JWT token claims (if available) | ⭐⭐⭐⭐ High (Cryptographic) |

### Critical Security Rules

1. **NEVER trust tenant ID from request body** - Always extract from headers/domain/JWT
2. **Always validate `X-Tenant-ID` header against domain** - If domain mapping exists, they must match
3. **Reject requests with mismatched tenant IDs** - Return `403 Forbidden` if validation fails
4. **Log all tenant identification decisions** - For audit trail and debugging
5. **Use domain-based identification as primary** - Most secure, cannot be spoofed

### Answer to Your Specific Question

**Q: "How do the backend APIs differentiate the actual initiator of the request when receiving requests for POST /api/event-ticket-transactions, GET /api/event-ticket-transactions, POST /api/event-ticket-transaction-items/bulk?"**

**A: The backend identifies the tenant initiator through:**

1. **Domain/Subdomain Extraction** (Primary):
   - Extracts domain from `Host` header: `tenant1.payments.example.com`
   - Maps domain to tenant ID via `tenant_domain_mapping` table or `payment_provider_config.payment_method_domain`
   - **This is the Payment Method Domain subdomain** configured in Stripe Dashboard

2. **X-Tenant-ID Header Validation** (Secondary):
   - Frontend sends `X-Tenant-ID` header with tenant ID from `NEXT_PUBLIC_TENANT_ID`
   - Backend validates this matches domain-based tenant ID
   - If mismatch, request is rejected

3. **JWT Token Claims** (Tertiary):
   - If JWT contains tenant ID claim, validate it matches domain/header tenant ID

**The backend NEVER uses tenant ID from request body or query parameters. It always extracts from authenticated request context (domain, headers, JWT).**

