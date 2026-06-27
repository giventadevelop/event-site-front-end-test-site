# Mobile Browser Debugging Guide

## Overview
This guide explains how to access console logs and debug API calls when testing on mobile browsers.

---

## Method 1: Remote Debugging (Recommended)

### Android Chrome (Easiest)

**Requirements:**
- Android device with USB debugging enabled
- USB cable
- Chrome browser on desktop

**Steps:**

1. **Enable USB Debugging on Android:**
   - Go to: Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to: Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect Device:**
   - Connect Android device to computer via USB
   - On device, allow USB debugging when prompted

3. **Open Chrome DevTools:**
   - Open Chrome on desktop
   - Go to: `chrome://inspect` or `chrome://inspect/#devices`
   - Your device should appear under "Remote Target"
   - Click "Inspect" next to your device/tab

4. **View Console Logs:**
   - Console tab shows all `console.log()` output
   - Network tab shows all API requests/responses
   - Elements tab shows DOM inspection

**Benefits:**
- ✅ Real-time console logs
- ✅ Network request inspection
- ✅ Full DevTools access
- ✅ Works with real device

---

### iOS Safari (Mac Required)

**Requirements:**
- Mac computer
- iPhone/iPad
- USB cable

**Steps:**

1. **Enable Web Inspector on iOS:**
   - Go to: Settings → Safari → Advanced
   - Enable "Web Inspector"

2. **Connect Device:**
   - Connect iPhone/iPad to Mac via USB
   - Trust computer if prompted

3. **Open Safari DevTools:**
   - On Mac: Open Safari
   - Go to: Safari → Preferences → Advanced
   - Enable "Show Develop menu in menu bar"
   - On iPhone: Open Safari and navigate to your site
   - On Mac: Safari → Develop → [Your Device Name] → [Your Tab Name]

4. **View Console Logs:**
   - Console shows all logs
   - Network tab shows API calls
   - Elements tab for DOM inspection

**Benefits:**
- ✅ Native iOS Safari debugging
- ✅ Real device testing
- ✅ Full Web Inspector access

---

## Method 2: Desktop Browser Mobile Emulation

### Chrome DevTools Mobile Emulation

**Steps:**

1. **Open Chrome DevTools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Or: Right-click → Inspect

2. **Enable Mobile Emulation:**
   - Click "Toggle Device Toolbar" icon (phone icon) or press `Ctrl+Shift+M`
   - Select device preset (iPhone, iPad, Android, etc.)
   - Or set custom dimensions

3. **View Console:**
   - Console tab shows all logs
   - Network tab shows API requests
   - Mobile-specific logs will appear

**Benefits:**
- ✅ Quick testing without physical device
- ✅ Easy to switch between devices
- ✅ Full DevTools access
- ❌ May not catch all mobile-specific issues

**Limitations:**
- Doesn't test real mobile browser behavior
- May miss touch event issues
- Network conditions may differ

---

## Method 3: Mobile Browser Console Apps

### Eruda (Mobile Console for Any Browser)

**Add to Your Page Temporarily:**

```html
<!-- Add this to your page for mobile debugging -->
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

**Benefits:**
- ✅ Works on any mobile browser
- ✅ No USB connection needed
- ✅ Shows console logs on screen
- ✅ Network inspection

**Limitations:**
- ❌ Requires code changes
- ❌ Console overlay on screen
- ❌ Not ideal for production

---

## Method 4: Network Inspection Tools

### Charles Proxy / Fiddler

**For API Request Inspection:**

1. **Install Charles Proxy** (or Fiddler)
2. **Configure Mobile Device:**
   - Connect device to same WiFi as computer
   - Set device proxy to computer's IP address
   - Install SSL certificate on device

3. **View Requests:**
   - All HTTP/HTTPS requests appear in Charles
   - See request/response headers
   - View request/response bodies
   - Check status codes

**Benefits:**
- ✅ See all network traffic
- ✅ Works with any app/browser
- ✅ No code changes needed
- ✅ SSL inspection

---

## Method 5: Cloud-Based Testing

### BrowserStack / Sauce Labs

**For Remote Device Testing:**

1. **Sign up for BrowserStack** (or similar service)
2. **Select Real Device:**
   - Choose Android/iOS device
   - Select browser (Chrome, Safari, etc.)

3. **Access DevTools:**
   - Some services provide DevTools access
   - View console logs remotely
   - Inspect network requests

**Benefits:**
- ✅ Test on real devices remotely
- ✅ Multiple device/browser combinations
- ✅ No physical device needed

**Limitations:**
- ❌ Requires paid subscription
- ❌ May have latency
- ❌ Limited debugging features

---

## Quick Reference: Where to Find Logs

### For Your Checkout Page (`/events/2/checkout`)

**Console Logs to Look For:**

1. **Mobile Detection:**
   ```
   [CheckoutPage] Mobile browser detected: {...}
   ```

2. **API Call Attempts:**
   ```
   [CheckoutPage] Fetching event details: /api/proxy/event-details/2
   ```

3. **Response Status:**
   ```
   [CheckoutPage] Event response status: 200 OK
   ```

4. **Errors:**
   ```
   [CheckoutPage] CRITICAL ERROR loading checkout page: {...}
   ```

5. **Network Tab:**
   - Look for requests to `/api/proxy/event-details/2`
   - Check status codes (200, 404, 500, etc.)
   - View response bodies
   - Check request headers

---

## Recommended Workflow

### For Quick Testing:
1. Use **Chrome DevTools Mobile Emulation** (Method 2)
2. Check Console tab for logs
3. Check Network tab for API calls

### For Real Device Testing:
1. Use **Android Chrome Remote Debugging** (Method 1)
2. Or **iOS Safari Web Inspector** (Method 1)
3. Check Console and Network tabs

### For Production Debugging:
1. Use **Charles Proxy** (Method 4) to inspect network
2. Or add **Eruda** temporarily (Method 3) for on-screen console

---

## Troubleshooting

### "No devices found" (Android)
- Check USB debugging is enabled
- Try different USB cable
- Install device drivers
- Restart Chrome DevTools

### "Web Inspector not showing" (iOS)
- Ensure Web Inspector is enabled in Settings
- Check Mac Safari has Develop menu enabled
- Try disconnecting/reconnecting device

### "Console logs not appearing"
- Check browser console is open
- Verify logs are being output (add test `console.log('test')`)
- Check for console filters (may hide certain log levels)
- Try clearing console and refreshing

### "Network requests not showing"
- Check Network tab is open
- Verify "Preserve log" is enabled
- Check filters aren't hiding requests
- Try hard refresh (Ctrl+Shift+R)

---

## Additional Tips

1. **Use `console.error()` for critical errors** - easier to spot
2. **Add timestamps to logs** - helps track timing issues
3. **Log request/response data** - helps debug API issues
4. **Use Network tab filters** - filter by "XHR" or "Fetch" to see API calls only
5. **Check Response tab** - view actual response body from backend

---

## References

- [Chrome Remote Debugging](https://developer.chrome.com/docs/devtools/remote-debugging/)
- [Safari Web Inspector Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/Introduction/Introduction.html)
- [Eruda Mobile Console](https://github.com/liriliri/eruda)
- [Charles Proxy Documentation](https://www.charlesproxy.com/documentation/)









