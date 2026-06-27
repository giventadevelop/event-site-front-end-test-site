# Pages with "From Email" Fields in Edit Forms

This document lists all admin pages that have edit forms containing a **"From Email"** (`fromEmail`) field.

## Edit Pages with From Email Fields

### 1. Event Edit Page
- **URL Pattern**: `/admin/events/[id]/edit`
- **Example URL**: `http://localhost:3000/admin/events/2/edit`
- **Component**: `EventForm` (from `@/components/EventForm.tsx`)
- **Field Name**: `fromEmail`
- **Field Type**: Dropdown select (uses `FromEmailSelect` component)
- **Field Location**: In the form section
- **XPath Reference**: `/html/body/div[3]/div/div[4]/form/div[19]/div[2]/div[1]` (as mentioned by user)
- **Description**: The email address used in the "From Email" field must be registered and verified with AWS SES. This field uses a dropdown populated from tenant email addresses.

### 2. Event Analytics Edit Page
- **URL Pattern**: `/admin/events-analytics/[id]/edit`
- **Example URL**: `http://localhost:3000/admin/events-analytics/2/edit`
- **Component**: `EventForm` (same component as above)
- **Field Name**: `fromEmail`
- **Field Type**: Dropdown select (uses `FromEmailSelect` component)
- **Description**: Same as Event Edit Page - uses the shared EventForm component

### 3. Newsletter Email Template Edit Page
- **URL Pattern**: `/admin/newsletter-emails/[id]`
- **Example URL**: `http://localhost:3000/admin/newsletter-emails/1`
- **Component**: `NewsletterEmailTemplateEditClient` (from `src/app/admin/newsletter-emails/[id]/NewsletterEmailTemplateEditClient.tsx`)
- **Field Name**: `fromEmail`
- **Field Type**: Text input (type="email")
- **Field Label**: "From Email" (required, marked with red asterisk)
- **Placeholder**: `e.g., events@example.com`
- **Description**: The email address that will appear as the sender of newsletter emails.
- **Validation**: 
  - Required field
  - Email format validation with pattern: `[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$`

### 4. Promotion Email Template Edit Page
- **URL Pattern**: `/admin/promotion-emails/[id]`
- **Example URL**: `http://localhost:3000/admin/promotion-emails/1`
- **Component**: `PromotionEmailTemplateEditClient` (from `src/app/admin/promotion-emails/[id]/PromotionEmailTemplateEditClient.tsx`)
- **Field Name**: `fromEmail`
- **Field Type**: Text input (type="email")
- **Field Label**: "From Email" (required, marked with red asterisk)
- **Placeholder**: `e.g., events@example.com`
- **Description**: The email address that will appear as the sender of promotional emails.
- **Validation**: 
  - Required field
  - Email format validation with pattern: `[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$`

---

## Create Forms with From Email Fields

These create forms also have "From Email" fields but are not edit pages:

### Newsletter Email Template Create Form
- **URL**: `/admin/newsletter-emails` (when in 'form' view mode)
- **Component**: `NewsletterEmailTemplateCreateForm`
- **Field Name**: `fromEmail`
- **Field Type**: Text input (type="email")

### Promotion Email Template Create Form
- **URL**: `/admin/promotion-emails` (when in 'form' view mode)
- **Component**: `PromotionEmailTemplateCreateForm`
- **Field Name**: `fromEmail`
- **Field Type**: Text input (type="email")

---

## Summary

**Total Edit Pages with From Email Fields: 4**

1. `/admin/events/[id]/edit` - Uses dropdown select
2. `/admin/events-analytics/[id]/edit` - Uses dropdown select (same component as #1)
3. `/admin/newsletter-emails/[id]` - Uses text input
4. `/admin/promotion-emails/[id]` - Uses text input

**Field Implementation Notes:**
- **Events Edit Pages** (#1, #2): Use `FromEmailSelect` component which provides a dropdown populated from tenant email addresses stored in the system
- **Email Template Edit Pages** (#3, #4): Use standard HTML email input fields with validation

**Important Note:**
For event edit pages, the fromEmail field must reference an email address that is registered in `/admin/tenant-email-addresses` and verified with AWS SES.

