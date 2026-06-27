# Authentication Setup for Admin Page Testing

## 🎯 **Problem**

Admin pages (`/admin/*`) require Clerk authentication, so Playwright tests return **401 Unauthorized** errors when accessing them without authentication.

## ✅ **Solution**

The test script now supports **automatic authentication** using Clerk sign-in. You can authenticate once, and the session will be reused for all admin page tests.

## 🔧 **Setup Steps**

### **Step 1: Add Test Credentials to `.env.local`**

Add your test user credentials to `.env.local`:

```bash
# Test User Credentials (for Playwright authentication)
TEST_USER_EMAIL=your-admin-email@example.com
TEST_USER_PASSWORD=your-admin-password

# Alternative variable names (also supported)
TEST_ADMIN_EMAIL=your-admin-email@example.com
TEST_ADMIN_PASSWORD=your-admin-password
```

### **Step 2: Create a Test User (If Needed)**

If you don't have a test admin user:

1. **Sign up** at `http://localhost:3000/sign-up`
2. **Assign admin role** via your admin panel or database
3. **Use those credentials** in `.env.local`

### **Step 3: Run Tests**

```bash
npm run test:comprehensive
```

The script will:
1. ✅ **Check for credentials** in `.env.local`
2. ✅ **Authenticate automatically** on first admin test
3. ✅ **Save authentication state** to `.auth-state.json`
4. ✅ **Reuse saved state** for subsequent test runs

## 📋 **How It Works**

### **Authentication Flow:**

```
1. Script starts → Checks for TEST_USER_EMAIL and TEST_USER_PASSWORD
2. If found → Authentication enabled
3. First admin test → Navigate to /sign-in → Fill credentials → Submit
4. Save state → Store cookies/session to .auth-state.json
5. Subsequent tests → Load saved state → Use authenticated context
```

### **State Management:**

- **First Run**: Authenticates and saves state
- **Subsequent Runs**: Loads saved state (faster, no re-authentication)
- **State File**: `TestSprite/sanity-tests/.auth-state.json`
- **Auto-Refresh**: State expires when Clerk session expires (usually 7 days)

## 🎯 **Expected Behavior**

### **With Authentication Enabled:**

```
🔐 Authentication: Enabled (admin@example.com)
   ✅ Using saved authentication state

🧪 [sanity-015] Running: Admin Dashboard Access Test
   Category: admin-pages | Priority: critical
   URL: http://localhost:3000/admin
   ✅ PASSED: 2.5s
```

### **Without Authentication:**

```
🔐 Authentication: Disabled (admin pages will fail with 401)
   💡 Tip: Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local to enable authentication

🧪 [sanity-015] Running: Admin Dashboard Access Test
   Category: admin-pages | Priority: critical
   URL: http://localhost:3000/admin
   ❌ FAILED: Page returned status 401
```

## 🔍 **Troubleshooting**

### **Issue: Authentication Fails**

**Symptoms:**
- Script shows "Authentication failed"
- Admin pages still return 401

**Solutions:**

1. **Verify Credentials:**
   ```bash
   # Check .env.local has correct credentials
   cat .env.local | grep TEST_USER
   ```

2. **Test Manually:**
   - Visit `http://localhost:3000/sign-in`
   - Try signing in with the same credentials
   - If it fails, credentials are incorrect

3. **Check User Role:**
   - User must have **ADMIN** role
   - Check in admin panel or database

4. **Clear Auth State:**
   ```bash
   # Delete saved state to force re-authentication
   rm TestSprite/sanity-tests/.auth-state.json
   ```

### **Issue: "Auth state file not found"**

**Solution:**
- This is normal on first run
- Script will authenticate and create the file
- Subsequent runs will use the saved state

### **Issue: State Expired**

**Symptoms:**
- Tests pass initially, then start failing
- "Authentication failed" after some time

**Solution:**
- Delete `.auth-state.json`
- Script will re-authenticate on next run

## 🔒 **Security Notes**

### **⚠️ Important:**

1. **Never commit `.env.local`** to git (contains passwords)
2. **Never commit `.auth-state.json`** to git (contains session tokens)
3. **Use test accounts only** (not production accounts)
4. **Rotate test passwords** regularly

### **Gitignore:**

Make sure these are in `.gitignore`:

```
.env.local
TestSprite/sanity-tests/.auth-state.json
```

## 📊 **Test Results**

### **With Authentication:**

| Page Type | Status | Notes |
|-----------|--------|-------|
| **Public Pages** | ✅ Pass | No auth needed |
| **Admin Pages** | ✅ Pass | Uses saved auth state |
| **User Pages** | ✅ Pass | Uses saved auth state |

### **Without Authentication:**

| Page Type | Status | Notes |
|-----------|--------|-------|
| **Public Pages** | ✅ Pass | No auth needed |
| **Admin Pages** | ❌ Fail (401) | Expected - requires auth |
| **User Pages** | ❌ Fail (401) | Expected - requires auth |

## 🚀 **Quick Start**

```bash
# 1. Add credentials to .env.local
echo "TEST_USER_EMAIL=admin@example.com" >> .env.local
echo "TEST_USER_PASSWORD=your-password" >> .env.local

# 2. Run tests
npm run test:comprehensive

# 3. Check results
# - Public pages: ✅ Pass
# - Admin pages: ✅ Pass (with authentication)
```

## 📝 **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `TEST_USER_EMAIL` | Admin user email | Yes (for admin tests) |
| `TEST_USER_PASSWORD` | Admin user password | Yes (for admin tests) |
| `TEST_ADMIN_EMAIL` | Alternative name | Yes (if TEST_USER_EMAIL not set) |
| `TEST_ADMIN_PASSWORD` | Alternative name | Yes (if TEST_USER_PASSWORD not set) |
| `TEST_BASE_URL` | Base URL for tests | No (defaults to http://localhost:3000) |

## 🎯 **Summary**

**To enable authentication for admin pages:**

1. ✅ Add `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` to `.env.local`
2. ✅ Run `npm run test:comprehensive`
3. ✅ Script authenticates automatically on first admin test
4. ✅ Auth state is saved and reused for subsequent runs

**Result:**
- ✅ Public pages test without authentication
- ✅ Admin pages test with authentication
- ✅ All tests pass! 🎉

---

**Key Takeaway:** Set test credentials in `.env.local` and the script handles authentication automatically! 🔐

