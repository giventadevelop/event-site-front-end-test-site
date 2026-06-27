# Prompt: Amplify 500 on www.mosc-temp.com – Issue Summary & Debugging Context

## Issue We Are Trying to Fix

- **Symptom:** `GET https://www.mosc-temp.com/` returns **HTTP 500 (Internal Server Error)**. Browser shows "This page isn’t working – www.mosc-temp.com is currently unable to handle this request."
- **Environment:** AWS Amplify (Next.js 15.x SSR), domain www.mosc-temp.com.
- **Observation:** CloudWatch logs do **not** show our application logs (e.g. `[LAYOUT]`, `[MIDDLEWARE]`, `[LAYOUT-ERROR]`) for the document request. We see "user-tasks proxy handler loaded" and Lambda START/REPORT entries with very short Duration (~2 ms) and one cold start with Init Duration ~9.8s, but no `[MIDDLEWARE]` or `[LAYOUT]` lines for the failing request.

---

## What Has Been Done

### 1. Root layout (src/app/layout.tsx)
- Wrapped the entire layout logic (headers, pathname, auth, profile fetch, admin check) in a **top-level try/catch**. On error we log `[LAYOUT-ERROR] Root layout failed: <message>` and `[LAYOUT-ERROR] Stack: <stack>`, then set `isTenantAdmin = false` and still return the same JSX so the request should not 500 from layout throws.
- Defined **defaults before the try** (e.g. `primaryDomain`, `satelliteDomain`, `appUrl`, `clerkProps`) so they are always defined even if the try block throws.
- Added **`[LAYOUT] Root layout executing`** at the very start of the layout so we can confirm in CloudWatch whether the layout runs at all.
- **ClerkProvider:** `publishableKey` is now `process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.AMPLIFY_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''` so it is never `undefined` (avoids potential Clerk runtime errors).

### 2. Middleware (src/middleware.ts)
- Wrapped **`await auth()`** in its own try/catch; on failure we log `[MIDDLEWARE-ERROR]` and continue (do not rethrow).
- Wrapped the **rest of the handler** in try/catch; on any unhandled error we log `[MIDDLEWARE-ERROR] Unhandled:` and return `NextResponse.next({ request: { headers: requestHeaders } })` so middleware should never cause a 500.
- Middleware still sets `x-pathname` on the request so the layout can read it.

### 3. Deprecated next/config and runtime config
- **Removed** all use of `getConfig()` / `serverRuntimeConfig` / `publicRuntimeConfig` from:
  - `src/lib/stripe/init.ts` (uses only `process.env` with AMPLIFY_ prefix).
  - `src/app/api/webhooks/stripe/route.ts`.
- **Removed** `serverRuntimeConfig` and `publicRuntimeConfig` from `next.config.mjs` to avoid Next.js 16 deprecation warnings and possible issues in Lambda.

### 4. Profile page / ClerkProvider context
- Profile page was throwing "useAuth can only be used within the <ClerkProvider /> component." We fixed by making the profile route a server component that calls `await auth()`, redirects if no user, and passes `initialUserId` to the client component so it does not need `useAuth()` in that tree.
- Server-only profile actions were moved behind a `"use server"` file so the client bundle does not import `@clerk/nextjs/server` (fixes build error "server-only cannot be imported from a Client Component").

### 5. Auth() usage for Next.js 15
- Upgraded to **Clerk v6** and migrated to **clerkMiddleware** so `auth()` works with Next.js 15 async request APIs.
- Replaced all synchronous `auth()` calls with **`await auth()`** in API routes and server code (e.g. tasks route, billing routes, tasks [id] route).

---

## What Could Be the Issue (Hypotheses)

1. **Layout/middleware never run for the document request**  
   The 500 might be returned before our code runs (e.g. at the platform or framework layer). Possible causes:
   - Different Lambda or execution path for document requests (e.g. another function or edge) that doesn’t run our middleware/layout.
   - Request failing during cold start or init (e.g. module load or top-level import throwing) before the request handler runs.
   - Logs for the document request going to a **different log group/stream** than the one we’re checking (e.g. SSR vs API vs "user-tasks" proxy).

2. **Missing or wrong environment variables in Amplify**  
   If a required env var is missing, something could throw very early (e.g. at import or first use):
   - **Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` or `AMPLIFY_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must be set; we now pass a string (possibly empty) to avoid `undefined`, but an empty key might still cause Clerk to misbehave or throw in some code paths.
   - **Tenant:** `NEXT_PUBLIC_TENANT_ID` / `AMPLIFY_NEXT_PUBLIC_TENANT_ID` – `getTenantId()` throws if not set; it is only called inside the layout’s try block when `userId` is present, so it shouldn’t 500 for anonymous visitors unless the try/catch is bypassed or the error is thrown elsewhere.
   - **App URL / API:** `NEXT_PUBLIC_APP_URL` or `AMPLIFY_NEXT_PUBLIC_APP_URL` – used for redirects and API base; wrong or missing value could break redirects or internal fetches.

3. **Clerk v6 + Amplify/Lambda**  
   Clerk v6 might assume a different runtime or request shape. Possibilities:
   - `clerkMiddleware` or `auth()` throwing in Lambda (e.g. missing or different request context, cookies, or headers).
   - We already catch errors in middleware and layout; if the throw happens **inside** Clerk’s own code during React render (e.g. when rendering `ClerkProvider` or a child), it might not be in our try blocks and could still result in a 500.

4. **Module/import failure at load time**  
   A top-level import might throw in the Lambda environment (e.g. optional dependency, `next/config` remnant, or Node/Lambda-specific API). That would 500 before any of our `[MIDDLEWARE]` or `[LAYOUT]` logs run.

5. **Amplify SSR configuration**  
   Incorrect or outdated Amplify Gen 2 SSR settings (e.g. wrong handler, timeout, or memory) could cause the server to return 500 before or without running our app code.

---

## Recommended Next Steps

1. **Confirm where document requests are logged**  
   In Amplify, identify which CloudWatch log group/stream corresponds to **SSR/document requests** (GET /). Ensure you’re viewing that when reproducing the 500, and search for `[LAYOUT]`, `[MIDDLEWARE]`, `[LAYOUT-ERROR]`, `[MIDDLEWARE-ERROR]`.

2. **Verify Amplify environment variables**  
   In Amplify Console → App → Environment variables, confirm at least:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` or `AMPLIFY_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_TENANT_ID` or `AMPLIFY_NEXT_PUBLIC_TENANT_ID`
   - `NEXT_PUBLIC_APP_URL` or `AMPLIFY_NEXT_PUBLIC_APP_URL`
   Re-deploy after any change.

3. **Add a minimal server-only probe**  
   Add a trivial API route (e.g. `GET /api/health` or use existing diagnostic) that only does `console.log('[PROBE]', new Date().toISOString())` and returns 200. Hit it from the same host (www.mosc-temp.com). If that appears in logs but `[LAYOUT]` for GET / does not, the 500 is likely specific to the document/SSR path.

4. **Temporarily simplify the root layout**  
   If possible, temporarily replace the root layout body with a minimal return (e.g. only `<html><body>{children}</body></html>` and no Clerk, no auth, no TenantSettingsProvider). If the 500 stops, reintroduce providers and logic incrementally to find the failing piece.

5. **Check Amplify build and runtime docs**  
   Confirm Next.js 15 and SSR are supported for your Amplify version, and that there are no known issues with Clerk v6 or required env/config (e.g. Node version, Lambda handler, or ISR/SSR routing).

---

## Key Files to Inspect

- `src/app/layout.tsx` – Root layout (try/catch, ClerkProvider, defaults).
- `src/middleware.ts` – Clerk middleware and error handling.
- `next.config.mjs` – No runtime config; rewrites/redirects for Clerk and Syro.
- Amplify environment variables and which log group is used for GET /.

Use this prompt to hand off the issue or to continue debugging with a focus on: (1) confirming whether layout/middleware run for GET /, (2) env vars, and (3) Clerk/React vs platform/framework as the source of the 500.
