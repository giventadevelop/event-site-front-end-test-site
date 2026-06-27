/**
 * Playwright Authentication Helper
 *
 * This module provides functions to authenticate Playwright browser sessions
 * for testing admin pages that require Clerk authentication.
 */

import fs from 'fs';
import path from 'path';

/**
 * Authenticate a Playwright page using Clerk sign-in
 *
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} baseUrl - Base URL of the application
 * @param {Object} credentials - Authentication credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<boolean>} - True if authentication successful
 */
async function authenticatePage(page, baseUrl, credentials) {
  try {
    console.log(`   🔐 Authenticating as ${credentials.email}...`);

    // Navigate to sign-in page (domcontentloaded: Clerk sign-in often never reaches networkidle)
    await page.goto(`${baseUrl}/sign-in`, {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });

    // Wait a bit for Clerk to fully load
    await page.waitForTimeout(2000);

    // If OAuth buttons are visible, we need to click on email/password option
    // Clerk might show OAuth buttons first, but we want email/password
    try {
      // Look for "Continue with email" or "Use email" link/button
      const emailPasswordSelectors = [
        'a:has-text("Continue with email")',
        'a:has-text("Use email")',
        'a:has-text("Email")',
        'button:has-text("Continue with email")',
        'button:has-text("Use email")',
        '[data-localization-key*="email"]',
        'a[href*="email"]',
        // Clerk-specific selectors for email/password option
        'a[data-testid*="email"]',
        'button[data-testid*="email"]'
      ];

      for (const selector of emailPasswordSelectors) {
        try {
          const element = await page.$(selector);
          if (element && await element.isVisible().catch(() => false)) {
            console.log(`   🔍 Found email/password option, clicking: ${selector}`);
            await element.click();
            await page.waitForTimeout(1000); // Wait for form to appear
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    } catch (emailOptionError) {
      // If we can't find email option, assume email/password form is already visible
      console.log('   ℹ️  Email/password form appears to be already visible');
    }

    // Wait for Clerk component to load - Clerk uses iframe or shadow DOM
    // Wait for the main sign-in container
    console.log('   ⏳ Waiting for Clerk sign-in form to load...');
    await page.waitForSelector('main, [class*="clerk"], [class*="sign-in"], form', { timeout: 15000 });

    // If OAuth buttons are visible, we need to click on email/password option
    // Clerk might show OAuth buttons first, but we want email/password
    console.log('   🔍 Checking for email/password option...');
    try {
      // Look for "Continue with email" or "Use email" link/button
      const emailPasswordSelectors = [
        'a:has-text("Continue with email")',
        'a:has-text("Use email")',
        'a:has-text("Email")',
        'a:has-text("email")',
        'button:has-text("Continue with email")',
        'button:has-text("Use email")',
        '[data-localization-key*="email"]',
        'a[href*="email"]',
        // Clerk-specific selectors for email/password option
        'a[data-testid*="email"]',
        'button[data-testid*="email"]',
        // Alternative: look for "or" divider and click the email option after it
        'a:has-text("or"):has-text("email")',
        // Look for any link/button that contains "email" and is not an OAuth button
        'a:not([class*="google"]):not([class*="github"]):not([class*="facebook"]):has-text("email")',
        'button:not([class*="google"]):not([class*="github"]):not([class*="facebook"]):has-text("email")'
      ];

      let emailOptionClicked = false;
      for (const selector of emailPasswordSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const isVisible = await element.isVisible().catch(() => false);
            if (isVisible) {
              console.log(`   ✅ Found email/password option, clicking: ${selector}`);
              await element.click();
              await page.waitForTimeout(1500); // Wait for email/password form to appear
              emailOptionClicked = true;
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!emailOptionClicked) {
        console.log('   ℹ️  Email/password form appears to be already visible (no OAuth buttons or email option found)');
      }
    } catch (emailOptionError) {
      // If we can't find email option, assume email/password form is already visible
      console.log('   ℹ️  Email/password form appears to be already visible');
    }

    // Clerk SignIn component selectors - try multiple approaches
    // Clerk typically uses these selectors (order matters - try most specific first)
    const emailSelectors = [
      'input[type="email"]',
      'input[name="identifier"]',
      'input[id*="identifier"]',
      'input[placeholder*="email" i]',
      'input[data-testid*="email"]',
      'input[data-testid*="identifier"]',
      'input[aria-label*="email" i]',
      'input[aria-label*="identifier" i]'
    ];

    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[id*="password"]',
      'input[data-testid*="password"]',
      'input[aria-label*="password" i]'
    ];

    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign in")',
      'button:has-text("Continue")',
      'button:has-text("Sign In")',
      'button:has-text("Sign In with Email")',
      'button[data-testid*="submit"]',
      'button[data-testid*="sign-in"]',
      'button[data-testid*="continue"]',
      'form button[type="submit"]',
      'button.cl-button',
      'button[class*="button"]',
      'button[class*="submit"]',
      'button[class*="continue"]',
      'button[aria-label*="sign" i]',
      'button[aria-label*="continue" i]',
      'button[aria-label*="submit" i]',
      // Clerk-specific selectors
      'button[data-localization-key*="signIn"]',
      'button[data-localization-key*="continue"]',
      'button[data-localization-key*="submit"]',
      // More generic fallbacks
      'form button:not([type="button"])',
      'button:not([disabled]):not([type="button"])'
    ];

    // Try to find email input with multiple selectors
    let emailInput = null;
    for (const selector of emailSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000, state: 'visible' });
        emailInput = selector;
        console.log(`   ✅ Found email input with selector: ${selector}`);
        break;
      } catch (e) {
        // Try next selector
        continue;
      }
    }

    if (!emailInput) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'debug-signin-page.png', fullPage: true });
      throw new Error('Could not find email input field. Tried selectors: ' + emailSelectors.join(', '));
    }

    // Fill email
    await page.fill(emailInput, credentials.email);
    console.log('   ✅ Email entered');

    // Wait a bit for password field to appear (Clerk may show it after email)
    await page.waitForTimeout(1000);

    // Try to find password input
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000, state: 'visible' });
        passwordInput = selector;
        console.log(`   ✅ Found password input with selector: ${selector}`);
        break;
      } catch (e) {
        // Try next selector
        continue;
      }
    }

    if (!passwordInput) {
      throw new Error('Could not find password input field. Tried selectors: ' + passwordSelectors.join(', '));
    }

    // Fill password
    await page.fill(passwordInput, credentials.password);
    console.log('   ✅ Password entered');

    // Wait a bit before submitting to ensure form is ready
    await page.waitForTimeout(1000);

    // Try pressing Enter on password field first (common pattern)
    try {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);

      // Check if we were redirected (Enter key worked)
      const currentUrl = page.url();
      if (!currentUrl.includes('/sign-in') && !currentUrl.includes('/sign-up')) {
        const isOAuthRedirect = currentUrl.includes('accounts.google.com') ||
                               currentUrl.includes('oauth') ||
                               currentUrl.includes('login.microsoftonline.com');
        if (!isOAuthRedirect) {
          console.log(`   ✅ Authentication successful via Enter key! Redirected to: ${currentUrl}`);
          return true;
        }
      }
    } catch (enterError) {
      // Enter key didn't work, continue with button click
      console.log('   ⏳ Enter key did not trigger navigation, trying submit button...');
    }

    // Try to find and click submit button
    let submitButton = null;
    for (const selector of submitSelectors) {
      try {
        // Try to find the button (visible or not)
        const button = await page.$(selector);
        if (button) {
          // Check if button is visible and enabled
          const isVisible = await button.isVisible().catch(() => false);
          const isEnabled = await button.isEnabled().catch(() => true);

          if (isVisible && isEnabled) {
            submitButton = selector;
            console.log(`   ✅ Found submit button with selector: ${selector}`);
            break;
          } else {
            console.log(`   ⚠️  Found button but not visible/enabled: ${selector}`);
          }
        }
      } catch (e) {
        // Try next selector
        continue;
      }
    }

    if (!submitButton) {
      // Last resort: try to find any button in the form
      try {
        const allButtons = await page.$$('button');
        console.log(`   🔍 Found ${allButtons.length} button(s) on page`);

        for (let i = 0; i < allButtons.length; i++) {
          const button = allButtons[i];
          const text = await button.textContent().catch(() => '');
          const isVisible = await button.isVisible().catch(() => false);
          const isEnabled = await button.isEnabled().catch(() => true);

          console.log(`   🔍 Button ${i + 1}: text="${text?.trim()}", visible=${isVisible}, enabled=${isEnabled}`);

          if (isVisible && isEnabled && (
            text?.toLowerCase().includes('sign') ||
            text?.toLowerCase().includes('continue') ||
            text?.toLowerCase().includes('submit')
          )) {
            console.log(`   ✅ Found submit button by text content: "${text?.trim()}"`);
            await button.click();
            submitButton = 'found-by-text';
            break;
          }
        }
      } catch (buttonSearchError) {
        // Ignore
      }

      if (!submitButton) {
        // Take screenshot before throwing error
        await page.screenshot({ path: 'debug-no-submit-button.png', fullPage: true });
        throw new Error('Could not find submit button. Tried selectors: ' + submitSelectors.join(', '));
      }
    }

    // Click submit (only if we didn't use Enter key)
    if (submitButton && submitButton !== 'found-by-text') {
      // Wait for any network activity after clicking
      const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
      await page.click(submitButton);
      console.log('   ✅ Submit button clicked');

      // Wait a bit for form submission to process
      await page.waitForTimeout(2000);

      // Check if navigation happened immediately
      try {
        await navigationPromise;
      } catch (e) {
        // Navigation might happen later, continue
      }
    } else if (submitButton === 'found-by-text') {
      console.log('   ✅ Submit button clicked (found by text)');
      await page.waitForTimeout(2000);
    }

    // Wait for navigation after sign-in (redirect to dashboard or home)
    // Clerk typically redirects to / or /dashboard after successful sign-in
    console.log('   ⏳ Waiting for redirect after sign-in...');

    // Check current state before waiting
    let initialUrl = page.url();
    let checkCount = 0;
    const maxChecks = 15; // Check every 2 seconds for 30 seconds total

    while (checkCount < maxChecks) {
      await page.waitForTimeout(2000);
      checkCount++;

      const currentUrl = page.url();
      const pageContent = await page.content().catch(() => '');

      // Check for OAuth redirects
      if (currentUrl.includes('accounts.google.com') ||
          currentUrl.includes('oauth') ||
          currentUrl.includes('login.microsoftonline.com')) {
        console.error(`   ❌ OAuth Redirect Detected!`);
        console.error(`   📍 Redirected to: ${currentUrl}`);
        await page.screenshot({ path: 'debug-oauth-redirect.png', fullPage: true });
        return false;
      }

      // Check if we've been redirected away from sign-in
      if (!currentUrl.includes('/sign-in') && !currentUrl.includes('/sign-up')) {
        // Check if URL changed from initial
        if (currentUrl !== initialUrl || currentUrl === baseUrl || currentUrl === `${baseUrl}/`) {
          console.log(`   ✅ Redirect detected! Current URL: ${currentUrl}`);
          break;
        }
      }

      // Check for actual visible error messages (not just any "error" text in HTML/JS)
      // Only check if we're still on sign-in page
      if (currentUrl.includes('/sign-in')) {
        try {
          // Look for visible error elements with specific selectors
          const errorSelectors = [
            '[class*="error"][class*="message"]',
            '[class*="alert"][class*="error"]',
            '[role="alert"]',
            '[aria-live="polite"]',
            'div[class*="cl-error"]',
            'div[class*="cl-alert"]',
            'p[class*="error"]',
            'span[class*="error"]'
          ];

          let hasVisibleError = false;
          for (const selector of errorSelectors) {
            try {
              const errorElement = await page.$(selector);
              if (errorElement) {
                const isVisible = await errorElement.isVisible().catch(() => false);
                if (isVisible) {
                  const text = await errorElement.textContent().catch(() => '');
                  // Only treat as error if it contains authentication-related error text
                  if (text && (
                    text.toLowerCase().includes('invalid') ||
                    text.toLowerCase().includes('incorrect') ||
                    text.toLowerCase().includes('wrong password') ||
                    text.toLowerCase().includes('user not found') ||
                    text.toLowerCase().includes('authentication failed') ||
                    text.includes('401') ||
                    text.includes('403')
                  )) {
                    console.error(`   ❌ Authentication error detected: ${text.trim()}`);
                    hasVisibleError = true;
                    break;
                  }
                }
              }
            } catch (e) {
              // Continue checking
            }
          }

          // Only fail if we found a visible authentication error
          if (hasVisibleError) {
            await page.screenshot({ path: 'debug-auth-error.png', fullPage: true });
            console.error(`   📸 Screenshot saved: debug-auth-error.png`);
            return false;
          }
        } catch (errorCheckError) {
          // If error checking fails, continue (don't fail authentication)
          console.log(`   ℹ️  Could not check for errors: ${errorCheckError.message}`);
        }
      }

      // Check for success indicators (even if still on sign-in page)
      const hasSuccessIndicators = pageContent.includes('admin') ||
                                   pageContent.includes('dashboard') ||
                                   pageContent.includes('sign out');

      if (hasSuccessIndicators) {
        console.log(`   ✅ Success indicators found on page`);
        break;
      }

      console.log(`   ⏳ Still waiting... (${checkCount}/${maxChecks}) - Current URL: ${currentUrl}`);
    }

    // Final check after waiting
    try {
      const finalUrl = page.url();
      const finalContent = await page.content().catch(() => '');

      // Check if we're authenticated by trying to navigate to admin page
      if (finalUrl.includes('/sign-in') || finalUrl.includes('/sign-up')) {
        console.log(`   🔍 Still on sign-in page, checking authentication state...`);

        // Try navigating to admin page to see if we're actually authenticated
        await page.goto(`${baseUrl}/admin/manage-events`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(2000);

        const adminUrl = page.url();
        if (adminUrl.includes('/sign-in') || adminUrl.includes('/sign-up')) {
          console.error(`   ❌ Cannot access admin page - redirected to: ${adminUrl}`);
          await page.screenshot({ path: 'debug-auth-failed.png', fullPage: true });
          return false;
        } else if (adminUrl === baseUrl + '/' || adminUrl === baseUrl) {
          console.error(`   ❌ CRITICAL: Redirected to homepage!`);
          console.error(`   ⚠️  User authenticated but does not have ADMIN role.`);
          await page.screenshot({ path: 'debug-admin-access-failed.png', fullPage: true });
          return false;
        } else if (adminUrl.includes('/admin/manage-events')) {
          console.log(`   ✅ Authentication and admin access verified! Can access admin page: ${adminUrl}`);
          return true;
        } else {
          console.log(`   ✅ Authentication successful! Can access admin page: ${adminUrl}`);
          return true;
        }
      }

      // Final verification - check current URL (refresh if we navigated to admin page)
      const verificationUrl = page.url();
      const isOAuthRedirect = verificationUrl.includes('accounts.google.com') ||
                             verificationUrl.includes('oauth') ||
                             verificationUrl.includes('login.microsoftonline.com');

      if (isOAuthRedirect) {
        console.error(`   ❌ OAuth Redirect Detected!`);
        console.error(`   📍 Redirected to: ${verificationUrl}`);
        await page.screenshot({ path: 'debug-oauth-redirect.png', fullPage: true });
        return false;
      }

      const isAuthenticated = !verificationUrl.includes('/sign-in') &&
                             !verificationUrl.includes('/sign-up') &&
                             !isOAuthRedirect;

      if (isAuthenticated) {
        console.log(`   ✅ Authentication successful! Final URL: ${verificationUrl}`);
        return true;
      } else {
        console.error(`   ❌ Authentication failed - Still on sign-in page: ${verificationUrl}`);
        await page.screenshot({ path: 'debug-auth-failed.png', fullPage: true });
        return false;
      }

    } catch (checkError) {
      console.warn(`   ⚠️  Error during authentication check: ${checkError.message}`);
      const errorUrl = page.url();
      await page.screenshot({ path: 'debug-auth-error.png', fullPage: true });
      return false;
    }

    // Verify we're authenticated by checking URL (and NOT OAuth redirect)
    const currentUrl = page.url();
    const isOAuthRedirect = currentUrl.includes('accounts.google.com') ||
                           currentUrl.includes('oauth') ||
                           currentUrl.includes('login.microsoftonline.com') ||
                           currentUrl.includes('github.com') ||
                           currentUrl.includes('facebook.com');

    const isAuthenticated = !currentUrl.includes('/sign-in') &&
                           !currentUrl.includes('/sign-up') &&
                           !isOAuthRedirect;

    if (isOAuthRedirect) {
      console.error(`   ❌ OAuth Redirect Detected!`);
      console.error(`   📍 Redirected to: ${currentUrl}`);
      console.error(`   ⚠️  Your account is configured for OAuth authentication, not email/password.`);
      console.error(`   💡 Solutions:`);
      console.error(`      1. Go to Clerk Dashboard → Users → Find your user → Authentication tab`);
      console.error(`      2. Disable OAuth methods and enable Email/Password`);
      console.error(`      3. Or use a different test account with email/password enabled`);
      await page.screenshot({ path: 'debug-oauth-redirect.png', fullPage: true });
      console.error(`   📸 Screenshot saved: debug-oauth-redirect.png`);
      return false;
    }

    if (isAuthenticated) {
      console.log(`   ✅ Authentication successful! Redirected to: ${currentUrl}`);

      // CRITICAL: Verify authentication AND admin access by trying to access an admin page
      console.log(`   🔍 Verifying authentication and admin access by accessing admin page...`);
      try {
        await page.goto(`${baseUrl}/admin/manage-events`, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });
        await page.waitForTimeout(2000); // Wait for any redirects

        const adminUrl = page.url();
        if (adminUrl.includes('/sign-in') || adminUrl.includes('/sign-up')) {
          console.error(`   ❌ Admin access verification failed - redirected to: ${adminUrl}`);
          console.error(`   ⚠️  User authenticated successfully but cannot access admin pages.`);
          console.error(`   💡 This usually means the user does not have ADMIN role in the database.`);
          console.error(`   💡 Solutions:`);
          console.error(`      1. Check database: SELECT * FROM user_profile WHERE user_id = '...' AND user_role = 'ADMIN';`);
          console.error(`      2. Update role: UPDATE user_profile SET user_role = 'ADMIN' WHERE user_id = '...' AND tenant_id = '...';`);
          console.error(`      3. Or use Admin Dashboard: /admin/manage-usage → Edit user → Set Role to ADMIN`);
          console.error(`      4. User must log out and log back in after role change`);
          await page.screenshot({ path: 'debug-admin-access-failed.png', fullPage: true });
          return false;
        } else if (adminUrl === baseUrl + '/' || adminUrl === baseUrl) {
          console.error(`   ❌ CRITICAL: Redirected to homepage!`);
          console.error(`   ⚠️  User authenticated successfully but cannot access admin pages.`);
          console.error(`   💡 This means the user does not have ADMIN role in the database.`);
          console.error(`   💡 The admin layout redirects non-admin users to homepage.`);
          console.error(`   💡 Solutions:`);
          console.error(`      1. Check database: SELECT * FROM user_profile WHERE user_id = '...' AND user_role = 'ADMIN';`);
          console.error(`      2. Update role: UPDATE user_profile SET user_role = 'ADMIN' WHERE user_id = '...' AND tenant_id = '...';`);
          console.error(`      3. Or use Admin Dashboard: /admin/manage-usage → Edit user → Set Role to ADMIN`);
          console.error(`      4. User must log out and log back in after role change`);
          await page.screenshot({ path: 'debug-admin-access-failed.png', fullPage: true });
          return false;
        } else if (adminUrl.includes('/admin/manage-events')) {
          console.log(`   ✅ Admin access verified! Can access manage-events page: ${adminUrl}`);
          return true;
        } else {
          console.log(`   ✅ Admin access verified! Can access admin page: ${adminUrl}`);
          // Navigate back to home page
          await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
          return true;
        }
      } catch (verifyError) {
        console.error(`   ❌ Authentication verification error: ${verifyError.message}`);
        await page.screenshot({ path: 'debug-auth-verification-error.png', fullPage: true });
        return false;
      }
    } else {
      console.log(`   ❌ Authentication failed - still on sign-in page: ${currentUrl}`);
      // Take screenshot for debugging
      await page.screenshot({ path: 'debug-auth-failed.png', fullPage: true });
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Authentication error: ${error.message}`);
    // Take screenshot for debugging
    try {
      await page.screenshot({ path: 'debug-auth-error.png', fullPage: true });
      console.log('   📸 Debug screenshot saved: debug-auth-error.png');
    } catch (e) {
      // Ignore screenshot errors
    }
    return false;
  }
}

/**
 * Create an authenticated browser context
 *
 * @param {import('playwright').Browser} browser - Playwright browser instance
 * @param {string} baseUrl - Base URL of the application
 * @param {Object} credentials - Authentication credentials
 * @returns {Promise<{context: import('playwright').BrowserContext, page: import('playwright').Page}>}
 */
async function createAuthenticatedContext(browser, baseUrl, credentials) {
  // Create a new context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York'
  });

  const page = await context.newPage();

  // Authenticate the page
  const authenticated = await authenticatePage(page, baseUrl, credentials);

  if (!authenticated) {
    await context.close();
    throw new Error('Failed to authenticate browser context');
  }

  return { context, page };
}

/**
 * Save authentication state for reuse
 *
 * @param {import('playwright').BrowserContext} context - Authenticated browser context
 * @param {string} statePath - Path to save state file
 * @returns {Promise<void>}
 */
async function saveAuthState(context, statePath) {
  await context.storageState({ path: statePath });
}

/**
 * Load authentication state to create authenticated context
 *
 * @param {import('playwright').Browser} browser - Playwright browser instance
 * @param {string} statePath - Path to saved state file
 * @returns {Promise<{context: import('playwright').BrowserContext, page: import('playwright').Page}>}
 */
async function loadAuthState(browser, statePath) {
  // Check if state file exists
  if (!fs.existsSync(statePath)) {
    throw new Error(`Auth state file not found: ${statePath}`);
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    storageState: statePath
  });

  const page = await context.newPage();
  return { context, page };
}

export {
  authenticatePage,
  createAuthenticatedContext,
  saveAuthState,
  loadAuthState
};

