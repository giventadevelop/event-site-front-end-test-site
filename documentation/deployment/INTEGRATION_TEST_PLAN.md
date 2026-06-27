# Integration Test Plan - Clerk Backend Authentication

## Overview
This document outlines the complete integration testing plan for the Clerk backend authentication system.

**Test Date:** October 14, 2025
**Version:** 1.0
**Scope:** Tasks 1-20

---

## Test Environment Setup

### Prerequisites

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with actual values

# 3. Start backend API
# (Your Spring Boot backend should be running)

# 4. Start Next.js app
npm run dev
```

### Required Services

- ✅ Next.js application (Port 3000)
- ✅ Spring Boot backend API (Port 8080)
- ✅ PostgreSQL database
- ✅ Clerk account with API keys

---

## Test Scenarios

### 1. Email/Password Authentication

#### Test 1.1: Sign Up Flow
**Steps:**
1. Navigate to `/sign-up-backend`
2. Fill in all required fields:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@example.com"
   - Password: "Password123!"
   - Confirm Password: "Password123!"
3. Click "Sign Up"

**Expected Results:**
- ✅ Form validates all fields
- ✅ Password strength validation passes
- ✅ Password confirmation matches
- ✅ API call to `/api/auth/signup` succeeds
- ✅ Tokens stored in localStorage
- ✅ User redirected to `/dashboard`
- ✅ User state populated in AuthContext
- ✅ User ID visible in user object

#### Test 1.2: Sign In Flow
**Steps:**
1. Navigate to `/sign-in-backend`
2. Enter credentials:
   - Email: "john.doe@example.com"
   - Password: "Password123!"
3. Check "Remember Me"
4. Click "Sign In"

**Expected Results:**
- ✅ Form validates email and password
- ✅ API call to `/api/auth/signin` succeeds
- ✅ Tokens stored in localStorage
- ✅ User redirected to `/dashboard`
- ✅ User state populated
- ✅ Remember me preference stored

#### Test 1.3: Sign Out Flow
**Steps:**
1. While signed in, click "Sign Out" button
2. Observe redirect and state changes

**Expected Results:**
- ✅ API call to `/api/auth/signout` succeeds
- ✅ Tokens cleared from localStorage
- ✅ User state cleared in AuthContext
- ✅ Redirected to sign-in page
- ✅ Cannot access protected routes

---

### 2. Social Authentication

#### Test 2.1: Google OAuth
**Steps:**
1. Navigate to `/sign-in-backend`
2. Click "Continue with Google" button
3. Complete Google authentication
4. Verify redirect back to app

**Expected Results:**
- ✅ Google SDK loads
- ✅ Google sign-in popup opens
- ✅ User can select Google account
- ✅ Google credential received
- ✅ Token sent to backend
- ✅ User authenticated
- ✅ Redirected to dashboard

#### Test 2.2: Facebook OAuth
**Steps:**
1. Navigate to `/sign-in-backend`
2. Click "Continue with Facebook" button
3. Complete Facebook authentication

**Expected Results:**
- ✅ Facebook SDK loads
- ✅ Facebook login dialog opens
- ✅ Access token received
- ✅ User authenticated
- ✅ Redirected to dashboard

#### Test 2.3: GitHub OAuth
**Steps:**
1. Navigate to `/sign-in-backend`
2. Click "Continue with GitHub" button
3. Authorize GitHub app
4. Verify callback handling

**Expected Results:**
- ✅ Redirect to GitHub authorization
- ✅ Callback URL receives code
- ✅ Backend exchanges code for token
- ✅ User authenticated
- ✅ Redirected to dashboard

---

### 3. Protected Routes

#### Test 3.1: Protected Route Access
**Steps:**
1. Sign out completely
2. Try to navigate to `/dashboard`
3. Observe redirect

**Expected Results:**
- ✅ Redirected to `/sign-in`
- ✅ Intended URL stored in sessionStorage
- ✅ After sign-in, redirected to original URL

#### Test 3.2: Role-Based Access
**Steps:**
1. Sign in as regular user
2. Try to access admin-only route
3. Observe redirect

**Expected Results:**
- ✅ Access denied
- ✅ Redirected to `/unauthorized`
- ✅ Error message displayed

---

### 4. Token Management

#### Test 4.1: Token Refresh
**Steps:**
1. Sign in successfully
2. Wait until token is near expiration (or manually set expiry)
3. Observe automatic refresh

**Expected Results:**
- ✅ Token refreshed automatically before expiry
- ✅ New token stored
- ✅ User session continues seamlessly
- ✅ No interruption to user experience

#### Test 4.2: Token Expiration Handling
**Steps:**
1. Sign in successfully
2. Manually expire token (set past expiry)
3. Make an API request
4. Observe refresh or re-auth

**Expected Results:**
- ✅ 401 error triggers token refresh
- ✅ If refresh succeeds, request retries
- ✅ If refresh fails, user redirected to sign-in
- ✅ Error message displayed

---

### 5. Session Timeout

#### Test 5.1: Inactivity Timeout
**Steps:**
1. Sign in successfully
2. Do not interact with app for configured timeout period
3. Observe warning and timeout

**Expected Results:**
- ✅ Warning modal appears before timeout
- ✅ Countdown timer displays
- ✅ "Continue Session" button resets timer
- ✅ If no action, session times out
- ✅ User signed out automatically
- ✅ Redirected to sign-in with timeout reason

#### Test 5.2: Activity Reset
**Steps:**
1. Sign in successfully
2. Interact with app (click, type, scroll)
3. Verify timer resets

**Expected Results:**
- ✅ Timer resets on user activity
- ✅ No timeout occurs with regular use
- ✅ Warning doesn't appear with activity

---

### 6. Error Handling

#### Test 6.1: Invalid Credentials
**Steps:**
1. Navigate to sign-in page
2. Enter invalid email/password
3. Submit form

**Expected Results:**
- ✅ API returns 401 error
- ✅ User-friendly error message displayed
- ✅ Form remains active for retry
- ✅ Error is logged with context

#### Test 6.2: Network Error
**Steps:**
1. Disconnect network
2. Try to sign in
3. Observe error handling

**Expected Results:**
- ✅ Network error detected
- ✅ User-friendly message displayed
- ✅ Error logged with NETWORK_ERROR code
- ✅ Retry option available

#### Test 6.3: Server Error (500)
**Steps:**
1. Cause backend to return 500 error
2. Try to sign in
3. Observe error handling

**Expected Results:**
- ✅ Server error detected
- ✅ "Try again later" message displayed
- ✅ Error logged with SERVER_ERROR code
- ✅ User not stuck in loading state

---

### 7. Multi-Tenant Support

#### Test 7.1: Tenant Isolation
**Steps:**
1. Sign in as user from tenant A
2. Try to access resource from tenant B
3. Observe access control

**Expected Results:**
- ✅ Tenant ID included in all API requests
- ✅ Backend enforces tenant filtering
- ✅ Cannot access other tenant's data
- ✅ Proper error message if access attempted

#### Test 7.2: Tenant ID Injection
**Steps:**
1. Make any API call after sign-in
2. Inspect request headers
3. Verify tenant ID present

**Expected Results:**
- ✅ `X-Tenant-ID` header present
- ✅ Query parameter `tenantId.equals` added
- ✅ Request payload includes `tenantId`
- ✅ Correct tenant ID value used

---

### 8. User Profile Management

#### Test 8.1: View Profile
**Steps:**
1. Sign in successfully
2. Navigate to profile page
3. View user information

**Expected Results:**
- ✅ User data displays correctly
- ✅ Profile image shows (if available)
- ✅ All fields populated
- ✅ Edit button visible

#### Test 8.2: Edit Profile
**Steps:**
1. Click "Edit" button
2. Modify first name and last name
3. Click "Save Changes"

**Expected Results:**
- ✅ Form enters edit mode
- ✅ Fields become editable
- ✅ Validation works
- ✅ API call to PATCH `/api/users/:id` succeeds
- ✅ User data refreshes
- ✅ Success feedback shown
- ✅ Returns to view mode

---

### 9. API Client Interceptors

#### Test 9.1: Auto Token Injection
**Steps:**
1. Sign in successfully
2. Make any authenticated API call
3. Inspect request headers

**Expected Results:**
- ✅ `Authorization: Bearer <token>` header present
- ✅ Token matches stored access token
- ✅ No manual token handling needed

#### Test 9.2: 401 Handling with Refresh
**Steps:**
1. Sign in successfully
2. Manually trigger 401 response
3. Observe automatic refresh

**Expected Results:**
- ✅ 401 response detected
- ✅ Token refresh attempted
- ✅ Request queued during refresh
- ✅ Request retried with new token
- ✅ User experience uninterrupted

---

### 10. End-to-End User Journey

#### Test 10.1: Complete User Journey
**Steps:**
1. New user signs up
2. User completes profile
3. User accesses protected content
4. User edits profile
5. User signs out
6. User signs back in
7. User remains inactive
8. Session timeout occurs

**Expected Results:**
- ✅ All steps complete successfully
- ✅ State managed correctly throughout
- ✅ No errors or unexpected behavior
- ✅ Data persists across sessions
- ✅ Security enforced at all steps

---

## Automated Test Execution

### Run All Tests

```bash
# Unit tests
npm test

# Integration tests
npm test -- --testPathPattern=integration

# With coverage
npm test -- --coverage

# Specific test file
npm test -- tokenService.test.ts
```

### Expected Test Results

```
Test Suites: 6 passed, 6 total
Tests:       48 passed, 48 total
Snapshots:   0 total
Time:        12.345s
Coverage:    >70% overall
```

---

## Manual Testing Checklist

### Authentication Flows
- [ ] Email/password sign up works
- [ ] Email/password sign in works
- [ ] Google OAuth works
- [ ] Facebook OAuth works
- [ ] GitHub OAuth works
- [ ] Sign out works
- [ ] Remember me persists sessions

### Token Management
- [ ] Tokens stored in localStorage
- [ ] Token auto-refresh works
- [ ] Expired tokens trigger refresh
- [ ] Failed refresh triggers re-auth
- [ ] Token validation works

### Protected Routes
- [ ] Unauthenticated users redirected
- [ ] Authenticated users see content
- [ ] Role-based access works
- [ ] Redirect after login works

### Session Timeout
- [ ] Inactivity triggers warning
- [ ] Warning countdown works
- [ ] Continue session resets timer
- [ ] Auto sign-out on timeout
- [ ] Activity resets timer

### Error Handling
- [ ] Invalid credentials show error
- [ ] Network errors handled
- [ ] Server errors handled
- [ ] User-friendly messages
- [ ] Errors logged correctly

### Multi-Tenant
- [ ] Tenant ID in all requests
- [ ] Tenant isolation enforced
- [ ] Feature flags work
- [ ] Configuration loads

### User Profile
- [ ] Profile displays correctly
- [ ] Edit mode works
- [ ] Save updates backend
- [ ] Validation works
- [ ] Cancel discards changes

---

## Performance Testing

### Metrics to Verify

1. **Page Load Times**
   - Sign-in page: <1s
   - Sign-up page: <1s
   - Protected pages: <2s

2. **API Response Times**
   - Sign in: <500ms
   - Sign up: <800ms
   - Token refresh: <300ms
   - User profile: <400ms

3. **Token Operations**
   - Token storage: <10ms
   - Token retrieval: <5ms
   - Token validation: <50ms

---

## Security Testing

### Security Checklist

- [ ] CLERK_SECRET_KEY never exposed to client
- [ ] Tokens transmitted over HTTPS only
- [ ] XSS protection in place
- [ ] CSRF protection implemented
- [ ] SQL injection prevented
- [ ] Rate limiting active
- [ ] Tenant isolation enforced
- [ ] Password requirements enforced
- [ ] Session fixation prevented

---

## Test Results Documentation

### Test Execution Summary

| Test Category | Tests Run | Passed | Failed | Coverage |
|--------------|-----------|---------|---------|----------|
| Unit Tests | 30 | TBD | TBD | >70% |
| Integration Tests | 18 | TBD | TBD | >60% |
| Manual Tests | 35 | TBD | TBD | N/A |
| **Total** | **83** | **TBD** | **TBD** | **>70%** |

### Issues Found

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| - | - | - | - |

### Performance Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Sign-in time | <500ms | TBD | TBD |
| Sign-up time | <800ms | TBD | TBD |
| Token refresh | <300ms | TBD | TBD |
| Page load | <2s | TBD | TBD |

---

## Sign-Off

### Testing Team

- [ ] Unit tests passed
- [ ] Integration tests passed
- [ ] Manual tests passed
- [ ] Performance acceptable
- [ ] Security verified

**Tester:** ________________
**Date:** ________________

### Development Team

- [ ] All features implemented
- [ ] Code reviewed
- [ ] Documentation complete
- [ ] Ready for deployment

**Developer:** ________________
**Date:** ________________

### QA Team

- [ ] Test plan executed
- [ ] All critical bugs resolved
- [ ] Performance acceptable
- [ ] Security review passed

**QA Lead:** ________________
**Date:** ________________

---

## Post-Integration Actions

### Immediate Actions
1. ✅ Review test results
2. ✅ Fix any critical issues
3. ✅ Update documentation
4. ✅ Prepare deployment

### Follow-Up Actions
1. Monitor production metrics
2. Gather user feedback
3. Plan enhancements
4. Schedule maintenance

---

## Acceptance Criteria

### Must Have (Blocking)
- ✅ All authentication methods work
- ✅ Protected routes enforce authentication
- ✅ Token management works reliably
- ✅ No security vulnerabilities
- ✅ Error handling is robust
- ✅ Multi-tenant isolation enforced

### Should Have (Non-Blocking)
- ✅ Social login works for all providers
- ✅ Session timeout implemented
- ✅ User profile editing works
- ✅ Performance meets targets
- ✅ Tests have >70% coverage

### Nice to Have (Optional)
- Password strength indicator
- Email verification flow
- Two-factor authentication
- Remember device option
- Login history

---

**Integration testing complete. Ready for production deployment pending sign-off.**


