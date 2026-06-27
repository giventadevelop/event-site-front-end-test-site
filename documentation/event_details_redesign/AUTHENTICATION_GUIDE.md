# Authentication Guide - Clerk Satellite Domain Setup

## Overview

This application uses **Clerk's Satellite Domain** configuration for multi-domain authentication. This means:

- **Primary Domain**: `www.adwiise.com` (handles all authentication)
- **Satellite Domain**: `www.mosc-temp.com` (syncs authentication from primary)

## How It Works

### Authentication Flow

```
1. User visits www.mosc-temp.com
   ↓
2. User clicks "Sign In" → Redirects to www.adwiise.com/sign-in
   ↓
3. User authenticates on primary domain (www.adwiise.com)
   ↓
4. Clerk establishes session on primary domain
   ↓
5. User navigates back to www.mosc-temp.com
   ↓
6. Clerk automatically syncs the session to satellite domain
   ↓
7. User is now authenticated on www.mosc-temp.com
```

### Why This Architecture?

- **Multi-Tenant Support**: Each tenant (organization) can have their own domain
- **Centralized Authentication**: All authentication happens in one place
- **Session Sharing**: Users authenticated on primary domain are automatically authenticated on satellites
- **Security**: Clerk manages cross-domain session synchronization securely

## Production Configuration

### Environment Variables (.env.production)

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Satellite Domain Configuration
NEXT_PUBLIC_CLERK_IS_SATELLITE=true
# IMPORTANT: Use bare domain without www prefix
NEXT_PUBLIC_CLERK_DOMAIN=mosc-temp.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://www.mosc-temp.com
NEXT_PUBLIC_TENANT_ID=tenant_demo_001

# API JWT Authentication (for backend API calls)
AMPLIFY_API_JWT_USER=jwtadmin
AMPLIFY_API_JWT_PASS=jwt@dev123!
```

### Middleware Configuration (src/middleware.ts)

The middleware is configured to:

1. **Mark public routes**: Routes that don't require authentication
2. **Handle satellite domain**: Configure Clerk to work with satellite setup
3. **Ignore prefetch requests**: Allow Next.js RSC prefetch requests without authentication
4. **Redirect sign-in**: Direct users to primary domain for authentication

## Common Issues and Solutions

### Issue 1: "userId: null" in Production

**Symptom**: Console shows `[Header] Auth state: {isLoaded: true, userId: null, ...}`

**Cause**: You haven't authenticated on the primary domain yet.

**Solution**:
1. Navigate to `https://www.adwiise.com/sign-in`
2. Sign in with your credentials
3. After successful sign-in, navigate to `https://www.mosc-temp.com`
4. You should now be authenticated on the satellite domain

### Issue 2: 401 Errors on Route Prefetches

**Symptom**: Console shows multiple 401 errors for routes like `/calendar?_rsc=...`

**Cause**: Next.js prefetch requests happening before authentication sync completes.

**Impact**: Mostly cosmetic - the actual page loads work fine due to:
- Cached event data
- Fallback mechanisms in components
- Server-side data fetching

**Solution**:
- The middleware now ignores prefetch requests (`_rsc` parameter)
- These errors should be reduced after the middleware update
- They don't affect actual functionality

### Issue 3: Admin Menu Not Showing

**Symptom**: Even though database shows `user_role: 'ADMIN'`, admin menu doesn't appear.

**Cause**: Two possible reasons:
1. Not authenticated on the satellite domain (see Issue 1)
2. The server-side admin check in layout.tsx couldn't fetch your profile

**Solution**:
1. Ensure you're properly authenticated (see Issue 1 solution)
2. Check browser console for profile fetch errors
3. Verify your `clerk_user_id` in database matches the Clerk user ID

## Admin Role Configuration

### Database Record Required

For admin access, ensure your user profile record has:

```sql
INSERT INTO user_profile (
  clerk_user_id,
  user_id,
  tenant_id,
  user_role,
  user_status,
  email,
  first_name,
  last_name
) VALUES (
  'user_2vVLxhPnsIPGYf6qpfozk383Slr',  -- Your Clerk user ID
  'user_2vVLxhPnsIPGYf6qpfozk383Slr',  -- Can be same as clerk_user_id
  'tenant_demo_001',                    -- Your tenant ID
  'ADMIN',                               -- ← MUST be 'ADMIN' (uppercase)
  'APPROVED',                            -- ← Must be approved
  'your-email@example.com',
  'Your First Name',
  'Your Last Name'
);
```

### How Admin Check Works (src/app/layout.tsx)

```typescript
// Server-side admin check
const { userId } = await auth();
if (userId) {
  // Fetch user profile with tenant filter
  const url = `${baseUrl}/api/proxy/user-profiles?userId.equals=${userId}&tenantId.equals=${tenantId}&size=1`;
  const resp = await fetch(url, { cache: 'no-store' });

  if (resp.ok) {
    const profile = await resp.json();
    isTenantAdmin = profile?.userRole === 'ADMIN';
  }
}

// Pass to Header component
<Header isTenantAdmin={isTenantAdmin} />
```

## Local vs Production Differences

### Local Development

- **Single domain**: localhost (no satellite configuration)
- **Simple authentication**: Direct sign-in works immediately
- **No cross-domain issues**: Everything on localhost

### Production

- **Multi-domain**: Primary + Satellite domains
- **Cross-domain auth**: Must sign in on primary first
- **Session sync**: Clerk handles session synchronization
- **Environment-specific config**: Uses production Clerk keys

## Troubleshooting Steps

### Step 1: Verify Environment Variables

Check that production environment has:
- `NEXT_PUBLIC_CLERK_IS_SATELLITE=true`
- `NEXT_PUBLIC_CLERK_DOMAIN=mosc-temp.com` (bare domain, NO www prefix)
- `NEXT_PUBLIC_APP_URL=https://www.mosc-temp.com` (full URL with www is OK)

### Step 2: Check Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Navigate to your application
3. Check "Domains" section
4. Verify satellite domain is properly configured

### Step 3: Verify Database Record

```sql
-- Check your user profile
SELECT
  clerk_user_id,
  user_role,
  user_status,
  tenant_id,
  email
FROM user_profile
WHERE email = 'your-email@example.com'
  AND tenant_id = 'tenant_demo_001';
```

Expected result:
- `user_role`: 'ADMIN'
- `user_status`: 'APPROVED'
- `tenant_id`: 'tenant_demo_001'

### Step 4: Clear Browser Data

Sometimes cached authentication state can cause issues:
1. Open DevTools (F12)
2. Go to Application tab
3. Clear all Clerk-related cookies
4. Clear localStorage
5. Refresh page

### Step 5: Test Authentication Flow

1. Open incognito/private browsing window
2. Navigate to `https://www.adwiise.com/sign-in`
3. Sign in with your credentials
4. After successful sign-in, navigate to `https://www.mosc-temp.com`
5. Check console: `[Header] Auth state:` should show `userId: 'user_...'`
6. Admin menu should now be visible

## API Authentication (Backend)

The application uses **dual authentication**:

### 1. Clerk (User Authentication)
- Frontend: Clerk SDK handles user sessions
- Server: Clerk middleware provides `auth()` and `currentUser()`

### 2. JWT (Backend API Authentication)
- All API proxy routes use JWT for backend API calls
- JWT is generated using `AMPLIFY_API_JWT_USER` and `AMPLIFY_API_JWT_PASS`
- Token is cached and auto-refreshed on 401 responses

### JWT Flow

```
1. Client makes request to /api/proxy/...
   ↓
2. Proxy handler calls getCachedApiJwt()
   ↓
3. If no cached token or expired:
   - Call backend /api/authenticate
   - Send username/password
   - Receive JWT token
   - Cache token
   ↓
4. Make backend API call with JWT in Authorization header
   ↓
5. If 401 response:
   - Generate new JWT
   - Retry request
   ↓
6. Return response to client
```

## Security Considerations

### Public Routes

The following routes are public (no authentication required):
- Home page: `/`
- Events: `/events/*`
- Gallery: `/gallery/*`
- Calendar: `/calendar/*`
- Polls: `/polls/*`
- MOSC pages: `/mosc/*`
- API proxy: `/api/proxy/*` (uses JWT for backend, but no Clerk auth required)

### Protected Routes

Require Clerk authentication:
- Profile: `/profile`
- Admin pages: `/admin/*`

### Admin Routes

Require both:
1. Clerk authentication (userId present)
2. Admin role in database (userRole === 'ADMIN')
3. Approved status (userStatus === 'APPROVED')
4. Matching tenant ID

## Deployment Checklist

When deploying to production:

- [ ] Set all Clerk environment variables
- [ ] Set `NEXT_PUBLIC_CLERK_IS_SATELLITE=true`
- [ ] Set `NEXT_PUBLIC_CLERK_DOMAIN` to satellite domain
- [ ] Set API JWT credentials (`AMPLIFY_API_JWT_USER`, `AMPLIFY_API_JWT_PASS`)
- [ ] Configure Clerk dashboard with satellite domain
- [ ] Verify primary domain is working
- [ ] Test authentication flow from primary to satellite
- [ ] Verify admin role in database
- [ ] Test admin menu visibility
- [ ] Check browser console for errors

## Support

If you continue to experience issues:

1. Check browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database record has correct admin role
4. Try authentication flow in incognito mode
5. Check Clerk dashboard for domain configuration
6. Verify backend API is accessible and JWT authentication works

## Additional Resources

- [Clerk Satellite Domains Documentation](https://clerk.com/docs/advanced-usage/satellite-domains)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Clerk Next.js SDK](https://clerk.com/docs/references/nextjs/overview)
