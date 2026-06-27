-- Migration: Create Promotion Email Template and Sent Log Tables
-- Date: 2025-01-XX
-- Description: Adds database tables for storing promotion email templates and tracking sent emails

-- ============================================
-- Table: promotion_email_template
-- ============================================
CREATE TABLE IF NOT EXISTS public.promotion_email_template (
    id BIGINT PRIMARY KEY DEFAULT nextval('public.sequence_generator'::regclass),
    tenant_id VARCHAR(255) NOT NULL,
    event_id BIGINT NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    header_image_url VARCHAR(2048),
    footer_image_url VARCHAR(2048),
    promotion_code VARCHAR(50), -- Links to discount_code.code (for display/reference)
    discount_code_id BIGINT, -- FK to discount_code.id (for dynamic code management)
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

COMMENT ON TABLE public.promotion_email_template IS 'Reusable promotion email templates associated with events and discount codes';
COMMENT ON COLUMN public.promotion_email_template.template_name IS 'User-friendly name for the template (e.g., "Early Bird Discount", "Last Chance Sale")';
COMMENT ON COLUMN public.promotion_email_template.promotion_code IS 'Promotion code string for display/reference (links to discount_code.code)';
COMMENT ON COLUMN public.promotion_email_template.discount_code_id IS 'Foreign key to discount_code table for dynamic code management and validation';

-- Indexes for promotion_email_template
CREATE INDEX IF NOT EXISTS idx_promotion_template_event ON public.promotion_email_template(event_id);
CREATE INDEX IF NOT EXISTS idx_promotion_template_discount_code ON public.promotion_email_template(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_promotion_template_tenant ON public.promotion_email_template(tenant_id);
CREATE INDEX IF NOT EXISTS idx_promotion_template_active ON public.promotion_email_template(is_active) WHERE is_active = true;

-- ============================================
-- Table: promotion_email_sent_log
-- ============================================
CREATE TABLE IF NOT EXISTS public.promotion_email_sent_log (
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
        FOREIGN KEY (sent_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,

    CONSTRAINT chk_email_status CHECK (email_status IN ('SENT', 'FAILED', 'BOUNCED'))
);

COMMENT ON TABLE public.promotion_email_sent_log IS 'Audit log of all sent promotion emails for compliance, analytics, and debugging';
COMMENT ON COLUMN public.promotion_email_sent_log.email_status IS 'Status of email delivery: SENT (successful), FAILED (delivery failed), BOUNCED (recipient rejected)';
COMMENT ON COLUMN public.promotion_email_sent_log.is_test_email IS 'Indicates if this was a test email (sent to admin) or bulk email (sent to recipients)';

-- Indexes for promotion_email_sent_log
CREATE INDEX IF NOT EXISTS idx_promotion_log_event ON public.promotion_email_sent_log(event_id);
CREATE INDEX IF NOT EXISTS idx_promotion_log_template ON public.promotion_email_sent_log(template_id);
CREATE INDEX IF NOT EXISTS idx_promotion_log_sent_at ON public.promotion_email_sent_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_promotion_log_recipient ON public.promotion_email_sent_log(recipient_email);
CREATE INDEX IF NOT EXISTS idx_promotion_log_status ON public.promotion_email_sent_log(email_status);
CREATE INDEX IF NOT EXISTS idx_promotion_log_tenant ON public.promotion_email_sent_log(tenant_id);

-- ============================================
-- Rollback Script (if needed)
-- ============================================
-- DROP TABLE IF EXISTS public.promotion_email_sent_log CASCADE;
-- DROP TABLE IF EXISTS public.promotion_email_template CASCADE;







