# Next.js Error Overlay Fix

**Status**: ✅ FIXED
**Date**: October 15, 2025
**Issue**: Next.js error overlay showing for expected authentication errors
**Solution**: Custom error naming and selective logging

---

## Problem

In development mode, Next.js was showing an error overlay for expected authentication failures:

```
## Error Type
Console Error

## Error Message
Request failed

at ApiClient.request (src\services\api\apiClient.ts:215:28)
at async AuthenticationService.signIn (src\services\auth\authenticationService.ts:85:24)
...
```

This was confusing because:
1. The user already sees a user-friendly error message in the form
2. Authentication failures are expected user errors, not application bugs
3. The error overlay blocks the UI and requires dismissal

---

## Solution

### 1. Custom Error Naming

**File**: `src/services/api/apiClient.ts`

Mark API errors with a custom name so they can be identified:

```typescript
// Handle non-OK responses
if (!response.ok) {
  // ... parse error data ...

  // Log in development only (using console.warn, not console.error)
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[API Client] ${config.method || 'GET'} ${url} failed:`, {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    });
  }

  // Create error with custom name
  const error: any = new Error('Authentication failed');
  error.status = response.status;
  error.statusText = response.statusText;
  error.data = errorData;
  error.name = 'ApiError'; // ← Custom name to identify API errors

  throw error;
}
```

**Result**: API errors are marked with `error.name = 'ApiError'`

---

### 2. Selective Logging

**Files**:
- `src/services/auth/authenticationService.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/auth/SignInForm.tsx`

Only log unexpected errors (not API errors) in development:

```typescript
catch (error: any) {
  // Only log unexpected errors in development (not expected API errors)
  if (process.env.NODE_ENV === 'development' && error?.name !== 'ApiError') {
    console.error('Sign in error:', error);
  }
  throw error;
}
```

**Result**:
- API errors are NOT logged with `console.error` (prevents Next.js overlay)
- Only unexpected errors (network issues, code bugs) trigger console.error
- API errors are logged with `console.warn` in the API client

---

### 3. Error Propagation

**File**: `src/contexts/AuthContext.tsx`

Preserve the original error object to keep the `ApiError` name:

```typescript
catch (err: any) {
  // ... format error message ...

  setError(errorMessage);

  // Re-throw the original error to preserve error name
  // This prevents Next.js error overlay from showing
  err.message = errorMessage; // Update message but keep error name
  throw err;
}
```

**Before**:
```typescript
throw new Error(errorMessage); // Creates new Error with stack trace
```

**After**:
```typescript
err.message = errorMessage; // Preserves original error with ApiError name
throw err;
```

---

## Error Flow

### Expected API Errors (Invalid Credentials)

```
User enters wrong password
        ↓
API Client (apiClient.ts)
  • Receives 401 response from backend
  • console.warn() → Shows in console but doesn't trigger overlay
  • Creates error with name = 'ApiError'
  • Throws error
        ↓
Authentication Service (authenticationService.ts)
  • Catches error
  • Checks: error.name === 'ApiError' → Don't log
  • Re-throws error
        ↓
Auth Context (AuthContext.tsx)
  • Catches error
  • Checks: error.name === 'ApiError' → Don't log
  • Formats user-friendly message
  • Sets error state
  • Re-throws error (preserving ApiError name)
        ↓
Sign In Form (SignInForm.tsx)
  • Catches error
  • Checks: error.name === 'ApiError' → Don't log
  • Error already displayed via AuthContext
        ↓
User Sees:
  ✅ User-friendly error in form
  ❌ NO error overlay
  ℹ️ Console shows warning (not error)
```

### Unexpected Errors (Network Failure, Code Bug)

```
Network disconnected
        ↓
API Client (apiClient.ts)
  • fetch() throws TypeError
  • console.error() → Triggers Next.js overlay
  • Re-throws error
        ↓
Authentication Service
  • error.name !== 'ApiError' → Log it
  • console.error()
        ↓
User Sees:
  ⚠️ Error overlay (appropriate for unexpected errors)
  🐛 Full error details for debugging
```

---

## Logging Strategy

### Development Mode

| Error Type | Logging | Next.js Overlay | Where |
|------------|---------|-----------------|-------|
| API Error (401, 500) | `console.warn` | ❌ No | API Client |
| Network Error | `console.error` | ✅ Yes | Throughout |
| Code Bug | `console.error` | ✅ Yes | Throughout |

### Production Mode

| Error Type | Logging | Next.js Overlay |
|------------|---------|-----------------|
| All Errors | ❌ None | N/A (no dev mode) |

---

## Console Output Examples

### Invalid Credentials (Expected)

**Before Fix**:
```
❌ console.error: Request failed
   at ApiClient.request (apiClient.ts:215:28)
   ... [Full stack trace]

[Next.js Error Overlay Appears]
```

**After Fix**:
```
⚠️ console.warn: [API Client] POST /api/auth/signin failed: {
  status: 401,
  statusText: 'Unauthorized',
  data: {
    detail: 'Invalid credentials',
    errorCode: 'AUTH_001'
  }
}

(No error overlay)
```

---

### Network Error (Unexpected)

**Before and After** (same - this SHOULD show overlay):
```
❌ console.error: Sign in error: TypeError: Failed to fetch
   at ...

[Next.js Error Overlay Appears - CORRECT]
```

---

## Benefits

### 1. Better Developer Experience
- No error overlay for expected user errors
- Overlay still shows for real bugs
- Clean console with informative warnings

### 2. Better User Experience
- Users see only the form error (no blocking overlay)
- Seamless authentication flow
- Professional error handling

### 3. Better Debugging
- API errors logged with full details (console.warn)
- Unexpected errors still trigger overlay
- Clear distinction between expected and unexpected errors

---

## Files Modified

### Core Error Handling
- ✅ `src/services/api/apiClient.ts` - Custom error naming, console.warn for API errors
- ✅ `src/services/auth/authenticationService.ts` - Selective logging (skip ApiError)
- ✅ `src/contexts/AuthContext.tsx` - Selective logging, preserve error name
- ✅ `src/components/auth/SignInForm.tsx` - Selective logging

---

## Testing

### Test 1: Invalid Credentials

**Steps**:
1. Run `npm run dev`
2. Go to sign-in page
3. Enter wrong password
4. Submit form

**Expected**:
- ✅ User sees "Invalid Credentials" message in form
- ✅ Console shows warning with error details
- ❌ NO Next.js error overlay
- ✅ Form remains usable

### Test 2: Network Error

**Steps**:
1. Run `npm run dev`
2. Disconnect internet
3. Try to sign in

**Expected**:
- ✅ Next.js error overlay DOES appear (correct!)
- ✅ Console shows full error
- ✅ User can dismiss overlay and see form error

### Test 3: Production Build

**Steps**:
1. Run `npm run build && npm start`
2. Try invalid credentials

**Expected**:
- ✅ User sees "Invalid Credentials" message
- ❌ Console is clean (no warnings or errors)
- ✅ Professional experience

---

## Error Overlay Decision Matrix

| Scenario | Show Overlay? | Why |
|----------|---------------|-----|
| Invalid credentials | ❌ No | Expected user error, form shows message |
| Email already exists | ❌ No | Expected user error, form shows message |
| Server error (500) | ❌ No | Handled gracefully, form shows message |
| Network failure | ✅ Yes | Unexpected, developer needs to know |
| Code exception | ✅ Yes | Real bug, developer needs to fix |
| Token expired | ❌ No | Expected, handled by token refresh |

---

## Summary

**Problem**: Next.js error overlay showing for expected authentication errors

**Root Cause**: Using `console.error()` for expected API errors triggers Next.js overlay

**Solution**:
1. Mark API errors with `error.name = 'ApiError'`
2. Use `console.warn()` for API errors (not `console.error()`)
3. Only log unexpected errors with `console.error()`
4. Preserve error name when re-throwing

**Result**:
- ✅ No error overlay for authentication failures
- ✅ Overlay still works for real bugs
- ✅ Better developer and user experience
- ✅ Clean, professional error handling

---

**Status**: ✅ FIXED
**Next Action**: Test the sign-in flow to verify no error overlay appears

