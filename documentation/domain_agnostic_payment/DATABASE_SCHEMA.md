# Database Schema: Domain-Agnostic Payment System

**Project:** MCEFEE Payment System Refactoring
**Database:** PostgreSQL 16+
**Document Version:** 1.0
**Date:** October 20, 2025

---

## Overview

This document provides complete SQL schema definitions, migration scripts, and indexing strategies for the domain-agnostic payment system.

---

## Table of Contents

1. [Schema Design Principles](#schema-design-principles)
2. [New Tables](#new-tables)
3. [Modified Tables](#modified-tables)
4. [Indexes and Performance](#indexes-and-performance)
5. [Migration Scripts](#migration-scripts)
6. [Data Migration](#data-migration)
7. [Rollback Plan](#rollback-plan)

---

## 1. Schema Design Principles

### Multi-Tenancy
- All tables include `tenant_id` column for data isolation
- Indexes on `tenant_id` for query performance
- Row-level security policies (optional, for future)

### Provider Agnosticism
- Generic field names (no `stripe_*` columns in new tables)
- Provider-specific data stored in JSON metadata
- Extensible for future payment providers

### Audit & Compliance
- All tables include `created_at` and `updated_at` timestamps
- Webhook logs retained for reconciliation
- Soft deletes where appropriate (not implemented in initial version)

### Performance
- Strategic indexes on frequently queried columns
- Partitioning strategy for large tables (future consideration)
- JSONB for flexible metadata with GIN indexes

---

## 2. New Tables

### 2.1 payment_provider_config

Stores payment provider configuration per tenant.

```sql
-- =====================================================
-- Table: payment_provider_config
-- Purpose: Store payment provider credentials and configuration per tenant
-- =====================================================

CREATE TYPE payment_provider_type AS ENUM (
    'STRIPE',
    'PAYPAL',
    'ACP',        -- Agentic Commerce Protocol (OpenAI + Stripe)
    'AP2',        -- Agent Payments Protocol (Google)
    'SQUARE',
    'CRYPTO'      -- Future: Crypto payment support
);

CREATE TABLE payment_provider_config (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,

    -- Provider identification
    provider_type payment_provider_type NOT NULL,
    provider_name VARCHAR(100) NOT NULL,   -- Display name (e.g., "Stripe Payments")

    -- Status flags
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_primary BOOLEAN DEFAULT false NOT NULL,  -- Primary provider for tenant
    priority INTEGER DEFAULT 0 NOT NULL,        -- Fallback priority (higher = preferred)

    -- Encrypted configuration (contains secret keys, webhook secrets, etc.)
    config_data TEXT NOT NULL,  -- Encrypted JSON blob

    -- Public credentials (safe to expose to frontend if needed)
    public_key VARCHAR(500),    -- Publishable key, client ID, etc.
    webhook_secret VARCHAR(500), -- For webhook signature verification (encrypted)

    -- Feature flags
    supports_wallets BOOLEAN DEFAULT false NOT NULL,      -- Apple Pay, Google Pay
    supports_subscriptions BOOLEAN DEFAULT false NOT NULL, -- Recurring payments
    supports_refunds BOOLEAN DEFAULT true NOT NULL,       -- Refund capability
    supports_partial_refunds BOOLEAN DEFAULT true NOT NULL,

    -- Metadata
    metadata JSONB,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),

    -- Constraints
    CONSTRAINT uk_tenant_provider UNIQUE (tenant_id, provider_type),
    CONSTRAINT ck_priority_positive CHECK (priority >= 0)
);

-- Ensure only one primary provider per tenant
CREATE UNIQUE INDEX uk_tenant_primary_provider
    ON payment_provider_config (tenant_id)
    WHERE is_primary = true;

-- Indexes
CREATE INDEX idx_ppc_tenant ON payment_provider_config(tenant_id);
CREATE INDEX idx_ppc_active ON payment_provider_config(is_active) WHERE is_active = true;
CREATE INDEX idx_ppc_provider_type ON payment_provider_config(provider_type);

-- Trigger to update updated_at
CREATE TRIGGER trg_ppc_update_timestamp
    BEFORE UPDATE ON payment_provider_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE payment_provider_config IS 'Payment provider configuration per tenant';
COMMENT ON COLUMN payment_provider_config.config_data IS 'Encrypted JSON containing provider credentials (secret keys, etc.)';
COMMENT ON COLUMN payment_provider_config.public_key IS 'Public/publishable key safe to expose to frontend';
```

### 2.2 payment_transaction

Unified payment transaction table replacing provider-specific tables.

```sql
-- =====================================================
-- Table: payment_transaction
-- Purpose: Unified payment transaction tracking for all providers
-- =====================================================

CREATE TYPE payment_type AS ENUM (
    'TICKET_SALE',
    'DONATION',
    'OFFERING',
    'SUBSCRIPTION',
    'MERCHANDISE',
    'MEMBERSHIP',
    'REFUND'
);

CREATE TYPE payment_status AS ENUM (
    'INITIATED',            -- Payment session created, awaiting user action
    'PENDING',              -- User redirected/in progress
    'PROCESSING',           -- Payment submitted to provider
    'REQUIRES_CONFIRMATION',-- Awaiting server-side confirmation
    'REQUIRES_ACTION',      -- User action required (3D Secure, etc.)
    'SUCCEEDED',            -- Payment confirmed and completed
    'FAILED',               -- Payment failed (card declined, etc.)
    'CANCELLED',            -- User cancelled
    'EXPIRED',              -- Session expired before completion
    'REFUNDED',             -- Full refund issued
    'PARTIALLY_REFUNDED'    -- Partial refund issued
);

CREATE TABLE payment_transaction (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,

    -- Transaction identification
    transaction_reference VARCHAR(255) GENERATED ALWAYS AS ('PAY' || LPAD(id::TEXT, 10, '0')) STORED,
    external_transaction_id VARCHAR(500), -- Optional external/legacy reference
    idempotency_key VARCHAR(255) UNIQUE,  -- For idempotent request handling

    -- Payment provider information
    provider_type payment_provider_type NOT NULL,
    provider_transaction_id VARCHAR(500),  -- Provider's transaction/payment intent ID
    provider_session_id VARCHAR(500),      -- Provider's session/checkout ID
    provider_customer_id VARCHAR(500),     -- Provider's customer ID (for recurring)

    -- Transaction type and amounts
    payment_type payment_type NOT NULL,
    amount_subtotal NUMERIC(21,2) NOT NULL,
    amount_tax NUMERIC(21,2) DEFAULT 0,
    amount_discount NUMERIC(21,2) DEFAULT 0,
    amount_platform_fee NUMERIC(21,2) DEFAULT 0,
    amount_processing_fee NUMERIC(21,2) DEFAULT 0,
    amount_total NUMERIC(21,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,

    -- Customer information
    customer_email VARCHAR(255) NOT NULL,
    customer_first_name VARCHAR(255),
    customer_last_name VARCHAR(255),
    customer_phone VARCHAR(100),
    customer_address_line1 VARCHAR(500),
    customer_address_line2 VARCHAR(500),
    customer_city VARCHAR(100),
    customer_state VARCHAR(100),
    customer_postal_code VARCHAR(20),
    customer_country VARCHAR(2),  -- ISO 3166-1 alpha-2

    -- Related entities (nullable for flexibility)
    event_id BIGINT,
    discount_code_id BIGINT,
    user_id BIGINT,  -- If user is registered

    -- Payment method details
    payment_method_type VARCHAR(100),  -- 'card', 'apple_pay', 'paypal', 'bank_transfer', etc.
    payment_method_last4 VARCHAR(10),  -- Last 4 digits of card/account
    payment_method_brand VARCHAR(50),  -- 'visa', 'mastercard', 'amex', etc.
    payment_method_fingerprint VARCHAR(255), -- Unique fingerprint for fraud detection

    -- Status tracking
    status payment_status DEFAULT 'INITIATED' NOT NULL,
    failure_reason TEXT,
    failure_code VARCHAR(100),

    -- Timestamps
    initiated_at TIMESTAMP DEFAULT now() NOT NULL,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    expired_at TIMESTAMP,
    refunded_at TIMESTAMP,

    -- Refund tracking
    refund_amount NUMERIC(21,2) DEFAULT 0,
    refund_reason VARCHAR(2048),
    refund_provider_id VARCHAR(500), -- Provider's refund transaction ID

    -- Receipt and confirmation
    receipt_url VARCHAR(1000),       -- Provider's receipt URL
    receipt_number VARCHAR(255),     -- Provider's receipt number
    confirmation_sent_at TIMESTAMP,  -- When confirmation email was sent

    -- Risk and fraud
    risk_score NUMERIC(5,2),         -- Risk score from provider (0-100)
    risk_level VARCHAR(20),          -- 'low', 'medium', 'high'
    fraudulent BOOLEAN DEFAULT false, -- Marked as fraudulent

    -- Provider-specific metadata (flexible JSON)
    metadata JSONB,

    -- Audit fields
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),

    -- Constraints
    CONSTRAINT ck_amounts CHECK (
        amount_total >= 0 AND
        amount_subtotal >= 0 AND
        amount_discount >= 0 AND
        amount_discount <= amount_subtotal
    ),
    CONSTRAINT ck_refund_amount CHECK (
        refund_amount >= 0 AND
        refund_amount <= amount_total
    ),
    CONSTRAINT ck_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT ck_country_format CHECK (customer_country IS NULL OR customer_country ~ '^[A-Z]{2}$')
);

-- Indexes for performance
CREATE INDEX idx_pt_tenant ON payment_transaction(tenant_id);
CREATE INDEX idx_pt_status ON payment_transaction(status);
CREATE INDEX idx_pt_provider_tx ON payment_transaction(provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;
CREATE INDEX idx_pt_customer_email ON payment_transaction(customer_email);
CREATE INDEX idx_pt_event ON payment_transaction(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_pt_user ON payment_transaction(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_pt_created ON payment_transaction(created_at DESC);
CREATE INDEX idx_pt_idempotency ON payment_transaction(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_pt_payment_type ON payment_transaction(payment_type);
CREATE INDEX idx_pt_provider_type ON payment_transaction(provider_type);

-- Index for refunded transactions
CREATE INDEX idx_pt_refunded ON payment_transaction(status, refunded_at)
    WHERE status IN ('REFUNDED', 'PARTIALLY_REFUNDED');

-- GIN index for JSONB metadata queries
CREATE INDEX idx_pt_metadata ON payment_transaction USING GIN (metadata);

-- Composite index for tenant + status + date range queries
CREATE INDEX idx_pt_tenant_status_date ON payment_transaction(tenant_id, status, created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER trg_pt_update_timestamp
    BEFORE UPDATE ON payment_transaction
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE payment_transaction IS 'Unified payment transaction tracking for all payment providers';
COMMENT ON COLUMN payment_transaction.provider_transaction_id IS 'Provider-specific transaction ID (e.g., Stripe Payment Intent ID, PayPal Order ID)';
COMMENT ON COLUMN payment_transaction.metadata IS 'Provider-specific data stored as JSON';
```

### 2.3 payment_transaction_item

Line items for each payment transaction.

```sql
-- =====================================================
-- Table: payment_transaction_item
-- Purpose: Line items for payment transactions
-- =====================================================

CREATE TYPE payment_item_type AS ENUM (
    'TICKET',
    'DONATION_ALLOCATION',
    'MERCHANDISE',
    'MEMBERSHIP_FEE',
    'SERVICE_FEE',
    'PROCESSING_FEE',
    'TAX',
    'DISCOUNT',
    'OTHER'
);

CREATE TABLE payment_transaction_item (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    payment_transaction_id BIGINT NOT NULL,

    -- Item details
    item_type payment_item_type NOT NULL,
    item_id BIGINT,              -- Reference to ticket_type, product, etc.
    item_name VARCHAR(500) NOT NULL,
    item_description TEXT,
    item_sku VARCHAR(255),       -- Product SKU if applicable

    -- Quantities and amounts
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(21,2) NOT NULL,
    total_amount NUMERIC(21,2) NOT NULL,

    -- Optional: Individual item discounts
    discount_amount NUMERIC(21,2) DEFAULT 0,
    tax_amount NUMERIC(21,2) DEFAULT 0,

    -- Metadata
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP DEFAULT now() NOT NULL,

    -- Constraints
    CONSTRAINT fk_payment_transaction
        FOREIGN KEY (payment_transaction_id)
        REFERENCES payment_transaction(id)
        ON DELETE CASCADE,
    CONSTRAINT ck_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_unit_price_non_negative CHECK (unit_price >= 0),
    CONSTRAINT ck_total_amount CHECK (total_amount = (quantity * unit_price) - discount_amount + tax_amount)
);

-- Indexes
CREATE INDEX idx_pti_transaction ON payment_transaction_item(payment_transaction_id);
CREATE INDEX idx_pti_item ON payment_transaction_item(item_type, item_id) WHERE item_id IS NOT NULL;
CREATE INDEX idx_pti_tenant ON payment_transaction_item(tenant_id);

-- GIN index for metadata
CREATE INDEX idx_pti_metadata ON payment_transaction_item USING GIN (metadata);

-- Comments
COMMENT ON TABLE payment_transaction_item IS 'Line items (tickets, products, fees) for each payment transaction';
```

### 2.4 payment_webhook_log

Logs all incoming webhook events for debugging and reconciliation.

```sql
-- =====================================================
-- Table: payment_webhook_log
-- Purpose: Audit log for payment provider webhooks
-- =====================================================

CREATE TABLE payment_webhook_log (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(255),

    -- Webhook identification
    provider_type payment_provider_type NOT NULL,
    webhook_id VARCHAR(500) UNIQUE,     -- Provider's webhook event ID
    webhook_type VARCHAR(200) NOT NULL,  -- Event type (e.g., 'payment_intent.succeeded')

    -- Request details
    raw_payload TEXT NOT NULL,          -- Full JSON payload from provider
    signature VARCHAR(1000),            -- Webhook signature header
    signature_verified BOOLEAN,
    headers JSONB,                      -- All request headers

    -- Processing status
    processed BOOLEAN DEFAULT false NOT NULL,
    processing_attempted_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    processing_error TEXT,
    processing_duration_ms INTEGER,     -- Duration in milliseconds
    retry_count INTEGER DEFAULT 0,

    -- Related transaction
    payment_transaction_id BIGINT,

    -- Timestamps
    received_at TIMESTAMP DEFAULT now() NOT NULL,

    -- Constraints
    CONSTRAINT fk_payment_transaction_webhook
        FOREIGN KEY (payment_transaction_id)
        REFERENCES payment_transaction(id)
        ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_pwl_provider ON payment_webhook_log(provider_type);
CREATE INDEX idx_pwl_webhook_id ON payment_webhook_log(webhook_id) WHERE webhook_id IS NOT NULL;
CREATE INDEX idx_pwl_processed ON payment_webhook_log(processed, received_at) WHERE NOT processed;
CREATE INDEX idx_pwl_transaction ON payment_webhook_log(payment_transaction_id) WHERE payment_transaction_id IS NOT NULL;
CREATE INDEX idx_pwl_tenant ON payment_webhook_log(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_pwl_received ON payment_webhook_log(received_at DESC);

-- Partitioning by received_at (for large-scale deployments)
-- This can be implemented later if webhook volume is high
-- Example: PARTITION BY RANGE (received_at)

-- Comments
COMMENT ON TABLE payment_webhook_log IS 'Audit log of all payment provider webhooks for debugging and reconciliation';
COMMENT ON COLUMN payment_webhook_log.raw_payload IS 'Complete webhook payload for replay/debugging';
```

---

## 3. Modified Tables

### 3.1 event_ticket_transaction (Deprecated)

**Strategy:** Keep existing table for historical data, add link to new table.

```sql
-- =====================================================
-- Modify: event_ticket_transaction
-- Purpose: Link to new payment_transaction table
-- =====================================================

ALTER TABLE event_ticket_transaction
    ADD COLUMN IF NOT EXISTS provider_type VARCHAR(50) DEFAULT 'STRIPE',
    ADD COLUMN IF NOT EXISTS payment_transaction_id BIGINT,
    ADD COLUMN IF NOT EXISTS deprecated BOOLEAN DEFAULT false;

-- Add foreign key
ALTER TABLE event_ticket_transaction
    ADD CONSTRAINT fk_payment_transaction
        FOREIGN KEY (payment_transaction_id)
        REFERENCES payment_transaction(id)
        ON DELETE SET NULL;

-- Add index
CREATE INDEX idx_ett_payment_transaction ON event_ticket_transaction(payment_transaction_id)
    WHERE payment_transaction_id IS NOT NULL;

-- Mark as deprecated (for clarity)
COMMENT ON TABLE event_ticket_transaction IS 'DEPRECATED: Use payment_transaction instead. Kept for historical data.';
```

---

## 4. Indexes and Performance

### 4.1 Function for Updating Timestamps

```sql
-- =====================================================
-- Function: update_updated_at_column
-- Purpose: Automatically update updated_at on row modifications
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4.2 Partitioning Strategy (Optional, for high volume)

For tables with millions of rows, consider partitioning by date:

```sql
-- Example: Partition payment_webhook_log by month
-- This would be implemented if webhook volume exceeds 10M+ rows

CREATE TABLE payment_webhook_log (
    -- ... (same columns as above)
) PARTITION BY RANGE (received_at);

-- Create partitions
CREATE TABLE payment_webhook_log_2025_01 PARTITION OF payment_webhook_log
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE payment_webhook_log_2025_02 PARTITION OF payment_webhook_log
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Automate partition creation with pg_partman extension or cron job
```

---

## 5. Migration Scripts

### 5.1 Initial Schema Creation (Liquibase)

**File:** `src/main/resources/db/changelog/2025-10-payment-refactoring.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">

    <changeSet id="1-create-payment-enums" author="developer">
        <sql>
            CREATE TYPE payment_provider_type AS ENUM (
                'STRIPE', 'PAYPAL', 'ACP', 'AP2', 'SQUARE', 'CRYPTO'
            );

            CREATE TYPE payment_type AS ENUM (
                'TICKET_SALE', 'DONATION', 'OFFERING', 'SUBSCRIPTION',
                'MERCHANDISE', 'MEMBERSHIP', 'REFUND'
            );

            CREATE TYPE payment_status AS ENUM (
                'INITIATED', 'PENDING', 'PROCESSING', 'REQUIRES_CONFIRMATION',
                'REQUIRES_ACTION', 'SUCCEEDED', 'FAILED', 'CANCELLED',
                'EXPIRED', 'REFUNDED', 'PARTIALLY_REFUNDED'
            );

            CREATE TYPE payment_item_type AS ENUM (
                'TICKET', 'DONATION_ALLOCATION', 'MERCHANDISE', 'MEMBERSHIP_FEE',
                'SERVICE_FEE', 'PROCESSING_FEE', 'TAX', 'DISCOUNT', 'OTHER'
            );
        </sql>
        <rollback>
            DROP TYPE IF EXISTS payment_item_type CASCADE;
            DROP TYPE IF EXISTS payment_status CASCADE;
            DROP TYPE IF EXISTS payment_type CASCADE;
            DROP TYPE IF EXISTS payment_provider_type CASCADE;
        </rollback>
    </changeSet>

    <changeSet id="2-create-payment-provider-config" author="developer">
        <sqlFile path="db/changelog/sql/payment_provider_config.sql"/>
        <rollback>
            DROP TABLE IF EXISTS payment_provider_config CASCADE;
        </rollback>
    </changeSet>

    <changeSet id="3-create-payment-transaction" author="developer">
        <sqlFile path="db/changelog/sql/payment_transaction.sql"/>
        <rollback>
            DROP TABLE IF EXISTS payment_transaction CASCADE;
        </rollback>
    </changeSet>

    <changeSet id="4-create-payment-transaction-item" author="developer">
        <sqlFile path="db/changelog/sql/payment_transaction_item.sql"/>
        <rollback>
            DROP TABLE IF EXISTS payment_transaction_item CASCADE;
        </rollback>
    </changeSet>

    <changeSet id="5-create-payment-webhook-log" author="developer">
        <sqlFile path="db/changelog/sql/payment_webhook_log.sql"/>
        <rollback>
            DROP TABLE IF EXISTS payment_webhook_log CASCADE;
        </rollback>
    </changeSet>

    <changeSet id="6-modify-event-ticket-transaction" author="developer">
        <sql>
            ALTER TABLE event_ticket_transaction
                ADD COLUMN IF NOT EXISTS provider_type VARCHAR(50) DEFAULT 'STRIPE',
                ADD COLUMN IF NOT EXISTS payment_transaction_id BIGINT,
                ADD COLUMN IF NOT EXISTS deprecated BOOLEAN DEFAULT false;

            ALTER TABLE event_ticket_transaction
                ADD CONSTRAINT fk_payment_transaction
                    FOREIGN KEY (payment_transaction_id)
                    REFERENCES payment_transaction(id)
                    ON DELETE SET NULL;

            CREATE INDEX idx_ett_payment_transaction ON event_ticket_transaction(payment_transaction_id)
                WHERE payment_transaction_id IS NOT NULL;
        </sql>
        <rollback>
            ALTER TABLE event_ticket_transaction
                DROP CONSTRAINT IF EXISTS fk_payment_transaction,
                DROP COLUMN IF EXISTS payment_transaction_id,
                DROP COLUMN IF EXISTS provider_type,
                DROP COLUMN IF EXISTS deprecated;
        </rollback>
    </changeSet>

</databaseChangeLog>
```

---

## 6. Data Migration

### 6.1 Migrate Existing Stripe Transactions

```sql
-- =====================================================
-- Data Migration: event_ticket_transaction → payment_transaction
-- =====================================================

DO $$
DECLARE
    migrated_count INTEGER := 0;
    failed_count INTEGER := 0;
    batch_size INTEGER := 1000;
    max_id BIGINT;
    current_id BIGINT := 0;
BEGIN
    -- Get max ID for batching
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM event_ticket_transaction;

    RAISE NOTICE 'Starting migration of % tickets transactions', max_id;

    WHILE current_id < max_id LOOP
        BEGIN
            -- Insert in batches
            INSERT INTO payment_transaction (
                tenant_id,
                provider_type,
                provider_transaction_id,
                provider_session_id,
                provider_customer_id,
                payment_type,
                amount_subtotal,
                amount_tax,
                amount_discount,
                amount_platform_fee,
                amount_processing_fee,
                amount_total,
                currency,
                customer_email,
                customer_first_name,
                customer_last_name,
                customer_phone,
                event_id,
                discount_code_id,
                payment_method_type,
                status,
                failure_reason,
                initiated_at,
                completed_at,
                refunded_at,
                refund_amount,
                refund_reason,
                metadata,
                created_at,
                updated_at
            )
            SELECT
                ett.tenant_id,
                'STRIPE'::payment_provider_type,
                ett.stripe_payment_intent_id,
                ett.stripe_checkout_session_id,
                ett.stripe_customer_id,
                'TICKET_SALE'::payment_type,
                ett.total_amount,
                ett.tax_amount,
                ett.discount_amount,
                ett.platform_fee_amount,
                ett.service_fee,
                ett.final_amount,
                COALESCE(ett.stripe_payment_currency, 'USD'),
                ett.email,
                ett.first_name,
                ett.last_name,
                ett.phone,
                -- Get event_id from first transaction item
                (SELECT event_id
                 FROM event_ticket_transaction_item etti
                 LEFT JOIN event_ticket_type ticket ON etti.ticket_type_id = ticket.id
                 WHERE etti.transaction_id = ett.id
                 LIMIT 1),
                ett.discount_code_id,
                ett.payment_method,
                CASE
                    WHEN ett.status = 'COMPLETED' OR ett.stripe_payment_status = 'succeeded'
                        THEN 'SUCCEEDED'::payment_status
                    WHEN ett.status = 'FAILED' OR ett.stripe_payment_status = 'failed'
                        THEN 'FAILED'::payment_status
                    WHEN ett.status = 'REFUNDED'
                        THEN 'REFUNDED'::payment_status
                    WHEN ett.status = 'CANCELLED'
                        THEN 'CANCELLED'::payment_status
                    ELSE 'PENDING'::payment_status
                END,
                NULL, -- failure_reason
                ett.purchase_date,
                CASE
                    WHEN ett.status = 'COMPLETED' THEN ett.purchase_date
                    ELSE NULL
                END,
                ett.refund_date,
                ett.refund_amount,
                ett.refund_reason,
                jsonb_build_object(
                    'legacy_transaction_id', ett.id,
                    'legacy_transaction_reference', ett.transaction_reference,
                    'stripe_customer_email', ett.stripe_customer_email
                ),
                ett.purchase_date, -- created_at
                now() -- updated_at
            FROM event_ticket_transaction ett
            WHERE ett.id > current_id
              AND ett.id <= current_id + batch_size
              AND ett.payment_transaction_id IS NULL -- Not yet migrated
            ON CONFLICT (idempotency_key) DO NOTHING
            RETURNING id INTO STRICT migrated_count;

            -- Update event_ticket_transaction with payment_transaction_id
            UPDATE event_ticket_transaction ett
            SET payment_transaction_id = pt.id,
                deprecated = true
            FROM payment_transaction pt
            WHERE ett.stripe_payment_intent_id = pt.provider_transaction_id
              AND ett.id > current_id
              AND ett.id <= current_id + batch_size
              AND ett.payment_transaction_id IS NULL;

            RAISE NOTICE 'Migrated batch: current_id=%, migrated=%', current_id, migrated_count;

            current_id := current_id + batch_size;

            COMMIT; -- Commit each batch
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Migration batch failed at id=%: %', current_id, SQLERRM;
                failed_count := failed_count + 1;
                current_id := current_id + batch_size; -- Skip failed batch
        END;
    END LOOP;

    RAISE NOTICE 'Migration complete. Total migrated: %, failed batches: %',
        migrated_count, failed_count;
END $$;

-- Verify migration
SELECT
    COUNT(*) AS total_old_transactions,
    COUNT(payment_transaction_id) AS migrated_count,
    COUNT(*) - COUNT(payment_transaction_id) AS not_migrated
FROM event_ticket_transaction;
```

### 6.2 Migrate Transaction Items

```sql
-- =====================================================
-- Data Migration: event_ticket_transaction_item → payment_transaction_item
-- =====================================================

INSERT INTO payment_transaction_item (
    tenant_id,
    payment_transaction_id,
    item_type,
    item_id,
    item_name,
    item_description,
    quantity,
    unit_price,
    total_amount,
    metadata,
    created_at
)
SELECT
    etti.tenant_id,
    ett.payment_transaction_id,
    'TICKET'::payment_item_type,
    etti.ticket_type_id,
    COALESCE(ticket.name, 'Ticket'),
    ticket.description,
    etti.quantity,
    etti.price_per_unit,
    etti.total_amount,
    jsonb_build_object(
        'legacy_item_id', etti.id,
        'ticket_type_name', ticket.name
    ),
    etti.created_at
FROM event_ticket_transaction_item etti
JOIN event_ticket_transaction ett ON etti.transaction_id = ett.id
LEFT JOIN event_ticket_type ticket ON etti.ticket_type_id = ticket.id
WHERE ett.payment_transaction_id IS NOT NULL;

-- Verify
SELECT COUNT(*) AS total_items_migrated FROM payment_transaction_item;
```

---

## 7. Rollback Plan

### 7.1 Rollback to Previous Schema

```sql
-- WARNING: This will delete all new payment data!
-- Only use if migration fails and you need to revert

BEGIN;

-- Drop new tables
DROP TABLE IF EXISTS payment_webhook_log CASCADE;
DROP TABLE IF EXISTS payment_transaction_item CASCADE;
DROP TABLE IF EXISTS payment_transaction CASCADE;
DROP TABLE IF EXISTS payment_provider_config CASCADE;

-- Drop enums
DROP TYPE IF EXISTS payment_item_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_type CASCADE;
DROP TYPE IF EXISTS payment_provider_type CASCADE;

-- Revert event_ticket_transaction modifications
ALTER TABLE event_ticket_transaction
    DROP CONSTRAINT IF EXISTS fk_payment_transaction,
    DROP COLUMN IF EXISTS payment_transaction_id,
    DROP COLUMN IF EXISTS provider_type,
    DROP COLUMN IF EXISTS deprecated;

COMMIT;
```

---

## Summary

This database schema provides:

1. **Provider-agnostic tables** that work with any payment system
2. **Complete audit trail** via webhook logs
3. **Multi-tenant isolation** with tenant_id everywhere
4. **Performance optimization** through strategic indexing
5. **Backward compatibility** via migration and links to legacy tables
6. **Scalability** with optional partitioning for high-volume deployments

The schema is designed to support the current payment providers (Stripe, PayPal) and future providers (ACP, AP2, crypto) without requiring schema changes.
