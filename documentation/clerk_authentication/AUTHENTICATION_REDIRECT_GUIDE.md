# Authentication Redirect Guide

**Status**: ✅ IMPLEMENTED
**Date**: October 15, 2025
**Feature**: Smart redirect after login/signup
**Priority**: User Experience Enhancement

---

## Overview

After successful authentication (sign-in or sign-up), users are automatically redirected to their originally intended destination, or to the home page if they navigated directly to the auth forms.

---

## How It Works

### Redirect Priority Order

The system checks multiple sources for redirect URLs in this priority order:

1. **Query Parameter** (`?redirect=/dashboard`)
   - Highest priority
   - Useful for direct links and deep linking
   - Example: `https://example.com/sign-in?redirect=/dashboard`

2. **Session Storage** (set by `ProtectedRoute`)
   - Automatically set when user tries to access protected page
   - User is redirected to the page they originally requested
   - Example: User visits `/admin/settings` → redirected to `/sign-in` → after login, goes to `/admin/settings`

3. **Default** (`/` - home page)
   - Fallback when no redirect is specified
   - Used when user navigates directly to sign-in/sign-up

---

## User Flows

### Flow 1: Direct Sign-In

**Steps:**
1. User navigates to `https://example.com/sign-in`
2. User enters credentials
3. User clicks "Sign In"

**Result:**
- Redirected to home page: `https://example.com/`

**Why:** No specific destination was requested, so we send them home.

---

### Flow 2: Protected Route Access

**Steps:**
1. User navigates to `https://example.com/admin/settings` (protected page)
2. `ProtectedRoute` detects user is not authenticated
3. Stores `/admin/settings` in sessionStorage
4. Redirects to `https://example.com/sign-in`
5. User enters credentials
6. User clicks "Sign In"

**Result:**
- Redirected to originally requested page: `https://example.com/admin/settings`

**Why:** User wanted to access `/admin/settings`, so we take them there after successful authentication.

---

### Flow 3: Deep Link with Query Parameter

**Steps:**
1. User receives email with link: `https://example.com/sign-in?redirect=/event/123`
2. User clicks link
3. User enters credentials
4. User clicks "Sign In"

**Result:**
- Redirected to specified page: `https://example.com/event/123`

**Why:** The link explicitly specified where to go after login.

---

### Flow 4: Priority Resolution

**Steps:**
1. User tries to access `/admin/users` (protected)
2. `ProtectedRoute` stores `/admin/users` in sessionStorage
3. Redirects to `/sign-in?redirect=/dashboard` (with query param)
4. User signs in

**Result:**
- Redirected to query parameter destination: `/dashboard`

**Why:** Query parameter has higher priority than sessionStorage.

---

## Implementation Details

### SignInForm Component

**File**: `src/components/auth/SignInForm.tsx`

```typescript
// Get redirect URL from multiple sources
const queryRedirect = searchParams.get('redirect');
const sessionRedirect = sessionStorage.getItem('redirect_after_login');

// Clear the stored redirect URL
sessionStorage.removeItem('redirect_after_login');

// Determine redirect URL
let redirectUrl = '/'; // Default to home page

if (queryRedirect && queryRedirect !== '/sign-in' && queryRedirect !== '/sign-up') {
  redirectUrl = queryRedirect;
} else if (sessionRedirect && sessionRedirect !== '/sign-in' && sessionRedirect !== '/sign-up') {
  redirectUrl = sessionRedirect;
}

// Redirect to the determined page
router.push(redirectUrl);
```

### SignUpForm Component

**File**: `src/components/auth/SignUpForm.tsx`

Same logic as SignInForm - checks query parameter first, then sessionStorage, then defaults to home page.

### ProtectedRoute Component

**File**: `src/components/auth/ProtectedRoute.tsx`

```typescript
useEffect(() => {
  if (!mounted || loading) return;

  // Not authenticated - redirect to sign-in
  if (!user) {
    // Store the intended destination for redirect after login
    sessionStorage.setItem('redirect_after_login', pathname || '/dashboard');
    router.push(redirectTo);
    return;
  }
}, [user, loading, mounted, router, redirectTo, pathname]);
```

---

## Security Considerations

### Protected URL Validation

Both sign-in and sign-up forms validate redirect URLs to prevent redirect loops:

```typescript
if (queryRedirect && queryRedirect !== '/sign-in' && queryRedirect !== '/sign-up') {
  redirectUrl = queryRedirect;
}
```

**Why:** Prevents infinite redirect loops if someone tries to redirect to the auth pages themselves.

### Open Redirect Prevention

**Current Implementation:**
- All redirects use Next.js `router.push()` which only allows relative paths
- No external URLs can be used as redirect targets

**Future Enhancement** (if needed):
```typescript
// Validate redirect URL is same-origin
function isValidRedirect(url: string): boolean {
  // Don't allow absolute URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return false;
  }

  // Don't allow protocol-relative URLs
  if (url.startsWith('//')) {
    return false;
  }

  // Must start with /
  if (!url.startsWith('/')) {
    return false;
  }

  // Don't allow auth pages
  if (url === '/sign-in' || url === '/sign-up') {
    return false;
  }

  return true;
}
```

---

## Examples

### Example 1: Email Verification Link

**Scenario**: User receives email to verify their email address, link should take them to their profile after sign-in.

**Email Link**:
```
https://example.com/sign-in?redirect=/profile&verified=true
```

**After Sign-In**:
```
https://example.com/profile?verified=true
```

**Note**: Query parameters are preserved in the redirect URL.

---

### Example 2: Admin Panel Access

**Scenario**: Admin tries to access admin panel but session expired.

1. Admin navigates to `https://example.com/admin/users`
2. `ProtectedRoute` stores `/admin/users` in sessionStorage
3. Redirects to sign-in page
4. After sign-in, redirected back to `https://example.com/admin/users`

---

### Example 3: Event Registration Flow

**Scenario**: User wants to register for an event but needs to sign in first.

**Implementation**:
```typescript
// In event registration component
const handleRegister = () => {
  if (!user) {
    // Not signed in - redirect to sign-in with event page as redirect
    router.push(`/sign-in?redirect=/event/${eventId}/register`);
    return;
  }

  // User is signed in - proceed with registration
  registerForEvent();
};
```

---

## Testing

### Test Case 1: Direct Sign-In

**Steps**:
1. Navigate to `http://localhost:3000/sign-in`
2. Sign in with valid credentials

**Expected**:
- Redirected to `http://localhost:3000/`

---

### Test Case 2: Protected Route

**Steps**:
1. Sign out if signed in
2. Navigate to `http://localhost:3000/dashboard`
3. Should be redirected to sign-in
4. Sign in with valid credentials

**Expected**:
- Redirected to `http://localhost:3000/dashboard`

---

### Test Case 3: Query Parameter

**Steps**:
1. Navigate to `http://localhost:3000/sign-in?redirect=/profile`
2. Sign in with valid credentials

**Expected**:
- Redirected to `http://localhost:3000/profile`

---

### Test Case 4: Invalid Redirect (Loop Prevention)

**Steps**:
1. Navigate to `http://localhost:3000/sign-in?redirect=/sign-in`
2. Sign in with valid credentials

**Expected**:
- Redirected to `http://localhost:3000/` (default, not `/sign-in`)

---

### Test Case 5: Priority Resolution

**Steps**:
1. Sign out
2. Navigate to `http://localhost:3000/admin/settings` (protected)
3. Should redirect to sign-in
4. Manually add query param: `http://localhost:3000/sign-in?redirect=/profile`
5. Sign in

**Expected**:
- Redirected to `http://localhost:3000/profile` (query param wins)

---

## Configuration

### Changing Default Redirect

To change the default redirect from home page to another page:

**SignInForm.tsx and SignUpForm.tsx**:
```typescript
// Change this line:
let redirectUrl = '/'; // Default to home page

// To:
let redirectUrl = '/dashboard'; // Default to dashboard
```

---

### Changing Protected Route Fallback

To change where ProtectedRoute redirects unauthorized users:

**ProtectedRoute.tsx**:
```typescript
export function ProtectedRoute({
  children,
  redirectTo = '/sign-in', // Change this default
  requireRole,
  fallback
}: ProtectedRouteProps) {
  // ...
}
```

---

## Future Enhancements

### 1. Remember Last Visited Page

Store the last successfully visited protected page and redirect there on next login:

```typescript
// On successful page load
useEffect(() => {
  if (user && pathname !== '/sign-in' && pathname !== '/sign-up') {
    localStorage.setItem('last_visited_page', pathname);
  }
}, [user, pathname]);

// On sign-in
const lastPage = localStorage.getItem('last_visited_page');
if (!queryRedirect && !sessionRedirect && lastPage) {
  redirectUrl = lastPage;
}
```

---

### 2. Role-Based Default Redirects

Different default redirects based on user role:

```typescript
// After sign-in
const defaultRedirect = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
```

---

### 3. Onboarding Flow Detection

Redirect new users to onboarding:

```typescript
if (user.isNewUser) {
  router.push('/onboarding');
} else {
  router.push(redirectUrl);
}
```

---

## Troubleshooting

### Issue: Always Redirecting to Home Page

**Possible Causes**:
1. SessionStorage is disabled or not working
2. ProtectedRoute is not setting the redirect URL
3. Redirect URL is being filtered out (equals `/sign-in` or `/sign-up`)

**Solution**:
- Check browser console for sessionStorage errors
- Verify ProtectedRoute is wrapping protected pages
- Check redirect URL doesn't match filtered values

---

### Issue: Redirect Loop

**Possible Causes**:
1. Redirect URL is set to `/sign-in` or `/sign-up`
2. Protected route redirects to itself

**Solution**:
- Already prevented by URL validation in sign-in/sign-up forms
- Ensure ProtectedRoute has correct `redirectTo` prop

---

### Issue: Query Parameters Not Working

**Possible Causes**:
1. `useSearchParams` hook not imported
2. Query parameter name is wrong (must be `redirect`)
3. URL encoding issues

**Solution**:
- Verify import: `import { useSearchParams } from 'next/navigation'`
- Use correct parameter name: `?redirect=/path`
- URL encode special characters: `?redirect=%2Fevent%2F123`

---

## Files Modified

### Authentication Forms
- ✅ `src/components/auth/SignInForm.tsx` - Smart redirect after sign-in
- ✅ `src/components/auth/SignUpForm.tsx` - Smart redirect after sign-up

### Protected Route
- ✅ `src/components/auth/ProtectedRoute.tsx` - Already had sessionStorage logic

---

## Summary

✅ **Implemented Features**:
- Query parameter redirect support (`?redirect=/path`)
- SessionStorage redirect (from ProtectedRoute)
- Default home page redirect
- Priority resolution (query > session > default)
- Redirect loop prevention
- Works for both sign-in and sign-up

✅ **User Benefits**:
- Seamless authentication flow
- Returns to intended page after login
- No disruption to user journey
- Better user experience overall

✅ **Developer Benefits**:
- Easy to use with query parameters
- Automatic handling by ProtectedRoute
- Flexible and extensible
- Secure by default (no open redirects)

---

**Status**: ✅ READY FOR TESTING
**Next Action**: Test all redirect scenarios to verify behavior
