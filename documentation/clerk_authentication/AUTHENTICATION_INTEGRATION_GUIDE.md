# Authentication Integration Guide

## Complete Guide to Clerk Backend Authentication Integration

**Version:** 1.0
**Last Updated:** October 14, 2025

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Installation & Setup](#installation--setup)
4. [Usage Guide](#usage-guide)
5. [API Reference](#api-reference)
6. [Examples](#examples)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install @testing-library/react @testing-library/jest-dom jest
```

### 2. Configure Environment

Create `.env.local`:
```bash
CLERK_SECRET_KEY=sk_test_***_clerk_secret_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_TENANT_ID=tenant_demo_001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Wrap App with AuthProvider

```typescript
// src/app/layout.tsx
import { AuthProviderWithRefresh } from '@/components/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProviderWithRefresh>
          {children}
        </AuthProviderWithRefresh>
      </body>
    </html>
  );
}
```

### 4. Use Authentication

```typescript
import { useAuth } from '@/contexts';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();

  return user ? (
    <button onClick={signOut}>Sign Out</button>
  ) : (
    <button onClick={() => signIn(credentials)}>Sign In</button>
  );
}
```

---

## Architecture Overview

### Component Hierarchy

```
App Layout
└─ AuthProviderWithRefresh (Auto token refresh)
   └─ AuthProvider (State management)
      └─ Your App Components
         ├─ Public Pages (Landing, etc.)
         └─ Protected Routes
            └─ ProtectedRoute Component
               └─ Authenticated Content
```

### Data Flow

```
User Action (Sign In)
  ↓
SignInForm Component
  ↓
useAuth() Hook
  ↓
AuthContext
  ↓
authenticationService
  ↓
apiClient (with interceptors)
  ↓
Backend API
  ↓
Response
  ↓
tokenService (store tokens)
  ↓
AuthContext (update user state)
  ↓
Component (re-render with user data)
```

---

## Installation & Setup

### Step 1: Services Layer

Already implemented in:
- `src/services/auth/` - Authentication services
- `src/services/api/` - API client with interceptors

### Step 2: Context Layer

Already implemented in:
- `src/contexts/AuthContext.tsx` - Authentication state management

### Step 3: Component Layer

Already implemented in:
- `src/components/auth/` - All authentication components

### Step 4: Hook Layer

Already implemented in:
- `src/hooks/` - Custom authentication hooks

---

## Usage Guide

### Basic Authentication

#### Sign In

```typescript
import { SignInForm, SocialSignInButtons } from '@/components/auth';

export default function SignInPage() {
  return (
    <div className="container">
      <SignInForm />
      <SocialSignInButtons providers={['google', 'facebook']} />
    </div>
  );
}
```

#### Sign Up

```typescript
import { SignUpForm } from '@/components/auth';

export default function SignUpPage() {
  return (
    <div className="container">
      <SignUpForm />
    </div>
  );
}
```

### Protected Routes

#### Method 1: Component Wrapper

```typescript
import { ProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

// With role requirement
<ProtectedRoute requireRole="ADMIN">
  <AdminPanel />
</ProtectedRoute>
```

#### Method 2: Hook-Based

```typescript
import { useRequireAuth } from '@/hooks';

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();

  if (loading) return <div>Loading...</div>;

  return <UserProfile user={user} />;
}
```

### User Profile

```typescript
import { UserProfileCard } from '@/components/auth';

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <UserProfileCard
        editable={true}
        onUpdate={() => console.log('Profile updated!')}
      />
    </div>
  );
}
```

### Programmatic Authentication

```typescript
import { useAuth } from '@/contexts';

function MyComponent() {
  const { user, signIn, signUp, signOut, loading, error } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn({
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      });
      // Success - user is now authenticated
    } catch (err) {
      // Handle error
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {user && <div>Welcome, {user.firstName}!</div>}
    </div>
  );
}
```

---

## API Reference

### Services

#### authenticationService

```typescript
import { authenticationService } from '@/services/auth';

// Sign up
await authenticationService.signUp({
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
});

// Sign in
await authenticationService.signIn({
  email: string,
  password: string,
  rememberMe?: boolean,
});

// Social sign in
await authenticationService.socialSignIn({
  provider: 'google' | 'facebook' | 'github',
  token: string,
});

// Sign out
await authenticationService.signOut();

// Get current user
const user = await authenticationService.getCurrentUser();

// Refresh token
const newToken = await authenticationService.refreshToken();

// Verify token
const isValid = await authenticationService.verifyToken(token);

// Check authentication
const isAuth = authenticationService.isAuthenticated();
```

#### tokenService

```typescript
import { tokenService } from '@/services/auth';

// Store tokens
tokenService.setTokens({
  accessToken: string,
  refreshToken?: string,
  expiresAt: number,
});

// Get tokens
const accessToken = tokenService.getAccessToken();
const refreshToken = tokenService.getRefreshToken();

// Check expiration
const isExpired = tokenService.isTokenExpired();

// Clear tokens
tokenService.clearTokens();

// Check authentication
const isAuth = tokenService.isAuthenticated();
```

#### apiClient

```typescript
import { apiClient } from '@/services/api';

// GET request
const data = await apiClient.get<T>('/api/endpoint');

// POST request
const result = await apiClient.post<T>('/api/endpoint', { data });

// PUT request
const updated = await apiClient.put<T>('/api/endpoint', { data });

// PATCH request
const patched = await apiClient.patch<T>('/api/endpoint', { data });

// DELETE request
await apiClient.delete('/api/endpoint');

// Skip authentication
const public = await apiClient.get('/api/public', { skipAuth: true });

// Skip tenant header
const data = await apiClient.get('/api/global', { skipTenant: true });
```

### Hooks

#### useAuth

```typescript
import { useAuth } from '@/contexts';

const {
  user,           // Current user or null
  loading,        // Loading state
  error,          // Error message or null
  signUp,         // Sign up function
  signIn,         // Sign in function
  socialSignIn,   // Social sign in function
  signOut,        // Sign out function
  refreshUser,    // Refresh user data
  clearError,     // Clear error message
} = useAuth();
```

#### useRequireAuth

```typescript
import { useRequireAuth } from '@/hooks';

const { user, loading } = useRequireAuth({
  redirectTo: '/sign-in',    // Optional
  requireRole: 'ADMIN',      // Optional
});
```

#### useTokenRefresh

```typescript
import { useTokenRefresh } from '@/hooks';

useTokenRefresh({
  enabled: true,                // Enable auto-refresh
  refreshBeforeExpiry: 5,       // Minutes before expiry
  checkInterval: 60000,         // Check every minute
});
```

### Components

#### SignInForm

```typescript
import { SignInForm } from '@/components/auth';

<SignInForm />
```

#### SignUpForm

```typescript
import { SignUpForm } from '@/components/auth';

<SignUpForm />
```

#### SocialSignInButtons

```typescript
import { SocialSignInButtons } from '@/components/auth';

<SocialSignInButtons
  providers={['google', 'facebook', 'github']}
  onSuccess={() => router.push('/dashboard')}
  onError={(error) => setError(error)}
/>
```

#### ProtectedRoute

```typescript
import { ProtectedRoute } from '@/components/auth';

<ProtectedRoute requireRole="ADMIN">
  <AdminContent />
</ProtectedRoute>
```

#### UserProfileCard

```typescript
import { UserProfileCard } from '@/components/auth';

<UserProfileCard
  editable={true}
  onUpdate={() => console.log('Updated')}
/>
```

---

## Examples

### Complete Sign-In Page

```typescript
'use client';

import { SignInForm, SocialSignInButtons } from '@/components/auth';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <SignInForm />

        <SocialSignInButtons />
      </div>
    </div>
  );
}
```

### Complete Protected Page

```typescript
'use client';

import { ProtectedRoute, UserProfileCard } from '@/components/auth';
import { useAuth } from '@/contexts';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">
          Welcome, {user?.firstName}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UserProfileCard editable={true} />

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            {/* Additional settings */}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

### Error Handling Example

```typescript
import { getErrorMessage, logAuthError } from '@/lib/auth';

async function handleSignIn(credentials) {
  try {
    await signIn(credentials);
  } catch (error) {
    // Get user-friendly message
    const message = getErrorMessage(error);

    // Log structured error
    logAuthError(error, 'Sign In Flow');

    // Display to user
    setError(message);
  }
}
```

### Multi-Tenant Example

```typescript
import { addTenantToPayload, filterByTenant } from '@/lib/multiTenant';

// Add tenant to API payload
const createEvent = async (eventData) => {
  const payload = addTenantToPayload(eventData);
  // payload now includes tenantId
  await apiClient.post('/api/events', payload);
};

// Filter data by tenant
const myEvents = filterByTenant(allEvents);
```

---

## Testing

### Run Unit Tests

```bash
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Run Integration Tests

```bash
npm test -- --testPathPattern=integration
```

### Test Coverage Goals

- Services: >80% coverage
- Components: >70% coverage
- Utilities: >90% coverage

---

## Troubleshooting

### Issue: "useAuth must be used within AuthProvider"

**Solution**: Ensure your app is wrapped with `AuthProvider`:

```typescript
<AuthProviderWithRefresh>
  <YourApp />
</AuthProviderWithRefresh>
```

### Issue: "Token refresh loop"

**Solution**: Check token expiration logic and ensure refresh threshold is appropriate.

### Issue: "Social login not loading"

**Solution**: Verify:
1. Client IDs are set in environment
2. SDK scripts are loading correctly
3. Redirect URIs are configured in provider console

### Issue: "Protected route redirects even when authenticated"

**Solution**:
1. Check if user is loaded in AuthContext
2. Verify token is stored correctly
3. Check browser console for errors

---

## Migration from Client-Side Clerk

### Before (Client-Side)

```typescript
import { useAuth } from '@clerk/nextjs';

function MyComponent() {
  const { userId, signOut } = useAuth();

  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

### After (Backend)

```typescript
import { useAuth } from '@/contexts';

function MyComponent() {
  const { user, signOut } = useAuth();

  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

### Key Differences

| Feature | Client-Side Clerk | Backend Clerk |
|---------|------------------|---------------|
| Authentication | Browser-based | Server-based with JWT |
| Token Storage | Clerk handles | localStorage |
| User State | Clerk hooks | React Context |
| Protected Routes | Clerk components | Custom ProtectedRoute |
| API Calls | Direct to Clerk | Via backend API |

---

## Best Practices

### 1. Always Use Hooks in Client Components

```typescript
'use client';

import { useAuth } from '@/contexts';

function MyClientComponent() {
  const { user } = useAuth();
  // ...
}
```

### 2. Handle Loading States

```typescript
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <SignInPrompt />;

return <Content user={user} />;
```

### 3. Use Error Handling Utilities

```typescript
import { getErrorMessage } from '@/lib/auth';

try {
  await signIn(credentials);
} catch (error) {
  const message = getErrorMessage(error);
  toast.error(message); // User-friendly message
}
```

### 4. Implement Token Refresh

```typescript
import { useTokenRefresh } from '@/hooks';

function App() {
  useTokenRefresh(); // Auto-refresh tokens
  return <YourApp />;
}
```

### 5. Protect Sensitive Routes

```typescript
<ProtectedRoute requireRole="ADMIN">
  <AdminPanel />
</ProtectedRoute>
```

---

## Security Considerations

### 1. Never Expose Secret Keys

```bash
# ❌ DON'T: Expose in client code
const secret = 'sk_live_...';

# ✅ DO: Use environment variables
const secret = process.env.CLERK_SECRET_KEY;
```

### 2. Validate on Server Side

All authentication operations should be validated server-side, not just client-side.

### 3. Use HTTPS in Production

Always use HTTPS for production deployments to protect tokens in transit.

### 4. Implement Rate Limiting

Backend should implement rate limiting on authentication endpoints.

### 5. Monitor for Suspicious Activity

- Multiple failed login attempts
- Unusual token refresh patterns
- Access to unauthorized resources

---

## Performance Optimization

### 1. Token Caching

Tokens are cached in localStorage to avoid unnecessary API calls.

### 2. Request Deduplication

API client prevents multiple simultaneous token refresh requests.

### 3. Lazy Loading

Social login SDKs are loaded on-demand.

### 4. Memoization

Use React.memo() for expensive auth-related components.

---

## Support & Resources

### Documentation
- This guide
- `CLERK_BACKEND_SETUP.md` - Setup guide
- `DEPLOYMENT_GUIDE.md` - Deployment guide
- `src/services/README.md` - Services documentation

### Code Examples
- `/examples/auth-usage` - Live usage examples
- `src/__tests__/` - Test examples

### External Resources
- Clerk Documentation: https://clerk.com/docs
- Next.js Documentation: https://nextjs.org/docs
- React Context Documentation: https://react.dev/reference/react/useContext

---

## Changelog

### Version 1.0 (October 14, 2025)
- Initial implementation of backend Clerk authentication
- Complete service layer
- React Context and hooks
- Social login integration (Google, Facebook, GitHub)
- Protected routes
- Token refresh mechanism
- Error handling utilities
- Multi-tenant support
- User profile component
- Unit and integration tests
- Deployment configuration
- Complete documentation

---

**For questions or issues, please refer to the troubleshooting section or contact the development team.**


