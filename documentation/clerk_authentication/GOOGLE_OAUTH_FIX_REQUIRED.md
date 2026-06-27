# Google OAuth Configuration Fix - REQUIRED NOW

## 🎯 Current Status

✅ **Proxy Working**: `/__clerk/v1/environment` returns JSON correctly
✅ **Clerk SDK Loading**: Sign-in page works
❌ **OAuth Failing**: Getting `authorization_invalid` at callback

**Error Details**:
- URL: `https://clerk.adwiise.com/v1/oauth_callback?err_code=authorization_invalid`
- Trace ID: `9125ef35c1674659aef6c875b4a9e7bb`
- Error: "Unauthorized request - You are not authorized to perform this request"

---

## 🔍 Root Cause

The proxy is working, but **Google OAuth Client ID is missing the Amplify domain** in its "Authorized JavaScript origins" configuration.

### What's Happening:

```
1. User on: feature-common-clerk.d1508w3f27cyps.amplifyapp.com
2. Clicks: "Sign in with Google"
3. Browser makes OAuth request FROM: Amplify domain
   ↓
4. Google checks: Is this origin authorized?
   ↓
5. Amplify domain NOT in "Authorized JavaScript origins"
   ↓
6. Google allows it anyway (shows login page)
   ↓
7. User authenticates with Google ✓
   ↓
8. Google redirects to: clerk.adwiise.com/v1/oauth_callback
   ↓
9. Clerk receives callback and checks origin
   ↓
10. Clerk sees: Original request came from Amplify domain
    ↓
11. Clerk checks: Is Amplify domain in my allowed_origins? YES ✓
    ↓
12. Clerk checks: Is Amplify domain in Google OAuth config?
    ↓
13. ❌ Amplify domain NOT in Google's "Authorized JavaScript origins"
    ↓
14. Clerk rejects: authorization_invalid
```

---

## ✅ THE FIX: Update Google Cloud Console

### Step 1: Go to Google Cloud Console

1. **Open**: https://console.cloud.google.com/apis/credentials
2. **Select** your project (if multiple projects exist)
3. **Find** OAuth Client ID: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
4. **Click** the pencil/edit icon on the right

---

### Step 2: Add Amplify Domain to "Authorized JavaScript origins"

**In the edit screen, find the section**: **"Authorized JavaScript origins"**

**Current configuration** (what you probably have):
```
https://www.adwiise.com
https://clerk.adwiise.com
http://localhost:3000
```

**Updated configuration** (what you NEED):
```
https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com   ← ADD THIS
https://www.adwiise.com
https://clerk.adwiise.com
http://localhost:3000
```

### How to Add:

1. **Click**: "+ ADD URI" button under "Authorized JavaScript origins"
2. **Enter**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com`
3. **Press**: Enter or click outside the field

---

### Step 3: Verify "Authorized redirect URIs" (Should Already Be Correct)

**Check that this section includes** (should already be there):
```
https://clerk.adwiise.com/v1/oauth_callback
https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback
https://www.adwiise.com/sso-callback
http://localhost:3000/sso-callback
```

**If any are missing, add them**.

---

### Step 4: Save Changes

1. **Scroll to bottom** of the page
2. **Click**: "SAVE" button
3. **Wait**: 2-5 minutes for Google to propagate changes globally

⚠️ **IMPORTANT**: Google OAuth changes can take **2-5 minutes** to take effect worldwide.

---

### Step 5: Clear Browser Session

Before testing, clear Clerk cookies to ensure fresh OAuth flow:

**In browser console (F12)**:
```javascript
// Clear all cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Reload page
location.reload();
```

**Or**: Use Incognito/Private browsing mode for testing

---

### Step 6: Test OAuth Again

1. **Wait 5 minutes** after saving in Google Cloud Console
2. **Visit**: `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in`
3. **Click**: "Continue with Google"
4. **Select**: Google account
5. **Expected**:
   - ✅ No `authorization_invalid` error
   - ✅ Redirects back to app successfully
   - ✅ User is logged in

---

## 📋 Complete Configuration Checklist

### Google Cloud Console - OAuth Client ID: `303554160954`

**Authorized JavaScript origins** (4 entries):
- [ ] `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com` ← **MUST ADD**
- [ ] `https://www.adwiise.com`
- [ ] `https://clerk.adwiise.com`
- [ ] `http://localhost:3000`

**Authorized redirect URIs** (4 entries):
- [ ] `https://clerk.adwiise.com/v1/oauth_callback`
- [ ] `https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sso-callback`
- [ ] `https://www.adwiise.com/sso-callback`
- [ ] `http://localhost:3000/sso-callback`

**After saving**:
- [ ] Waited 5 minutes for propagation
- [ ] Cleared browser cookies/cache
- [ ] Tested OAuth in incognito mode
- [ ] OAuth works without `authorization_invalid` error

---

## 🎯 Why This is THE Issue

We've confirmed:
- ✅ Proxy is working (`/__clerk/v1/environment` returns JSON)
- ✅ Clerk environment variables are set correctly in Amplify
- ✅ Clerk allowed origins includes Amplify domain (3 domains configured)
- ✅ Google OAuth is enabled in Clerk Dashboard
- ✅ OAuth gets to Google login page (shows account selector)
- ❌ **OAuth fails at callback with `authorization_invalid`**

**This specific error pattern indicates**: Google OAuth origin mismatch

When Clerk receives the OAuth callback from Google, it validates:
1. The OAuth state parameter matches ✓
2. The origin that initiated the OAuth is in Clerk's allowed_origins ✓
3. **The origin is also in Google's "Authorized JavaScript origins"** ❌ ← THIS IS THE ISSUE

---

## 🔍 How to Confirm This is the Issue

### Check Current Google OAuth Configuration:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click: OAuth Client ID `303554160954`
3. Look at: "Authorized JavaScript origins" section
4. **Check if this domain is listed**:
   ```
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
   ```

**If NOT listed**: This is 100% your issue
**If listed**: Check if there's a typo or extra/missing characters

---

## 🆘 If Still Not Working After Adding Domain

### Debug Step 1: Verify Domain Was Added Correctly

1. **Go back to**: Google Cloud Console > Credentials
2. **Click edit** on OAuth Client ID
3. **Verify**: Amplify domain appears in "Authorized JavaScript origins"
4. **Check for**: Typos, extra spaces, wrong protocol (http vs https)

**Common mistakes**:
- ❌ `http://feature-common-clerk...` (should be `https://`)
- ❌ `https://feature-common-clerk.../` (remove trailing slash)
- ❌ Extra spaces before or after URL

---

### Debug Step 2: Wait Longer

Google OAuth changes can sometimes take longer to propagate:

- **Minimum wait**: 5 minutes
- **Typical wait**: 5-10 minutes
- **Maximum wait**: 30 minutes (rare)

**Try again** after 10-15 minutes.

---

### Debug Step 3: Test with Different Browser

Sometimes browsers cache OAuth state:

1. **Try**: Different browser (Chrome vs Firefox vs Edge)
2. **Or**: Incognito/Private mode
3. **Or**: Clear ALL browser data (not just cookies)

---

### Debug Step 4: Check Clerk Logs

With trace ID `9125ef35c1674659aef6c875b4a9e7bb`:

1. **Go to**: https://dashboard.clerk.com/logs
2. **Search for**: `9125ef35c1674659aef6c875b4a9e7bb`
3. **Click** on the log entry
4. **Read** detailed error message

**Should show**: Specific reason like "origin not in Google OAuth config"

---

## 💡 Alternative: Test on Primary Domain

To confirm this is Amplify-domain-specific:

**Test OAuth on primary domain**:
1. **Visit**: `https://www.adwiise.com/sign-in`
2. **Try**: Google OAuth
3. **Expected**: Should work (because `www.adwiise.com` is already in Google OAuth config)

**If works on primary domain**:
- Confirms issue is Amplify domain not in Google OAuth
- Adding Amplify domain to Google OAuth will fix it

**If fails on both**:
- Different issue (less likely given error pattern)
- Check Clerk logs for more details

---

## 🎉 Expected Outcome After Fix

Once you add the Amplify domain to Google OAuth "Authorized JavaScript origins":

### Successful OAuth Flow:

```
1. User visits: feature-common-clerk.d1508w3f27cyps.amplifyapp.com/sign-in
2. Clicks: "Continue with Google"
3. Google checks: Is Amplify domain in "Authorized JavaScript origins"? YES ✓
4. Google shows: Account selection page ✓
5. User selects: Google account ✓
6. Google authenticates: User successfully ✓
7. Google redirects to: clerk.adwiise.com/v1/oauth_callback
8. Clerk validates:
   - OAuth state parameter ✓
   - Origin (Amplify domain) in Clerk allowed_origins ✓
   - Origin (Amplify domain) in Google OAuth config ✓
9. Clerk processes callback successfully ✓
10. Clerk redirects to: feature-common-clerk.../sso-callback ✓
11. User is logged in ✓
```

---

## 📊 Technical Explanation

### Why Both Clerk AND Google Need the Origin:

**Clerk's allowed_origins**:
- Controls which domains can use your Clerk instance
- Prevents unauthorized domains from using your auth
- We already configured this ✓

**Google's "Authorized JavaScript origins"**:
- Controls which domains can initiate OAuth with your Client ID
- Google's security measure to prevent OAuth token theft
- **We need to add Amplify domain here** ❌

**Both must match** for OAuth to work:
- Origin initiating OAuth must be in Google's list
- Origin must also be in Clerk's allowed_origins
- If either is missing, OAuth fails

---

## 🔑 Key Takeaway

**The proxy is working!** The issue is purely Google OAuth configuration.

**Action Required**: Add Amplify domain to Google Cloud Console "Authorized JavaScript origins"

**Time to Fix**: 5 minutes (2 minutes to add + 3 minutes wait time)

**After fix**: OAuth will work immediately on Amplify domain

---

**Last Updated**: 2025-01-22
**Status**: ACTION REQUIRED - Update Google Cloud Console
**Priority**: CRITICAL - This is the final blocking issue
**Next Step**: Add Amplify domain to Google OAuth config now

---

## ✅ Quick Action Steps

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Edit**: OAuth Client ID `303554160954`
3. **Add to "Authorized JavaScript origins"**:
   ```
   https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com
   ```
4. **Save** and wait 5 minutes
5. **Test** OAuth again
6. **Should work!** ✓
