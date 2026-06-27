# Frontend Fixes Implementation Guide

## Overview

This guide provides the exact code fixes needed in the **Next.js frontend repository** to resolve the membership plan creation API error.

## Issues to Fix

1. ✅ Proxy handler not reading/forwarding request body
2. ✅ Next.js App Router `headers()` await issue
3. ✅ Server action ensuring body is sent correctly

---

## Fix 1: Proxy Handler - Read and Forward Request Body

### Location: `src/app/api/proxy/membership-plans/route.ts` (App Router)

**Current Issue**: Proxy handler shows `payload: undefined` in logs.

**Fix**: Read the request body and forward it to the backend.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/api/membership-plans${queryString ? `?${queryString}` : ''}`;

  const response = await fetchWithJwtRetry(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: 'Failed to fetch membership plans', details: errorText },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  // CRITICAL: Read the request body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  // Forward to backend with body
  const response = await fetchWithJwtRetry(
    `${API_BASE_URL}/api/membership-plans`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), // CRITICAL: Forward the body
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PROXY] Failed to create membership plan:', response.status, errorText);
    return NextResponse.json(
      { error: 'Failed to create membership plan', details: errorText },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
```

### Alternative: If using Pages Router

**Location**: `src/pages/api/proxy/membership-plans/index.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const url = `${API_BASE_URL}/api/membership-plans${queryString ? `?${queryString}` : ''}`;

    const response = await fetchWithJwtRetry(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Failed to fetch membership plans',
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  }

  if (req.method === 'POST') {
    // CRITICAL: Read the request body
    const body = req.body;

    if (!body) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // Forward to backend with body
    const response = await fetchWithJwtRetry(
      `${API_BASE_URL}/api/membership-plans`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), // CRITICAL: Forward the body
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PROXY] Failed to create membership plan:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Failed to create membership plan',
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
```

---

## Fix 2: Admin Layout - Await headers()

### Location: `src/app/admin/layout.tsx`

**Current Issue**:
```
Route "/admin/membership/plans" used `...headers()` or similar iteration.
`headers()` should be awaited before using its value.
```

**Fix**: Make the layout function `async` and `await` the `headers()` call.

```typescript
import { headers } from 'next/headers';

// ❌ WRONG (current)
export default function AdminLayout({ children }) {
  const headersList = headers(); // Error: must be awaited
  // ...
}

// ✅ CORRECT (fixed)
export default async function AdminLayout({ children }) {
  const headersList = await headers(); // Must await in App Router
  // ... rest of your code
}
```

**Full Example**:

```typescript
import { headers } from 'next/headers';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // CRITICAL: Await headers() in App Router
  const headersList = await headers();

  // Use headersList as needed
  // const authorization = headersList.get('authorization');

  return (
    <div className="admin-layout">
      {/* Your admin layout content */}
      {children}
    </div>
  );
}
```

---

## Fix 3: Server Action - Ensure Body is Sent

### Location: `src/app/admin/membership/plans/ApiServerActions.ts`

**Current Issue**: Server action may not be sending the request body correctly.

**Fix**: Ensure the body is properly stringified and sent.

```typescript
import { getAppUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';

export interface MembershipPlanDTO {
  id?: number;
  tenantId: string;
  planName: string;
  planCode: string;
  description?: string;
  planType: 'SUBSCRIPTION' | 'ONE_TIME' | 'FREEMIUM';
  billingInterval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  price: number;
  currency: string;
  trialDays?: number;
  isActive: boolean;
  maxEventsPerMonth?: number;
  maxAttendeesPerEvent?: number;
  featuresJson?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function createMembershipPlanServer(
  planData: Omit<MembershipPlanDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<MembershipPlanDTO> {
  const baseUrl = getAppUrl();

  // Ensure tenantId is included via withTenantId
  const payload = withTenantId({
    ...planData,
    // Ensure required fields have defaults
    planType: planData.planType || 'SUBSCRIPTION',
    billingInterval: planData.billingInterval || 'MONTHLY',
    currency: planData.currency || 'USD',
    isActive: planData.isActive ?? true,
    trialDays: planData.trialDays ?? 0,
  });

  // CRITICAL: Ensure body is stringified
  const body = JSON.stringify(payload);

  console.log('[SERVER ACTION] Creating membership plan with payload:', payload);

  const res = await fetch(`${baseUrl}/api/proxy/membership-plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body, // CRITICAL: Must include body
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Failed to create membership plan:', res.status, errorBody);
    throw new Error(`Failed to create membership plan: ${errorBody}`);
  }

  const createdPlan = await res.json();
  return createdPlan;
}
```

---

## Fix 4: Update createProxyHandler Utility (If Used)

If you're using a `createProxyHandler` utility function, ensure it reads and forwards the request body.

### Location: `src/lib/proxyHandler.ts`

**Check if this function exists and update it**:

```typescript
import { NextApiRequest, NextApiResponse } from 'next/types';
import { fetchWithJwtRetry } from './fetchWithJwtRetry';

interface ProxyHandlerOptions {
  backendPath: string;
  allowedMethods?: string[];
}

export function createProxyHandler(options: ProxyHandlerOptions) {
  const { backendPath, allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] } = options;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!allowedMethods.includes(req.method || '')) {
      res.setHeader('Allow', allowedMethods);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    try {
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = `${API_BASE_URL}${backendPath}${queryString ? `?${queryString}` : ''}`;

      // CRITICAL: Read request body for POST, PUT, PATCH requests
      const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method || '');
      const body = hasBody ? req.body : undefined;

      const fetchOptions: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // CRITICAL: Include body if present
      if (body) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetchWithJwtRetry(url, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          error: 'Proxy request failed',
          details: errorText,
        });
      }

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('[PROXY HANDLER] Error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
```

---

## Testing the Fixes

### 1. Test Proxy Handler Directly

```bash
# Test POST request with body
curl -X POST http://localhost:3000/api/proxy/membership-plans \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant_demo_002",
    "planName": "Test Plan",
    "planCode": "TEST",
    "planType": "SUBSCRIPTION",
    "billingInterval": "MONTHLY",
    "price": 19.99,
    "currency": "USD",
    "isActive": true
  }'
```

### 2. Check Browser Console

After applying fixes, check the browser console for:
- ✅ No `headers()` await errors
- ✅ Request body is logged correctly
- ✅ Backend receives the request body

### 3. Verify Backend Logs

Check backend logs for:
```
REST request to save MembershipPlan : MembershipPlanDTO{...}
```

If you see this, the body is being received correctly.

---

## Summary Checklist

- [ ] **Fix 1**: Update proxy handler to read and forward `request.json()` (App Router) or `req.body` (Pages Router)
- [ ] **Fix 2**: Make `AdminLayout` async and await `headers()`
- [ ] **Fix 3**: Verify server action sends body with `JSON.stringify()`
- [ ] **Fix 4**: Update `createProxyHandler` utility if used
- [ ] **Test**: Verify POST request works end-to-end
- [ ] **Verify**: Check backend logs show received DTO

---

## Expected Behavior After Fixes

1. ✅ No `headers()` await errors in console
2. ✅ Proxy handler logs show `payload: {...}` instead of `undefined`
3. ✅ Backend receives request body and creates membership plan
4. ✅ Frontend receives 201 Created response with created plan data

---

## Notes

- The backend is correctly configured and ready to receive requests
- All fixes are in the **frontend Next.js repository**, not this backend repository
- Ensure environment variables are set correctly (`NEXT_PUBLIC_API_BASE_URL`)
- Verify JWT authentication is working for the proxy handler

