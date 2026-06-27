# React Hydration Fixes and Mobile Payment Success Flow

## Document Purpose

This document provides a comprehensive guide for debugging and fixing React hydration issues in Next.js 13+ App Router, specifically in the context of mobile ticket purchase success page workflows. It documents critical fixes applied to resolve hydration failures that prevented client-side JavaScript from executing.

**Created:** 2025-11-25
**Last Updated:** 2025-11-25
**Status:** Active Debugging

---

## Table of Contents

1. [Problem Overview](#problem-overview)
2. [Mobile Payment Success Flow Architecture](#mobile-payment-success-flow-architecture)
3. [Critical Issues Identified](#critical-issues-identified)
4. [React Hydration Fundamentals](#react-hydration-fundamentals)
5. [Root Causes and Fixes](#root-causes-and-fixes)
6. [Debugging Approach](#debugging-approach)
7. [Prevention Guidelines](#prevention-guidelines)
8. [Verification Steps](#verification-steps)

---

## Problem Overview

### Symptoms

**Primary Issue:** Mobile users completing ticket purchases via Apple Pay/Google Pay get stuck on a loading screen instead of seeing their QR code success page.

**Observable Behavior:**
- Browser console shows ONLY `MobileDebugConsole` initialization logs
- NO logs from `TicketQrClient` component's useEffect hooks
- CloudWatch shows server-side rendering works correctly
- Component HTML appears in the browser DOM
- No visible JavaScript errors in console
- Success page briefly appears, then redirects to QR page
- QR page shows only loading spinner indefinitely

**Expected Behavior:**
1. User completes payment on mobile
2. Redirected to `/event/success?pi=pi_xxx`
3. Success page detects mobile browser
4. Shows brief success message (2 seconds)
5. Redirects to `/event/ticket-qr?pi=pi_xxx`
6. QR page fetches transaction data
7. Displays QR code and ticket details

**Actual Behavior:**
- Steps 1-5 work correctly
- Step 6 fails: No data fetching occurs
- Step 7 never happens: Stuck on loading screen

---

## Mobile Payment Success Flow Architecture

### Flow Diagram

```
[Stripe Checkout] → Payment Complete
        ↓
[/event/success?pi=pi_xxx] ← Success Page (Server Component)
        ↓
[SuccessClient.tsx] ← Client Component
        ↓
    Mobile Detection
        ↓ (if mobile)
    Show Brief Success (2s)
        ↓
    router.replace()
        ↓
[/event/ticket-qr?pi=pi_xxx] ← QR Page (Server Component)
        ↓
[TicketQrClient.tsx] ← Client Component
        ↓
    useEffect #1: Mount Detection
        ↓
    useEffect #2: Parameter Initialization
        ↓
    useEffect #3: Transaction Fetch
        ↓
    Display QR Code Success
```

### Key Files Involved

1. **Success Page Flow:**
   - `src/app/event/success/page.tsx` - Server component
   - `src/app/event/success/SuccessClient.tsx` - Client component with mobile detection
   - `src/app/event/success/LoadingTicket.tsx` - Loading UI component

2. **QR Page Flow:**
   - `src/app/event/ticket-qr/page.tsx` - Server component with Suspense
   - `src/app/event/ticket-qr/TicketQrClient.tsx` - Client component with data fetching
   - `src/components/MobileDebugConsole.tsx` - Debug logger (WORKING REFERENCE)

3. **API Endpoints:**
   - `src/app/api/event/success/process/route.ts` - Transaction fetch/create
   - `src/app/api/proxy/events/[eventId]/transactions/[transactionId]/qrcode/route.ts` - QR generation

### Mobile Detection Logic

```typescript
// In SuccessClient.tsx
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || window.innerWidth <= 768;

if (isMobile) {
  setLoading(false);
  setResult({ isMobileBrief: true, identifier, session_id, payment_intent });

  setTimeout(() => {
    const redirectUrl = payment_intent
      ? `/event/ticket-qr?pi=${encodeURIComponent(payment_intent)}`
      : `/event/ticket-qr?session_id=${encodeURIComponent(session_id)}`;

    sessionStorage.setItem('stripe_payment_intent', payment_intent);
    router.replace(redirectUrl);
  }, 2000);
}
```

---

## Critical Issues Identified

### Issue #1: Render-Time Console Logs (CRITICAL)

**Location:** `TicketQrClient.tsx:134-175` (original), `SuccessClient.tsx:41-51` (original)

**Problem:**
```typescript
// ❌ BROKEN - Console logs during component render
export default function TicketQrClient({ initialPi, initialSessionId }: Props) {
  // This runs EVERY render (SSR and client)
  if (typeof window !== 'undefined') {
    console.log('[QR CLIENT] Client render');  // ← CAUSES HYDRATION FAILURE
  } else {
    console.log('[QR CLIENT] Server render');  // ← CAUSES HYDRATION FAILURE
  }

  const [mounted, setMounted] = useState(false);

  console.log('[QR CLIENT] Initializing');  // ← CAUSES HYDRATION FAILURE

  useEffect(() => {
    // This never runs because hydration failed!
    setMounted(true);
  }, []);
}
```

**Why It Breaks:**
- Console.log is a **side effect**
- Side effects during render violate React's purity requirements
- Server renders with different console output than client
- React detects mismatch → aborts hydration → useEffect never runs
- NO ERROR MESSAGE in production mode

**Fix:**
```typescript
// ✅ FIXED - All logging in useEffect
export default function TicketQrClient({ initialPi, initialSessionId }: Props) {
  const [mounted, setMounted] = useState(false);

  // Clean render - no side effects

  useEffect(() => {
    // All logging happens here (client-only)
    console.log('[QR CLIENT] ===== CLIENT-SIDE RENDER =====');
    console.log('[QR CLIENT] Component mounting on client');
    console.log('[QR CLIENT] Props:', { initialPi, initialSessionId });
    setMounted(true);
  }, [initialPi, initialSessionId]);

  return <div>...</div>;
}
```

**Files Fixed:**
- `src/app/event/ticket-qr/TicketQrClient.tsx:132-179`
- `src/app/event/success/SuccessClient.tsx:31-66`
- `src/app/event/success/LoadingTicket.tsx:12-13` (also had render-time logs)

---

### Issue #2: Rules of Hooks Violation (FATAL)

**Location:** `TicketQrClient.tsx:132-170` (original)

**Problem:**
```typescript
// ❌ BROKEN - useState AFTER useEffect
export default function TicketQrClient({ initialPi, initialSessionId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // useEffect declared here (line 145)
  useEffect(() => {
    setMounted(true);
  }, []);

  // ❌ MORE useState AFTER useEffect - FATAL ERROR!
  const [session_id, setSessionId] = useState<string | null>(null);
  const [payment_intent, setPaymentIntent] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string | null>(null);

  // More useEffects follow...
}
```

**Why It Breaks:**
- React requires **all hooks in same order** on every render
- Hook order changed: useState → useEffect → useState (INVALID)
- React's internal hook tracking gets corrupted
- Component **silently fails to hydrate**
- All subsequent useEffect hooks never execute
- NO ERROR MESSAGE in production

**React's Hook Tracking:**
```javascript
// React internally tracks hooks by position
Render 1: [useState, useState, useRouter, useSearchParams, useEffect, useState, useState, useState]
Render 2: [useState, useState, useRouter, useSearchParams, useEffect, ???, ???, ???]
         // React expects same order, gets confused, aborts hydration
```

**Fix:**
```typescript
// ✅ FIXED - All hooks in correct order
export default function TicketQrClient({ initialPi, initialSessionId }: Props) {
  // 1. ALL useState hooks first
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const [qrFetching, setQrFetching] = useState(false);
  const [session_id, setSessionId] = useState<string | null>(initialSessionId || null);
  const [payment_intent, setPaymentIntent] = useState<string | null>(initialPi || null);
  const [identifier, setIdentifier] = useState<string | null>(initialPi || initialSessionId || null);

  // 2. Other hooks (useRouter, useSearchParams, etc.)
  const router = useRouter();
  const searchParams = useSearchParams();

  // 3. Helper functions
  const addApiLog = (message: string) => {
    console.log(message);
    setApiLogs(prev => [...prev, message]);
  };

  // 4. ALL useEffect hooks
  useEffect(() => {
    console.log('[QR CLIENT] Component mounted');
    setMounted(true);
  }, [initialPi, initialSessionId]);

  useEffect(() => {
    // Parameter initialization
  }, [searchParams]);

  useEffect(() => {
    // Transaction fetching
  }, [identifier]);

  return <div>...</div>;
}
```

**Files Fixed:**
- `src/app/event/ticket-qr/TicketQrClient.tsx:132-500`

---

### Issue #3: Dynamic Inline Styles (MINOR)

**Location:** `LoadingTicket.tsx:94`

**Problem:**
```typescript
// ❌ BROKEN - Style changes based on client state
<div style={{ marginTop: mounted ? '150px' : '200px', paddingTop: '60px' }}>
  {/* Loading content */}
</div>
```

**Why It Breaks:**
- Server renders with `mounted=false` → `marginTop: '200px'`
- Client first render expects deterministic output
- React detects potential mismatch

**Fix:**
```typescript
// ✅ FIXED - Static style value
<div style={{ marginTop: '200px', paddingTop: '60px' }}>
  {/* Loading content */}
</div>
```

---

### Issue #4: Unused Next.js Image Import (MINOR)

**Location:** `TicketQrClient.tsx:5` (original)

**Problem:**
```typescript
import Image from "next/image";  // ← Imported but never used
```

**Why It Matters:**
- Even unused imports can cause webpack to include optimization code
- Next.js Image component has complex hydration logic
- Can interfere with component hydration

**Fix:**
```typescript
// ✅ FIXED - Removed unused import
// (no import statement)
```

---

### Issue #5: Missing Suspense Boundary (IMPORTANT)

**Location:** `page.tsx:18-32` (original)

**Problem:**
```typescript
// ❌ BROKEN - useSearchParams without Suspense
export default async function TicketQrPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <TicketQrClient initialPi={params.pi} initialSessionId={params.session_id} />;
}

// TicketQrClient uses useSearchParams() hook
// In Next.js 13+ App Router, this REQUIRES Suspense boundary
```

**Why It Breaks:**
- `useSearchParams()` is a dynamic hook in Next.js App Router
- Without Suspense, can cause hydration mismatches
- Next.js needs Suspense to handle async nature of search params

**Fix:**
```typescript
// ✅ FIXED - Wrapped in Suspense
import { Suspense } from 'react';

export default async function TicketQrPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pi = params.pi;
  const session_id = params.session_id;

  return (
    <Suspense fallback={
      <div>
        <MobileDebugConsole />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <TicketQrClient initialPi={pi} initialSessionId={session_id} />
    </Suspense>
  );
}
```

---

## React Hydration Fundamentals

### What is Hydration?

**Hydration** is the process where React "attaches" JavaScript interactivity to server-rendered HTML.

**Steps:**
1. **Server-Side Rendering (SSR):**
   - Server runs React components
   - Generates HTML string
   - Sends HTML to browser

2. **Client Receives HTML:**
   - Browser displays HTML immediately (fast initial load)
   - HTML is static, non-interactive

3. **Hydration:**
   - JavaScript bundle loads
   - React renders components on client
   - **Compares** client render output to server HTML
   - If they match → React "hydrates" (attaches event handlers)
   - If they don't match → **Hydration failure**

### Hydration Failure Modes

**Silent Failure (Most Common):**
- No error message in production
- Component appears to render
- useEffect hooks never run
- No interactivity

**Warning in Development:**
```
Warning: Text content did not match. Server: "..." Client: "..."
Warning: Expected server HTML to contain a matching <div> in <div>.
```

**Console Error (Rare):**
```
Uncaught Error: Minified React error #418
Uncaught Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

### What Causes Hydration Failure?

1. **Side Effects During Render:**
   - `console.log()` outside useEffect
   - DOM manipulation during render
   - Reading from `window`, `document`, `localStorage` during render
   - Date/time generation during render (server/client times differ)

2. **Conditional Rendering Based on Client-Only State:**
   - `typeof window !== 'undefined'` checks during render
   - Browser API checks during render
   - Screen width checks during render

3. **Non-Deterministic Content:**
   - `Math.random()` during render
   - `Date.now()` during render
   - Any operation that produces different output on server vs client

4. **Rules of Hooks Violations:**
   - Conditional hook calls
   - Hooks called in wrong order
   - Hooks called after early returns

5. **Third-Party Libraries:**
   - Libraries that manipulate DOM directly
   - Libraries that assume browser environment
   - Libraries with side effects during render

---

## Root Causes and Fixes

### Summary of All Fixes Applied

| Issue | File | Lines | Severity | Status |
|-------|------|-------|----------|--------|
| Render-time console.logs | `TicketQrClient.tsx` | 134-175 | CRITICAL | ✅ FIXED |
| Render-time console.logs | `SuccessClient.tsx` | 41-51 | CRITICAL | ✅ FIXED |
| Render-time console.logs | `LoadingTicket.tsx` | 12-13 | MINOR | ✅ FIXED |
| Rules of Hooks violation | `TicketQrClient.tsx` | 132-170 | FATAL | ✅ FIXED |
| Dynamic inline style | `LoadingTicket.tsx` | 94 | MINOR | ✅ FIXED |
| Unused Image import | `TicketQrClient.tsx` | 5 | MINOR | ✅ FIXED |
| Missing Suspense boundary | `page.tsx` | 18-32 | IMPORTANT | ✅ FIXED |

### Code Patterns: Before and After

#### Pattern 1: Clean Component Structure

```typescript
// ❌ BROKEN - Side effects everywhere
export default function MyComponent({ prop }: Props) {
  console.log('Rendering with prop:', prop);  // ← BAD

  const [state, setState] = useState(false);

  if (typeof window !== 'undefined') {
    console.log('Client side');  // ← BAD
  }

  useEffect(() => {
    setState(true);
  }, []);

  const [lateState, setLateState] = useState(null);  // ← BAD: Hook order violation

  console.log('State is', state);  // ← BAD

  return <div>Content</div>;
}

// ✅ FIXED - Clean structure
export default function MyComponent({ prop }: Props) {
  // 1. ALL hooks first, in consistent order
  const [state, setState] = useState(false);
  const [lateState, setLateState] = useState(null);
  const router = useRouter();

  // 2. Helper functions (no side effects)
  const helper = (val: string) => {
    console.log(val);  // OK when called from useEffect
  };

  // 3. ALL useEffect hooks
  useEffect(() => {
    // All logging and side effects here
    console.log('Component mounted');
    console.log('Rendering with prop:', prop);
    console.log('State is', state);

    if (typeof window !== 'undefined') {
      console.log('Client side');  // OK in useEffect
    }

    setState(true);
  }, [prop, state]);

  // 4. Render logic (pure, no side effects)
  return <div>Content</div>;
}
```

#### Pattern 2: Mobile Detection

```typescript
// ❌ BROKEN - Detection during render
export default function SuccessClient({ session_id, payment_intent }: Props) {
  console.log('[SUCCESS] Starting');  // ← BAD

  const isMobile = /Android|iPhone/i.test(navigator.userAgent);  // ← BAD: Runs during render

  if (isMobile) {
    console.log('[SUCCESS] Mobile detected');  // ← BAD
    // Redirect logic...
  }

  return <div>...</div>;
}

// ✅ FIXED - Detection in useEffect
export default function SuccessClient({ session_id, payment_intent }: Props) {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('[SUCCESS] Starting');  // OK

    const isMobile = /Android|iPhone/i.test(navigator.userAgent);
    console.log('[SUCCESS] Mobile detection result:', isMobile);  // OK

    setIsMobileDevice(isMobile);

    if (isMobile) {
      setTimeout(() => {
        const redirectUrl = `/event/ticket-qr?pi=${encodeURIComponent(payment_intent)}`;
        console.log('[SUCCESS] Redirecting to:', redirectUrl);  // OK
        router.replace(redirectUrl);
      }, 2000);
    }
  }, [session_id, payment_intent, router]);

  // Render waits for mobile detection
  if (isMobileDevice === null) {
    return <LoadingSpinner />;
  }

  if (isMobileDevice) {
    return <MobileBriefSuccess />;
  }

  return <DesktopSuccess />;
}
```

#### Pattern 3: Error Handling in useEffect

```typescript
// ✅ BEST PRACTICE - Defensive useEffect
useEffect(() => {
  try {
    console.log('[QR CLIENT VERSION] v2025-11-25-22:52 - All hydration fixes applied');
    console.log('[QR CLIENT] Component mounting on client');
    console.log('[QR CLIENT] URL:', window.location.href);
    console.log('[QR CLIENT] Props:', { initialPi, initialSessionId });

    // ... other logic

    setMounted(true);
  } catch (error) {
    console.error('[QR CLIENT] CRITICAL ERROR in mount useEffect:', error);
    console.error('[QR CLIENT] Error stack:', error instanceof Error ? error.stack : 'No stack');

    // Still set mounted to allow component to progress
    setMounted(true);
  }
}, [initialPi, initialSessionId]);
```

---

## Debugging Approach

### Step 1: Identify Hydration Failure

**Symptoms to Look For:**
- Component renders on server (CloudWatch logs show SSR)
- Component HTML appears in browser
- NO useEffect logs in browser console
- Other components on same page work fine (proves JS is executing)
- No visible error messages

**Diagnostic Pattern:**
```typescript
// Add a working reference component
import MobileDebugConsole from '@/components/MobileDebugConsole';

export default function BrokenComponent() {
  const [state, setState] = useState(false);

  useEffect(() => {
    console.log('BrokenComponent mounted');  // This log never appears
  }, []);

  return (
    <div>
      <MobileDebugConsole />  {/* This DOES work - proves JS runs */}
      <div>Broken content</div>
    </div>
  );
}
```

**If MobileDebugConsole works but your component doesn't → Hydration failure in your component**

### Step 2: Check for Render-Time Side Effects

**Audit Checklist:**
```typescript
export default function MyComponent({ prop }: Props) {
  // ❌ CHECK: Any console.log here?
  // ❌ CHECK: Any typeof window checks here?
  // ❌ CHECK: Any DOM/localStorage access here?
  // ❌ CHECK: Any Date.now() or Math.random() here?

  const [state, setState] = useState(false);

  // ❌ CHECK: Any console.log here?
  // ❌ CHECK: Any side effects here?

  useEffect(() => {
    // ✅ SAFE: All side effects should be here
  }, []);

  // ❌ CHECK: Any console.log here?

  return <div>...</div>;
}
```

**Fix:** Move ALL side effects into useEffect

### Step 3: Verify Hook Order

**Audit Checklist:**
```typescript
export default function MyComponent() {
  // 1. Count all useState hooks
  const [state1, setState1] = useState(false);
  const [state2, setState2] = useState(null);
  // ... are there more useState later?

  // 2. Check if any useEffect comes BEFORE useState
  useEffect(() => {}, []);

  // 3. Look for useState AFTER useEffect
  const [state3, setState3] = useState(null);  // ❌ FATAL if this exists!

  // 4. Check hook order is consistent
}
```

**Fix:** Reorganize so all hooks of same type are grouped together at top

### Step 4: Add Version Markers

**Purpose:** Verify that new build is actually deployed

```typescript
useEffect(() => {
  console.log('[COMPONENT VERSION] v2025-11-25-TIMESTAMP - Description of fix');
  // ... rest of useEffect
}, []);
```

**If version marker doesn't appear → Old build still deployed (cache issue)**

### Step 5: Add Error Boundaries

```typescript
// Create ErrorBoundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ERROR BOUNDARY] Caught error:', error);
    console.error('[ERROR BOUNDARY] Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Component Error</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap problematic component
<ErrorBoundary>
  <TicketQrClient {...props} />
</ErrorBoundary>
```

### Step 6: Check Build/Deployment

**Verification Steps:**

1. **Check Build Logs:**
   ```bash
   npm run build
   # Look for errors or warnings
   ```

2. **Check File Timestamps:**
   ```bash
   ls -la .next/server/app/event/ticket-qr/page.js
   # Verify file was updated recently
   ```

3. **Check Deployment Status:**
   - AWS Amplify console
   - Verify latest commit hash matches
   - Check if deployment is complete

4. **Check CloudWatch for Server Logs:**
   - If server logs appear → Page is being rendered
   - If NO server logs → Page is cached

5. **Check Browser Cache:**
   - Open DevTools → Network tab
   - Check if JS bundles are returning 304 (cached)
   - Force refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Step 7: Cache Invalidation

**If New Build Doesn't Appear:**

1. **Browser Cache:**
   - Hard refresh (Ctrl+Shift+R)
   - Clear browser cache
   - Open in incognito/private window

2. **CDN Cache:**
   ```bash
   # AWS CloudFront
   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"

   # Or via AWS Console
   CloudFront → Distributions → Invalidations → Create Invalidation → Path: /*
   ```

3. **Next.js Cache:**
   ```bash
   # Delete .next directory and rebuild
   rm -rf .next
   npm run build
   ```

4. **Service Worker:**
   ```javascript
   // In browser console
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(registration => registration.unregister());
   });
   ```

---

## Prevention Guidelines

### Rule 1: Pure Render Functions

**Golden Rule:** Component render function must be **pure** - same props/state always produces same output, with no side effects.

```typescript
// ✅ CORRECT - Pure render
export default function MyComponent({ name }: Props) {
  const [count, setCount] = useState(0);

  // Pure calculation (same input → same output)
  const doubled = count * 2;

  return <div>{name}: {doubled}</div>;
}

// ❌ WRONG - Impure render
export default function MyComponent({ name }: Props) {
  const [count, setCount] = useState(0);

  console.log('Rendering');  // ← Side effect!
  const random = Math.random();  // ← Non-deterministic!
  const time = new Date().toISOString();  // ← Different on server vs client!

  return <div>{name}: {time}</div>;
}
```

### Rule 2: All Side Effects in useEffect

**Side Effects Include:**
- Logging (console.log, console.error, etc.)
- DOM manipulation
- API calls
- localStorage/sessionStorage access
- Setting timers/intervals
- Subscribing to events
- Modifying external state

```typescript
// ✅ CORRECT - Side effects in useEffect
export default function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    console.log('Component mounted');

    const stored = localStorage.getItem('key');

    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        console.log('Data loaded:', data);
        setData(data);
      });

    return () => {
      console.log('Component unmounting');
    };
  }, []);

  return <div>{data}</div>;
}
```

### Rule 3: Consistent Hook Order

**React's Rules of Hooks:**

1. **Only call hooks at the top level**
   - Never in loops, conditions, or nested functions
   - Always in the same order

2. **Only call hooks from React functions**
   - React components
   - Custom hooks (functions starting with "use")

```typescript
// ❌ WRONG - Conditional hook
export default function MyComponent({ shouldUseEffect }: Props) {
  const [state, setState] = useState(false);

  if (shouldUseEffect) {
    useEffect(() => {  // ← FATAL: Conditional hook call
      setState(true);
    }, []);
  }

  return <div>...</div>;
}

// ✅ CORRECT - Condition inside hook
export default function MyComponent({ shouldUseEffect }: Props) {
  const [state, setState] = useState(false);

  useEffect(() => {
    if (shouldUseEffect) {  // ← Condition inside hook is OK
      setState(true);
    }
  }, [shouldUseEffect]);

  return <div>...</div>;
}
```

### Rule 4: Group Hooks by Type

**Recommended Order:**

```typescript
export default function MyComponent(props: Props) {
  // 1. ALL useState hooks
  const [state1, setState1] = useState(false);
  const [state2, setState2] = useState(null);
  const [state3, setState3] = useState('');

  // 2. ALL useRef hooks
  const ref1 = useRef(null);
  const ref2 = useRef<HTMLDivElement>(null);

  // 3. ALL useContext hooks
  const context1 = useContext(MyContext);

  // 4. ALL Next.js hooks (useRouter, useSearchParams, etc.)
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 5. ALL useMemo/useCallback hooks
  const memoized = useMemo(() => expensive(), [dep]);
  const callback = useCallback(() => {}, [dep]);

  // 6. Helper functions (no hooks)
  const helper = (val: string) => {
    return val.toUpperCase();
  };

  // 7. ALL useEffect hooks
  useEffect(() => {}, []);
  useEffect(() => {}, [dep]);

  // 8. Render logic
  return <div>...</div>;
}
```

### Rule 5: Use Mount Guards for Progressive Enhancement

```typescript
// ✅ PATTERN: Progressive enhancement with mount guard
export default function MyComponent() {
  const [mounted, setMounted] = useState(false);
  const [clientOnlyData, setClientOnlyData] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Client-only operations
    const stored = localStorage.getItem('key');
    setClientOnlyData(stored);
  }, []);

  // Show static content during SSR and initial render
  if (!mounted) {
    return <div>Loading...</div>;
  }

  // Show dynamic content after mount
  return <div>Client data: {clientOnlyData}</div>;
}
```

### Rule 6: ESLint Configuration

**Enable React Hooks ESLint Plugin:**

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:react-hooks/recommended"
  ],
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Run ESLint:**
```bash
npm run lint
# Fix automatically where possible
npm run lint -- --fix
```

---

## Verification Steps

### After Applying Fixes

1. **Rebuild Application:**
   ```bash
   npm run build
   ```

2. **Check Build Output:**
   - No errors
   - No warnings about hydration
   - File sizes reasonable

3. **Deploy to Staging/Production**

4. **Verify Browser Logs Show:**
   ```
   [MobileDebugConsole] Mobile debug console initialized
   [QR CLIENT VERSION] v2025-11-25-22:52 - All hydration fixes applied
   [QR CLIENT] ===== CLIENT-SIDE RENDER =====
   [QR CLIENT] Component mounting on client
   [MOBILE QR] ===== PARAMETER INITIALIZATION EFFECT =====
   [TicketQrClient] ===== STARTING TRANSACTION FETCH =====
   ```

5. **Verify CloudWatch Logs Show:**
   ```
   [QR PAGE SERVER] TicketQrPage component rendering
   [QR PAGE SERVER] Search params: { pi: 'pi_xxx', session_id: undefined }
   [QR PAGE SERVER] Rendering TicketQrClient with props: { initialPi: 'pi_xxx', ... }
   ```

6. **Test Mobile Payment Flow:**
   - Complete payment on mobile browser
   - See success page briefly
   - Redirect to QR page
   - See transaction loading
   - See QR code appear
   - Verify email sent

### Success Criteria

- ✅ Version marker appears in browser console
- ✅ All `[QR CLIENT]` logs appear in browser console
- ✅ All `[MOBILE QR]` logs appear in browser console
- ✅ Server-side logs appear in CloudWatch
- ✅ Transaction data loads successfully
- ✅ QR code displays
- ✅ No hydration warnings in development
- ✅ No console errors
- ✅ Mobile flow completes end-to-end

### Failure Modes to Check

**If Version Marker Doesn't Appear:**
- Build hasn't deployed yet
- CDN serving old bundles
- Browser cache serving old JavaScript
- Service worker caching old version

**If Version Marker Appears But Other Logs Don't:**
- Another error in subsequent useEffect
- JavaScript exception preventing code execution
- Check browser DevTools for errors in Sources tab

**If No Server Logs Appear:**
- Page being served from static cache
- Check if page is marked as dynamic: `export const dynamic = 'force-dynamic'`

---

## Additional Resources

### Files to Reference

- **Working Example:** `src/components/MobileDebugConsole.tsx`
  - This component ALWAYS works - use as reference for correct patterns

- **Fixed Components:**
  - `src/app/event/ticket-qr/TicketQrClient.tsx`
  - `src/app/event/success/SuccessClient.tsx`
  - `src/app/event/success/LoadingTicket.tsx`

### External Documentation

- [React Hydration Documentation](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Next.js App Router Rendering](https://nextjs.org/docs/app/building-your-application/rendering)
- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [React Server Components](https://react.dev/reference/rsc/server-components)

### Related Documentation

- `documentation/mobile_debugging/MOBILE_API_DEBUGGING_PROMPT.md`
- `documentation/mobile_debugging/MOBILE_BROWSER_DEBUGGING_GUIDE.md`
- `documentation/mobile_debugging/CLOUDWATCH_LOGGING_GUIDE.md`

---

## Appendix: Common Hydration Mistakes

### Mistake 1: Date/Time During Render

```typescript
// ❌ WRONG
export default function MyComponent() {
  const timestamp = new Date().toISOString();  // Different on server vs client
  return <div>Generated at {timestamp}</div>;
}

// ✅ CORRECT
export default function MyComponent() {
  const [timestamp, setTimestamp] = useState<string | null>(null);

  useEffect(() => {
    setTimestamp(new Date().toISOString());
  }, []);

  return <div>Generated at {timestamp || 'loading...'}</div>;
}
```

### Mistake 2: Window/Document Access

```typescript
// ❌ WRONG
export default function MyComponent() {
  const isMobile = window.innerWidth <= 768;  // window undefined on server
  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>;
}

// ✅ CORRECT
export default function MyComponent() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>;
}
```

### Mistake 3: LocalStorage Access

```typescript
// ❌ WRONG
export default function MyComponent() {
  const [value, setValue] = useState(localStorage.getItem('key'));  // localStorage undefined on server
  return <div>{value}</div>;
}

// ✅ CORRECT - Option 1: Mount guard
export default function MyComponent() {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(localStorage.getItem('key'));
  }, []);

  return <div>{value}</div>;
}

// ✅ CORRECT - Option 2: Lazy initialization
export default function MyComponent() {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('key');
  });

  return <div>{value}</div>;
}
```

### Mistake 4: Random Values

```typescript
// ❌ WRONG
export default function MyComponent() {
  const id = Math.random();  // Different value on server vs client
  return <div id={`item-${id}`}>Content</div>;
}

// ✅ CORRECT
import { useId } from 'react';

export default function MyComponent() {
  const id = useId();  // React provides consistent IDs
  return <div id={id}>Content</div>;
}
```

### Mistake 5: Third-Party Libraries

```typescript
// ❌ WRONG
import SomeLibrary from 'some-library';  // Library manipulates DOM during import

export default function MyComponent() {
  return <SomeLibrary />;
}

// ✅ CORRECT
import dynamic from 'next/dynamic';

const SomeLibrary = dynamic(() => import('some-library'), {
  ssr: false,  // Disable SSR for this component
  loading: () => <div>Loading...</div>
});

export default function MyComponent() {
  return <SomeLibrary />;
}
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-25 | Initial documentation of hydration fixes and mobile flow | Claude |

---

**End of Document**
