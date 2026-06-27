# Services Layer

This directory contains all service layer implementations for the application.

## Structure

```
services/
├── auth/                    # Authentication services
│   ├── clerkAuthService.ts  # Clerk backend API integration
│   ├── tokenService.ts      # JWT token management
│   └── index.ts             # Export aggregator
└── README.md                # This file
```

## Authentication Services

### ClerkAuthService (`auth/clerkAuthService.ts`)

Handles all interactions with the Clerk backend API.

**Key Methods:**
- `getUserById(userId)` - Fetch user details from Clerk
- `getSessionById(sessionId)` - Fetch session details
- `verifyToken(token)` - Verify JWT token validity
- `revokeSession(sessionId)` - Revoke/logout a session

**Usage:**
```typescript
import { clerkAuthService } from '@/services/auth';

// In a server component or API route
const user = await clerkAuthService.getUserById(userId);
const isValid = await clerkAuthService.verifyToken(token);
```

### TokenService (`auth/tokenService.ts`)

Manages JWT token storage and validation on the client side.

**Key Methods:**
- `setTokens(tokenData)` - Store access and refresh tokens
- `getAccessToken()` - Retrieve stored access token
- `getRefreshToken()` - Retrieve stored refresh token
- `isTokenExpired()` - Check if current token is expired
- `clearTokens()` - Remove all tokens (logout)
- `isAuthenticated()` - Check if user has valid authentication

**Usage:**
```typescript
import { tokenService } from '@/services/auth';

// Store tokens after login
tokenService.setTokens({
  accessToken: 'token_here',
  refreshToken: 'refresh_token_here',
  expiresAt: Date.now() + 3600000 // 1 hour
});

// Check authentication status
if (tokenService.isAuthenticated()) {
  const token = tokenService.getAccessToken();
  // Use token for API calls
}

// Logout
tokenService.clearTokens();
```

## Best Practices

1. **Server-Side Only**: Always use `clerkAuthService` on the server side (API routes, server components)
2. **Client-Side Token Management**: Use `tokenService` for client-side token operations
3. **Token Refresh**: Implement token refresh logic before tokens expire
4. **Error Handling**: Always handle service errors gracefully
5. **Security**: Never expose sensitive credentials or tokens in client-side code

## Adding New Services

When adding a new service:

1. Create a new directory for the service category (if needed)
2. Create the service file with a singleton pattern
3. Add exports to the category's `index.ts`
4. Document the service in this README
5. Write tests for the service

Example:
```typescript
// src/services/example/myService.ts
export class MyService {
  private static instance: MyService;

  private constructor() {
    // Initialize
  }

  public static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }

  // Service methods...
}

export default MyService.getInstance();
```

## Environment Configuration

Services rely on environment variables configured in `src/lib/env.ts`.

See `CLERK_BACKEND_SETUP.md` in the project root for configuration details.


