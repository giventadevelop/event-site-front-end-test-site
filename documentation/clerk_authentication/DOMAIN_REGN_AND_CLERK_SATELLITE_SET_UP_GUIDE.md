# Satellite Domain Setup Guide - www.mosc-temp.com

**Date**: 2025-01-23
**Updated**: 2025-11-01 (Added sign-out flow, redirect URL fixes, DNS configuration fixes, Amplify platform type requirement)

**Primary Domain**: www.adwiise.com (Amplify App #1 - ALREADY EXISTS)
**New Satellite Domain**: www.mosc-temp.com (Amplify App #2 - Separate deployment)

---

## ⚠️ CRITICAL PRE-FLIGHT CHECKLIST

**Before starting setup, verify these MUST-DO items:**

### 1. ✅ Amplify Platform Type (MOST COMMON FAILURE POINT!)

When creating the Amplify app, you MUST select **"Web Compute"** platform:

```
❌ Platform: WEB (Static site - will cause 404 errors!)
✅ Platform: Web Compute (Next.js SSR with Lambda - REQUIRED!)
```

**How to verify:**
- AWS Amplify Console → Your App → App settings → General settings
- Check "Platform" field - MUST say **"Web Compute"**
- If it says "WEB", you MUST delete and recreate the app

**Why this matters:**
- `WEB` = Static site deployment (no Lambda functions, no SSR)
- `Web Compute` = Next.js SSR deployment (with Lambda@Edge functions)
- Wrong platform = 404 errors even with successful builds
- Wrong platform = No "Hosting compute logs" in Monitoring section
- **Cannot be changed after creation** - must recreate app!

**Signs you have wrong platform:**
- ❌ Missing "Hosting compute logs" menu item under Monitoring
- ❌ 404 errors on all pages despite successful deployment
- ❌ Build logs show SSR functions created but site doesn't work
- ❌ Direct Amplify URL returns 404

---

### 2. ✅ Update ALL Hardcoded Domain References in Source Code

When setting up a new satellite domain, you MUST update hardcoded domain names in **BOTH** primary and satellite project source code. **Environment variables alone are NOT enough!**

**Files requiring hardcoded domain updates** (see detailed section below):

**Satellite Project** (e.g., md-strikers):
- [ ] `src/app/layout.tsx` - Domain detection and Clerk config (3-4 locations)
- [ ] `src/middleware.ts` - Satellite detection (2 locations)
- [ ] `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Redirect URL
- [ ] `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Redirect URL
- [ ] `src/app/__clerk/[...path]/route.ts` - Clerk Frontend API URL
- [ ] `src/components/Header.tsx` - Sign-out redirect URL
- [ ] `next.config.mjs` - Clerk proxy rewrite destination

**Primary Project** (e.g., event-site-manager):
- [ ] `src/app/layout.tsx` - allowedRedirectOrigins array
- [ ] `src/middleware.ts` - CORS headers (2 locations)

**Common mistake:** Copying a project like mcefee-temp and only updating .env files. The code still has old domain hardcoded!

---

### 3. ✅ DNS Configuration Format Consistency

Ensure your Clerk domain configuration matches your DNS records:

```
If DNS is:     clerk.www.md-strikers.com
Then use:      NEXT_PUBLIC_CLERK_DOMAIN=www.md-strikers.com

If DNS is:     clerk.md-strikers.com
Then use:      NEXT_PUBLIC_CLERK_DOMAIN=md-strikers.com
```

**Always use environment variable as source of truth:**
```typescript
domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'www.md-strikers.com'
```

---

## Overview

This guide sets up `www.mosc-temp.com` as a **Clerk satellite domain** that uses `www.adwiise.com` for authentication.

### Architecture: Two Separate Applications

**IMPORTANT**: This setup uses **TWO SEPARATE**:
- ✅ Git repositories (different codebases)
- ✅ AWS Amplify apps (separate deployments)
- ✅ Domain names (different root domains)
- ✅ But shares **ONE** Clerk instance (same user database)

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  Primary App (www.adwiise.com)                              │
│  • Separate Amplify App #1                                  │
│  • Separate Git Repo #1                                     │
│  • Handles ALL authentication                               │
│  • Clerk instance: ins_***         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Satellite App (www.mosc-temp.com)                          │
│  • Separate Amplify App #2                                  │
│  • Separate Git Repo #2                                     │
│  • Redirects to primary for auth                            │
│  • Same Clerk instance (shared users)                       │
└─────────────────────────────────────────────────────────────┘
```

### Benefits

- ✅ Users authenticate on `www.adwiise.com` (primary)
- ✅ After auth, redirected back to `www.mosc-temp.com` (satellite)
- ✅ **Shared user database** across both apps
- ✅ Each app can have completely different codebase
- ✅ Multi-tenant architecture (add more satellite domains later)

**Total Time**: ~1 hour (including DNS propagation)

---

## 📚 Additional Documentation: Satellite Branding During Authentication

**For detailed information about showing satellite-specific headers and footers during authentication redirects, refer to the comprehensive guide in the Primary Domain project:**

**📍 Documentation Location:**
```
E:\project_workspace\event-site-manager\documentation\clerk_authentication\DOMAIN_REGN_AND_CLERK_SATELLITE_SET_UP_GUIDE.md
```

**What's Covered in That Document:**

### 🎨 Satellite Branding Implementation
- **ConditionalAuthLayout Pattern** - How primary domain hides its header/footer on auth routes
- **Configuration-Based Rendering** - How satellite branding is stored and rendered
- **SatelliteHeader & SatelliteFooter Components** - Complete implementation details

### 📋 Key Topics:
1. **Architecture Overview** - Multi-domain authentication flow with branding
2. **Problem & Solution** - Why mixed branding occurred and how it was fixed
3. **Configuration Management** - Complete `satellites.json` branding structure
4. **Code Structure** - All file locations and component relationships
5. **Implementation Details** - Line-by-line code walkthrough
6. **Setup Instructions** - Step-by-step guide for adding new satellites with branding
7. **Testing Checklist** - Comprehensive testing procedures
8. **Troubleshooting Guide** - Common issues and solutions

### 🔑 Key Implementation:
The primary domain uses a **ConditionalAuthLayout** component that:
- Detects when a user is on an authentication route (`/sign-in`, `/sign-up`, `/auth/signout-redirect`)
- **Hides** the primary domain's header and footer completely
- **Shows** satellite-specific header and footer based on the `redirect_url` parameter
- Renders satellite branding from configuration (no iframes, no external fetching)

### 📖 Example Flow:
```
User on satellite (www.mosc-temp.com) → Clicks "Sign In"
    ↓
Redirects to primary with redirect_url:
    https://www.event-site-manager.com/sign-in?redirect_url=https://www.mosc-temp.com
    ↓
Primary domain:
    ✅ Hides MCEFEE header/footer (ConditionalAuthLayout)
    ✅ Extracts satellite config from redirect_url
    ✅ Shows "Unite India" header/footer (satellite branding)
    ↓
User completes authentication
    ↓
Redirects back to www.mosc-temp.com with session
```

### 💡 Why This Matters:
Without this implementation, users would see **mixed branding** during authentication:
- ❌ Primary domain header (MCEFEE) at top
- ❌ Satellite footer (Unite India) at bottom
- ❌ Confusing user experience

With this implementation:
- ✅ Only satellite branding visible during entire auth flow
- ✅ Seamless branded experience
- ✅ No user confusion about which site they're on

### 🚀 For Developers:
If you need to:
- Understand how satellite branding works during authentication
- Add a new satellite domain with custom branding
- Troubleshoot branding issues (double headers/footers)
- Modify satellite header/footer components
- Update branding configuration

**→ Refer to the Primary Domain documentation linked above for complete details.**

---

## Prerequisites

### Required
- ✅ Primary app `www.adwiise.com` already deployed (Amplify App #1)
- ✅ Satellite app `www.mosc-temp.com` already deployed (Amplify App #2)
- ✅ Clerk account with Pro plan (required for satellite domains)
- ✅ Domain name `mosc-temp.com` (registered and pointing to Amplify App #2)
- ✅ AWS CLI configured with credentials
- ✅ Both apps use **SAME** Clerk publishable key

### Domain Registration & Setup

If you don't already have `mosc-temp.com`, you need to either:
1. **Register it** (if unregistered), OR
2. **Transfer it to Route53** (if registered elsewhere)

See **"Domain Setup Steps"** section below for detailed instructions.

---

## Authentication Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│              Cross-App Authentication Flow                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. User visits www.mosc-temp.com                                   │
│     → Amplify App #2, Repo #2                                       │
│                                                                       │
│  2. Clicks "Sign in"                                                │
│     → Frontend redirects to www.adwiise.com/sign-in                 │
│                                                                       │
│  3. Arrives at www.adwiise.com/sign-in                             │
│     → Amplify App #1, Repo #1 (different app!)                     │
│                                                                       │
│  4. User authenticates (email/OAuth)                                │
│     → Clerk creates session in backend                              │
│                                                                       │
│  5. Clerk redirects back with special token:                        │
│     → www.mosc-temp.com?__clerk_ticket=xxxx                        │
│     → Back to Amplify App #2                                        │
│                                                                       │
│  6. mosc-temp.com exchanges ticket for session                      │
│     → Clerk API validates ticket                                    │
│     → Creates session cookie for mosc-temp.com                      │
│                                                                       │
│  7. User now signed in on www.mosc-temp.com                         │
│     → Different app, same user account!                             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

Primary App (www.adwiise.com - Amplify App #1):
  - Separate codebase
  - Handles ALL authentication
  - OAuth flows happen here
  - Users see Clerk UI on this domain

Satellite App (www.mosc-temp.com - Amplify App #2):
  - Separate codebase
  - Redirects to primary for auth
  - Receives session via Clerk ticket exchange
  - Users work here after authentication

Key Point: Session transfer via Clerk backend (NOT cookies)
  - Sessions stored in Clerk's backend
  - Each domain gets its own session cookie
  - Both cookies point to SAME Clerk session
  - No cookie sharing needed!
```

---

## Sign-Out Flow Architecture

**IMPORTANT**: Sign-out requires special handling for satellite domains because Clerk cookies are set on the PRIMARY domain.

```
┌─────────────────────────────────────────────────────────────────────┐
│              Cross-Domain Sign-Out Flow                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. User on www.mosc-temp.com clicks "Sign Out"                     │
│     → Satellite Header.tsx handleSignOut() triggered                │
│                                                                       │
│  2. Satellite redirects to primary sign-out page:                   │
│     → https://www.adwiise.com/auth/signout-redirect?redirect_url=   │
│       https://www.mosc-temp.com                                     │
│                                                                       │
│  3. Primary domain (/auth/signout-redirect/page.tsx):              │
│     → Calls Clerk signOut() to clear cookies on primary            │
│     → Waits for sign-out to complete                                │
│                                                                       │
│  4. Primary redirects back to satellite with flag:                  │
│     → https://www.mosc-temp.com?clerk_signout=true                 │
│                                                                       │
│  5. Satellite Header.tsx detects clerk_signout=true flag:          │
│     → Clears all Clerk-related items from localStorage              │
│     → Removes flag from URL                                         │
│     → Reloads page                                                  │
│                                                                       │
│  6. User now signed out on www.mosc-temp.com                        │
│     → Clean state, no stale data                                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

Why This Flow Is Necessary:
  - Clerk cookies are set on PRIMARY domain (www.adwiise.com)
  - Satellite domain CANNOT clear primary domain cookies (browser security)
  - Must redirect to primary to call Clerk signOut()
  - Use URL flag to signal successful sign-out back to satellite
  - Satellite clears its local storage on flag detection

Key Implementation Files:
  PRIMARY (event-site-manager):
    - src/app/auth/signout-redirect/page.tsx (handles sign-out)
    - src/middleware.ts (add /auth/signout-redirect to publicRoutes)

  SATELLITE (mcefee-temp):
    - src/components/Header.tsx (sign-out button + flag detection)
```

---

## Domain Setup Steps (Complete Before Main Setup)

If you already own `mosc-temp.com` and it's in Route53, **skip to "Step-by-Step Setup"** below.

### Option A: Register New Domain in Route53 (30 min)

If `mosc-temp.com` is available and unregistered:

#### 1. Check Domain Availability

```powershell
# Check if domain is available
aws route53domains check-domain-availability --domain-name mosc-temp.com
```

Expected response if available:
```json
{
    "Availability": "AVAILABLE"
}
```

#### 2. Register Domain via AWS Console (Recommended)

1. **Go to Route53 Console**:
   - URL: https://console.aws.amazon.com/route53/
   - Click "Registered domains" in left sidebar
   - Click "Register domain"

2. **Search for Domain**:
   - Enter: `mosc-temp.com`
   - Click "Check"
   - If available, click "Add to cart"

3. **Configure Domain**:
   - Duration: 1 year (or more)
   - Auto-renew: Enable (recommended)
   - Privacy protection: Enable (recommended)

4. **Enter Contact Information**:
   - Fill in registrant details
   - Use valid email (you'll need to verify it)

5. **Review and Purchase**:
   - Review details
   - Accept terms
   - Click "Complete purchase"
   - Cost: ~$12-15/year

6. **Wait for Registration**:
   - Takes 10-30 minutes
   - You'll receive confirmation email
   - Hosted zone automatically created

7. **Verify Email**:
   - Check email for verification link
   - Click to verify domain ownership
   - Required within 15 days

#### 3. Get Hosted Zone ID

After registration completes:

```powershell
# Get your hosted zone ID
aws route53 list-hosted-zones --query "HostedZones[?Name=='mosc-temp.com.'].Id" --output text
```

**Copy this Zone ID** - you'll need it for DNS setup.

---

### Option B: Transfer Existing Domain to Route53 (1-5 days)

If you already own `mosc-temp.com` at another registrar:

#### 1. Prepare Domain at Current Registrar

1. **Unlock domain** (remove registrar lock)
2. **Get authorization code** (EPP code/transfer code)
3. **Disable WHOIS privacy** temporarily
4. **Verify contact email** is current

#### 2. Initiate Transfer in Route53

1. **Go to Route53 Console**:
   - URL: https://console.aws.amazon.com/route53/
   - Click "Registered domains"
   - Click "Transfer domain"

2. **Enter Domain and Auth Code**:
   - Domain: `mosc-temp.com`
   - Authorization code: [from current registrar]
   - Click "Check"

3. **Configure Transfer**:
   - Auto-renew: Enable
   - Privacy protection: Enable
   - Review and complete purchase

4. **Approve Transfer**:
   - Check email for transfer approval
   - Approve transfer request
   - Transfer takes 5-7 days

#### 3. Create Hosted Zone (During Transfer)

While waiting for transfer, create hosted zone:

```powershell
# Create hosted zone
aws route53 create-hosted-zone --name mosc-temp.com --caller-reference $(date +%s)
```

Get the nameservers from output and update at current registrar.

---

### Option C: Use Existing Domain (Keep at Current Registrar)

If you want to keep `mosc-temp.com` at current registrar:

#### 1. Create Hosted Zone in Route53

```powershell
# Create hosted zone
aws route53 create-hosted-zone --name mosc-temp.com --caller-reference $(date +%s)
```

#### 2. Get Route53 Nameservers

```powershell
# Get nameservers
aws route53 get-hosted-zone --id <ZONE_ID> --query "DelegationSet.NameServers" --output json
```

Example output:
```json
[
    "ns-123.awsdns-12.com",
    "ns-456.awsdns-45.net",
    "ns-789.awsdns-78.org",
    "ns-012.awsdns-01.co.uk"
]
```

#### 3. Update Nameservers at Current Registrar

1. Log in to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS or Nameserver settings for `mosc-temp.com`
3. Replace existing nameservers with Route53 nameservers
4. Save changes
5. Wait 24-48 hours for propagation

#### 4. Verify Delegation

After 24-48 hours:

```powershell
# Check if nameservers updated
nslookup -type=NS mosc-temp.com
```

Should show Route53 nameservers.

---

### Verification: Domain Ready for Setup

Before proceeding to main setup, verify:

- [ ] Domain `mosc-temp.com` is registered
- [ ] Route53 hosted zone exists for `mosc-temp.com`
- [ ] You have the hosted zone ID
- [ ] Domain nameservers point to Route53
- [ ] Domain is unlocked (if recently transferred)

**Get your hosted zone ID**:

```powershell
aws route53 list-hosted-zones --query "HostedZones[?Name=='mosc-temp.com.'].Id" --output text
```

**Example output**: `Z0123456789ABCDEFGHIJ`

---

## Step-by-Step Setup

### STEP 1: Verify Both Amplify Apps Are Deployed (5 min)

**Important**: Ensure both applications are deployed and accessible.

#### Check Primary App (www.adwiise.com)

1. **Go to AWS Amplify Console**:
   - URL: https://console.aws.amazon.com/amplify/
   - Select your **www.adwiise.com Amplify app** (App #1)

2. **Verify Deployment**:
   - Check Domain management → `www.adwiise.com` should show "Available" (green)
   - Visit https://www.adwiise.com in browser
   - Confirm site loads correctly

#### Check Satellite App (www.mosc-temp.com)

1. **Go to AWS Amplify Console**:
   - Select your **www.mosc-temp.com Amplify app** (App #2)
   - This is a **SEPARATE** app from adwiise.com

2. **Verify Deployment**:
   - Check Domain management → `www.mosc-temp.com` should show "Available" (green)
   - If domain not configured yet, add it:
     ```
     Domain: mosc-temp.com
     Branch: [your branch name]
     Subdomain: www
     ```
   - Visit https://www.mosc-temp.com in browser
   - Confirm site loads (authentication won't work until Clerk setup complete)

3. **Verify Environment Variables** (CRITICAL):
   ```bash
   # In www.mosc-temp.com Amplify app, verify these are set:
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***
   NEXT_PUBLIC_APP_URL=https://www.mosc-temp.com
   AMPLIFY_API_JWT_USER=YOUR_JWT_USER
   AMPLIFY_API_JWT_PASS=YOUR_JWT_PASSWORD
   NEXT_PUBLIC_API_BASE_URL=https://event-site-manager-dev.com

   # Remove these if they exist:
   # CLERK_DOMAIN
   # NEXT_PUBLIC_CLERK_FRONTEND_API
   ```

**Checkpoint**: Both domains should be accessible before proceeding.

---

### STEP 2: Verify DNS Configuration (2 min)

Confirm DNS is correctly pointing to respective Amplify apps.

#### For www.adwiise.com

```powershell
nslookup www.adwiise.com
```

Should return the Amplify App #1 domain (e.g., `main.xxxxx.amplifyapp.com`).

#### For www.mosc-temp.com

```powershell
nslookup www.mosc-temp.com
```

Should return the Amplify App #2 domain (e.g., `main.yyyyy.amplifyapp.com`).

**Note**: These should be DIFFERENT Amplify domains since they're separate apps.

---

### STEP 3: Add Satellite Domain in Clerk Dashboard (5 min)

**Important**: You're adding `www.mosc-temp.com` as a satellite to your **existing** Clerk instance.

1. **Go to Clerk Dashboard**:
   - URL: https://dashboard.clerk.com/
   - Select your production instance: `ins_***`

2. **Navigate to Satellite Domains**:
   - Go to: Configure → Domains → Satellite domains
   - You should see: "No satellite domains" (or existing satellites)
   - Click "Add satellite domain"

3. **Enter Domain**:
   ```
   Domain: www.mosc-temp.com
   ```

4. **Choose Verification Method**:
   - Select: **DNS verification** (NOT proxy)
   - Clerk supports different root domains with DNS verification

5. **Copy Clerk's CNAME Values**:
   - Clerk will display something like:
   ```
   Name: _clerk.www.mosc-temp.com
   Type: CNAME
   Value: verify.clerk.services (or similar)
   ```
   - **Write down these EXACT values** - you'll need them for mosc-temp.com DNS

---

### STEP 4: Quick Reference - Automated DNS Setup for Satellite Domain

For satellite domains (like `www.mcefee-temp.com`), you only need **1 CNAME record** (unlike primary domains which need 5).

#### Option A: Automated Script (Recommended)

Use the dedicated satellite DNS script:

```powershell
# Navigate to documentation folder
cd documentation\clerk_authentication

# Run the satellite DNS script
.\Add-ClerkSatelliteDnsRecord.ps1 `
  -Domain "www.mcefee-temp.com" `
  -HostedZoneId "Z0478253VJVESPY8V1ZT"
```

**What you need:**
1. **Hosted Zone ID**: Find it with:
   ```powershell
   aws route53 list-hosted-zones --query "HostedZones[?Name=='mcefee-temp.com.'].Id" --output text
   ```

2. **Domain name**: The exact satellite domain from Clerk Dashboard (e.g., `www.mcefee-temp.com`)

**What the script creates:**
- `clerk.www.mcefee-temp.com` → `frontend-api.clerk.services`

#### Option B: Manual Setup via AWS CLI

If you prefer manual setup:

```powershell
# Step 1: Create JSON file with CNAME configuration
@'
{
  "Comment": "Add Clerk CNAME for satellite domain",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "clerk.www.mcefee-temp.com",
      "Type": "CNAME",
      "TTL": 3600,
      "ResourceRecords": [{"Value": "frontend-api.clerk.services"}]
    }
  }]
}
'@ | Set-Content -NoNewline -Path .\clerk-satellite-cname.json

# Step 2: Get hosted zone ID (if not known)
aws route53 list-hosted-zones --query "HostedZones[?Name=='mcefee-temp.com.'].Id" --output text

# Step 3: Apply the CNAME record to Route53
aws route53 change-resource-record-sets --hosted-zone-id Z0478253VJVESPY8V1ZT --change-batch file://clerk-satellite-cname.json

# Step 4: Verify the record was created
aws route53 list-resource-record-sets --hosted-zone-id Z0478253VJVESPY8V1ZT --query "ResourceRecordSets[?Name=='clerk.www.mcefee-temp.com.']"
```

#### Option C: Via Route 53 Console

1. Go to **AWS Route 53 Console** → **Hosted zones**
2. Select your domain's hosted zone (e.g., `mcefee-temp.com`)
3. Click **Create record**
4. Configure:
   - **Record name**: `clerk.www`
   - **Record type**: `CNAME`
   - **Value**: `frontend-api.clerk.services`
   - **TTL**: `3600` (or default)
5. Click **Create records**

---

### STEP 4: Add Clerk Verification CNAME (2 min)

Add the Clerk verification record to **mosc-temp.com's hosted zone**.

**IMPORTANT**: Clerk Dashboard will show you the exact CNAME values. Common formats:
- **Frontend API**: `clerk.www.mosc-temp.com` → `frontend-api.clerk.services`
- **Verification**: `_clerk.www.mosc-temp.com` → `verify.clerk.services`

Use the **exact values** shown in your Clerk Dashboard.

#### Option A: Using PowerShell with JSON File (Recommended)

This method works reliably with PowerShell's JSON handling:

```powershell
# Step 1: Create JSON file with CNAME configuration
# Replace values with EXACT values from Clerk Dashboard
@'
{
  "Comment": "Add Clerk CNAME for satellite domain",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "clerk.www.mosc-temp.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "frontend-api.clerk.services"}]
    }
  }]
}
'@ | Set-Content -NoNewline -Path .\clerk-cname.json

# Step 2: Apply the CNAME record to Route53
# Replace Z07785143III9YRMM9SJG with your mosc-temp.com hosted zone ID
aws route53 change-resource-record-sets --hosted-zone-id Z07785143III9YRMM9SJG --change-batch file://clerk-cname.json

# Step 3: Verify the record was created
aws route53 list-resource-record-sets --hosted-zone-id Z07785143III9YRMM9SJG --query "ResourceRecordSets[?Name=='clerk.www.mosc-temp.com.']"
```

**Example for your setup**:
```powershell
# Your actual values (from Clerk Dashboard screenshot):
# Name: clerk.www.mosc-temp.com
# Value: frontend-api.clerk.services
# Zone ID: Z07785143III9YRMM9SJG

@'
{
  "Comment": "Add Clerk CNAME",
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "clerk.www.mosc-temp.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "frontend-api.clerk.services"}]
    }
  }]
}
'@ | Set-Content -NoNewline -Path .\clerk-cname.json

aws route53 change-resource-record-sets --hosted-zone-id Z07785143III9YRMM9SJG --change-batch file://clerk-cname.json
```

#### Option B: Using PowerShell Script

```powershell
powershell -ExecutionPolicy Bypass -File "scripts\add-clerk-verification-mosc-temp.ps1"
```

The script will prompt you for:
- mosc-temp.com hosted zone ID: `Z07785143III9YRMM9SJG`
- CNAME name: `clerk.www.mosc-temp.com`
- CNAME value: `frontend-api.clerk.services`

**Note**: If the script fails with JSON parsing errors, use Option A instead.

#### Verify DNS Record Created

After adding the CNAME, verify it was created:

```powershell
# Check via AWS CLI
aws route53 list-resource-record-sets --hosted-zone-id Z07785143III9YRMM9SJG --query "ResourceRecordSets[?Name=='clerk.www.mosc-temp.com.']"

# Check via nslookup (wait 2-5 minutes for propagation)
nslookup clerk.www.mosc-temp.com
```

Expected result from nslookup:
```
Name:    frontend-api.clerk.services
Addresses:  [IP addresses]
Aliases:  clerk.www.mosc-temp.com
```

---

### STEP 5: Verify Satellite Domain in Clerk (2-10 min)

1. Go back to Clerk Dashboard → Satellite domains
2. Find `www.mosc-temp.com` in the list
3. Click "Verify domain" button
4. Wait 2-10 minutes for verification
5. Status should change to: ✅ **Verified** (green checkmark)

**If verification fails**:
- Wait longer (DNS can take time)
- Double-check CNAME values match exactly
- Try "Verify configuration" button again after 5 minutes
- Verify DNS propagation: `nslookup clerk.www.mcefee-temp.com`

**DNS Verification Checklist:**
- [ ] CNAME record exists in Route 53: `clerk.www.mcefee-temp.com` → `frontend-api.clerk.services`
- [ ] DNS propagated (wait 5-60 minutes)
- [ ] `nslookup clerk.www.mcefee-temp.com` returns `frontend-api.clerk.services`
- [ ] Clerk Dashboard shows "Verified" status (green checkmark)

---

## Code Changes Required for Satellite Domain Setup

### Overview: What Code Needs to Change

When setting up a primary and satellite domain pair, you need to update **code in both projects** (not just environment variables). This section documents all code locations that must be modified.

### Primary Domain Project (event-site-manager)

**Location**: `E:\project_workspace\event-site-manager`

#### 1. `src/app/layout.tsx` - Allow Redirects from Satellite

**Purpose**: Allows the primary domain to accept redirects from satellite domains after authentication.

**Current Code** (example from adwiise.com setup):
```typescript
// Primary domain configuration - allow redirects from satellite domains
const clerkProps = {
  allowedRedirectOrigins: ['https://www.mosc-temp.com'],
};
```

**Required Change** for event-site-manager.com + mcefee-temp.com:
```typescript
// Primary domain configuration - allow redirects from satellite domains
const clerkProps = {
  allowedRedirectOrigins: ['https://www.mcefee-temp.com'],
};
```

**File Path**: `src/app/layout.tsx`
**Line**: ~67-69

---

#### 2. `src/middleware.ts` - CORS Headers for Clerk Proxy Routes

**Purpose**: Enables CORS for `/__clerk` proxy requests from satellite domains.

**Current Code** (example from adwiise.com setup):
```typescript
afterAuth(auth, req) {
  // Add CORS headers for Clerk proxy requests from satellite domains
  if (req.nextUrl.pathname.startsWith('/__clerk')) {
    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      response.headers.set('Access-Control-Allow-Origin', 'https://www.mosc-temp.com');
      // ... other CORS headers
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', 'https://www.mosc-temp.com');
    // ... other CORS headers
    return response;
  }
  // ...
}
```

**Required Change** for event-site-manager.com + mcefee-temp.com:
```typescript
afterAuth(auth, req) {
  // Add CORS headers for Clerk proxy requests from satellite domains
  if (req.nextUrl.pathname.startsWith('/__clerk')) {
    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      response.headers.set('Access-Control-Allow-Origin', 'https://www.mcefee-temp.com');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', 'https://www.mcefee-temp.com');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
  // ...
}
```

**File Path**: `src/middleware.ts`
**Lines**: ~65, ~74

---

#### 3. `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Handle redirect_url Parameter

**Purpose**: Allows primary domain to redirect back to satellite after successful authentication.

**Required Code**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [isPrimaryDomain, setIsPrimaryDomain] = useState(false);

  // Get redirect_url from query parameters (for satellite domain redirects)
  const redirectUrl = searchParams?.get('redirect_url') || '/';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        setIsLocalhost(true);
        return;
      }

      // Check if we're on primary domain
      if (hostname.includes('event-site-manager.com')) {
        setIsPrimaryDomain(true);
      }
    }
  }, []);

  // On primary domain, handle redirect URL
  if (isPrimaryDomain || isLocalhost) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 py-2">
        <h1 className="text-4xl font-bold">Welcome Back</h1>
        <SignIn redirectUrl={redirectUrl} />
      </main>
    );
  }

  return null;
}
```

**File Path**: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

**Critical Notes**:
- Primary domain MUST read `redirect_url` from query string
- Pass `redirectUrl` prop to `<SignIn>` component
- This allows Clerk to redirect back to satellite after authentication
- Without this, users get stuck on primary domain after sign-in

---

#### 4. `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Handle redirect_url Parameter

**Purpose**: Allows primary domain to redirect back to satellite after successful registration.

**Required Code**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [isPrimaryDomain, setIsPrimaryDomain] = useState(false);

  // Get redirect_url from query parameters (for satellite domain redirects)
  const redirectUrl = searchParams?.get('redirect_url') || '/';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        setIsLocalhost(true);
        return;
      }

      // Check if we're on primary domain
      if (hostname.includes('event-site-manager.com')) {
        setIsPrimaryDomain(true);
      }
    }
  }, []);

  // On primary domain, handle redirect URL
  if (isPrimaryDomain || isLocalhost) {
    return (
      <main className="flex flex-col items-center justify-center flex-1 py-2">
        <h1 className="text-4xl font-bold">Create Your Account</h1>
        <SignUp redirectUrl={redirectUrl} afterSignUpUrl={redirectUrl} />
      </main>
    );
  }

  return null;
}
```

**File Path**: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

**Critical Notes**:
- Primary domain MUST read `redirect_url` from query string
- Pass both `redirectUrl` and `afterSignUpUrl` props to `<SignUp>` component
- This allows Clerk to redirect back to satellite after registration
- Without this, users get stuck on primary domain after sign-up

---

#### 5. `src/app/auth/signout-redirect/page.tsx` - Handle Satellite Sign-Out (NEW FILE)

**Purpose**: Handles sign-out for satellite domains by clearing Clerk cookies on primary domain.

**Required Code**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignOutRedirect() {
  const { signOut } = useClerk();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const performSignOut = async () => {
      try {
        console.log('[SignOut Redirect] Starting sign-out process...');

        // Get redirect URL from query params
        const redirectUrl = searchParams.get('redirect_url') || '/';
        console.log('[SignOut Redirect] Redirect URL:', redirectUrl);

        // Validate redirect URL (security check)
        if (redirectUrl && !redirectUrl.startsWith('http')) {
          // Relative URL, use as-is
        } else if (redirectUrl) {
          // Absolute URL - validate it's one of our domains
          const allowedDomains = ['mcefee-temp.com', 'event-site-manager.com'];
          const url = new URL(redirectUrl);
          const isAllowed = allowedDomains.some(domain => url.hostname.includes(domain));

          if (!isAllowed) {
            console.error('[SignOut Redirect] Invalid redirect URL:', redirectUrl);
            setError('Invalid redirect URL');
            setStatus('error');
            return;
          }
        }

        console.log('[SignOut Redirect] Calling Clerk signOut...');

        // Sign out - CRITICAL: Pass redirectUrl as undefined to prevent Clerk from auto-redirecting
        await signOut({ redirectUrl: undefined });

        console.log('[SignOut Redirect] Sign out complete, manually redirecting to:', redirectUrl);

        // Add a flag to indicate sign-out was successful
        const separator = redirectUrl.includes('?') ? '&' : '?';
        const redirectWithFlag = `${redirectUrl}${separator}clerk_signout=true`;

        // Add a small delay to ensure sign-out completed
        await new Promise(resolve => setTimeout(resolve, 500));

        // Manually redirect after sign out completes
        window.location.href = redirectWithFlag;
      } catch (err) {
        console.error('[SignOut Redirect] Error during sign-out:', err);
        setError(String(err));
        setStatus('error');

        // Even on error, try to redirect after a delay
        const redirectUrl = searchParams.get('redirect_url') || '/';
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      }
    };

    performSignOut();
  }, [signOut, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Signing out...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we sign you out.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Sign out error
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error || 'An error occurred while signing out.'}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting back in a moment...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**File Path**: `src/app/auth/signout-redirect/page.tsx` (create new file)

**Critical Notes**:
- This page MUST be created on PRIMARY domain
- Validates redirect URL for security
- Calls Clerk `signOut()` with `redirectUrl: undefined` to prevent auto-redirect
- Manually redirects back to satellite with `clerk_signout=true` flag
- Satellite detects flag and clears local storage

---

#### 6. `src/middleware.ts` - Add Sign-Out Page to Public Routes

**Purpose**: Allows unauthenticated access to sign-out redirect page.

**Required Change**:
```typescript
export default authMiddleware({
  publicRoutes: [
    "/",
    "/auth/signout-redirect",  // ← Add this line
    // ... other routes
  ],
  // ...
});
```

**File Path**: `src/middleware.ts`
**Line**: Add to publicRoutes array

---

### Satellite Domain Project (mcefee-temp)

**Location**: `E:\project_workspace\mcefee-temp`

#### 1. `src/app/layout.tsx` - Satellite Configuration

**Purpose**: Configures Clerk to operate in satellite mode, redirecting authentication to the primary domain.

**Current Code** (example from mosc-temp.com setup):
```typescript
// Satellite domain configuration for multi-domain support
// Primary domain: www.adwiise.com
// Satellite domains: www.mosc-temp.com (and future tenant domains)
const headersList = await headers();
const hostname = headersList.get('host') || '';
const isProd = process.env.NODE_ENV === 'production';

// Detect if this is a satellite domain (only in production)
const isSatellite = isProd && hostname.includes('mosc-temp.com');

const clerkProps = isSatellite
  ? {
      isSatellite: true,
      domain: 'mosc-temp.com', // Bare domain without www (required by Clerk)
      signInUrl: 'https://www.adwiise.com/sign-in',
      signUpUrl: 'https://www.adwiise.com/sign-up',
    }
  : {
      // Primary domain allows redirects from satellites (or default config for localhost)
      allowedRedirectOrigins: isProd ? ['https://www.mosc-temp.com'] : [],
    };
```

**Required Change** for event-site-manager.com + mcefee-temp.com:
```typescript
// Satellite domain configuration for multi-domain support
// Primary domain: www.event-site-manager.com
// Satellite domains: www.mcefee-temp.com (and future tenant domains)
const headersList = await headers();
const hostname = headersList.get('host') || '';

// Detect if this is a satellite domain
const isSatellite = hostname.includes('mcefee-temp.com');

const clerkProps = isSatellite
  ? {
      isSatellite: true,
      domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'www.mcefee-temp.com', // Use env var to match DNS
      signInUrl: 'https://www.event-site-manager.com/sign-in',
      signUpUrl: 'https://www.event-site-manager.com/sign-up',
    }
  : {
      // Primary domain allows redirects from satellites
      allowedRedirectOrigins: ['https://www.mcefee-temp.com'],
    };
```

**File Path**: `src/app/layout.tsx`
**Lines**: ~31-45

**Critical Notes**:
- `domain` **MUST use environment variable** `process.env.NEXT_PUBLIC_CLERK_DOMAIN` to match DNS configuration
- DNS record is `clerk.www.mcefee-temp.com` so domain must be `www.mcefee-temp.com` (with www)
- `.env.production` must have: `NEXT_PUBLIC_CLERK_DOMAIN=www.mcefee-temp.com`
- `signInUrl` and `signUpUrl` must be **full URLs** with `www`: `https://www.event-site-manager.com/...`
- `allowedRedirectOrigins` must use **full URL** with `www`: `https://www.mcefee-temp.com`
- **IMPORTANT**: Removed `isProd` check - satellite detection works in all environments

---

#### 2. `src/middleware.ts` - Satellite Detection Logic

**Purpose**: Detects satellite domain in production and applies satellite configuration to middleware.

**Current Code** (example from mosc-temp.com setup):
```typescript
const isProd = process.env.NODE_ENV === 'production';
const isSatEnv = isProd && (
  process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' ||
  process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com') ||
  false
);
const satDomain = isProd
  ? (process.env.NEXT_PUBLIC_CLERK_DOMAIN || (process.env.NEXT_PUBLIC_APP_URL?.includes('mosc-temp.com') ? 'mosc-temp.com' : undefined))
  : undefined;
```

**Required Change** for event-site-manager.com + mcefee-temp.com:
```typescript
const isSatEnv = process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' ||
                  process.env.NEXT_PUBLIC_APP_URL?.includes('mcefee-temp.com') ||
                  false;
const satDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN ||
                  (process.env.NEXT_PUBLIC_APP_URL?.includes('mcefee-temp.com') ? 'www.mcefee-temp.com' : undefined);
```

**File Path**: `src/middleware.ts`
**Lines**: ~14-15

**Critical Notes**:
- Fallback domain must use `www.mcefee-temp.com` (with www) to match DNS record
- Environment variable takes precedence: `NEXT_PUBLIC_CLERK_DOMAIN` from `.env.production`
- **IMPORTANT**: Removed `isProd` check - works in all environments

---

#### 3. `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Redirect Logic

**Purpose**: Client-side redirect to primary domain if user is on satellite domain.

**Current Code** (example from mosc-temp.com setup):
```typescript
// If on satellite domain, redirect to primary domain with return URL
if (hostname.includes('mosc-temp.com')) {
  setShouldRedirect(true);
  const currentUrl = window.location.origin;
  const redirectUrl = `https://www.adwiise.com/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`;
  window.location.href = redirectUrl;
}
```

**Required Change** for event-site-manager.com + mcefee-temp.com:
```typescript
// If on satellite domain, redirect to primary domain with return URL
if (hostname.includes('mcefee-temp.com')) {
  setShouldRedirect(true);
  const currentUrl = window.location.origin;
  const redirectUrl = `https://www.event-site-manager.com/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`;
  window.location.href = redirectUrl;
}
```

**File Path**: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
**Line**: ~35

---

#### 4. `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Redirect Logic

**Purpose**: Client-side redirect to primary domain if user is on satellite domain.

**Current Code** (example from mosc-temp.com setup):
```typescript
// If on satellite domain, redirect to primary domain with return URL
if (hostname.includes('mosc-temp.com')) {
  setShouldRedirect(true);
  const currentUrl = window.location.origin;
  const redirectUrl = `https://www.adwiise.com/sign-up?redirect_url=${encodeURIComponent(currentUrl)}`;
  window.location.href = redirectUrl;
}
```

**Required Change** for event-site-manager.com + mcefee-temp.com:
```typescript
// If on satellite domain, redirect to primary domain with return URL
if (hostname.includes('mcefee-temp.com')) {
  setShouldRedirect(true);
  const currentUrl = window.location.origin;
  const redirectUrl = `https://www.event-site-manager.com/sign-up?redirect_url=${encodeURIComponent(currentUrl)}`;
  window.location.href = redirectUrl;
}
```

**File Path**: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
**Line**: ~26

---

#### 5. `src/components/Header.tsx` - Sign-Out Button and Flag Detection

**Purpose**: Implements cross-domain sign-out flow with flag detection.

**Required Changes**:

1. **Add flag detection useEffect** (runs immediately on mount):
```typescript
// CRITICAL: Check for sign-out flag IMMEDIATELY on mount, before Clerk loads
useEffect(() => {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const clerkSignedOut = urlParams.get('clerk_signout');

  if (clerkSignedOut === 'true') {
    console.log('[Header] Detected clerk_signout=true flag');

    // Clear all Clerk-related items from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('clerk') || key.includes('__clerk')) {
        localStorage.removeItem(key);
      }
    });

    // Remove flag from URL and reload
    urlParams.delete('clerk_signout');
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.location.replace(newUrl);
  }
}, []);
```

2. **Update handleSignOut function** to redirect to primary:
```typescript
const handleSignOut = async () => {
  console.log('[Header] Sign out button clicked');
  setIsSigningOut(true);

  // Broadcast sign-out to other tabs
  localStorage.setItem('clerk_signout_broadcast', Date.now().toString());

  // For satellite domains, redirect to primary domain's sign-out URL
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isSatellite = hostname.includes('mcefee-temp.com');

  if (isSatellite) {
    console.log('[Header] Satellite domain detected, redirecting to primary domain sign-out...');

    // Redirect to primary domain's dedicated sign-out page
    const primarySignOutUrl = 'https://www.event-site-manager.com/auth/signout-redirect';
    const returnUrl = encodeURIComponent(window.location.origin);

    window.location.href = `${primarySignOutUrl}?redirect_url=${returnUrl}`;
    return;
  }

  // Primary domain: normal sign out
  try {
    await signOut();
    window.location.href = '/';
  } catch (error) {
    console.error('[Header] Error signing out:', error);
    setIsSigningOut(false);
  }
};
```

**File Path**: `src/components/Header.tsx`

**Critical Notes**:
- Flag detection MUST run immediately on mount (before Clerk loads)
- Clear ALL Clerk-related localStorage items (prevents stale auth state)
- Satellite sign-out redirects to primary domain
- Primary domain returns with `clerk_signout=true` flag
- Flag triggers localStorage cleanup and page reload

---

#### 6. `src/app/__clerk/[...path]/route.ts` - Proxy Frontend API (CRITICAL)

**Purpose**: Proxies Clerk Frontend API requests to the primary domain. **This file MUST be updated when cloning from another satellite project!**

**Current Code** (example from old project like mosc-temp):
```typescript
/**
 * Primary Clerk domain for Frontend API
 */
const CLERK_FRONTEND_API = 'https://clerk.adwiise.com';  // ← OLD DOMAIN!
```

**Required Change** for event-site-manager.com + md-strikers.com:
```typescript
/**
 * Primary Clerk domain for Frontend API
 */
const CLERK_FRONTEND_API = 'https://clerk.event-site-manager.com';  // ← NEW PRIMARY DOMAIN!
```

**File Path**: `src/app/__clerk/[...path]/route.ts`
**Line**: ~18

**⚠️ CRITICAL**:
- This file is often overlooked when copying from another satellite project
- If left unchanged, Clerk SDK will try to load from wrong domain
- Results in `net::ERR_NAME_NOT_RESOLVED` errors
- Authentication will not work at all

---

#### 7. `next.config.mjs` - Clerk Proxy Rewrite Destination (CRITICAL)

**Purpose**: Configures Next.js rewrites to proxy `/__clerk` requests to the primary domain's Clerk Frontend API.

**Current Code** (example from old project like mcefee-temp):
```typescript
// Configure rewrites for Clerk proxy (satellite domain support)
async rewrites() {
  return [
    {
      source: '/__clerk/:path*',
      destination: 'https://clerk.adwiise.com/:path*',  // ← OLD PRIMARY DOMAIN!
    },
  ];
},
```

**Required Change** for event-site-manager.com + md-strikers.com:
```typescript
// Configure rewrites for Clerk proxy (satellite domain support)
async rewrites() {
  return [
    {
      source: '/__clerk/:path*',
      destination: 'https://clerk.event-site-manager.com/:path*',  // ← NEW PRIMARY DOMAIN!
    },
  ];
},
```

**File Path**: `next.config.mjs`
**Lines**: ~50-58

**⚠️ CRITICAL**:
- This is one of the MOST COMMONLY MISSED updates when cloning projects
- If left unchanged, Clerk API requests will fail
- Results in authentication errors even after DNS is correct
- Can cause 404 errors if primary domain doesn't exist

---

### Summary Checklist: Code Changes for New Domain Pair

⚠️ **CRITICAL**: All these changes MUST be made. Missing even ONE will cause authentication failures!

**For Primary Domain Project (event-site-manager):**

- [ ] **`src/app/layout.tsx`**: Update `allowedRedirectOrigins` to include `'https://www.md-strikers.com'`
- [ ] **`src/middleware.ts`**:
  - [ ] Update CORS `Access-Control-Allow-Origin` headers to `'https://www.md-strikers.com'` (2 locations)
  - [ ] Add `/auth/signout-redirect` to `publicRoutes` array
- [ ] **`src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`**: Add `redirect_url` parameter handling (read from query string and pass to SignIn component)
- [ ] **`src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`**: Add `redirect_url` parameter handling (read from query string and pass to SignUp component)
- [ ] **`src/app/auth/signout-redirect/page.tsx`**: Create new file to handle satellite sign-out (calls Clerk signOut and redirects back with flag)

**For Satellite Domain Project (md-strikers):**

- [ ] **`src/app/layout.tsx`** (4-5 changes):
  - [ ] Update comment: Primary domain to `www.event-site-manager.com`
  - [ ] Update satellite domain comment: `www.md-strikers.com`
  - [ ] Update `isSatellite` detection: `hostname.includes('md-strikers.com')`
  - [ ] Update `domain`: `process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'www.md-strikers.com'`
  - [ ] Update `signInUrl`: `'https://www.event-site-manager.com/sign-in'`
  - [ ] Update `signUpUrl`: `'https://www.event-site-manager.com/sign-up'`
  - [ ] Update `allowedRedirectOrigins`: `['https://www.md-strikers.com']`

- [ ] **`src/middleware.ts`** (3 changes):
  - [ ] Update `isSatEnv` detection: `includes('md-strikers.com')`
  - [ ] Update `satDomain` fallback: `'www.md-strikers.com'` (match DNS format)
  - [ ] Update `signInUrl`: `'https://www.event-site-manager.com/sign-in'`

- [ ] **`src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`** (2 changes):
  - [ ] Update redirect check: `hostname.includes('md-strikers.com')`
  - [ ] Update redirect URL: `'https://www.event-site-manager.com/sign-in'`

- [ ] **`src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`** (2 changes):
  - [ ] Update redirect check: `hostname.includes('md-strikers.com')`
  - [ ] Update redirect URL: `'https://www.event-site-manager.com/sign-up'`

- [ ] **`src/components/Header.tsx`** (2 changes):
  - [ ] Add flag detection useEffect (checks for `clerk_signout=true` and clears localStorage)
  - [ ] Update `isSatellite` check: `hostname.includes('md-strikers.com')`
  - [ ] Update sign-out redirect URL: `'https://www.event-site-manager.com/auth/signout-redirect'`

- [ ] **⚠️ `src/app/__clerk/[...path]/route.ts`** (CRITICAL - Often Missed!):
  - [ ] Update `CLERK_FRONTEND_API` constant to `'https://clerk.event-site-manager.com'`

- [ ] **⚠️ `next.config.mjs`** (CRITICAL - Often Missed!):
  - [ ] Update `rewrites()` destination to `'https://clerk.event-site-manager.com/:path*'`

---

### Quick Search & Replace Reference

When cloning from an old satellite project (like mcefee-temp) to create a new one (like md-strikers), use these find/replace operations:

**Find:**
- `mcefee-temp.com` or `mosc-temp.com` (old satellite domain)
- `adwiise.com` (old primary domain)
- `clerk.adwiise.com` (old Clerk frontend API)

**Replace with:**
- `md-strikers.com` (new satellite domain)
- `event-site-manager.com` (new primary domain)
- `clerk.event-site-manager.com` (new Clerk frontend API)

**⚠️ IMPORTANT**:
- Search in source code files only (exclude `node_modules`, `documentation`, `.next`)
- Manually review each match before replacing
- Some occurrences may be in comments or examples - use judgment

---

### Important Domain Format Rules

| Property | Format | Example | Notes |
|----------|--------|---------|-------|
| `domain` (ClerkProvider) | **From env var** | `process.env.NEXT_PUBLIC_CLERK_DOMAIN` or `'www.mcefee-temp.com'` | MUST match DNS record (`clerk.${domain}`) |
| `.env.production` | **Match DNS** | `NEXT_PUBLIC_CLERK_DOMAIN=www.mcefee-temp.com` | If DNS is `clerk.www.*` use `www.*` |
| `signInUrl` / `signUpUrl` | **Full URL** | `https://www.event-site-manager.com/sign-in` | WITH www |
| `allowedRedirectOrigins` | **Full URL** | `https://www.mcefee-temp.com` | WITH www |
| `hostname.includes()` check | **Any part** | `hostname.includes('mcefee-temp.com')` | Works with or without www |
| CORS headers | **Full URL** | `'https://www.mcefee-temp.com'` | WITH www |

**CRITICAL**: The `domain` value determines Clerk SDK loading URL: `clerk.${domain}`. Your DNS record MUST match this pattern exactly. Always use environment variable as source of truth.

---

### STEP 6: Configure Primary App to Allow Satellite (3 min)

Update the **www.event-site-manager.com** app's layout.tsx to allow redirects from satellite.

**In www.event-site-manager.com repo** (Amplify App #1), ensure `src/app/layout.tsx` has:

```typescript
// Primary domain configuration
const clerkProps = {
  allowedRedirectOrigins: ['https://www.mosc-temp.com'],  // ← Add satellite domain
};

return (
  <ClerkProvider
    publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    {...clerkProps}
  >
    {/* ... rest of app */}
  </ClerkProvider>
);
```

**Commit and push** to deploy the change.

---

### STEP 7: Configure Satellite App with isSatellite (3 min)

Update the **www.mosc-temp.com** app's layout.tsx for satellite mode.

**In www.mosc-temp.com repo** (Amplify App #2), ensure `src/app/layout.tsx` has:

```typescript
// Satellite domain configuration
const clerkProps = {
  isSatellite: true,
  domain: 'www.mosc-temp.com',
  signInUrl: 'https://www.adwiise.com/sign-in',
  signUpUrl: 'https://www.adwiise.com/sign-up',
};

return (
  <ClerkProvider
    publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    telemetry={false}
    {...clerkProps}
  >
    {/* ... rest of app */}
  </ClerkProvider>
);
```

**Commit and push** to deploy the change.

**IMPORTANT**: The `domain` prop should only be added AFTER the satellite domain is verified in Clerk Dashboard (STEP 5 complete).

---

### STEP 8: Update Google OAuth (3 min)

Add `www.mosc-temp.com` to your Google OAuth configuration.

1. **Go to Google Cloud Console**:
   - URL: https://console.cloud.google.com/apis/credentials
   - Select OAuth 2.0 Client ID: `303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m`

2. **Add to Authorized JavaScript origins**:
   ```
   https://www.mosc-temp.com
   ```

3. **Add to Authorized redirect URIs**:
   ```
   https://www.mosc-temp.com/sso-callback
   ```

4. **Click "Save"**

**Note**: You do NOT need to add mosc-temp.com to the actual OAuth flow URLs - all OAuth still happens on `www.adwiise.com`. This is just for CORS/redirect validation.

---

### STEP 9: Wait for Amplify Deployments (5-10 min)

After pushing code changes to both repos, wait for Amplify to deploy.

**Check www.adwiise.com deployment** (Amplify App #1):
1. Go to AWS Amplify Console → Select App #1
2. Check recent builds
3. Wait for "Deployment completed successfully"

**Check www.mosc-temp.com deployment** (Amplify App #2):
1. Go to AWS Amplify Console → Select App #2
2. Check recent builds
3. Wait for "Deployment completed successfully"

**Note**: These are **separate deployments** from separate repos.

---

### STEP 10: Test Authentication Flow (5 min)

#### Test on www.mosc-temp.com

1. **Visit**: `https://www.mosc-temp.com`

2. **Click "Sign in"**

3. **Expected behavior**:
   - Browser redirects to `https://www.adwiise.com/sign-in`
   - You see Clerk sign-in page on adwiise.com domain
   - URL bar shows: `www.adwiise.com`

4. **Sign in** (use email or Google OAuth)

5. **Expected after sign-in**:
   - Browser redirects back to `https://www.mosc-temp.com`
   - You are now signed in on mosc-temp.com
   - URL bar shows: `www.mosc-temp.com`

6. **Verify session**:
   - Navigate to different pages on www.mosc-temp.com
   - Session should persist
   - You should remain signed in

#### Test OAuth Flow

1. **Visit**: `https://www.mosc-temp.com`
2. **Click "Sign in with Google"**
3. **Expected**:
   - Redirects to `www.adwiise.com/sign-in`
   - Click "Sign in with Google" on adwiise.com
   - Google OAuth completes
   - Redirects back to `www.mosc-temp.com`
   - You are signed in with Google account

---

## Configuration Summary

### DNS Records

**mosc-temp.com hosted zone** (separate Route53 zone):
```
www.mosc-temp.com              CNAME  [Amplify App #2].amplifyapp.com
_clerk.www.mosc-temp.com       CNAME  verify.clerk.services (from Clerk Dashboard)
```

**adwiise.com hosted zone** (separate Route53 zone):
```
www.adwiise.com                CNAME  [Amplify App #1].amplifyapp.com
```

### AWS Amplify Configuration

**Amplify App #1** (www.adwiise.com):
- Repository: [Your primary repo]
- Branch: [Your primary branch]
- Domain: www.adwiise.com
- Environment Variables:
  ```bash
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***
  NEXT_PUBLIC_APP_URL=https://www.adwiise.com
  NEXT_PUBLIC_API_BASE_URL=https://event-site-manager-dev.com
  ```

**Amplify App #2** (www.mosc-temp.com):
- Repository: [Your satellite repo]
- Branch: [Your satellite branch]
- Domain: www.mosc-temp.com
- Environment Variables:
  ```bash
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***  # SAME key!
  NEXT_PUBLIC_APP_URL=https://www.mosc-temp.com
  NEXT_PUBLIC_API_BASE_URL=https://event-site-manager-dev.com
  AMPLIFY_API_JWT_USER=YOUR_JWT_USER
  AMPLIFY_API_JWT_PASS=YOUR_JWT_PASSWORD
  ```

### Clerk Configuration

**Clerk Instance**: `ins_***` (shared by both apps)

**Primary Domain** (`www.adwiise.com` - App #1):
```typescript
// layout.tsx in www.adwiise.com repo
const clerkProps = {
  allowedRedirectOrigins: ['https://www.mosc-temp.com'],
};
```
- Handles all authentication
- Users see Clerk UI here
- OAuth flows happen here

**Satellite Domain** (`www.mosc-temp.com` - App #2):
```typescript
// layout.tsx in www.mosc-temp.com repo
const clerkProps = {
  isSatellite: true,
  domain: 'www.mosc-temp.com',
  signInUrl: 'https://www.adwiise.com/sign-in',
  signUpUrl: 'https://www.adwiise.com/sign-up',
};
```
- Verified in Clerk Dashboard (DNS)
- Redirects to primary for auth
- Receives session via Clerk ticket exchange

### Google OAuth

**Client ID**: `303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m`

**Authorized JavaScript origins**:
- https://www.adwiise.com ✅ (existing)
- https://humble-monkey-3.clerk.accounts.dev ✅ (existing)
- http://localhost:3000 ✅ (existing)
- **https://www.mosc-temp.com** ← Added for mosc-temp.com

**Authorized redirect URIs**:
- https://clerk.adwiise.com/v1/oauth_callback ✅ (existing)
- https://humble-monkey-3.clerk.accounts.dev/v1/oauth_callback ✅ (existing)
- **https://www.mosc-temp.com/sso-callback** ← Added for mosc-temp.com

---

## Automated DNS Setup for Primary Clerk Domain

### Quick Setup: Batch Create All 5 Clerk CNAME Records

For setting up a **new primary domain** in Clerk (e.g., `event-site-manager.com`), you can use the automated PowerShell script to create all 5 required CNAME records in a single operation.

#### Prerequisites

- AWS CLI installed and configured (`aws configure`)
- Route 53 hosted zone exists for your domain
- Clerk Dashboard open to copy the mail instance ID

#### Step 1: Get Your Route 53 Hosted Zone ID

```powershell
# Find hosted zone ID for your domain
aws route53 list-hosted-zones --query "HostedZones[?Name=='event-site-manager.com.'].Id" --output text
```

Example output: `Z0123456789ABCDEFGHIJ`

#### Step 2: Get Clerk Mail Instance ID

1. Go to **Clerk Dashboard → Configure → Domains**
2. Look at the **Email section** CNAME records
3. Find the value like: `mail.ulg16gghuyou.clerk.services`
4. Extract the instance ID: `ulg16gghuyou`

#### Step 3: Run the Automated Script

```powershell
# Navigate to documentation folder
cd documentation\clerk_authentication

# Run the script with required parameters
.\Add-ClerkDnsRecords.ps1 `
  -Domain "event-site-manager.com" `
  -HostedZoneId "Z0123456789ABCDEFGHIJ" `
  -ClerkMailInstanceId "ulg16gghuyou"
```

#### What the Script Creates

The script automatically creates all 5 CNAME records required by Clerk:

1. **Frontend API**: `clerk.event-site-manager.com` → `frontend-api.clerk.services`
2. **Account Portal**: `accounts.event-site-manager.com` → `accounts.clerk.services`
3. **Email Service**: `clkmail.event-site-manager.com` → `mail.{instance-id}.clerk.services`
4. **Email DKIM #1**: `clk._domainkey.event-site-manager.com` → `dkim1.{instance-id}.clerk.services`
5. **Email DKIM #2**: `clk2._domainkey.event-site-manager.com` → `dkim2.{instance-id}.clerk.services`

#### Example: Complete Command

```powershell
.\Add-ClerkDnsRecords.ps1 `
  -Domain "event-site-manager.com" `
  -HostedZoneId "Z0478253VJVESPY8V1ZT" `
  -ClerkMailInstanceId "ulg16gghuyou" `
  -TTL 3600
```

#### After Running the Script

1. **Wait 5-60 minutes** for DNS propagation
2. Go to **Clerk Dashboard → Configure → Domains**
3. Click **"Verify"** for each domain section:
   - Frontend API
   - Account portal
   - Email
4. SSL certificates will be issued automatically after all 5 records are verified

#### Manual Alternative (If Script Not Available)

If you prefer to create records manually, see the reference example for `adwiise.com` in `aws-route53-list-resource-record-sets.txt`. You'll need to create each CNAME record individually in Route 53 Console or via AWS CLI.

#### Script Options

```powershell
# Help menu
.\Add-ClerkDnsRecords.ps1 -?

# If hosted zone ID not provided, script will search for it
.\Add-ClerkDnsRecords.ps1 -Domain "event-site-manager.com" -ClerkMailInstanceId "ulg16gghuyou"

# Custom TTL (default is 3600 seconds = 1 hour)
.\Add-ClerkDnsRecords.ps1 -Domain "event-site-manager.com" -HostedZoneId "Z..." -ClerkMailInstanceId "..." -TTL 7200
```

---

## Primary Domain Canonicalization and Setup Order

### Which host to use as the primary (production) domain?

- Use your canonical host with "www": **https://www.<your-domain>**.
- Keep the apex `<your-domain>` as an additional domain and 301-redirect it to `www`.
- Rationale: `www` is simpler operationally (CNAME-friendly, CDN edge patterns). Apex works with ALIAS/ANAME in Route 53, but choose one canonical and be consistent.

For example, if you set up a new pair like `event-site-manager.com` (primary) and `mcefee-temp.com` (satellite):
- Set Clerk production domain to: **https://www.event-site-manager.com**
- Configure `event-site-manager.com` (apex) to redirect → `https://www.event-site-manager.com`
- Add both `www.event-site-manager.com` and `event-site-manager.com` in Amplify domain settings (redirect apex → www)

### Recommended order of operations (fastest, safest)

1. Provision domain(s) and Route 53 hosted zone(s).
2. Deploy the app(s) in Amplify and attach both `www` and the apex; set apex → www redirect; verify HTTPS works.
3. In Clerk, set the production domain to `https://www.<primary-domain>`; add the apex as an additional domain. Verify DNS and deploy certs.
4. Add the satellite domain(s) (and optional `www` variant) in Clerk; verify and deploy certs.
5. Update environment variables (note: changing the production domain rotates the Clerk publishable key) and redeploy apps.

### TL;DR

- Canonicalize to `https://www.<primary-domain>`; apex redirects to `www`.
- Set up Amplify + HTTPS first, then configure Clerk domains and certs.
- Satellites point sign-in/sign-up URLs to the primary's routes.

---

## Serving Frontend (Amplify) and Backend API (ALB) on one domain

Goal: `https://www.<primary-domain>` serves the Next.js frontend, while `https://www.<primary-domain>/api/*` forwards to an ALB (ECS/Fargate).

### What Amplify can/can't do directly

- Amplify-managed hosting (its default CloudFront) does not expose multi-origin routing for external backends. "Rewrites & redirects" can proxy simple cases but is not ideal for a production API.

### Recommended patterns

- Preferred (simplest): use a subdomain for APIs
  - `https://api.<primary-domain>` → ALB (Target Group for ECS/Fargate)
  - `https://www.<primary-domain>` → Amplify (frontend)
  - Clean separation, easy TLS, straightforward DNS

- Single host with path-based routing (advanced): use your own CloudFront distribution
  - Create a CloudFront distribution with two origins:
    - Origin A: the Amplify app’s CloudFront domain (frontend)
    - Origin B: the ALB (backend)
  - Behaviors:
    - `/api/*` → Origin B (ALB)
    - `/*` → Origin A (Amplify)
  - Attach the alternate domain name(s) (`www.<primary-domain>`) and ACM cert (in us-east-1)
  - Point Route 53 A/AAAA (ALIAS) to this CloudFront distribution
  - Remove the custom domain from Amplify’s built-in domain management (Amplify becomes just an origin)

Notes:
- If you later move to this multi-origin CloudFront model, update Clerk/redirects to continue using the same canonical host.
- Keep health checks, caching headers, and timeouts appropriate for API traffic on the ALB origin.

---

## Key Differences from preview.adwiise.com Setup

| Aspect | preview.adwiise.com | www.mosc-temp.com |
|--------|---------------------|-------------------|
| Domain relation | Subdomain of adwiise.com | Completely different domain |
| Cookie sharing | Shares `.adwiise.com` cookies | NO cookie sharing (different domains) |
| DNS zone | adwiise.com hosted zone | mosc-temp.com hosted zone (separate) |
| Satellite config | Required | Required |
| Session transfer | Via Clerk redirect | Via Clerk redirect |
| Complexity | Simpler (same parent domain) | More complex (different domains) |

---

## Troubleshooting

### DNS Not Resolving

**Issue**: `nslookup www.mosc-temp.com` returns error

**Fix**:
1. Verify you added CNAME to **mosc-temp.com** hosted zone (not adwiise.com)
2. Check Zone ID is correct for mosc-temp.com
3. Wait longer (DNS can take up to 48 hours)
4. Try: `nslookup www.mosc-temp.com 8.8.8.8` (use Google DNS)

### Amplify Domain Not Verifying

**Issue**: Amplify shows "Verifying" for > 1 hour for www.mosc-temp.com

**Fix**:
1. Check DNS propagation: https://dnschecker.org/?domain=www.mosc-temp.com
2. Verify CNAME points to correct Amplify URL
3. Make sure you own mosc-temp.com domain
4. Delete and re-add domain in Amplify if stuck

### Clerk Verification Fails

**Issue**: Clerk says "Unable to verify www.mosc-temp.com"

**Fix**:
1. Verify `_clerk.www.mosc-temp.com` CNAME exists in mosc-temp.com zone
2. Check CNAME value matches Clerk Dashboard exactly
3. Wait 10 minutes and click "Verify" again
4. Check for typos in domain name

### Clerk SDK Fails to Load (ERR_NAME_NOT_RESOLVED)

**Issue**: Browser console shows error:
```
GET https://clerk.mcefee-temp.com/npm/@clerk/clerk-js@4/dist/clerk.browser.js net::ERR_NAME_NOT_RESOLVED
```

**Root Cause**: Mismatch between Clerk domain configuration in code and DNS records.

**Symptoms**:
- Sign-out button doesn't work
- Authentication functions fail
- Clerk hooks return null or undefined

**Fix**:

1. **Check DNS record** - verify which format exists:
   ```powershell
   # Check if bare domain DNS exists
   nslookup clerk.mcefee-temp.com

   # Check if www domain DNS exists
   nslookup clerk.www.mcefee-temp.com
   ```

2. **Match code to DNS**:
   - If DNS is `clerk.www.mcefee-temp.com`:
     - `.env.production`: `NEXT_PUBLIC_CLERK_DOMAIN=www.mcefee-temp.com`
     - `layout.tsx`: `domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'www.mcefee-temp.com'`
     - `middleware.ts` fallback: `'www.mcefee-temp.com'`

   - If DNS is `clerk.mcefee-temp.com`:
     - `.env.production`: `NEXT_PUBLIC_CLERK_DOMAIN=mcefee-temp.com`
     - `layout.tsx`: `domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN || 'mcefee-temp.com'`
     - `middleware.ts` fallback: `'mcefee-temp.com'`

3. **Redeploy** after making changes

**Important**:
- Clerk domain in code determines SDK loading URL: `clerk.${domain}`
- DNS record MUST match this exact pattern
- Environment variable should be source of truth - use it in both layout.tsx and middleware.ts
- Do NOT hardcode domain values - always read from `process.env.NEXT_PUBLIC_CLERK_DOMAIN`

### Redirect Loop

**Issue**: Keeps redirecting between mosc-temp.com and adwiise.com

**Fix**:
1. Clear all browser cookies for both domains
2. Try in incognito window
3. Verify Amplify deployment completed
4. Check browser console for JavaScript errors

### OAuth Still Fails

**Issue**: OAuth returns error even after setup

**Fix**:
1. Verify satellite domain shows "Verified" in Clerk Dashboard
2. Check Google OAuth includes www.mosc-temp.com in authorized origins
3. Make sure `allowedRedirectOrigins` includes mosc-temp.com in layout.tsx
4. Clear browser cache and cookies
5. Try different browser

### "Not Authorized" Error

**Issue**: Error after OAuth callback

**Fix**:
1. Verify www.mosc-temp.com is in Clerk allowed origins (via API or Dashboard)
2. Check that both domains use same Clerk publishable key
3. Verify satellite domain is verified (not just added)

### Sign-Out Not Working on Satellite

**Issue**: Sign-out button clicked but user remains signed in

**Symptoms**:
- User appears signed out but returns after refresh
- `handleSignOut` function not being called
- Clerk SDK fails to load

**Fix**:

1. **Check if Clerk SDK loads** (see "Clerk SDK Fails to Load" above)
   - Verify DNS matches code configuration
   - Check browser console for loading errors

2. **Verify sign-out redirect page exists on primary**:
   - File: `src/app/auth/signout-redirect/page.tsx`
   - Added to public routes in middleware

3. **Verify Header.tsx has sign-out redirect code**:
   ```typescript
   const isSatellite = hostname.includes('mcefee-temp.com');
   if (isSatellite) {
     window.location.href = `https://www.event-site-manager.com/auth/signout-redirect?redirect_url=${returnUrl}`;
     return;
   }
   ```

4. **Verify Header.tsx has flag detection**:
   ```typescript
   useEffect(() => {
     const clerkSignedOut = urlParams.get('clerk_signout');
     if (clerkSignedOut === 'true') {
       // Clear localStorage and reload
     }
   }, []);
   ```

5. **Check browser console logs**:
   - Should see: `[Header] Sign out button clicked`
   - Should see: `[Header] Satellite domain detected, redirecting...`
   - Should see: `[SignOut Redirect] Starting sign-out process...`
   - Should see: `[Header] Detected clerk_signout=true flag`

6. **Verify both projects deployed**:
   - Primary domain has sign-out redirect page
   - Satellite domain has updated Header.tsx

---

## Verification Checklist

Before testing, verify ALL of these:

- [ ] www.mosc-temp.com resolves to Amplify app (nslookup)
- [ ] AWS Amplify shows www.mosc-temp.com "Available" (green)
- [ ] Clerk satellite domain shows "Verified" (green)
- [ ] Google OAuth includes www.mosc-temp.com
- [ ] Amplify deployment for feature_Common_Clerk branch completed
- [ ] Can access https://www.mosc-temp.com without errors
- [ ] www.adwiise.com still works (primary domain unaffected)

---

## Important Notes

### About Cookie Domains

Since `www.mosc-temp.com` and `www.adwiise.com` are **different root domains**, cookies CANNOT be shared between them. This is browser security by design.

**How it works instead**:
- Clerk stores sessions in its backend
- When you authenticate on www.adwiise.com, Clerk creates session
- When redirected to www.mosc-temp.com, Clerk transfers session via secure token
- Each domain gets its own session cookie, but they refer to same Clerk session

### About Primary Domain

`www.adwiise.com` continues to work exactly as before:
- Users can still sign in directly on www.adwiise.com
- OAuth flows work on www.adwiise.com
- No changes needed to existing users
- **Primary domain is NOT affected by adding satellites**

### About Multi-Tenant Architecture

This setup enables true multi-tenant:
- Each tenant can have completely different domain
- All tenants share same Clerk user database
- Users authenticate once, can access any tenant they have permission for
- Central authentication on www.adwiise.com

---

## Next Steps: Adding More Tenant Domains

To add future tenants (e.g., `www.tenant2.com`, `www.tenant3.com`):

1. **Update layout.tsx**:
```typescript
const isSatellite = hostname.includes('mosc-temp.com') || hostname.includes('tenant2.com');
```

2. **Follow same DNS setup process** for new domain
3. **Add to Clerk Dashboard** as satellite domain
4. **Add to Google OAuth** authorized origins
5. **Update `allowedRedirectOrigins`** in layout.tsx

---

## Support

If issues persist:

**Clerk Support**:
- Discord: https://clerk.com/discord
- Email: Via Clerk Dashboard → Support
- Provide: Instance ID `ins_***`, domain name, trace ID

**AWS Support**:
- Amplify Console → Support
- Provide: App ID, domain name, error messages

---

**Created**: 2025-01-23
**Status**: Ready to implement
**Next Action**: Start with STEP 1 (AWS Amplify Console)
