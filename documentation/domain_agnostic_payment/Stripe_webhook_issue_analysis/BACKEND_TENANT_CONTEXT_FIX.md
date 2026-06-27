# Backend Tenant Context Fix - Triple Validation

## Problem

The backend's `PaymentProviderValidationService.validateTripleCombination()` is using the tenant ID from `TenantContextFilter` (default tenant: `tenant_demo_001`) instead of the `tenantId` from the DTO (`tenant_demo_002`).

### Evidence from Logs

**Frontend sends:**
```json
{
  "tenantId": "tenant_demo_002",
  "paymentMethodDomainId": "pmd_1SWrMSK5BrggeAHMmHxUd9F2",
  ...
}
```

**Backend TenantContextFilter:**
```
2025-11-30T22:12:02.400-05:00 DEBUG: No tenant ID found in request
2025-11-30T22:12:02.401-05:00 DEBUG: Exit: getDefaultTenant() with result = tenant_demo_001
2025-11-30T22:12:02.401-05:00 DEBUG: Using default tenant: tenant_demo_001
```

**Backend Validation Error:**
```
2025-11-30T22:12:02.725-05:00 ERROR: Triple validation failed: No payment_provider_config found for tenantId=tenant_demo_001, paymentMethodDomainId=pmd_1SWrMSK5BrggeAHMmHxUd9F2
```

**Backend Error Message:**
```
Invalid tenant/payment method domain combination: tenantId=tenant_demo_001, paymentMethodDomainId=pmd_1SWrMSK5BrggeAHMmHxUd9F2
```

## Root Cause

The backend's `PaymentProviderValidationService.validateTripleCombination()` method is likely reading the tenant ID from the tenant context (set by `TenantContextFilter`) instead of using the `tenantId` parameter passed to it.

## Solution

**CRITICAL**: The `validateTripleCombination()` method **MUST** use the `tenantId` parameter passed to it, **NOT** the tenant ID from the tenant context.

### Backend Code Fix

**Current Implementation (WRONG):**
```java
@Transactional
public void validateTripleCombination(String tenantId, String paymentMethodDomainId, String entityName) {
    // WRONG: Reading from tenant context instead of parameter
    String actualTenantId = TenantContext.getCurrentTenant(); // This returns tenant_demo_001 (default)

    // Query database with wrong tenant ID
    Optional<PaymentProviderConfig> config = paymentProviderConfigRepository
        .findByTenantIdAndPaymentMethodDomainId(actualTenantId, paymentMethodDomainId);

    if (config.isEmpty()) {
        throw new BadRequestAlertException(
            "Invalid tenant/payment method domain combination: tenantId=" + actualTenantId +
            ", paymentMethodDomainId=" + paymentMethodDomainId,
            entityName,
            "error.tripleValidationFailed"
        );
    }
}
```

**Correct Implementation:**
```java
@Transactional
public void validateTripleCombination(String tenantId, String paymentMethodDomainId, String entityName) {
    // CRITICAL: Use the tenantId parameter from DTO, NOT from tenant context
    // The tenantId parameter comes from the DTO and represents the actual tenant making the request
    if (tenantId == null || tenantId.isEmpty()) {
        throw new BadRequestAlertException(
            "Tenant ID is required for triple validation",
            entityName,
            "error.missingTenantId"
        );
    }

    if (paymentMethodDomainId == null || paymentMethodDomainId.isEmpty()) {
        throw new BadRequestAlertException(
            "Payment Method Domain ID is required for triple validation",
            entityName,
            "error.missingPaymentMethodDomainId"
        );
    }

    // Query database with tenantId from DTO (NOT from tenant context)
    Optional<PaymentProviderConfig> config = paymentProviderConfigRepository
        .findByTenantIdAndPaymentMethodDomainId(tenantId, paymentMethodDomainId);

    if (config.isEmpty()) {
        log.error("Triple validation failed: No payment_provider_config found for tenantId={}, paymentMethodDomainId={}",
            tenantId, paymentMethodDomainId);
        throw new BadRequestAlertException(
            "Invalid tenant/payment method domain combination: tenantId=" + tenantId +
            ", paymentMethodDomainId=" + paymentMethodDomainId,
            entityName,
            "error.tripleValidationFailed"
        );
    }

    // Optional: Verify webhook secret if needed (for webhook requests)
    // For frontend API calls, webhook secret validation is not required
    log.debug("Triple validation passed: tenantId={}, paymentMethodDomainId={}",
        tenantId, paymentMethodDomainId);
}
```

### EventTicketTransactionResource Fix

**Current Implementation:**
```java
@PostMapping("")
public ResponseEntity<EventTicketTransactionDTO> createEventTicketTransaction(
    @Valid @RequestBody EventTicketTransactionDTO eventTicketTransactionDTO
) throws URISyntaxException {
    log.debug("REST request to save EventTicketTransaction : {}", eventTicketTransactionDTO);

    // CRITICAL: Validate triple combination (tenantId, paymentMethodDomainId, webhookSecret) at the beginning
    String tenantId = eventTicketTransactionDTO.getTenantId();
    String paymentMethodDomainId = eventTicketTransactionDTO.getPaymentMethodDomainId();
    paymentProviderValidationService.validateTripleCombination(tenantId, paymentMethodDomainId, ENTITY_NAME);

    // ... rest of method
}
```

**This is CORRECT** - the code is passing `tenantId` from the DTO to the validation service. The issue is in the validation service itself.

## Verification Steps

1. **Check `PaymentProviderValidationService.validateTripleCombination()` implementation:**
   - Ensure it uses the `tenantId` parameter, not `TenantContext.getCurrentTenant()`
   - Add logging to show which tenant ID is being used

2. **Add Debug Logging:**
```java
@Transactional
public void validateTripleCombination(String tenantId, String paymentMethodDomainId, String entityName) {
    log.debug("Enter: validateTripleCombination() with tenantId={}, paymentMethodDomainId={}, entityName={}",
        tenantId, paymentMethodDomainId, entityName);

    // Log tenant context for comparison (should NOT be used)
    String contextTenantId = TenantContext.getCurrentTenant();
    log.debug("Tenant context tenant ID: {}, DTO tenant ID: {}", contextTenantId, tenantId);

    // CRITICAL: Use tenantId parameter, NOT contextTenantId
    if (tenantId == null || tenantId.isEmpty()) {
        throw new BadRequestAlertException(
            "Tenant ID is required for triple validation",
            entityName,
            "error.missingTenantId"
        );
    }

    // ... rest of validation
}
```

3. **Test with Frontend:**
   - Frontend sends: `tenantId: 'tenant_demo_002'`, `paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2'`
   - Backend should validate with `tenant_demo_002` (from DTO), not `tenant_demo_001` (from context)
   - Backend should query: `findByTenantIdAndPaymentMethodDomainId('tenant_demo_002', 'pmd_1SWrMSK5BrggeAHMmHxUd9F2')`

## Summary

**Problem**: Backend validation service is using tenant ID from `TenantContextFilter` (default: `tenant_demo_001`) instead of tenant ID from DTO (`tenant_demo_002`).

**Solution**: Ensure `PaymentProviderValidationService.validateTripleCombination()` uses the `tenantId` parameter passed to it, not `TenantContext.getCurrentTenant()`.

**Key Point**: The `tenantId` parameter in `validateTripleCombination()` comes from the DTO and represents the actual tenant making the request. The tenant context is set by `TenantContextFilter` based on request headers/query params and defaults to `tenant_demo_001` if not found. For triple validation, we MUST use the DTO's tenant ID, not the context tenant ID.

