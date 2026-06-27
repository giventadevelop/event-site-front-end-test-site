# Database Schema Changes for Givebutter Integration

**Project:** Givebutter Integration for Zero-Fee Fundraising
**Date:** January 2025
**Status:** Required Schema Changes

---

## Overview

This document outlines all database schema changes required to support Givebutter integration for ticketed fundraiser events, zero-fee donations, and Mass offerings.

---

## Required Schema Changes

### 1. Add `metadata` TEXT Column to `event_details` Table

**Issue:** The `event_details` table currently does NOT have a `metadata` column, but the Givebutter integration requires storing fundraiser configuration in event metadata.

**Note:** Following the existing pattern in the codebase (see `user_payment_transaction.metadata text`), we use `TEXT` instead of `JSONB` for metadata storage. JSON data is stored as a string and parsed in application code.

**Migration Script:**

```sql
-- =====================================================
-- Add metadata column to event_details table
-- Purpose: Store fundraiser configuration and other flexible event data
-- Pattern: Uses TEXT type (not JSONB) to match existing codebase pattern
-- =====================================================

-- Add metadata column if it doesn't exist
ALTER TABLE public.event_details
    ADD COLUMN IF NOT EXISTS metadata TEXT DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.event_details.metadata IS
    'Flexible TEXT field for event configuration stored as JSON string.
     Stores fundraiser settings, donation config, etc.
     Parse JSON in application code (e.g., Jackson ObjectMapper in Spring Boot).';

-- Example usage (stored as JSON string):
-- metadata: '{"isFundraiserEvent":true,"isCharityEvent":true,"donationConfig":{"useZeroFeeProvider":true,"zeroFeeProvider":"GIVEBUTTER","givebutterCampaignId":"campaign_123"}}'
```

**Verification:**

```sql
-- Check if column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'event_details'
  AND column_name = 'metadata';

-- Should return: metadata | text
```

---

### 2. Add `GIVEBUTTER` to `payment_provider_type` Enum

**Issue:** The `payment_provider_type` enum needs to include `GIVEBUTTER` to support Givebutter payment provider configuration.

**Migration Script:**

```sql
-- =====================================================
-- Add GIVEBUTTER to payment_provider_type enum
-- Purpose: Support Givebutter as a payment provider option
-- =====================================================

-- Check if enum exists (if payment system is already implemented)
DO $$
BEGIN
    -- Check if payment_provider_type enum exists
    IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'payment_provider_type'
    ) THEN
        -- Add GIVEBUTTER value if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'GIVEBUTTER'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_provider_type')
        ) THEN
            ALTER TYPE payment_provider_type ADD VALUE IF NOT EXISTS 'GIVEBUTTER';
            RAISE NOTICE 'Added GIVEBUTTER to payment_provider_type enum';
        ELSE
            RAISE NOTICE 'GIVEBUTTER already exists in payment_provider_type enum';
        END IF;
    ELSE
        -- Create enum if it doesn't exist (for new installations)
        CREATE TYPE payment_provider_type AS ENUM (
            'STRIPE',
            'PAYPAL',
            'ACP',
            'AP2',
            'SQUARE',
            'CRYPTO',
            'GIVEBUTTER'
        );
        RAISE NOTICE 'Created payment_provider_type enum with GIVEBUTTER';
    END IF;
END $$;

-- Verify enum values
SELECT unnest(enum_range(NULL::payment_provider_type)) AS provider_type;
-- Expected: STRIPE, PAYPAL, ACP, AP2, SQUARE, CRYPTO, GIVEBUTTER
```

**Note:** If the domain-agnostic payment system tables (`payment_provider_config`, `payment_transaction`) don't exist yet, they need to be created first. See `documentation/domain_agnostic_payment/DATABASE_SCHEMA.md` for complete schema.

---

### 3. Verify `payment_type` Enum Includes Required Values

**Issue:** Ensure `payment_type` enum includes `TICKET_SALE`, `DONATION`, and `OFFERING` for Givebutter routing.

**Verification Script:**

```sql
-- =====================================================
-- Verify payment_type enum values
-- Purpose: Ensure all required payment types exist
-- =====================================================

-- Check if enum exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'payment_type'
    ) THEN
        -- List all enum values
        RAISE NOTICE 'Current payment_type enum values:';
        PERFORM unnest(enum_range(NULL::payment_type));
    ELSE
        -- Create enum if it doesn't exist
        CREATE TYPE payment_type AS ENUM (
            'TICKET_SALE',
            'DONATION',
            'OFFERING',
            'SUBSCRIPTION',
            'MERCHANDISE',
            'MEMBERSHIP',
            'REFUND',
            'DONATION_ZERO_FEE'  -- Optional: for explicit zero-fee donations
        );
        RAISE NOTICE 'Created payment_type enum';
    END IF;
END $$;

-- Verify required values exist
SELECT
    enumlabel AS payment_type,
    CASE
        WHEN enumlabel IN ('TICKET_SALE', 'DONATION', 'OFFERING')
        THEN '✅ Required for Givebutter'
        ELSE 'Optional'
    END AS status
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_type')
ORDER BY enumsortorder;
```

**Expected Values:**
- ✅ `TICKET_SALE` - For ticketed fundraiser events
- ✅ `DONATION` - For donation-based fundraisers
- ✅ `OFFERING` - For Mass offerings
- Optional: `DONATION_ZERO_FEE` - Explicit zero-fee donation type

---

## Complete Migration Script

**File:** `migrations/add_givebutter_support.sql`

```sql
-- =====================================================
-- Migration: Add Givebutter Support
-- Date: 2025-01-XX
-- Description: Adds metadata column to event_details and GIVEBUTTER to payment_provider_type enum
-- =====================================================

BEGIN;

-- Step 1: Add metadata column to event_details (using TEXT, not JSONB)
ALTER TABLE public.event_details
    ADD COLUMN IF NOT EXISTS metadata TEXT DEFAULT NULL;

COMMENT ON COLUMN public.event_details.metadata IS
    'Flexible TEXT field for event configuration stored as JSON string.
     Stores fundraiser settings, donation config, etc.
     Parse JSON in application code using Jackson ObjectMapper (Spring Boot) or JSON.parse (JavaScript).';

-- Optional: Add functional GIN index for JSON queries (if needed for performance)
-- CREATE INDEX IF NOT EXISTS idx_event_details_metadata_jsonb
--     ON public.event_details USING GIN ((metadata::jsonb))
--     WHERE metadata IS NOT NULL;

-- Step 2: Add GIVEBUTTER to payment_provider_type enum
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

-- Step 3: Verify payment_type enum has required values
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
        CREATE TYPE payment_type AS ENUM (
            'TICKET_SALE', 'DONATION', 'OFFERING', 'SUBSCRIPTION',
            'MERCHANDISE', 'MEMBERSHIP', 'REFUND', 'DONATION_ZERO_FEE'
        );
    END IF;
END $$;

COMMIT;

-- Verification queries
SELECT 'Metadata column added' AS status
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_details' AND column_name = 'metadata'
);

SELECT 'GIVEBUTTER enum value added' AS status
WHERE EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'GIVEBUTTER'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_provider_type')
);
```

---

## Rollback Script

**File:** `migrations/rollback_givebutter_support.sql`

```sql
-- =====================================================
-- Rollback: Remove Givebutter Support
-- WARNING: This will remove metadata column and GIVEBUTTER enum value
-- =====================================================

BEGIN;

-- Remove metadata column (WARNING: This will delete all metadata!)
-- Only run if you're sure you want to remove this data
-- ALTER TABLE public.event_details DROP COLUMN IF EXISTS metadata;

-- Note: Cannot remove enum values in PostgreSQL
-- GIVEBUTTER will remain in enum but can be ignored in application code

COMMIT;
```

---

## Testing the Schema Changes

### Test 1: Verify Metadata Column

```sql
-- Test inserting fundraiser event metadata (as JSON string)
UPDATE event_details
SET metadata = '{"isFundraiserEvent":true,"donationConfig":{"useZeroFeeProvider":true,"zeroFeeProvider":"GIVEBUTTER","givebutterCampaignId":"campaign_123"}}'
WHERE id = 1  -- Replace with actual event ID
RETURNING id, metadata;

-- Test querying fundraiser events (using JSON functions on TEXT)
SELECT id, title,
       metadata::jsonb->>'isFundraiserEvent' AS is_fundraiser,
       metadata::jsonb->'donationConfig'->>'zeroFeeProvider' AS provider
FROM event_details
WHERE metadata IS NOT NULL
  AND metadata::jsonb->>'isFundraiserEvent' = 'true';

-- Note: Application code should parse JSON string using Jackson ObjectMapper
-- Example Java: ObjectMapper mapper = new ObjectMapper();
--              Map<String, Object> meta = mapper.readValue(event.getMetadata(), Map.class);
```

### Test 2: Verify Enum Values

```sql
-- Test payment_provider_type enum
SELECT unnest(enum_range(NULL::payment_provider_type)) AS provider_type;

-- Test payment_type enum
SELECT unnest(enum_range(NULL::payment_type)) AS payment_type;
```

### Test 3: Query Performance (TEXT with JSON parsing)

```sql
-- Query fundraiser events (cast TEXT to JSONB for querying)
EXPLAIN ANALYZE
SELECT id, title, metadata
FROM event_details
WHERE metadata IS NOT NULL
  AND metadata::jsonb @> '{"isFundraiserEvent": true}'::jsonb;

-- Note: For better performance, consider adding a functional index:
-- CREATE INDEX idx_event_details_metadata_jsonb
--     ON event_details USING GIN ((metadata::jsonb))
--     WHERE metadata IS NOT NULL;
```

---

## Summary of Changes

| Change | Table/Type | Action | Required |
|--------|-----------|--------|----------|
| Add `metadata` TEXT column | `event_details` | `ALTER TABLE ADD COLUMN` | ✅ **YES** |
| Add `GIVEBUTTER` enum value | `payment_provider_type` | `ALTER TYPE ADD VALUE` | ✅ **YES** |
| Verify `payment_type` enum | `payment_type` | Verify/Create | ✅ **YES** |
| Optional: Add functional GIN index | `event_details.metadata` | `CREATE INDEX` | ⚠️ Optional (for JSON queries) |

---

## Dependencies

1. **Domain-Agnostic Payment System:** If `payment_provider_config` and `payment_transaction` tables don't exist, they must be created first. See `documentation/domain_agnostic_payment/DATABASE_SCHEMA.md`.

2. **Event Details Table:** Must exist (already exists in current schema).

---

## Notes

1. **Metadata Column:** The `metadata` TEXT column stores JSON as a string (matching existing codebase pattern). Parse JSON in application code using Jackson ObjectMapper. The Givebutter integration uses:
   - `metadata.isFundraiserEvent` (boolean)
   - `metadata.isCharityEvent` (boolean)
   - `metadata.donationConfig.useZeroFeeProvider` (boolean)
   - `metadata.donationConfig.zeroFeeProvider` (string: "GIVEBUTTER")
   - `metadata.donationConfig.givebutterCampaignId` (string)

   **Example JSON string:**
   ```json
   {
     "isFundraiserEvent": true,
     "isCharityEvent": true,
     "donationConfig": {
       "useZeroFeeProvider": true,
       "zeroFeeProvider": "GIVEBUTTER",
       "givebutterCampaignId": "campaign_123"
     }
   }
   ```

2. **Enum Values:** PostgreSQL enums cannot have values removed. If `GIVEBUTTER` is added, it will remain in the enum even if not used. This is acceptable and doesn't cause issues.

3. **Backward Compatibility:** All changes are backward compatible:
   - Adding `metadata` column with default `'{}'` doesn't break existing queries
   - Adding enum value doesn't affect existing data
   - Existing events without metadata will work normally

---

## References

- **Backend PRD:** `GIVEBUTTER_BACKEND_PRD.html` - Section 2 (Database Schema Changes)
- **Database Schema Doc:** `documentation/domain_agnostic_payment/DATABASE_SCHEMA.md`
- **Event Configuration:** `GIVEBUTTER_BACKEND_PRD.html` - Section 11 (Event Configuration for Fundraiser Events)

