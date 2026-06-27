# CloudWatch Logging Guide for AWS Amplify

## Overview
This guide explains what logs appear in CloudWatch, how to access them, and how to capture client-side logs for CloudWatch visibility.

---

## What Appears in CloudWatch Logs?

### ✅ **Server-Side Logs (Appear in CloudWatch)**

These logs **WILL** appear in CloudWatch:

1. **API Route Logs** (`src/pages/api/**` or `src/app/api/**`)
   ```typescript
   // ✅ This WILL appear in CloudWatch
   console.log('[API] Processing request');
   console.error('[API] Error occurred');
   ```

2. **Server Component Logs** (Server-side rendering)
   ```typescript
   // ✅ This WILL appear in CloudWatch
   export default async function ServerComponent() {
     console.log('[Server] Rendering component');
   }
   ```

3. **Middleware Logs** (`src/middleware.ts`)
   ```typescript
   // ✅ This WILL appear in CloudWatch
   export default authMiddleware({
     afterAuth(auth, req) {
       console.log('[Middleware] Processing request');
     }
   });
   ```

4. **Webhook Logs** (`src/app/api/webhooks/**`)
   ```typescript
   // ✅ This WILL appear in CloudWatch
   export async function POST(req: NextRequest) {
     console.log('[WEBHOOK] Received event');
   }
   ```

### ❌ **Client-Side Logs (DO NOT Appear in CloudWatch)**

These logs **WILL NOT** appear in CloudWatch:

1. **Client Component Logs** (`'use client'`)
   ```typescript
   // ❌ This will NOT appear in CloudWatch
   'use client';
   export default function ClientComponent() {
     console.log('[Client] This only appears in browser console');
   }
   ```

2. **Browser Console Logs**
   - All `console.log()` in client components
   - Browser DevTools console output
   - Client-side JavaScript errors

---

## How to Access CloudWatch Logs in AWS Amplify

### Step 1: Access AWS Amplify Console

1. Go to: [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app: `mosc-temp` (or your app name)
3. Click on your app to open details

### Step 2: Navigate to Logs

**Option A: From App Dashboard**
1. In your app dashboard, look for **"Monitoring"** or **"Logs"** section
2. Click **"View logs"** or **"CloudWatch Logs"**

**Option B: Direct CloudWatch Access**
1. Click **"Monitoring"** tab in Amplify app
2. Click **"View in CloudWatch"** button
3. Or go directly to: [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups)

### Step 3: Find Your Log Group

Log groups are typically named:
```
/aws/amplify/[app-id]/[branch-name]
```

Or:
```
/aws/amplify/[app-name]/[branch-name]
```

Example:
```
/aws/amplify/abc123def456/main
/aws/amplify/mosc-temp/production
```

### Step 4: View Log Streams

1. Click on your log group
2. You'll see multiple log streams (one per deployment/instance)
3. Click on the most recent log stream
4. View logs in real-time or search historical logs

---

## What You'll See in CloudWatch

### Server-Side Logs Example

```
[API] Processing request to /api/proxy/event-details/2
[ProxyHandler] fetchWithJwtRetry called with URL: https://api.example.com/api/event-details/2
[ProxyHandler] Response status: 200
[Middleware] Processing request to /events/2/checkout
```

### Build Logs

```
[Build] Building Next.js application
[Build] Compiled successfully
[Build] Generating static pages
```

### Runtime Errors

```
[ERROR] Failed to fetch event details: 404 Not Found
[ERROR] JWT token generation failed
[ERROR] Backend API unavailable
```

---

## Solution: Forward Client-Side Logs to CloudWatch

Since client-side logs don't automatically appear in CloudWatch, we need to forward them to a server-side endpoint that logs to CloudWatch.

### Option 1: Create Client Log Forwarding API Route

**File**: `src/app/api/logs/client/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * Client-side log forwarding endpoint
 * Forwards client-side logs to CloudWatch via server-side logging
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level, message, data, url, userAgent, timestamp } = body;

    // Log to server-side console (appears in CloudWatch)
    const logMessage = `[CLIENT-LOG] [${level}] ${message}`;
    const logData = {
      level,
      message,
      data,
      url,
      userAgent,
      timestamp: timestamp || new Date().toISOString(),
      source: 'client-side',
    };

    if (level === 'error' || level === 'critical') {
      console.error(logMessage, logData);
    } else if (level === 'warn') {
      console.warn(logMessage, logData);
    } else {
      console.log(logMessage, logData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CLIENT-LOG] Failed to process log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process log' },
      { status: 500 }
    );
  }
}
```

### Option 2: Create Client-Side Logging Utility

**File**: `src/lib/clientLogger.ts`

```typescript
/**
 * Client-side logging utility that forwards logs to server for CloudWatch visibility
 */

type LogLevel = 'log' | 'warn' | 'error' | 'critical';

interface LogData {
  level: LogLevel;
  message: string;
  data?: any;
  url?: string;
  userAgent?: string;
  timestamp?: string;
}

/**
 * Forward log to server-side endpoint (appears in CloudWatch)
 */
async function forwardLogToServer(logData: LogData) {
  try {
    // Don't block the UI - send asynchronously
    fetch('/api/logs/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...logData,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => {
      // Silently fail - don't break the app if logging fails
      console.warn('[ClientLogger] Failed to forward log to server:', err);
    });
  } catch (error) {
    // Silently fail
  }
}

/**
 * Enhanced console.log that also forwards to CloudWatch
 */
export const clientLogger = {
  log: (message: string, data?: any) => {
    console.log(message, data);
    forwardLogToServer({ level: 'log', message, data });
  },

  warn: (message: string, data?: any) => {
    console.warn(message, data);
    forwardLogToServer({ level: 'warn', message, data });
  },

  error: (message: string, data?: any) => {
    console.error(message, data);
    forwardLogToServer({ level: 'error', message, data });
  },

  critical: (message: string, data?: any) => {
    console.error(`[CRITICAL] ${message}`, data);
    forwardLogToServer({ level: 'critical', message, data });
  },
};
```

### Option 3: Update Checkout Page to Use Client Logger

**File**: `src/app/events/[id]/checkout/page.tsx`

```typescript
import { clientLogger } from '@/lib/clientLogger';

// Replace console.log with clientLogger.log
clientLogger.log('[CheckoutPage] Mobile browser detected:', { ... });

// Replace console.error with clientLogger.error
clientLogger.error('[CheckoutPage] CRITICAL ERROR loading checkout page:', errorDetails);
```

---

## Enhanced Proxy Handler Logging

The proxy handlers already log to CloudWatch. To see more detailed logs:

**File**: `src/lib/proxyHandler.ts`

The existing `console.log()` statements in proxy handlers will appear in CloudWatch:
- `[ProxyHandler] fetchWithJwtRetry called`
- `[ProxyHandler] Response status`
- `[ProxyHandler ERROR]` for errors

---

## CloudWatch Log Search Tips

### Search for Specific Errors

1. **Filter by Error Level:**
   ```
   [ERROR]
   ```

2. **Filter by Component:**
   ```
   [CheckoutPage]
   [ProxyHandler]
   [API]
   ```

3. **Filter by Event ID:**
   ```
   eventId=2
   ```

4. **Filter by Time Range:**
   - Use the time picker in CloudWatch
   - Select "Last 1 hour", "Last 24 hours", etc.

### Example CloudWatch Log Queries

```
# Find all checkout page errors
[CheckoutPage] CRITICAL ERROR

# Find all API proxy errors
[ProxyHandler ERROR]

# Find mobile-specific logs
Mobile browser detected

# Find specific event errors
event-details/2
```

---

## Real-Time Log Monitoring

### Option 1: CloudWatch Logs Insights

1. Go to CloudWatch → **Logs Insights**
2. Select your log group
3. Run queries:
   ```sql
   fields @timestamp, @message
   | filter @message like /CheckoutPage/
   | sort @timestamp desc
   | limit 100
   ```

### Option 2: AWS CLI

```bash
# Install AWS CLI if not installed
aws --version

# Configure credentials
aws configure

# Tail logs in real-time
aws logs tail /aws/amplify/[app-id]/[branch-name] --follow

# Filter logs
aws logs tail /aws/amplify/[app-id]/[branch-name] --filter-pattern "[CheckoutPage]"
```

---

## Best Practices

### 1. Use Structured Logging

```typescript
// ✅ Good: Structured logging
console.log('[CheckoutPage] Event fetch failed:', {
  status: 404,
  url: '/api/proxy/event-details/2',
  eventId: '2',
  timestamp: new Date().toISOString(),
});

// ❌ Bad: Unstructured logging
console.log('Error:', error);
```

### 2. Include Context

```typescript
// ✅ Good: Include context
console.error('[CheckoutPage] API error:', {
  component: 'CheckoutPage',
  action: 'fetchEventDetails',
  eventId,
  error: error.message,
  stack: error.stack,
  userAgent: navigator.userAgent,
  url: window.location.href,
});
```

### 3. Use Log Levels

```typescript
// ✅ Good: Use appropriate log levels
console.log('[INFO] Normal operation');
console.warn('[WARN] Potential issue');
console.error('[ERROR] Error occurred');
```

### 4. Don't Log Sensitive Data

```typescript
// ❌ Bad: Logging sensitive data
console.log('User password:', password);
console.log('JWT token:', token);

// ✅ Good: Logging safely
console.log('User authenticated:', { userId: user.id });
console.log('JWT token present:', !!token);
```

---

## Troubleshooting

### "No logs appearing in CloudWatch"

**Check:**
1. ✅ Are you looking at the correct log group?
2. ✅ Is the log stream recent?
3. ✅ Are you filtering correctly?
4. ✅ Is the code running server-side (not client-side)?

### "Client-side logs not appearing"

**Solution:**
- Use the client logging utility to forward logs to server
- Or check browser console instead of CloudWatch

### "Too many logs / Hard to find errors"

**Solution:**
- Use CloudWatch Logs Insights with filters
- Use structured logging with consistent prefixes
- Set up CloudWatch alarms for critical errors

---

## Summary

✅ **CloudWatch Contains:**
- Server-side API route logs
- Server component logs
- Middleware logs
- Webhook logs
- Build logs
- Runtime errors

❌ **CloudWatch Does NOT Contain:**
- Client-side component logs
- Browser console logs
- Client-side JavaScript errors (unless forwarded)

✅ **Solution:**
- Use client logging utility to forward important logs to server
- Check browser console for client-side debugging
- Use CloudWatch for server-side debugging

---

## References

- [AWS Amplify Monitoring](https://docs.aws.amazon.com/amplify/latest/userguide/monitoring.html)
- [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html)
- [CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)









