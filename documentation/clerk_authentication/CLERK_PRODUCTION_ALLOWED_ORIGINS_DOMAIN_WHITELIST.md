# Clerk Production Domain Whitelist Configuration

## Research Results: How to Whitelist Domains in Clerk

Based on official Clerk documentation research, here are **THREE methods** to configure allowed domains for production:

---

## Method 1: Using PowerShell Script (RECOMMENDED - Safe & Easy) ⭐

**Updated: 2025-01-25** - We now have an automated PowerShell script that safely adds domains without overwriting existing ones.

### Using Add-ClerkAllowedOrigins.ps1 (Version 1.2.0)

**IMPORTANT**: This script **APPENDS** new origins to existing ones. It will **NOT** overwrite your current configuration.

#### Features:
- ✅ Fetches existing origins before updating
- ✅ Merges new origins with existing ones
- ✅ Detects and skips duplicates (3 levels of protection)
- ✅ Shows clear statistics of what was added
- ✅ Reads Clerk secret key from .env.production automatically

#### Quick Start:

```powershell
cd documentation\clerk_authentication
.\Add-ClerkAllowedOrigins.ps1
```

The script will:
1. Read your Clerk secret key from `.env.production`
2. Fetch your current allowed origins from Clerk
3. Prompt you to enter new origins to add
4. Detect any duplicates (both in your input and existing origins)
5. Merge everything and update Clerk configuration
6. Show you exactly what was added

#### Example Output:

```
===============================================================================
 Clerk Allowed Origins Configuration Script v1.2.0
===============================================================================

[INFO] Fetching existing allowed origins from Clerk...
[SUCCESS] Found 1 existing allowed origin(s)

Origin 1
Enter origin URL: https://www.adwiise.com
[SUCCESS] Added: https://www.adwiise.com

Origin 2
Enter origin URL: https://www.mosc-temp.com
[WARN] Origin already exists: https://www.mosc-temp.com

Origin 3
Enter origin URL (or press Enter to finish):

[INFO] Existing origins: 1
[INFO] New origins to add: 1
[INFO] Duplicates skipped: 1
[INFO] Total after merge: 2

Configuration Summary:
  Existing origins:     1
  New origins added:    1
  Duplicates skipped:   1
  Total origins now:    2

Newly added origins:
  + https://www.adwiise.com
```

#### Advanced Usage:

**Specify origins as parameters:**
```powershell
.\Add-ClerkAllowedOrigins.ps1 -Origins @("https://example.com", "https://app.example.com")
```

**Specify secret key manually:**
```powershell
.\Add-ClerkAllowedOrigins.ps1 -SecretKey "sk_live_..." -Origins @("https://example.com")
```

#### Verification:

After adding origins, verify the configuration:
```powershell
.\Get-ClerkAllowedOrigins.ps1
```

This will show all currently configured allowed origins.

---

## Method 2: Using Clerk API Directly (Manual Method)

**⚠️ WARNING**: Direct API calls will **OVERWRITE** all existing origins unless you fetch them first!

### API Endpoint
```bash
PATCH https://api.clerk.com/v1/instance
```

### Safe Manual Approach:

**Step 1: Fetch Existing Origins First**
```bash
curl -X GET https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer sk_live_***_SECRET_KEY"
```

**Step 2: Merge New Origins with Existing Ones**

Copy the `allowed_origins` array from Step 1, add your new origins to it, then PATCH:

```bash
curl -X PATCH https://api.clerk.com/v1/instance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_***_SECRET_KEY" \
  -d '{
    "allowed_origins": [
      "https://existing-origin-1.com",
      "https://existing-origin-2.com",
      "https://NEW-origin-to-add.com"
    ]
  }'
```

**For Windows PowerShell (Safe Approach):**
```powershell
# Step 1: Get existing origins
$headers = @{
    "Authorization" = "Bearer sk_live_***_SECRET_KEY"
}

$instance = Invoke-RestMethod -Uri "https://api.clerk.com/v1/instance" -Method GET -Headers $headers
$existingOrigins = $instance.allowed_origins

# Step 2: Add new origin
$newOrigins = $existingOrigins + @("https://NEW-origin-to-add.com")

# Step 3: Update with merged list
$headers["Content-Type"] = "application/json"
$body = @{ allowed_origins = $newOrigins } | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.clerk.com/v1/instance" -Method PATCH -Headers $headers -Body $body
```

**⚠️ NEVER DO THIS** (This overwrites all origins):
```powershell
# ❌ BAD - This will delete all existing origins!
$body = @{
    allowed_origins = @("https://new-domain.com")  # Only this will remain!
} | ConvertTo-Json
```

**Step 3: Test**
After running this command, your Amplify domain will be whitelisted immediately. Test your app!

---

## Method 3: Using authorizedParties in Code (For Same Root Domain)

If your Amplify domain and production domain share the same root domain, use `authorizedParties`.

### In Your Middleware

Update `src/middleware.ts`:

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware({
  // Whitelist authorized origins
  authorizedParties: [
    'https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com',
    'https://www.adwiise.com',
    'http://localhost:3000',
  ],

  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/sso-callback(.*)',
    '/api/webhooks(.*)',
    '/api/public(.*)',
    '/mosc(.*)',
    '/events(.*)',
    '/gallery(.*)',
    '/about(.*)',
    '/contact(.*)',
  ],

  afterAuth(auth, req) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', req.nextUrl.pathname);
    return response;
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.[\\w]+$).*)',
    '/(api|trpc)(.*)',
  ],
};
```

**Note:** This protects against CSRF attacks by explicitly whitelisting allowed origins.

---

## Method 4: Using allowedRedirectOrigins in ClerkProvider

For multi-domain setups, configure allowed redirect origins.

### In Your Root Layout

Update `src/app/layout.tsx`:

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      allowedRedirectOrigins={[
        'https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com',
        'https://www.adwiise.com',
        'http://localhost:3000',
      ]}
    >
      <html lang="en" suppressHydrationWarning>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## Method 5: Check Clerk Dashboard - Domains Section

Based on documentation, domain configuration should be in:

### Location in Clerk Dashboard:
1. Go to: **Clerk Dashboard** → **Domains**
2. Look for: **"Satellites"** tab or **"Frontend API"** section
3. There should be an **"Advanced"** dropdown
4. Or look for **"Allowed Origins"** or **"Redirect URLs"** settings

### If You Can't Find It:
The API method (Method 1) is the official way to configure this when dashboard UI is not available.

---

## Verifying Your Configuration

After configuring allowed origins, verify they were applied correctly.

### Using Get-ClerkAllowedOrigins.ps1

```powershell
cd documentation\clerk_authentication
.\Get-ClerkAllowedOrigins.ps1
```

**Example Output:**
```
===============================================================================
 Clerk Instance Configuration
===============================================================================

[SUCCESS] Configuration retrieved successfully!

Instance ID:     ins_***
Environment:     PRODUCTION

Allowed Origins: 3

  - https://www.adwiise.com
  - https://www.mosc-temp.com
  - http://localhost:3000
```

### Verifying with API

```bash
curl -X GET https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer sk_live_***_SECRET_KEY" \
  | jq '.allowed_origins'
```

---

## Understanding Duplicate Detection

The Add-ClerkAllowedOrigins.ps1 script has **three levels** of duplicate protection:

### Level 1: During Interactive Input
If you enter the same URL twice while the script is prompting you:
```
Origin 1
Enter origin URL: https://example.com
[SUCCESS] Added: https://example.com

Origin 2
Enter origin URL: https://example.com
[WARN] Duplicate: 'https://example.com' already entered. Skipping.
```

### Level 2: In Parameter Array
If you pass duplicates as parameters:
```powershell
.\Add-ClerkAllowedOrigins.ps1 -Origins @("https://example.com", "https://example.com", "https://app.com")

[WARN] Duplicate origins detected in parameters and removed:
  - https://example.com
```

### Level 3: Against Clerk Instance
If the origin already exists in your Clerk configuration:
```
[INFO] Fetching existing allowed origins from Clerk...
[SUCCESS] Found 2 existing allowed origin(s)
[WARN] Origin already exists: https://www.mosc-temp.com
[INFO] Duplicates skipped: 1
```

This ensures you **never accidentally add the same origin twice**.

---

## Common Mistakes to Avoid

### ❌ MISTAKE 1: Using PATCH Without Fetching First
```powershell
# BAD - This will overwrite all your existing origins!
$body = @{ allowed_origins = @("https://new-site.com") } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.clerk.com/v1/instance" -Method PATCH -Headers $headers -Body $body
```

**Result**: All your existing origins are deleted. Only `new-site.com` remains.

**Fix**: Use the Add-ClerkAllowedOrigins.ps1 script or fetch existing origins first.

### ❌ MISTAKE 2: Forgetting to Include www
```powershell
# If your site is www.example.com, adding example.com won't work
allowed_origins = @("https://example.com")  # ❌ Wrong

# Must match exactly:
allowed_origins = @("https://www.example.com")  # ✅ Correct
```

### ❌ MISTAKE 3: Including Trailing Slashes
```powershell
# Don't include trailing slashes
allowed_origins = @("https://example.com/")  # ❌ Wrong
allowed_origins = @("https://example.com")   # ✅ Correct
```

### ❌ MISTAKE 4: Not Verifying After Changes
Always verify your changes were applied:
```powershell
.\Get-ClerkAllowedOrigins.ps1  # ✅ Always verify!
```

---

## Recommended Implementation Strategy

### For Your Production Setup:

**Step 1: Add Allowed Origins Using PowerShell Script (SAFEST)**
```powershell
cd documentation\clerk_authentication
.\Add-ClerkAllowedOrigins.ps1
```

Enter your domains when prompted:
- `https://www.adwiise.com`
- `https://www.mosc-temp.com`
- `http://localhost:3000` (for development)

The script will:
- Fetch existing origins
- Merge with new ones
- Show what was added
- Never overwrite existing configuration

**Step 2: Verify Configuration**
```powershell
.\Get-ClerkAllowedOrigins.ps1
```

Confirm all your domains are listed.

**Step 3: Add authorizedParties to Middleware (Optional - Security)**
Update your `middleware.ts` to include `authorizedParties` for CSRF protection.

**Step 4: Test**
- Clear browser cache
- Visit your domains and test sign-in
- Should work with no 400 errors!

### Alternative: Manual API Method (Advanced Users Only)

If you prefer to use curl or direct API calls, **always fetch existing origins first** before PATCH to avoid overwriting. See Method 2 above for details.

---

## Understanding the Configuration

### What Each Method Does:

**allowed_origins (API)**:
- Tells Clerk: "Accept requests from these domains"
- Works at the Clerk API level
- Applies immediately after API call

**authorizedParties (Middleware)**:
- Validates that session tokens are from authorized origins
- Protects against CSRF attacks
- Works at your application level

**allowedRedirectOrigins (ClerkProvider)**:
- Controls where Clerk can redirect after authentication
- Important for multi-domain setups
- Works at the React component level

### Why All Three?

For maximum security and flexibility:
1. **API** whitelists at Clerk's server level
2. **Middleware** validates at your app's server level
3. **ClerkProvider** controls at your app's client level

But you can start with just the **API method** to get it working.

---

## Testing the Configuration

After configuring allowed origins:

```bash
# Test the API endpoint directly
curl https://clerk.adwiise.com/v1/client?_clerk_js_version=4.73.14 \
  -H "Origin: https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com" \
  -H "User-Agent: Mozilla/5.0" \
  -v
```

Should return **200 OK** instead of **400 Bad Request**.

---

## Complete Configuration Checklist

### ✅ DNS Configuration (Already Done):
```
clerk.adwiise.com → CNAME → frontend-api.clerk.services
accounts.adwiise.com → CNAME → accounts.clerk.services
```

### ✅ Whitelist Domains via API:
```bash
curl -X PATCH https://api.clerk.com/v1/instance \
  -H "Authorization: Bearer stripe_apikey_with_sklive_prefix" \
  -H "Content-Type: application/json" \
  -d '{"allowed_origins": ["https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com", "https://www.adwiise.com"]}'
```

### ✅ Update Middleware (Optional but Recommended):
Add `authorizedParties` to `clerkMiddleware()` configuration.

### ✅ Test:
Visit your Amplify URL and verify no 400 errors.

---

## Why This is Better Than TEST Keys

**Using TEST Keys**:
- ❌ Not suitable for production
- ❌ Test data, not real users
- ❌ May have rate limits
- ❌ Can't use custom domains

**Using LIVE Keys with Whitelisting**:
- ✅ Production-ready
- ✅ Real user data
- ✅ Custom domains (clerk.adwiise.com)
- ✅ Professional setup
- ✅ Better security

---

## Troubleshooting

### If API Call Fails:

**Error: "Invalid API key"**
- Check that secret key is correct
- Ensure it's the LIVE key (starts with `sk_live_`)

**Error: "Unauthorized"**
- Secret key might be for different instance
- Try regenerating keys in Clerk Dashboard

### If Still Getting 400 Errors:

**Wait 2-5 minutes** after API call for changes to propagate.

**Clear browser cache** completely.

**Check browser console** - make sure it's calling `clerk.adwiise.com` not some other domain.

---

## Summary

**BEST APPROACH FOR PRODUCTION (Updated 2025-01-25):**

1. **Use Add-ClerkAllowedOrigins.ps1 script** (Method 1) - Safest method that never overwrites
2. **Verify with Get-ClerkAllowedOrigins.ps1** - Confirm all domains are configured
3. **Add `authorizedParties`** to your middleware (Method 3) for security
4. **Test with your LIVE keys** - should work immediately
5. **Keep using LIVE keys** - no need for TEST keys in production!

This is the official, documented way to configure allowed origins in Clerk for production deployments.

---

**Commands to Run NOW:**

```powershell
# Navigate to the scripts directory
cd documentation\clerk_authentication

# Add your allowed origins (safe - will not overwrite existing ones)
.\Add-ClerkAllowedOrigins.ps1

# Verify the configuration
.\Get-ClerkAllowedOrigins.ps1
```

**What to Enter When Prompted:**
```
Origin 1: https://www.adwiise.com
Origin 2: https://www.mosc-temp.com
Origin 3: http://localhost:3000
Origin 4: (press Enter to finish)
```

After running this, your 400 errors should disappear! 🎉

---

## Script Version History

### v1.2.0 (2025-01-25) - Current
- ✅ Fixed PowerShell syntax errors (removed UTF-8 characters)
- ✅ Added comprehensive duplicate detection (3 levels)
- ✅ Detects duplicates during interactive input
- ✅ Detects duplicates in parameter array
- ✅ Detects duplicates against Clerk instance
- ✅ All ASCII characters for Windows compatibility

### v1.1.0 (2025-01-25)
- ✅ Fixed overwrite issue - now appends instead
- ✅ Fetches existing origins before updating
- ✅ Merges new origins with existing ones
- ✅ Shows merge statistics

### v1.0.0 (2025-01-21) - DEPRECATED
- ❌ Overwrites existing origins (DO NOT USE)

**Always use v1.2.0 or later!**
