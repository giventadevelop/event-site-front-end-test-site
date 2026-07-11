# Full-site E2E (tenant_demo_002)

## Quick start

```bash
# 1. Prefer NEXT_PUBLIC_TENANT_ID=tenant_demo_002 (demo CRUD tenant).
#    If your local .env uses another tenant, set E2E_ALLOW_ANY_TENANT=1 for smoke-only runs.
npm run dev

# 2. Auth: copy TestSprite/admin-tests/auth.json.example → auth.json (ADMIN user)

# 3. Generate inventory + run everything (cmd.exe recommended on Windows)
cmd /c "set E2E_ALLOW_ANY_TENANT=1&& set TEST_BASE_URL=http://localhost:3000&& node TestSprite\run-e2e-full.js"

# Faster (skip MOSC trees + legacy admin suites)
cmd /c "set E2E_ALLOW_ANY_TENANT=1&& set TEST_BASE_URL=http://localhost:3000&& node TestSprite\run-e2e-full.js --quick"
```

## Scripts

| Script | Purpose |
|--------|---------|
| `test:inventory` | Build `TestSprite/generated/route-inventory.json` from all `page.tsx` |
| `test:smoke:inventory` | Smoke every inventory route (optional `--kind=`, `--limit=`) |
| `test:smoke:admin` | Admin routes + home button click-through |
| `test:smoke:public` | Core public routes |
| `test:mosc:all` | `/mosc` + `/mosc-redesign` smoke (**excludes** `/mosc-old`) |
| `test:mosc:with-old` | Same plus `/mosc-old` |
| `test:public:dynamic` | Public pages with discovered demo event/plan IDs |
| `test:contact-form` | Contact Us HTML email page + send-html API validation (no live send) |
| `test:coverage:html` | Regenerate `coverage-*.html` from existing `coverage-*.json` |
| `test:coverage:consolidated` | Global rollup → `coverage-global-latest.html` |
| `test:admin:crud` | Copy/create → update → delete `[E2E]` rows on demo tenant |
| `test:e2e:full` | Orchestrated full loop (includes contact-form suite) |
| `test:e2e:quick` | Inventory admin+public + dynamic + CRUD + contact-form |

## Reports

Each harness suite writes:
- `TestSprite/reports/coverage-<suite>-<stamp>.json`
- `TestSprite/reports/coverage-<suite>-<stamp>.html` — overview (pass/fail/skip, wall clock, per-module timings, failures, all results)
- **`TestSprite/reports/coverage-global-latest.html`** — consolidated overall SUCCESS/FAILED + all suites (`npm run test:coverage:consolidated` or end of §11 ladder). Also `coverage-global-consolidated-<stamp>.html`.
- `TestSprite/reports/LOOP_LOG.md`

## Safety

- Mutations only on entities named with `[E2E]` prefix when possible.
- Manage usage and Test Stripe are read-only smoke.
- No live Stripe payment capture.
- Unauthenticated public routes that redirect to sign-in are recorded as **pass** (`auth-gated`).
- MOSC crawls pace requests (~150ms) and retry once on timeout to avoid saturating the Next.js dev server.

## Excluding `/mosc-old`

```bash
# Smoke crawl: exclude kind
node TestSprite/sanity-tests/run-inventory-smoke-crawl.js --exclude=mosc-old

# Full orchestrator: skip only mosc-old (still runs /mosc + /mosc-redesign)
node TestSprite/run-e2e-full.js --skip-mosc-old

# Or include only the kinds you want
node TestSprite/sanity-tests/run-inventory-smoke-crawl.js --kind=mosc,mosc-redesign
```

`npm run test:mosc:all` now excludes `/mosc-old` by default. Use `npm run test:mosc:with-old` to include it.
