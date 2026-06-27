# Frontend Refactoring Prompt: Backend Schema Changes Alignment

**Project:** Frontend Alignment with Backend Refactoring
**Frontend Repository:** Current workspace (Next.js/TypeScript)
**Date:** January 2025
**Priority:** High - Required to match backend changes

---

## Executive Summary

This document outlines frontend code changes required to align with backend refactoring:
1. **Remove deprecated fields** from payment transaction DTOs (`settlementBatchId`, `platformInvoiceId`, `manualPaymentReference`)
2. **Add GIVEBUTTER** to `PaymentProviderType` enum
3. **Add metadata field** to `EventDetailsDTO` for fundraiser configuration

---

## Part 1: Remove Deprecated Fields from Payment Transaction DTOs

### 1.1 Update `PaymentTransactionDTO`

**File:** `src/types/index.ts`
**Lines:** 1111-1142

**Current Code:**
```typescript
export interface PaymentTransactionDTO {
  id?: number;
  tenantId: string;
  transactionReference: string;
  providerType: PaymentProviderType;
  paymentUseCase: PaymentUseCase;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  providerCustomerId?: string;
  providerSessionId?: string;
  failureReason?: string;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
  settlementBatchId?: string;        // ❌ REMOVE THIS
  platformInvoiceId?: string;        // ❌ REMOVE THIS
  manualPaymentReference?: string;   // ❌ REMOVE THIS
  metadata?: Record<string, any>;
  // ... rest of fields
}
```

**Updated Code:**
```typescript
export interface PaymentTransactionDTO {
  id?: number;
  tenantId: string;
  transactionReference: string;
  providerType: PaymentProviderType;
  paymentUseCase: PaymentUseCase;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  providerCustomerId?: string;
  providerSessionId?: string;
  failureReason?: string;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
  // REMOVED: settlementBatchId, platformInvoiceId, manualPaymentReference
  metadata?: Record<string, any>;
  // Related entities
  eventId?: number;
  userId?: number;
  membershipSubscriptionId?: number;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  // Relations
  event?: EventDetailsDTO;
  user?: UserProfileDTO;
}
```

### 1.2 Check `UserPaymentTransactionDTO`

**File:** `src/types/index.ts`
**Lines:** 547-562

**Status:** ✅ Already correct - `UserPaymentTransactionDTO` does not contain these deprecated fields.

**Note:** Lines 1081-1082 show references, but these appear to be in a different context (possibly `PlatformSettlementDTO` or `PlatformInvoiceDTO`). Verify these are not part of `UserPaymentTransactionDTO`.

### 1.3 Verify No Active Usage

**Action Required:**
- Search codebase for any components or API calls that reference these fields
- Remove any code that sets or reads these fields
- Update any form components that display these fields

**Search Results:**
- ✅ No active usage found in components
- ⚠️ `manualPaymentReference` may be used for Zelle manual payments - verify if this is still needed

---

## Part 2: Add GIVEBUTTER to PaymentProviderType Enum

### 2.1 Update PaymentProviderType Enum

**File:** `src/types/index.ts`
**Lines:** 990-997

**Current Code:**
```typescript
export enum PaymentProviderType {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  REVOLUT = 'REVOLUT',
  ZEFFY = 'ZEFFY',
  ZELLE = 'ZELLE',
  CEFI = 'CEFI',
}
```

**Updated Code:**
```typescript
export enum PaymentProviderType {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  REVOLUT = 'REVOLUT',
  ZEFFY = 'ZEFFY',
  ZELLE = 'ZELLE',
  CEFI = 'CEFI',
  GIVEBUTTER = 'GIVEBUTTER',  // ✅ ADD THIS
}
```

### 2.2 Update Payment Provider Display Logic

**Action Required:**
- Check if there are any UI components that display payment provider names
- Ensure GIVEBUTTER is handled in provider selection dropdowns
- Update any provider-specific logic or icons

**Files to Check:**
- Payment provider selection components
- Payment checkout components
- Admin payment configuration pages

---

## Part 3: Add Metadata Field to EventDetailsDTO

### 3.1 Update EventDetailsDTO

**File:** `src/types/index.ts`
**Lines:** 64-129

**Current Code:**
```typescript
export interface EventDetailsDTO {
  /** Unique event ID */
  id?: number;
  /** Tenant ID */
  tenantId?: string;
  /** Event title */
  title: string;
  // ... other fields ...
  /** Live event priority ranking */
  liveEventPriorityRanking: number;
  /** Created at (ISO date-time) */
  createdAt: string;
  /** Updated at (ISO date-time) */
  updatedAt: string;
  /** Created by user profile */
  createdBy?: UserProfileDTO;
  /** Event type details */
  eventType?: EventTypeDetailsDTO;
  /** Discount codes */
  discountCodes?: DiscountCodeDTO[];
}
```

**Updated Code:**
```typescript
export interface EventDetailsDTO {
  /** Unique event ID */
  id?: number;
  /** Tenant ID */
  tenantId?: string;
  /** Event title */
  title: string;
  // ... other fields ...
  /** Live event priority ranking */
  liveEventPriorityRanking: number;
  /** Metadata - Flexible TEXT field for event configuration stored as JSON string */
  metadata?: string;  // ✅ ADD THIS - JSON string, parse with JSON.parse()
  /** Created at (ISO date-time) */
  createdAt: string;
  /** Updated at (ISO date-time) */
  updatedAt: string;
  /** Created by user profile */
  createdBy?: UserProfileDTO;
  /** Event type details */
  eventType?: EventTypeDetailsDTO;
  /** Discount codes */
  discountCodes?: DiscountCodeDTO[];
}
```

### 3.2 Add Helper Functions for Metadata Parsing

**File:** `src/types/index.ts` or `src/lib/eventUtils.ts` (create new file)

**Add helper functions:**
```typescript
/**
 * Parse event metadata JSON string to object
 */
export function parseEventMetadata(metadata?: string): Record<string, any> {
  if (!metadata || metadata.trim() === '') {
    return {};
  }
  try {
    return JSON.parse(metadata);
  } catch (error) {
    console.error('Failed to parse event metadata:', error);
    return {};
  }
}

/**
 * Check if event is a fundraiser event
 */
export function isFundraiserEvent(event: EventDetailsDTO): boolean {
  const metadata = parseEventMetadata(event.metadata);
  return Boolean(metadata.isFundraiserEvent);
}

/**
 * Check if event is a charity event
 */
export function isCharityEvent(event: EventDetailsDTO): boolean {
  const metadata = parseEventMetadata(event.metadata);
  return Boolean(metadata.isCharityEvent);
}

/**
 * Get Givebutter campaign ID from event metadata
 */
export function getGivebutterCampaignId(event: EventDetailsDTO): string | null {
  const metadata = parseEventMetadata(event.metadata);
  const donationConfig = metadata.donationConfig;
  if (donationConfig && donationConfig.zeroFeeProvider === 'GIVEBUTTER') {
    return donationConfig.givebutterCampaignId || null;
  }
  return null;
}

/**
 * Check if event uses zero-fee provider (Givebutter)
 */
export function usesZeroFeeProvider(event: EventDetailsDTO): boolean {
  const metadata = parseEventMetadata(event.metadata);
  const donationConfig = metadata.donationConfig;
  return Boolean(donationConfig?.useZeroFeeProvider);
}

/**
 * Get zero-fee provider name from event metadata
 */
export function getZeroFeeProvider(event: EventDetailsDTO): string | null {
  const metadata = parseEventMetadata(event.metadata);
  const donationConfig = metadata.donationConfig;
  return donationConfig?.zeroFeeProvider || null;
}
```

### 3.3 Update Event Form Components

**Action Required:**
- Check event creation/edit forms
- Add metadata field handling if fundraiser events are created/edited from frontend
- Ensure metadata is properly serialized when saving events

**Files to Check:**
- Event creation forms
- Event edit forms
- Admin event management pages

---

## Part 4: Update Payment Provider Configuration

### 4.1 Check Payment Provider Config DTO

**File:** `src/types/index.ts`
**Lines:** 1092-1106

**Status:** Verify that `PaymentProviderConfigDTO` supports GIVEBUTTER provider type.

**Current Code:**
```typescript
export interface PaymentProviderConfigDTO {
  id?: number;
  tenantId: string;
  providerName: string;  // Should accept 'GIVEBUTTER'
  paymentUseCase?: string;
  isActive: boolean;
  // ... other fields
}
```

**Action:** Ensure `providerName` field accepts `'GIVEBUTTER'` as a valid value (should work with enum update).

---

## Part 5: Update Payment Flow Components

### 5.1 Check UniversalPaymentCheckout Component

**File:** `src/components/UniversalPaymentCheckout.tsx`

**Action Required:**
- Verify that GIVEBUTTER provider type is handled in the payment flow
- Add GIVEBUTTER-specific UI if needed
- Ensure payment initialization works with GIVEBUTTER

**Current Status:** Component uses `ProviderType` enum - will automatically support GIVEBUTTER once enum is updated.

### 5.2 Check Payment Provider Selection

**Action Required:**
- Verify payment provider selection logic handles GIVEBUTTER
- Update any provider-specific routing logic
- Ensure GIVEBUTTER is shown in provider selection UI when appropriate

---

## Part 6: Testing Checklist

### 6.1 Type Safety
- [ ] Verify TypeScript compiles without errors after removing deprecated fields
- [ ] Verify no type errors related to PaymentProviderType enum
- [ ] Verify EventDetailsDTO metadata field is properly typed

### 6.2 Functionality
- [ ] Test payment flow with GIVEBUTTER provider (when backend is ready)
- [ ] Test event metadata parsing helper functions
- [ ] Test fundraiser event detection logic
- [ ] Verify no runtime errors from accessing removed fields

### 6.3 Integration
- [ ] Verify API calls work correctly after DTO changes
- [ ] Test event creation/editing with metadata
- [ ] Verify payment provider configuration includes GIVEBUTTER

---

## Part 7: Files to Update

### Required Changes

1. **`src/types/index.ts`**
   - Remove `settlementBatchId`, `platformInvoiceId`, `manualPaymentReference` from `PaymentTransactionDTO` (lines 1128-1130)
   - Add `GIVEBUTTER` to `PaymentProviderType` enum (line ~997)
   - Add `metadata?: string` to `EventDetailsDTO` (after line 118)

2. **`src/lib/eventUtils.ts`** (create new file)
   - Add metadata parsing helper functions
   - Add fundraiser event detection functions
   - Add Givebutter campaign ID extraction functions

### Optional Changes (if needed)

3. **Payment Provider Components**
   - Update provider selection UI to include GIVEBUTTER
   - Add GIVEBUTTER-specific payment flow handling

4. **Event Forms**
   - Add metadata field handling for fundraiser events
   - Add UI for configuring Givebutter campaign ID

---

## Part 8: Migration Notes

### Breaking Changes

1. **PaymentTransactionDTO Changes:**
   - ⚠️ **Breaking:** Removing `settlementBatchId`, `platformInvoiceId`, `manualPaymentReference` fields
   - **Impact:** Any code that reads/writes these fields will break
   - **Action:** Search codebase and remove all references

2. **PaymentProviderType Enum:**
   - ✅ **Non-breaking:** Adding GIVEBUTTER is additive
   - **Impact:** None - existing code continues to work

3. **EventDetailsDTO Changes:**
   - ✅ **Non-breaking:** Adding optional `metadata` field
   - **Impact:** None - existing code continues to work
   - **Action:** New code can use metadata for fundraiser configuration

### Backward Compatibility

- All changes are backward compatible except for removed fields
- Existing events without metadata will work normally
- Existing payment transactions will continue to work (backend handles missing fields)

---

## Summary

### Changes Required

| Change | File | Lines | Priority |
|--------|------|-------|----------|
| Remove deprecated fields | `src/types/index.ts` | 1128-1130 | ✅ **HIGH** |
| Add GIVEBUTTER enum | `src/types/index.ts` | ~997 | ✅ **HIGH** |
| Add metadata field | `src/types/index.ts` | ~118 | ✅ **HIGH** |
| Add helper functions | `src/lib/eventUtils.ts` | New file | ⚠️ **MEDIUM** |

### Estimated Effort

- **Type Updates:** 15 minutes
- **Helper Functions:** 30 minutes
- **Testing:** 1 hour
- **Total:** ~2 hours

---

## References

- **Backend Refactoring:** `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/BACKEND_REFACTORING_PROMPT.md`
- **Database Schema Changes:** `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/GIVEBUTTER_DATABASE_SCHEMA_CHANGES.md`
- **Frontend PRD:** `documentation/domain_agnostic_payment/Non_Profit_FundRaiser_GiveButter/GIVEBUTTER_FRONTEND_PRD.html`



