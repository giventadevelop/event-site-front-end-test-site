# TestSprite Integration - Quick Reference

## 🚀 Quick Start

### Enable Test Mode

```bash
# In .env.local:
NEXT_PUBLIC_ENABLE_TEST_AUTH_BYPASS=true
```

### Run Tests

```bash
# Local Playwright tests (recommended)
npm run test:public

# Homepage test
npm run test:homepage
```

---

## 🔍 Test Mode Detection

Test mode activates when **ALL** of these are true:
1. `NODE_ENV !== 'production'` ✅ (safety check)
2. **AND** one of:
   - User agent contains: `TestSprite|testsprite|playwright|puppeteer|selenium|headless`
   - `NEXT_PUBLIC_ENABLE_TEST_AUTH_BYPASS=true`
   - `NEXT_PUBLIC_DISABLE_CLERK_FOR_TESTS=true`

---

## 🛡️ Bypass Mechanisms (5 Layers)

1. **Middleware**: Adds `/admin(.*)` to `publicRoutes`
2. **Admin Layout**: Skips `auth()` and admin role checks
3. **Network Blocking**: Intercepts Clerk API calls (`fetch`, `XHR`)
4. **Script Blocking**: Prevents Clerk scripts from loading
5. **Mock User ID**: Injects `window.__TEST_ADMIN_USER_ID__`

---

## ✅ What Works

- ✅ Public pages (homepage, anchor links)
- ✅ Test mode detection
- ✅ Authentication bypass
- ✅ Production safety

## ⚠️ Partial Issues

- ⚠️ Events/Gallery pages (timing issues)
- ⚠️ Some admin pages (loading state)
- ⚠️ Hydration errors (expected, suppressed)

## ❌ Known Failures

- ❌ Events page test (no `<main>` tag, async loading)
- ❌ Gallery page test (no `<main>` tag, async loading)
- ❌ Some admin page tests (components waiting for Clerk)

---

## 🔧 Troubleshooting

### Tests Not Running?

1. Check test mode is active (console logs)
2. Verify env vars are set
3. Check `NODE_ENV !== 'production'`

### Hydration Errors?

**Expected** - Suppressed in test config, won't affect production

### Clerk Calls Still Appearing?

**Normal** - Some may get through, but are suppressed in test config

---

## 📚 Full Documentation

- **Complete Guide**: `TESTSPRITE_INTEGRATION_COMPLETE.md`
- **Production Safety**: `TEST_MODE_PRODUCTION_SAFETY.md`
- **Test Config**: `TestSprite/sanity-tests/testsprite-mcp-config.json`

---

## 🔒 Production Safety

✅ **All bypasses disabled in production** (`NODE_ENV` checks)

**Before deploying**:
- Remove test env vars from production
- Verify `NODE_ENV=production` is set
- Test authentication works

---

**Last Updated**: 2025-01-22

