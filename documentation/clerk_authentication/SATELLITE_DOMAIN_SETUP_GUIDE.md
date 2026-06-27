# Satellite Domain Setup Guide - preview.adwiise.com

**Date**: 2025-01-23
**Primary Domain**: www.adwiise.com
**Satellite Domain**: preview.adwiise.com
**Amplify App**: feature-common-clerk.d1508w3f27cyps.amplifyapp.com

---

## Overview

This guide walks you through setting up `preview.adwiise.com` as a custom domain for your AWS Amplify app and configuring it as a Clerk satellite domain with DNS verification.

**Total Time**: ~1 hour (including DNS propagation)

---

## Prerequisites

- ✅ AWS Amplify app deployed
- ✅ Route53 hosted zone for adwiise.com (Zone ID: Z0478253VJVESPY8V1ZT)
- ✅ Clerk Pro plan (required for satellite domains in production)
- ✅ Access to Clerk Dashboard
- ✅ AWS CLI configured

---

## Step 1: Add Custom Domain in AWS Amplify Console

### Manual Steps (5 minutes)

1. **Go to AWS Amplify Console**:
   - URL: https://console.aws.amazon.com/amplify/
   - Select your app

2. **Navigate to Domain Management**:
   - Click "Domain management" in sidebar
   - Click "Add domain"

3. **Configure Domain**:
   ```
   Domain: adwiise.com
   Branch: feature_Common_Clerk
   Subdomain: preview
   ```

4. **Copy CNAME Value**:
   - Amplify will show a CNAME value like:
   ```
   preview.adwiise.com → feature-common-clerk.d1508w3f27cyps.amplifyapp.com
   ```
   - Keep this window open, you'll need this value

---

## Step 2: Add DNS CNAME in Route53

### Option A: Using PowerShell Script (Recommended)

Run the script:
```powershell
powershell -ExecutionPolicy Bypass -File "scripts\add-preview-domain.ps1"
```

### Option B: Manual AWS CLI Command

```powershell
aws route53 change-resource-record-sets --hosted-zone-id Z0478253VJVESPY8V1ZT --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "preview.adwiise.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "feature-common-clerk.d1508w3f27cyps.amplifyapp.com"}]
    }
  }]
}'
```

### Verify DNS

Wait 5-30 minutes, then check:
```powershell
nslookup preview.adwiise.com
```

Should return:
```
Name:    feature-common-clerk.d1508w3f27cyps.amplifyapp.com
Address: [IP address]
```

---

## Step 3: Wait for AWS Amplify Verification

1. Go back to Amplify Console → Domain management
2. Status will change from "Verifying" → "Available"
3. SSL certificate automatically provisioned
4. Once green checkmark appears, proceed to next step

**Time**: 10-30 minutes

---

## Step 4: Add Satellite Domain in Clerk Dashboard

### Manual Steps (3 minutes)

1. **Go to Clerk Dashboard**:
   - URL: https://dashboard.clerk.com/
   - Select production instance: `ins_***`

2. **Navigate to Satellite Domains**:
   - Go to Configure → Domains → Satellite domains
   - Click "Add satellite domain"

3. **Enter Domain**:
   ```
   Domain: preview.adwiise.com
   ```

4. **Choose Verification Method**:
   - Select: **DNS verification** (NOT proxy)

5. **Copy Clerk Verification CNAME**:
   - Clerk will show something like:
   ```
   Name: _clerk.preview.adwiise.com
   Type: CNAME
   Value: verify.clerk.services (or similar)
   ```
   - **Copy these exact values** - you'll need them next

---

## Step 5: Add Clerk Verification CNAME

### Important: Update Script First

1. Open `scripts/add-clerk-verification.ps1`
2. Replace these values with EXACT values from Clerk Dashboard:
   ```powershell
   $CLERK_VERIFICATION_NAME = "_clerk.preview.adwiise.com"  # From Clerk
   $CLERK_VERIFICATION_VALUE = "verify.clerk.services"      # From Clerk
   ```

### Run Script

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\add-clerk-verification.ps1"
```

### Or Manual Command

```powershell
# Replace with EXACT values from Clerk Dashboard
aws route53 change-resource-record-sets --hosted-zone-id Z0478253VJVESPY8V1ZT --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "_clerk.preview.adwiise.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "verify.clerk.services"}]
    }
  }]
}'
```

---

## Step 6: Verify Satellite Domain in Clerk

1. Go back to Clerk Dashboard
2. Click "Verify domain" button
3. Wait 2-10 minutes for verification
4. Status should change to "Verified" (green checkmark)

---

## Step 7: Deploy Code to Amplify

Code has been pushed to `feature_Common_Clerk` branch. AWS Amplify will automatically deploy.

### Verify Code Changes

The layout.tsx now includes:
- Automatic satellite detection based on hostname
- Satellite props configuration
- Primary domain redirect URLs
- Allowed redirect origins

### Monitor Deployment

1. Go to Amplify Console
2. Check deployment status
3. Wait for "Deployment completed successfully"

---

## Step 8: Update Google OAuth

1. **Go to Google Cloud Console**:
   - URL: https://console.cloud.google.com/apis/credentials
   - Select OAuth Client ID: `303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m`

2. **Add to Authorized JavaScript origins**:
   ```
   https://preview.adwiise.com
   ```

3. **Add to Authorized redirect URIs**:
   ```
   https://preview.adwiise.com/sso-callback
   ```

4. **Click "Save"**

---

## Step 9: Test Authentication Flow

### Test on Preview Domain

1. Visit: `https://preview.adwiise.com`
2. Click "Sign in"
3. **Expected flow**:
   - Redirects to `https://www.adwiise.com/sign-in`
   - Complete authentication on primary domain
   - Redirects back to `https://preview.adwiise.com`
   - User is signed in

### Test OAuth

1. Click "Sign in with Google"
2. **Expected flow**:
   - Redirects to `https://www.adwiise.com/sign-in`
   - Click "Sign in with Google"
   - Google OAuth completes
   - Redirects back to `https://preview.adwiise.com`
   - User is signed in with Google account

### Verify Session

- Check that user session persists on `preview.adwiise.com`
- Check that cookies are set correctly
- Test navigation across pages

---

## Troubleshooting

### DNS Not Resolving

**Issue**: `nslookup preview.adwiise.com` returns "can't find"

**Fix**:
1. Verify CNAME record in Route53
2. Wait longer (DNS can take up to 48 hours)
3. Try different DNS server: `nslookup preview.adwiise.com 8.8.8.8`

### Amplify Domain Stuck on "Verifying"

**Issue**: Amplify shows "Verifying" for > 1 hour

**Fix**:
1. Check DNS propagation: https://dnschecker.org/
2. Verify CNAME value matches Amplify's requirement exactly
3. Delete domain and re-add if stuck

### Clerk Verification Fails

**Issue**: Clerk says "Domain verification failed"

**Fix**:
1. Verify EXACT CNAME values from Clerk Dashboard
2. Check Route53 record matches exactly
3. Wait 10 minutes and try "Verify" again
4. Check for typos in domain name

### OAuth Fails After Setup

**Issue**: OAuth returns authorization_invalid

**Fix**:
1. Verify satellite domain shows "Verified" in Clerk Dashboard
2. Check Google OAuth includes `preview.adwiise.com` in authorized origins
3. Clear browser cookies and try again
4. Check Amplify deployment completed successfully

### Satellite Domain Not Detected

**Issue**: Site behaves as primary domain

**Fix**:
1. Check Amplify deployment completed
2. Verify hostname detection in code
3. Check browser DevTools → Console for errors
4. Try accessing via HTTPS (not HTTP)

---

## Verification Checklist

Before testing, verify:

- [ ] AWS Amplify domain shows "Available" (green)
- [ ] `nslookup preview.adwiise.com` resolves correctly
- [ ] Clerk satellite domain shows "Verified" (green)
- [ ] Google OAuth includes preview domain
- [ ] Amplify deployment completed successfully
- [ ] Can access https://preview.adwiise.com without errors

---

## Configuration Summary

### DNS Records (Route53)

```
preview.adwiise.com          CNAME  feature-common-clerk.d1508w3f27cyps.amplifyapp.com
_clerk.preview.adwiise.com   CNAME  verify.clerk.services (or value from Clerk)
```

### Clerk Configuration

**Primary Domain**: www.adwiise.com
- `allowedRedirectOrigins`: `["https://preview.adwiise.com"]`

**Satellite Domain**: preview.adwiise.com
- `isSatellite`: `true`
- `domain`: `preview.adwiise.com`
- `signInUrl`: `https://www.adwiise.com/sign-in`
- `signUpUrl`: `https://www.adwiise.com/sign-up`
- Verification: DNS (verified)

### Google OAuth

**Client ID**: 303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m

**Authorized JavaScript origins**:
- https://www.adwiise.com
- https://humble-monkey-3.clerk.accounts.dev
- http://localhost:3000
- **https://preview.adwiise.com** ← Added

**Authorized redirect URIs**:
- https://clerk.adwiise.com/v1/oauth_callback
- https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback
- **https://preview.adwiise.com/sso-callback** ← Added

---

## Next Steps: Adding More Tenant Domains

To add future tenant domains (e.g., `tenant1.adwiise.com`, `www.abc.com`):

1. Follow same DNS setup process
2. Add to Clerk Dashboard as satellite domain
3. Update layout.tsx to detect new domain
4. Add to Google OAuth authorized origins
5. Deploy and test

---

## Support

If issues persist after following this guide:

1. Check Clerk Dashboard logs for trace IDs
2. Review AWS Amplify deployment logs
3. Contact Clerk support with:
   - Instance ID: `ins_***`
   - Satellite domain: `preview.adwiise.com`
   - Any error trace IDs

---

**Created**: 2025-01-23
**Status**: In Progress
**Next**: Complete Steps 1-9 above
