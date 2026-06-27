# Error Handling Guide

**Status**: ✅ PRODUCTION-READY
**Last Updated**: October 14, 2025

---

## Overview

The application now implements **graceful error handling** that shows user-friendly messages instead of technical errors. All technical details are hidden from users in production while remaining available for debugging in development.

---

## Key Features

### ✅ User-Friendly Messages
Users see actionable, clear messages:
- ❌ **Before**: "API Error: 500 Internal Server Error"
- ✅ **After**: "Something went wrong on our end. We're working on it. Please try again in a few minutes."

### ✅ Development vs Production
- **Development**: Full technical error logging in console for debugging
- **Production**: Clean user experience with no technical errors shown

### ✅ Comprehensive Coverage
All error scenarios covered:
- HTTP status codes (400, 401, 404, 500, etc.)
- Application error codes (AUTH_001, AUTH_002, etc.)
- Network errors
- Validation errors
- Server errors

---

## Architecture

### Error Flow

```
API Error
    ↓
API Client (apiClient.ts)
    • Captures error
    • Removes technical message
    • Adds error.status, error.data
    ↓
Authentication Service (authenticationService.ts)
    • Logs only in development
    • Passes error up
    ↓
Auth Context (AuthContext.tsx)
    • Formats error message via errorMessages.ts
    • Sets user-friendly error
    • Logs only in development
    ↓
UI Component (SignInForm.tsx)
    • Displays formatted error
    • Logs only in development
    ↓
User Sees: "Something went wrong. Please try again."
```

---

## Implementation Details

### 1. Error Message Utility

**File**: `src/lib/errorMessages.ts`

Provides centralized error message mapping:

```typescript
import { getErrorMessage, formatErrorForDisplay } from '@/lib/errorMessages';

// Get structured error
const errorDetail = getErrorMessage(error);
// Returns: { title: string, message: string, actionable?: string }

// Get formatted message for display
const message = formatErrorForDisplay(error);
// Returns: "Your session has expired. Please sign in again to continue."
```

**Error Code Mapping**:
```typescript
ERROR_MESSAGES = {
  AUTH_001: { title: 'Invalid Credentials', message: 'The email or password you entered is incorrect.' },
  AUTH_002: { title: 'Session Expired', message: 'Your session has expired.' },
  AUTH_003: { title: 'Invalid Token', message: 'Your authentication token is invalid.' },
  AUTH_004: { title: 'User Not Found', message: 'We couldn\'t find an account with that email.' },
  AUTH_005: { title: 'Account Already Exists', message: 'An account with this email already exists.' },
  // ... more error codes
}
```

**HTTP Status Mapping**:
```typescript
HTTP_STATUS_MESSAGES = {
  400: { title: 'Invalid Request', message: 'The information you provided is invalid.' },
  401: { title: 'Authentication Required', message: 'You need to be signed in to access this.' },
  403: { title: 'Access Denied', message: 'You don\'t have permission to perform this action.' },
  404: { title: 'Not Found', message: 'The requested resource could not be found.' },
  500: { title: 'Server Error', message: 'Something went wrong on our end.' },
  // ... more status codes
}
```

### 2. API Client

**File**: `src/services/api/apiClient.ts`

**Changes**:
```typescript
// Before
const error = new Error(`API Error: ${response.status} ${response.statusText}`);

// After
const error = new Error('Request failed'); // Generic message
error.status = response.status;
error.data = errorData; // Includes backend error details
```

**Benefits**:
- No technical details in error message
- Structured error data preserved
- Error utility can format appropriately

### 3. Authentication Service

**File**: `src/services/auth/authenticationService.ts`

**Changes**:
```typescript
// All auth methods now use:
if (process.env.NODE_ENV === 'development') {
  console.error('Sign in error:', error);
}
```

**Production**: No console errors
**Development**: Full error logging for debugging

### 4. Auth Context

**File**: `src/contexts/AuthContext.tsx`

**Changes**:
```typescript
// All methods now:
1. Only log in development
2. Use formatErrorForDisplay() for user messages
3. Set error with user-friendly message
```

**Example**:
```typescript
const signIn = async (data: SignInData) => {
  try {
    // ... sign in logic
  } catch (err: any) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sign in error:', err);
    }

    // Get user-friendly message
    const { formatErrorForDisplay } = await import('@/lib/errorMessages');
    const errorMessage = formatErrorForDisplay(err);

    setError(errorMessage); // User sees this
    throw new Error(errorMessage);
  }
};
```

### 5. UI Components

**File**: `src/components/auth/SignInForm.tsx`

**Changes**:
```typescript
try {
  await signIn(formData);
  router.push('/dashboard');
} catch (err) {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Sign in failed:', err);
  }
  // Error already displayed by AuthContext
}
```

---

## Error Scenarios

### 1. Invalid Credentials (401)

**User Sees**:
```
❌ Invalid Credentials
The email or password you entered is incorrect.
Please check your credentials and try again.
```

**Console (Development Only)**:
```
Sign in error: Error { status: 401, data: { ... } }
```

### 2. Server Error (500)

**User Sees**:
```
❌ Server Error
Something went wrong on our end.
We're working on it. Please try again in a few minutes.
```

**Console (Development Only)**:
```
Sign in error: Error { status: 500, data: { ... } }
```

### 3. Network Error

**User Sees**:
```
❌ Something Went Wrong
An unexpected error occurred.
Please try again. If the problem persists, contact support.
```

**Console (Development Only)**:
```
Sign in error: TypeError: Failed to fetch
```

### 4. Email Already Exists (409)

**User Sees**:
```
❌ Account Already Exists
An account with this email already exists.
Try signing in instead, or use a different email.
```

### 5. Token Expired (AUTH_002)

**User Sees**:
```
❌ Session Expired
Your session has expired.
Please sign in again to continue.
```

---

## Testing

### Development Testing

```bash
# Run development server
npm run dev

# Test different error scenarios:
# 1. Invalid credentials → see full error in console
# 2. Server error → see full error in console
# 3. Network error → see full error in console
```

**Expected**: Full error details logged to console for debugging

### Production Testing

```bash
# Build for production
npm run build

# Run production build
npm start

# Test same error scenarios
```

**Expected**:
- Users see friendly messages only
- No technical errors in console
- Clean, professional experience

---

## Adding New Error Messages

### Step 1: Add Error Code to Mapping

Edit `src/lib/errorMessages.ts`:

```typescript
export const ERROR_MESSAGES: Record<string, ErrorDetail> = {
  // ... existing errors ...

  AUTH_011: {
    title: 'Account Locked',
    message: 'Your account has been temporarily locked.',
    actionable: 'Please contact support to unlock your account.',
  },
};
```

### Step 2: Backend Returns Error Code

Backend should return RFC 7807 format:

```json
{
  "type": "about:blank",
  "title": "Account Locked",
  "status": 403,
  "detail": "Account locked due to multiple failed attempts",
  "errorCode": "AUTH_011",
  "message": "error.account.locked"
}
```

### Step 3: Test

Frontend automatically picks up the new error code and displays the message.

---

## Best Practices

### ✅ DO

1. **Always use error utility**: Don't create custom error messages inline
2. **Log in development**: Keep `console.error()` wrapped in `NODE_ENV` check
3. **Provide actionable guidance**: Tell users what to do next
4. **Be specific**: "The email or password is incorrect" not just "Error"
5. **Test in production mode**: Verify no technical errors leak

### ❌ DON'T

1. **Show technical details to users**: No stack traces, API endpoints, or error codes in UI
2. **Log sensitive data**: Don't log passwords, tokens, or personal info
3. **Use generic messages for auth errors**: Be specific about what went wrong
4. **Ignore errors**: Always handle and display appropriately
5. **Let errors crash the app**: Use try-catch consistently

---

## Monitoring & Debugging

### Development

**Console Errors Available**: Full error objects with:
- Status codes
- Response data
- Stack traces
- Request details

**Use**:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.error('Detailed error:', {
    status: error.status,
    data: error.data,
    stack: error.stack
  });
}
```

### Production

**For Monitoring**: Consider adding error tracking service:

```typescript
// Example with Sentry (if implemented)
import * as Sentry from '@sentry/nextjs';

catch (error) {
  // User sees friendly message
  const userMessage = formatErrorForDisplay(error);
  setError(userMessage);

  // But we still track for monitoring
  Sentry.captureException(error, {
    level: 'error',
    tags: { context: 'authentication' }
  });
}
```

---

## Files Modified

### ✅ Core Error Handling
- `src/lib/errorMessages.ts` - Error message mapping utility (NEW)

### ✅ API Layer
- `src/services/api/apiClient.ts` - Removed technical error messages
- `src/services/auth/authenticationService.ts` - Development-only logging

### ✅ State Management
- `src/contexts/AuthContext.tsx` - User-friendly error formatting

### ✅ UI Components
- `src/components/auth/SignInForm.tsx` - Development-only logging

---

## Result

### Before
```
Console: "API Error: 500 Internal Server Error"
UI: Shows technical error message
User: Confused and frustrated
```

### After
```
Console (Dev): Full error details for debugging
Console (Prod): Clean, no technical errors
UI: "Something went wrong on our end. Please try again in a few minutes."
User: Understands what happened and what to do
```

---

## Support

For questions about error handling:
- **Error Messages**: Edit `src/lib/errorMessages.ts`
- **API Errors**: Check `src/services/api/apiClient.ts`
- **Auth Errors**: Check `src/contexts/AuthContext.tsx`
- **Backend Errors**: See `BACKEND_DATABASE_FIX_REQUIRED.md`

---

**Status**: ✅ PRODUCTION-READY
**Next Action**: Deploy and monitor error metrics
