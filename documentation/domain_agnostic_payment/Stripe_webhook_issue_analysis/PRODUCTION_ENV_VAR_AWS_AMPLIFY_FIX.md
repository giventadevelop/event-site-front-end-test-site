# Production Environment Variable Fix - AWS Amplify Prefix Issue

## Problem

Environment variables `NEXT_PUBLIC_TENANT_ID` and `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` work fine locally but are missing in production (both desktop and mobile browsers), even though they are set in AWS Amplify console.

**Symptoms**:
- Backend receives `tenantId=null` or `tenantId='tenant_demo_001'` (wrong default)
- Backend receives `paymentMethodDomainId=null`
- Environment variables are verified as set in AWS Amplify console
- Code works perfectly in local development

## Root Cause

**AWS Amplify prefixes environment variables with `AMPLIFY_` at runtime**, even if you set them without the prefix in the console. This is documented in the cursor rules:

> **AWS Amplify Environment Variable Pattern**: AWS Amplify prefixes environment variables with `AMPLIFY_` in the runtime, even if you set them without the prefix in the console.

**Example**:
- You set: `NEXT_PUBLIC_TENANT_ID=tenant_demo_002` in AWS Amplify console
- AWS Amplify makes it available as: `AMPLIFY_NEXT_PUBLIC_TENANT_ID=tenant_demo_002` at runtime
- Code checks: `process.env.NEXT_PUBLIC_TENANT_ID` → **undefined** ❌
- Code should check: `process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID` → **tenant_demo_002** ✅

## Solution

### 1. Update `getTenantId()` to Check AMPLIFY_ Prefix First

**Location**: `src/lib/env.ts` line 27-33

**Before**:
```typescript
export function getTenantId() {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  if (!tenantId) {
    throw new Error('NEXT_PUBLIC_TENANT_ID is not set in environment variables');
  }
  return tenantId;
}
```

**After**:
```typescript
export function getTenantId() {
  const tenantId =
    process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID ||
    process.env.NEXT_PUBLIC_TENANT_ID;
  if (!tenantId) {
    throw new Error('NEXT_PUBLIC_TENANT_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_TENANT_ID or NEXT_PUBLIC_TENANT_ID');
  }
  return tenantId;
}
```

### 2. Update `getPaymentMethodDomainId()` to Check AMPLIFY_ Prefix First

**Location**: `src/lib/env.ts` line 40-46

**Before**:
```typescript
export function getPaymentMethodDomainId() {
  const paymentMethodDomainId = process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID;
  if (!paymentMethodDomainId) {
    throw new Error('NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables');
  }
  return paymentMethodDomainId;
}
```

**After**:
```typescript
export function getPaymentMethodDomainId() {
  const paymentMethodDomainId =
    process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID ||
    process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID;
  if (!paymentMethodDomainId) {
    throw new Error('NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID is not set in environment variables. Check AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID or NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID');
  }
  return paymentMethodDomainId;
}
```

### 3. Update `next.config.mjs` to Include AMPLIFY_ Prefix Fallback

**Location**: `next.config.mjs` line 158-159

**Before**:
```javascript
NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID,
NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID,
```

**After**:
```javascript
// Tenant ID and Payment Method Domain ID (prioritize AMPLIFY_ prefix for AWS Amplify)
NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID,
AMPLIFY_NEXT_PUBLIC_TENANT_ID: process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID,
NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID || process.env.NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID,
AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID: process.env.AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID,
```

## Pattern Consistency

This matches the pattern used for other environment variables in the codebase:

**Example from `getApiJwtUser()`**:
```typescript
export function getApiJwtUser() {
  return (
    process.env.AMPLIFY_API_JWT_USER ||
    process.env.API_JWT_USER ||
    process.env.NEXT_PUBLIC_API_JWT_USER
  );
}
```

**Example from `next.config.mjs`**:
```javascript
API_JWT_USER: process.env.AMPLIFY_API_JWT_USER || process.env.API_JWT_USER,
NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.AMPLIFY_NEXT_PUBLIC_APP_URL,
```

## Why This Works

### Local Development
- Environment variables are read directly from `.env.local` or `.env`
- No `AMPLIFY_` prefix is added
- Code falls back to `process.env.NEXT_PUBLIC_TENANT_ID` ✅

### AWS Amplify Production
- AWS Amplify prefixes variables with `AMPLIFY_` at runtime
- Code checks `process.env.AMPLIFY_NEXT_PUBLIC_TENANT_ID` first ✅
- Falls back to `process.env.NEXT_PUBLIC_TENANT_ID` if not found ✅

## Verification Steps

### 1. Check Production Logs

After deploying, check logs for:
```
[createTransaction] ✅ Payment Method Domain ID retrieved: {
  paymentMethodDomainId: 'pmd_1SWrMSK5BrggeAHMmHxUd9F2',
  hasValue: true,
  timestamp: '...'
}
```

### 2. Verify Backend Receives Values

Backend logs should show:
```
EventTicketTransactionDTO{
  tenantId='tenant_demo_002',  // ✅ Correct tenant
  paymentMethodDomainId='pmd_1SWrMSK5BrggeAHMmHxUd9F2',  // ✅ Correct Payment Method Domain ID
  ...
}
```

### 3. Test Both Desktop and Mobile Flows

- **Desktop**: Checkout Session flow should work
- **Mobile**: Payment Intent flow should work
- Both should send correct `tenantId` and `paymentMethodDomainId` to backend

## AWS Amplify Environment Variable Setup

### Option 1: Set Without AMPLIFY_ Prefix (Recommended)

**AWS Amplify Console**:
- **Key**: `NEXT_PUBLIC_TENANT_ID`
- **Value**: `tenant_demo_002`
- **Key**: `NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID`
- **Value**: `pmd_1SWrMSK5BrggeAHMmHxUd9F2`

**Result**: AWS Amplify will make them available as `AMPLIFY_NEXT_PUBLIC_TENANT_ID` and `AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID` at runtime, and our code will pick them up correctly.

### Option 2: Set With AMPLIFY_ Prefix (Also Works)

**AWS Amplify Console**:
- **Key**: `AMPLIFY_NEXT_PUBLIC_TENANT_ID`
- **Value**: `tenant_demo_002`
- **Key**: `AMPLIFY_NEXT_PUBLIC_PAYMENT_METHOD_DOMAIN_ID`
- **Value**: `pmd_1SWrMSK5BrggeAHMmHxUd9F2`

**Result**: Code will pick them up directly without needing fallback.

## Summary

**Root Cause**: AWS Amplify prefixes environment variables with `AMPLIFY_` at runtime.

**Fix**: Update `getTenantId()` and `getPaymentMethodDomainId()` to check `AMPLIFY_` prefix first, matching the pattern used for other environment variables.

**Result**: Environment variables will work correctly in both local development and AWS Amplify production.

## References

- Cursor rules: `.cursor/rules/cursor_rules.mdc` - AWS Amplify Environment Variable Pattern
- Similar pattern: `getApiJwtUser()` in `src/lib/env.ts`
- Similar pattern: `NEXT_PUBLIC_APP_URL` in `next.config.mjs`









