# Backend Compilation Fixes - StripePaymentAdapter.java

## Overview
This document contains the exact code fixes needed to resolve compilation errors in `StripePaymentAdapter.java`.

## Error 1: Missing ObjectMapper Import

**File:** `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`

**Location:** Top of file (around line 1-20, with other imports)

**Fix:** Add this import statement:

```java
import com.fasterxml.jackson.databind.ObjectMapper;
```

---

## Error 2: Lambda Expression Variables Must Be Final

**File:** `src/main/java/com/nextjstemplate/service/payment/adapter/StripePaymentAdapter.java`

**Problem:** Variables used in lambda expressions must be `final` or effectively final. The errors occur at lines 744, 754, 755, 757, 820, 830, 831, 833.

**Solution:** Create `final` copies of variables before using them in lambdas or method calls that might use lambdas internally.

---

## Fix 1: Polling Fallback Section (getStatus method, around line 350-408)

**Find this code pattern:**
```java
// CRITICAL: Store customer email from PaymentIntent if payment succeeded
if ("SUCCEEDED".equals(mappedStatus)) {
    String customerEmail = null;
    if (paymentIntent.getReceiptEmail() != null && !paymentIntent.getReceiptEmail().isEmpty()) {
        customerEmail = paymentIntent.getReceiptEmail();
    }

    if (customerEmail != null && !customerEmail.isEmpty()) {
        try {
            Map<String, Object> metadataMap = new HashMap<>();
            if (transaction.getMetadata() != null && !transaction.getMetadata().isEmpty()) {
                try {
                    metadataMap = objectMapper.readValue(transaction.getMetadata(), Map.class);
                } catch (Exception e) {
                    log.debug("Failed to parse existing metadata, creating new metadata map");
                }
            }
            metadataMap.put("email", customerEmail);
            metadataMap.put("customerEmail", customerEmail);
            transaction.setMetadata(objectMapper.writeValueAsString(metadataMap));
            log.info("Stored customer email {} in transaction {} metadata (from polling)", customerEmail, transactionId);
        } catch (Exception e) {
            log.warn("Failed to store customer email in transaction metadata: {}", e.getMessage());
        }
    }
}

transactionRepository.save(transaction);
log.info("Updated transaction {} status from {} to {}", transactionId, oldStatus, mappedStatus);

// CRITICAL: If payment just succeeded and it's a ticket purchase, trigger ticket generation
if ("SUCCEEDED".equals(mappedStatus) && !"SUCCEEDED".equals(oldStatus)) {
    Long eventId = transaction.getEvent() != null ? transaction.getEvent().getId() : null;
    if (eventId != null) {
        log.info("Payment {} just succeeded via polling, triggering ticket generation (webhook fallback)", transactionId);
        try {
            ticketGenerationService.processTicketGenerationSync(transaction, stripePaymentIntentId);
            log.info("Successfully processed ticket generation for transaction {} via polling fallback", transactionId);
        } catch (Exception e) {
            log.error("Failed to process ticket generation for transaction {} via polling fallback: {}",
                transactionId, e.getMessage(), e);
        }
    }
}
```

**Replace with:**
```java
// CRITICAL: Store customer email from PaymentIntent if payment succeeded
if ("SUCCEEDED".equals(mappedStatus)) {
    // Create final copy of customerEmail before using in lambda
    final String customerEmailFinal;
    if (paymentIntent.getReceiptEmail() != null && !paymentIntent.getReceiptEmail().isEmpty()) {
        customerEmailFinal = paymentIntent.getReceiptEmail();
    } else {
        customerEmailFinal = null;
    }

    if (customerEmailFinal != null && !customerEmailFinal.isEmpty()) {
        try {
            Map<String, Object> metadataMap = new HashMap<>();
            if (transaction.getMetadata() != null && !transaction.getMetadata().isEmpty()) {
                try {
                    metadataMap = objectMapper.readValue(transaction.getMetadata(), Map.class);
                } catch (Exception e) {
                    log.debug("Failed to parse existing metadata, creating new metadata map");
                }
            }
            metadataMap.put("email", customerEmailFinal);
            metadataMap.put("customerEmail", customerEmailFinal);
            transaction.setMetadata(objectMapper.writeValueAsString(metadataMap));
            log.info("Stored customer email {} in transaction {} metadata (from polling)", customerEmailFinal, transactionId);
        } catch (Exception e) {
            log.warn("Failed to store customer email in transaction metadata: {}", e.getMessage());
        }
    }

    // Create final copies for lambda usage
    final UserPaymentTransaction transactionFinal = transaction;
    final String stripePaymentIntentIdFinal = stripePaymentIntentId;

    transactionRepository.save(transaction);
    log.info("Updated transaction {} status from {} to {}", transactionId, oldStatus, mappedStatus);

    // CRITICAL: If payment just succeeded and it's a ticket purchase, trigger ticket generation
    if ("SUCCEEDED".equals(mappedStatus) && !"SUCCEEDED".equals(oldStatus)) {
        // Check if this is a ticket purchase (has eventId)
        Long eventId = transactionFinal.getEvent() != null ? transactionFinal.getEvent().getId() : null;
        if (eventId != null) {
            log.info("Payment {} just succeeded via polling, triggering ticket generation (webhook fallback)", transactionId);
            try {
                ticketGenerationService.processTicketGenerationSync(transactionFinal, stripePaymentIntentIdFinal);
                log.info("Successfully processed ticket generation for transaction {} via polling fallback", transactionId);
            } catch (Exception e) {
                log.error("Failed to process ticket generation for transaction {} via polling fallback: {}",
                    transactionId, e.getMessage(), e);
                // Don't fail status check - ticket generation can be retried
            }
        } else {
            log.debug("Payment {} succeeded but is not a ticket purchase (no eventId), skipping ticket generation", transactionId);
        }
    }
} else {
    transactionRepository.save(transaction);
    log.info("Updated transaction {} status from {} to {}", transactionId, oldStatus, mappedStatus);
}
```

---

## Fix 2: Webhook Handler Section (handlePaymentIntentSucceeded method, around line 656-786)

**Find this code pattern:**
```java
// CRITICAL: Store customer email in transaction metadata if available
if (customerEmail != null && !customerEmail.isEmpty()) {
    try {
        Map<String, Object> metadata = new HashMap<>();
        if (transaction.getMetadata() != null && !transaction.getMetadata().isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                metadata = objectMapper.readValue(transaction.getMetadata(), Map.class);
            } catch (Exception e) {
                log.debug("Failed to parse existing metadata, creating new metadata map");
            }
        }
        metadata.put("email", customerEmail);
        metadata.put("customerEmail", customerEmail);
        transaction.setMetadata(objectMapper.writeValueAsString(metadata));
        log.info("Stored customer email {} in transaction {} metadata", customerEmail, transaction.getId());
    } catch (Exception e) {
        log.warn("Failed to store customer email in transaction metadata: {}", e.getMessage());
    }
}

// Save updated transaction
transactionRepository.save(transaction);
log.info("Updated transaction {} status to SUCCEEDED", transaction.getId());

// CRITICAL: Process ticket generation synchronously
try {
    ticketGenerationService.processTicketGenerationSync(transaction, stripePaymentIntentId);
    log.info("Synchronously processed ticket generation for transaction {}", transaction.getId());
} catch (Exception e) {
    log.error("Failed to process ticket generation synchronously for transaction {}: {}",
        transaction.getId(), e.getMessage(), e);
}
```

**Replace with:**
```java
// CRITICAL: Store customer email in transaction metadata if available
// Extract email and create final copy
final String customerEmailFinal;
if (customerEmail != null && !customerEmail.isEmpty()) {
    customerEmailFinal = customerEmail;
} else {
    customerEmailFinal = null;
}

if (customerEmailFinal != null && !customerEmailFinal.isEmpty()) {
    try {
        Map<String, Object> metadata = new HashMap<>();
        if (transaction.getMetadata() != null && !transaction.getMetadata().isEmpty()) {
            try {
                metadata = objectMapper.readValue(transaction.getMetadata(), Map.class);
            } catch (Exception e) {
                log.debug("Failed to parse existing metadata, creating new metadata map");
            }
        }
        metadata.put("email", customerEmailFinal);
        metadata.put("customerEmail", customerEmailFinal);
        transaction.setMetadata(objectMapper.writeValueAsString(metadata));
        log.info("Stored customer email {} in transaction {} metadata", customerEmailFinal, transaction.getId());
    } catch (Exception e) {
        log.warn("Failed to store customer email in transaction metadata: {}", e.getMessage());
    }
}

// Create final copies for lambda usage
final UserPaymentTransaction transactionFinal = transaction;
final String stripePaymentIntentIdFinal = stripePaymentIntentId;

// Save updated transaction
transactionRepository.save(transaction);
log.info("Updated transaction {} status to SUCCEEDED", transaction.getId());

// CRITICAL: Process ticket generation synchronously
try {
    ticketGenerationService.processTicketGenerationSync(transactionFinal, stripePaymentIntentIdFinal);
    log.info("Synchronously processed ticket generation for transaction {}", transaction.getId());
} catch (Exception e) {
    log.error("Failed to process ticket generation synchronously for transaction {}: {}",
        transaction.getId(), e.getMessage(), e);
    // Continue even if ticket generation fails - payment is still successful
}
```

---

## Fix 3: Fallback Path in Webhook Handler (around line 768-786)

**Find this code pattern:**
```java
// Similar code pattern as above for the fallback path
// ... (same pattern as Fix 2)
```

**Apply the same fix pattern:**
- Create `final String customerEmailFinal` before using it
- Create `final UserPaymentTransaction transactionFinal = transaction`
- Create `final String stripePaymentIntentIdFinal = stripePaymentIntentId`
- Use the final copies in method calls

---

## Summary of Changes

1. **Add import:** `import com.fasterxml.jackson.databind.ObjectMapper;`

2. **For all sections that use variables in lambdas:**
   - Create `final` copies of variables: `final String customerEmailFinal = customerEmail;`
   - Create `final UserPaymentTransaction transactionFinal = transaction;`
   - Create `final String stripePaymentIntentIdFinal = stripePaymentIntentId;`
   - Use the final copies in method calls: `ticketGenerationService.processTicketGenerationSync(transactionFinal, stripePaymentIntentIdFinal);`

3. **Key principle:** Any variable that might be used in a lambda expression (or passed to methods that use lambdas internally) must be `final` or effectively final.

---

## Testing After Fix

1. Compile the backend: `mvn clean compile`
2. Verify no compilation errors
3. Test payment flow to ensure ticket generation still works correctly

---

## Notes

- The `final` keyword doesn't prevent modification of object contents (like `transaction.setStatus()`), it only prevents reassignment of the variable itself
- Creating final copies ensures the compiler can safely capture variable values for lambda expressions
- This is a Java language requirement for lambda expressions

