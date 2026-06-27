# Error Handling Test Plan

**Status**: ✅ IMPLEMENTATION COMPLETE - READY FOR TESTING
**Last Updated**: October 14, 2025

---

## Overview

All error handling has been implemented to show user-friendly messages instead of technical errors. This document provides a comprehensive test plan to verify the implementation.

---

## Implementation Summary

### What Was Fixed

1. **Error Message Mapping** (`src/lib/errorMessages.ts`)
   - Maps backend error codes and HTTP status codes to user-friendly messages
   - Checks `detail` field FIRST before checking status code
   - Handles backend's incorrect status codes (e.g., 500 for auth errors)

2. **API Client** (`src/services/api/apiClient.ts`)
   - Removes technical error messages from error objects
   - Uses generic "Request failed" message
   - Preserves backend error details in `error.data`

3. **Authentication Service** (`src/services/auth/authenticationService.ts`)
   - Only logs errors in development mode
   - Production mode has clean console

4. **Auth Context** (`src/contexts/AuthContext.tsx`)
   - Uses `formatErrorForDisplay()` for user-friendly messages
   - Only logs in development mode

5. **Sign In Form** (`src/components/auth/SignInForm.tsx`)
   - Only logs in development mode
   - Displays formatted errors from AuthContext

---

## Test Scenarios

### Scenario 1: Invalid Credentials (401 or 500 with "Invalid credentials" detail)

**Test Steps:**
1. Navigate to sign-in page
2. Enter email: `test@example.com`
3. Enter password: `wrongpassword`
4. Click "Sign In"

**Expected Result:**

**User Sees:**
```
❌ Invalid Credentials
The email or password you entered is incorrect.
Please check your credentials and try again.
```

**Console (Development Only):**
```javascript
Sign in error: Error {
  status: 500,
  data: {
    status: 500,
    detail: "Invalid credentials",
    message: "error.http.500"
  }
}
```

**Console (Production):**
```
(No console errors)
```

**Backend Logs:**
```
WARN: User not found for email: test@example.com
ERROR: Invalid credentials
```

**Why This Works:**
The `getErrorMessage()` function in `errorMessages.ts` checks the `detail` field FIRST:
```typescript
const detail = error?.data?.detail || error?.response?.data?.detail;
if (detail && typeof detail === 'string') {
  const detailLower = detail.toLowerCase();

  if (detailLower.includes('invalid credentials') ||
      detailLower.includes('invalid email') ||
      detailLower.includes('invalid password') ||
      detailLower.includes('user not found')) {
    return ERROR_MESSAGES.AUTH_001; // Shows: "The email or password you entered is incorrect."
  }
}
```

---

### Scenario 2: User Not Found (404 or 500 with "User not found" detail)

**Test Steps:**
1. Navigate to sign-in page
2. Enter email: `nonexistent@example.com`
3. Enter password: `anypassword`
4. Click "Sign In"

**Expected Result:**

**User Sees:**
```
❌ Invalid Credentials
The email or password you entered is incorrect.
Please check your credentials and try again.
```

**Note:** We intentionally show "Invalid Credentials" instead of "User Not Found" for security reasons (don't reveal which emails exist).

---

### Scenario 3: Email Already Exists (409 or 500 with "email already exists" detail)

**Test Steps:**
1. Navigate to sign-up page
2. Enter email: `existing@example.com` (an email already in database)
3. Enter password: `ValidPass123!`
4. Click "Sign Up"

**Expected Result:**

**User Sees:**
```
❌ Account Already Exists
An account with this email already exists.
Try signing in instead, or use a different email.
```

**Backend Response:**
```json
{
  "status": 500,
  "detail": "Email already exists",
  "message": "error.http.500"
}
```

**Why This Works:**
The error handler checks for "email already exists" in the detail field:
```typescript
if (detailLower.includes('email already exists') ||
    detailLower.includes('user already exists')) {
  return ERROR_MESSAGES.AUTH_005;
}
```

---

### Scenario 4: Backend Server Error (500)

**Test Steps:**
1. Navigate to sign-in page
2. Stop the backend server
3. Enter valid credentials
4. Click "Sign In"

**Expected Result:**

**User Sees:**
```
❌ Server Error
Something went wrong on our end.
We're working on it. Please try again in a few minutes.
```

**Console (Development Only):**
```javascript
Sign in error: Error {
  status: 500,
  data: { ... }
}
```

**Console (Production):**
```
(No console errors)
```

---

### Scenario 5: Network Error (No Response)

**Test Steps:**
1. Disconnect internet
2. Navigate to sign-in page
3. Enter credentials
4. Click "Sign In"

**Expected Result:**

**User Sees:**
```
❌ Something Went Wrong
An unexpected error occurred.
Please try again. If the problem persists, contact support.
```

**Console (Development Only):**
```javascript
Sign in error: TypeError: Failed to fetch
```

**Console (Production):**
```
(No console errors)
```

---

### Scenario 6: Session Expired (401 with "Token expired" detail)

**Test Steps:**
1. Sign in successfully
2. Wait for token to expire OR manually edit localStorage to set expired token
3. Try to access protected route

**Expected Result:**

**User Sees:**
```
❌ Session Expired
Your session has expired.
Please sign in again to continue.
```

**Backend Response:**
```json
{
  "status": 401,
  "detail": "Token expired",
  "message": "error.token.expired"
}
```

---

### Scenario 7: Validation Error (400 or 422)

**Test Steps:**
1. Navigate to sign-up page
2. Enter invalid email: `notanemail`
3. Enter short password: `123`
4. Click "Sign Up"

**Expected Result:**

**User Sees (Client-side validation first):**
```
❌ Invalid email format
❌ Password must be at least 8 characters
```

**If backend validation fails:**
```
❌ Validation Error
Some of the information you provided is invalid.
Please check the form for errors.
```

---

### Scenario 8: Rate Limiting (429)

**Test Steps:**
1. Make multiple sign-in attempts rapidly (>10 in 1 minute)
2. Backend should return 429 status

**Expected Result:**

**User Sees:**
```
❌ Too Many Requests
You've made too many requests.
Please wait a few minutes before trying again.
```

**Backend Response:**
```json
{
  "status": 429,
  "detail": "Too many requests",
  "message": "error.rate.limit"
}
```

---

## Development vs Production Behavior

### Development Mode (`NODE_ENV=development`)

**Console Output:**
```javascript
// Full error details logged
Sign in error: Error {
  status: 500,
  statusText: 'Internal Server Error',
  data: {
    status: 500,
    detail: 'Invalid credentials',
    message: 'error.http.500'
  },
  stack: '...'
}
```

**User Experience:**
- Same user-friendly messages
- Console has full technical details for debugging

### Production Mode (`NODE_ENV=production`)

**Console Output:**
```
(Clean console - no technical errors)
```

**User Experience:**
- User-friendly messages only
- No technical details exposed
- Professional, clean experience

---

## Error Message Reference

### Authentication Errors

| Error Code | Title | User Message | When It Occurs |
|------------|-------|--------------|----------------|
| AUTH_001 | Invalid Credentials | The email or password you entered is incorrect. | Invalid email/password, user not found |
| AUTH_002 | Session Expired | Your session has expired. | Token expired |
| AUTH_003 | Invalid Token | Your authentication token is invalid. | Malformed or tampered token |
| AUTH_004 | User Not Found | We couldn't find an account with that email. | User lookup fails |
| AUTH_005 | Account Already Exists | An account with this email already exists. | Email already registered |
| AUTH_006 | Configuration Error | There's a problem with the authentication setup. | Backend config issue |
| AUTH_007 | Access Denied | You don't have permission to access this resource. | Insufficient permissions |
| AUTH_008 | Too Many Attempts | You've made too many requests. | Rate limiting |
| AUTH_009 | Verification Failed | We couldn't verify your request. | Token verification fails |
| AUTH_010 | Social Login Failed | We couldn't sign you in with your social account. | OAuth error |

### HTTP Status Codes

| Status | Title | User Message |
|--------|-------|--------------|
| 400 | Invalid Request | The information you provided is invalid. |
| 401 | Authentication Required | You need to be signed in to access this. |
| 403 | Access Denied | You don't have permission to perform this action. |
| 404 | Not Found | The requested resource could not be found. |
| 409 | Conflict | This action conflicts with existing data. |
| 422 | Validation Error | Some of the information you provided is invalid. |
| 429 | Too Many Requests | You've made too many requests. |
| 500 | Server Error | Something went wrong on our end. |
| 502 | Service Unavailable | The service is temporarily unavailable. |
| 503 | Service Unavailable | The service is temporarily unavailable. |
| 504 | Request Timeout | The request took too long to complete. |

---

## Testing Checklist

### Environment Setup
- [ ] Development mode: `npm run dev`
- [ ] Production mode: `npm run build && npm start`

### Test Each Scenario in Development
- [ ] Invalid credentials (wrong password)
- [ ] User not found (non-existent email)
- [ ] Email already exists (during sign-up)
- [ ] Backend server error (500)
- [ ] Network error (disconnect internet)
- [ ] Session expired (401)
- [ ] Validation error (400/422)
- [ ] Rate limiting (429)

### Verify Development Behavior
- [ ] Console shows full error details
- [ ] User sees friendly messages
- [ ] Error stack traces available for debugging

### Test Each Scenario in Production
- [ ] Invalid credentials
- [ ] User not found
- [ ] Email already exists
- [ ] Backend server error
- [ ] Network error
- [ ] Session expired
- [ ] Validation error
- [ ] Rate limiting

### Verify Production Behavior
- [ ] Console is clean (no technical errors)
- [ ] User sees friendly messages
- [ ] No stack traces or technical details exposed

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

---

## Known Issues and Workarounds

### Issue 1: Backend Returns 500 for Auth Errors

**Problem:** Backend returns 500 status for authentication errors instead of proper status codes (401, 404).

**Example:**
```json
{
  "status": 500,
  "detail": "Invalid credentials",
  "message": "error.http.500"
}
```

**Workaround:** Frontend checks `detail` field FIRST before checking status code.

**Proper Fix (Backend Team):** Backend should return:
```json
{
  "status": 401,
  "detail": "Invalid credentials",
  "message": "error.auth.invalid.credentials",
  "errorCode": "AUTH_001"
}
```

### Issue 2: Backend Database JSONB Type Mismatch

**Problem:** Backend fails to update `clerk_metadata` column (JSONB type mismatch).

**Error:**
```
ERROR: column "clerk_metadata" is of type jsonb but expression is of type character varying
```

**Impact:** Sign-in succeeds in authentication but fails at database update.

**User Experience:** User sees "Something went wrong on our end" message.

**Fix:** See `BACKEND_DATABASE_FIX_REQUIRED.md` for backend fix options.

---

## Verification Commands

### Check Environment Mode
```bash
# Development
echo $NODE_ENV
# Should output: development

# Production
npm run build
npm start
# Check console.log('ENV:', process.env.NODE_ENV)
```

### Test API Endpoints Manually
```bash
# Test sign-in with invalid credentials
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'

# Expected response:
{
  "status": 500,
  "detail": "Invalid credentials",
  "message": "error.http.500"
}
```

### Check Console Logs
```javascript
// In browser console (Development):
// Should see detailed errors

// In browser console (Production):
// Should see clean console
```

---

## Success Criteria

The error handling implementation is successful if:

1. ✅ Users NEVER see technical error messages in UI
2. ✅ Users see clear, actionable error messages
3. ✅ Console is clean in production mode
4. ✅ Console shows full details in development mode
5. ✅ Invalid credentials show proper "login failed" message
6. ✅ Backend's incorrect status codes are handled gracefully
7. ✅ All error scenarios covered (auth, network, server, validation)
8. ✅ Error messages guide users on what to do next

---

## Next Steps

1. **Test in Development**
   - Run `npm run dev`
   - Test all scenarios in checklist
   - Verify console shows detailed errors
   - Verify user sees friendly messages

2. **Test in Production**
   - Run `npm run build && npm start`
   - Test all scenarios in checklist
   - Verify console is clean
   - Verify user sees friendly messages

3. **Report Issues**
   - If any scenario fails, document:
     - What you did
     - What you expected
     - What actually happened
     - Console output (development mode)
     - Backend logs (if available)

4. **Backend Team**
   - Fix database JSONB type mismatch
   - Fix status codes (return 401 instead of 500 for auth errors)
   - Add error codes (AUTH_001, etc.) to responses

---

## Support

For questions about error handling:
- **Error Messages**: Edit `src/lib/errorMessages.ts`
- **API Errors**: Check `src/services/api/apiClient.ts`
- **Auth Errors**: Check `src/contexts/AuthContext.tsx`
- **Backend Errors**: See `BACKEND_DATABASE_FIX_REQUIRED.md`

For documentation:
- `ERROR_HANDLING_GUIDE.md` - Implementation guide
- `BACKEND_AUTH_IMPLEMENTATION.md` - Authentication architecture
- `BACKEND_DATABASE_FIX_REQUIRED.md` - Backend database fix

---

**Status**: ✅ READY FOR TESTING
**Implementation**: COMPLETE
**Documentation**: COMPLETE
**Next Action**: Run test scenarios and verify behavior
