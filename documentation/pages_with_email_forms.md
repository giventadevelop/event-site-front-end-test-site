# Pages with Forms Containing Email Fields

This document lists all pages in the application that contain forms with email input fields, along with their URLs.

## Public Pages

### User Authentication & Profile
1. **Sign Up Page**
   - URL: `/sign-up`
   - Component: `SignUpForm`
   - Email Field: Required email field for user registration

2. **Sign In Page**
   - URL: `/sign-in`
   - Component: `SignInForm`
   - Email Field: Email field for user authentication

3. **Profile Page**
   - URL: `/profile`
   - Component: `ProfileForm`
   - Email Field: Required email field for user profile information

### Contact Forms
4. **MOSC Contact Form**
   - URL: `/mosc/contact-form-email` (also accessible via `/mosc/email` which redirects)
   - Component: `ContactForm`
   - Email Field: Required email field (`fromEmail`) for contact form submission

### Event Registration & Checkout
5. **Event Checkout Page**
   - URL: `/events/[id]/checkout` (where `[id]` is the event ID)
   - Component: `CheckoutClient`
   - Email Field: Required email field for ticket confirmation

6. **Event Registration Form** (used in event pages)
   - Component: `EventRegistrationForm`
   - Email Field: Required email field for primary attendee information
   - Note: This component is used within event detail pages, not a standalone page

---

## Admin Pages

### Email Management
7. **Global Event Emails**
   - URL: `/admin/event-emails`
   - Component: `EmailForm`
   - Email Field: Required email address field

8. **Event-Specific Emails** (Create/Edit)
   - URL: `/admin/events/[id]/emails` (where `[id]` is the event ID)
   - Component: `EmailForm`
   - Email Field: Required email address field

9. **Event Analytics Emails** (Create/Edit)
   - URL: `/admin/events-analytics/[id]/emails` (where `[id]` is the event ID)
   - Component: `EmailForm`
   - Email Field: Required email address field

10. **Tenant Email Addresses**
    - URL: `/admin/tenant-email-addresses`
    - Component: `TenantEmailAddressForm`
    - Email Fields: 
      - `emailAddress` (required)
      - `copyToEmailAddress` (required - CC/copy-to address)

11. **Newsletter Email Templates** (Create/Edit)
    - URL: `/admin/newsletter-emails` (list)
    - URL: `/admin/newsletter-emails/[id]` (edit, where `[id]` is the template ID)
    - Component: `NewsletterEmailTemplateCreateForm`, `NewsletterEmailTemplateEditClient`
    - Email Field: `fromEmail` field in template creation/edit forms
    - Additional: Test email dialog with recipient email field

12. **Promotion Email Templates** (Create/Edit)
    - URL: `/admin/promotion-emails` (list)
    - URL: `/admin/promotion-emails/[id]` (edit, where `[id]` is the template ID)
    - Component: `PromotionEmailTemplateCreateForm`, `PromotionEmailTemplateEditClient`
    - Email Field: `fromEmail` field in template creation/edit forms
    - Additional: Test email dialog with recipient email field

### Contact Management
13. **Global Event Contacts**
    - URL: `/admin/event-contacts`
    - Component: `ContactForm`
    - Email Field: Optional email field for contact information

14. **Event-Specific Contacts** (Create/Edit)
    - URL: `/admin/events/[id]/contacts` (where `[id]` is the event ID)
    - Component: `ContactForm`
    - Email Field: Optional email field for contact information

15. **Event Analytics Contacts** (Create/Edit)
    - URL: `/admin/events-analytics/[id]/contacts` (where `[id]` is the event ID)
    - Component: `ContactForm`
    - Email Field: Optional email field for contact information

### User Management
16. **Manage Usage (User Management)**
    - URL: `/admin/manage-usage`
    - Component: `ManageUsageClient` (includes `EditUserModal`)
    - Email Field: Email field in the user edit modal for updating user profiles

### Tenant Settings (Email Configuration)
17. **Tenant Settings** (if includes email configuration)
    - URL: `/admin/tenant-management/settings/[id]` (where `[id]` is the settings ID)
    - Component: `TenantSettingsForm`
    - Email Field: May include email configuration fields (verify in component)

---

## Summary Statistics

- **Total Pages with Email Forms**: 17+ (some are dynamic routes with multiple instances)
- **Public Pages**: 6
- **Admin Pages**: 11+

## Notes

1. **Dynamic Routes**: Some pages use dynamic routes (e.g., `/events/[id]/checkout`, `/admin/events/[id]/emails`). Replace `[id]` with actual event/settings IDs when accessing.

2. **Test Email Dialogs**: Newsletter and Promotion Email template pages include test email dialogs with recipient email fields for sending test emails.

3. **Email Field Types**:
   - **Required fields**: Most forms have required email fields
   - **Optional fields**: Contact forms typically have optional email fields
   - **Multiple email fields**: Tenant Email Addresses form has two email fields (primary and CC)

4. **Component Reuse**: Some components like `EmailForm` and `ContactForm` are reused across multiple admin pages with the same email field structure.

