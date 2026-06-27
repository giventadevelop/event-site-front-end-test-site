# Clerk Email Verification Code Not Received - Fix

## 🚨 Problem

Email verification codes not arriving after 5-10 minutes when using email/password sign-in.

---

## ✅ Solution 1: Configure Custom Email Provider (Recommended)

Clerk's default email service is unreliable. Use a custom email provider for instant delivery.

### Step 1: Choose an Email Provider

**Recommended: Resend** (Easiest, 100 free emails/day)
- Sign up: https://resend.com/
- Or use: SendGrid, Mailgun, AWS SES

### Step 2: Set Up Resend (5 minutes)

1. **Sign up at Resend**: https://resend.com/signup

2. **Get your API Key**:
   - Go to: https://resend.com/api-keys
   - Click **"Create API Key"**
   - Name: `Clerk Email Service`
   - Permissions: **Sending access**
   - Click **Create**
   - **Copy the API key** (starts with `re_`)

3. **Verify Your Domain** (Optional but recommended):
   - Go to: https://resend.com/domains
   - Click **"Add Domain"**
   - Enter: `adwiise.com`
   - Add the DNS records shown (DKIM, SPF, DMARC)
   - This allows emails from `noreply@adwiise.com`

### Step 3: Configure in Clerk Dashboard

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com/

2. **Make sure you're in LIVE instance** (top-left)

3. **Navigate to Email Settings**:
   - Left sidebar: **User & Authentication**
   - Click: **Email, phone, username**
   - Scroll down to: **Email delivery**
   - Click: **Set up custom email service**

4. **Select Provider**:
   - Choose: **Resend**
   - Enter your API Key: `re_...`
   - Click **Save**

5. **Test Email Delivery**:
   - Click **"Send test email"**
   - Enter your email address
   - You should receive the test email instantly ✓

---

## ✅ Solution 2: Fix Clerk's Default Email (Temporary Workaround)

If you can't set up a custom provider immediately:

### Option A: Check Spam Folder
- Look in **Spam/Junk** folder
- Search for emails from: `noreply@clerk.com`
- Mark as "Not Spam" and move to inbox
- Add `noreply@clerk.com` to your contacts

### Option B: Use Email Whitelist
- Add these to your email whitelist:
  ```
  noreply@clerk.com
  @clerk.com
  @clerk.dev
  ```

### Option C: Try Different Email Provider
- If using Gmail, try a different email (Yahoo, Outlook, etc.)
- Some providers are more aggressive with filtering

### Option D: Wait Longer
- Clerk's default service can take **10-30 minutes**
- Check spam folder periodically
- Don't request multiple codes (causes rate limiting)

---

## ✅ Solution 3: Disable Email Verification (NOT Recommended)

**⚠️ Only for testing - DO NOT use in production!**

1. Go to: Clerk Dashboard > **User & Authentication** > **Email, phone, username**
2. Find: **Email address** settings
3. Toggle: **Require verification** to OFF
4. Click **Save**

**Why not recommended**: Users can sign up with fake emails, causing security issues.

---

## 🧪 How to Test Email Delivery

### Test 1: Send Test Email from Clerk
1. Clerk Dashboard > **User & Authentication** > **Email, phone, username**
2. Scroll to: **Email delivery**
3. Click: **Send test email**
4. Should arrive in **5-10 seconds** (if custom provider configured)

### Test 2: Sign Up with New Account
1. Go to your app's sign-up page
2. Use a new email address
3. Enter verification code when it arrives
4. Time how long it takes

### Test 3: Check Clerk Email Logs
1. Go to: Clerk Dashboard > **Logs**
2. Filter by: **Email events**
3. Look for:
   - `email.sent` - Email was sent ✓
   - `email.bounced` - Email failed ❌
   - `email.delivered` - Email delivered ✓

---

## 📊 Expected Delivery Times

| Email Provider | Expected Delivery Time |
|---------------|----------------------|
| **Resend** | 1-5 seconds ⚡ |
| **SendGrid** | 5-30 seconds |
| **AWS SES** | 10-60 seconds |
| **Clerk Default** | 5-30 minutes 🐌 |

---

## 🎯 Recommended Setup for Production

### Complete Email Configuration:

1. **Custom Email Provider**: Resend or SendGrid
2. **Custom Domain**: `noreply@adwiise.com` (instead of `noreply@clerk.com`)
3. **Email Templates**: Customize verification email content
4. **Email Logs**: Monitor delivery in Resend/SendGrid dashboard

### Benefits:
- ✅ Instant email delivery (1-5 seconds)
- ✅ Custom branding (`@adwiise.com` domain)
- ✅ Better deliverability (fewer spam issues)
- ✅ Email analytics and logs
- ✅ No rate limits (on paid plans)

---

## 📋 Quick Setup Checklist

**Option A: Full Setup (Recommended)**
- [ ] Sign up for Resend: https://resend.com/
- [ ] Get API key from Resend dashboard
- [ ] Configure in Clerk Dashboard > Email delivery
- [ ] Send test email to verify
- [ ] Test sign-up flow on your app

**Option B: Quick Workaround (Temporary)**
- [ ] Check spam folder for emails from `noreply@clerk.com`
- [ ] Add to whitelist/contacts
- [ ] Wait 10-30 minutes for verification codes
- [ ] Plan to set up custom provider later

---

## 🆘 Still Not Receiving Emails?

### Debug Steps:

1. **Check Clerk Email Logs**:
   - Dashboard > Logs > Filter: "Email"
   - Look for send failures

2. **Verify Email Address**:
   - Make sure email is typed correctly
   - No typos in domain name

3. **Check Email Provider Status**:
   - Resend status: https://status.resend.com/
   - Clerk status: https://status.clerk.com/

4. **Test with Different Email**:
   - Try Gmail, Yahoo, Outlook
   - Some providers filter more aggressively

5. **Check Clerk Rate Limits**:
   - Too many verification requests can trigger rate limiting
   - Wait 1 hour and try again

---

## 💰 Cost

### Resend Pricing:
- **Free Tier**: 100 emails/day, 3,000/month
- **Pro Plan**: $20/month for 50,000 emails
- More than enough for most applications

### SendGrid Pricing:
- **Free Tier**: 100 emails/day
- **Essentials**: $19.95/month for 50,000 emails

**Clerk's default email service**: Free but unreliable

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Clerk Email Configuration](https://clerk.com/docs/email-sms-phone/custom-provider)
- [Email Deliverability Best Practices](https://www.courier.com/guides/email-deliverability/)

---

**Last Updated**: 2025-01-21
**Status**: Active troubleshooting guide
**Impact**: Affects email/password authentication flow
