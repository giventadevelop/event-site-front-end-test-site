# Promotion Email Management System - Redesign Analysis & Solution

## Executive Summary

This document provides a comprehensive analysis of the current promotion email system and proposes a complete redesign with database-backed templates, event associations, dynamic promotion codes, and improved UX.

---

## 1. Current State Analysis

### 1.1 Current Implementation Issues

**Current System (`/admin/promotion-emails`):**
- ❌ **No Database Storage**: Email templates are not persisted; must be re-entered each time
- ❌ **No Event Association**: Promotions are not linked to specific events
- ❌ **Manual Promo Code Entry**: Users must manually type promo codes (error-prone)
- ❌ **No Image Upload UI**: Users must manually upload images to S3 and reference paths
- ❌ **No Template Management**: Cannot save, edit, or reuse email templates
- ❌ **No History/Audit Trail**: Cannot track which promotions were sent when
- ❌ **Poor UX**: Complex form with manual S3 path instructions

**Current Database Schema:**
- ✅ `discount_code` table exists with event association
- ✅ `event_details` table has `promotion_start_date` field
- ❌ No table for storing promotion email templates
- ❌ No table for tracking sent promotion emails

### 1.2 Current Data Flow

```
User fills form → Server Action → Proxy API → Backend → Email Service
                    ↓
              No persistence
              No template reuse
              No event association
```

---

## 2. Proposed Database Design

### 2.1 New Tables

#### Table 1: `promotion_email_template`

Stores reusable email templates with event association and image references.

```sql
CREATE TABLE public.promotion_email_template (
    id BIGINT PRIMARY KEY DEFAULT nextval('public.sequence_generator'::regclass),
    tenant_id VARCHAR(255) NOT NULL,
    event_id BIGINT NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    header_image_url VARCHAR(2048),
    footer_image_url VARCHAR(2048),
    promotion_code VARCHAR(50), -- Links to discount_code.code
    discount_code_id BIGINT, -- FK to discount_code.id
    is_active BOOLEAN DEFAULT true,
    created_by_id BIGINT, -- FK to user_profile.id
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,

    CONSTRAINT fk_promotion_template_event
        FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_promotion_template_discount_code
        FOREIGN KEY (discount_code_id) REFERENCES public.discount_code(id) ON DELETE SET NULL,
    CONSTRAINT fk_promotion_template_created_by
        FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,

    CONSTRAINT uk_template_name_per_event
        UNIQUE (tenant_id, event_id, template_name)
);

COMMENT ON TABLE public.promotion_email_template IS 'Reusable promotion email templates associated with events';
COMMENT ON COLUMN public.promotion_email_template.promotion_code IS 'Promotion code string (for display/reference)';
COMMENT ON COLUMN public.promotion_email_template.discount_code_id IS 'Links to discount_code table for dynamic code management';
```

#### Table 2: `promotion_email_sent_log`

Tracks all sent promotion emails for audit and analytics.

```sql
CREATE TABLE public.promotion_email_sent_log (
    id BIGINT PRIMARY KEY DEFAULT nextval('public.sequence_generator'::regclass),
    tenant_id VARCHAR(255) NOT NULL,
    template_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    promotion_code VARCHAR(50),
    discount_code_id BIGINT,
    sent_at TIMESTAMP DEFAULT now() NOT NULL,
    is_test_email BOOLEAN DEFAULT false,
    email_status VARCHAR(50) DEFAULT 'SENT', -- SENT, FAILED, BOUNCED
    error_message TEXT,
    sent_by_id BIGINT, -- FK to user_profile.id

    CONSTRAINT fk_promotion_log_template
        FOREIGN KEY (template_id) REFERENCES public.promotion_email_template(id) ON DELETE SET NULL,
    CONSTRAINT fk_promotion_log_event
        FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_promotion_log_discount_code
        FOREIGN KEY (discount_code_id) REFERENCES public.discount_code(id) ON DELETE SET NULL,
    CONSTRAINT fk_promotion_log_sent_by
        FOREIGN KEY (sent_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);

CREATE INDEX idx_promotion_log_event ON public.promotion_email_sent_log(event_id);
CREATE INDEX idx_promotion_log_template ON public.promotion_email_sent_log(template_id);
CREATE INDEX idx_promotion_log_sent_at ON public.promotion_email_sent_log(sent_at);
CREATE INDEX idx_promotion_log_recipient ON public.promotion_email_sent_log(recipient_email);

COMMENT ON TABLE public.promotion_email_sent_log IS 'Audit log of all sent promotion emails';
```

### 2.2 Database Relationships

```
event_details (1) ──< (N) promotion_email_template
discount_code (1) ──< (N) promotion_email_template (optional)
discount_code (1) ──< (N) promotion_email_sent_log (optional)
promotion_email_template (1) ──< (N) promotion_email_sent_log
user_profile (1) ──< (N) promotion_email_template (created_by)
user_profile (1) ──< (N) promotion_email_sent_log (sent_by)
```

---

## 3. Proposed Frontend Design

### 3.1 New Page Structure

**Route:** `/admin/promotion-emails`

**Page Sections:**

1. **Template Management Section**
   - List of saved templates (table/cards)
   - Filter by event
   - Search templates
   - Actions: Edit, Duplicate, Delete, Send Test, Send Bulk

2. **Create/Edit Template Form**
   - Event selector (required)
   - Template name (required)
   - Subject (required)
   - Promotion code selector (dropdown of existing discount codes OR create new)
   - Header image upload (with preview)
   - Footer image upload (optional, with preview)
   - HTML body editor (rich text editor or code editor)
   - Save as template button
   - Send test email button
   - Send bulk email button

3. **Email History Section**
   - Table showing sent emails
   - Filter by event, date range, status
   - View email details
   - Resend failed emails

### 3.2 Key Features

**✅ Event Association**
- Dropdown to select event
- Auto-populate event details in email template
- Filter templates by event

**✅ Dynamic Promotion Code Management**
- Dropdown showing all discount codes for selected event
- Option to create new discount code inline
- Auto-link discount code to template
- Display discount code details (type, value, validity)

**✅ Image Upload**
- Drag-and-drop image uploader
- Preview before saving
- Automatic S3 path generation
- Image optimization/resizing

**✅ Template Reusability**
- Save templates for reuse
- Duplicate templates
- Version history (future enhancement)

**✅ Better UX**
- Step-by-step wizard (optional)
- Rich text editor for HTML body
- Live preview of email template
- Template library/gallery

---

## 4. API Design (Following Cursor Rules)

### 4.1 DTOs (TypeScript)

**File:** `src/types/index.ts`

```typescript
/**
 * DTO for promotion email template, matches backend OpenAPI schema.
 */
export interface PromotionEmailTemplateDTO {
  id?: number;
  tenantId: string;
  eventId: number;
  templateName: string;
  subject: string;
  bodyHtml: string;
  headerImageUrl?: string;
  footerImageUrl?: string;
  promotionCode?: string;
  discountCodeId?: number;
  isActive?: boolean;
  createdById?: number;
  createdAt: string;
  updatedAt: string;
  event?: EventDetailsDTO;
  discountCode?: DiscountCodeDTO;
  createdBy?: UserProfileDTO;
}

/**
 * DTO for creating/updating promotion email template.
 */
export interface PromotionEmailTemplateFormDTO {
  eventId: number;
  templateName: string;
  subject: string;
  bodyHtml: string;
  headerImageUrl?: string;
  footerImageUrl?: string;
  discountCodeId?: number;
  isActive?: boolean;
}

/**
 * DTO for sending promotion email (bulk or test).
 */
export interface SendPromotionEmailDTO {
  templateId: number;
  recipientEmail?: string; // Required for test emails
  isTestEmail: boolean;
  // Optional overrides
  subjectOverride?: string;
  bodyHtmlOverride?: string;
}

/**
 * DTO for promotion email sent log entry.
 */
export interface PromotionEmailSentLogDTO {
  id?: number;
  tenantId: string;
  templateId: number;
  eventId: number;
  recipientEmail: string;
  subject: string;
  promotionCode?: string;
  discountCodeId?: number;
  sentAt: string;
  isTestEmail: boolean;
  emailStatus: 'SENT' | 'FAILED' | 'BOUNCED';
  errorMessage?: string;
  sentById?: number;
  template?: PromotionEmailTemplateDTO;
  event?: EventDetailsDTO;
}
```

### 4.2 Backend API Endpoints (Swagger/OpenAPI)

**Base Path:** `/api/promotion-email-templates`

#### GET `/api/promotion-email-templates`
- List all templates (filtered by tenant)
- Query params: `eventId.equals`, `isActive.equals`, `sort`, `page`, `size`
- Returns: `PromotionEmailTemplateDTO[]`

#### GET `/api/promotion-email-templates/{id}`
- Get single template by ID
- Returns: `PromotionEmailTemplateDTO`

#### POST `/api/promotion-email-templates`
- Create new template
- Body: `PromotionEmailTemplateFormDTO`
- Returns: `PromotionEmailTemplateDTO`

#### PATCH `/api/promotion-email-templates/{id}`
- Update template
- Body: `Partial<PromotionEmailTemplateFormDTO>`
- Returns: `PromotionEmailTemplateDTO`

#### DELETE `/api/promotion-email-templates/{id}`
- Soft delete (set `isActive = false`) or hard delete
- Returns: `204 No Content`

#### POST `/api/promotion-email-templates/{id}/send-test`
- Send test email
- Body: `{ recipientEmail: string }`
- Returns: `{ success: boolean, messageId?: string }`

#### POST `/api/promotion-email-templates/{id}/send-bulk`
- Send bulk email to all event registrants
- Body: `{ recipientEmails?: string[] }` (optional, defaults to all registrants)
- Returns: `{ success: boolean, sentCount: number, failedCount: number }`

**Base Path:** `/api/promotion-email-sent-logs`

#### GET `/api/promotion-email-sent-logs`
- List sent email logs
- Query params: `eventId.equals`, `templateId.equals`, `sentAt.greaterThanOrEqual`, `sentAt.lessThanOrEqual`, `emailStatus.equals`, `sort`, `page`, `size`
- Returns: `PromotionEmailSentLogDTO[]`

---

## 5. Implementation Steps

### Phase 1: Database Schema (Backend)
1. ✅ Create migration scripts for new tables
2. ✅ Add JPA entities in backend
3. ✅ Create repositories
4. ✅ Add REST controllers
5. ✅ Update Swagger/OpenAPI docs

### Phase 2: Frontend Infrastructure
1. ✅ Add DTOs to `src/types/index.ts`
2. ✅ Create proxy API routes:
   - `src/pages/api/proxy/promotion-email-templates/index.ts`
   - `src/pages/api/proxy/promotion-email-templates/[...slug].ts`
   - `src/pages/api/proxy/promotion-email-sent-logs/index.ts`
3. ✅ Create server actions:
   - `src/app/admin/promotion-emails/ApiServerActions.ts`

### Phase 3: UI Components
1. ✅ Create template list component
2. ✅ Create template form component
3. ✅ Create image upload component
4. ✅ Create email history component
5. ✅ Integrate rich text editor (e.g., React Quill or TinyMCE)

### Phase 4: Page Implementation
1. ✅ Redesign `/admin/promotion-emails/page.tsx`
2. ✅ Add event selector
3. ✅ Add discount code selector
4. ✅ Add image upload functionality
5. ✅ Add template management UI

### Phase 5: Testing & Refinement
1. ✅ Test template creation/editing
2. ✅ Test image upload
3. ✅ Test email sending (test & bulk)
4. ✅ Test event association
5. ✅ Test discount code linking

---

## 6. Key Design Decisions

### 6.1 Template vs. One-Time Email
- **Decision**: Store templates in database for reuse
- **Rationale**: Users often send similar promotions; templates save time and ensure consistency

### 6.2 Event Association
- **Decision**: Require event association for all templates
- **Rationale**: Promotions are event-specific; this enables better filtering and organization

### 6.3 Discount Code Linking
- **Decision**: Link templates to discount codes (optional)
- **Rationale**: Allows dynamic code management; templates can reference codes without hardcoding

### 6.4 Image Storage
- **Decision**: Store S3 URLs in database; upload via existing media management
- **Rationale**: Reuses existing infrastructure; images can be managed separately

### 6.5 Audit Trail
- **Decision**: Log all sent emails in `promotion_email_sent_log`
- **Rationale**: Required for compliance, analytics, and debugging

---

## 7. Migration Strategy

### 7.1 Existing Data
- No existing templates to migrate (current system doesn't store templates)
- Existing discount codes remain unchanged
- Existing events remain unchanged

### 7.2 Backward Compatibility
- Keep existing `/api/proxy/send-promotion-emails` endpoint (deprecated)
- New system uses new endpoints
- Gradual migration path for users

---

## 8. Future Enhancements

1. **Template Versioning**: Track template changes over time
2. **A/B Testing**: Test different subject lines/templates
3. **Scheduled Sending**: Schedule emails for future dates
4. **Email Analytics**: Open rates, click rates, conversion tracking
5. **Template Library**: Pre-built templates for common scenarios
6. **Bulk Recipient Management**: Import recipient lists from CSV
7. **Personalization**: Dynamic fields (recipient name, event details)

---

## 9. Compliance with Cursor Rules

### ✅ REST API Rules
- All API calls use `fetchWithJwtRetry` from `@/lib/proxyHandler`
- DTOs imported from `@/types`
- Tenant ID injected via `withTenantId`
- Query params use JHipster filter syntax (`.equals`, `.contains`, etc.)
- Error handling with try-catch blocks

### ✅ Server Actions Pattern
- All API calls in `ApiServerActions.ts`
- Server actions use `fetchWithJwtRetry`
- No direct fetch calls from client components

### ✅ Proxy Handler Pattern
- Use `createProxyHandler` for all proxy routes
- Automatic tenant ID injection
- Consistent error handling

---

## 10. Estimated Effort

- **Backend (Database + API)**: 3-4 days
- **Frontend (Components + Pages)**: 3-4 days
- **Testing & Refinement**: 1-2 days
- **Total**: ~7-10 days

---

## 11. Next Steps

1. **Review & Approve**: Get stakeholder approval on design
2. **Backend Implementation**: Start with database schema and API
3. **Frontend Implementation**: Build UI components
4. **Integration**: Connect frontend to backend
5. **Testing**: Comprehensive testing of all features
6. **Deployment**: Deploy to staging, then production

---

## Appendix A: Database Migration Script

See `documentation/promotion_email_redesign/migrations/001_create_promotion_tables.sql`

## Appendix B: API Swagger Schema

See `documentation/promotion_email_redesign/api-schema.yaml`

## Appendix C: Component Mockups

See `documentation/promotion_email_redesign/mockups/`







