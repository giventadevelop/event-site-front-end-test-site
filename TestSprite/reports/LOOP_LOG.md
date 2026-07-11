# E2E Loop Log

Append-only progress for full-site E2E on `tenant_demo_002`.

## Infrastructure (2026-07-10)

- Route inventory generator: `TestSprite/tools/generate-route-inventory.js`
- Shared harness: `TestSprite/lib/e2e-harness.js`
- Inventory smoke crawl: `TestSprite/sanity-tests/run-inventory-smoke-crawl.js`
- Public dynamic demo: `TestSprite/sanity-tests/run-public-dynamic-demo-tests.js`
- Admin CRUD: `TestSprite/admin-tests/admin-crud-demo-tenant-suite.js`
- Orchestrator: `TestSprite/run-e2e-full.js`
- npm: `test:inventory`, `test:smoke:*`, `test:public:dynamic`, `test:admin:crud`, `test:mosc:all`, `test:e2e:full`, `test:e2e:quick`

## Full run results (2026-07-10)

Local app tenant was `mosc_malankara_orthodox_2` (not `tenant_demo_002`); ran with `E2E_ALLOW_ANY_TENANT=1`.

| Suite | Result |
|-------|--------|
| Inventory (973 routes) | OK |
| Public dynamic demo | 23 pass / 0 fail |
| Admin CRUD | 8 pass / 9 skip (no create form) / 0 fail |
| Admin smoke + 34 home buttons | 138 pass / 0 fail |
| Public smoke (77) | 77 pass / 0 fail |
| mosc-redesign (295) | 294 pass / 1 skip |
| mosc (264) | 264 pass / 0 fail |
| mosc-old (233) | 233 pass / 0 fail |

**Notes**

- Auth-gated public routes count as pass when redirected to `/sign-in`.
- Port 3000 saturated during first `/mosc` crawl; completed `/mosc` + `/mosc-old` on port 3001 with paced requests.
- For true demo-tenant CRUD isolation, set `NEXT_PUBLIC_TENANT_ID=tenant_demo_002` and omit `E2E_ALLOW_ANY_TENANT`.

# Full run started 2026-07-10T13:30:04.776Z
- baseUrl: http://localhost:3000
- skipMosc: true skipCrud: false skipLegacyAdmin: true

## 2026-07-10T13:31:14.698Z — public-dynamic
- pass: 20 | fail: 3 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-public-dynamic-2026-07-10T13-31-14-697Z.json`

## 2026-07-10T13:32:41.960Z — admin-crud
- pass: 8 | fail: 0 | skip: 9 | todo: 0
- report: `TestSprite\reports\coverage-admin-crud-2026-07-10T13-32-41-959Z.json`

## 2026-07-10T13:37:03.924Z — smoke-admin
- pass: 138 | fail: 0 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-smoke-admin-2026-07-10T13-37-03-923Z.json`

## 2026-07-10T13:40:04.343Z — smoke-public
- pass: 48 | fail: 29 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-smoke-public-2026-07-10T13-40-04-341Z.json`

## Full run finished 2026-07-10T13:40:04.400Z
- PASS Generate inventory (0)
- FAIL Public dynamic demo (1)
- PASS Admin CRUD demo tenant (0)
- PASS Inventory smoke: admin (0)
- FAIL Inventory smoke: public (1)

# Full run started 2026-07-10T13:40:50.308Z
- baseUrl: http://localhost:3000
- skipMosc: true skipCrud: false skipLegacyAdmin: true

## Full run finished 2026-07-10T13:41:19.700Z
- PASS Generate inventory (0)
- FAIL Public dynamic demo (1)
- FAIL Admin CRUD demo tenant (1)
- FAIL Inventory smoke: admin (1)
- FAIL Inventory smoke: public (1)

# Full run started 2026-07-10T13:41:53.608Z
- baseUrl: http://localhost:3000
- skipMosc: true skipCrud: false skipLegacyAdmin: true

## 2026-07-10T13:42:41.143Z — public-dynamic
- pass: 23 | fail: 0 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-public-dynamic-2026-07-10T13-42-41-142Z.json`

## 2026-07-10T13:44:04.695Z — admin-crud
- pass: 8 | fail: 0 | skip: 9 | todo: 0
- report: `TestSprite\reports\coverage-admin-crud-2026-07-10T13-44-04-692Z.json`

## 2026-07-10T13:47:15.447Z — smoke-admin
- pass: 138 | fail: 0 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-smoke-admin-2026-07-10T13-47-15-446Z.json`

## 2026-07-10T13:49:44.082Z — smoke-public
- pass: 77 | fail: 0 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-smoke-public-2026-07-10T13-49-44-081Z.json`

## Full run finished 2026-07-10T13:49:44.137Z
- PASS Generate inventory (0)
- PASS Public dynamic demo (0)
- PASS Admin CRUD demo tenant (0)
- PASS Inventory smoke: admin (0)
- PASS Inventory smoke: public (0)

## 2026-07-10T14:03:38.171Z — smoke-mosc-redesign
- pass: 294 | fail: 0 | skip: 1 | todo: 0
- report: `TestSprite\reports\coverage-smoke-mosc-redesign-2026-07-10T14-03-38-170Z.json`

## 2026-07-10T14:32:53.384Z — smoke-mosc
- pass: 264 | fail: 0 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-smoke-mosc-2026-07-10T14-32-53-382Z.json`

## 2026-07-10T14:37:21.850Z — smoke-mosc-old
- pass: 233 | fail: 0 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-smoke-mosc-old-2026-07-10T14-37-21-849Z.json`

## 2026-07-10T18:35:25.910Z — admin-crud
- pass: 7 | fail: 0 | skip: 10 | todo: 0
- report: `TestSprite\reports\coverage-admin-crud-2026-07-10T18-35-25-909Z.json`

## 2026-07-10T19:59:11.202Z — smoke-admin+public+mosc-redesign
- pass: 506 | fail: 3 | skip: 1 | todo: 0
- report: `TestSprite\reports\coverage-smoke-admin+public+mosc-redesign-2026-07-10T19-59-11-199Z.json`

## 2026-07-10T20:13:11.989Z — contact-form-email
- pass: 4 | fail: 3 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-contact-form-email-2026-07-10T20-13-11-987Z.json`
- html: `TestSprite\reports\coverage-contact-form-email-2026-07-10T20-13-11-987Z.html`

## 2026-07-10T20:15:50.053Z — contact-form-email
- pass: 5 | fail: 2 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-contact-form-email-2026-07-10T20-15-50-050Z.json`
- html: `TestSprite\reports\coverage-contact-form-email-2026-07-10T20-15-50-050Z.html`

## 2026-07-10T20:16:12.189Z — contact-form-email
- pass: 7 | fail: 0 | skip: 0 | todo: 0
- report: `TestSprite\reports\coverage-contact-form-email-2026-07-10T20-16-12-187Z.json`
- html: `TestSprite\reports\coverage-contact-form-email-2026-07-10T20-16-12-187Z.html`
