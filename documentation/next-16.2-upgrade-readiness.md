# Next.js 16.2 Upgrade Readiness

## What Was Changed

- Updated `next` from `^15.1.1` to **`16.1.7`** (stable). This satisfies **`@clerk/nextjs` peer `next`** and avoids **`npm install` ERESOLVE** with Next **16.2 prereleases**. It also keeps the **Windows SWC lockfile** exports (see below — avoid `next@16.2.0` on Windows).
- Updated ESLint Next packages to match:
  - `@next/eslint-plugin-next` to `16.1.7`
  - `eslint-config-next` to `16.1.7`
- Migrated lint script away from removed Next 16 command:
  - `lint`: `next lint` -> `eslint .`
- Updated Next config for Next 16 compatibility in `next.config.mjs`:
  - Removed deprecated top-level `eslint` config.
  - Renamed `experimental.middlewareClientMaxBodySize` to `experimental.proxyClientMaxBodySize`.
  - Added `turbopack: {}` so `next build` (Turbopack default in Next 16) does not error when a `webpack()` hook exists but no Turbopack config did.
- Updated flat ESLint config in `eslint.config.js`:
  - Added `@typescript-eslint/parser` and plugin wiring.
  - Added broad ignore patterns for non-app tooling directories.
- Removed obsolete `.eslintignore` (flat config now owns ignore behavior).

## Compatibility Checks

### Runtime / peer requirements

- `next@16.2.0` requires Node `>=20.9.0` and React `^18.2.0 || ^19.0.0`.
- Current project React (`18.3.1`) is compatible.
- Current Node target (`.nvmrc` is `20`) is compatible.

### Critical ecosystem packages

- `@clerk/nextjs@7.x` peer range is `next@^15.2.8 || … || ^16.0.10 || ^16.1.0-0`. **`next@16.2.1-canary.*` and other 16.2 prereleases are outside that range**, so plain `npm install` fails with **ERESOLVE** unless you use **`npm install --legacy-peer-deps`**, **`overrides`**, or wait for Clerk to widen peers. **Pinning `next@16.1.7` avoids that.**
- No immediate hard peer conflict was found for `@trpc/*`, TanStack React Query, or Stripe packages after dependency install.

## Local Validation Results

### Installed versions confirmed

- `next@16.1.7`
- `eslint-config-next@16.1.7`
- `@next/eslint-plugin-next@16.1.7`

### Lint status

- `npm run lint` now executes ESLint CLI correctly (Next 16 compatible command).
- Lint still fails due large existing project lint debt (not introduced by this upgrade).

### Windows: `lockfileTryAcquireSync` / dev + build (resolved)

**Root cause (Next 16.2.0):** On Windows, `@next/swc-win32-x64-msvc@16.2.0` shipped **without** the NAPI exports `lockfileTryAcquireSync` / `lockfileUnlock*` that Next’s JS expects (`next/dist/build/lockfile.js`). The native module lists **no** `lock*` symbols — so `next dev` and `next build` throw `TypeError: bindings.lockfileTryAcquireSync is not a function` (wrapped as “IO error … lockfile”).

**Verified:** `@next/swc-win32-x64-msvc@16.1.7` includes `lockfileTryAcquireSync`; **`16.2.1-canary.2`** includes it again. **`16.2.0` does not.**

**Fix applied in this repo:** Pin **`next@16.1.7`** (+ matching `eslint-config-next` / `@next/eslint-plugin-next`). The Windows SWC for **16.1.7** includes `lockfileTryAcquireSync`, and **16.1.7** matches **Clerk’s** published peer range so **`npm install` works without `--legacy-peer-deps`.

**If you need Next 16.2.x before Clerk widens peers:**

- Use **`npm install --legacy-peer-deps`** (or add `legacy-peer-deps=true` to **`.npmrc`**), **or**
- Prefer a **stable `next@16.2.1+`** once released (verify Windows SWC includes lockfile APIs + Clerk peer range).

### Build status (Next 16 Turbopack vs webpack)

- If `next build` complains about **Turbopack + `webpack` config**, either:
  - keep **`turbopack: {}`** in `next.config.mjs` (added here), or
  - run **`next build --webpack`** explicitly.

## Upgrade Risk Assessment

- **Code refactor scope** remains small-to-moderate.
- **Windows local dev/build** was blocked on `next@16.2.0` due to the SWC regression above; **stable `16.1.7` avoids it** and keeps **Clerk + npm** happy.
- **Production upgrade** should still be gated behind **Amplify staging** verification (Linux builders may behave differently; canary aligns Windows + Linux).

## Amplify Canary Validation Checklist

1. Create branch `chore/next-16-2-upgrade`.
2. Push and deploy to Amplify staging app.
3. Confirm Amplify build uses Node 20 (`nvm use 20` in `amplify.yml`).
4. Verify build succeeds in Amplify (this is the key gate vs local lockfile blocker).
5. Smoke test on staging:
   - Public routes render normally.
   - Clerk sign-in/out and admin menu visibility.
   - Middleware route protections and redirects.
   - `/api/proxy/*` behavior (public + protected paths).
   - Stripe payment success/webhook and ticket/subscription flows.
6. Review CloudWatch logs for middleware/auth/proxy errors.

## Production Rollout Checklist

1. Tag current production commit as rollback point.
2. Promote only after successful Amplify canary.
3. Monitor:
   - Build/deploy health
   - 401/403 rates
   - Payment success pipeline
   - SSR route errors
4. Rollback plan:
   - Revert `next` + eslint Next packages to 15.x
   - Restore previous lockfile
   - Redeploy previous stable build

## Recommendation

- Treat as **ready for staging** after:
  - `npm install` with pinned **`16.1.7`**
  - Local **`npm run dev`** and **`npm run build`** succeed on Windows
- When **Clerk** documents support for **Next 16.2+** and a **stable Next** patch fixes Windows SWC + peer range, bump versions and re-run smoke tests.
