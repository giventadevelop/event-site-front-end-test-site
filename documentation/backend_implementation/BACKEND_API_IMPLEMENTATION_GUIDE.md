# Backend API Implementation Guide

## Overview

The frontend is now configured to use the new backend Clerk authentication system. The API routes have been created with **mock responses** to allow testing the frontend flow.

**IMPORTANT:** You need to implement the actual Clerk backend integration in these API routes.

---

## API Routes Created (With Mock Responses)

### ✅ Created Routes:
- `/api/auth/signup` - User registration
- `/api/auth/signin` - User authentication
- `/api/auth/signout` - User logout
- `/api/auth/refresh` - Token refresh
- `/api/auth/me` - Get current user
- `/api/auth/social` - Social authentication
- `/api/auth/verify` - Token verification

---

## What Needs to Be Implemented

### 1. Sign Up Endpoint (`/api/auth/signup`)

**Current:** Returns mock token
**Needed:** Implement real Clerk user creation

```typescript
// src/app/api/auth/signup/route.ts

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName } = await req.json();

  // TODO: Implement this
  // 1. Create user in Clerk backend
  const clerkUser = await clerkAuthService.createUser({
    emailAddress: email,
    password,
    firstName,
    lastName,
  });

  // 2. Generate JWT tokens (use your backend or Clerk)
  const tokens = await generateJwtTokens(clerkUser.id);

  // 3. Store user in your database (optional)
  await createUserProfile(clerkUser.id, email, firstName, lastName);

  // 4. Return tokens and user data
  return NextResponse.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: 3600,
    user: {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  });
}
```

---

### 2. Sign In Endpoint (`/api/auth/signin`)

**Current:** Returns mock token
**Needed:** Implement real Clerk authentication

```typescript
// src/app/api/auth/signin/route.ts

export async function POST(req: NextRequest) {
  const { email, password, rememberMe } = await req.json();

  // TODO: Implement this
  // 1. Verify credentials with Clerk backend
  const session = await clerkAuthService.createSession({
    strategy: 'password',
    identifier: email,
    password,
  });

  if (!session || !session.userId) {
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // 2. Get user data
  const clerkUser = await clerkAuthService.getUserById(session.userId);

  // 3. Generate JWT tokens
  const expiresIn = rememberMe ? 604800 : 3600; // 7 days vs 1 hour
  const tokens = await generateJwtTokens(session.userId, expiresIn);

  // 4. Return tokens and user data
  return NextResponse.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn,
    user: {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  });
}
```

---

### 3. Sign Out Endpoint (`/api/auth/signout`)

**Current:** Returns success
**Needed:** Implement session revocation

```typescript
// src/app/api/auth/signout/route.ts

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.substring(7); // Remove 'Bearer '

  if (!token) {
    return NextResponse.json({ success: true });
  }

  // TODO: Implement this
  // 1. Decode token to get session ID
  const decoded = decodeJwt(token);
  const sessionId = decoded.sid;

  // 2. Revoke session in Clerk backend
  await clerkAuthService.revokeSession(sessionId);

  // 3. Invalidate refresh token
  await invalidateRefreshToken(token);

  return NextResponse.json({ success: true });
}
```

---

### 4. Token Refresh Endpoint (`/api/auth/refresh`)

**Current:** Returns mock new token
**Needed:** Implement actual token refresh

```typescript
// src/app/api/auth/refresh/route.ts

export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json();

  // TODO: Implement this
  // 1. Verify refresh token
  const decoded = await verifyRefreshToken(refreshToken);

  if (!decoded) {
    return NextResponse.json(
      { message: 'Invalid refresh token' },
      { status: 401 }
    );
  }

  // 2. Generate new access token
  const newAccessToken = await generateAccessToken(decoded.userId);

  // 3. Optionally rotate refresh token
  const newRefreshToken = await generateRefreshToken(decoded.userId);

  return NextResponse.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 3600,
  });
}
```

---

### 5. Get Current User Endpoint (`/api/auth/me`)

**Current:** Returns mock user
**Needed:** Implement actual user retrieval

```typescript
// src/app/api/auth/me/route.ts

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.substring(7);

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Implement this
  // 1. Verify token
  const decoded = await verifyAccessToken(token);

  if (!decoded) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  // 2. Get user from Clerk backend
  const clerkUser = await clerkAuthService.getUserById(decoded.userId);

  // 3. Return user data
  return NextResponse.json({
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0].emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
  });
}
```

---

### 6. Social Authentication Endpoint (`/api/auth/social`)

**Current:** Returns mock token
**Needed:** Implement OAuth token exchange

```typescript
// src/app/api/auth/social/route.ts

export async function POST(req: NextRequest) {
  const { provider, token } = await req.json();

  // TODO: Implement this
  switch (provider) {
    case 'google':
      // 1. Verify Google token
      const googleUser = await verifyGoogleToken(token);

      // 2. Create or find user in Clerk
      const clerkUser = await clerkAuthService.createOrFindUser({
        strategy: 'oauth_google',
        emailAddress: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
      });

      // 3. Generate JWT tokens
      const tokens = await generateJwtTokens(clerkUser.id);

      return NextResponse.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 3600,
        user: {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0].emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      });

    case 'facebook':
      // Similar implementation for Facebook
      break;

    case 'github':
      // Similar implementation for GitHub
      break;
  }
}
```

---

## JWT Token Generation

You need to implement JWT token generation. Here's a suggested approach:

```typescript
// src/lib/auth/jwtTokens.ts

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

export function generateAccessToken(userId: string): string {
  return jwt.sign(
    {
      userId,
      type: 'access',
    },
    JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      userId,
      type: 'refresh',
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
    }
  );
}

export function verifyAccessToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'access') return null;
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    if (decoded.type !== 'refresh') return null;
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
}
```

---

## Testing the Current Implementation

### With Mock Responses (Current State):

The system is now active with mock responses. You can test the frontend flow:

1. **Visit:** `http://localhost:3000/sign-in`
2. **Enter any credentials** (will accept anything)
3. **Observe:** Mock token stored, user authenticated
4. **Test:** Protected routes, sign-out, etc.

### Frontend Works With Mocks:
- ✅ Sign-in form works (stores mock token)
- ✅ Sign-up form works (stores mock token)
- ✅ Social buttons render (will use mock tokens)
- ✅ Protected routes work
- ✅ Token refresh works
- ✅ Session timeout works

### What Doesn't Work Yet:
- ❌ Real Clerk user creation
- ❌ Real credential verification
- ❌ Real token validation
- ❌ Real social OAuth exchange

---

## Implementation Priority

### Phase 1: Basic Email/Password (Highest Priority)
1. Implement `/api/auth/signup`
2. Implement `/api/auth/signin`
3. Implement JWT token generation
4. Implement `/api/auth/me`

### Phase 2: Token Management
1. Implement `/api/auth/refresh`
2. Implement `/api/auth/verify`
3. Implement `/api/auth/signout`

### Phase 3: Social Authentication (Optional)
1. Implement Google OAuth exchange
2. Implement Facebook OAuth exchange
3. Implement GitHub OAuth exchange

---

## Required Environment Variables

Add to `.env.local`:

```bash
# JWT Secret Keys (REQUIRED for token generation)
JWT_SECRET=your-jwt-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Clerk Backend (Already have)
CLERK_SECRET_KEY=sk_test_...
CLERK_BACKEND_API_URL=https://api.clerk.com
```

---

## Testing Checklist

### With Mock Responses (Current):
- [ ] Navigate to `/sign-in`
- [ ] Enter any email/password
- [ ] Click "Sign In"
- [ ] Verify token stored in localStorage
- [ ] Verify redirected to `/dashboard`
- [ ] Verify protected routes work
- [ ] Test sign-out
- [ ] Test token refresh (wait or manually trigger)

### With Real Implementation (After Backend):
- [ ] Sign up with real email
- [ ] Verify user created in Clerk
- [ ] Sign in with real credentials
- [ ] Verify token is valid JWT
- [ ] Test protected routes
- [ ] Test token refresh
- [ ] Test social login (if implemented)

---

## Next Steps

1. **Decide on JWT Strategy:**
   - Use Clerk's session tokens directly
   - OR generate your own JWTs backed by Clerk

2. **Implement Token Generation:**
   - Create JWT utilities
   - Set up secret keys
   - Implement verification

3. **Implement Clerk Backend Calls:**
   - Use `clerkAuthService` we created
   - Call Clerk REST API for user operations
   - Handle errors properly

4. **Test End-to-End:**
   - With real Clerk account
   - With real credentials
   - With real tokens

---

## Current Status

✅ **Frontend:** Fully implemented and activated
✅ **API Routes:** Created with mock responses
⏳ **Backend Integration:** Needs Clerk backend implementation
⏳ **JWT Tokens:** Needs implementation

**The system is ACTIVE and testable with mocks. Ready for backend implementation!**


