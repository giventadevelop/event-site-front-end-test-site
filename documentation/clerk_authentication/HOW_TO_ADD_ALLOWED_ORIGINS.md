# How to Add Allowed Origins in Clerk Dashboard

## The Confusion

Clerk has multiple ways to whitelist domains, and the terminology varies:
- **Satellite Domains** (requires DNS verification)
- **Allowed Origins** (via API or sometimes hidden in Dashboard)
- **Cross-origin requests** settings

## Where to Find "Allowed Origins" in Clerk Dashboard

### Option 1: Check Settings → Cross-Origin

1. **Go to**: https://dashboard.clerk.com/
2. **Select**: Your production instance
3. **Navigate to**: **"Configure"** → **"Settings"** (left sidebar)
4. **Scroll down** to find: **"Cross-origin requests"** or **"CORS"** section
5. **Look for**: Field to add domains/origins
6. **Add**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com`

### Option 2: Check Account Portal Settings

1. **Go to**: https://dashboard.clerk.com/
2. **Select**: Your production instance
3. **Navigate to**: **"Configure"** → **"Account Portal"**
4. **Look for**: "Allowed redirect URLs" or similar
5. **Add**: Your Amplify domain

### Option 3: Check Session Settings

1. **Go to**: https://dashboard.clerk.com/
2. **Select**: Your production instance
3. **Navigate to**: **"Configure"** → **"Sessions"**
4. **Look for**: "Allowed origins" or "Domains" section

### Option 4: It Might Be Called "Allowed Domains"

Recent Clerk Dashboard versions use **"Allowed Domains"** instead of "Allowed Origins":

1. **Go to**: https://dashboard.clerk.com/
2. **Select**: Your production instance
3. **Navigate to**: **"Configure"** → **"Domains"**
4. **Look for**: Tab or section called **"Allowed domains"** or **"Application domains"**
5. **Should NOT be under "Satellites"** tab

---

## Solution: Use Clerk API Directly

Since the Dashboard UI varies, let's use the Clerk API to add the domain:

### PowerShell Script to Add Allowed Origin

```powershell
# Add Amplify domain to Clerk allowed origins
$clerkSecretKey = "sk_live_***"
$amplifyDomain = "https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com"

# First, get current allowed origins
$headers = @{
    "Authorization" = "Bearer $clerkSecretKey"
    "Content-Type" = "application/json"
}

Write-Host "Getting current allowed origins..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://api.clerk.com/v1/instance" -Headers $headers -Method Get

    Write-Host "Current allowed origins:" -ForegroundColor Yellow
    if ($response.allowed_origins) {
        foreach ($origin in $response.allowed_origins) {
            Write-Host "  - $origin" -ForegroundColor White
        }
    } else {
        Write-Host "  No allowed origins configured (allows all)" -ForegroundColor Gray
    }

    # Add Amplify domain if not already present
    if ($response.allowed_origins -notcontains $amplifyDomain) {
        Write-Host "`nAdding Amplify domain to allowed origins..." -ForegroundColor Cyan

        $newOrigins = @($response.allowed_origins) + @($amplifyDomain)

        $body = @{
            allowed_origins = $newOrigins
        } | ConvertTo-Json

        $updateResponse = Invoke-RestMethod -Uri "https://api.clerk.com/v1/instance" -Headers $headers -Method PATCH -Body $body

        Write-Host "✓ Successfully added!" -ForegroundColor Green
        Write-Host "`nUpdated allowed origins:" -ForegroundColor Yellow
        foreach ($origin in $updateResponse.allowed_origins) {
            Write-Host "  - $origin" -ForegroundColor White
        }
    } else {
        Write-Host "`n✓ Amplify domain already in allowed origins" -ForegroundColor Green
    }

} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
```

---

## Alternative: The Real Issue is Satellite Domain Verification

Looking at your screenshot, the **real problem** is that you have the domain as a **Satellite Domain** but it's **Unverified**.

### Two Solutions:

**Solution A: Delete Satellite Domain (RECOMMENDED)**

Since you can't verify the Amplify domain (no DNS control), just delete it from Satellite Domains:

1. **On the page from your screenshot**: Scroll to bottom
2. **Click**: Red "Delete Domain" button
3. **After deleting**: Clerk will allow the domain to work without being a satellite
4. **The domain should work** with your current simplified `layout.tsx`

**Solution B: Try to Verify with Proxy**

1. **Click**: "Set proxy configuration" button in your screenshot
2. **Follow** Clerk's proxy setup instructions
3. **But this requires** the `/__clerk/` proxy route to work perfectly

---

## Recommended Action: Just Delete the Satellite Domain

**Why?**
- Satellite domains require DNS verification
- Amplify domains can't be verified (no DNS control)
- Your app doesn't NEED satellite mode
- Deleting it will make OAuth work immediately

**What Happens After Deletion?**
- Clerk will allow the Amplify domain to use OAuth
- No verification needed
- Your current `layout.tsx` already works for this mode
- OAuth will work within 1-2 minutes

---

## What "Whitelisted Domains" Did You Add Yesterday?

You mentioned we "ran the whitelisted domains" yesterday. Where did you add them?

1. **Google Cloud Console** → OAuth Client → Authorized JavaScript origins? (We confirmed this is correct)
2. **Clerk Dashboard** → Somewhere else?

If you added them via Clerk API using a script, that's the "allowed origins" - but the Satellite Domain configuration is OVERRIDING it and blocking OAuth due to being "Unverified".

---

## Summary

**The simplest fix**:
1. Delete the Satellite Domain from Clerk Dashboard (from your screenshot page)
2. Wait 1-2 minutes
3. Test OAuth again
4. Should work immediately!

No need to add it anywhere else - once it's removed from Satellite Domains, Clerk will allow it to work without verification.

---

**Created**: 2025-10-23
**Status**: ACTION REQUIRED
**Next Step**: Delete satellite domain from Clerk Dashboard
