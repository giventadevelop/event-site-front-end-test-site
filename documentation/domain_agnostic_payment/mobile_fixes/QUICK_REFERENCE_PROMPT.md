# Mobile Browser Checkout Page Flickering - Quick Reference Prompt

## 🚨 CRITICAL ISSUE FLAG

**Problem**: Checkout page (`/events/[id]/checkout`) flickers on mobile browsers (iOS Safari, Chrome Mobile, WhatsApp in-app browser).

**Symptoms**:
- Rapid re-renders (10-20+ iterations)
- Loading screen flashes repeatedly
- Page stuck on loading even after data available
- Occurs on: initial load, back button, app switch, refresh

## 🔍 Root Cause

**Fundamental Conflict**: React's async state model vs. need for synchronous data access

1. **React State is Always Async**: `setState()` updates are batched and async
2. **Mobile Browsers Remount Aggressively**: Lose state but preserve `sessionStorage`
3. **Race Conditions**: Multiple effects competing to restore/fetch data
4. **useParams() Instability**: Returns new proxy on each render (mobile browsers)

## ✅ What Works

- ✅ `sessionStorage` persistence (survives remounts)
- ✅ String comparison guards (prevents infinite loops)
- ✅ `useEffect` restoration (prevents hydration mismatch)
- ✅ Effective values pattern (`effectiveEvent = restoredDataRef.current?.event || event`)

## ❌ What Doesn't Work

- ❌ Synchronous state updates (impossible in React)
- ❌ `useLayoutEffect` restoration (still async, causes hydration issues)
- ❌ Synchronous `sessionStorage` checks (hydration mismatch)
- ❌ Refs alone (don't trigger re-renders)

## 🎯 Current Implementation Pattern

```typescript
// 1. Store restored data in ref
const restoredDataRef = useRef<{event: any, ...} | null>(null);

// 2. Restore in useEffect (not synchronously)
useEffect(() => {
  const storedData = restoreFetchedDataFromStorage();
  if (storedData) {
    restoredDataRef.current = storedData;
    setEvent(storedData.event); // Still async, but ref is immediate
  }
}, [eventId]);

// 3. Use effective values in render
const effectiveEvent = restoredDataRef.current?.event || event;

// 4. Check effective values in loading condition
if (loading && !dataReadyRef.current && !effectiveEvent) {
  return <LoadingScreen />;
}
```

## 🚫 Anti-Patterns to Avoid

```typescript
// ❌ DON'T: Synchronous sessionStorage check in component body
if (typeof window !== 'undefined') {
  const data = sessionStorage.getItem('data'); // Causes hydration mismatch
}

// ❌ DON'T: Reference comparison for eventId
if (fetchedEventIdRef.current === eventId) { // Fails on mobile
  return;
}

// ❌ DON'T: Multiple restoration useEffects
useEffect(() => { restore1(); }, []);
useEffect(() => { restore2(); }, []); // Race condition

// ❌ DON'T: Expect synchronous state updates
setLoading(false);
setEvent(data); // These are async! Component may render with old state
```

## ✅ Best Practices

```typescript
// ✅ DO: String comparison
const fetchedIdStr = String(fetchedEventIdRef.current);
const currentIdStr = String(eventId);
if (fetchedIdStr === currentIdStr) return;

// ✅ DO: Memoize eventId
const eventId = useMemo(() => {
  return typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : params?.id;
}, [params?.id]);

// ✅ DO: Use refs for immediate access
restoredDataRef.current = data; // Immediate, synchronous
setEvent(data); // Async, but ref is available now

// ✅ DO: Check effective values
const effectiveEvent = restoredDataRef.current?.event || event;
if (!effectiveEvent && loading) return <Loading />;
```

## 📋 Testing Checklist

When working on this issue, always test:
- [ ] Initial page load (no flickering)
- [ ] Browser back button
- [ ] App switching (switch away, return)
- [ ] Page refresh
- [ ] Direct URL navigation
- [ ] Empty `sessionStorage` (first visit)
- [ ] Populated `sessionStorage` (return visit)

## 🔧 Debugging

### Enable Debug Logs
Component includes extensive logging:
- `[CheckoutPage] 🔄 COMPONENT RE-RENDER` - Tracks re-renders
- `[CheckoutPage] 🔍 useEffect RUN` - Tracks effect execution
- `[CheckoutPage] ✅ RESTORING` - Tracks restoration
- `[CheckoutPage] ⚠️ SKIP` - Tracks skipped fetches

### DebugLogViewer Component
- Displays console logs on page
- Copy button for easy log sharing
- Located at top of checkout page

## 💡 Key Insights

1. **React State is Always Async**: No way to synchronously update state
2. **Mobile Browsers are Aggressive**: Remount components frequently
3. **sessionStorage is Reliable**: Persists across remounts
4. **String Comparison is Essential**: Prevents infinite loops
5. **Hydration Must Match**: Server/client initial render must be identical

## 🎯 Recommended Approach

**Accept brief loading screen on initial load**, but optimize restoration to be fast (<100ms).

For true "instant" loading, consider:
- React Server Components (Next.js 13+)
- Suspense boundaries
- Optimistic UI patterns
- Service Workers for network-level caching

## 📚 Full Documentation

See `checkout_page_flickering_analysis.md` for comprehensive analysis, all attempted approaches, and detailed explanations.

## 🔗 Related Files

- `src/app/events/[id]/checkout/page.tsx` - Main checkout page
- `src/components/UniversalPaymentCheckout.tsx` - Payment wrapper
- `src/components/DebugLogViewer.tsx` - Debug logging

## ⚠️ Important Notes

- **DO NOT** try to synchronously update React state - it's impossible
- **DO NOT** check `sessionStorage` synchronously in component body - causes hydration mismatch
- **DO** use `useEffect` for restoration - runs after mount, prevents hydration issues
- **DO** use effective values pattern - provides synchronous access via refs
- **DO** use string comparison - prevents infinite loops from reference changes





