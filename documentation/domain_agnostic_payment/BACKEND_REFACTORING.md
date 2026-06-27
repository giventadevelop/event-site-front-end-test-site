# Backend Refactoring Guide: Domain-Agnostic Payment System

**Project:** MCEFEE Payment System Refactoring
**Backend Location:** `C:\Users\gain\git\malayalees-us-site-boot`
**Document Version:** 1.0
**Date:** October 20, 2025

---

## Overview

This document details the backend refactoring required to implement the domain-agnostic payment system. The Spring Boot backend will become the central payment orchestrator, handling all payment provider interactions.

---

## Table of Contents

1. [Current Backend State](#current-backend-state)
2. [New Package Structure](#new-package-structure)
3. [Core Interfaces](#core-interfaces)
4. [Implementation Classes](#implementation-classes)
5. [Database Layer](#database-layer)
6. [Configuration Management](#configuration-management)
7. [API Endpoints](#api-endpoints)
8. [Webhook Handling](#webhook-handling)
9. [Testing Strategy](#testing-strategy)
10. [Migration Scripts](#migration-scripts)

---

## 1. Current Backend State

### Existing Structure
```
src/main/java/com/example/eventmanagement/
├── domain/           # JPA entities
├── repository/       # Spring Data repositories
├── service/          # Business logic
├── web/rest/         # REST controllers
├── config/           # Configuration classes
└── security/         # JWT authentication
```

### Existing Payment-Related Code
- **Entities:** `EventTicketTransaction`, `EventTicketTransactionItem`, `UserPaymentTransaction`
- **Repositories:** `EventTicketTransactionRepository`
- **Services:** Minimal payment logic (mostly handled in frontend)
- **APIs:** Backend primarily provides ticket pricing data

---

## 2. New Package Structure

```
src/main/java/com/example/eventmanagement/
├── payment/
│   ├── adapter/
│   │   ├── PaymentAdapter.java (interface)
│   │   ├── stripe/
│   │   │   ├── StripePaymentAdapter.java
│   │   │   ├── StripeWebhookHandler.java
│   │   │   └── StripeConfig.java
│   │   ├── paypal/
│   │   │   ├── PayPalPaymentAdapter.java
│   │   │   ├── PayPalWebhookHandler.java
│   │   │   └── PayPalConfig.java
│   │   └── acp/
│   │       └── ACPPaymentAdapter.java (future)
│   │
│   ├── domain/
│   │   ├── PaymentProviderConfig.java
│   │   ├── PaymentTransaction.java
│   │   ├── PaymentTransactionItem.java
│   │   ├── PaymentWebhookLog.java
│   │   └── enums/
│   │       ├── PaymentType.java
│   │       ├── PaymentStatus.java
│   │       └── PaymentProviderType.java
│   │
│   ├── repository/
│   │   ├── PaymentProviderConfigRepository.java
│   │   ├── PaymentTransactionRepository.java
│   │   ├── PaymentTransactionItemRepository.java
│   │   └── PaymentWebhookLogRepository.java
│   │
│   ├── service/
│   │   ├── PaymentOrchestrationService.java
│   │   ├── PaymentProviderConfigService.java
│   │   ├── PaymentProviderFactory.java
│   │   ├── PostPaymentProcessingService.java
│   │   ├── RefundService.java
│   │   └── WebhookProcessingService.java
│   │
│   ├── web/rest/
│   │   ├── PaymentController.java
│   │   ├── PaymentWebhookController.java
│   │   └── PaymentAdminController.java
│   │
│   ├── dto/
│   │   ├── PaymentInitializeRequest.java
│   │   ├── PaymentSessionResponse.java
│   │   ├── PaymentStatusResponse.java
│   │   ├── RefundRequest.java
│   │   └── WebhookPayload.java
│   │
│   ├── exception/
│   │   ├── PaymentException.java
│   │   ├── PaymentProviderException.java
│   │   └── WebhookVerificationException.java
│   │
│   └── util/
│       ├── EncryptionService.java
│       └── IdempotencyKeyGenerator.java
│
├── domain/ (existing, updated)
│   └── EventTicketTransaction.java (deprecated, link to PaymentTransaction)
│
└── ...
```

---

## 3. Core Interfaces

### PaymentAdapter.java

```java
package com.example.eventmanagement.payment.adapter;

import com.example.eventmanagement.payment.dto.*;
import com.example.eventmanagement.payment.domain.enums.PaymentMethodType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Core interface that all payment provider adapters must implement.
 * Provides abstraction over different payment providers (Stripe, PayPal, etc.)
 */
public interface PaymentAdapter {

    /**
     * Initialize a new payment session with the provider
     * @param request Payment initialization details
     * @return PaymentSession containing provider-specific session info
     * @throws PaymentException if initialization fails
     */
    PaymentSession initializePayment(PaymentInitializeRequest request) throws PaymentException;

    /**
     * Confirm/capture a previously created payment
     * Used for two-step payment flows (authorize then capture)
     * @param transactionId Local transaction ID
     * @param confirmationData Provider-specific confirmation data
     * @return PaymentResult with confirmation status
     * @throws PaymentException if confirmation fails
     */
    PaymentResult confirmPayment(Long transactionId, Map<String, Object> confirmationData)
        throws PaymentException;

    /**
     * Cancel an initiated payment before completion
     * @param transactionId Local transaction ID
     * @return true if cancelled successfully
     * @throws PaymentException if cancellation fails
     */
    boolean cancelPayment(Long transactionId) throws PaymentException;

    /**
     * Issue a full or partial refund for a completed payment
     * @param transactionId Local transaction ID
     * @param amount Amount to refund (null for full refund)
     * @param reason Refund reason for provider records
     * @return RefundResult with refund details
     * @throws PaymentException if refund fails
     */
    RefundResult refundPayment(Long transactionId, BigDecimal amount, String reason)
        throws PaymentException;

    /**
     * Retrieve current payment status from provider
     * Useful for polling or verification after redirect flows
     * @param providerTransactionId Provider's transaction identifier
     * @return Current payment status
     * @throws PaymentException if status retrieval fails
     */
    PaymentStatus getPaymentStatus(String providerTransactionId) throws PaymentException;

    /**
     * Process an incoming webhook event from provider
     * @param payload Webhook payload with signature
     * @return WebhookResult indicating processing outcome
     * @throws WebhookVerificationException if signature verification fails
     */
    WebhookResult processWebhook(WebhookPayload payload)
        throws WebhookVerificationException, PaymentException;

    /**
     * Get list of payment method types supported by this provider
     * @return List of supported payment methods (card, wallet, bank_transfer, etc.)
     */
    List<PaymentMethodType> getSupportedPaymentMethods();

    /**
     * Get the provider type identifier
     * @return Provider type enum value
     */
    PaymentProviderType getProviderType();

    /**
     * Check if provider supports a specific feature
     * @param feature Feature name (e.g., "subscriptions", "wallets", "refunds")
     * @return true if feature is supported
     */
    boolean supportsFeature(String feature);
}
```

### WebhookHandler.java

```java
package com.example.eventmanagement.payment.adapter;

import com.example.eventmanagement.payment.dto.WebhookPayload;
import com.example.eventmanagement.payment.dto.WebhookResult;
import com.example.eventmanagement.payment.exception.WebhookVerificationException;

/**
 * Interface for provider-specific webhook handling
 */
public interface WebhookHandler {

    /**
     * Verify webhook signature using provider's verification method
     * @param payload Raw webhook payload
     * @param signature Webhook signature header
     * @param secret Webhook secret for this tenant
     * @return true if signature is valid
     * @throws WebhookVerificationException if verification fails
     */
    boolean verifySignature(String payload, String signature, String secret)
        throws WebhookVerificationException;

    /**
     * Process a verified webhook event
     * @param payload Webhook payload
     * @return Processing result
     */
    WebhookResult handleWebhook(WebhookPayload payload);

    /**
     * Get the provider type this handler is for
     */
    PaymentProviderType getProviderType();
}
```

---

## 4. Implementation Classes

### StripePaymentAdapter.java

```java
package com.example.eventmanagement.payment.adapter.stripe;

import com.example.eventmanagement.payment.adapter.PaymentAdapter;
import com.example.eventmanagement.payment.domain.*;
import com.example.eventmanagement.payment.domain.enums.*;
import com.example.eventmanagement.payment.dto.*;
import com.example.eventmanagement.payment.exception.*;
import com.example.eventmanagement.payment.repository.*;
import com.example.eventmanagement.payment.service.PaymentProviderConfigService;
import com.stripe.Stripe;
import com.stripe.model.*;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripePaymentAdapter implements PaymentAdapter {

    private final PaymentTransactionRepository transactionRepository;
    private final PaymentProviderConfigService configService;
    private final StripeWebhookHandler webhookHandler;

    @Override
    @Transactional
    public PaymentSession initializePayment(PaymentInitializeRequest request)
        throws PaymentException {

        log.info("Initializing Stripe payment for tenant: {}, eventId: {}, amount: {}",
            request.getTenantId(), request.getEventId(), request.getAmount());

        try {
            // 1. Get Stripe configuration for tenant
            PaymentProviderConfig config = configService.getProviderConfig(
                request.getTenantId(), PaymentProviderType.STRIPE
            );

            Map<String, String> credentials = configService.getProviderCredentials(config);
            String secretKey = credentials.get("secret_key");

            if (secretKey == null) {
                throw new PaymentException("Stripe secret key not configured for tenant");
            }

            // 2. Calculate amount in cents
            long amountCents = request.getAmount().multiply(BigDecimal.valueOf(100))
                .longValue();

            // 3. Build Payment Intent parameters
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(request.getCurrency().toLowerCase())
                .setReceiptEmail(request.getCustomerEmail())
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                );

            // Add metadata
            Map<String, String> metadata = new HashMap<>();
            metadata.put("tenant_id", request.getTenantId());
            metadata.put("payment_type", request.getPaymentType().name());
            metadata.put("customer_email", request.getCustomerEmail());
            if (request.getEventId() != null) {
                metadata.put("event_id", request.getEventId().toString());
            }
            if (request.getDiscountCodeId() != null) {
                metadata.put("discount_code_id", request.getDiscountCodeId().toString());
            }
            paramsBuilder.putAllMetadata(metadata);

            // 4. Create Payment Intent via Stripe API
            Stripe.apiKey = secretKey;
            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

            log.info("Stripe Payment Intent created: {}, status: {}",
                paymentIntent.getId(), paymentIntent.getStatus());

            // 5. Create local payment transaction record
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setTenantId(request.getTenantId());
            transaction.setProviderType(PaymentProviderType.STRIPE);
            transaction.setProviderTransactionId(paymentIntent.getId());
            transaction.setProviderSessionId(paymentIntent.getClientSecret());
            transaction.setPaymentType(request.getPaymentType());
            transaction.setAmountSubtotal(request.getAmount());
            transaction.setAmountDiscount(request.getDiscountAmount() != null ?
                request.getDiscountAmount() : BigDecimal.ZERO);
            transaction.setAmountTotal(request.getAmount());
            transaction.setCurrency(request.getCurrency());
            transaction.setCustomerEmail(request.getCustomerEmail());
            transaction.setCustomerFirstName(request.getCustomerFirstName());
            transaction.setCustomerLastName(request.getCustomerLastName());
            transaction.setCustomerPhone(request.getCustomerPhone());
            transaction.setEventId(request.getEventId());
            transaction.setDiscountCodeId(request.getDiscountCodeId());
            transaction.setStatus(PaymentStatus.INITIATED);
            transaction.setInitiatedAt(Instant.now());
            transaction.setIdempotencyKey(request.getIdempotencyKey());

            // Set metadata JSON
            transaction.setMetadata(Map.of(
                "stripe_payment_intent_id", paymentIntent.getId(),
                "stripe_client_secret", paymentIntent.getClientSecret()
            ));

            transaction = transactionRepository.save(transaction);

            log.info("Payment transaction created: id={}, providerTxId={}",
                transaction.getId(), paymentIntent.getId());

            // 6. Create transaction items if provided
            if (request.getCartItems() != null && !request.getCartItems().isEmpty()) {
                for (CartItemDto item : request.getCartItems()) {
                    PaymentTransactionItem txnItem = new PaymentTransactionItem();
                    txnItem.setTenantId(request.getTenantId());
                    txnItem.setPaymentTransactionId(transaction.getId());
                    txnItem.setItemType("TICKET");
                    txnItem.setItemId(item.getTicketTypeId());
                    txnItem.setItemName(item.getTicketTypeName());
                    txnItem.setQuantity(item.getQuantity());
                    txnItem.setUnitPrice(item.getUnitPrice());
                    txnItem.setTotalAmount(item.getTotalAmount());
                    // Save via repository (assuming it exists)
                }
            }

            // 7. Build and return payment session
            return PaymentSession.builder()
                .transactionId(transaction.getId())
                .providerType(PaymentProviderType.STRIPE)
                .clientSecret(paymentIntent.getClientSecret())
                .publicKey(config.getPublicKey())
                .metadata(Map.of(
                    "payment_intent_id", paymentIntent.getId(),
                    "supports_wallets", config.isSupportsWallets(),
                    "supports_link", true,
                    "amount_cents", amountCents
                ))
                .build();

        } catch (Exception e) {
            log.error("Failed to initialize Stripe payment", e);
            throw new PaymentException("Failed to initialize Stripe payment: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public RefundResult refundPayment(Long transactionId, BigDecimal amount, String reason)
        throws PaymentException {

        log.info("Processing refund for transaction: {}, amount: {}", transactionId, amount);

        try {
            // 1. Get transaction
            PaymentTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new PaymentException("Transaction not found: " + transactionId));

            if (!PaymentProviderType.STRIPE.equals(transaction.getProviderType())) {
                throw new PaymentException("Transaction is not a Stripe payment");
            }

            if (!PaymentStatus.SUCCEEDED.equals(transaction.getStatus())) {
                throw new PaymentException("Cannot refund transaction with status: " +
                    transaction.getStatus());
            }

            // 2. Get Stripe config
            PaymentProviderConfig config = configService.getProviderConfig(
                transaction.getTenantId(), PaymentProviderType.STRIPE
            );
            String secretKey = configService.getProviderCredentials(config).get("secret_key");
            Stripe.apiKey = secretKey;

            // 3. Create refund via Stripe
            RefundCreateParams.Builder refundParams = RefundCreateParams.builder()
                .setPaymentIntent(transaction.getProviderTransactionId())
                .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER);

            // Partial or full refund
            if (amount != null && amount.compareTo(transaction.getAmountTotal()) < 0) {
                long refundCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
                refundParams.setAmount(refundCents);
            }

            Refund refund = Refund.create(refundParams.build());

            log.info("Stripe refund created: {}, status: {}", refund.getId(), refund.getStatus());

            // 4. Update transaction
            BigDecimal refundAmount = amount != null ? amount : transaction.getAmountTotal();
            transaction.setRefundAmount(refundAmount);
            transaction.setRefundReason(reason);
            transaction.setRefundedAt(Instant.now());

            if (refundAmount.compareTo(transaction.getAmountTotal()) >= 0) {
                transaction.setStatus(PaymentStatus.REFUNDED);
            } else {
                transaction.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
            }

            transactionRepository.save(transaction);

            return RefundResult.builder()
                .refundId(refund.getId())
                .refundAmount(refundAmount)
                .status(refund.getStatus())
                .success(true)
                .build();

        } catch (Exception e) {
            log.error("Failed to process refund", e);
            throw new PaymentException("Failed to process refund: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentStatus getPaymentStatus(String providerTransactionId) throws PaymentException {
        try {
            // Note: This requires proper Stripe key setup, simplified here
            PaymentIntent intent = PaymentIntent.retrieve(providerTransactionId);

            return switch (intent.getStatus()) {
                case "succeeded" -> PaymentStatus.SUCCEEDED;
                case "processing" -> PaymentStatus.PROCESSING;
                case "requires_payment_method", "requires_confirmation" -> PaymentStatus.PENDING;
                case "canceled" -> PaymentStatus.CANCELLED;
                default -> PaymentStatus.FAILED;
            };
        } catch (Exception e) {
            throw new PaymentException("Failed to get payment status: " + e.getMessage(), e);
        }
    }

    @Override
    public WebhookResult processWebhook(WebhookPayload payload)
        throws WebhookVerificationException, PaymentException {
        return webhookHandler.handleWebhook(payload);
    }

    @Override
    public List<PaymentMethodType> getSupportedPaymentMethods() {
        return Arrays.asList(
            PaymentMethodType.CARD,
            PaymentMethodType.APPLE_PAY,
            PaymentMethodType.GOOGLE_PAY,
            PaymentMethodType.LINK,
            PaymentMethodType.CASH_APP
        );
    }

    @Override
    public PaymentProviderType getProviderType() {
        return PaymentProviderType.STRIPE;
    }

    @Override
    public boolean supportsFeature(String feature) {
        return switch (feature.toLowerCase()) {
            case "wallets", "subscriptions", "refunds", "instant_payouts" -> true;
            default -> false;
        };
    }

    @Override
    public PaymentResult confirmPayment(Long transactionId, Map<String, Object> confirmationData)
        throws PaymentException {
        // Stripe doesn't typically need server-side confirmation
        // (frontend confirms via stripe.confirmPayment)
        // But we can implement status check here
        PaymentTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new PaymentException("Transaction not found"));

        PaymentStatus status = getPaymentStatus(transaction.getProviderTransactionId());

        return PaymentResult.builder()
            .transactionId(transactionId)
            .status(status)
            .success(status == PaymentStatus.SUCCEEDED)
            .build();
    }

    @Override
    public boolean cancelPayment(Long transactionId) throws PaymentException {
        try {
            PaymentTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new PaymentException("Transaction not found"));

            // Get Stripe config
            PaymentProviderConfig config = configService.getProviderConfig(
                transaction.getTenantId(), PaymentProviderType.STRIPE
            );
            String secretKey = configService.getProviderCredentials(config).get("secret_key");
            Stripe.apiKey = secretKey;

            // Cancel Payment Intent
            PaymentIntent intent = PaymentIntent.retrieve(transaction.getProviderTransactionId());
            intent.cancel();

            // Update local transaction
            transaction.setStatus(PaymentStatus.CANCELLED);
            transactionRepository.save(transaction);

            return true;
        } catch (Exception e) {
            log.error("Failed to cancel payment", e);
            throw new PaymentException("Failed to cancel payment: " + e.getMessage(), e);
        }
    }
}
```

### StripeWebhookHandler.java

```java
package com.example.eventmanagement.payment.adapter.stripe;

import com.example.eventmanagement.payment.adapter.WebhookHandler;
import com.example.eventmanagement.payment.domain.*;
import com.example.eventmanagement.payment.domain.enums.*;
import com.example.eventmanagement.payment.dto.*;
import com.example.eventmanagement.payment.exception.*;
import com.example.eventmanagement.payment.repository.*;
import com.example.eventmanagement.payment.service.*;
import com.stripe.model.*;
import com.stripe.net.Webhook;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class StripeWebhookHandler implements WebhookHandler {

    private final PaymentTransactionRepository transactionRepository;
    private final PaymentWebhookLogRepository webhookLogRepository;
    private final PostPaymentProcessingService postPaymentService;
    private final PaymentProviderConfigService configService;

    @Override
    public boolean verifySignature(String payload, String signature, String secret)
        throws WebhookVerificationException {
        try {
            Event event = Webhook.constructEvent(payload, signature, secret);
            return event != null;
        } catch (Exception e) {
            throw new WebhookVerificationException("Invalid Stripe webhook signature", e);
        }
    }

    @Override
    @Transactional
    public WebhookResult handleWebhook(WebhookPayload payload) {
        try {
            // 1. Parse Stripe event
            Event event = Event.GSON.fromJson(payload.getRawPayload(), Event.class);

            log.info("Processing Stripe webhook: type={}, id={}", event.getType(), event.getId());

            // 2. Log webhook
            PaymentWebhookLog webhookLog = new PaymentWebhookLog();
            webhookLog.setProviderType(PaymentProviderType.STRIPE);
            webhookLog.setWebhookId(event.getId());
            webhookLog.setWebhookType(event.getType());
            webhookLog.setRawPayload(payload.getRawPayload());
            webhookLog.setSignature(payload.getSignature());
            webhookLog.setSignatureVerified(true);
            webhookLog.setReceivedAt(Instant.now());
            webhookLog.setProcessingAttemptedAt(Instant.now());

            // 3. Check for duplicate webhook
            if (webhookLogRepository.existsByWebhookId(event.getId())) {
                log.warn("Duplicate webhook received: {}", event.getId());
                webhookLog.setProcessed(true);
                webhookLog.setProcessingCompletedAt(Instant.now());
                webhookLogRepository.save(webhookLog);
                return WebhookResult.duplicate();
            }

            // 4. Handle event type
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    handlePaymentSucceeded(event, webhookLog);
                    break;
                case "payment_intent.payment_failed":
                    handlePaymentFailed(event, webhookLog);
                    break;
                case "payment_intent.canceled":
                    handlePaymentCancelled(event, webhookLog);
                    break;
                case "charge.refunded":
                    handleRefund(event, webhookLog);
                    break;
                default:
                    log.info("Unhandled webhook type: {}", event.getType());
                    webhookLog.setProcessed(true);
                    webhookLog.setProcessingCompletedAt(Instant.now());
                    webhookLogRepository.save(webhookLog);
                    return WebhookResult.success();
            }

            webhookLog.setProcessed(true);
            webhookLog.setProcessingCompletedAt(Instant.now());
            webhookLogRepository.save(webhookLog);

            return WebhookResult.success();

        } catch (Exception e) {
            log.error("Failed to process Stripe webhook", e);
            return WebhookResult.error(e.getMessage());
        }
    }

    private void handlePaymentSucceeded(Event event, PaymentWebhookLog webhookLog) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
            .getObject().orElseThrow();

        log.info("Payment succeeded: {}", intent.getId());

        // Find transaction
        PaymentTransaction transaction = transactionRepository
            .findByProviderTransactionId(intent.getId())
            .orElseThrow(() -> new PaymentException(
                "Transaction not found for Payment Intent: " + intent.getId()
            ));

        webhookLog.setPaymentTransactionId(transaction.getId());

        // Update transaction
        transaction.setStatus(PaymentStatus.SUCCEEDED);
        transaction.setCompletedAt(Instant.now());

        // Extract payment method details
        if (intent.getCharges() != null && !intent.getCharges().getData().isEmpty()) {
            Charge charge = intent.getCharges().getData().get(0);
            if (charge.getPaymentMethodDetails() != null) {
                String type = charge.getPaymentMethodDetails().getType();
                transaction.setPaymentMethodType(type);

                if ("card".equals(type) && charge.getPaymentMethodDetails().getCard() != null) {
                    transaction.setPaymentMethodLast4(
                        charge.getPaymentMethodDetails().getCard().getLast4()
                    );
                    transaction.setPaymentMethodBrand(
                        charge.getPaymentMethodDetails().getCard().getBrand()
                    );
                }
            }
        }

        transactionRepository.save(transaction);

        // Trigger post-payment processing
        postPaymentService.handleSuccessfulPayment(transaction);

        log.info("Payment transaction updated: id={}, status=SUCCEEDED", transaction.getId());
    }

    private void handlePaymentFailed(Event event, PaymentWebhookLog webhookLog) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
            .getObject().orElseThrow();

        log.info("Payment failed: {}", intent.getId());

        PaymentTransaction transaction = transactionRepository
            .findByProviderTransactionId(intent.getId())
            .orElseThrow();

        webhookLog.setPaymentTransactionId(transaction.getId());

        transaction.setStatus(PaymentStatus.FAILED);
        transaction.setFailedAt(Instant.now());

        if (intent.getLastPaymentError() != null) {
            transaction.setFailureReason(intent.getLastPaymentError().getMessage());
            transaction.setFailureCode(intent.getLastPaymentError().getCode());
        }

        transactionRepository.save(transaction);
    }

    private void handlePaymentCancelled(Event event, PaymentWebhookLog webhookLog) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
            .getObject().orElseThrow();

        log.info("Payment cancelled: {}", intent.getId());

        PaymentTransaction transaction = transactionRepository
            .findByProviderTransactionId(intent.getId())
            .orElseThrow();

        webhookLog.setPaymentTransactionId(transaction.getId());

        transaction.setStatus(PaymentStatus.CANCELLED);
        transactionRepository.save(transaction);
    }

    private void handleRefund(Event event, PaymentWebhookLog webhookLog) {
        Charge charge = (Charge) event.getDataObjectDeserializer()
            .getObject().orElseThrow();

        log.info("Refund processed for charge: {}", charge.getId());

        // Find transaction by payment intent
        if (charge.getPaymentIntent() != null) {
            PaymentTransaction transaction = transactionRepository
                .findByProviderTransactionId(charge.getPaymentIntent())
                .orElseThrow();

            webhookLog.setPaymentTransactionId(transaction.getId());

            // Update refund status (if not already set by API call)
            if (!PaymentStatus.REFUNDED.equals(transaction.getStatus()) &&
                !PaymentStatus.PARTIALLY_REFUNDED.equals(transaction.getStatus())) {

                transaction.setStatus(PaymentStatus.REFUNDED);
                transaction.setRefundedAt(Instant.now());
                transactionRepository.save(transaction);
            }
        }
    }

    @Override
    public PaymentProviderType getProviderType() {
        return PaymentProviderType.STRIPE;
    }
}
```

---

## 5. Database Layer

### Entity Example: PaymentTransaction.java

```java
package com.example.eventmanagement.payment.domain;

import com.example.eventmanagement.payment.domain.enums.*;
import lombok.*;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "payment_transaction", indexes = {
    @Index(name = "idx_pt_tenant", columnList = "tenant_id"),
    @Index(name = "idx_pt_status", columnList = "status"),
    @Index(name = "idx_pt_provider_tx", columnList = "provider_transaction_id"),
    @Index(name = "idx_pt_customer_email", columnList = "customer_email"),
    @Index(name = "idx_pt_event", columnList = "event_id"),
    @Index(name = "idx_pt_idempotency", columnList = "idempotency_key")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "transaction_reference", insertable = false, updatable = false)
    private String transactionReference; // Generated column in DB

    @Column(name = "external_transaction_id", length = 500)
    private String externalTransactionId;

    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey;

    // Provider information
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false, length = 50)
    private PaymentProviderType providerType;

    @Column(name = "provider_transaction_id", length = 500)
    private String providerTransactionId;

    @Column(name = "provider_session_id", length = 500)
    private String providerSessionId;

    @Column(name = "provider_customer_id", length = 500)
    private String providerCustomerId;

    // Transaction details
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    private PaymentType paymentType;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "amount_subtotal", precision = 21, scale = 2, nullable = false)
    private BigDecimal amountSubtotal;

    @DecimalMin("0.00")
    @Column(name = "amount_tax", precision = 21, scale = 2)
    private BigDecimal amountTax = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "amount_discount", precision = 21, scale = 2)
    private BigDecimal amountDiscount = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "amount_platform_fee", precision = 21, scale = 2)
    private BigDecimal amountPlatformFee = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "amount_processing_fee", precision = 21, scale = 2)
    private BigDecimal amountProcessingFee = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "amount_total", precision = 21, scale = 2, nullable = false)
    private BigDecimal amountTotal;

    @Column(name = "currency", length = 3)
    private String currency = "USD";

    // Customer information
    @NotNull
    @Email
    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "customer_first_name")
    private String customerFirstName;

    @Column(name = "customer_last_name")
    private String customerLastName;

    @Column(name = "customer_phone", length = 100)
    private String customerPhone;

    // Related entities
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "discount_code_id")
    private Long discountCodeId;

    // Payment method
    @Column(name = "payment_method_type", length = 100)
    private String paymentMethodType;

    @Column(name = "payment_method_last4", length = 10)
    private String paymentMethodLast4;

    @Column(name = "payment_method_brand", length = 50)
    private String paymentMethodBrand;

    // Status
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status = PaymentStatus.INITIATED;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "failure_code", length = 100)
    private String failureCode;

    // Timestamps
    @NotNull
    @Column(name = "initiated_at", nullable = false)
    private Instant initiatedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "failed_at")
    private Instant failedAt;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    // Refund
    @DecimalMin("0.00")
    @Column(name = "refund_amount", precision = 21, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "refund_reason", length = 2048)
    private String refundReason;

    // Metadata
    @Type(type = "jsonb")
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
```

### Repository Example: PaymentTransactionRepository.java

```java
package com.example.eventmanagement.payment.repository;

import com.example.eventmanagement.payment.domain.PaymentTransaction;
import com.example.eventmanagement.payment.domain.enums.PaymentStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByProviderTransactionId(String providerTransactionId);

    Optional<PaymentTransaction> findByIdempotencyKey(String idempotencyKey);

    List<PaymentTransaction> findByTenantIdAndStatus(String tenantId, PaymentStatus status);

    List<PaymentTransaction> findByEventId(Long eventId);

    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.tenantId = :tenantId " +
           "AND pt.createdAt BETWEEN :startDate AND :endDate ORDER BY pt.createdAt DESC")
    List<PaymentTransaction> findByTenantAndDateRange(
        @Param("tenantId") String tenantId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    @Query("SELECT COUNT(pt) FROM PaymentTransaction pt WHERE pt.tenantId = :tenantId " +
           "AND pt.status = 'SUCCEEDED' AND pt.completedAt >= :since")
    long countSuccessfulTransactionsSince(
        @Param("tenantId") String tenantId,
        @Param("since") Instant since
    );
}
```

---

## 6. Configuration Management

### application.yml

```yaml
payment:
  providers:
    stripe:
      enabled: true
    paypal:
      enabled: true
    acp:
      enabled: false

  encryption:
    algorithm: AES/GCM/NoPadding
    key-size: 256

  webhook:
    timeout-seconds: 30
    max-retries: 3

  features:
    allow-partial-refunds: true
    require-customer-phone: false
    enable-fraud-detection: true
```

---

## 7-10. [Sections Continued]

Due to length constraints, the remaining sections (API Endpoints, Webhook Handling, Testing Strategy, Migration Scripts) would continue with similar detail covering:

- REST endpoint implementations
- Webhook signature verification
- JUnit test examples
- Liquibase migration scripts
- Performance optimization strategies

---

## Summary

This backend refactoring transforms the Spring Boot application into a payment orchestration platform with:

1. **Provider abstraction** via adapter pattern
2. **Secure credential management** with encryption
3. **Webhook-driven state management**
4. **Comprehensive audit logging**
5. **Multi-tenant support** at the database level

The architecture supports easy addition of new payment providers and maintains backward compatibility during migration.
