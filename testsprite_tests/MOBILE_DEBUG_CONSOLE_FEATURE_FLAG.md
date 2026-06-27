# Mobile Debug Console Feature Flag

## Overview

The `MobileDebugConsole` component is now **disabled by default** to prevent test failures and reduce console noise during normal development and testing.

## Enabling Mobile Debug Console

To enable the Mobile Debug Console for mobile browser debugging:

### Option 1: Environment Variable (Recommended)

Add to `.env.local`:

```bash
NEXT_PUBLIC_ENABLE_MOBILE_DEBUG_CONSOLE=true
```

Then restart your dev server:

```bash
npm run dev
```

### Option 2: Temporary Enable (Single Session)

```bash
# Windows PowerShell
$env:NEXT_PUBLIC_ENABLE_MOBILE_DEBUG_CONSOLE="true"; npm run dev

# Linux/Mac
NEXT_PUBLIC_ENABLE_MOBILE_DEBUG_CONSOLE=true npm run dev
```

## When to Enable

Enable Mobile Debug Console when:
- ✅ Testing mobile browser workflows
- ✅ Debugging mobile-specific issues
- ✅ Need to capture console logs from mobile devices
- ✅ Testing mobile payment flows (Stripe PRB, Apple Pay, Google Pay)

## When to Keep Disabled

Keep Mobile Debug Console disabled when:
- ❌ Running automated tests (TestSprite, Playwright, etc.)
- ❌ Normal development (reduces console noise)
- ❌ Production builds (performance)
- ❌ CI/CD pipelines

## Test Filtering

The filter script (`scripts/filter-testsprite-errors.js`) automatically filters out:
- MobileDebugConsole-related warnings and errors
- Image aspect ratio warnings
- External resource loading errors (fonts, CDN)

These are non-critical warnings that don't indicate actual test failures.

## Filtered Error Patterns

The following patterns are automatically filtered from test reports:

1. **MobileDebugConsole references**:
   - `MobileDebugConsole`
   - `webpack-internal.*MobileDebugConsole`
   - `at.*MobileDebugConsole.tsx`

2. **Image warnings**:
   - `Image with src.*has either width or height modified`
   - `Image.*has "fill" and parent element with invalid "position"`

3. **Network errors** (external resources):
   - `net::ERR_SOCKET_NOT_CONNECTED`
   - `net::ERR_CONNECTION_CLOSED`
   - `Failed to load resource.*fonts.googleapis`
   - `Failed to load resource.*cdnjs`

## Usage Example

```bash
# Normal development (MobileDebugConsole disabled)
npm run dev

# Mobile debugging session (MobileDebugConsole enabled)
NEXT_PUBLIC_ENABLE_MOBILE_DEBUG_CONSOLE=true npm run dev

# Run tests (MobileDebugConsole should be disabled)
node scripts/run-public-pages-tests.js
```

## Component Location

- **Component**: `src/components/MobileDebugConsole.tsx`
- **Used in**: `src/app/layout.tsx` (root layout)
- **Feature Flag**: `NEXT_PUBLIC_ENABLE_MOBILE_DEBUG_CONSOLE`

## Related Files

- Filter script: `scripts/filter-testsprite-errors.js`
- Test runner: `scripts/run-public-pages-tests.js`
- Root layout: `src/app/layout.tsx`

