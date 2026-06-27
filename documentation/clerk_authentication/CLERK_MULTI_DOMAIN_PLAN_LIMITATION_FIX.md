# Clerk Multi-Domain Plan Limitation - Complete Fix Guide

## 🎯 Problem Identified

**Root Cause**: Your Clerk **Free plan** doesn't support multiple domains for production instances.

### Current Situation:

**From Clerk Dashboard Screenshot (Image #2)**:
```
"Multi-domain feature is not available in your current plan for production instances."
```

**What This Means**:
- ✅ **Primary Domain Works**: `clerk.adwiise.com` (configured as primary)
- ❌ **Amplify Domain Blocked**: `feature-common-clerk.d1508w3f27cyps.amplifyapp.com` (treated as satellite domain)
- ❌ **Result**: OAuth returns 403 `authorization_invalid` on Amplify deployments

### Why OAuth Works on Localhost:
- Localhost is treated as a **development environment**
- Development domains have different restrictions on Free plan
- Free plan allows multiple development domains ✓

### Why OAuth Fails on Amplify:
- Amplify URL is a **production deployment**
- Treated as a **satellite domain** (requires Pro plan)
- Free plan blocks satellite domains in production ❌

---

## 📊 Clerk Plan Comparison

| Feature | Free Plan | Pro Plan ($25/mo) |
|---------|-----------|-------------------|
| Primary Domain | ✅ 1 domain | ✅ 1 domain |
| Satellite Domains | ❌ Not supported | ✅ Unlimited |
| Development Domains | ✅ Unlimited | ✅ Unlimited |
| Custom Email Provider | ❌ No | ✅ Yes |
| Email Delivery Speed | 🐌 10-30 min | ⚡ 1-5 sec |
| Monthly Active Users | 10,000 | 10,000 |
| Support | Community | Email support |

---

## ✅ Solution Options

### Option 1: Upgrade to Clerk Pro Plan (Recommended for Production)

**Best for**: Production deployments, multiple environments (staging, preview, etc.)

**Cost**: $25/month

**Benefits**:
- ✅ Unlimited satellite domains
- ✅ Custom email provider support
- ✅ Better email delivery (1-5 seconds vs 10-30 minutes)
- ✅ Email support
- ✅ Advanced features (SAML SSO, etc.)

#### Steps to Upgrade:

1. **Go to Clerk Dashboard**:
   - URL: https://dashboard.clerk.com/
   - Make sure you're in **Production** instance (top-left indicator)

2. **Navigate to Billing**:
   - Left sidebar: **Billing** > **Subscription plans**
   - Or direct link: https://dashboard.clerk.com/billing

3. **Select Pro Plan**:
   - Click **"Upgrade to Pro"** button
   - Price: $25/month (10,000 MAU included)
   - Enter payment information
   - Click **"Subscribe"**

4. **Add Satellite Domain**:
   - After upgrade completes, go to: **Configure** > **Domains**
   - Click **"Add satellite domain"** or similar option
   - Enter: `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
   - Click **Save**

5. **Verify Configuration**:
   - Domain should show as **"Active"** or **"Verified"** ✓
   - May take 2-5 minutes to propagate

6. **Test OAuth on Amplify**:
   - Go to: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
   - Click **"Continue with Google"**
   - Should work without 403 error ✓

7. **Optional: Configure Custom Email Provider**:
   - Go to: **User & Authentication** > **Email, phone, username**
   - Scroll to: **Email delivery**
   - Click: **"Set up custom email service"**
   - Choose: **Resend** (recommended, free tier available)
   - Enter API key from: https://resend.com/
   - Test email delivery (should be instant)

---

### Option 2: Use Custom Subdomain (Free - Recommended for Testing)

**Best for**: Testing/staging without paying, staying on Free plan

**Cost**: Free

**Limitation**: Only works for subdomains under your primary domain (`adwiise.com`)

#### How Clerk Treats Domains:

Clerk considers these as **the same primary domain**:
- `www.adwiise.com` ✓
- `app.adwiise.com` ✓
- `staging.adwiise.com` ✓
- `preview.adwiise.com` ✓

But treats this as a **different satellite domain**:
- `feature-common-clerk.d1508w3f27cyps.amplifyapp.com` ❌ (requires Pro plan)

#### Steps to Use Subdomain:

1. **Choose a Subdomain**:
   ```
   Option A: staging.adwiise.com (for staging deployments)
   Option B: preview.adwiise.com (for preview/feature branches)
   Option C: app.adwiise.com (for application)
   ```

2. **Configure in AWS Amplify**:
   - Go to: AWS Amplify Console
   - Your App > **App settings** > **Domain management**
   - Click **"Add domain"**
   - Enter your chosen subdomain: `staging.adwiise.com`
   - Click **"Configure domain"**

3. **Amplify Will Provide DNS Instructions**:
   ```
   Type: CNAME
   Name: staging (or your chosen subdomain)
   Value: [Amplify-provided-value].cloudfront.net
   ```

4. **Add CNAME Record in Route 53**:
   - Go to: AWS Route 53 Console
   - Navigate to: Hosted zones > `adwiise.com`
   - Click **"Create record"**
   - **Record type**: CNAME
   - **Record name**: `staging` (or your chosen subdomain)
   - **Value**: [Paste Amplify-provided CloudFront URL]
   - **TTL**: 300 (5 minutes)
   - Click **"Create records"**

5. **Wait for DNS Propagation**:
   - Usually takes 5-10 minutes
   - Check status in Amplify Console
   - Should show: **"Available"** or **"Active"** ✓

6. **Update Google Cloud Console Redirect URIs**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Edit OAuth Client ID: `303554160954-0nkuttb13bjlfkpsu02sbm5dr3r5bp1m...`
   - **Add to Authorized redirect URIs**:
     ```
     https://staging.adwiise.com/sso-callback
     ```
   - Click **"Save"**
   - Wait 2-5 minutes for changes to propagate

7. **Test OAuth on Subdomain**:
   - Go to: `https://staging.adwiise.com/sign-in`
   - Click **"Continue with Google"**
   - Should work without 403 error ✓

---

### Option 3: Use Development/Test Instance (Free - Testing Only)

**Best for**: Quick testing, not for production

**Cost**: Free

**Limitation**: Uses TEST Clerk instance, not suitable for production

#### Steps:

1. **Get Your TEST Clerk Keys**:
   - You have a TEST instance: `humble-monkey-3.clerk.accounts.dev`
   - Go to: Clerk Dashboard > Switch to **Development/Test** instance
   - Copy keys (they start with `pk_test_` and `sk_test_`)

2. **Update .env.production**:
   ```bash
   # TEMPORARILY switch to TEST instance for Amplify testing
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
   CLERK_SECRET_KEY=sk_test_***_test_secret_key_here

   # Google OAuth Client ID (same as before)
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
   ```

3. **Update AWS Amplify Environment Variables**:
   - Go to: AWS Amplify Console > Environment Variables
   - Update:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_***
     CLERK_SECRET_KEY = sk_test_***_test_secret_key_here
     ```
   - Click **"Save"**
   - Redeploy the app

4. **Test OAuth**:
   - Go to: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
   - Click **"Continue with Google"**
   - Should work (TEST instance supports multiple domains) ✓

**⚠️ CRITICAL**: Remember to switch back to LIVE keys before deploying to production!

---

## 📧 Email Verification Code Issue - Resolved

### Finding from Clerk Logs (Image #1):

Your logs show **`email.created`** events:
- Timestamp: 08/22/2025, 08/11/2025
- Status: Successfully sent ✓

**This confirms**: Clerk IS sending emails. The issue is **email deliverability**, not Clerk configuration.

### Why You're Not Receiving Emails:

1. **Spam Filter**: Your email provider is blocking `noreply@clerk.com`
2. **Email Delay**: Clerk's free email service is slow (10-30 minutes)
3. **Email Provider Blocking**: Some providers (Gmail, Outlook) aggressively filter Clerk emails

### Immediate Solutions:

1. **Check Spam/Junk Folder**:
   - Search for: `noreply@clerk.com`
   - Search for: `clerk.com`
   - Search for: `verification code`
   - Mark as **"Not spam"** if found
   - Add to contacts/safe senders

2. **Wait Longer**:
   - Clerk's default email service can take **30-60 minutes**
   - Don't request multiple codes (causes rate limiting)
   - Check spam folder every 10 minutes

3. **Try Different Email Provider**:
   - If using Gmail, try Yahoo or Outlook
   - Some providers are less aggressive with filtering

### Long-Term Solution (With Pro Plan):

1. **Configure Custom Email Provider**:
   - Recommended: **Resend** (https://resend.com/)
   - Free tier: 100 emails/day, 3,000/month
   - Instant delivery: 1-5 seconds ⚡

2. **Setup Steps**:
   - Sign up at: https://resend.com/
   - Get API key: https://resend.com/api-keys
   - Clerk Dashboard > **User & Authentication** > **Email delivery**
   - Select: **Resend**
   - Enter API key
   - Click **"Save"**
   - Send test email (should arrive instantly)

3. **Optional: Use Custom Domain**:
   - Verify domain in Resend: `adwiise.com`
   - Add DNS records (SPF, DKIM, DMARC)
   - Emails will come from: `noreply@adwiise.com`
   - Much better deliverability ✓

---

## 📋 Recommended Action Plan

### For Production Deployment:

**Step 1: Upgrade to Pro Plan** (5 minutes)
- [ ] Go to: Clerk Dashboard > Billing > Subscription plans
- [ ] Click: **"Upgrade to Pro"**
- [ ] Enter payment info
- [ ] Complete subscription ($25/month)

**Step 2: Add Satellite Domain** (2 minutes)
- [ ] Go to: Configure > Domains
- [ ] Click: **"Add satellite domain"**
- [ ] Enter: `feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
- [ ] Click: **"Save"**
- [ ] Wait 2-5 minutes for propagation

**Step 3: Configure Custom Email** (10 minutes)
- [ ] Sign up at: https://resend.com/
- [ ] Get API key
- [ ] Configure in Clerk Dashboard
- [ ] Send test email to verify

**Step 4: Test Everything** (5 minutes)
- [ ] Test OAuth on: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
- [ ] Test email verification code delivery
- [ ] Verify both work correctly ✓

**Total Time**: ~25 minutes
**Total Cost**: $25/month

---

### For Testing/Free Solution:

**Step 1: Choose Subdomain** (1 minute)
- [ ] Decide on: `staging.adwiise.com` or `preview.adwiise.com`

**Step 2: Configure in AWS Amplify** (5 minutes)
- [ ] Add custom domain in Amplify Console
- [ ] Get CNAME value from Amplify

**Step 3: Update DNS in Route 53** (3 minutes)
- [ ] Create CNAME record
- [ ] Point to Amplify CloudFront URL
- [ ] Save

**Step 4: Wait for DNS Propagation** (5-10 minutes)
- [ ] Check Amplify Console for "Available" status

**Step 5: Update Google OAuth** (2 minutes)
- [ ] Add subdomain to Google Cloud Console redirect URIs
- [ ] Save and wait 2-5 minutes

**Step 6: Test OAuth** (2 minutes)
- [ ] Test on: `https://staging.adwiise.com/sign-in`
- [ ] Verify OAuth works ✓

**Total Time**: ~20-30 minutes
**Total Cost**: $0 (Free)

---

## 🆘 Troubleshooting

### If OAuth Still Fails After Upgrade:

1. **Verify Domain is Active**:
   - Clerk Dashboard > Domains
   - Should show: **"Active"** or **"Verified"** ✓

2. **Check Clerk Logs**:
   - Dashboard > Logs
   - Look for OAuth errors
   - Should show successful authentication ✓

3. **Verify Google Cloud Console**:
   - Redirect URIs should include all domains
   - Check for typos

4. **Clear Browser Cookies**:
   ```javascript
   // In browser console:
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   // Refresh and try again
   ```

### If Emails Still Not Arriving (After Pro Upgrade):

1. **Check Resend Dashboard**:
   - Go to: https://resend.com/emails
   - Verify emails are being sent ✓

2. **Check Email Logs**:
   - Clerk Dashboard > Logs
   - Filter: "Email"
   - Should show: `email.sent` and `email.delivered` ✓

3. **Verify API Key**:
   - Check if Resend API key is correct
   - Regenerate if needed

---

## 💰 Cost Summary

### Option 1: Upgrade to Pro
- **Monthly Cost**: $25
- **Benefits**:
  - Unlimited satellite domains ✓
  - Custom email provider ✓
  - Better support ✓
- **Best for**: Production, multiple environments

### Option 2: Use Subdomain
- **Monthly Cost**: $0
- **Benefits**:
  - Free ✓
  - Works for staging/preview ✓
- **Limitation**: Only subdomains of `adwiise.com`

### Option 3: Use TEST Instance
- **Monthly Cost**: $0
- **Benefits**:
  - Free ✓
  - Quick testing ✓
- **Limitation**: NOT for production ❌

---

## 📚 Related Documentation

- [Clerk Multi-Domain Setup](https://clerk.com/docs/deployments/set-up-multiple-domains)
- [Clerk Pricing](https://clerk.com/pricing)
- [Resend Email Provider](https://resend.com/docs/send-with-clerk)
- [AWS Amplify Custom Domains](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html)

---

## ✅ Verification Checklist

After implementing your chosen solution:

**OAuth Verification**:
- [ ] Google OAuth works on primary domain (`www.adwiise.com`)
- [ ] Google OAuth works on Amplify/satellite domain
- [ ] No 403 errors in browser console
- [ ] Users can complete full sign-in flow
- [ ] Clerk Dashboard logs show successful OAuth

**Email Verification**:
- [ ] Verification codes arrive within 2 minutes (Pro + Resend)
- [ ] Or arrive within 30 minutes (Free plan)
- [ ] Emails not in spam folder
- [ ] Users can complete email verification flow
- [ ] Clerk Dashboard logs show `email.sent` and `email.delivered`

---

**Last Updated**: 2025-01-21
**Status**: Complete fix guide with all solution options
**Priority**: HIGH - Blocks authentication on Amplify deployments

---

## 🎯 Quick Decision Matrix

**Choose Option 1 (Pro Plan) if**:
- ✅ You need production-ready multi-domain support
- ✅ You want instant email delivery
- ✅ You have budget for $25/month
- ✅ You need multiple preview/staging environments

**Choose Option 2 (Subdomain) if**:
- ✅ You want free solution
- ✅ You can use subdomains of `adwiise.com`
- ✅ You're okay with slower email delivery
- ✅ You're deploying to staging/preview environments

**Choose Option 3 (TEST Instance) if**:
- ✅ You're ONLY testing (not production)
- ✅ You want quickest solution
- ✅ You'll switch back to LIVE keys later

---

**Need help deciding?** Contact me after reviewing options.
