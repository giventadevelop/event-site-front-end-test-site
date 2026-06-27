# Clerk Backend Integration Setup

## Overview
This project has been refactored to use **Clerk backend authentication** instead of client-side Clerk integration. This provides better security and control over authentication flows.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        Next.js Application                       │
│                         (Port 3000)                              │
└──────────────────────────────────────────────────────────────────┘
                │                                  │
                │                                  │
                ▼                                  ▼
┌───────────────────────────┐      ┌──────────────────────────────┐
│   Clerk Authentication    │      │   Your Spring Boot Backend   │
│        Service            │      │      (Port 8080)             │
│   api.clerk.com           │      │                              │
│                           │      │   Business Logic & APIs      │
│ - User Management         │      │   - Event Management         │
│ - Session Verification    │      │   - Ticket Operations        │
│ - Token Validation        │      │   - Data Storage             │
└───────────────────────────┘      └──────────────────────────────┘

CLERK_BACKEND_API_URL           NEXT_PUBLIC_API_BASE_URL
(Clerk's SaaS Service)          (Your Backend Server)
```

**Key Point:** These are TWO DIFFERENT services:
- **Clerk API** = Authentication provider (handles login, sessions, users)
- **Your Backend** = Business logic (handles events, tickets, data)

## Required Environment Variables

Add these to your `.env.local` file:

### Clerk Configuration (REQUIRED)
```bash
# Clerk Secret Key (Server-side only - REQUIRED for backend integration)
CLERK_SECRET_KEY=sk_test_***_clerk_secret_key_here

# Clerk Backend API URL - Points to CLERK's authentication service (NOT your Spring Boot backend)
# This is OPTIONAL and defaults to https://api.clerk.com if not set
# Only change this if you're using Clerk's on-premise deployment
CLERK_BACKEND_API_URL=https://api.clerk.com
```

### Your Spring Boot Backend Configuration (Existing)
```bash
# Your Spring Boot backend URL (NOT Clerk's API)
# This is where your business logic and REST APIs live
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080  # Local development
# NEXT_PUBLIC_API_BASE_URL=http://simple-sprin-gdetoelq3kj7-1263510416.us-east-1.elb.amazonaws.com  # Production
```

### Clerk Optional Configuration
```bash
# Clerk Publishable Key (Optional - for hybrid client/server approach)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***_clerk_publishable_key_here

# Clerk Sign-in/Sign-up URLs (if using Clerk hosted pages)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Project Structure

### Services Layer
Located in `src/services/auth/`:

- **clerkAuthService.ts**: Handles all Clerk backend API calls
  - getUserById() - Fetch user by ID
  - getSessionById() - Fetch session by ID
  - verifyToken() - Verify JWT token
  - revokeSession() - Logout/revoke session

- **tokenService.ts**: Manages JWT token storage and validation
  - setTokens() - Store access/refresh tokens
  - getAccessToken() - Retrieve access token
  - getRefreshToken() - Retrieve refresh token
  - isTokenExpired() - Check token expiration
  - clearTokens() - Clear all tokens (logout)
  - isAuthenticated() - Check if user is authenticated

### Environment Configuration
Located in `src/lib/env.ts`:

- **getClerkBackendUrl()**: Returns Clerk API endpoint
- **getClerkSecretKey()**: Returns Clerk secret key (required)
- **getClerkPublishableKey()**: Returns Clerk publishable key (optional)

## Migration Notes

### From Client-Side to Backend Clerk

**Before (Client-Side):**
```typescript
import { useAuth } from '@clerk/nextjs';

function MyComponent() {
  const { userId, signOut } = useAuth();
  // Client-side authentication
}
```

**After (Backend):**
```typescript
import { clerkAuthService } from '@/services/auth';

// Server Component or API Route
async function getUser(userId: string) {
  const user = await clerkAuthService.getUserById(userId);
  return user;
}
```

## Testing

1. Verify environment variables are set:
```bash
# Check if .env.local exists and contains CLERK_SECRET_KEY
cat .env.local | grep CLERK_SECRET_KEY
```

2. Test the service layer:
```typescript
import { clerkAuthService, tokenService } from '@/services/auth';

// Test user retrieval
const user = await clerkAuthService.getUserById('user_xxxxx');

// Test token management
tokenService.setTokens({
  accessToken: 'token_here',
  expiresAt: Date.now() + 3600000 // 1 hour
});

const isAuth = tokenService.isAuthenticated();
```

## Next Steps (Remaining Tasks)

Task 1 is now complete. The following tasks will build on this foundation:

- **Task 2**: Implement API client with interceptors
- **Task 3**: Create token management service (DONE as part of Task 1)
- **Task 4**: Implement authentication service (DONE as part of Task 1)
- **Task 5**: Create authentication context
- **Task 6**: Implement authentication hooks
- **Task 7**: Create protected route HOC/middleware
- **Task 8**: Implement sign-in page
- **Task 9**: Implement sign-up page
- **Task 10**: Update layout components

## Security Considerations

1. **Never expose CLERK_SECRET_KEY** on the client side
2. All Clerk API calls must be made from server components or API routes
3. Tokens are stored in localStorage (client-side only)
4. Session validation happens server-side
5. Always verify tokens before processing authenticated requests

## Support

For issues or questions about the Clerk backend integration:
- Check Clerk documentation: https://clerk.com/docs
- Review the service implementations in `src/services/auth/`
- Verify environment variables are correctly set

