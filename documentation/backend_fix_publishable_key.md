# Backend Fix: Include `publishableKey` in PaymentSessionResponse

## Problem Statement

The frontend payment component (`UniversalPaymentCheckout`) requires the Stripe `publishableKey` to initialize Stripe.js and display payment options (Apple Pay, Google Pay, credit card forms). Currently, the backend is either:
1. Not including `publishableKey` in the `PaymentSessionResponse`, OR
2. Using a different field name (`publicKey` instead of `publishableKey`)

The frontend TypeScript interface expects:
```typescript
interface PaymentSessionResponse {
  transactionId: string;
  providerType: PaymentProviderType;
  clientSecret?: string;
  publishableKey?: string;  // ← REQUIRED for Stripe Elements
  sessionUrl?: string;
  // ... other fields
}
```

## Required Changes

### 1. Update PaymentSessionResponse DTO

**File:** `PaymentSessionResponse.java` (or equivalent DTO class)

**Change:** Ensure the DTO has a `publishableKey` field (not `publicKey`)

**Example:**
```java
@Data
@Builder
public class PaymentSessionResponse {
    private String transactionId;
    private PaymentProviderType providerType;
    private String clientSecret;  // For Stripe PaymentIntent
    private String publishableKey; // ← ADD THIS FIELD (or rename from publicKey)
    private String sessionUrl;     // For hosted checkouts
    private String paymentMethod;
    private Map<String, Object> metadata;
    private String expiresAt;

    // If you have a from() method or builder pattern:
    public static PaymentSessionResponse from(PaymentSession session) {
        return PaymentSessionResponse.builder()
            .transactionId(session.getTransactionId())
            .providerType(session.getProviderType())
            .clientSecret(session.getClientSecret())
            .publishableKey(session.getPublishableKey()) // ← Use publishableKey
            .sessionUrl(session.getSessionUrl())
            .paymentMethod(session.getPaymentMethod())
            .metadata(session.getMetadata())
            .expiresAt(session.getExpiresAt())
            .build();
    }
}
```

### 2. Update StripePaymentAdapter.initialize() Method

**File:** `StripePaymentAdapter.java` (or equivalent adapter class)

**Location:** In the `initializePayment()` method where `PaymentSession` is built

**Current Code (from documentation):**
```java
return PaymentSession.builder()
    .transactionId(transaction.getId())
    .providerType(PaymentProviderType.STRIPE)
    .clientSecret(paymentIntent.getClientSecret())
    .publicKey(config.getPublicKey())  // ← CHANGE THIS LINE
    .metadata(Map.of(...))
    .build();
```

**Change To:**
```java
return PaymentSession.builder()
    .transactionId(transaction.getId())
    .providerType(PaymentProviderType.STRIPE)
    .clientSecret(paymentIntent.getClientSecret())
    .publishableKey(config.getPublishableKey()) // ← CHANGE: publicKey → publishableKey
    .metadata(Map.of(
        "payment_intent_id", paymentIntent.getId(),
        "supports_wallets", config.isSupportsWallets(),
        "supports_link", true,
        "amount_cents", amountCents
    ))
    .build();
```

**Note:** If your `PaymentProviderConfig` class uses `getPublicKey()` method, you can either:
- Keep `config.getPublicKey()` but ensure the DTO field is named `publishableKey`, OR
- Rename the method to `getPublishableKey()` for consistency

### 3. Update PaymentSession Domain Object (if separate from DTO)

**File:** `PaymentSession.java` (domain object)

**Change:** Ensure the domain object has `publishableKey` field and getter/setter

```java
@Data
@Builder
public class PaymentSession {
    private String transactionId;
    private PaymentProviderType providerType;
    private String clientSecret;
    private String publishableKey; // ← Ensure this field exists
    private String sessionUrl;
    private String paymentMethod;
    private Map<String, Object> metadata;
    private String expiresAt;
}
```

### 4. Verify PaymentProviderConfig has Publishable Key

**File:** `PaymentProviderConfig.java` or `PaymentProviderConfigService.java`

**Ensure:** The config can retrieve the publishable key from the database

```java
// In PaymentProviderConfig entity or service:
public String getPublishableKey() {
    // Return the publishable_key column from payment_provider_config table
    return this.publishableKey; // or decrypt if encrypted
}
```

## Expected JSON Response Format

After the fix, the `/api/payments/initialize` endpoint should return:

```json
{
  "transactionId": "4357",
  "providerType": "STRIPE",
  "clientSecret": "pi_xxx_secret_xxx",
  "publishableKey": "pk_test_***REDACTED***",
  "paymentMethod": "card",
  "metadata": {
    "payment_intent_id": "pi_xxx",
    "supports_wallets": true,
    "supports_link": true,
    "amount_cents": 2000
  },
  "expiresAt": "2025-11-14T03:45:18Z"
}
```

## Why This Is Important

1. **Multi-Tenant Support**: Each tenant can have different Stripe accounts with different publishable keys
2. **Domain-Agnostic Architecture**: Backend selects the correct provider/key, frontend doesn't need to know which Stripe account to use
3. **Security**: Publishable keys are safe to expose (unlike secret keys), but should come from backend for tenant isolation
4. **Frontend Requirements**: Stripe.js requires the publishable key to initialize payment elements

## Testing

After implementing the fix:

1. **Test the API endpoint:**
   ```bash
   POST /api/payments/initialize
   (Note: Frontend calls this via proxy: POST /api/proxy/payments/initialize)
   Content-Type: application/json

   {
     "paymentUseCase": "TICKET_SALE",
     "amount": 20.00,
     "currency": "USD",
     "items": [...],
     "customerEmail": "test@example.com"
   }
   ```

2. **Verify response includes `publishableKey`:**
   - Check that `publishableKey` field exists in JSON response
   - Verify it matches the `publishable_key` value from `payment_provider_config` table for the tenant
   - Ensure it starts with `pk_test_` (test mode) or `pk_live_` (production)

3. **Frontend Integration:**
   - The frontend will automatically use `publishableKey` from the response
   - If missing, frontend falls back to environment variable (development only)
   - Payment options (Apple Pay, Google Pay, credit card) should display correctly

## Files to Modify (Summary)

1. ✅ `PaymentSessionResponse.java` - Add/rename `publishableKey` field
2. ✅ `StripePaymentAdapter.java` - Change `.publicKey()` → `.publishableKey()` in builder
3. ✅ `PaymentSession.java` (if separate) - Ensure `publishableKey` field exists
4. ✅ `PaymentProviderConfig.java` - Verify `getPublishableKey()` method exists

## Additional Notes

- **Field Name Consistency**: Use `publishableKey` (camelCase) in Java, which will serialize to `publishableKey` in JSON (matching frontend TypeScript interface)
- **Backward Compatibility**: If you currently use `publicKey`, you can add both fields temporarily during migration, but standardize on `publishableKey`
- **Other Providers**: When implementing PayPal, Revolut, etc., use `publishableKey` for consistency (even if PayPal calls it "client ID")

## Questions?

If the backend team needs clarification:
- Frontend expects: `publishableKey` (camelCase) in JSON response
- Source: `payment_provider_config.publishable_key` column (or `config.getPublishableKey()`)
- Required for: Stripe Elements initialization (Apple Pay, Google Pay, credit card forms)

