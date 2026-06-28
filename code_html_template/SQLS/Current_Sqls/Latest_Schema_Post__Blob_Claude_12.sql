--
-- PostgreSQL database dump
--

-- Dumped ffile:/E:/project_workspace/mosc-temp/code_html_template/SQLS/corrected_event_media_inserts.ordered.sqlrom database version 16.0 (Debian 16.0-1.pgdg120+1)
-- Dumped by pg_dump version 17.0

-- Started on 2025-06-08 23:51:02
--SET ROLE giventa_event_management;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
--SET transactiofile:/E:/project_workspace/mosc-temp/code_html_template/SQLS/corrected_event_media_inserts.ordered.sqln_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--DROP DATABASE giventa_event_management;
--
-- TOC entry 3921 (class 1262 OID 58386)
-- Name: giventa_event_management; Type: DATABASE; Schema: -; Owner: giventa_event_management
--

--CREATE DATABASE giventa_event_management WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';



--\connect giventa_event_management

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Drop existing types if they exist (for clean recreation)
DROP TYPE IF EXISTS public.guest_age_group CASCADE;
DROP TYPE IF EXISTS public.user_to_guest_relationship CASCADE;
DROP TYPE IF EXISTS public.user_event_registration_status CASCADE;
DROP TYPE IF EXISTS public.user_event_check_in_status CASCADE;
DROP TYPE IF EXISTS public.subscription_plan_type CASCADE;
DROP TYPE IF EXISTS public.subscription_status_type CASCADE;
DROP TYPE IF EXISTS public.user_role_type CASCADE;
DROP TYPE IF EXISTS public.user_status_type CASCADE;
DROP TYPE IF EXISTS public.event_admission_type CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.transaction_status CASCADE;
DROP TYPE IF EXISTS public.focus_group_member_role_type CASCADE;
DROP TYPE IF EXISTS public.focus_group_member_status_type CASCADE;
DROP TYPE IF EXISTS public.tenant_email_type CASCADE;
DROP TYPE IF EXISTS public.manual_payment_method_type CASCADE;


-- Guest age group classifications
CREATE TYPE public.guest_age_group AS ENUM ('ADULT', 'TEEN', 'CHILD', 'INFANT');

-- User to guest relationship types
CREATE TYPE public.user_to_guest_relationship AS ENUM ('SPOUSE', 'CHILD', 'FRIEND', 'COLLEAGUE', 'PARENT', 'SIBLING', 'RELATIVE', 'OTHER');

-- Registration status for events
CREATE TYPE public.user_event_registration_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'WAITLISTED');

-- Check-in status for events
CREATE TYPE public.user_event_check_in_status AS ENUM ('NOT_CHECKED_IN', 'CHECKED_IN', 'NO_SHOW', 'LEFT_EARLY');

-- Subscription plans
CREATE TYPE public.subscription_plan_type AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE');

-- Subscription status
CREATE TYPE public.subscription_status_type AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'TRIAL');

-- User roles
CREATE TYPE public.user_role_type AS ENUM ('MEMBER', 'ADMIN', 'SUPER_ADMIN', 'ORGANIZER', 'VOLUNTEER');

-- User status
CREATE TYPE public.user_status_type AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'BANNED');

-- Focus group membership roles
CREATE TYPE public.focus_group_member_role_type AS ENUM ('MEMBER', 'LEAD', 'ADMIN');

-- Focus group membership status
CREATE TYPE public.focus_group_member_status_type AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- Tenant email address types
CREATE TYPE public.tenant_email_type AS ENUM ('INFO', 'SALES', 'TICKETS','CONTACT', 'SUPPORT', 'MARKETING', 'NOREPLY', 'ADMIN');

-- Event admission types
CREATE TYPE public.event_admission_type AS ENUM ('FREE', 'TICKETED', 'INVITATION_ONLY', 'DONATION_BASED');

-- Transaction types
CREATE TYPE public.transaction_type AS ENUM ('SUBSCRIPTION', 'TICKET_SALE', 'COMMISSION', 'REFUND', 'CHARGEBACK');

-- Transaction status
CREATE TYPE public.transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- Manual payment method types
CREATE TYPE public.manual_payment_method_type AS ENUM ('ZELLE_MANUAL', 'VENMO_MANUAL', 'CASH_APP_MANUAL', 'CASH', 'CHECK', 'OTHER_MANUAL');



-- ===================================================
-- drop functions
-- ===================================================
DROP FUNCTION IF EXISTS public.generate_attendee_qr_code() CASCADE;
DROP FUNCTION IF EXISTS public.generate_enhanced_qr_code() CASCADE;
DROP FUNCTION IF EXISTS public.reconcile_ticket_type_sold_quantity(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS public.manage_ticket_inventory() CASCADE;
DROP FUNCTION IF EXISTS public.update_ticket_sold_quantity() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.validate_event_dates() CASCADE;
DROP FUNCTION IF EXISTS public.validate_event_dates_alt1() CASCADE;
DROP FUNCTION IF EXISTS public.validate_event_dates_alt2() CASCADE;
DROP FUNCTION IF EXISTS public.validate_event_details() CASCADE;
DROP FUNCTION IF EXISTS public.set_transaction_reference() CASCADE;

DROP TRIGGER IF EXISTS trg_set_transaction_reference ON public.event_ticket_transaction;

-- Drop sequence if exists and recreate
DROP SEQUENCE IF EXISTS public.discount_code_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.event_live_update_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.event_score_card_detail_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.event_score_card_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.event_live_update_attachment_id_seq  CASCADE;

--spring batch job sequences
DROP SEQUENCE IF EXISTS public.batch_job_seq CASCADE;
DROP SEQUENCE IF EXISTS public.batch_job_execution_seq CASCADE;
DROP SEQUENCE IF EXISTS public.batch_step_execution_seq CASCADE;

-- ===================================================
-- DROP EXISTING TABLES (in reverse dependency order)
-- ===================================================

DROP TABLE IF EXISTS public.bulk_operation_log CASCADE;
DROP TABLE IF EXISTS public.qr_code_usage CASCADE;

DROP TABLE IF EXISTS public.event_attendee_guest CASCADE;
DROP TABLE IF EXISTS public.event_attendee_attachment CASCADE;
DROP TABLE IF EXISTS public.event_guest_pricing CASCADE;
DROP TABLE IF EXISTS public.event_attendee CASCADE;
DROP TABLE IF EXISTS public.event_admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.event_calendar_entry CASCADE;
DROP TABLE IF EXISTS public.gallery_album CASCADE;
DROP TABLE IF EXISTS public.gallery_category CASCADE;
DROP TABLE IF EXISTS public.official_document_year_bundle CASCADE;
DROP TABLE IF EXISTS public.event_media CASCADE;
DROP TABLE IF EXISTS public.official_document_category CASCADE;
DROP TABLE IF EXISTS public.event_poll_response CASCADE;
DROP TABLE IF EXISTS public.event_poll_option CASCADE;
DROP TABLE IF EXISTS public.event_poll CASCADE;
DROP TABLE IF EXISTS public.event_ticket_transaction CASCADE;
DROP TABLE IF EXISTS public.event_ticket_transaction_item CASCADE;
-- Payment orchestration tables (drop children first, then parents)
DROP TABLE IF EXISTS public.membership_subscription CASCADE;
DROP TABLE IF EXISTS public.membership_subscription_reconciliation_log CASCADE;
DROP TABLE IF EXISTS public.platform_invoice CASCADE;
DROP TABLE IF EXISTS public.user_payment_transaction CASCADE;
DROP TABLE IF EXISTS public.platform_settlement CASCADE;
DROP TABLE IF EXISTS public.membership_plan CASCADE;
DROP TABLE IF EXISTS public.payment_provider_config CASCADE;
DROP TABLE IF EXISTS public.manual_payment_request CASCADE;
DROP TABLE IF EXISTS public.manual_payment_summary_report CASCADE;
DROP TABLE IF EXISTS public.event_ticket_type CASCADE;
DROP TABLE IF EXISTS public.event_organizer CASCADE;
-- New event-related tables (in reverse dependency order)
DROP TABLE IF EXISTS public.event_program_directors CASCADE;
DROP TABLE IF EXISTS public.event_emails CASCADE;
DROP TABLE IF EXISTS public.event_sponsors_join CASCADE;
DROP TABLE IF EXISTS public.event_sponsors CASCADE;
DROP TABLE IF EXISTS public.event_contacts CASCADE;
DROP TABLE IF EXISTS public.event_featured_performers CASCADE;


-- Event competitions (drop children before event_details)
DROP TABLE IF EXISTS public.event_competition_group_member CASCADE;
DROP TABLE IF EXISTS public.event_competition_result CASCADE;
DROP TABLE IF EXISTS public.event_competition_registration CASCADE;
DROP TABLE IF EXISTS public.event_competition_participant CASCADE;
DROP TABLE IF EXISTS public.event_competition CASCADE;
DROP TABLE IF EXISTS public.event_competition_content_block CASCADE;
DROP TABLE IF EXISTS public.event_competition_day CASCADE;
DROP TABLE IF EXISTS public.event_competition_settings CASCADE;

DROP TABLE IF EXISTS public.event_recurrence_series CASCADE;
DROP TABLE IF EXISTS public.event_details CASCADE;
DROP TABLE IF EXISTS public.event_admin CASCADE;
DROP TABLE IF EXISTS public.event_live_update_attachment CASCADE;
DROP TABLE IF EXISTS public.event_live_update CASCADE;
DROP TABLE IF EXISTS public.event_score_card CASCADE;
DROP TABLE IF EXISTS public.event_score_card_detail CASCADE;
DROP TABLE IF EXISTS public.rel_event_details__discount_codes CASCADE;
DROP TABLE IF EXISTS public.user_task CASCADE;
DROP TABLE IF EXISTS public.user_subscription CASCADE;
DROP TABLE IF EXISTS public.event_type_details CASCADE;
DROP TABLE IF EXISTS public.tenant_settings CASCADE;
DROP TABLE IF EXISTS public.user_profile CASCADE;
DROP TABLE IF EXISTS public.tenant_organization CASCADE;
DROP TABLE IF EXISTS public.databasechangeloglock CASCADE;
DROP TABLE IF EXISTS public.databasechangelog CASCADE;
DROP TABLE IF EXISTS public.discount_code CASCADE;
DROP TABLE IF EXISTS public.communication_campaign CASCADE;
DROP TABLE IF EXISTS public.email_log CASCADE;
DROP TABLE IF EXISTS public.whatsapp_log CASCADE;
-- Squad roster (drop child before parent; references user_profile and tenant_organization)
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.team_groups CASCADE;
DROP TABLE IF EXISTS public.executive_committee_team_members CASCADE;
DROP TABLE IF EXISTS public.event_focus_groups CASCADE;
DROP TABLE IF EXISTS public.focus_group_members CASCADE;
DROP TABLE IF EXISTS public.focus_group CASCADE;
DROP TABLE IF EXISTS public.clerk_user_tenant CASCADE;
DROP TABLE IF EXISTS public.clerk_organization_role CASCADE;
DROP TABLE IF EXISTS public.promotion_email_template CASCADE;
DROP TABLE IF EXISTS public.promotion_email_sent_log CASCADE;
-- Drop existing tables if they exist (in reverse dependency order)
-- Spring Batch metadata tables (drop child tables first, then parent tables)
DROP TABLE IF EXISTS public.BATCH_STEP_EXECUTION_CONTEXT CASCADE;
DROP TABLE IF EXISTS public.BATCH_JOB_EXECUTION_CONTEXT CASCADE;
DROP TABLE IF EXISTS public.BATCH_STEP_EXECUTION CASCADE;
DROP TABLE IF EXISTS public.BATCH_JOB_EXECUTION_PARAMS CASCADE;
DROP TABLE IF EXISTS public.BATCH_JOB_EXECUTION CASCADE;
DROP TABLE IF EXISTS public.BATCH_JOB_INSTANCE CASCADE;
-- Custom application table (independent, no dependencies)
DROP TABLE IF EXISTS public.batch_job_execution_log CASCADE;

DROP TABLE IF EXISTS public.donation_transaction CASCADE;
DROP TABLE IF EXISTS public.donation_statistics CASCADE;

DROP TABLE IF EXISTS public.tenant_email_addresses CASCADE;

-- Satellite domain configuration
DROP TABLE IF EXISTS public.satellite_domain CASCADE;

-- News portal tables (drop children first, then parents)
DROP TABLE IF EXISTS public.news_article_category CASCADE;
DROP TABLE IF EXISTS public.news_article CASCADE;
DROP TABLE IF EXISTS public.news_flash CASCADE;
DROP TABLE IF EXISTS public.news_live_stream_config CASCADE;
DROP TABLE IF EXISTS public.news_section_display_config CASCADE;
DROP TABLE IF EXISTS public.news_sidebar_promotion CASCADE;
DROP TABLE IF EXISTS public.news_category CASCADE;





CREATE FUNCTION public.generate_attendee_qr_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.registration_status = 'CONFIRMED' AND (OLD IS NULL OR OLD.registration_status != 'CONFIRMED') THEN
        NEW.qr_code_data = 'ATTENDEE:' || NEW.id || '|EVENT:' || NEW.event_id || '|TENANT:' || NEW.tenant_id || '|TIMESTAMP:' || extract(epoch from NOW());
        NEW.qr_code_generated = TRUE;
END IF;

RETURN NEW;
END;
$$;



--
-- TOC entry 272 (class 1255 OID 71151)
-- Name: generate_enhanced_qr_code(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.generate_enhanced_qr_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
qr_data TEXT;
    event_title TEXT;
    attendee_name TEXT;
BEGIN
    -- Only generate QR code for confirmed attendees
    IF NEW.registration_status = 'CONFIRMED' AND
       (OLD IS NULL OR OLD.registration_status != 'CONFIRMED' OR OLD.qr_code_data IS NULL) THEN

        -- Get event title and attendee name for better QR code
SELECT e.title INTO event_title
FROM public.event_details e
WHERE e.id = NEW.event_id;

SELECT up.first_name || ' ' || up.last_name INTO attendee_name
FROM public.user_profile up
WHERE up.id = NEW.user_id;

-- Generate comprehensive QR code data
qr_data := 'ATTENDEE:' || NEW.id ||
                   '|EVENT:' || NEW.event_id ||
                   '|TENANT:' || NEW.tenant_id ||
                   '|NAME:' || COALESCE(attendee_name, 'Unknown') ||
                   '|EVENT_TITLE:' || COALESCE(event_title, 'Unknown Event') ||
                   '|TIMESTAMP:' || extract(epoch from NOW()) ||
                   '|TYPE:' || COALESCE(NEW.attendee_type, 'MEMBER');

        NEW.qr_code_data = qr_data;
        NEW.qr_code_generated = TRUE;
        NEW.qr_code_generated_at = NOW();

        RAISE NOTICE 'Generated QR code for attendee % at event %', attendee_name, event_title;
END IF;

RETURN NEW;
END;
$$;



--
-- TOC entry 273 (class 1255 OID 71150)
-- Name: reconcile_ticket_type_sold_quantity(bigint); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--
-- Recompute sold_quantity from completed transaction line items (source of truth).
-- Safe for bulk seed imports: ignores pre-set sold_quantity on event_ticket_type rows
-- and avoids double-counting when replaying production snapshots.
--

CREATE OR REPLACE FUNCTION public.reconcile_ticket_type_sold_quantity(p_ticket_type_id BIGINT) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    computed_sold INTEGER;
    type_cap INTEGER;
BEGIN
    IF p_ticket_type_id IS NULL THEN
        RETURN;
    END IF;

    SELECT COALESCE(SUM(etti.quantity), 0)
    INTO computed_sold
    FROM public.event_ticket_transaction_item etti
    INNER JOIN public.event_ticket_transaction ett ON ett.id = etti.transaction_id
    WHERE etti.ticket_type_id = p_ticket_type_id
      AND ett.status = 'COMPLETED';

    SELECT available_quantity
    INTO type_cap
    FROM public.event_ticket_type
    WHERE id = p_ticket_type_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket type not found for ID: %', p_ticket_type_id;
    END IF;

    IF type_cap IS NOT NULL AND computed_sold > type_cap THEN
        RAISE EXCEPTION 'Insufficient tickets available. Requested: %, Available: %',
            computed_sold, type_cap;
    END IF;

    UPDATE public.event_ticket_type
    SET sold_quantity = computed_sold,
        remaining_quantity = GREATEST(COALESCE(available_quantity, 0) - computed_sold, 0),
        updated_at = NOW()
    WHERE id = p_ticket_type_id;
END;
$$;


--
-- TOC entry 273 (class 1255 OID 71150)
-- Name: manage_ticket_inventory(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE OR REPLACE FUNCTION public.manage_ticket_inventory() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    parent_status TEXT;
    old_parent_status TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        SELECT status INTO parent_status
        FROM public.event_ticket_transaction
        WHERE id = OLD.transaction_id;

        IF parent_status = 'COMPLETED' THEN
            PERFORM public.reconcile_ticket_type_sold_quantity(OLD.ticket_type_id);
        END IF;

        RETURN OLD;
    END IF;

    SELECT status INTO parent_status
    FROM public.event_ticket_transaction
    WHERE id = NEW.transaction_id;

    IF parent_status = 'COMPLETED' THEN
        PERFORM public.reconcile_ticket_type_sold_quantity(NEW.ticket_type_id);
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.ticket_type_id IS DISTINCT FROM NEW.ticket_type_id
           OR OLD.transaction_id IS DISTINCT FROM NEW.transaction_id THEN
            SELECT status INTO old_parent_status
            FROM public.event_ticket_transaction
            WHERE id = OLD.transaction_id;

            IF old_parent_status = 'COMPLETED' THEN
                PERFORM public.reconcile_ticket_type_sold_quantity(OLD.ticket_type_id);
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;




--
-- TOC entry 255 (class 1255 OID 71143)
-- Name: update_ticket_sold_quantity(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.update_ticket_sold_quantity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'COMPLETED' THEN
UPDATE public.event_ticket_type
SET sold_quantity = sold_quantity + NEW.quantity
WHERE id = NEW.ticket_type_id;
ELSIF TG_OP = 'UPDATE' AND OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
UPDATE public.event_ticket_type
SET sold_quantity = sold_quantity + NEW.quantity
WHERE id = NEW.ticket_type_id;
ELSIF TG_OP = 'UPDATE' AND OLD.status = 'COMPLETED' AND NEW.status != 'COMPLETED' THEN
UPDATE public.event_ticket_type
SET sold_quantity = sold_quantity - OLD.quantity
WHERE id = OLD.ticket_type_id;
ELSIF TG_OP = 'DELETE' AND OLD.status = 'COMPLETED' THEN
UPDATE public.event_ticket_type
SET sold_quantity = sold_quantity - OLD.quantity
WHERE id = OLD.ticket_type_id;
END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
ELSE
        RETURN NEW;
END IF;
END;
$$;



--
-- TOC entry 271 (class 1255 OID 70264)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$;



--
-- TOC entry 254 (class 1255 OID 71141)
-- Name: validate_event_dates(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.validate_event_dates() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure start_date is not in the past (allow same day)
--    IF NEW.start_date < CURRENT_DATE THEN
--        RAISE EXCEPTION 'Event start date cannot be in the past';
--    END IF;

    -- Ensure registration deadline is before event start
    IF NEW.registration_deadline IS NOT NULL AND NEW.registration_deadline::date > NEW.start_date THEN
        RAISE EXCEPTION 'Registration deadline must be before event start date';
END IF;

RETURN NEW;
END;
$$;



--
-- TOC entry 257 (class 1255 OID 71147)
-- Name: validate_event_dates_alt1(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.validate_event_dates_alt1() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
--    IF NEW.start_date < CURRENT_DATE THEN
--        RAISE EXCEPTION 'Event start date cannot be in the past';
--    END IF;

    IF NEW.registration_deadline IS NOT NULL AND NEW.registration_deadline::date > NEW.start_date THEN
        RAISE EXCEPTION 'Registration deadline must be before event start date';
END IF;

RETURN NEW;
END;
$$;



--
-- TOC entry 258 (class 1255 OID 71148)
-- Name: validate_event_dates_alt2(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.validate_event_dates_alt2() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
--    IF NEW.start_date < CURRENT_DATE THEN
--        RAISE EXCEPTION 'Event start date cannot be in the past';
--    END IF;

    IF NEW.registration_deadline IS NOT NULL AND NEW.registration_deadline::date > NEW.start_date THEN
        RAISE EXCEPTION 'Registration deadline must be before event start date';
END IF;

RETURN NEW;
END;
$$;



--
-- TOC entry 270 (class 1255 OID 71149)
-- Name: validate_event_details(); Type: FUNCTION; Schema: public; Owner: giventa_event_management
--

CREATE FUNCTION  public.validate_event_details() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Validate start date
--    IF NEW.start_date < CURRENT_DATE THEN
--        RAISE EXCEPTION 'Event start date (%) cannot be in the past. Current date: %',
--            NEW.start_date, CURRENT_DATE;
--    END IF;

    -- Validate end date
--    IF NEW.end_date < NEW.start_date THEN
--        RAISE EXCEPTION 'Event end date (%) cannot be before start date (%)',
--            NEW.end_date, NEW.start_date;
--    END IF;

    -- JDL VALIDATION: If allowGuests = true, maxGuestsPerAttendee should be > 0
    IF NEW.allow_guests = TRUE AND (NEW.max_guests_per_attendee IS NULL OR NEW.max_guests_per_attendee <= 0) THEN
        RAISE EXCEPTION 'When guests are allowed, max_guests_per_attendee must be greater than 0';
END IF;

    -- JDL VALIDATION: Validate capacity
    IF NEW.capacity IS NOT NULL AND NEW.capacity <= 0 THEN
        RAISE EXCEPTION 'Event capacity must be greater than zero, got: %', NEW.capacity;
END IF;

    -- Log the validation success
    RAISE NOTICE 'Event validation passed for event: %', NEW.title;

RETURN NEW;
END;
$$;



--
-- TOC entry 224 (class 1259 OID 82754)


SET default_tablespace = '';

SET default_table_access_method = heap;



-- Per-table application id sequences (replaces shared sequence_generator)
-- =====================================================

DROP SEQUENCE IF EXISTS public.sequence_generator CASCADE;

CREATE SEQUENCE IF NOT EXISTS public.user_profile_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.bulk_operation_log_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_type_details_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_details_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_recurrence_series_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.focus_group_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.focus_group_members_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_focus_groups_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_guest_pricing_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_admin_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_admin_audit_log_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_attendee_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_attendee_guest_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_attendee_attachment_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_calendar_entry_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_sponsors_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_sponsors_join_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.gallery_category_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.gallery_album_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.official_document_category_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_media_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.official_document_year_bundle_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_organizer_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_poll_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_poll_option_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_poll_response_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_ticket_transaction_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_ticket_type_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_ticket_transaction_item_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.qr_code_usage_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;


CREATE SEQUENCE IF NOT EXISTS public.tenant_organization_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.tenant_settings_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.tenant_email_addresses_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.user_payment_transaction_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.user_subscription_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.user_task_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.executive_committee_team_members_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.team_groups_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.team_members_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.communication_campaign_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.email_log_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.whatsapp_log_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_featured_performers_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_contacts_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_emails_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_program_directors_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.clerk_user_tenant_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.clerk_organization_role_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.clerk_webhook_event_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.clerk_session_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.payment_provider_config_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.manual_payment_request_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.manual_payment_summary_report_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.platform_settlement_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.platform_invoice_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.membership_plan_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.membership_subscription_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.membership_subscription_reconciliation_log_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.promotion_email_template_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.promotion_email_sent_log_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.donation_transaction_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.donation_statistics_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.satellite_domain_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.news_category_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.news_article_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.news_section_display_config_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.news_sidebar_promotion_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.news_flash_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.news_live_stream_config_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.news_article_category_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_competition_settings_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_competition_day_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_competition_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_competition_participant_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_competition_registration_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_competition_result_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_competition_content_block_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.event_competition_group_member_id_seq
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    START WITH 1
    CACHE 1;


--
-- TOC entry 230 (class 1259 OID 82796)
-- Name: user_profile; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.user_profile (
                                     id bigint DEFAULT nextval('public.user_profile_id_seq'::regclass) NOT NULL,
                                     tenant_id character varying(255),
                                     user_id character varying(255) NOT NULL,
                                     first_name character varying(255),
                                     last_name character varying(255),
                                     email character varying(255),
                                     phone character varying(255),
                                     address_line_1 character varying(255),
                                     address_line_2 character varying(255),
                                     city character varying(255),
                                     state character varying(255),
                                     zip_code character varying(255),
                                     country character varying(255),
                                     notes text,
                                     family_name character varying(255),
                                     city_town character varying(255),
                                     district character varying(255),
                                     educational_institution character varying(255),
                                     profile_image_url character varying(1024),
                                     is_email_subscribed BOOLEAN,
                                     email_subscription_token VARCHAR(2048),
                                     is_email_subscription_token_used BOOLEAN,
                                     user_status character varying(50),
                                     user_role character varying(50),
                                     reviewed_by_admin_at timestamp without time zone,
                                     reviewed_by_admin_id bigint,
                                     clerk_user_id VARCHAR(255),
                                     clerk_session_id VARCHAR(255),
                                     clerk_org_id VARCHAR(255),
                                     clerk_org_role VARCHAR(100),
                                     auth_provider VARCHAR(50),
                                     auth_provider_user_id VARCHAR(255),
                                     email_verified BOOLEAN DEFAULT FALSE,
                                     profile_image_url_clerk VARCHAR(1024),
                                     last_sign_in_at TIMESTAMP WITHOUT TIME ZONE,
                                     clerk_metadata TEXT,
                                     created_at timestamp without time zone DEFAULT now() NOT NULL,
                                     updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                     CONSTRAINT check_email_format CHECK (((email IS NULL) OR ((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))),
    request_id character varying(255) UNIQUE,
    request_reason text,
    status character varying(50),
    admin_comments text,
    submitted_at timestamp without time zone,
    reviewed_at timestamp without time zone,
    approved_at timestamp without time zone,
    rejected_at timestamp without time zone,
    CONSTRAINT ux_user_profile__tenant_user UNIQUE (tenant_id, user_id),
    CONSTRAINT uq_user_profile_email_tenant UNIQUE (email, tenant_id),
    CONSTRAINT user_profile_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user_profile_reviewed_by_admin FOREIGN KEY (reviewed_by_admin_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);



--
-- TOC entry 3991 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE user_profile; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.user_profile IS 'User profiles with tenant isolation and enhanced fields';

--
-- TOC entry 238 (class 1259 OID 82938)
-- Name: bulk_operation_log; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.bulk_operation_log (
                                           id bigint DEFAULT nextval('public.bulk_operation_log_id_seq'::regclass) NOT NULL,
                                           tenant_id character varying(255),
                                           operation_type character varying(50) NOT NULL,
                                           operation_name character varying(255),
                                           performed_by bigint,
                                           target_count integer NOT NULL,
                                           success_count integer DEFAULT 0,
                                           error_count integer DEFAULT 0,
                                           skipped_count integer DEFAULT 0,
                                           operation_details  VARCHAR(16384),
                                           error_details text,
                                           execution_time_ms integer,
                                           created_at timestamp without time zone DEFAULT now() NOT NULL,
                                           completed_at timestamp without time zone,
                                           CONSTRAINT check_operation_counts CHECK ((((success_count + error_count) + skipped_count) <= target_count)),
                                           CONSTRAINT fk_bulk_operation_log__performed_by FOREIGN KEY (performed_by) REFERENCES public.user_profile(id) ON DELETE SET NULL
);



--
-- TOC entry 225 (class 1259 OID 82755)
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.databasechangelog (
                                          id character varying(255) NOT NULL,
                                          author character varying(255) NOT NULL,
                                          filename character varying(255) NOT NULL,
                                          dateexecuted timestamp without time zone NOT NULL,
                                          orderexecuted integer NOT NULL,
                                          exectype character varying(10) NOT NULL,
                                          md5sum character varying(35),
                                          description character varying(255),
                                          comments character varying(255),
                                          tag character varying(255),
                                          liquibase character varying(20),
                                          contexts character varying(255),
                                          labels character varying(255),
                                          deployment_id character varying(10)
);



--
-- TOC entry 226 (class 1259 OID 82760)
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.databasechangeloglock (
                                              id integer NOT NULL,
                                              locked boolean NOT NULL,
                                              lockgranted timestamp without time zone,
                                              lockedby character varying(255)
);




--
-- TOC entry 232 (class 1259 OID 82847)
-- Name: event_type_details; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_type_details (
                                           id bigint DEFAULT nextval('public.event_type_details_id_seq'::regclass) NOT NULL,
                                           tenant_id character varying(255),
                                           name character varying(255) NOT NULL,
                                           description text,
                                           color character varying(7) DEFAULT '#3B82F6'::character varying,
                                           icon character varying(100),
                                           is_active boolean DEFAULT true,
                                           display_order integer DEFAULT 0,
                                           created_at timestamp without time zone DEFAULT now() NOT NULL,
                                           updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                           CONSTRAINT check_color_format CHECK (((color)::text ~* '^#[0-9A-Fa-f]{6}$'::text)),
                                           CONSTRAINT ux_event_type_tenant_name UNIQUE (tenant_id, name),
    CONSTRAINT event_type_details_pkey PRIMARY KEY (id)
);



--
-- TOC entry 3981 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE event_type_details; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_type_details IS 'Event type classifications with visual customization';


--
-- TOC entry 234 (class 1259 OID 82865)
-- Name: event_details; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_details (
                                      id int8 DEFAULT nextval('public.event_details_id_seq'::regclass) NOT NULL,
                                      tenant_id varchar(255) NULL,
                                      title varchar(255) NOT NULL,
                                      caption varchar(500) NULL,
                                      description text NULL,
                                      start_date date NOT NULL,
                                      promotion_start_date date NOT NULL,
                                      end_date date NOT NULL,
                                      start_time varchar(100) NOT NULL,
                                      end_time varchar(100) NOT NULL,
                                      timezone varchar(64) NOT NULL,
                                      "location" varchar(500) NULL,
                                      directions_to_venue text NULL,
                                      capacity int4 NULL,
                                      admission_type varchar(50) NULL,
                                      is_active bool DEFAULT true NULL,
                                      max_guests_per_attendee int4 DEFAULT 0 NULL,
                                      allow_guests bool DEFAULT false NULL,
                                      require_guest_approval bool DEFAULT false NULL,
                                      enable_guest_pricing bool DEFAULT false NULL,
                                      registration_deadline timestamp NULL,
                                      cancellation_deadline timestamp NULL,
                                      minimum_age int4 NULL,
                                      maximum_age int4 NULL,
                                      requires_approval bool DEFAULT false NULL,
                                      enable_waitlist bool DEFAULT true NULL,
                                      enable_qr_code bool DEFAULT false NULL,
                                      external_registration_url varchar(1024) NULL,
                                      email_header_image_url VARCHAR(2048) NULL,
                                      from_email character varying(255) NOT NULL,
                                      created_by_id int8 NULL,
                                      event_type_id int8 NULL,
                                      created_at timestamp DEFAULT now() NOT NULL,
                                      updated_at timestamp DEFAULT now() NOT NULL,
                                      is_registration_required bool DEFAULT false NULL,
                                      is_sports_event bool DEFAULT false NULL,
                                      is_competition_event bool DEFAULT false NOT NULL,
                                      is_live bool DEFAULT false NULL,
                                      is_featured_event BOOLEAN NOT NULL DEFAULT false,
                                      featured_event_priority_ranking INT4 NOT NULL DEFAULT 0,
                                      live_event_priority_ranking INT4 NOT NULL DEFAULT 0,
                                      donation_metadata TEXT NULL,
                                      eventcube_embed_url VARCHAR(1024) NULL,
                                      event_recurrence_metadata TEXT NULL,
                                      is_recurring bool DEFAULT false NULL,
                                      recurrence_pattern varchar(50) NULL,
                                      recurrence_interval int4 NULL,
                                      recurrence_end_type varchar(20) NULL,
                                      recurrence_end_date date NULL,
                                      recurrence_occurrences int4 NULL,
                                      recurrence_weekly_days int4[] NULL,
                                      recurrence_monthly_day int4 NULL,
                                      parent_event_id int8 NULL,
                                      recurrence_series_id int8 NULL,
                                      payment_flow_mode varchar(30) DEFAULT 'STRIPE_ONLY'::character varying,
                                      manual_payment_enabled boolean DEFAULT false,
                                      CONSTRAINT check_age_ranges CHECK (((minimum_age IS NULL) OR (maximum_age IS NULL) OR (maximum_age >= minimum_age))),
                                      CONSTRAINT check_capacity_positive CHECK (((capacity IS NULL) OR (capacity > 0))),
                                      CONSTRAINT check_deadlines CHECK (((registration_deadline IS NULL) OR (cancellation_deadline IS NULL) OR (cancellation_deadline <= registration_deadline))),
                                      CONSTRAINT check_event_dates CHECK ((end_date >= start_date)),
                                      CONSTRAINT event_details_max_guests_per_attendee_check CHECK ((max_guests_per_attendee >= 0)),
                                      CONSTRAINT event_details_pkey PRIMARY KEY (id),
                                      CONSTRAINT fk_event__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,
                                      CONSTRAINT fk_event__event_type_id FOREIGN KEY (event_type_id) REFERENCES public.event_type_details(id) ON DELETE SET NULL,
                                      CONSTRAINT fk_parent_event FOREIGN KEY (parent_event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);



--
-- TOC entry 3944 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE event_details; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_details IS 'Enhanced event details with guest management and validation';


--
-- TOC entry 3945 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.max_guests_per_attendee; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.max_guests_per_attendee IS 'Maximum number of guests allowed per primary attendee';


--
-- TOC entry 3946 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.allow_guests; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.allow_guests IS 'Whether guest registrations are allowed for this event';


--
-- TOC entry 3947 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.require_guest_approval; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.require_guest_approval IS 'Whether guest registrations require admin approval';


--
-- TOC entry 3948 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.enable_guest_pricing; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.enable_guest_pricing IS 'Whether special pricing applies to guests';


--
-- TOC entry 3949 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_registration_required; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.is_registration_required IS 'Whether formal registration is required for this event';


--
-- TOC entry 3950 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_sports_event; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.is_sports_event IS 'Whether this event is a sports event';


--
-- TOC entry 3950b (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_competition_event; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.is_competition_event IS
    'When true, event uses Event Competitions flow (catalog + registrations + results), not default ticket-only checkout.';


--
-- TOC entry 3951 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_live; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.is_live IS 'Whether this event is currently live and should be featured on the home page';


--
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.metadata; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

--COMMENT ON COLUMN public.event_details.metadata IS 'Flexible TEXT field for event configuration stored as JSON string. Stores fundraiser settings, donation config, etc. Parse JSON in application code (e.g., Jackson ObjectMapper in Spring Boot).';


--
-- TOC entry 3953 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_recurring; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.is_recurring IS 'Whether this event is part of a recurring series';


--
-- TOC entry 3954 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.parent_event_id; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.parent_event_id IS 'Reference to parent event for recurring event series. NULL for parent events, set for child occurrences.';


--
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.recurrence_series_id; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_details.recurrence_series_id IS 'Series identifier for grouping recurring events. Set to parent event ID for all events in a series.';


--
-- TOC entry 256 (class 1259 OID 0)
-- Name: event_recurrence_series; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_recurrence_series (
                                                id bigint DEFAULT nextval('public.event_recurrence_series_id_seq'::regclass) NOT NULL,
                                                tenant_id character varying(255) NULL,
                                                parent_event_id bigint NOT NULL,
                                                pattern character varying(50) NOT NULL,
                                                interval integer NOT NULL,
                                                end_type character varying(20) NOT NULL,
                                                end_date date NULL,
                                                occurrences integer NULL,
                                                weekly_days integer[] NULL,
                                                monthly_day integer NULL,
                                                created_at timestamp without time zone DEFAULT now() NOT NULL,
                                                updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                                CONSTRAINT event_recurrence_series_pkey PRIMARY KEY (id),
                                                CONSTRAINT check_recurrence_occurrences CHECK (((occurrences IS NULL) OR (occurrences > 0 AND occurrences <= 1000))),
                                                CONSTRAINT check_recurrence_interval CHECK ((interval > 0)),
                                                CONSTRAINT check_recurrence_end_type CHECK ((end_type IN ('END_DATE', 'OCCURRENCES'))),
                                                CONSTRAINT fk_recurrence_series_parent_event FOREIGN KEY (parent_event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);




--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 256
-- Name: TABLE event_recurrence_series; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_recurrence_series IS 'Recurrence configuration for recurring event series. Stores pattern, interval, end conditions, and weekly/monthly specific settings.';


--
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 256
-- Name: COLUMN event_recurrence_series.parent_event_id; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_recurrence_series.parent_event_id IS 'Reference to the parent event that defines the recurring series';


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 256
-- Name: COLUMN event_recurrence_series.pattern; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_recurrence_series.pattern IS 'Recurrence pattern: DAILY, WEEKLY, BIWEEKLY, or MONTHLY';


--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 256
-- Name: COLUMN event_recurrence_series.interval; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_recurrence_series.interval IS 'Interval for recurrence (e.g., every N days, weeks, or months)';


--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 256
-- Name: COLUMN event_recurrence_series.end_type; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_recurrence_series.end_type IS 'How recurrence ends: END_DATE or OCCURRENCES';


--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 256
-- Name: COLUMN event_recurrence_series.weekly_days; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_recurrence_series.weekly_days IS 'Array of weekday numbers (0=Sunday, 1=Monday, ..., 6=Saturday) for WEEKLY/BIWEEKLY patterns';


--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 256
-- Name: COLUMN event_recurrence_series.monthly_day; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_recurrence_series.monthly_day IS 'Day of month (1-31) for MONTHLY pattern, or NULL if using last day of month';


-- ===================================================
-- Focus Groups (tenant-scoped)
-- ===================================================

CREATE TABLE public.focus_group (
                                    id bigint DEFAULT nextval('public.focus_group_id_seq'::regclass) NOT NULL,
                                    tenant_id character varying(255) NOT NULL,
                                    name character varying(120) NOT NULL,
                                    slug character varying(80) NOT NULL,
                                    description text,
                                    cover_image_url character varying(1024),
                                    is_active boolean DEFAULT true,
                                    created_at timestamp without time zone DEFAULT now() NOT NULL,
                                    updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                    CONSTRAINT focus_group_pkey PRIMARY KEY (id),
                                    CONSTRAINT ux_focus_group__tenant_slug UNIQUE (tenant_id, slug),
                                    CONSTRAINT ux_focus_group__tenant_name UNIQUE (tenant_id, name)
);

COMMENT ON TABLE public.focus_group IS 'Tenant-scoped focus groups (Career, Cultural, IT, NextGen, etc.)';


CREATE TABLE public.focus_group_members (
                                            id bigint DEFAULT nextval('public.focus_group_members_id_seq'::regclass) NOT NULL,
                                            tenant_id character varying(255) NOT NULL,
                                            focus_group_id bigint NOT NULL,
                                            user_profile_id bigint NOT NULL,
    -- Use VARCHAR for compatibility with existing Java domain models; enums retained for future hardening
                                            role character varying(50) NOT NULL DEFAULT 'MEMBER',
                                            status character varying(50) NOT NULL DEFAULT 'PENDING',
                                            created_at timestamp without time zone DEFAULT now() NOT NULL,
                                            updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                            CONSTRAINT focus_group_members_pkey PRIMARY KEY (id),
                                            CONSTRAINT ux_focus_group_members__tenant_group_user UNIQUE (tenant_id, focus_group_id, user_profile_id),
                                            CONSTRAINT fk_focus_group_members__group FOREIGN KEY (focus_group_id) REFERENCES public.focus_group(id) ON DELETE CASCADE,
                                            CONSTRAINT fk_focus_group_members__user_profile FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.focus_group_members IS 'Membership of focus groups by user_profile with roles/status';
COMMENT ON COLUMN public.focus_group_members.role IS 'Member role: MEMBER, LEAD, ADMIN, EXECUTIVE, ORGANISER. EXECUTIVE and ORGANISER denote executive/organising committee members.';
COMMENT ON COLUMN public.focus_group_members.status IS 'Membership status: PENDING, ACTIVE, INACTIVE.';


CREATE TABLE public.event_focus_groups (
                                           id bigint DEFAULT nextval('public.event_focus_groups_id_seq'::regclass) NOT NULL,
                                           tenant_id character varying(255) NOT NULL,
                                           event_id bigint NOT NULL,
                                           focus_group_id bigint NOT NULL,
                                           created_at timestamp without time zone DEFAULT now() NOT NULL,
                                           updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                           CONSTRAINT event_focus_groups_pkey PRIMARY KEY (id),
                                           CONSTRAINT ux_event_focus_groups__tenant_event_group UNIQUE (tenant_id, event_id, focus_group_id),
                                           CONSTRAINT fk_event_focus_groups__group FOREIGN KEY (focus_group_id) REFERENCES public.focus_group(id) ON DELETE CASCADE,
                                           CONSTRAINT fk_event_focus_groups__event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.event_focus_groups IS 'Join table mapping events to one or more focus groups';



--
-- TOC entry 251 (class 1259 OID 83147)
-- Name: event_guest_pricing; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_guest_pricing (
                                            id bigint DEFAULT nextval('public.event_guest_pricing_id_seq'::regclass) NOT NULL,
                                            tenant_id character varying(255),
                                            event_id bigint NOT NULL,
                                            age_group character varying(20) NOT NULL,
                                            price numeric(21,2) DEFAULT 0.00 NOT NULL,
                                            is_active boolean DEFAULT true,
                                            valid_from date,
                                            valid_to date,
                                            description character varying(255),
                                            max_guests integer,
                                            pricing_tier character varying(100),
                                            early_bird_price numeric(21,2),
                                            early_bird_deadline timestamp without time zone,
                                            group_discount_threshold integer,
                                            group_discount_percentage numeric(5,2),
                                            created_at timestamp without time zone DEFAULT now() NOT NULL,
                                            updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                            CONSTRAINT check_group_discount_threshold CHECK (((group_discount_threshold IS NULL) OR (group_discount_threshold > 1))),
                                            CONSTRAINT check_guest_pricing_amounts CHECK (((price >= (0)::numeric) AND ((early_bird_price IS NULL) OR (early_bird_price >= (0)::numeric)) AND ((group_discount_percentage IS NULL) OR ((group_discount_percentage >= (0)::numeric) AND (group_discount_percentage <= (100)::numeric))))),
                                            CONSTRAINT check_max_guests_positive CHECK (((max_guests IS NULL) OR (max_guests > 0))),
                                            CONSTRAINT check_valid_date_range CHECK (((valid_from IS NULL) OR (valid_to IS NULL) OR (valid_to >= valid_from))),
                                            CONSTRAINT event_guest_pricing_price_check CHECK ((price >= (0)::numeric)),
                                            CONSTRAINT ux_event_guest_pricing_event_age_tier UNIQUE (event_id, age_group, pricing_tier),
                                            CONSTRAINT fk_event_guest_pricing__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);



--
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE event_guest_pricing; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_guest_pricing IS 'Flexible pricing structure for event guests with JDL validation';


--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.price; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_guest_pricing.price IS 'Guest price (required, minimum 0)';


--
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.is_active; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_guest_pricing.is_active IS 'Whether this pricing is currently active';


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.valid_from; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_guest_pricing.valid_from IS 'Start date for pricing validity';


--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.valid_to; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_guest_pricing.valid_to IS 'End date for pricing validity';


--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.description; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_guest_pricing.description IS 'Pricing description (max 255 chars)';


--
-- TOC entry 219 (class 1259 OID 77427)
-- Name: event_live_update_id_seq; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.event_live_update_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 220 (class 1259 OID 77428)
-- Name: event_live_update; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_live_update (
                                          id bigint DEFAULT nextval('public.event_live_update_id_seq'::regclass) NOT NULL,
                                          event_id bigint NOT NULL,
                                          update_type character varying(20) NOT NULL,
                                          content_text text,
                                          content_image_url character varying(1024),
                                          content_video_url character varying(1024),
                                          content_link_url character varying(1024),
                                          metadata  VARCHAR(4096),
                                          display_order integer DEFAULT 0,
                                          is_default boolean DEFAULT false,
                                          created_at timestamp without time zone DEFAULT now(),
                                          updated_at timestamp without time zone DEFAULT now(),
                                          CONSTRAINT event_live_update_pkey PRIMARY KEY (id)
);



--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE event_live_update; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_live_update IS 'Live updates (text, image, video, etc.) for events';


--
-- TOC entry 221 (class 1259 OID 77445)
-- Name: event_live_update_attachment_id_seq; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.event_live_update_attachment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 222 (class 1259 OID 77446)
-- Name: event_live_update_attachment; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_live_update_attachment (
                                                    id bigint DEFAULT nextval('public.event_live_update_attachment_id_seq'::regclass) NOT NULL,
                                                    live_update_id bigint NOT NULL,
                                                    attachment_type character varying(20),
                                                    attachment_url character varying(1024),
                                                    display_order integer DEFAULT 0,
                                                    metadata  VARCHAR(4096),
                                                    created_at timestamp without time zone DEFAULT now(),
                                                    updated_at timestamp without time zone DEFAULT now(),
                                                    CONSTRAINT event_live_update_attachment_live_update_id_fkey FOREIGN KEY (live_update_id) REFERENCES public.event_live_update(id) ON DELETE CASCADE
);



--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE event_live_update_attachment; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_live_update_attachment IS 'Attachments (image, video, etc.) for live event updates';



--
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 219
-- Name: event_live_update_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: giventa_event_management
--


--
-- TOC entry 235 (class 1259 OID 82890)
-- Name: event_admin; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_admin (
                                    id bigint DEFAULT nextval('public.event_admin_id_seq'::regclass) NOT NULL,
                                    tenant_id character varying(255),
                                    role character varying(255) NOT NULL,
                                    permissions text[],
                                    is_active boolean DEFAULT true,
                                    created_at timestamp without time zone DEFAULT now() NOT NULL,
                                    updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                    user_id bigint,
                                    created_by_id bigint,
                                    CONSTRAINT ux_event_admin_user_tenant UNIQUE (user_id, tenant_id),
                                    CONSTRAINT fk_admin__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,
                                    CONSTRAINT fk_admin__user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE
);



--
-- TOC entry 249 (class 1259 OID 83122)
-- Name: event_admin_audit_log; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_admin_audit_log (
                                              id bigint DEFAULT nextval('public.event_admin_audit_log_id_seq'::regclass) NOT NULL,
                                              tenant_id character varying(255),
                                              action character varying(255) NOT NULL,
                                              table_name character varying(255) NOT NULL,
                                              record_id character varying(255) NOT NULL,
                                              changes VARCHAR(8192) NULL,
                                              old_values text,
                                              new_values text,
                                              ip_address inet,
                                              user_agent text,
                                              session_id character varying(255),
                                              created_at timestamp without time zone DEFAULT now() NOT NULL,
                                              admin_id bigint,
                                              CONSTRAINT fk_admin_audit_log__admin_id FOREIGN KEY (admin_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);



--
-- TOC entry 3932 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE event_admin_audit_log; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_admin_audit_log IS 'Comprehensive audit logging for all admin actions';

--
-- TOC entry 248 (class 1259 OID 83101)
-- Name: event_attendee; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_attendee (
                                       id bigint DEFAULT nextval('public.event_attendee_id_seq'::regclass) NOT NULL,
                                       tenant_id character varying(255),
                                       event_id bigint NOT NULL,
                                       user_id bigint,
                                       registration_status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
                                       registration_date timestamp without time zone DEFAULT now() NOT NULL,
                                       confirmation_date timestamp without time zone,
                                       cancellation_date timestamp without time zone,
                                       cancellation_reason text,
                                       attendee_type character varying(50) DEFAULT 'MEMBER'::character varying,
                                       special_requirements text,
                                       dietary_restrictions text,
                                       accessibility_needs text,
                                       emergency_contact_name character varying(255),
                                       emergency_contact_phone character varying(50),
                                       emergency_contact_relationship character varying(100),
                                       total_number_of_guests integer,
                                       number_of_guests_checked_in integer,
                                       check_in_status character varying(20) DEFAULT 'NOT_CHECKED_IN'::character varying,
                                       check_in_time timestamp without time zone,
                                       check_out_time timestamp without time zone,
                                       attendance_rating integer,
                                       feedback text,
                                       notes text,
                                       admin_notes text,
                                       qr_code_data character varying(1000),
                                       qr_code_generated boolean DEFAULT false,
                                       qr_code_generated_at timestamp without time zone,
                                       registration_source character varying(100) DEFAULT 'DIRECT'::character varying,
                                       waitlist_position integer,
                                       priority_score integer DEFAULT 0,
                                       created_at timestamp without time zone DEFAULT now() NOT NULL,
                                       updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                       first_name character varying(255),
                                       last_name character varying(255),
                                       email character varying(255),
                                       phone character varying(255),
                                       is_member boolean,
                                       CONSTRAINT event_attendee_pkey PRIMARY KEY (id),
                                       CONSTRAINT check_waitlist_position_positive CHECK (((waitlist_position IS NULL) OR (waitlist_position > 0))),
                                       CONSTRAINT event_attendee_attendance_rating_check CHECK (((attendance_rating >= 1) AND (attendance_rating <= 5))),
                                       CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE SET null,
                                       CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE SET null
);



--
-- TOC entry 3934 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE event_attendee; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_attendee IS 'Enhanced event registration and attendance tracking with QR code support';


--
-- TOC entry 3935 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN event_attendee.qr_code_data; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_attendee.qr_code_data IS 'QR code data for check-in (auto-generated)';


--
-- TOC entry 3936 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN event_attendee.qr_code_generated; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_attendee.qr_code_generated IS 'Whether QR code has been generated for this attendee';


--
-- TOC entry 3937 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN event_attendee.qr_code_generated_at; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_attendee.qr_code_generated_at IS 'Timestamp when QR code was generated';


--
-- TOC entry 250 (class 1259 OID 83131)
-- Name: event_attendee_guest; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_attendee_guest (
                                             id bigint DEFAULT nextval('public.event_attendee_guest_id_seq'::regclass) NOT NULL,
                                             tenant_id character varying(255),
                                             primary_attendee_id bigint NOT NULL,
                                             age_group character varying(20) NOT NULL,
                                             relationship character varying(20),
                                             special_requirements text,
                                             dietary_restrictions text,
                                             accessibility_needs text,
                                             registration_status character varying(20) DEFAULT 'PENDING'::character varying,
                                             check_in_status character varying(20) DEFAULT 'NOT_CHECKED_IN'::character varying,
                                             check_in_time timestamp without time zone,
                                             check_out_time timestamp without time zone,
                                             approval_status character varying(50) DEFAULT 'PENDING'::character varying,
                                             approved_by_id bigint,
                                             approved_at timestamp without time zone,
                                             rejection_reason text,
                                             pricing_tier character varying(100),
                                             fee_amount numeric(21,2) DEFAULT 0,
                                             payment_status character varying(50) DEFAULT 'PENDING'::character varying,
                                             notes text,
                                             created_at timestamp without time zone DEFAULT now() NOT NULL,
                                             updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                             CONSTRAINT check_guest_fee_non_negative CHECK ((fee_amount >= (0)::numeric)),
                                             first_name character varying(255),
                                             last_name character varying(255),
                                             email character varying(255),
                                             phone character varying(255),
                                             CONSTRAINT fk_event_attendee_guest__approved_by_id FOREIGN KEY (approved_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,
                                             CONSTRAINT fk_event_attendee_guest__primary_attendee_id FOREIGN KEY (primary_attendee_id) REFERENCES public.event_attendee(id) ON DELETE CASCADE
);

CREATE TABLE public.event_attendee_attachment (
                                                  id bigint DEFAULT nextval('public.event_attendee_attachment_id_seq'::regclass) NOT NULL,
                                                  tenant_id character varying(255),
                                                  attendee_id bigint NOT NULL,
                                                  event_id bigint NOT NULL,
                                                  title character varying(255),
                                                  description character varying(2048),
                                                  file_url character varying(2048) NOT NULL,
                                                  content_type character varying(255),
                                                  file_size integer,
                                                  original_filename character varying(255),
                                                  storage_type character varying(255) NOT NULL,
                                                  is_public boolean DEFAULT false NOT NULL,
                                                  event_media_type character varying(255) DEFAULT 'ATTENDEE_ATTACHMENT'::character varying NOT NULL,
                                                  uploaded_by_id bigint,
                                                  created_at timestamp without time zone DEFAULT now() NOT NULL,
                                                  updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                                  CONSTRAINT event_attendee_attachment_pkey PRIMARY KEY (id),
                                                  CONSTRAINT fk_event_attendee_attachment__attendee_id FOREIGN KEY (attendee_id) REFERENCES public.event_attendee(id) ON DELETE CASCADE,
                                                  CONSTRAINT fk_event_attendee_attachment__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

CREATE INDEX idx_event_attendee_attachment_attendee_created
    ON public.event_attendee_attachment(attendee_id, created_at);



--
-- TOC entry 3939 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE event_attendee_guest; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_attendee_guest IS 'Guest registrations linked to primary attendees using JDL enum types';


--
-- TOC entry 3940 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN event_attendee_guest.age_group; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_attendee_guest.age_group IS 'Guest age group: ADULT, TEEN, CHILD, INFANT';


--
-- TOC entry 3941 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN event_attendee_guest.relationship; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_attendee_guest.relationship IS 'Relationship to primary attendee';


--
-- TOC entry 247 (class 1259 OID 83088)
-- Name: event_calendar_entry; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_calendar_entry (
                                             id bigint DEFAULT nextval('public.event_calendar_entry_id_seq'::regclass) NOT NULL,
                                             tenant_id character varying(255),
                                             calendar_provider character varying(255) NOT NULL,
                                             external_event_id character varying(255),
                                             calendar_link character varying(2048) NOT NULL,
                                             sync_status character varying(50) DEFAULT 'PENDING'::character varying,
                                             last_sync_at timestamp without time zone,
                                             sync_error_message text,
                                             created_at timestamp without time zone DEFAULT now() NOT NULL,
                                             updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                             event_id bigint,
                                             created_by_id bigint,
                                             CONSTRAINT ux_calendar_entry_provider_external UNIQUE (calendar_provider, external_event_id),
                                             CONSTRAINT fk_calendar_event__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,
                                             CONSTRAINT fk_calendar_event__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);




-- Table: event_sponsors
-- Stores comprehensive sponsor/company information
CREATE TABLE public.event_sponsors (
                                       id bigint DEFAULT nextval('public.event_sponsors_id_seq'::regclass) NOT NULL,
                                       tenant_id character varying(255),
                                       event_id int8 NULL,
                                       name varchar(255) NOT NULL,
                                       type varchar(100) NOT NULL,
    -- Company information
                                       company_name varchar(255) NULL,
                                       tagline varchar(500) NULL,
                                       description text NULL,
                                       website_url varchar(1024) NULL,
    -- Contact information
                                       contact_email varchar(255) NULL,
                                       contact_phone varchar(50) NULL,
    -- Media URLs (AWS S3 or other cloud storage)
                                       logo_url varchar(1024) NULL,
                                       hero_image_url varchar(1024) NULL,
                                       banner_image_url varchar(1024) NULL,
    -- Status and metadata
                                       is_active boolean DEFAULT true NOT NULL,
                                       priority_ranking int4 DEFAULT 0 NOT NULL,
    -- Social media links (Facebook, Instagram, X (Twitter), LinkedIn, YouTube, TikTok)
                                       facebook_url varchar(1024) NULL,
                                       instagram_url varchar(1024) NULL,
                                       twitter_url varchar(1024) NULL,
                                       linkedin_url varchar(1024) NULL,
                                       youtube_url varchar(1024) NULL,
                                       tiktok_url varchar(1024) NULL,
    -- Timestamps
                                       created_at timestamp DEFAULT now() NOT NULL,
                                       updated_at timestamp DEFAULT now() NOT NULL,
    -- Constraints
                                       CONSTRAINT event_sponsors_pkey PRIMARY KEY (id),
                                       CONSTRAINT check_priority_ranking CHECK (priority_ranking >= 0),
                                       CONSTRAINT check_url_format_website CHECK (website_url IS NULL OR website_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_logo CHECK (logo_url IS NULL OR logo_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_hero CHECK (hero_image_url IS NULL OR hero_image_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_banner CHECK (banner_image_url IS NULL OR banner_image_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_facebook CHECK (facebook_url IS NULL OR facebook_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_instagram CHECK (instagram_url IS NULL OR instagram_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_twitter CHECK (twitter_url IS NULL OR twitter_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_linkedin CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_youtube CHECK (youtube_url IS NULL OR youtube_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_tiktok CHECK (tiktok_url IS NULL OR tiktok_url ~* '^https?://.*'),
    CONSTRAINT check_email_format CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT fk_event_sponsors_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

-- Table: event_sponsors_join
-- Join table for many-to-many relationship between events and sponsors
CREATE TABLE public.event_sponsors_join (
                                            id bigint DEFAULT nextval('public.event_sponsors_join_id_seq'::regclass) NOT NULL,
                                            tenant_id character varying(255),
                                            event_id bigint NOT NULL,
                                            sponsor_id bigint NOT NULL,
                                            custom_poster_url varchar(1024) NULL,
                                            created_at timestamp DEFAULT now() NOT NULL,
                                            CONSTRAINT event_sponsors_join_pkey PRIMARY KEY (id),
                                            CONSTRAINT unique_event_sponsor UNIQUE (event_id, sponsor_id),
                                            CONSTRAINT check_custom_poster_url_format CHECK (custom_poster_url IS NULL OR custom_poster_url ~* '^https?://.*'),
                                            CONSTRAINT fk_event_sponsors_join_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
                                            CONSTRAINT fk_event_sponsors_join_sponsor_id FOREIGN KEY (sponsor_id) REFERENCES public.event_sponsors(id) ON DELETE CASCADE
    );

--
-- Gallery categories (tenant-scoped lookup for album card category pills).
--

CREATE TABLE public.gallery_category (
    id bigint DEFAULT nextval('public.gallery_category_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    slug character varying(64) NOT NULL,
    display_name character varying(128) NOT NULL,
    description character varying(512) NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT gallery_category_pkey PRIMARY KEY (id),
    CONSTRAINT ux_gallery_category_tenant_slug UNIQUE (tenant_id, slug),
    CONSTRAINT check_gallery_category_slug_format CHECK (
        slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
    CONSTRAINT check_gallery_category_sort_non_negative CHECK (sort_order >= 0)
);

COMMENT ON TABLE public.gallery_category IS
    'Tenant-scoped categories for gallery albums (e.g. Ecumenical Visits, Major Events).';
COMMENT ON COLUMN public.gallery_category.slug IS
    'URL-safe identifier; unique per tenant. Used for filters and admin keys.';
COMMENT ON COLUMN public.gallery_category.display_name IS
    'Human-readable label shown on album card category pill.';

CREATE INDEX idx_gallery_category_tenant_active
    ON public.gallery_category (tenant_id, is_active, sort_order);


--
-- TOC entry 247 (class 1259 OID 83071)
-- Name: gallery_album; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.gallery_album (
                                    id int8 DEFAULT nextval('public.gallery_album_id_seq'::regclass) NOT NULL,
                                    tenant_id varchar(255) NOT NULL,
                                    title varchar(255) NOT NULL,
                                    description varchar(2048) NULL,
                                    cover_image_url varchar(2048) NULL,
                                    is_public bool DEFAULT true NOT NULL,
                                    display_order int4 DEFAULT 0 NOT NULL,
                                    gallery_category_id int8 NULL,
                                    album_year int4 NULL,
                                    event_date_start date NULL,
                                    event_date_end date NULL,
                                    event_location varchar(256) NULL,
                                    created_at timestamp DEFAULT now() NOT NULL,
                                    updated_at timestamp DEFAULT now() NOT NULL,
                                    created_by_id int8 NULL,
                                    CONSTRAINT pk_gallery_album PRIMARY KEY (id),
                                    CONSTRAINT fk_gallery_album_created_by FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,
                                    CONSTRAINT fk_gallery_album_category FOREIGN KEY (gallery_category_id) REFERENCES public.gallery_category(id) ON DELETE SET NULL,
                                    CONSTRAINT check_display_order_non_negative CHECK (display_order >= 0),
                                    CONSTRAINT chk_gallery_album_year_range CHECK (
                                        album_year IS NULL OR (album_year >= 1900 AND album_year <= 2100)
                                    ),
                                    CONSTRAINT chk_gallery_album_event_date_order CHECK (
                                        event_date_start IS NULL
                                        OR event_date_end IS NULL
                                        OR event_date_end >= event_date_start
                                    )
);


--
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 247
-- Name: COLUMN gallery_album.cover_image_url; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.gallery_album IS 'Stores gallery albums (collections of media not associated with events)';

COMMENT ON COLUMN public.gallery_album.cover_image_url IS 'URL to cover image (references event_media.file_url). Used as album thumbnail in gallery view.';

COMMENT ON COLUMN public.gallery_album.display_order IS 'Order for displaying albums in gallery (lower values appear first). Default: 0.';

COMMENT ON COLUMN public.gallery_album.is_public IS 'Whether album is visible to public gallery. Default: true.';

COMMENT ON COLUMN public.gallery_album.gallery_category_id IS
    'Optional FK to gallery_category; drives category pill on public album cards.';

COMMENT ON COLUMN public.gallery_album.album_year IS
    'Calendar year of the visit/event shown on cards (e.g. 2019). Not the same as created_at.';

COMMENT ON COLUMN public.gallery_album.event_date_start IS
    'Calendar start date of the visit/event shown on album cards (date only, no time).';

COMMENT ON COLUMN public.gallery_album.event_date_end IS
    'Optional end date for multi-day events; must be >= event_date_start when both set.';

COMMENT ON COLUMN public.gallery_album.event_location IS
    'Human-readable place (city/venue) shown after formatted date on cards, e.g. Indore, Beirut.';


--
-- Official document categories (tenant-scoped lookup for Church Resources / downloads).
-- S3 path when is_event_management_official_document = true:
--   media/{tenant_id}/official_document/{category.slug}/{official_document_year}/filename
--

CREATE TABLE public.official_document_category (
    id bigint DEFAULT nextval('public.official_document_category_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    slug character varying(128) NOT NULL,
    display_name character varying(255) NOT NULL,
    description character varying(1024) NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT official_document_category_pkey PRIMARY KEY (id),
    CONSTRAINT ux_official_document_category_tenant_slug UNIQUE (tenant_id, slug),
    CONSTRAINT check_official_document_category_slug_format CHECK (
        slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
    CONSTRAINT check_official_document_category_sort_non_negative CHECK (sort_order >= 0)
);

COMMENT ON TABLE public.official_document_category IS 'Lookup for official document types (Church Resources). Admin CRUD per tenant; slug is used as the S3 path segment under official_document/.';

COMMENT ON COLUMN public.official_document_category.slug IS 'URL-safe segment for S3: .../official_document/{slug}/{year}/. Lowercase letters, digits, single hyphens between tokens.';

CREATE INDEX idx_official_document_category_tenant_active ON public.official_document_category (tenant_id, is_active, sort_order);

-- Optional seed for tenant_demo_002. Maps legacy Church Resources titles to stable slugs for S3.
-- INSERT INTO public.official_document_category (tenant_id, slug, display_name, description, sort_order, is_active) VALUES
-- ('tenant_demo_002', 'photos', 'Photos', 'Election photos, merit evening, general downloads', 10, true),
-- ('tenant_demo_002', 'brochures', 'Brochures', 'Catholicate day book cover, brochures', 20, true),
-- ('tenant_demo_002', 'calendars', 'Calendars', 'Panjangom and yearly calendars', 30, true),
-- ('tenant_demo_002', 'insurance-benefits', 'Insurance & benefits', 'Medical insurance TPA and similar', 40, true),
-- ('tenant_demo_002', 'official-circulars', 'Official circulars', 'Kalpana and official notices', 50, true),
-- ('tenant_demo_002', 'financial-statements', 'Financial statements', 'Covering notes, MOSC financial statement formats', 60, true),
-- ('tenant_demo_002', 'magazines', 'Magazines', 'Malankara Sabha magazine and periodicals', 70, true),
-- ('tenant_demo_002', 'scholarships', 'Scholarships', 'Educational scholarship materials', 80, true),
-- ('tenant_demo_002', 'awards-events', 'Awards & merit events', 'Merit awards, merit evening', 90, true);


--
-- TOC entry 246 (class 1259 OID 83070)
-- Name: event_media; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_media (
                                    id int8 DEFAULT nextval('public.event_media_id_seq'::regclass) NOT NULL,
                                    tenant_id varchar(255) NULL,
                                    title varchar(255) NOT NULL,
                                    description varchar(2048) NULL,
                                    event_media_type varchar(255) NOT NULL,
                                    storage_type varchar(255) NOT NULL,
                                    file_url varchar(2048) NULL,
                                    file_data_content_type varchar(255) NULL,
                                    content_type varchar(255) NULL,
                                    file_size int8 NULL,
                                    is_public bool DEFAULT true NULL,
                                    event_flyer bool DEFAULT false NULL,
                                    is_email_header_image bool DEFAULT false NULL,
                                    is_event_management_official_document bool DEFAULT false NULL,
                                    official_document_category_id bigint NULL,
                                    official_document_year integer NULL,
                                    hierarchy_path text NULL,
                                    hierarchy_category_label text NULL,
                                    display_priority int4 NULL,
                                    pre_signed_url varchar(2048) NULL,
                                    pre_signed_url_expires_at timestamp NULL,
                                    thumbnail_url varchar(2048) NULL,
                                    thumbnail_pre_signed_url varchar(2048) NULL,
                                    thumbnail_pre_signed_url_expires_at timestamp NULL,
                                    alt_text varchar(500) NULL,
                                    display_order int4 DEFAULT 0 NULL,
                                    download_count int4 DEFAULT 0 NULL,
                                    is_featured_video bool DEFAULT false NULL,
                                    featured_video_url varchar(2048) NULL,
                                    is_hero_image bool DEFAULT false NULL,
                                    is_active_hero_image bool DEFAULT false NULL,
                                    start_displaying_from_date date NOT NULL,
                                    created_at timestamp DEFAULT now() NOT NULL,
                                    updated_at timestamp DEFAULT now() NOT NULL,
                                    event_id int8 NULL,
                                    uploaded_by_id int8 NULL,
                                    sponsor_id bigint NULL,
                                    event_sponsors_join_id bigint NULL,
                                    performer_id bigint NULL,
                                    director_id bigint NULL,
                                    priority_ranking INT4 NOT NULL DEFAULT 0,
                                    is_home_page_hero_image bool DEFAULT false NOT NULL,
                                    home_page_hero_display_duration_seconds int4 NULL,
                                    is_featured_event_image bool DEFAULT false NOT NULL,
                                    is_live_event_image bool DEFAULT false NOT NULL,
                                    album_id int8 NULL,
                                    event_focus_group_id bigint NULL,
                                    CONSTRAINT event_media_pkey PRIMARY KEY (id),
                                    CONSTRAINT check_download_count_non_negative CHECK ((download_count >= 0)),
                                    CONSTRAINT check_file_size_positive CHECK (((file_size IS NULL) OR (file_size >= 0))),
                                    CONSTRAINT check_priority_ranking_non_negative CHECK (priority_ranking >= 0),
                                    CONSTRAINT check_home_page_hero_display_duration CHECK (home_page_hero_display_duration_seconds IS NULL OR (home_page_hero_display_duration_seconds >= 1 AND home_page_hero_display_duration_seconds <= 600)),
                                    CONSTRAINT check_event_album_mutually_exclusive CHECK (((event_id IS NULL AND album_id IS NULL) OR (event_id IS NOT NULL AND album_id IS NULL) OR (event_id IS NULL AND album_id IS NOT NULL))),
                                    CONSTRAINT fk_event_media__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
                                    CONSTRAINT fk_event_media__uploaded_by_id FOREIGN KEY (uploaded_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,
                                    CONSTRAINT fk_event_media_sponsor_id FOREIGN KEY (sponsor_id) REFERENCES public.event_sponsors(id) ON DELETE CASCADE,
                                    CONSTRAINT fk_event_media_event_sponsors_join_id FOREIGN KEY (event_sponsors_join_id) REFERENCES public.event_sponsors_join(id) ON DELETE CASCADE,
                                    CONSTRAINT fk_event_media_album_id FOREIGN KEY (album_id) REFERENCES public.gallery_album(id) ON DELETE SET NULL,
                                    CONSTRAINT fk_event_media__event_focus_group_id FOREIGN KEY (event_focus_group_id) REFERENCES public.event_focus_groups(id) ON DELETE SET NULL,
                                    CONSTRAINT fk_event_media_official_document_category_id FOREIGN KEY (official_document_category_id) REFERENCES public.official_document_category(id) ON DELETE SET NULL
);


--
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN event_media.pre_signed_url; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_media.pre_signed_url IS 'Pre-signed URL for temporary access (max length 2048 chars)';

COMMENT ON COLUMN public.event_media.thumbnail_url IS 'Stable S3/object URL for optional card thumbnail (e.g. preview image for PDF official documents).';

COMMENT ON COLUMN public.event_media.thumbnail_pre_signed_url IS 'Optional cached presigned URL for thumbnail access (mirrors pre_signed_url pattern).';

COMMENT ON COLUMN public.event_media.thumbnail_pre_signed_url_expires_at IS 'Expiry timestamp for thumbnail_pre_signed_url.';

COMMENT ON COLUMN public.event_media.sponsor_id IS 'Reference to sponsor for sponsor-specific media files. When set, this media file belongs to a specific sponsor.';

COMMENT ON COLUMN public.event_media.event_sponsors_join_id IS 'Reference to event-sponsor join record for custom posters. When set, this media file is a custom poster for a specific event-sponsor combination.';

COMMENT ON COLUMN public.event_media.priority_ranking IS 'Priority ranking for media files (sponsor or event-sponsor). Lower values indicate higher priority (0 = highest priority). Used to determine which image to display when multiple files are available.';

COMMENT ON COLUMN public.event_media.album_id IS 'Reference to gallery album. Mutually exclusive with event_id (media belongs to either an event OR an album, not both).';

COMMENT ON COLUMN public.event_media.event_focus_group_id IS 'Optional link to event_focus_groups. When set, this media is associated with that event focus group (e.g. for uploads tagged by focus group).';

COMMENT ON COLUMN public.event_media.official_document_category_id IS 'When is_event_management_official_document is true, links to official_document_category; category.slug is used in S3 path media/{tenant_id}/official_document/{slug}/{year}/.';

COMMENT ON COLUMN public.event_media.official_document_year IS 'Calendar year segment for official-document S3 path (e.g. 2025, 2026). Required for new uploads when official document + category are set; may be NULL for legacy rows.';

COMMENT ON COLUMN public.event_media.hierarchy_path IS 'Canonical hierarchy path used for official-document tree rendering (example: Kalpana 2023\Kalpana 110 Commission\Kalpana-Commission-1.pdf).';

COMMENT ON COLUMN public.event_media.hierarchy_category_label IS 'Top-level human-readable category label inferred from mirrored legacy folders.';

COMMENT ON COLUMN public.event_media.display_priority IS 'Dedicated display priority for official documents. Lower values appear first in paginated downloads listing.';

COMMENT ON COLUMN public.event_media.home_page_hero_display_duration_seconds IS 'Duration in seconds to display this image in the homepage hero slider when is_home_page_hero_image is true. Stored as total seconds (e.g. 50, 80 for 1m20s). NULL = use app default (8 seconds). Valid range: 1–600.';


--
-- Official document year bundle (option B): one row per (tenant, category, calendar year) with optional cover image.
-- cover_event_media_id references an image (or representative) event_media row for downloads / category tiles.
--

CREATE TABLE public.official_document_year_bundle (
    id bigint DEFAULT nextval('public.official_document_year_bundle_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    official_document_category_id bigint NOT NULL,
    document_year integer NOT NULL,
    cover_event_media_id bigint NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT official_document_year_bundle_pkey PRIMARY KEY (id),
    CONSTRAINT ux_official_document_year_bundle_tenant_category_year UNIQUE (tenant_id, official_document_category_id, document_year),
    CONSTRAINT fk_official_document_year_bundle_category FOREIGN KEY (official_document_category_id) REFERENCES public.official_document_category(id) ON DELETE CASCADE,
    CONSTRAINT fk_official_document_year_bundle_cover_media FOREIGN KEY (cover_event_media_id) REFERENCES public.event_media(id) ON DELETE SET NULL,
    CONSTRAINT check_official_document_year_bundle_year CHECK (document_year >= 1900 AND document_year <= 2100)
);

COMMENT ON TABLE public.official_document_year_bundle IS 'Per-tenant, per-category, per-calendar-year grouping for Church Resources / official documents; optional cover points to event_media for UI thumbnails.';

COMMENT ON COLUMN public.official_document_year_bundle.document_year IS 'Calendar year segment matching event_media.official_document_year and S3 path .../official_document/{slug}/{year}/.';

COMMENT ON COLUMN public.official_document_year_bundle.cover_event_media_id IS 'Optional FK to event_media used as cover/thumbnail for this category+year (typically image; should match tenant and official-document flags).';

CREATE INDEX idx_official_document_year_bundle_tenant_category_year ON public.official_document_year_bundle (tenant_id, official_document_category_id, document_year);

CREATE TRIGGER update_official_document_year_bundle_updated_at BEFORE UPDATE ON public.official_document_year_bundle FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();




--
-- TOC entry 239 (class 1259 OID 82951)
-- Name: event_organizer; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_organizer (
                                        id bigint DEFAULT nextval('public.event_organizer_id_seq'::regclass) NOT NULL,
                                        tenant_id character varying(255),
                                        title character varying(255) NOT NULL,
                                        designation character varying(255),
                                        contact_email character varying(255),
                                        contact_phone character varying(255),
                                        is_primary boolean DEFAULT false,
                                        display_order integer DEFAULT 0,
                                        bio text,
                                        profile_image_url character varying(1024),
                                        created_at timestamp without time zone DEFAULT now() NOT NULL,
                                        updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                        event_id bigint,
                                        organizer_id bigint,
                                        CONSTRAINT check_contact_email_format CHECK (((contact_email IS NULL) OR ((contact_email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))),
                                        CONSTRAINT fk_event_organizer__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
                                        CONSTRAINT fk_event_organizer__organizer_id FOREIGN KEY (organizer_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);



--
-- TOC entry 243 (class 1259 OID 83028)
-- Name: event_poll; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_poll (
                                   id bigint DEFAULT nextval('public.event_poll_id_seq'::regclass) NOT NULL,
                                   tenant_id character varying(255),
                                   title character varying(255) NOT NULL,
                                   description text,
                                   is_active boolean DEFAULT true,
                                   is_anonymous boolean DEFAULT false,
                                   allow_multiple_choices boolean DEFAULT false,
                                   start_date timestamp without time zone NOT NULL,
                                   end_date timestamp without time zone,
                                   max_responses_per_user integer DEFAULT 1,
                                   results_visible_to character varying(50) DEFAULT 'ALL'::character varying,
                                   created_at timestamp without time zone DEFAULT now() NOT NULL,
                                   updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                   event_id bigint,
                                   created_by_id bigint,
                                   CONSTRAINT check_max_responses_positive CHECK ((max_responses_per_user > 0)),
                                   CONSTRAINT check_poll_dates CHECK (((end_date IS NULL) OR (end_date >= start_date))),
                                   CONSTRAINT event_poll_pkey PRIMARY KEY (id),
                                   CONSTRAINT fk_poll__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL,
                                   CONSTRAINT fk_poll__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);



--
-- TOC entry 244 (class 1259 OID 83045)
-- Name: event_poll_option; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_poll_option (
                                          id bigint DEFAULT nextval('public.event_poll_option_id_seq'::regclass) NOT NULL,
                                          tenant_id character varying(255),
                                          option_text character varying(500) NOT NULL,
                                          display_order integer DEFAULT 0,
                                          is_active boolean DEFAULT true,
                                          created_at timestamp without time zone DEFAULT now() NOT NULL,
                                          updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                          poll_id bigint,
                                          CONSTRAINT event_poll_option_pkey PRIMARY KEY (id),
                                          CONSTRAINT fk_poll_option__poll_id FOREIGN KEY (poll_id) REFERENCES public.event_poll(id) ON DELETE CASCADE
);



--
-- TOC entry 245 (class 1259 OID 83057)
-- Name: event_poll_response; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_poll_response (
                                            id bigint DEFAULT nextval('public.event_poll_response_id_seq'::regclass) NOT NULL,
                                            tenant_id character varying(255),
                                            comment text,
                                            response_value character varying(1000),
                                            is_anonymous boolean DEFAULT false,
                                            created_at timestamp without time zone DEFAULT now() NOT NULL,
                                            updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                            poll_id bigint,
                                            poll_option_id bigint,
                                            user_id bigint,
                                            CONSTRAINT ux_poll_response_user_option UNIQUE (poll_id, poll_option_id, user_id),
                                            CONSTRAINT fk_poll_response__poll_id FOREIGN KEY (poll_id) REFERENCES public.event_poll(id) ON DELETE CASCADE,
                                            CONSTRAINT fk_poll_response__poll_option_id FOREIGN KEY (poll_option_id) REFERENCES public.event_poll_option(id) ON DELETE CASCADE,
                                            CONSTRAINT fk_poll_response__user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE
);



--
-- TOC entry 216 (class 1259 OID 77393)
-- Name: event_score_card; Type: TABLE; Schema: public; Owner: giventa_event_management
--

--
-- TOC entry 217 (class 1259 OID 77410)
-- Name: event_score_card_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.event_score_card_detail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 215 (class 1259 OID 77392)
-- Name: event_score_card_id_seq; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.event_score_card_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 216 (class 1259 OID 77393)
-- Name: event_score_card; Type: TABLE; Schema: public; Owner: giventa_event_management
--


CREATE TABLE public.event_score_card (
                                         id bigint DEFAULT nextval('public.event_score_card_id_seq'::regclass) NOT NULL,
                                         event_id bigint NOT NULL,
                                         team_a_name character varying(255) NOT NULL,
                                         team_b_name character varying(255) NOT NULL,
                                         team_a_score integer DEFAULT 0 NOT NULL,
                                         team_b_score integer DEFAULT 0 NOT NULL,
                                         remarks text,
                                         created_at timestamp without time zone DEFAULT now(),
                                         updated_at timestamp without time zone DEFAULT now(),
                                         CONSTRAINT event_score_card_pkey PRIMARY KEY (id)
);



--
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 216
-- Name: TABLE event_score_card; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_score_card IS 'Score card for sports events';


--
-- TOC entry 218 (class 1259 OID 77411)
-- Name: event_score_card_detail; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_score_card_detail (
                                                id bigint DEFAULT nextval('public.event_score_card_detail_id_seq'::regclass) NOT NULL,
                                                score_card_id bigint NOT NULL,
                                                team_name character varying(255) NOT NULL,
                                                player_name character varying(255),
                                                points integer DEFAULT 0 NOT NULL,
                                                remarks text,
                                                created_at timestamp without time zone DEFAULT now(),
                                                updated_at timestamp without time zone DEFAULT now(),
                                                CONSTRAINT event_score_card_detail_pkey PRIMARY KEY (id),
                                                CONSTRAINT fk_score_card_detail__score_card_id FOREIGN KEY (score_card_id) REFERENCES public.event_score_card(id) ON DELETE CASCADE
);



--
-- TOC entry 3973 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE event_score_card_detail; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_score_card_detail IS 'Detailed breakdown for event score cards (per player or per team)';



--
-- TOC entry 3975 (class 0 OID 0)
-- Dependencies: 215
-- Name: event_score_card_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 227 (class 1259 OID 82765)
-- Name: discount_code_id_seq; Type: SEQUENCE; Schema: public; Owner: giventa_event_management
--

CREATE SEQUENCE public.discount_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- TOC entry 228 (class 1259 OID 82766)
-- Name: discount_code; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.discount_code (
                                      id bigint PRIMARY KEY DEFAULT nextval('public.discount_code_id_seq'::regclass),
                                      code character varying(50) NOT NULL,
                                      description character varying(255),
                                      discount_type character varying(20) DEFAULT 'PERCENT'::character varying NOT NULL,
                                      discount_value numeric(10,2) NOT NULL,
                                      max_uses integer,
                                      uses_count integer DEFAULT 0,
                                      valid_from timestamp without time zone,
                                      valid_to timestamp without time zone,
                                      is_active boolean DEFAULT true,
                                      created_at timestamp without time zone DEFAULT now(),
                                      updated_at timestamp without time zone DEFAULT now(),
                                      event_id bigint NOT NULL,
                                      tenant_id character varying(255) NOT NULL,
                                      CONSTRAINT discount_code_code_key UNIQUE (code),
                                      CONSTRAINT fk_discount_code_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.discount_code IS 'Discount codes for ticket purchases, now per event and tenant.';



--
-- TOC entry 241 (class 1259 OID 82986)
-- Name: event_ticket_transaction; Type: TABLE; Schema: public; Owner: giventa_event_management
-- here the transaction_reference field is auto generated as shown in the column description
--

CREATE TABLE public.event_ticket_transaction (
                                                 id bigint DEFAULT nextval('public.event_ticket_transaction_id_seq'::regclass) NOT NULL,
                                                 tenant_id character varying(255),
                                                 transaction_reference varchar(255) GENERATED ALWAYS AS ('TKTN' || id::text) STORED,
email character varying(255) NOT NULL,
first_name character varying(255),
last_name character varying(255),
phone character varying(255),
quantity INTEGER NOT NULL,
price_per_unit numeric(21,2) NOT NULL,
total_amount numeric(21,2) NOT NULL,
tax_amount numeric(21,2) DEFAULT 0,
platform_fee_amount numeric(21,2) DEFAULT 0,
discount_code_id bigint,
discount_amount numeric(21,2) DEFAULT 0,
service_fee numeric(21,2),
final_amount numeric(21,2) NOT NULL,
net_payout_amount numeric(21,2) null,
status character varying(255) DEFAULT 'PENDING'::character varying NOT NULL,
payment_method character varying(100),
payment_reference character varying(255),
stripe_checkout_session_id character varying(255),
stripe_payment_intent_id character varying(255),
purchase_date timestamp without time zone NOT NULL,
confirmation_sent_at timestamp without time zone,
refund_amount numeric(21,2) DEFAULT 0 NULL,
refund_date timestamp NULL,
refund_reason VARCHAR(2048) NULL,
stripe_customer_id varchar(255) NULL,
stripe_payment_status varchar(50) NULL,
stripe_customer_email varchar(255) NULL,
stripe_payment_currency varchar(10) NULL,
stripe_amount_discount numeric(21,2) NULL,
stripe_amount_tax numeric(21,2) NULL,
stripe_fee_amount  numeric(21,2) NULL,
qr_code_image_url character varying(2048),
event_id bigint,
user_id bigint,
created_at timestamp DEFAULT now() NOT NULL,
updated_at timestamp DEFAULT now() NOT NULL,
number_of_guests_checked_in integer,
check_in_status character varying(20) DEFAULT 'NOT_CHECKED_IN'::character varying,
check_in_time timestamp without time zone,
check_out_time timestamp without time zone,

CONSTRAINT check_email_format_transaction CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT check_transaction_amounts CHECK (((total_amount >= (0)::numeric) AND (tax_amount >= (0)::numeric) AND (discount_amount >= (0)::numeric) AND (refund_amount >= (0)::numeric) AND (final_amount >= (0)::numeric))),
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE SET null,
    CONSTRAINT event_ticket_transaction_pkey PRIMARY KEY (id),
    CONSTRAINT ux_ticket_transaction_reference UNIQUE (transaction_reference),
    CONSTRAINT unique_stripe_payment_intent UNIQUE (stripe_payment_intent_id),
    CONSTRAINT fk_ticket_transaction__discount_code_id FOREIGN KEY (discount_code_id) REFERENCES public.discount_code(id) ON DELETE SET NULL
);



--
-- TOC entry 3976 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN event_ticket_transaction.discount_code_id; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_ticket_transaction.discount_code_id IS 'Discount code used for this ticket purchase';


--
-- TOC entry 3977 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN event_ticket_transaction.discount_amount; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_ticket_transaction.discount_amount IS 'Discount amount applied to this ticket purchase';


--
-- TOC entry 240 (class 1259 OID 82964)
-- Name: event_ticket_type; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_ticket_type (
                                          id bigint DEFAULT nextval('public.event_ticket_type_id_seq'::regclass) NOT NULL,
                                          tenant_id character varying(255),
                                          name character varying(255) NOT NULL,
                                          description text,
                                          price numeric(21,2) NOT NULL,
                                          is_service_fee_included boolean DEFAULT false,
                                          service_fee numeric(21,2),
                                          code character varying(255) NOT NULL,
                                          available_quantity integer,
                                          sold_quantity integer DEFAULT 0,
                                          remaining_quantity integer,
                                          is_active boolean DEFAULT true,
                                          sale_start_date timestamp without time zone,
                                          sale_end_date timestamp without time zone,
                                          min_quantity_per_order integer DEFAULT 1,
                                          max_quantity_per_order integer DEFAULT 10,
                                          requires_approval boolean DEFAULT false,
                                          sort_order integer DEFAULT 0,
                                          created_at timestamp without time zone DEFAULT now() NOT NULL,
                                          updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                          event_id bigint,
                                          CONSTRAINT check_price_non_negative CHECK ((price >= (0)::numeric)),
                                          CONSTRAINT check_quantities_positive CHECK ((((available_quantity IS NULL) OR (available_quantity >= 0)) AND (sold_quantity >= 0) AND (min_quantity_per_order > 0) AND (max_quantity_per_order >= min_quantity_per_order))),
                                          CONSTRAINT check_sale_dates CHECK (((sale_end_date IS NULL) OR (sale_start_date IS NULL) OR (sale_end_date >= sale_start_date))),
                                          CONSTRAINT check_sold_vs_available CHECK (((available_quantity IS NULL) OR (sold_quantity <= available_quantity))),
                                          CONSTRAINT event_ticket_type_pkey PRIMARY KEY (id),
                                          CONSTRAINT ux_event_ticket_type_event_code UNIQUE (event_id, code),
                                          CONSTRAINT fk_ticket_type__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);



--
-- TOC entry 3979 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN event_ticket_type.sold_quantity; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON COLUMN public.event_ticket_type.sold_quantity IS 'Number of tickets sold (auto-updated by triggers)';


CREATE TABLE public.event_ticket_transaction_item (
                                                      id bigint DEFAULT nextval('public.event_ticket_transaction_item_id_seq'::regclass) NOT NULL,
                                                      tenant_id character varying(255),
                                                      transaction_id BIGINT NOT NULL REFERENCES public.event_ticket_transaction(id) ON DELETE CASCADE,
                                                      ticket_type_id BIGINT NOT NULL REFERENCES public.event_ticket_type(id),
                                                      quantity INTEGER NOT NULL,
                                                      price_per_unit NUMERIC(21,2) NOT NULL,
                                                      total_amount NUMERIC(21,2) NOT NULL,
    -- Optionally: discount_amount, fee_amount, etc.
                                                      created_at TIMESTAMP DEFAULT now() NOT NULL,
                                                      updated_at TIMESTAMP DEFAULT now() NOT NULL,
                                                      CONSTRAINT event_ticket_transaction_item_pkey PRIMARY KEY (id),
                                                      CONSTRAINT unique_transaction_ticket_type_tenant UNIQUE (transaction_id, ticket_type_id, tenant_id)
);
--
--
-- TOC entry 252 (class 1259 OID 83166)
-- Name: qr_code_usage; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.qr_code_usage (
                                      id bigint DEFAULT nextval('public.qr_code_usage_id_seq'::regclass) NOT NULL,
                                      tenant_id character varying(255),
                                      attendee_id bigint NOT NULL,
                                      qr_code_data character varying(1000) NOT NULL,
                                      qr_code_type character varying(50) DEFAULT 'CHECK_IN'::character varying,
                                      generated_at timestamp without time zone DEFAULT now() NOT NULL,
                                      expires_at timestamp without time zone,
                                      used_at timestamp without time zone,
                                      usage_count integer DEFAULT 0,
                                      max_usage_count integer DEFAULT 1,
                                      last_scanned_by character varying(255),
                                      scan_location character varying(255),
                                      device_info text,
                                      ip_address inet,
                                      is_valid boolean DEFAULT true,
                                      invalidated_at timestamp without time zone,
                                      invalidation_reason text,
                                      created_at timestamp without time zone DEFAULT now() NOT NULL,
                                      CONSTRAINT check_usage_counts CHECK (((usage_count >= 0) AND (max_usage_count > 0) AND (usage_count <= max_usage_count))),
                                      CONSTRAINT fk_qr_code_usage__attendee_id FOREIGN KEY (attendee_id) REFERENCES public.event_attendee(id) ON DELETE CASCADE
);



--
-- TOC entry 3983 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE qr_code_usage; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.qr_code_usage IS 'Enhanced QR code generation and usage tracking with security features';


--
-- TOC entry 223 (class 1259 OID 78121)
-- Name: rel_event_details__discount_codes; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.rel_event_details__discount_codes (
                                                          event_details_id bigint NOT NULL,
                                                          discount_codes_id bigint NOT NULL
);



--
-- TOC entry 3985 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE rel_event_details__discount_codes; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.rel_event_details__discount_codes IS 'Join table for EventDetails <-> DiscountCode many-to-many relationship';


--
-- TOC entry 229 (class 1259 OID 82779)
-- Name: tenant_organization; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.tenant_organization (
                                            id bigint DEFAULT nextval('public.tenant_organization_id_seq'::regclass) NOT NULL,
                                            tenant_id character varying(255) NOT NULL,
                                            organization_name character varying(255) NOT NULL,
                                            domain character varying(255),
                                            primary_color character varying(7),
                                            secondary_color character varying(7),
                                            logo_url character varying(1024),
                                            contact_email character varying(255) NOT NULL,
                                            contact_phone character varying(50),
                                            subscription_plan character varying(20),
                                            subscription_status character varying(20),
                                            subscription_start_date date,
                                            subscription_end_date date,
                                            monthly_fee_usd numeric(21,2),
                                            stripe_customer_id character varying(255),
                                            description character varying(1000),
                                            address_line_1 character varying(255),
                                            address_line_2 character varying(255),
                                            city character varying(255),
                                            state_province character varying(255),
                                            zip_code character varying(20),
                                            country character varying(100),
                                            website_url character varying(1024),
                                            is_active boolean DEFAULT true,
                                            created_at timestamp without time zone DEFAULT now() NOT NULL,
                                            updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                            CONSTRAINT check_monthly_fee_positive CHECK ((monthly_fee_usd >= (0)::numeric)),
                                            CONSTRAINT check_subscription_dates CHECK (((subscription_end_date IS NULL) OR (subscription_end_date >= subscription_start_date))),
                                            CONSTRAINT tenant_organization_pkey PRIMARY KEY (id),
                                            CONSTRAINT tenant_organization_tenant_id_key UNIQUE (tenant_id),
                                            CONSTRAINT tenant_organization_domain_key UNIQUE (domain)
);



--
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE tenant_organization; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.tenant_organization IS 'Multi-tenant organization configuration and subscription management';

COMMENT ON COLUMN public.tenant_organization.description IS 'Canonical long-form organization description (max 1000 chars). Source of truth — do not duplicate on tenant_settings.';
COMMENT ON COLUMN public.tenant_organization.address_line_1 IS 'Canonical primary street address line.';
COMMENT ON COLUMN public.tenant_organization.address_line_2 IS 'Canonical secondary address line (suite, unit, etc.).';
COMMENT ON COLUMN public.tenant_organization.city IS 'Canonical city or locality.';
COMMENT ON COLUMN public.tenant_organization.state_province IS 'Canonical state, province, or region.';
COMMENT ON COLUMN public.tenant_organization.zip_code IS 'Canonical ZIP or postal code.';
COMMENT ON COLUMN public.tenant_organization.country IS 'Canonical country name (free text).';
COMMENT ON COLUMN public.tenant_organization.website_url IS 'Canonical public website URL for the organization.';


--
-- TOC entry 231 (class 1259 OID 82809)
-- Name: tenant_settings; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.tenant_settings (
                                        id bigint DEFAULT nextval('public.tenant_settings_id_seq'::regclass) NOT NULL,
                                        tenant_id character varying(255) NOT NULL,
                                        tenant_organization_id bigint,
                                        allow_user_registration boolean DEFAULT true,
                                        show_events_section_in_home_page boolean DEFAULT false,
                                        show_executive_committee_section_in_home_page boolean DEFAULT false,
                                        show_team_members_section_in_home_page boolean DEFAULT false,
                                        show_sponsors_section_in_home_page boolean DEFAULT false,
                                        is_membership_subscription_enabled boolean DEFAULT false,
                                        require_admin_approval boolean DEFAULT false,
                                        enable_whatsapp_integration boolean DEFAULT false,
                                        address_line_1 character varying(255),
                                        address_line_2 character varying(255),
                                        phone_number character varying(50),
                                        zip_code character varying(20),
                                        country character varying(100),
                                        state_province character varying(100),
                                        city character varying(255),
                                        email character varying(255),
                                        description character varying(1000),
                                        whatsapp_api_key character varying(500),
                                        twilio_account_sid character varying(500),
                                        twilio_auth_token character varying(1048),
                                        twilio_whatsapp_from character varying(50),
                                        whatsapp_webhook_url character varying(1048),
                                        whatsapp_webhook_token character varying(1048),
                                        enable_email_marketing boolean DEFAULT false,
                                        homepage_cache_version bigint DEFAULT 0 NOT NULL,
                                        email_provider_config character varying(2048),
                                        custom_css character varying(8192),
                                        custom_js character varying(16384),
                                        max_events_per_month integer,
                                        max_attendees_per_event integer,
                                        enable_guest_registration boolean DEFAULT true,
                                        max_guests_per_attendee integer DEFAULT 5,
                                        default_event_capacity integer DEFAULT 100,
                                        platform_fee_percentage decimal(21,2),
                                        email_header_image_url VARCHAR(2048) NULL,
                                        email_footer_html_url VARCHAR(2048),
                                        logo_image_url VARCHAR(2048),
                                        default_hero_image_urls_json text,
                                        default_hero_display_mode character varying(32) DEFAULT 'slideshow',
                                        default_hero_include_with_events boolean DEFAULT true,
                                        default_hero_max_display_count INTEGER null,
                                        facebook_url varchar(1024) NULL,
                                        instagram_url varchar(1024) NULL,
                                        twitter_url varchar(1024) NULL,
                                        linkedin_url varchar(1024) NULL,
                                        youtube_url varchar(1024) NULL,
                                        tiktok_url varchar(1024) NULL,
                                        enable_google_adsense boolean DEFAULT false NOT NULL,
                                        google_adsense_publisher_id character varying(32),
                                        google_adsense_placements_json text,
                                        created_at timestamp without time zone DEFAULT now() NOT NULL,
                                        updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                        CONSTRAINT check_default_capacity_positive CHECK (((default_event_capacity IS NULL) OR (default_event_capacity > 0))),
                                        CONSTRAINT check_max_attendees_positive CHECK (((max_attendees_per_event IS NULL) OR (max_attendees_per_event > 0))),
                                        CONSTRAINT check_max_events_positive CHECK (((max_events_per_month IS NULL) OR (max_events_per_month > 0))),
                                        CONSTRAINT check_max_guests_positive CHECK (((max_guests_per_attendee IS NULL) OR (max_guests_per_attendee >= 0))),
                                        CONSTRAINT chk_tenant_settings_default_hero_display_mode CHECK (((default_hero_display_mode IS NULL) OR (default_hero_display_mode IN ('slideshow', 'random', 'single')))),
                                        CONSTRAINT tenant_settings_pkey PRIMARY KEY (id),
                                        CONSTRAINT tenant_settings_tenant_id_key UNIQUE (tenant_id),
                                        CONSTRAINT fk_tenant_settings__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
                                        CONSTRAINT fk_tenant_settings_organization_id FOREIGN KEY (tenant_organization_id) REFERENCES public.tenant_organization(id) ON DELETE CASCADE
);


-- Index for tenant_organization_id foreign key for better query performance
CREATE INDEX idx_tenant_settings_organization_id ON public.tenant_settings(tenant_organization_id);

--
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE tenant_settings; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.tenant_settings IS 'Tenant-specific configuration settings with enhanced options';

COMMENT ON COLUMN public.tenant_settings.tenant_organization_id IS 'Foreign key reference to tenant_organization.id for standard Long->Long relationship';

COMMENT ON COLUMN public.tenant_settings.address_line_1 IS 'DEPRECATED v2.0 — use tenant_organization.address_line_1. Read fallback only; do not PATCH.';
COMMENT ON COLUMN public.tenant_settings.address_line_2 IS 'DEPRECATED v2.0 — use tenant_organization.address_line_2. Read fallback only; do not PATCH.';
COMMENT ON COLUMN public.tenant_settings.state_province IS 'DEPRECATED v2.0 — use tenant_organization.state_province. Read fallback only; do not PATCH.';
COMMENT ON COLUMN public.tenant_settings.zip_code IS 'DEPRECATED v2.0 — use tenant_organization.zip_code. Read fallback only; do not PATCH.';
COMMENT ON COLUMN public.tenant_settings.country IS 'DEPRECATED v2.0 — use tenant_organization.country. Read fallback only; do not PATCH.';

COMMENT ON COLUMN public.tenant_settings.facebook_url IS 'Organization Facebook profile or page URL for Follow our journey section';
COMMENT ON COLUMN public.tenant_settings.instagram_url IS 'Organization Instagram profile URL for Follow our journey section';
COMMENT ON COLUMN public.tenant_settings.twitter_url IS 'Organization X (Twitter) profile URL for Follow our journey section';
COMMENT ON COLUMN public.tenant_settings.linkedin_url IS 'Organization LinkedIn profile or company page URL for Follow our journey section';
COMMENT ON COLUMN public.tenant_settings.youtube_url IS 'Organization YouTube channel URL for Follow our journey section';
COMMENT ON COLUMN public.tenant_settings.tiktok_url IS 'Organization TikTok profile URL for Follow our journey section';
COMMENT ON COLUMN public.tenant_settings.show_executive_committee_section_in_home_page IS 'When true, homepage shows executive committee TeamSection';
COMMENT ON COLUMN public.tenant_settings.show_team_members_section_in_home_page IS 'When true, homepage shows squad roster SquadRosterSection';

COMMENT ON COLUMN public.tenant_settings.default_hero_image_urls_json IS 'JSON array of HTTPS URLs for tenant default homepage hero images, e.g. ["https://.../slide-01.webp"]. Order defines slideshow sequence.';

COMMENT ON COLUMN public.tenant_settings.default_hero_display_mode IS 'How tenant default hero URLs are used when no event heroes or as trailing slides: slideshow | random | single.';

COMMENT ON COLUMN public.tenant_settings.default_hero_include_with_events IS 'When TRUE, frontend may append tenant default slides after upcoming event hero images.';

COMMENT ON COLUMN public.tenant_settings.enable_google_adsense IS 'Master on/off for Google AdSense ad regions on this tenant satellite site.';
COMMENT ON COLUMN public.tenant_settings.google_adsense_publisher_id IS 'AdSense publisher ID (ca-pub-...) required when enable_google_adsense is true.';
COMMENT ON COLUMN public.tenant_settings.google_adsense_placements_json IS 'JSON map of layout region id to AdSense ad slot id, e.g. {"sidebar":"123","between_sections":"456","footer_strip":"789"}.';

--
-- TOC entry (class 1259 OID)
-- Name: tenant_email_addresses; Type: TABLE; Schema: public; Owner: giventa_event_management
--



CREATE TABLE public.tenant_email_addresses (
                                        id bigint DEFAULT nextval('public.tenant_email_addresses_id_seq'::regclass) NOT NULL,
                                        tenant_id character varying(255) NOT NULL,
                                        email_address character varying(255) NOT NULL,
                                        copy_to_email_address character varying(255) ,
                                        reply_to_email_address character varying(255) ,
                                        email_type character varying(255) NOT NULL,
                                        display_name character varying(255),
                                        is_active boolean DEFAULT true NOT NULL,
                                        is_default boolean DEFAULT false NOT NULL,
                                        description text,
                                        created_at timestamp without time zone DEFAULT now() NOT NULL,
                                        updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                        CONSTRAINT tenant_email_addresses_pkey PRIMARY KEY (id),
                                        CONSTRAINT fk_tenant_email_addresses__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
                                        CONSTRAINT ux_tenant_email_addresses_tenant_type UNIQUE (tenant_id, email_type, email_address)
);

-- Index for tenant_id foreign key for better query performance
CREATE INDEX idx_tenant_email_addresses_tenant_id ON public.tenant_email_addresses(tenant_id);

-- Index for email_type for filtering by type
CREATE INDEX idx_tenant_email_addresses_email_type ON public.tenant_email_addresses(email_type);

-- Index for is_active and is_default for quick lookups
CREATE INDEX idx_tenant_email_addresses_active_default ON public.tenant_email_addresses(tenant_id, is_active, is_default) WHERE is_active = true;

-- Unique constraint: Only one default email per type per tenant
CREATE UNIQUE INDEX IF NOT EXISTS unique_tenant_email_default_per_type
    ON public.tenant_email_addresses(tenant_id, email_type)
    WHERE is_default = true;

--
-- TOC entry (class 0 OID 0)
-- Name: TABLE tenant_email_addresses; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.tenant_email_addresses IS 'Stores registered email addresses for tenants categorized by type (info, sales, contact, support, marketing, noreply, admin). Used as "from" email addresses when sending emails to clients/users.';

COMMENT ON COLUMN public.tenant_email_addresses.tenant_id IS 'Foreign key reference to tenant_organization.tenant_id for multi-tenant isolation';

COMMENT ON COLUMN public.tenant_email_addresses.email_address IS 'The email address (e.g., info@example.com, sales@example.com)';

COMMENT ON COLUMN public.tenant_email_addresses.email_type IS 'Type of email address: INFO, SALES, CONTACT, SUPPORT, MARKETING, NOREPLY, ADMIN';

COMMENT ON COLUMN public.tenant_email_addresses.display_name IS 'Display name for the email address (e.g., "Customer Support", "Sales Team")';

COMMENT ON COLUMN public.tenant_email_addresses.is_active IS 'Whether this email address is currently active and can be used for sending emails';

COMMENT ON COLUMN public.tenant_email_addresses.is_default IS 'Whether this is the default email address for this type (only one default per type per tenant)';

COMMENT ON COLUMN public.tenant_email_addresses.description IS 'Optional description or notes about this email address';

--
-- TOC entry 3927 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE discount_code; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.discount_code IS 'Discount codes for ticket purchases';
--
-- TOC entry 242 (class 1259 OID 83010)
-- Name: user_payment_transaction; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.user_payment_transaction (
                                                 id bigint DEFAULT nextval('public.user_payment_transaction_id_seq'::regclass) NOT NULL,
                                                 tenant_id character varying(255) NOT NULL,
                                                 transaction_type character varying(20) NOT NULL,
                                                 amount numeric(21,2) NOT NULL,
                                                 currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
                                                 stripe_payment_intent_id character varying(255),
                                                 stripe_transfer_group character varying(255),
                                                 platform_fee_amount numeric(21,2) DEFAULT 0,
                                                 tenant_amount numeric(21,2) DEFAULT 0,
                                                 status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
                                                 processing_fee numeric(21,2) DEFAULT 0,
                                                 metadata text,
                                                 external_transaction_id character varying(255),
                                                 payment_method character varying(100),
                                                 failure_reason text,
                                                 reconciliation_date date,
                                                 event_id bigint,
                                                 ticket_transaction_id bigint,
                                                 created_at timestamp without time zone DEFAULT now() NOT NULL,
                                                 updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                                 CONSTRAINT user_payment_transaction_pkey PRIMARY KEY (id),
                                                 CONSTRAINT check_payment_amounts CHECK (((amount >= (0)::numeric) AND (platform_fee_amount >= (0)::numeric) AND (tenant_amount >= (0)::numeric) AND (processing_fee >= (0)::numeric))),
                                                 CONSTRAINT ux_payment_transaction_stripe_intent UNIQUE (stripe_payment_intent_id),
                                                 CONSTRAINT fk_payment_transaction__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE SET NULL,
                                                 CONSTRAINT fk_payment_transaction__ticket_transaction_id FOREIGN KEY (ticket_transaction_id) REFERENCES public.event_ticket_transaction(id) ON DELETE SET NULL
);





--
-- TOC entry 233 (class 1259 OID 82848)
-- Name: user_subscription; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.user_subscription (
                                          id bigint DEFAULT nextval('public.user_subscription_id_seq'::regclass) NOT NULL,
                                          tenant_id character varying(255),
                                          stripe_customer_id character varying(255),
                                          stripe_subscription_id character varying(255),
                                          stripe_price_id character varying(255),
                                          stripe_current_period_end timestamp without time zone,
                                          status character varying(255) NOT NULL,
                                          trial_ends_at timestamp without time zone,
                                          cancel_at_period_end boolean DEFAULT false,
                                          user_profile_id bigint,
                                          created_at timestamp without time zone DEFAULT now() NOT NULL,
                                          updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                          CONSTRAINT ux_user_subscription__stripe_customer_id UNIQUE (stripe_customer_id),
                                          CONSTRAINT ux_user_subscription__stripe_subscription_id UNIQUE (stripe_subscription_id),
                                          CONSTRAINT ux_user_subscription__user_profile_id UNIQUE (user_profile_id),
                                          CONSTRAINT fk_user_subscription__user_profile_id FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id) ON DELETE CASCADE
);



CREATE TABLE public.user_task (
                                  id bigint DEFAULT nextval('public.user_task_id_seq'::regclass) NOT NULL,
                                  tenant_id character varying(255),
                                  title character varying(255) NOT NULL,
                                  description  VARCHAR(4096),
                                  status character varying(255) DEFAULT 'PENDING'::character varying NOT NULL,
                                  priority character varying(255) DEFAULT 'MEDIUM'::character varying NOT NULL,
                                  due_date timestamp without time zone,
                                  completed boolean DEFAULT false NOT NULL,
                                  completion_date timestamp without time zone,
                                  estimated_hours numeric(5,2),
                                  actual_hours numeric(5,2),
                                  progress_percentage integer DEFAULT 0,
                                  event_id bigint,
                                  assignee_name character varying(255),
                                  assignee_contact_phone character varying(50),
                                  assignee_contact_email character varying(255),
                                  created_at timestamp without time zone DEFAULT now() NOT NULL,
                                  updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                  user_id bigint,
                                  CONSTRAINT check_completion_logic CHECK (((completed = false) OR ((completed = true) AND (completion_date IS NOT NULL)))),
                                  CONSTRAINT user_task_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100))),
                                  CONSTRAINT fk_user_task_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE SET NULL,
                                  CONSTRAINT fk_user_task_user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE
);

-- Create the executive_committee_team_members table
CREATE TABLE public.executive_committee_team_members (
                                                         id bigint DEFAULT nextval('public.executive_committee_team_members_id_seq'::regclass) NOT NULL,
                                                         tenant_id character varying(255) NOT NULL,
                                                         first_name VARCHAR(255) NOT NULL,
                                                         last_name VARCHAR(255) NOT NULL,
                                                         title VARCHAR(255) NOT NULL,
                                                         designation VARCHAR(255),
                                                         bio VARCHAR(2048),
                                                         email VARCHAR(255),
                                                         priority_order integer,
                                                         profile_image_url VARCHAR(500),
                                                         expertise VARCHAR(500),
                                                         image_background VARCHAR(255),
                                                         image_style VARCHAR(100),
                                                         department VARCHAR(100),
                                                         join_date DATE,
                                                         is_active BOOLEAN DEFAULT TRUE,
                                                         linkedin_url VARCHAR(500),
                                                         twitter_url VARCHAR(500),
                                                         website_url VARCHAR(500),
                                                         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                         CONSTRAINT executive_committee_team_members_pkey PRIMARY KEY (id),
                                                         CONSTRAINT fk_executive_committee_team_members__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_exec_team_members_tenant_id ON public.executive_committee_team_members(tenant_id);
CREATE INDEX idx_exec_team_members_name ON public.executive_committee_team_members(first_name);
CREATE INDEX idx_exec_team_members_department ON public.executive_committee_team_members(department);
CREATE INDEX idx_exec_team_members_is_active ON public.executive_committee_team_members(is_active);
CREATE INDEX idx_exec_team_members_join_date ON public.executive_committee_team_members(join_date);

-- Add comments for documentation
COMMENT ON TABLE public.executive_committee_team_members IS 'Stores information about executive committee team members';
COMMENT ON COLUMN public.executive_committee_team_members.tenant_id IS 'Foreign key reference to tenant_organization.tenant_id for multi-tenant isolation';
COMMENT ON COLUMN public.executive_committee_team_members.expertise IS 'JSON array of skills and expertise areas';
COMMENT ON COLUMN public.executive_committee_team_members.is_active IS 'Whether the team member is currently active';


-- Create team_groups table (sports squad / music band roster metadata)
CREATE TABLE public.team_groups (
    id bigint DEFAULT nextval('public.team_groups_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    team_type character varying(32) NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100),
    section_label character varying(64),
    headline character varying(255),
    description character varying(2048),
    cta_label character varying(128),
    cta_href character varying(500),
    display_order integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT team_groups_pkey PRIMARY KEY (id),
    CONSTRAINT chk_team_groups__team_type CHECK (team_type IN ('SPORTS', 'MUSIC', 'OTHER')),
    CONSTRAINT fk_team_groups__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ux_team_groups__tenant_slug ON public.team_groups (tenant_id, slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_team_groups_tenant_id ON public.team_groups(tenant_id);
CREATE INDEX idx_team_groups_tenant_active ON public.team_groups(tenant_id, is_active);

COMMENT ON TABLE public.team_groups IS 'Tenant-scoped squad or band roster groups for public carousel display';

-- Create team_members table (roster members; optional user_profile link)
CREATE TABLE public.team_members (
    id bigint DEFAULT nextval('public.team_members_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    team_group_id bigint NOT NULL,
    user_profile_id bigint,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    designation character varying(255),
    bio character varying(2048),
    email character varying(255),
    priority_order integer,
    profile_image_url character varying(500),
    expertise character varying(500),
    image_background character varying(255),
    image_style character varying(100),
    department character varying(100),
    join_date date,
    is_active boolean DEFAULT true,
    linkedin_url character varying(500),
    twitter_url character varying(500),
    website_url character varying(500),
    jersey_number integer,
    position character varying(128),
    lineup_subtitle character varying(128),
    instrument character varying(128),
    vocal_role character varying(128),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT team_members_pkey PRIMARY KEY (id),
    CONSTRAINT fk_team_members__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members__team_group_id FOREIGN KEY (team_group_id) REFERENCES public.team_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members__user_profile_id FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);

CREATE INDEX idx_team_members_team_group_id ON public.team_members(team_group_id);
CREATE INDEX idx_team_members_tenant_id ON public.team_members(tenant_id);
CREATE INDEX idx_team_members_user_profile_id ON public.team_members(user_profile_id);
CREATE INDEX idx_team_members_is_active ON public.team_members(is_active);
CREATE INDEX idx_team_members_priority_order ON public.team_members(priority_order);

COMMENT ON TABLE public.team_members IS 'Sports squad or music band members belonging to a team_group';
COMMENT ON COLUMN public.team_members.expertise IS 'JSON array of skills and expertise areas';
COMMENT ON COLUMN public.team_members.user_profile_id IS 'Optional link to platform user_profile for prefilled identity';

CREATE TRIGGER trg_team_groups_updated_at
    BEFORE UPDATE ON public.team_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- TOC entry 3363 (class 2604 OID 82769)
-- Name: discount_code id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3354 (class 2604 OID 77431)
-- Name: event_live_update id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3359 (class 2604 OID 77449)
-- Name: event_live_update_attachment id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3345 (class 2604 OID 77396)
-- Name: event_score_card id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3350 (class 2604 OID 77414)
-- Name: event_score_card_detail id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 227
-- Name: discount_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

-- Ensure discount_code_id_seq sequence is always ahead of existing data
SELECT pg_catalog.setval(
               'public.discount_code_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.discount_code), 1), 1),
               true
       );


--
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 221
-- Name: event_live_update_attachment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

-- Ensure event_live_update_attachment_id_seq sequence is always ahead of existing data
SELECT pg_catalog.setval(
               'public.event_live_update_attachment_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.event_live_update_attachment), 1), 1),
               true
       );


--
-- TOC entry 3998 (class 0 OID 0)
-- Dependencies: 219
-- Name: event_live_update_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

-- Ensure event_live_update_id_seq sequence is always ahead of existing data
SELECT pg_catalog.setval(
               'public.event_live_update_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.event_live_update), 1), 1),
               true
       );


--
-- TOC entry 3999 (class 0 OID 0)
-- Dependencies: 217
-- Name: event_score_card_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

-- Ensure event_score_card_detail_id_seq sequence is always ahead of existing data
SELECT pg_catalog.setval(
               'public.event_score_card_detail_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.event_score_card_detail), 1), 1),
               true
       );


--
-- TOC entry 4000 (class 0 OID 0)
-- Dependencies: 215
-- Name: event_score_card_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

-- Ensure event_score_card_id_seq sequence is always ahead of existing data
SELECT pg_catalog.setval(
               'public.event_score_card_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.event_score_card), 1), 1),
               true
       );


--
-- TOC entry 4001 (class 0 OID 0)
-- Dependencies: 224
-- Name: sequence_generator; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
-- (Sequence initialization moved to consolidated section below - see "SEQUENCE INITIALIZATION" section)



--
-- TOC entry 3575 (class 2606 OID 82778)
-- Name: discount_code discount_code_code_key; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3655 (class 2606 OID 83100)
-- Name: event_calendar_entry ux_calendar_entry_provider_external; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3613 (class 2606 OID 82902)
-- Name: event_admin ux_event_admin_user_tenant; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3662 (class 2606 OID 83121)
-- Name: event_attendee ux_event_attendee__event_attendee; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3674 (class 2606 OID 83165)
-- Name: event_guest_pricing ux_event_guest_pricing_event_age_tier; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3631 (class 2606 OID 82985)
-- Name: event_ticket_type ux_event_ticket_type_event_code; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3595 (class 2606 OID 82847)
-- Name: event_type_details ux_event_type_tenant_name; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3639 (class 2606 OID 83027)
-- Name: user_payment_transaction ux_payment_transaction_stripe_intent; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3647 (class 2606 OID 83069)
-- Name: event_poll_response ux_poll_response_user_option; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3678 (class 2606 OID 83182)
-- Name: qr_code_usage ux_qr_code_attendee_type; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--


--
-- TOC entry 3635 (class 2606 OID 83004)
-- Name: event_ticket_transaction ux_ticket_transaction_reference; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3587 (class 2606 OID 82808)
-- Name: user_profile ux_user_profile__user_id; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

-- Removed global unique on user_id in favor of (tenant_id, user_id) at table creation above





--
-- TOC entry 3599 (class 2606 OID 82860)
-- Name: user_subscription ux_user_subscription__stripe_customer_id; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3601 (class 2606 OID 82862)
-- Name: user_subscription ux_user_subscription__stripe_subscription_id; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3603 (class 2606 OID 82864)
-- Name: user_subscription ux_user_subscription__user_profile_id; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3658 (class 1259 OID 83371)
-- Name: idx_event_attendee_qr_data; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_attendee_qr_data ON public.event_attendee USING btree (qr_code_data) WHERE (qr_code_data IS NOT NULL);


--
-- TOC entry 3659 (class 1259 OID 83369)
-- Name: idx_event_attendee_qr_generated; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_attendee_qr_generated ON public.event_attendee USING btree (qr_code_generated) WHERE (qr_code_generated = true);


--
-- TOC entry 3660 (class 1259 OID 83370)
-- Name: idx_event_attendee_qr_generated_at; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_attendee_qr_generated_at ON public.event_attendee USING btree (qr_code_generated_at);


--
-- TOC entry 3606 (class 1259 OID 83363)
-- Name: idx_event_details_allow_guests; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_details_allow_guests ON public.event_details USING btree (allow_guests) WHERE (allow_guests = true);


--
-- TOC entry 3607 (class 1259 OID 83364)
-- Name: idx_event_details_guest_pricing; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_details_guest_pricing ON public.event_details USING btree (enable_guest_pricing) WHERE (enable_guest_pricing = true);


--
-- TOC entry 3608 (class 1259 OID 83366)
-- Name: idx_event_details_max_guests; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_details_max_guests ON public.event_details USING btree (max_guests_per_attendee) WHERE (max_guests_per_attendee > 0);


--
-- TOC entry 3609 (class 1259 OID 83365)
-- Name: idx_event_details_require_guest_approval; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_details_require_guest_approval ON public.event_details USING btree (require_guest_approval) WHERE (require_guest_approval = true);


--
-- TOC entry 3610 (class 1259 OID 0)
-- Name: idx_recurrence_series_id; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_recurrence_series_id ON public.event_details USING btree (recurrence_series_id) WHERE (recurrence_series_id IS NOT NULL);


--
-- TOC entry 3611 (class 1259 OID 0)
-- Name: idx_parent_event_id; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_parent_event_id ON public.event_details USING btree (parent_event_id) WHERE (parent_event_id IS NOT NULL);


--
-- Name: idx_event_details__is_competition_event; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_details__is_competition_event
    ON public.event_details(is_competition_event)
    WHERE is_competition_event = true;


--
-- TOC entry 3669 (class 1259 OID 83375)
-- Name: idx_event_guest_pricing_description; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_guest_pricing_description ON public.event_guest_pricing USING btree (description) WHERE (description IS NOT NULL);


--
-- TOC entry 3670 (class 1259 OID 83374)
-- Name: idx_event_guest_pricing_event_age_active; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_guest_pricing_event_age_active ON public.event_guest_pricing USING btree (event_id, age_group, is_active) WHERE (is_active = true);


--
-- TOC entry 3671 (class 1259 OID 83372)
-- Name: idx_event_guest_pricing_is_active; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_guest_pricing_is_active ON public.event_guest_pricing USING btree (is_active) WHERE (is_active = true);


--
-- TOC entry 3672 (class 1259 OID 83373)
-- Name: idx_event_guest_pricing_valid_period; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_guest_pricing_valid_period ON public.event_guest_pricing USING btree (valid_from, valid_to);


--
-- TOC entry 3650 (class 1259 OID 83377)
-- Name: idx_event_media_pre_signed_expires; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_media_pre_signed_expires ON public.event_media USING btree (pre_signed_url_expires_at);


--
-- TOC entry 3651 (class 1259 OID 83376)
-- Name: idx_event_media_pre_signed_url; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_media_pre_signed_url ON public.event_media USING btree (pre_signed_url) WHERE (pre_signed_url IS NOT NULL);


--
-- TOC entry 3652 (class 1259 OID 83378)
-- Name: idx_event_media_album_id; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_media_album_id ON public.event_media USING btree (album_id) WHERE (album_id IS NOT NULL);


--
-- TOC entry 3653 (class 1259 OID 83379)
-- Name: idx_event_media_album_public; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_media_album_public ON public.event_media USING btree (album_id, is_public) WHERE (album_id IS NOT NULL AND is_public = true);


--
-- TOC entry 3654 (class 1259 OID 83380)
-- Name: idx_gallery_album_tenant_id; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_gallery_album_tenant_id ON public.gallery_album USING btree (tenant_id);


--
-- TOC entry 3655 (class 1259 OID 83381)
-- Name: idx_gallery_album_is_public; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_gallery_album_is_public ON public.gallery_album USING btree (is_public) WHERE (is_public = true);


--
-- TOC entry 3656 (class 1259 OID 83382)
-- Name: idx_gallery_album_display_order; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_gallery_album_display_order ON public.gallery_album USING btree (display_order);


--
-- TOC entry 3657 (class 1259 OID 83383)
-- Name: idx_gallery_album_created_at; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_gallery_album_created_at ON public.gallery_album USING btree (created_at DESC);


--
-- Name: idx_gallery_album_category_id; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_gallery_album_category_id ON public.gallery_album USING btree (gallery_category_id) WHERE (gallery_category_id IS NOT NULL);


--
-- Name: idx_gallery_album_album_year; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_gallery_album_album_year ON public.gallery_album USING btree (tenant_id, album_year) WHERE (album_year IS NOT NULL);


--
-- Name: idx_gallery_album_event_date_start; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_gallery_album_event_date_start ON public.gallery_album USING btree (tenant_id, event_date_start) WHERE (event_date_start IS NOT NULL);


--
-- TOC entry 3628 (class 1259 OID 83368)
-- Name: idx_event_ticket_type_availability; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_ticket_type_availability ON public.event_ticket_type USING btree (available_quantity, sold_quantity);


--
-- TOC entry 3629 (class 1259 OID 83367)
-- Name: idx_event_ticket_type_sold_quantity; Type: INDEX; Schema: public; Owner: giventa_event_management
--

CREATE INDEX idx_event_ticket_type_sold_quantity ON public.event_ticket_type USING btree (sold_quantity);


--
-- TOC entry 3730 (class 2620 OID 83389)
-- Name: event_attendee generate_enhanced_qr_code_trigger; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER generate_enhanced_qr_code_trigger BEFORE INSERT OR UPDATE ON public.event_attendee FOR EACH ROW EXECUTE FUNCTION public.generate_enhanced_qr_code();


--
-- TOC entry 3729 (class 2620 OID 83388)
-- Name: event_ticket_transaction manage_ticket_inventory_trigger; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER manage_ticket_inventory_trigger
    AFTER INSERT OR UPDATE OR DELETE
                    ON public.event_ticket_transaction_item
                        FOR EACH ROW
                        EXECUTE FUNCTION public.manage_ticket_inventory();


--
-- TOC entry 3732 (class 2620 OID 83384)
-- Name: event_attendee_guest update_event_attendee_guest_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_attendee_guest_updated_at BEFORE UPDATE ON public.event_attendee_guest FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3731 (class 2620 OID 83383)
-- Name: event_attendee update_event_attendee_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_attendee_updated_at BEFORE UPDATE ON public.event_attendee FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3726 (class 2620 OID 83382)
-- Name: event_details update_event_details_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_details_updated_at BEFORE UPDATE ON public.event_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3733 (class 2620 OID 83385)
-- Name: event_guest_pricing update_event_guest_pricing_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_guest_pricing_updated_at BEFORE UPDATE ON public.event_guest_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3728 (class 2620 OID 83386)
-- Name: event_ticket_type update_event_ticket_type_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_ticket_type_updated_at BEFORE UPDATE ON public.event_ticket_type FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3725 (class 2620 OID 83381)
-- Name: event_type_details update_event_type_details_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_event_type_details_updated_at BEFORE UPDATE ON public.event_type_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3722 (class 2620 OID 83378)
-- Name: tenant_organization update_tenant_organization_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_tenant_organization_updated_at BEFORE UPDATE ON public.tenant_organization FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3724 (class 2620 OID 83379)
-- Name: tenant_settings update_tenant_settings_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON public.tenant_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry (class 2620 OID)
-- Name: tenant_email_addresses update_tenant_email_addresses_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_tenant_email_addresses_updated_at BEFORE UPDATE ON public.tenant_email_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3723 (class 2620 OID 83380)
-- Name: user_profile update_user_profile_updated_at; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER update_user_profile_updated_at BEFORE UPDATE ON public.user_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3727 (class 2620 OID 83387)
-- Name: event_details validate_event_details_trigger; Type: TRIGGER; Schema: public; Owner: giventa_event_management
--

CREATE TRIGGER validate_event_details_trigger BEFORE INSERT OR UPDATE ON public.event_details FOR EACH ROW EXECUTE FUNCTION public.validate_event_details();


--
-- TOC entry 3922 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

--GRANT USAGE ON SCHEMA public TO giventa_event_management;


--
-- TOC entry 3923 (class 0 OID 0)
-- Dependencies: 224
-- Name: SEQUENCE sequence_generator; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,USAGE ON SEQUENCE public.sequence_generator TO giventa_event_management;


--
-- TOC entry 3924 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE bulk_operation_log; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.bulk_operation_log TO giventa_event_management;


--
-- TOC entry 3925 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE databasechangelog; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.databasechangelog TO giventa_event_management;


--
-- TOC entry 3926 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE databasechangeloglock; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.databasechangeloglock TO giventa_event_management;


--
-- TOC entry 3928 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE discount_code; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.discount_code TO giventa_event_management;


--
-- TOC entry 3930 (class 0 OID 0)
-- Dependencies: 227
-- Name: SEQUENCE discount_code_id_seq; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,USAGE ON SEQUENCE public.discount_code_id_seq TO giventa_event_management;


--
-- TOC entry 3931 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE event_admin; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_admin TO giventa_event_management;


--
-- TOC entry 3933 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE event_admin_audit_log; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_admin_audit_log TO giventa_event_management;


--
-- TOC entry 3938 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE event_attendee; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_attendee TO giventa_event_management;


--
-- TOC entry 3942 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE event_attendee_guest; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_attendee_guest TO giventa_event_management;


--
-- TOC entry 3943 (class 0 OID 0)
-- Dependencies: 247
-- Name: TABLE event_calendar_entry; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_calendar_entry TO giventa_event_management;


--
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE event_details; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_details TO giventa_event_management;



--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE event_guest_pricing; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_guest_pricing TO giventa_event_management;


--
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE event_media; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_media TO giventa_event_management;


--
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE event_organizer; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_organizer TO giventa_event_management;


--
-- TOC entry 3969 (class 0 OID 0)
-- Dependencies: 243
-- Name: TABLE event_poll; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_poll TO giventa_event_management;


--
-- TOC entry 3970 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE event_poll_option; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_poll_option TO giventa_event_management;


--
-- TOC entry 3971 (class 0 OID 0)
-- Dependencies: 245
-- Name: TABLE event_poll_response; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_poll_response TO giventa_event_management;


--
-- TOC entry 3978 (class 0 OID 0)
-- Dependencies: 241
-- Name: TABLE event_ticket_transaction; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_ticket_transaction TO giventa_event_management;


--
-- TOC entry 3980 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE event_ticket_type; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_ticket_type TO giventa_event_management;


--
-- TOC entry 3982 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE event_type_details; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_type_details TO giventa_event_management;


--
-- TOC entry 3984 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE qr_code_usage; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.qr_code_usage TO giventa_event_management;


--
-- TOC entry 3987 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE tenant_organization; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.tenant_organization TO giventa_event_management;


--
-- TOC entry 3989 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE tenant_settings; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.tenant_settings TO giventa_event_management;


--
-- TOC entry 3990 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE user_payment_transaction; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_payment_transaction TO giventa_event_management;


--
-- TOC entry 3992 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE user_profile; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_profile TO giventa_event_management;




--
-- TOC entry 3994 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE user_subscription; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_subscription TO giventa_event_management;


--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE user_task; Type: ACL; Schema: public; Owner: giventa_event_management
--

--GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_task TO giventa_event_management;


-- Completed on 2025-06-08 23:51:06

--
-- PostgreSQL database dump complete
--

-- Communication and Campaign Logging Tables (added from JDL)

CREATE TABLE public.communication_campaign (
                                               id bigint DEFAULT nextval('public.communication_campaign_id_seq'::regclass) NOT NULL,
                                               tenant_id character varying(255) NOT NULL,
                                               name character varying(255) NOT NULL,
                                               type character varying(50), -- EMAIL, WHATSAPP
                                               description character varying(1000),
                                               created_by_id bigint,
                                               created_at timestamp without time zone NOT NULL,
                                               scheduled_at timestamp without time zone,
                                               sent_at timestamp without time zone,
                                               status character varying(50), -- DRAFT, SCHEDULED, SENT, FAILED
                                               CONSTRAINT communication_campaign_pkey PRIMARY KEY (id),
                                               CONSTRAINT fk_communication_campaign_created_by FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);

CREATE TABLE public.email_log (
                                  id bigint DEFAULT nextval('public.email_log_id_seq'::regclass) NOT NULL,
                                  tenant_id character varying(255) NOT NULL,
                                  recipient_email character varying(255) NOT NULL,
                                  subject character varying(255),
                                  body VARCHAR(32768),
                                  sent_at timestamp without time zone NOT NULL,
                                  status character varying(50), -- SENT, FAILED, etc.
                                  type character varying(50), -- TRANSACTIONAL, BULK
                                  campaign_id bigint,
                                  metadata VARCHAR(8192),
                                  CONSTRAINT email_log_pkey PRIMARY KEY (id),
                                  CONSTRAINT fk_email_log_campaign FOREIGN KEY (campaign_id) REFERENCES public.communication_campaign(id) ON DELETE SET NULL
);

CREATE TABLE public.whatsapp_log (
                                     id bigint DEFAULT nextval('public.whatsapp_log_id_seq'::regclass) NOT NULL,
                                     tenant_id character varying(255) NOT NULL,
                                     recipient_phone character varying(50) NOT NULL,
                                     message_body VARCHAR(4096),
                                     sent_at timestamp without time zone NOT NULL,
                                     status character varying(50), -- SENT, FAILED, etc.
                                     type character varying(50), -- TRANSACTIONAL, BULK
                                     campaign_id bigint,
                                     metadata VARCHAR(8192),
                                     CONSTRAINT whatsapp_log_pkey PRIMARY KEY (id),
                                     CONSTRAINT fk_whatsapp_log_campaign FOREIGN KEY (campaign_id) REFERENCES public.communication_campaign(id) ON DELETE SET NULL
);

-- =============================================
-- NEW EVENT-RELATED TABLES
-- =============================================

-- Table: event_featured_performers
-- Stores comprehensive information about featured performers/artists for an event
CREATE TABLE public.event_featured_performers (
                                                  id bigint DEFAULT nextval('public.event_featured_performers_id_seq'::regclass) NOT NULL,
                                                  tenant_id character varying(255),
                                                  event_id bigint NULL,
    -- Basic performer information
                                                  name varchar(255) NOT NULL,
                                                  stage_name varchar(255) NULL,
                                                  role varchar(100) NULL,
    -- Personal details
                                                  bio text NULL,
                                                  nationality varchar(100) NULL,
                                                  date_of_birth date NULL,
    -- Contact information
                                                  email varchar(255) NULL,
                                                  phone varchar(50) NULL,
                                                  website_url varchar(1024) NULL,
    -- Media URLs (AWS S3 or other cloud storage)
                                                  portrait_image_url varchar(1024) NULL,
                                                  performance_image_url varchar(1024) NULL,
                                                  gallery_image_urls text NULL, -- JSON array of additional image URLs
    -- Performance details
                                                  performance_duration_minutes int4 NULL,
                                                  performance_order int4 DEFAULT 0 NOT NULL,
                                                  is_headliner boolean DEFAULT false NOT NULL,
    -- Social media presence
                                                  facebook_url varchar(1024) NULL,
                                                  twitter_url varchar(1024) NULL,
                                                  instagram_url varchar(1024) NULL,
                                                  youtube_url varchar(1024) NULL,
                                                  linkedin_url varchar(1024) NULL,
                                                  tiktok_url varchar(1024) NULL,
    -- Status and metadata
                                                  is_active boolean DEFAULT true NOT NULL,
                                                  priority_ranking int4 DEFAULT 0 NOT NULL,
    -- Timestamps
                                                  created_at timestamp DEFAULT now() NOT NULL,
                                                  updated_at timestamp DEFAULT now() NOT NULL,
    -- Constraints
                                                  CONSTRAINT event_featured_performers_pkey PRIMARY KEY (id),
                                                  CONSTRAINT fk_event_featured_performers_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
                                                  CONSTRAINT check_performance_duration CHECK (performance_duration_minutes IS NULL OR performance_duration_minutes > 0),
                                                  CONSTRAINT check_performance_order CHECK (performance_order >= 0),
                                                  CONSTRAINT check_priority_ranking CHECK (priority_ranking >= 0),
                                                  CONSTRAINT check_date_of_birth CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE),
                                                  CONSTRAINT check_url_format_website CHECK (website_url IS NULL OR website_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_portrait CHECK (portrait_image_url IS NULL OR portrait_image_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_performance CHECK (performance_image_url IS NULL OR performance_image_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_facebook CHECK (facebook_url IS NULL OR facebook_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_twitter CHECK (twitter_url IS NULL OR twitter_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_instagram CHECK (instagram_url IS NULL OR instagram_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_youtube CHECK (youtube_url IS NULL OR youtube_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_linkedin CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://.*'),
    CONSTRAINT check_url_format_tiktok CHECK (tiktok_url IS NULL OR tiktok_url ~* '^https?://.*'),
    CONSTRAINT check_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table: event_contacts
-- Stores booking or organizing contact info for events
CREATE TABLE public.event_contacts (
                                       id bigint DEFAULT nextval('public.event_contacts_id_seq'::regclass) NOT NULL,
                                       tenant_id character varying(255),
                                       event_id bigint NULL,
                                       name varchar(255) NOT NULL,
                                       phone varchar(50) NOT NULL,
                                       email varchar(255) NULL,
                                       created_at timestamp DEFAULT now() NOT NULL,
                                       updated_at timestamp DEFAULT now() NOT NULL,
                                       CONSTRAINT event_contacts_pkey PRIMARY KEY (id),
                                       CONSTRAINT fk_event_contacts_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

-- Table: event_emails
-- For general event-level emails (for public or organizers)
CREATE TABLE public.event_emails (
                                     id bigint DEFAULT nextval('public.event_emails_id_seq'::regclass) NOT NULL,
                                     tenant_id character varying(255),
                                     event_id bigint NULL,
                                     email varchar(255) NOT NULL,
                                     created_at timestamp DEFAULT now() NOT NULL,
                                     updated_at timestamp DEFAULT now() NOT NULL,
                                     CONSTRAINT event_emails_pkey PRIMARY KEY (id),
                                     CONSTRAINT fk_event_emails_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

-- Table: event_program_directors
-- Stores info about the event's program director
CREATE TABLE public.event_program_directors (
                                                id bigint DEFAULT nextval('public.event_program_directors_id_seq'::regclass) NOT NULL,
                                                tenant_id character varying(255),
                                                event_id bigint NULL,
                                                name varchar(255) NOT NULL,
                                                photo_url varchar(1024) NULL,
                                                bio text NULL,
                                                created_at timestamp DEFAULT now() NOT NULL,
                                                updated_at timestamp DEFAULT now() NOT NULL,
                                                CONSTRAINT event_program_directors_pkey PRIMARY KEY (id),
                                                CONSTRAINT fk_event_program_directors_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

-- Index for event_media event_focus_group_id (optional focus group association)
CREATE INDEX IF NOT EXISTS idx_event_media_event_focus_group_id ON public.event_media(event_focus_group_id) WHERE event_focus_group_id IS NOT NULL;

-- Indexes for event_media sponsor references
CREATE INDEX IF NOT EXISTS idx_event_media_sponsor_id ON public.event_media(sponsor_id) WHERE sponsor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_media_event_sponsors_join_id ON public.event_media(event_sponsors_join_id) WHERE event_sponsors_join_id IS NOT NULL;

-- Indexes for event_media priority ranking (for sponsor and event-sponsor media)
CREATE INDEX IF NOT EXISTS idx_event_media_priority_ranking ON public.event_media(priority_ranking) WHERE sponsor_id IS NOT NULL OR event_sponsors_join_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_media_sponsor_priority ON public.event_media(sponsor_id, priority_ranking) WHERE sponsor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_media_event_sponsor_join_priority ON public.event_media(event_sponsors_join_id, priority_ranking) WHERE event_sponsors_join_id IS NOT NULL;

-- Indexes for event_media album references
CREATE INDEX IF NOT EXISTS idx_event_media_album_id ON public.event_media(album_id) WHERE album_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_media_album_public ON public.event_media(album_id, is_public) WHERE album_id IS NOT NULL AND is_public = true;

-- Official document library: filter by tenant, category slug (FK), and year for S3 path media/{tenant}/official_document/{slug}/{year}/
CREATE INDEX IF NOT EXISTS idx_event_media_official_doc_tenant_category_year ON public.event_media(tenant_id, official_document_category_id, official_document_year) WHERE is_event_management_official_document = true AND official_document_category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_media_official_doc_tree_listing ON public.event_media(tenant_id, official_document_category_id, official_document_year, display_priority, priority_ranking, created_at) WHERE is_event_management_official_document = true AND is_public = true;

-- Index for event_sponsors_join custom_poster_url
CREATE INDEX IF NOT EXISTS idx_event_sponsors_join_custom_poster ON public.event_sponsors_join(custom_poster_url) WHERE custom_poster_url IS NOT NULL;

-- =============================================
-- UNIQUE CONSTRAINTS FOR MULTI-EVENT ASSOCIATION
-- =============================================
-- These constraints prevent duplicate associations of the same entity with the same event
-- Using partial unique indexes to handle NULL event_id values correctly

-- event_contacts: Unique per tenant+event+name+phone
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_contact_tenant_event_name_phone
    ON public.event_contacts (tenant_id, event_id, name, phone)
    WHERE event_id IS NOT NULL;

-- event_contacts: Unique per tenant+event+email (if email provided)
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_contact_tenant_event_email
    ON public.event_contacts (tenant_id, event_id, email)
    WHERE event_id IS NOT NULL AND email IS NOT NULL;

-- event_featured_performers: Unique per tenant+event+name+stage_name
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_performer_tenant_event_name_stage
    ON public.event_featured_performers (tenant_id, event_id, name, stage_name)
    WHERE event_id IS NOT NULL AND stage_name IS NOT NULL;

-- event_featured_performers: Unique per tenant+event+email (if email provided)
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_performer_tenant_event_email
    ON public.event_featured_performers (tenant_id, event_id, email)
    WHERE event_id IS NOT NULL AND email IS NOT NULL;

-- event_emails: Unique per tenant+event+email
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_email_tenant_event_email
    ON public.event_emails (tenant_id, event_id, email)
    WHERE event_id IS NOT NULL;

-- event_program_directors: Unique per tenant+event+name
CREATE UNIQUE INDEX IF NOT EXISTS unique_event_director_tenant_event_name
    ON public.event_program_directors (tenant_id, event_id, name)
    WHERE event_id IS NOT NULL;

-- =============================================
-- PERFORMANCE INDEXES FOR MULTI-EVENT ASSOCIATION
-- =============================================
-- Indexes to optimize queries filtering by event_id and finding tenant-level entities

-- Performance indexes for queries filtering by event_id (tenant_id, event_id)
CREATE INDEX IF NOT EXISTS idx_event_featured_performers_tenant_event
    ON public.event_featured_performers (tenant_id, event_id)
    WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_contacts_tenant_event
    ON public.event_contacts (tenant_id, event_id)
    WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_emails_tenant_event
    ON public.event_emails (tenant_id, event_id)
    WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_program_directors_tenant_event
    ON public.event_program_directors (tenant_id, event_id)
    WHERE event_id IS NOT NULL;

-- Indexes for finding tenant-level entities (where event_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_event_featured_performers_tenant_null_event
    ON public.event_featured_performers (tenant_id)
    WHERE event_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_event_contacts_tenant_null_event
    ON public.event_contacts (tenant_id)
    WHERE event_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_event_emails_tenant_null_event
    ON public.event_emails (tenant_id)
    WHERE event_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_event_program_directors_tenant_null_event
    ON public.event_program_directors (tenant_id)
    WHERE event_id IS NULL;

-- =============================================
-- POSTGRESQL CACHING FEATURES
-- =============================================

-- Create application cache table (UNLOGGED for better performance)
CREATE UNLOGGED TABLE IF NOT EXISTS public.event_site_app_cache (
    cache_key TEXT PRIMARY KEY,
    cache_value TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create session store table
CREATE TABLE IF NOT EXISTS public.session_store (
                                                    session_id VARCHAR(255) PRIMARY KEY,
    session_data BYTEA,
    last_access_time TIMESTAMP DEFAULT NOW(),
    max_inactive_interval INTEGER DEFAULT 1800
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_site_app_cache_expires_at ON public.event_site_app_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_session_store_last_access ON public.session_store(last_access_time);

-- Create cache cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
deleted_count INTEGER;
BEGIN
DELETE FROM public.event_site_app_cache WHERE expires_at < NOW();
GET DIAGNOSTICS deleted_count = ROW_COUNT;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create session cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
deleted_count INTEGER;
BEGIN
DELETE FROM public.session_store
WHERE last_access_time < NOW() - INTERVAL '1 hour' * max_inactive_interval;
GET DIAGNOSTICS deleted_count = ROW_COUNT;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for caching tables to current user and public role
-- These permissions will work for any user with appropriate database access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_site_app_cache TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_store TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_cache() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_sessions() TO PUBLIC;

-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_site_app_cache TO CURRENT_USER;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_store TO CURRENT_USER;
-- GRANT EXECUTE ON FUNCTION public.cleanup_expired_cache() TO CURRENT_USER;
-- GRANT EXECUTE ON FUNCTION public.cleanup_expired_sessions() TO CURRENT_USER;

-- Add comments for caching tables
COMMENT ON TABLE public.event_site_app_cache IS 'Application-level cache storage using UNLOGGED table for optimal performance';
COMMENT ON TABLE public.session_store IS 'Session storage for user sessions with automatic cleanup';
COMMENT ON COLUMN public.event_site_app_cache.cache_key IS 'Unique cache key identifier';
COMMENT ON COLUMN public.event_site_app_cache.cache_value IS 'Cached data value';
COMMENT ON COLUMN public.event_site_app_cache.expires_at IS 'Cache expiration timestamp';
COMMENT ON COLUMN public.session_store.session_id IS 'Unique session identifier';
COMMENT ON COLUMN public.session_store.session_data IS 'Serialized session data';
COMMENT ON COLUMN public.session_store.last_access_time IS 'Last time session was accessed';
COMMENT ON COLUMN public.session_store.max_inactive_interval IS 'Maximum inactive time in seconds before session expires';

-- Grant permissions to application user (if exists)
-- Note: These will only work if event_site_app user has been created
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'event_site_app') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_site_app_cache TO event_site_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_store TO event_site_app;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_cache() TO event_site_app;
        GRANT EXECUTE ON FUNCTION public.cleanup_expired_sessions() TO event_site_app;
END IF;
END $$;

-- =============================================
-- MATERIALIZED VIEWS AND STATISTICS
-- =============================================

-- Create materialized view for tenant statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS public.tenant_stats AS
SELECT
    tenant_id,
    COUNT(*) as user_count,
    MAX(created_at) as last_activity,
    COUNT(CASE WHEN user_status = 'ACTIVE' THEN 1 END) as active_users
FROM public.user_profile
GROUP BY tenant_id;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_tenant_stats_tenant_id ON public.tenant_stats(tenant_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_tenant_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.tenant_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions on materialized view
GRANT SELECT ON public.tenant_stats TO PUBLIC;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'event_site_app') THEN
        GRANT SELECT ON public.tenant_stats TO event_site_app;
GRANT EXECUTE ON FUNCTION public.refresh_tenant_stats() TO event_site_app;
END IF;
END $$;

-- Add comments for materialized view
COMMENT ON MATERIALIZED VIEW public.tenant_stats IS 'Materialized view containing tenant statistics for performance optimization';
COMMENT ON FUNCTION public.refresh_tenant_stats() IS 'Function to refresh tenant statistics materialized view';

-- =============================================
-- AUTOMATED CLEANUP SCHEDULING (PG_CRON)
-- =============================================

-- Enable pg_cron extension (requires superuser privileges)
-- Note: This will only work if pg_cron extension is available and user has superuser privileges
DO $$
BEGIN
    -- Check if pg_cron extension is available
    IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
        -- Try to create extension (will fail silently if not superuser)
BEGIN
            CREATE EXTENSION IF NOT EXISTS pg_cron;

            -- Schedule cache cleanup every hour (if not already scheduled)
            IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-cache') THEN
                PERFORM cron.schedule('cleanup-cache', '0 * * * *', 'SELECT public.cleanup_expired_cache();');
END IF;

            -- Schedule session cleanup every hour (if not already scheduled)
            IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-sessions') THEN
                PERFORM cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT public.cleanup_expired_sessions();');
END IF;

            -- Schedule materialized view refresh every 6 hours (if not already scheduled)
            IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-tenant-stats') THEN
                PERFORM cron.schedule('refresh-tenant-stats', '0 */6 * * *', 'SELECT public.refresh_tenant_stats();');
END IF;

EXCEPTION WHEN OTHERS THEN
            -- Log that pg_cron setup failed (likely due to insufficient privileges)
            RAISE NOTICE 'pg_cron extension setup failed: %. This is normal if not running as superuser.', SQLERRM;
END;
ELSE
        RAISE NOTICE 'pg_cron extension is not available. Automated scheduling will not be set up.';
END IF;
END $$;

-- =============================================
-- TABLE COMMENTS
-- =============================================

COMMENT ON TABLE public.event_featured_performers IS 'Stores comprehensive information about featured performers/artists including bios, media assets, social presence, and performance details';
COMMENT ON TABLE public.event_contacts IS 'Stores booking or organizing contact info for events';
COMMENT ON TABLE public.event_sponsors IS 'Stores comprehensive sponsor/company information including logos, contact details, and social media links';
COMMENT ON TABLE public.event_sponsors_join IS 'Join table for many-to-many relationship between events and sponsors';
COMMENT ON TABLE public.event_emails IS 'Stores general event-level emails for public or organizers';
COMMENT ON TABLE public.event_program_directors IS 'Stores information about event program directors';

-- =============================================
-- COLUMN COMMENTS
-- =============================================

-- event_featured_performers column comments
COMMENT ON COLUMN public.event_featured_performers.event_id IS 'Foreign key reference to event_details.id';
COMMENT ON COLUMN public.event_featured_performers.name IS 'Full name of the featured performer/artist';
COMMENT ON COLUMN public.event_featured_performers.stage_name IS 'Stage name or artistic name (may differ from legal name)';
COMMENT ON COLUMN public.event_featured_performers.role IS 'Role of the performer (e.g., Singer, Violinist, Dancer, Comedian)';
COMMENT ON COLUMN public.event_featured_performers.bio IS 'Detailed biography and background of the performer';
COMMENT ON COLUMN public.event_featured_performers.nationality IS 'Nationality or country of origin';
COMMENT ON COLUMN public.event_featured_performers.date_of_birth IS 'Date of birth of the performer';
COMMENT ON COLUMN public.event_featured_performers.email IS 'Contact email for the performer or their management';
COMMENT ON COLUMN public.event_featured_performers.phone IS 'Contact phone number for the performer or their management';
COMMENT ON COLUMN public.event_featured_performers.website_url IS 'Official website URL of the performer (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_featured_performers.portrait_image_url IS 'URL to portrait/headshot image (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_featured_performers.performance_image_url IS 'URL to performance/action image (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_featured_performers.gallery_image_urls IS 'JSON array of additional image URLs for gallery display';
COMMENT ON COLUMN public.event_featured_performers.performance_duration_minutes IS 'Expected duration of performance in minutes';
COMMENT ON COLUMN public.event_featured_performers.performance_order IS 'Order of performance in the event lineup';
COMMENT ON COLUMN public.event_featured_performers.is_headliner IS 'Whether this performer is a headliner for the event';
COMMENT ON COLUMN public.event_featured_performers.facebook_url IS 'Facebook profile/page URL';
COMMENT ON COLUMN public.event_featured_performers.twitter_url IS 'Twitter profile URL';
COMMENT ON COLUMN public.event_featured_performers.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN public.event_featured_performers.youtube_url IS 'YouTube channel URL';
COMMENT ON COLUMN public.event_featured_performers.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.event_featured_performers.tiktok_url IS 'TikTok profile URL';
COMMENT ON COLUMN public.event_featured_performers.is_active IS 'Whether the performer is currently active and should be displayed';
COMMENT ON COLUMN public.event_featured_performers.priority_ranking IS 'Display priority ranking (higher numbers = higher priority)';

-- event_contacts column comments
COMMENT ON COLUMN public.event_contacts.event_id IS 'Foreign key reference to event_details.id';
COMMENT ON COLUMN public.event_contacts.name IS 'Contact person name';
COMMENT ON COLUMN public.event_contacts.phone IS 'Contact phone number';
COMMENT ON COLUMN public.event_contacts.email IS 'Contact email address (optional)';

-- event_sponsors column comments
COMMENT ON COLUMN public.event_sponsors.name IS 'Sponsor display name';
COMMENT ON COLUMN public.event_sponsors.type IS 'Type of sponsor (e.g., Tour Sponsor, Hospitality Partner, Title Sponsor)';
COMMENT ON COLUMN public.event_sponsors.company_name IS 'Official company name (may differ from display name)';
COMMENT ON COLUMN public.event_sponsors.tagline IS 'Company tagline or slogan';
COMMENT ON COLUMN public.event_sponsors.description IS 'Detailed description of the sponsor/company';
COMMENT ON COLUMN public.event_sponsors.website_url IS 'Company website URL (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_sponsors.contact_email IS 'Primary contact email for the sponsor';
COMMENT ON COLUMN public.event_sponsors.contact_phone IS 'Primary contact phone number';
COMMENT ON COLUMN public.event_sponsors.logo_url IS 'URL to sponsor logo image (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_sponsors.hero_image_url IS 'URL to sponsor hero/banner image (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_sponsors.banner_image_url IS 'URL to sponsor banner image for event displays (AWS S3 or other cloud storage)';
COMMENT ON COLUMN public.event_sponsors.is_active IS 'Whether the sponsor is currently active and should be displayed';
COMMENT ON COLUMN public.event_sponsors.priority_ranking IS 'Display priority ranking (higher numbers = higher priority)';
COMMENT ON COLUMN public.event_sponsors.facebook_url IS 'Facebook page URL';
COMMENT ON COLUMN public.event_sponsors.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN public.event_sponsors.twitter_url IS 'X (Twitter) profile URL';
COMMENT ON COLUMN public.event_sponsors.linkedin_url IS 'LinkedIn company page URL';
COMMENT ON COLUMN public.event_sponsors.youtube_url IS 'YouTube channel URL';
COMMENT ON COLUMN public.event_sponsors.tiktok_url IS 'TikTok profile URL';

-- event_sponsors_join column comments
COMMENT ON COLUMN public.event_sponsors_join.event_id IS 'Foreign key reference to event_details.id';
COMMENT ON COLUMN public.event_sponsors_join.sponsor_id IS 'Foreign key reference to event_sponsors.id';
COMMENT ON COLUMN public.event_sponsors_join.custom_poster_url IS 'Custom poster image URL for this specific event-sponsor combination. Stored in S3 with path: dev/events/tenantId/{tenantId}/event-id/{eventId}/sponsor/sponsor_id/{sponsorId}/{filename}';

-- event_emails column comments
COMMENT ON COLUMN public.event_emails.event_id IS 'Foreign key reference to event_details.id';
COMMENT ON COLUMN public.event_emails.email IS 'Event-related email address';

-- event_program_directors column comments
COMMENT ON COLUMN public.event_program_directors.event_id IS 'Foreign key reference to event_details.id';
COMMENT ON COLUMN public.event_program_directors.name IS 'Program director name';
COMMENT ON COLUMN public.event_program_directors.photo_url IS 'URL to program director photo';
COMMENT ON COLUMN public.event_program_directors.bio IS 'Program director biography';


-- ===================================================
-- CLERK AUTHENTICATION INTEGRATION SCHEMA
-- Task ID: 2 - Database Schema Migration for Clerk
-- Date: October 13, 2025
-- ===================================================

-- ---------------------------------------------------
-- 1. ADD NEW CLERK COLUMNS TO EXISTING user_profile TABLE
-- ---------------------------------------------------
-- Adding new columns to support Clerk authentication integration
-- These columns store Clerk-specific data for user authentication

-- Add column comments for documentation
COMMENT ON COLUMN public.user_profile.clerk_user_id IS 'Clerk unique user identifier (e.g., user_2abc123def456)';
COMMENT ON COLUMN public.user_profile.clerk_session_id IS 'Current active Clerk session identifier';
COMMENT ON COLUMN public.user_profile.clerk_org_id IS 'Clerk Organization ID for role management (e.g., org_2abc123)';
COMMENT ON COLUMN public.user_profile.clerk_org_role IS 'Clerk Organization role (e.g., org:admin, org:member)';
COMMENT ON COLUMN public.user_profile.auth_provider IS 'Authentication provider: email, google, github, facebook, apple, etc.';
COMMENT ON COLUMN public.user_profile.auth_provider_user_id IS 'Provider-specific user ID (e.g., google_oauth2|123456789)';
COMMENT ON COLUMN public.user_profile.email_verified IS 'Whether the user email has been verified via Clerk';
COMMENT ON COLUMN public.user_profile.profile_image_url_clerk IS 'Clerk profile image URL (may differ from custom profile_image_url)';
COMMENT ON COLUMN public.user_profile.last_sign_in_at IS 'Timestamp of last successful sign-in';
COMMENT ON COLUMN public.user_profile.clerk_metadata IS 'Additional Clerk user metadata stored as JSON (custom claims, attributes, etc.)';

-- ---------------------------------------------------
-- 2. UPDATE UNIQUE CONSTRAINTS FOR MULTI-TENANT SUPPORT
-- ---------------------------------------------------
-- Drop old unique constraint on user_id (single tenant constraint)
-- Composite unique constraint on (email, tenant_id) for multi-tenant support
-- Added directly in CREATE TABLE statement above
-- This allows same email across different tenants

-- ---------------------------------------------------
-- 3. ADD INDEXES FOR CLERK COLUMNS ON user_profile
-- ---------------------------------------------------
-- Indexes to optimize Clerk-related queries

-- Create indexes (with conditional comments using DO blocks)
CREATE INDEX IF NOT EXISTS idx_user_profile_clerk_user_id
    ON public.user_profile(clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_user_profile_tenant_email
    ON public.user_profile(tenant_id, email);

CREATE INDEX IF NOT EXISTS idx_user_profile_clerk_org_id
    ON public.user_profile(clerk_org_id);

CREATE INDEX IF NOT EXISTS idx_user_profile_auth_provider
    ON public.user_profile(auth_provider);

CREATE INDEX IF NOT EXISTS idx_user_profile_last_sign_in_at
    ON public.user_profile(last_sign_in_at DESC);

-- Add comments on indexes (safe - with exception handling)
DO $$
BEGIN
BEGIN
        COMMENT ON INDEX idx_user_profile_clerk_user_id IS 'Index for fast Clerk user ID lookups';
EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Index idx_user_profile_clerk_user_id does not exist, skipping comment';
END;

BEGIN
        COMMENT ON INDEX idx_user_profile_tenant_email IS 'Index for tenant-scoped email queries';
EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Index idx_user_profile_tenant_email does not exist, skipping comment';
END;

BEGIN
        COMMENT ON INDEX idx_user_profile_clerk_org_id IS 'Index for organization-based queries';
EXCEPTION WHEN undefined_table THEN
        RAISE NOTICE 'Index idx_user_profile_clerk_org_id does not exist, skipping comment';
END;
END $$;

-- ---------------------------------------------------
-- 4. CREATE NEW TABLE: clerk_user_tenant
-- ---------------------------------------------------
-- Junction table to support users belonging to multiple tenants
-- A user can have different roles in different tenants

CREATE TABLE IF NOT EXISTS public.clerk_user_tenant (
                                                        id BIGINT DEFAULT nextval('public.clerk_user_tenant_id_seq'::regclass) NOT NULL,
    user_profile_id BIGINT NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    joined_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT clerk_user_tenant_pkey PRIMARY KEY (id),
    CONSTRAINT uq_clerk_user_tenant UNIQUE (user_profile_id, tenant_id),
    CONSTRAINT fk_clerk_user_tenant_user_profile
    FOREIGN KEY (user_profile_id)
    REFERENCES public.user_profile(id)
                        ON DELETE CASCADE
    );

-- Indexes for clerk_user_tenant
CREATE INDEX IF NOT EXISTS idx_clerk_user_tenant_user
    ON public.clerk_user_tenant(user_profile_id);

CREATE INDEX IF NOT EXISTS idx_clerk_user_tenant_tenant
    ON public.clerk_user_tenant(tenant_id);

CREATE INDEX IF NOT EXISTS idx_clerk_user_tenant_status
    ON public.clerk_user_tenant(status);

-- Comments
COMMENT ON TABLE public.clerk_user_tenant IS 'Junction table for multi-tenant user relationships and tenant-specific roles';
COMMENT ON COLUMN public.clerk_user_tenant.user_profile_id IS 'Foreign key to user_profile table';
COMMENT ON COLUMN public.clerk_user_tenant.tenant_id IS 'Tenant identifier';
COMMENT ON COLUMN public.clerk_user_tenant.role IS 'Tenant-specific role (may differ from global user_role)';
COMMENT ON COLUMN public.clerk_user_tenant.status IS 'Status: ACTIVE, SUSPENDED, PENDING, INACTIVE';
COMMENT ON COLUMN public.clerk_user_tenant.joined_at IS 'When user joined this tenant';

-- ---------------------------------------------------
-- 5. CREATE NEW TABLE: clerk_organization_role
-- ---------------------------------------------------
-- Maps Clerk Organization roles to application roles
-- This table defines how Clerk org roles translate to app permissions

CREATE TABLE IF NOT EXISTS public.clerk_organization_role (
                                                              id BIGINT DEFAULT nextval('public.clerk_organization_role_id_seq'::regclass) NOT NULL,
    clerk_org_id VARCHAR(255) NOT NULL,
    clerk_role_name VARCHAR(100) NOT NULL,
    application_role VARCHAR(100) NOT NULL,
    permissions TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT clerk_organization_role_pkey PRIMARY KEY (id),
    CONSTRAINT uq_clerk_org_role UNIQUE (clerk_org_id, clerk_role_name)
    );

-- Indexes for clerk_organization_role
CREATE INDEX IF NOT EXISTS idx_clerk_org_role_org
    ON public.clerk_organization_role(clerk_org_id);

CREATE INDEX IF NOT EXISTS idx_clerk_org_role_app_role
    ON public.clerk_organization_role(application_role);

-- Comments
COMMENT ON TABLE public.clerk_organization_role IS 'Maps Clerk Organization roles to application roles and permissions';
COMMENT ON COLUMN public.clerk_organization_role.clerk_org_id IS 'Clerk Organization ID (e.g., org_2abc123)';
COMMENT ON COLUMN public.clerk_organization_role.clerk_role_name IS 'Clerk role name (e.g., org:admin, org:member)';
COMMENT ON COLUMN public.clerk_organization_role.application_role IS 'Mapped application role (e.g., ROLE_ORG_ADMIN, ROLE_USER)';
COMMENT ON COLUMN public.clerk_organization_role.permissions IS 'JSON object containing role permissions';

-- Seed default role mappings
--INSERT INTO public.clerk_organization_role (clerk_org_id, clerk_role_name, application_role, permissions)
--VALUES
--    ('org_default', 'org:admin', 'ROLE_ORG_ADMIN', '{"canManageUsers": true, "canManageEvents": true, "canViewReports": true, "canManageSettings": true}'::jsonb),
--    ('org_default', 'org:member', 'ROLE_ORG_MEMBER', '{"canRegisterEvents": true, "canViewEvents": true, "canUpdateOwnProfile": true}'::jsonb),
--    ('org_default', 'org:viewer', 'ROLE_VIEWER', '{"canViewEvents": true}'::jsonb)
--ON CONFLICT (clerk_org_id, clerk_role_name) DO NOTHING;

-- ---------------------------------------------------
-- 6. CREATE NEW TABLE: clerk_webhook_event
-- ---------------------------------------------------
-- Audit trail and processing queue for all Clerk webhook events
-- Supports idempotency and retry logic

CREATE TABLE IF NOT EXISTS public.clerk_webhook_event (
                                                          id BIGINT DEFAULT nextval('public.clerk_webhook_event_id_seq'::regclass) NOT NULL,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    clerk_user_id VARCHAR(255),
    payload TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITHOUT TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    received_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT clerk_webhook_event_pkey PRIMARY KEY (id)
    );

-- Indexes for clerk_webhook_event
CREATE INDEX IF NOT EXISTS idx_clerk_webhook_event_type
    ON public.clerk_webhook_event(event_type);

CREATE INDEX IF NOT EXISTS idx_clerk_webhook_event_user
    ON public.clerk_webhook_event(clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_clerk_webhook_processed
    ON public.clerk_webhook_event(processed);

CREATE INDEX IF NOT EXISTS idx_clerk_webhook_received_at
    ON public.clerk_webhook_event(received_at DESC);

CREATE INDEX IF NOT EXISTS idx_clerk_webhook_event_id
    ON public.clerk_webhook_event(event_id);

-- Comments
COMMENT ON TABLE public.clerk_webhook_event IS 'Audit trail and processing queue for Clerk webhooks';
COMMENT ON COLUMN public.clerk_webhook_event.event_id IS 'Unique Clerk event ID (for idempotency)';
COMMENT ON COLUMN public.clerk_webhook_event.event_type IS 'Event type: user.created, user.updated, user.deleted, session.created, etc.';
COMMENT ON COLUMN public.clerk_webhook_event.clerk_user_id IS 'Clerk user ID associated with the event';
COMMENT ON COLUMN public.clerk_webhook_event.payload IS 'Full webhook payload as JSON';
COMMENT ON COLUMN public.clerk_webhook_event.processed IS 'Whether the webhook has been processed';
COMMENT ON COLUMN public.clerk_webhook_event.error_message IS 'Error message if processing failed';
COMMENT ON COLUMN public.clerk_webhook_event.retry_count IS 'Number of retry attempts';

-- ---------------------------------------------------
-- 7. CREATE NEW TABLE: clerk_session
-- ---------------------------------------------------
-- Tracks active user sessions from Clerk
-- Used for session management and audit trail

CREATE TABLE IF NOT EXISTS public.clerk_session (
                                                    id BIGINT DEFAULT nextval('public.clerk_session_id_seq'::regclass) NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    clerk_user_id VARCHAR(255) NOT NULL,
    user_profile_id BIGINT,
    tenant_id VARCHAR(255),
    client_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT clerk_session_pkey PRIMARY KEY (id),
    CONSTRAINT fk_clerk_session_user_profile
    FOREIGN KEY (user_profile_id)
    REFERENCES public.user_profile(id)
                         ON DELETE CASCADE
    );

-- Indexes for clerk_session
CREATE INDEX IF NOT EXISTS idx_clerk_session_user
    ON public.clerk_session(clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_clerk_session_profile
    ON public.clerk_session(user_profile_id);

CREATE INDEX IF NOT EXISTS idx_clerk_session_tenant
    ON public.clerk_session(tenant_id);

CREATE INDEX IF NOT EXISTS idx_clerk_session_status
    ON public.clerk_session(status);

CREATE INDEX IF NOT EXISTS idx_clerk_session_expires_at
    ON public.clerk_session(expires_at);

CREATE INDEX IF NOT EXISTS idx_clerk_session_session_id
    ON public.clerk_session(session_id);

-- Comments
COMMENT ON TABLE public.clerk_session IS 'Tracks active user sessions from Clerk for session management and audit';
COMMENT ON COLUMN public.clerk_session.session_id IS 'Unique Clerk session ID (e.g., sess_2xyz789abc012)';
COMMENT ON COLUMN public.clerk_session.clerk_user_id IS 'Clerk user ID associated with this session';
COMMENT ON COLUMN public.clerk_session.user_profile_id IS 'Foreign key to user_profile table';
COMMENT ON COLUMN public.clerk_session.tenant_id IS 'Tenant context for this session';
COMMENT ON COLUMN public.clerk_session.client_id IS 'Device/client identifier';
COMMENT ON COLUMN public.clerk_session.ip_address IS 'IP address of the client';
COMMENT ON COLUMN public.clerk_session.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN public.clerk_session.status IS 'Status: ACTIVE, EXPIRED, REVOKED';
COMMENT ON COLUMN public.clerk_session.expires_at IS 'When this session expires';
COMMENT ON COLUMN public.clerk_session.last_active_at IS 'Last activity timestamp for this session';

-- ---------------------------------------------------
-- 8. ADD TRIGGER FOR AUTOMATIC updated_at TIMESTAMPS
-- ---------------------------------------------------
-- Reuse existing update_updated_at_column function for new tables

CREATE TRIGGER trg_clerk_user_tenant_updated_at
    BEFORE UPDATE ON public.clerk_user_tenant
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_clerk_organization_role_updated_at
    BEFORE UPDATE ON public.clerk_organization_role
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================================
-- END OF CLERK AUTHENTICATION INTEGRATION SCHEMA
-- ===================================================
-- =====================================================
-- NOTE: Multi-Tenant Membership System
-- =====================================================
-- The clerk_user_tenant table (created above around line 3557) already provides
-- multi-tenant membership functionality. It correctly references user_profile table
-- and supports users belonging to multiple tenants with tenant-specific roles.
--
-- No additional tenant_memberships table is needed.
-- All multi-tenant logic uses the existing clerk_user_tenant table.
-- =====================================================

-- =====================================================
-- PAYMENT ORCHESTRATION LAYER - TASK 001
-- =====================================================
-- Database migrations for payment orchestration service
-- Created: Task 001 - Set up project scaffolding and database migrations
-- =====================================================

--
-- TOC entry: payment_provider_config
-- Name: payment_provider_config; Type: TABLE; Schema: public
-- Purpose: Stores tenant-level payment provider credentials, feature flags, and configuration
--

CREATE TABLE public.payment_provider_config (
                                                id bigint DEFAULT nextval('public.payment_provider_config_id_seq'::regclass) NOT NULL,
                                                tenant_id character varying(255) NOT NULL,
                                                provider_name character varying(50) NOT NULL,
                                                payment_use_case character varying(50),
                                                is_active boolean DEFAULT true NOT NULL,
                                                supports_acp boolean DEFAULT false NOT NULL,
                                                supports_zeffy boolean DEFAULT false NOT NULL,
                                                supports_zelle boolean DEFAULT false NOT NULL,
                                                supports_revolut boolean DEFAULT false NOT NULL,
                                                provider_api_key_encrypted text,
                                                provider_secret_key_encrypted text,
                                                webhook_secret_encrypted text,
                                                payment_method_domain_id varchar,
                                                publishable_key character varying(500),
                                                fallback_order integer DEFAULT 0,
                                                configuration_json text,
                                                created_at timestamp without time zone DEFAULT now() NOT NULL,
                                                updated_at timestamp without time zone DEFAULT now() NOT NULL,

    -- Primary key constraint
                                                CONSTRAINT payment_provider_config_pkey PRIMARY KEY (id),

    -- Check constraints
                                                CONSTRAINT check_provider_name CHECK ((provider_name IN ('STRIPE', 'PAYPAL', 'ZEFFY', 'ZELLE_MANUAL', 'VENMO_MANUAL', 'CASH_APP_MANUAL', 'CASH', 'CHECK', 'OTHER_MANUAL', 'REVOLUT', 'CEFI_CHARITY', 'GIVEBUTTER'))),
                                                CONSTRAINT check_payment_use_case CHECK ((payment_use_case IS NULL OR payment_use_case IN ('TICKET_SALE', 'DONATION', 'DONATION_CEFI', 'DONATION_ZERO_FEE', 'OFFERING', 'MEMBERSHIP_SUBSCRIPTION'))),

    -- Unique constraints
                                                CONSTRAINT unique_tenant_provider UNIQUE (tenant_id, provider_name),

    -- CRITICAL: Triple validation unique constraint
                                                CONSTRAINT unique_tenant_payment_domain_webhook UNIQUE (tenant_id, payment_method_domain_id, webhook_secret_encrypted)
);

COMMENT ON TABLE public.payment_provider_config IS 'Stores tenant-level payment provider configurations and feature flags';
COMMENT ON COLUMN public.payment_provider_config.tenant_id IS 'Tenant identifier';
COMMENT ON COLUMN public.payment_provider_config.provider_name IS 'Payment provider name: STRIPE, PAYPAL, ZEFFY, ZELLE_MANUAL, VENMO_MANUAL, CASH_APP_MANUAL, CASH, CHECK, OTHER_MANUAL, REVOLUT, CEFI_CHARITY, GIVEBUTTER';
COMMENT ON COLUMN public.payment_provider_config.payment_use_case IS 'Payment use case: TICKET_SALE, DONATION, DONATION_CEFI, DONATION_ZERO_FEE, OFFERING, MEMBERSHIP_SUBSCRIPTION';
COMMENT ON COLUMN public.payment_provider_config.supports_acp IS 'Whether provider supports Stripe Instant Checkout (ACP)';
COMMENT ON COLUMN public.payment_provider_config.supports_zeffy IS 'Whether provider supports Zeffy integration';
COMMENT ON COLUMN public.payment_provider_config.supports_zelle IS 'Whether provider supports Zelle manual payments';
COMMENT ON COLUMN public.payment_provider_config.supports_revolut IS 'Whether provider supports Revolut payments';
COMMENT ON COLUMN public.payment_provider_config.provider_api_key_encrypted IS 'Encrypted provider API key (AES-256-GCM)';
COMMENT ON COLUMN public.payment_provider_config.provider_secret_key_encrypted IS 'Encrypted provider secret key (AES-256-GCM)';
COMMENT ON COLUMN public.payment_provider_config.fallback_order IS 'Order for fallback when primary provider fails (lower number = higher priority)';

--
-- TOC entry: manual_payment_request
-- Name: manual_payment_request; Type: TABLE; Schema: public
-- Purpose: Stores fee-free manual payment requests and proof-of-payment metadata
--

CREATE TABLE public.manual_payment_request (
                                             id bigint DEFAULT nextval('public.manual_payment_request_id_seq'::regclass) NOT NULL,
                                             tenant_id character varying(255) NOT NULL,
                                             event_id bigint,
                                             ticket_transaction_id bigint,
                                             requester_email character varying(255),
                                             requester_first_name character varying(255),
                                             requester_last_name character varying(255),
                                             requester_phone character varying(100),
                                             amount_due numeric(21,2) NOT NULL,
                                             payment_method_type VARCHAR(70) NOT NULL,
                                             payment_handle character varying(255),
                                             payment_instructions text,
                                             status character varying(30) DEFAULT 'REQUESTED' NOT NULL,
                                             proof_of_payment_file_key character varying(512),
                                             proof_of_payment_file_url character varying(1024),
                                             proof_of_payment_uploaded_at timestamp without time zone,
                                             received_at timestamp without time zone,
                                             received_by character varying(255),
                                             void_reason text,
                                             created_at timestamp without time zone DEFAULT now() NOT NULL,
                                             updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                             CONSTRAINT manual_payment_request_pkey PRIMARY KEY (id),
                                             CONSTRAINT check_manual_payment_status CHECK ((status IN ('REQUESTED', 'RECEIVED', 'VOIDED', 'REFUNDED'))),
                                             CONSTRAINT fk_manual_payment_request_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
                                             CONSTRAINT fk_manual_payment_request_ticket_transaction FOREIGN KEY (ticket_transaction_id) REFERENCES public.event_ticket_transaction(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.manual_payment_request IS 'Manual payment requests with external payment methods and proof-of-payment tracking';

--
-- TOC entry: manual_payment_summary_report
-- Name: manual_payment_summary_report; Type: TABLE; Schema: public
-- Purpose: Daily aggregation totals for manual payments by event/method/status
--

CREATE TABLE public.manual_payment_summary_report (
                                                    id bigint DEFAULT nextval('public.manual_payment_summary_report_id_seq'::regclass) NOT NULL,
                                                    tenant_id character varying(255) NOT NULL,
                                                    event_id bigint NOT NULL,
                                                    payment_method_type VARCHAR(70) NOT NULL,
                                                    status VARCHAR(70) NOT NULL,
                                                    total_amount numeric(21,2) NOT NULL DEFAULT 0,
                                                    transaction_count integer NOT NULL DEFAULT 0,
                                                    snapshot_date date NOT NULL,
                                                    created_at timestamp without time zone DEFAULT now() NOT NULL,
                                                    CONSTRAINT manual_payment_summary_report_pkey PRIMARY KEY (id),
                                                    CONSTRAINT check_manual_payment_summary_status CHECK ((status IN ('REQUESTED', 'RECEIVED', 'VOIDED', 'REFUNDED'))),
                                                    CONSTRAINT fk_manual_payment_summary_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.manual_payment_summary_report IS 'Daily summary of manual payments grouped by event, status, and method';
COMMENT ON COLUMN public.manual_payment_summary_report.snapshot_date IS 'Report snapshot date (retention policy: keep daily rows for 18 months, then archive)';

--
-- TOC entry: platform_settlement
-- Name: platform_settlement; Type: TABLE; Schema: public
-- Purpose: Stores aggregated settlement totals per tenant/provider/day
--

CREATE TABLE public.platform_settlement (
                                            id bigint DEFAULT nextval('public.platform_settlement_id_seq'::regclass) NOT NULL,
                                            tenant_id character varying(255) NOT NULL,
                                            provider_name character varying(50) NOT NULL,
                                            settlement_date date NOT NULL,
                                            gross_amount numeric(21,2) NOT NULL DEFAULT 0,
                                            processing_fee_amount numeric(21,2) NOT NULL DEFAULT 0,
                                            platform_fee_amount numeric(21,2) NOT NULL DEFAULT 0,
                                            net_amount numeric(21,2) NOT NULL DEFAULT 0,
                                            transaction_count integer DEFAULT 0 NOT NULL,
                                            status character varying(20) DEFAULT 'PENDING' NOT NULL,
                                            settlement_reference character varying(255),
                                            provider_settlement_id character varying(255),
                                            settlement_file_url character varying(2048),
                                            notes text,
                                            created_at timestamp without time zone DEFAULT now() NOT NULL,
                                            updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                            CONSTRAINT platform_settlement_pkey PRIMARY KEY (id),
                                            CONSTRAINT check_settlement_amounts CHECK (((gross_amount >= (0)::numeric) AND (processing_fee_amount >= (0)::numeric) AND (platform_fee_amount >= (0)::numeric) AND (net_amount >= (0)::numeric) AND (transaction_count >= 0))),
                                            CONSTRAINT check_settlement_status CHECK ((status IN ('PENDING', 'PROCESSING', 'SETTLED', 'FAILED', 'CANCELLED'))),
                                            CONSTRAINT check_provider_name_settlement CHECK ((provider_name IN ('STRIPE', 'PAYPAL', 'ZEFFY', 'ZELLE_MANUAL', 'VENMO_MANUAL', 'CASH_APP_MANUAL', 'CASH', 'CHECK', 'OTHER_MANUAL', 'REVOLUT', 'CEFI_CHARITY'))),
                                            CONSTRAINT unique_tenant_provider_date UNIQUE (tenant_id, provider_name, settlement_date)
);

COMMENT ON TABLE public.platform_settlement IS 'Aggregated settlement totals per tenant/provider/day for fee reconciliation';
COMMENT ON COLUMN public.platform_settlement.settlement_date IS 'Date for which settlement is calculated';
COMMENT ON COLUMN public.platform_settlement.gross_amount IS 'Total gross transaction amount';
COMMENT ON COLUMN public.platform_settlement.processing_fee_amount IS 'Total processing fees charged by provider';
COMMENT ON COLUMN public.platform_settlement.platform_fee_amount IS 'Total platform fees collected';
COMMENT ON COLUMN public.platform_settlement.net_amount IS 'Net amount after all fees (gross - processing_fee - platform_fee)';
COMMENT ON COLUMN public.platform_settlement.status IS 'Settlement status: PENDING, PROCESSING, SETTLED, FAILED, CANCELLED';

--
-- TOC entry: platform_invoice
-- Name: platform_invoice; Type: TABLE; Schema: public
-- Purpose: Invoices for outstanding platform fees; links to settlements
--

CREATE TABLE public.platform_invoice (
                                         id bigint DEFAULT nextval('public.platform_invoice_id_seq'::regclass) NOT NULL,
                                         tenant_id character varying(255) NOT NULL,
                                         invoice_number character varying(100) NOT NULL,
                                         invoice_date date NOT NULL,
                                         due_date date NOT NULL,
                                         total_amount numeric(21,2) NOT NULL,
                                         paid_amount numeric(21,2) DEFAULT 0 NOT NULL,
                                         outstanding_amount numeric(21,2) NOT NULL,
                                         status character varying(20) DEFAULT 'DRAFT' NOT NULL,
                                         settlement_batch_id bigint,
                                         payment_method character varying(50),
                                         payment_reference character varying(255),
                                         paid_at timestamp without time zone,
                                         notes text,
                                         created_at timestamp without time zone DEFAULT now() NOT NULL,
                                         updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                         CONSTRAINT platform_invoice_pkey PRIMARY KEY (id),
                                         CONSTRAINT check_invoice_amounts CHECK (((total_amount >= (0)::numeric) AND (paid_amount >= (0)::numeric) AND (outstanding_amount >= (0)::numeric) AND (paid_amount <= total_amount) AND (outstanding_amount = (total_amount - paid_amount)))),
                                         CONSTRAINT check_invoice_status CHECK ((status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'))),
                                         CONSTRAINT check_due_date CHECK ((due_date >= invoice_date)),
                                         CONSTRAINT unique_invoice_number UNIQUE (invoice_number),
                                         CONSTRAINT fk_platform_invoice__settlement_batch_id FOREIGN KEY (settlement_batch_id) REFERENCES public.platform_settlement(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.platform_invoice IS 'Invoices for outstanding platform fees linked to settlements';
COMMENT ON COLUMN public.platform_invoice.invoice_number IS 'Unique invoice number';
COMMENT ON COLUMN public.platform_invoice.invoice_date IS 'Date invoice was created';
COMMENT ON COLUMN public.platform_invoice.due_date IS 'Date payment is due';
COMMENT ON COLUMN public.platform_invoice.total_amount IS 'Total invoice amount';
COMMENT ON COLUMN public.platform_invoice.paid_amount IS 'Amount paid towards invoice';
COMMENT ON COLUMN public.platform_invoice.outstanding_amount IS 'Outstanding amount (total_amount - paid_amount)';
COMMENT ON COLUMN public.platform_invoice.status IS 'Invoice status: DRAFT, SENT, PAID, OVERDUE, CANCELLED';

--
-- TOC entry: membership_plan
-- Name: membership_plan; Type: TABLE; Schema: public
-- Purpose: Subscription plan definitions
--

CREATE TABLE public.membership_plan (
                                        id bigint DEFAULT nextval('public.membership_plan_id_seq'::regclass) NOT NULL,
                                        tenant_id character varying(255) NOT NULL,
                                        plan_name character varying(255) NOT NULL,
                                        plan_code character varying(100) NOT NULL,
                                        description text,
                                        plan_type character varying(50) DEFAULT 'SUBSCRIPTION' NOT NULL,
                                        billing_interval character varying(20) DEFAULT 'MONTHLY' NOT NULL,
                                        price numeric(21,2) NOT NULL,
                                        currency character varying(3) DEFAULT 'USD' NOT NULL,
                                        trial_days integer DEFAULT 0,
                                        is_active boolean DEFAULT true NOT NULL,
                                        max_events_per_month integer,
                                        max_attendees_per_event integer,
                                        features_json text,
                                        stripe_price_id character varying(255),
                                        stripe_product_id character varying(255),
                                        created_at timestamp without time zone DEFAULT now() NOT NULL,
                                        updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                        CONSTRAINT membership_plan_pkey PRIMARY KEY (id),
                                        CONSTRAINT check_plan_price CHECK ((price >= (0)::numeric)),
                                        CONSTRAINT check_billing_interval CHECK ((billing_interval IN ('MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME'))),
                                        CONSTRAINT check_plan_type CHECK ((plan_type IN ('SUBSCRIPTION', 'ONE_TIME', 'FREEMIUM'))),
                                        CONSTRAINT unique_tenant_plan_code UNIQUE (tenant_id, plan_code)
);

COMMENT ON TABLE public.membership_plan IS 'Subscription plan definitions for membership tiers';
COMMENT ON COLUMN public.membership_plan.plan_code IS 'Unique plan code identifier';
COMMENT ON COLUMN public.membership_plan.plan_type IS 'Plan type: SUBSCRIPTION, ONE_TIME, FREEMIUM';
COMMENT ON COLUMN public.membership_plan.billing_interval IS 'Billing interval: MONTHLY, QUARTERLY, YEARLY, ONE_TIME';
COMMENT ON COLUMN public.membership_plan.price IS 'Plan price';
COMMENT ON COLUMN public.membership_plan.trial_days IS 'Number of trial days (0 = no trial)';
COMMENT ON COLUMN public.membership_plan.features_json IS 'JSON object containing plan features and limits';

--
-- TOC entry: membership_subscription
-- Name: membership_subscription; Type: TABLE; Schema: public
-- Purpose: User subscription enrollments
--

CREATE TABLE public.membership_subscription (
                                                id bigint DEFAULT nextval('public.membership_subscription_id_seq'::regclass) NOT NULL,
                                                tenant_id character varying(255) NOT NULL,
                                                user_profile_id bigint NOT NULL,
                                                membership_plan_id bigint NOT NULL,
                                                subscription_status character varying(20) DEFAULT 'ACTIVE' NOT NULL,
                                                current_period_start date NOT NULL,
                                                current_period_end date NOT NULL,
                                                trial_start date,
                                                trial_end date,
                                                cancel_at_period_end boolean DEFAULT false NOT NULL,
                                                cancelled_at timestamp without time zone,
                                                cancellation_reason text,
                                                stripe_subscription_id character varying(255),
                                                stripe_customer_id character varying(255),
                                                last_reconciliation_at TIMESTAMP,
                                                last_stripe_sync_at TIMESTAMP,
                                                reconciliation_status VARCHAR(20) DEFAULT 'PENDING',
                                                reconciliation_error TEXT,
                                                payment_provider_config_id bigint,
                                                created_at timestamp without time zone DEFAULT now() NOT NULL,
                                                updated_at timestamp without time zone DEFAULT now() NOT NULL,
                                                CONSTRAINT membership_subscription_pkey PRIMARY KEY (id),
                                                CONSTRAINT check_subscription_status CHECK ((subscription_status IN ('ACTIVE', 'TRIAL', 'CANCELLED', 'PAST_DUE', 'EXPIRED', 'SUSPENDED'))),
                                                CONSTRAINT check_period_dates CHECK ((current_period_end >= current_period_start)),
                                                CONSTRAINT check_trial_dates CHECK (((trial_start IS NULL AND trial_end IS NULL) OR (trial_start IS NOT NULL AND trial_end IS NOT NULL AND trial_end >= trial_start))),
                                                CONSTRAINT fk_membership_subscription__user_profile_id FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id) ON DELETE CASCADE,
                                                CONSTRAINT fk_membership_subscription__membership_plan_id FOREIGN KEY (membership_plan_id) REFERENCES public.membership_plan(id) ON DELETE RESTRICT,
                                                CONSTRAINT unique_stripe_subscription_per_tenant UNIQUE (stripe_subscription_id, tenant_id),
                                                CONSTRAINT fk_membership_subscription__payment_provider_config_id FOREIGN KEY (payment_provider_config_id) REFERENCES public.payment_provider_config(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.membership_subscription IS 'User subscription enrollments to membership plans';
COMMENT ON COLUMN public.membership_subscription.subscription_status IS 'Subscription status: ACTIVE, TRIAL, CANCELLED, PAST_DUE, EXPIRED, SUSPENDED';
COMMENT ON COLUMN public.membership_subscription.current_period_start IS 'Start date of current billing period';
COMMENT ON COLUMN public.membership_subscription.current_period_end IS 'End date of current billing period';
COMMENT ON COLUMN public.membership_subscription.trial_start IS 'Trial period start date (if applicable)';
COMMENT ON COLUMN public.membership_subscription.trial_end IS 'Trial period end date (if applicable)';
COMMENT ON COLUMN public.membership_subscription.cancel_at_period_end IS 'Whether subscription will cancel at end of current period';


        -- Create reconciliation log table (optional, for detailed audit trail)
CREATE TABLE IF NOT EXISTS public.membership_subscription_reconciliation_log (
                                                                          id BIGINT PRIMARY KEY,
                                                                          subscription_id BIGINT NOT NULL,
                                                                          tenant_id VARCHAR(255) NOT NULL,
    reconciliation_type VARCHAR(50) NOT NULL, -- 'BATCH_RENEWAL', 'DAILY_RECONCILIATION', 'WEBHOOK'
    status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED', 'SKIPPED'
    local_period_start DATE,
    local_period_end DATE,
    stripe_period_start DATE,
    stripe_period_end DATE,
    local_status VARCHAR(20),
    stripe_status VARCHAR(20),
    changes_json TEXT,
    error_message TEXT,
    processed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (subscription_id) REFERENCES public.membership_subscription(id)
    );

CREATE INDEX IF NOT EXISTS idx_reconciliation_log_subscription
    ON public.membership_subscription_reconciliation_log(subscription_id, processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_reconciliation_log_tenant
    ON public.membership_subscription_reconciliation_log(tenant_id, processed_at DESC);

-- Migration: Create Promotion Email Template and Sent Log Tables
-- Date: 2025-01-XX
-- Description: Adds database tables for storing promotion email templates and tracking sent emails

-- ============================================
-- Table: promotion_email_template
-- ============================================
CREATE TABLE IF NOT EXISTS public.promotion_email_template (
                                                               id BIGINT PRIMARY KEY DEFAULT nextval('public.membership_subscription_id_seq'::regclass),
    tenant_id VARCHAR(255) NOT NULL,
    event_id BIGINT ,
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(160) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    from_email character varying(255) NOT NULL,
    body_html TEXT NOT NULL,
    footer_html TEXT,
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
                                                               id BIGINT PRIMARY KEY DEFAULT nextval('public.promotion_email_sent_log_id_seq'::regclass),
    tenant_id VARCHAR(255) NOT NULL,
    template_id BIGINT, -- FK to promotion_email_template.id (nullable to preserve audit logs when template is deleted)
    event_id BIGINT,
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
COMMENT ON COLUMN public.promotion_email_sent_log.template_id IS 'Foreign key to promotion_email_template. Can be NULL if template was deleted (audit logs are preserved).';
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
-- Create batch_job_execution table (if Spring Batch doesn't create it automatically)
-- Create batch_job_execution table (if Spring Batch doesn't create it automatically)



-- Spring Batch Metadata Tables
-- These tables are required for Spring Batch to track job executions
-- Run this script if automatic schema initialization fails

-- Spring Batch-specific sequences are created after tables (see below) with OWNED BY integrated into CREATE statements
-- This allows OWNED BY to be set in CREATE SEQUENCE statements (no ALTER needed)
-- Note: Sequences must exist before tables for DEFAULT nextval() to work, so they are created initially
-- and then recreated with OWNED BY after tables exist

-- Create Spring Batch sequences initially (before tables) to support DEFAULT nextval() in table definitions
-- These will be recreated with OWNED BY after tables exist (see below)
CREATE SEQUENCE IF NOT EXISTS public.batch_job_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.batch_job_execution_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.batch_step_execution_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- BATCH_JOB_INSTANCE
-- Using BIGINT with explicit sequence (batch_job_seq) instead of BIGSERIAL
-- This ensures Spring Batch can find the sequence with the expected name
CREATE TABLE IF NOT EXISTS public.BATCH_JOB_INSTANCE (
    JOB_INSTANCE_ID BIGINT DEFAULT nextval('public.batch_job_seq') PRIMARY KEY,
    VERSION BIGINT,
    JOB_NAME VARCHAR(100) NOT NULL,
    JOB_KEY VARCHAR(32) NOT NULL,
    CONSTRAINT JOB_INST_UN UNIQUE (JOB_NAME, JOB_KEY)
);

-- BATCH_JOB_EXECUTION
-- Using BIGINT with explicit sequence (batch_job_execution_seq) instead of BIGSERIAL
CREATE TABLE IF NOT EXISTS public.BATCH_JOB_EXECUTION (
    JOB_EXECUTION_ID BIGINT DEFAULT nextval('public.batch_job_execution_seq') PRIMARY KEY,
    VERSION BIGINT,
    JOB_INSTANCE_ID BIGINT NOT NULL,
    CREATE_TIME TIMESTAMP NOT NULL,
    START_TIME TIMESTAMP,
    END_TIME TIMESTAMP,
    STATUS VARCHAR(10),
    EXIT_CODE VARCHAR(2500),
    EXIT_MESSAGE TEXT,
    LAST_UPDATED TIMESTAMP,
    CONSTRAINT JOB_INST_EXEC_FK FOREIGN KEY (job_instance_id)
        REFERENCES public.BATCH_JOB_INSTANCE(job_instance_id)
);

-- BATCH_JOB_EXECUTION_PARAMS
CREATE TABLE IF NOT EXISTS public.BATCH_JOB_EXECUTION_PARAMS (
    JOB_EXECUTION_ID BIGINT NOT NULL,
    PARAMETER_NAME VARCHAR(100) NOT NULL,
    PARAMETER_TYPE VARCHAR(100) NOT NULL,
    PARAMETER_VALUE VARCHAR(2500),
    IDENTIFYING CHAR(1) NOT NULL,
    CONSTRAINT JOB_EXEC_PARAMS_FK FOREIGN KEY (job_execution_id)
        REFERENCES public.BATCH_JOB_EXECUTION(job_execution_id)
);

-- BATCH_STEP_EXECUTION
-- Using BIGINT with explicit sequence (batch_step_execution_seq) instead of BIGSERIAL
CREATE TABLE IF NOT EXISTS public.BATCH_STEP_EXECUTION (
    STEP_EXECUTION_ID BIGINT DEFAULT nextval('public.batch_step_execution_seq') PRIMARY KEY,
    VERSION BIGINT NOT NULL,
    STEP_NAME VARCHAR(100) NOT NULL,
    JOB_EXECUTION_ID BIGINT NOT NULL,
    CREATE_TIME TIMESTAMP NOT NULL,
    START_TIME TIMESTAMP,
    END_TIME TIMESTAMP,
    STATUS VARCHAR(10),
    COMMIT_COUNT BIGINT,
    READ_COUNT BIGINT,
    FILTER_COUNT BIGINT,
    WRITE_COUNT BIGINT,
    READ_SKIP_COUNT BIGINT,
    WRITE_SKIP_COUNT BIGINT,
    PROCESS_SKIP_COUNT BIGINT,
    ROLLBACK_COUNT BIGINT,
    EXIT_CODE VARCHAR(2500),
    EXIT_MESSAGE TEXT,
    LAST_UPDATED TIMESTAMP,
    CONSTRAINT JOB_EXEC_STEP_FK FOREIGN KEY (job_execution_id)
        REFERENCES public.BATCH_JOB_EXECUTION(job_execution_id)
);

-- BATCH_STEP_EXECUTION_CONTEXT
CREATE TABLE IF NOT EXISTS public.BATCH_STEP_EXECUTION_CONTEXT (
    STEP_EXECUTION_ID BIGINT NOT NULL PRIMARY KEY,
    SHORT_CONTEXT VARCHAR(2500) NOT NULL,
    SERIALIZED_CONTEXT TEXT,
    CONSTRAINT STEP_EXEC_CTX_FK FOREIGN KEY (step_execution_id)
        REFERENCES public.BATCH_STEP_EXECUTION(step_execution_id)
);

-- BATCH_JOB_EXECUTION_CONTEXT
CREATE TABLE IF NOT EXISTS public.BATCH_JOB_EXECUTION_CONTEXT (
    JOB_EXECUTION_ID BIGINT NOT NULL PRIMARY KEY,
    SHORT_CONTEXT VARCHAR(2500) NOT NULL,
    SERIALIZED_CONTEXT TEXT,
    CONSTRAINT JOB_EXEC_CTX_FK FOREIGN KEY (job_execution_id)
        REFERENCES public.BATCH_JOB_EXECUTION(job_execution_id)
);

-- Custom application table: batch_job_execution_log
-- This table is separate from Spring Batch's internal tables (BATCH_*)
-- Used for custom tracking and auditing of batch job executions with additional metadata
-- Note: This is NOT the same as BATCH_JOB_EXECUTION (Spring Batch framework table)
-- Using BIGSERIAL for auto-increment (JPA @GeneratedValue with sequenceGenerator will work with this)
-- This table uses batch_job_execution_log_id_seq (per-table sequence)
CREATE TABLE IF NOT EXISTS public.batch_job_execution_log (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    tenant_id VARCHAR(255),
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_ms BIGINT,
    processed_count BIGINT DEFAULT 0,
    success_count BIGINT DEFAULT 0,
    failed_count BIGINT DEFAULT 0,
    error_message TEXT,
    triggered_by VARCHAR(100),
    parameters_json TEXT
);

-- Create indexes for better performance
-- Indexes for Spring Batch tables
CREATE INDEX IF NOT EXISTS JOB_INST_UN ON public.BATCH_JOB_INSTANCE(job_name, job_key);
CREATE INDEX IF NOT EXISTS JOB_EXEC_INST_FK ON public.BATCH_JOB_EXECUTION(job_instance_id);
CREATE INDEX IF NOT EXISTS JOB_EXEC_PARAMS_FK ON public.BATCH_JOB_EXECUTION_PARAMS(job_execution_id);
CREATE INDEX IF NOT EXISTS STEP_EXEC_JOB_FK ON public.BATCH_STEP_EXECUTION(job_execution_id);
CREATE INDEX IF NOT EXISTS STEP_EXEC_CTX_FK ON public.BATCH_STEP_EXECUTION_CONTEXT(step_execution_id);
CREATE INDEX IF NOT EXISTS JOB_EXEC_CTX_FK ON public.BATCH_JOB_EXECUTION_CONTEXT(job_execution_id);

-- Indexes for custom batch_job_execution_log table
CREATE INDEX IF NOT EXISTS idx_batch_job_execution_log_job_name
    ON public.batch_job_execution_log(job_name, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_job_execution_log_status
    ON public.batch_job_execution_log(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_job_execution_log_tenant
    ON public.batch_job_execution_log(tenant_id, started_at DESC);

-- (Batch job sequence initialization moved to consolidated section below)

-- Create Spring Batch-specific sequences with OWNED BY integrated into CREATE statements
-- These sequences are created after tables to allow OWNED BY clause (no ALTER statements needed)
-- Note: Sequences are recreated here (after tables exist) to set OWNED BY in CREATE statement
-- This ensures sequences are dropped if columns/tables are dropped
-- The initial sequence creation (before tables) is removed since we recreate them here with OWNED BY
DROP SEQUENCE IF EXISTS public.batch_job_seq CASCADE;
CREATE SEQUENCE public.batch_job_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
    OWNED BY public.BATCH_JOB_INSTANCE.JOB_INSTANCE_ID;

DROP SEQUENCE IF EXISTS public.batch_job_execution_seq CASCADE;
CREATE SEQUENCE public.batch_job_execution_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
    OWNED BY public.BATCH_JOB_EXECUTION.JOB_EXECUTION_ID;

DROP SEQUENCE IF EXISTS public.batch_step_execution_seq CASCADE;
CREATE SEQUENCE public.batch_step_execution_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
    OWNED BY public.BATCH_STEP_EXECUTION.STEP_EXECUTION_ID;


-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for payment_provider_config
CREATE INDEX IF NOT EXISTS idx_payment_provider_config_tenant_id ON public.payment_provider_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_provider_config_provider_name ON public.payment_provider_config(provider_name);
CREATE INDEX IF NOT EXISTS idx_payment_provider_config_active ON public.payment_provider_config(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_payment_provider_config_use_case ON public.payment_provider_config(payment_use_case);

-- Indexes for manual_payment_summary_report
CREATE INDEX IF NOT EXISTS idx_manual_payment_summary_report_tenant_id ON public.manual_payment_summary_report(tenant_id);
CREATE INDEX IF NOT EXISTS idx_manual_payment_summary_report_event_id ON public.manual_payment_summary_report(event_id);
CREATE INDEX IF NOT EXISTS idx_manual_payment_summary_report_snapshot_date ON public.manual_payment_summary_report(snapshot_date);

-- Indexes for platform_settlement
CREATE INDEX IF NOT EXISTS idx_platform_settlement_tenant_id ON public.platform_settlement(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_settlement_provider_name ON public.platform_settlement(provider_name);
CREATE INDEX IF NOT EXISTS idx_platform_settlement_date ON public.platform_settlement(settlement_date);
CREATE INDEX IF NOT EXISTS idx_platform_settlement_status ON public.platform_settlement(status);
CREATE INDEX IF NOT EXISTS idx_platform_settlement_tenant_provider_date ON public.platform_settlement(tenant_id, provider_name, settlement_date);

-- Indexes for platform_invoice
CREATE INDEX IF NOT EXISTS idx_platform_invoice_tenant_id ON public.platform_invoice(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_invoice_status ON public.platform_invoice(status);
CREATE INDEX IF NOT EXISTS idx_platform_invoice_due_date ON public.platform_invoice(due_date);
CREATE INDEX IF NOT EXISTS idx_platform_invoice_settlement_batch_id ON public.platform_invoice(settlement_batch_id);
CREATE INDEX IF NOT EXISTS idx_platform_invoice_invoice_date ON public.platform_invoice(invoice_date);

-- Indexes for membership_plan
CREATE INDEX IF NOT EXISTS idx_membership_plan_tenant_id ON public.membership_plan(tenant_id);
CREATE INDEX IF NOT EXISTS idx_membership_plan_code ON public.membership_plan(plan_code);
CREATE INDEX IF NOT EXISTS idx_membership_plan_active ON public.membership_plan(is_active) WHERE is_active = true;

-- Indexes for membership_subscription
CREATE INDEX IF NOT EXISTS idx_membership_subscription_tenant_id ON public.membership_subscription(tenant_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscription_user_profile_id ON public.membership_subscription(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscription_membership_plan_id ON public.membership_subscription(membership_plan_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscription_status ON public.membership_subscription(subscription_status);
CREATE INDEX IF NOT EXISTS idx_membership_subscription_stripe_subscription_id ON public.membership_subscription(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_membership_subscription_current_period_end ON public.membership_subscription(current_period_end);

-- Create index for renewal query optimization
CREATE INDEX IF NOT EXISTS idx_membership_subscription_renewal_check
ON public.membership_subscription(subscription_status, current_period_end, cancel_at_period_end)
WHERE subscription_status IN ('ACTIVE', 'TRIAL');

-- Create index for Stripe subscription lookup
CREATE INDEX IF NOT EXISTS idx_membership_subscription_stripe_id
ON public.membership_subscription(stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

-- Create index for reconciliation
CREATE INDEX IF NOT EXISTS idx_membership_subscription_reconciliation
ON public.membership_subscription(reconciliation_status, last_reconciliation_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC updated_at TIMESTAMPS
-- =====================================================

CREATE TRIGGER trg_payment_provider_config_updated_at
    BEFORE UPDATE ON public.payment_provider_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_platform_settlement_updated_at
    BEFORE UPDATE ON public.platform_settlement
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_platform_invoice_updated_at
    BEFORE UPDATE ON public.platform_invoice
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_membership_plan_updated_at
    BEFORE UPDATE ON public.membership_plan
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_membership_subscription_updated_at
    BEFORE UPDATE ON public.membership_subscription
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- GIVEBUTTER DONATION TRANSACTION TABLES
-- =====================================================

-- Table: donation_transaction
-- Purpose: Stores standalone donation transactions (non-ticketed donations) for GiveButter integration
-- Created: 2025-01-XX
-- Description: Supports donation-based events, Mass offerings, and fundraiser events with zero-fee processing

CREATE TABLE public.donation_transaction (
    id bigint DEFAULT nextval('public.donation_transaction_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    event_id bigint,
    payment_transaction_id bigint,
    transaction_reference character varying(255) NOT NULL,
    givebutter_donation_id character varying(255),
    amount numeric(10,2) NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    phone character varying(50),
    prayer_intention text,
    is_recurring boolean DEFAULT false NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL,
    status character varying(50) NOT NULL,
    qr_code_url text,
    qr_code_image_url text,
    email_sent boolean DEFAULT false NOT NULL,
    metadata text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT donation_transaction_pkey PRIMARY KEY (id),
    CONSTRAINT fk_donation_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE SET NULL,
    CONSTRAINT fk_donation_payment FOREIGN KEY (payment_transaction_id) REFERENCES public.user_payment_transaction(id) ON DELETE SET NULL,
    CONSTRAINT ux_donation_transaction_reference UNIQUE (transaction_reference)
);

-- Performance indexes for donation_transaction
CREATE INDEX idx_donation_tenant_event ON public.donation_transaction(tenant_id, event_id);
CREATE INDEX idx_donation_reference ON public.donation_transaction(transaction_reference);
CREATE INDEX idx_donation_givebutter_id ON public.donation_transaction(givebutter_donation_id);
CREATE INDEX idx_donation_status ON public.donation_transaction(status);
CREATE INDEX idx_donation_created ON public.donation_transaction(created_at);
CREATE INDEX idx_donation_email_sent ON public.donation_transaction(email_sent) WHERE email_sent = false;
CREATE INDEX idx_donation_qr_code ON public.donation_transaction(qr_code_url) WHERE qr_code_url IS NULL;

-- Comments for donation_transaction table
COMMENT ON TABLE public.donation_transaction IS 'Stores standalone donation transactions (non-ticketed donations) for GiveButter integration';
COMMENT ON COLUMN public.donation_transaction.tenant_id IS 'Multi-tenant identifier';
COMMENT ON COLUMN public.donation_transaction.event_id IS 'Foreign key to event_details (nullable for standalone donations)';
COMMENT ON COLUMN public.donation_transaction.payment_transaction_id IS 'Foreign key to user_payment_transaction (links to payment orchestration)';
COMMENT ON COLUMN public.donation_transaction.transaction_reference IS 'Unique transaction reference (e.g., "GB-12345")';
COMMENT ON COLUMN public.donation_transaction.givebutter_donation_id IS 'GiveButter donation ID from API response';
COMMENT ON COLUMN public.donation_transaction.amount IS 'Donation amount';
COMMENT ON COLUMN public.donation_transaction.email IS 'Donor email address';
COMMENT ON COLUMN public.donation_transaction.first_name IS 'Donor first name';
COMMENT ON COLUMN public.donation_transaction.last_name IS 'Donor last name';
COMMENT ON COLUMN public.donation_transaction.phone IS 'Donor phone number (optional)';
COMMENT ON COLUMN public.donation_transaction.prayer_intention IS 'Prayer intention for Mass offerings (optional)';
COMMENT ON COLUMN public.donation_transaction.is_recurring IS 'Whether donation is recurring';
COMMENT ON COLUMN public.donation_transaction.is_anonymous IS 'Whether donation is anonymous';
COMMENT ON COLUMN public.donation_transaction.status IS 'Donation status: PENDING, COMPLETED, FAILED, CANCELLED (VARCHAR, not enum - matches existing pattern)';
COMMENT ON COLUMN public.donation_transaction.qr_code_url IS 'QR code URL for donation confirmation';
COMMENT ON COLUMN public.donation_transaction.qr_code_image_url IS 'QR code image URL';
COMMENT ON COLUMN public.donation_transaction.email_sent IS 'Whether confirmation email has been sent';
COMMENT ON COLUMN public.donation_transaction.metadata IS 'JSON string for additional donation data';
COMMENT ON COLUMN public.donation_transaction.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.donation_transaction.updated_at IS 'Record last update timestamp';

-- Trigger for automatic updated_at timestamp on donation_transaction
CREATE TRIGGER trg_donation_transaction_updated_at
    BEFORE UPDATE ON public.donation_transaction
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Optional Table: donation_statistics
-- Purpose: Pre-aggregated donation statistics for admin dashboard performance optimization
-- Note: This table is optional. Statistics can also be calculated on-the-fly from donation_transaction table.

CREATE TABLE public.donation_statistics (
    id bigint DEFAULT nextval('public.donation_statistics_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    event_id bigint,
    total_donations integer DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    average_amount numeric(10,2) DEFAULT 0 NOT NULL,
    date_range_start date,
    date_range_end date,
    last_updated timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT donation_statistics_pkey PRIMARY KEY (id),
    CONSTRAINT fk_donation_statistics_event FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE SET NULL,
    CONSTRAINT ux_donation_statistics_unique UNIQUE (tenant_id, event_id, date_range_start, date_range_end)
);

-- Indexes for donation_statistics table
CREATE INDEX idx_donation_stats_tenant_event ON public.donation_statistics(tenant_id, event_id);
CREATE INDEX idx_donation_stats_date_range ON public.donation_statistics(date_range_start, date_range_end);

-- Comments for donation_statistics table
COMMENT ON TABLE public.donation_statistics IS 'Pre-aggregated donation statistics for admin dashboard (optional - for performance optimization)';
COMMENT ON COLUMN public.donation_statistics.tenant_id IS 'Multi-tenant identifier';
COMMENT ON COLUMN public.donation_statistics.event_id IS 'Foreign key to event_details';
COMMENT ON COLUMN public.donation_statistics.total_donations IS 'Total number of donations in date range';
COMMENT ON COLUMN public.donation_statistics.total_amount IS 'Total donation amount in date range';
COMMENT ON COLUMN public.donation_statistics.average_amount IS 'Average donation amount in date range';
COMMENT ON COLUMN public.donation_statistics.date_range_start IS 'Start date of statistics range';
COMMENT ON COLUMN public.donation_statistics.date_range_end IS 'End date of statistics range';
COMMENT ON COLUMN public.donation_statistics.last_updated IS 'Last time statistics were updated';

-- Trigger for automatic updated_at timestamp on donation_statistics
CREATE TRIGGER trg_donation_statistics_updated_at
    BEFORE UPDATE ON public.donation_statistics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SATELLITE DOMAIN CONFIGURATION TABLE
-- =====================================================
-- Stores satellite domain configuration for multi-tenant architecture.
-- Replaces static config/satellites.json with database-backed configuration.
-- Allows runtime addition of new satellite domains without redeployment.

CREATE TABLE public.satellite_domain (
    id bigint DEFAULT nextval('public.satellite_domain_id_seq'::regclass) NOT NULL,
    satellite_key character varying(100) NOT NULL,
    domain character varying(500) NOT NULL,
    hostname character varying(255) NOT NULL,
    display_name character varying(255) NOT NULL,
    tenant_id character varying(255),
    enabled boolean DEFAULT true NOT NULL,
    added_date timestamp without time zone DEFAULT now(),

    -- Branding basics
    org_name character varying(255),
    full_name character varying(500),
    tagline character varying(500),

    -- Logo configuration
    logo_type character varying(50) DEFAULT 'text',
    logo_url character varying(1024),
    logo_primary_color character varying(50),
    logo_secondary_color character varying(50),

    -- Theme colors
    theme_primary_color character varying(50),
    theme_hover_color character varying(50),
    theme_active_color character varying(50),

    -- Contact information
    contact_address character varying(1024),
    contact_phone character varying(100),
    contact_toll_free character varying(100),
    contact_email character varying(255),

    -- Social media links
    social_facebook character varying(1024),
    social_twitter character varying(1024),
    social_linkedin character varying(1024),
    social_youtube character varying(1024),

    -- Auth page display flags
    show_on_auth_header boolean DEFAULT true NOT NULL,
    show_on_auth_footer boolean DEFAULT true NOT NULL,

    -- Timestamps
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT satellite_domain_pkey PRIMARY KEY (id),
    CONSTRAINT ux_satellite_domain_satellite_key UNIQUE (satellite_key),
    CONSTRAINT ux_satellite_domain_hostname UNIQUE (hostname)
);

CREATE INDEX idx_satellite_domain_tenant_id ON public.satellite_domain(tenant_id);
CREATE INDEX idx_satellite_domain_enabled ON public.satellite_domain(enabled) WHERE enabled = true;

COMMENT ON TABLE public.satellite_domain IS 'Satellite domain configuration for multi-tenant architecture. Each row represents a satellite site that authenticates via the primary domain.';
COMMENT ON COLUMN public.satellite_domain.satellite_key IS 'Unique short identifier for the satellite (e.g. mosc-temp, mcefee-temp).';
COMMENT ON COLUMN public.satellite_domain.domain IS 'Full domain URL with protocol (e.g. https://www.mosc-temp.com).';
COMMENT ON COLUMN public.satellite_domain.hostname IS 'Domain hostname without protocol (e.g. www.mosc-temp.com).';
COMMENT ON COLUMN public.satellite_domain.logo_type IS 'Logo display type: text (render org name as text) or image (use logo_url).';

-- Trigger for updated_at
CREATE TRIGGER trg_satellite_domain_updated_at
    BEFORE UPDATE ON public.satellite_domain
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Seed existing satellite domains from config/satellites.json
--seed removed
-- =====================================================
-- NEWS PORTAL TABLES
-- =====================================================
-- Tables follow schema standards: id bigint with per-table {table}_id_seq, tenant_id, created_at/updated_at.
-- See .cursor/rules/database_schema_guidelines.mdc and documentation/news_portal/backend_prd.html.

-- news_category: Categories for articles (e.g. Main News, Featured News, Press Release).
CREATE TABLE public.news_category (
    id bigint DEFAULT nextval('public.news_category_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT news_category_pkey PRIMARY KEY (id),
    CONSTRAINT ux_news_category_tenant_slug UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_news_category_tenant_id ON public.news_category(tenant_id);
CREATE INDEX idx_news_category_slug ON public.news_category(tenant_id, slug);
CREATE INDEX idx_news_category_is_active ON public.news_category(tenant_id, is_active) WHERE is_active = true;

COMMENT ON TABLE public.news_category IS 'News categories (e.g. Main News, Featured News, Press Release).';

-- news_article: Single news item.
CREATE TABLE public.news_article (
    id bigint DEFAULT nextval('public.news_article_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    slug character varying(500) NOT NULL,
    excerpt text,
    body text,
    featured_image_url character varying(1024),
    published_at timestamp without time zone,
    status character varying(50) NOT NULL,
    author_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT news_article_pkey PRIMARY KEY (id),
    CONSTRAINT ux_news_article_tenant_slug UNIQUE (tenant_id, slug),
    CONSTRAINT fk_news_article_author FOREIGN KEY (author_id) REFERENCES public.user_profile(id) ON DELETE SET NULL
);

CREATE INDEX idx_news_article_tenant_id ON public.news_article(tenant_id);
CREATE INDEX idx_news_article_slug ON public.news_article(tenant_id, slug);
CREATE INDEX idx_news_article_status ON public.news_article(tenant_id, status);
CREATE INDEX idx_news_article_published_at ON public.news_article(published_at) WHERE published_at IS NOT NULL;

COMMENT ON TABLE public.news_article IS 'News articles with title, slug, body, status (DRAFT/PUBLISHED/ARCHIVED).';

-- news_section_display_config: Per-section display settings (one row per section per tenant).
CREATE TABLE public.news_section_display_config (
    id bigint DEFAULT nextval('public.news_section_display_config_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    section_key character varying(100) NOT NULL,
    section_title_override character varying(255),
    banner_image_url character varying(1024),
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT news_section_display_config_pkey PRIMARY KEY (id),
    CONSTRAINT ux_news_section_display_config_tenant_key UNIQUE (tenant_id, section_key)
);

CREATE INDEX idx_news_section_display_config_tenant_id ON public.news_section_display_config(tenant_id);
CREATE INDEX idx_news_section_display_config_section_key ON public.news_section_display_config(tenant_id, section_key);

COMMENT ON TABLE public.news_section_display_config IS 'Per-section display config (flash_news, main_news, featured_news, most_read, press_release, sidebar_promotional_block).';

-- news_sidebar_promotion: Rotating banner ads / promotional items for the right sidebar (slideshow with timer).
CREATE TABLE public.news_sidebar_promotion (
    id bigint DEFAULT nextval('public.news_sidebar_promotion_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    title character varying(255),
    image_url character varying(1024) NOT NULL,
    link_url character varying(1024),
    display_order integer DEFAULT 0 NOT NULL,
    display_duration_seconds integer DEFAULT 5 NOT NULL,
    valid_from timestamp without time zone,
    valid_to timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT news_sidebar_promotion_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_news_sidebar_promotion_tenant_id ON public.news_sidebar_promotion(tenant_id);
CREATE INDEX idx_news_sidebar_promotion_is_active ON public.news_sidebar_promotion(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX idx_news_sidebar_promotion_valid_dates ON public.news_sidebar_promotion(valid_from, valid_to);
CREATE INDEX idx_news_sidebar_promotion_display_order ON public.news_sidebar_promotion(tenant_id, display_order);

COMMENT ON TABLE public.news_sidebar_promotion IS 'Rotating banner ads / promotional items for the right sidebar; displayed as slideshow with configurable display_duration_seconds per slide.';
COMMENT ON COLUMN public.news_sidebar_promotion.display_duration_seconds IS 'Seconds to show this slide in the rotating slideshow before advancing to next.';

-- news_flash: Short flash items for carousel/ticker.
CREATE TABLE public.news_flash (
    id bigint DEFAULT nextval('public.news_flash_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    headline character varying(500) NOT NULL,
    link_url character varying(1024),
    news_article_id bigint,
    display_order integer DEFAULT 0 NOT NULL,
    valid_from timestamp without time zone,
    valid_to timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT news_flash_pkey PRIMARY KEY (id),
    CONSTRAINT fk_news_flash_article FOREIGN KEY (news_article_id) REFERENCES public.news_article(id) ON DELETE SET NULL
);

CREATE INDEX idx_news_flash_tenant_id ON public.news_flash(tenant_id);
CREATE INDEX idx_news_flash_is_active ON public.news_flash(tenant_id, is_active) WHERE is_active = true;
CREATE INDEX idx_news_flash_valid_dates ON public.news_flash(valid_from, valid_to);

COMMENT ON TABLE public.news_flash IS 'Flash news items for carousel/ticker.';

-- news_live_stream_config: Current live stream for the LIVE page (one active config per tenant).
CREATE TABLE public.news_live_stream_config (
    id bigint DEFAULT nextval('public.news_live_stream_config_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    embed_url character varying(1024),
    title character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT news_live_stream_config_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_news_live_stream_config_tenant_id ON public.news_live_stream_config(tenant_id);
CREATE INDEX idx_news_live_stream_config_is_active ON public.news_live_stream_config(tenant_id, is_active) WHERE is_active = true;

COMMENT ON TABLE public.news_live_stream_config IS 'Live stream embed config for the LIVE page (e.g. YouTube Live).';

-- news_article_category: Many-to-many between news_article and news_category.
CREATE TABLE public.news_article_category (
    id bigint DEFAULT nextval('public.news_article_category_id_seq'::regclass) NOT NULL,
    news_article_id bigint NOT NULL,
    news_category_id bigint NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT news_article_category_pkey PRIMARY KEY (id),
    CONSTRAINT ux_news_article_category_article_category UNIQUE (news_article_id, news_category_id),
    CONSTRAINT fk_news_article_category_article FOREIGN KEY (news_article_id) REFERENCES public.news_article(id) ON DELETE CASCADE,
    CONSTRAINT fk_news_article_category_category FOREIGN KEY (news_category_id) REFERENCES public.news_category(id) ON DELETE CASCADE
);

CREATE INDEX idx_news_article_category_article ON public.news_article_category(news_article_id);
CREATE INDEX idx_news_article_category_category ON public.news_article_category(news_category_id);

COMMENT ON TABLE public.news_article_category IS 'Many-to-many link between news_article and news_category.';

-- Triggers for updated_at on tables that have updated_at
CREATE TRIGGER trg_news_category_updated_at
    BEFORE UPDATE ON public.news_category
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_news_article_updated_at
    BEFORE UPDATE ON public.news_article
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_news_section_display_config_updated_at
    BEFORE UPDATE ON public.news_section_display_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_news_sidebar_promotion_updated_at
    BEFORE UPDATE ON public.news_sidebar_promotion
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_news_flash_updated_at
    BEFORE UPDATE ON public.news_flash
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_news_live_stream_config_updated_at
    BEFORE UPDATE ON public.news_live_stream_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- EVENT COMPETITIONS TABLES
-- =====================================================
-- Generic Event Competitions domain (youth, adult, mixed).
-- See documentation/kanj_feature_comparison/event_competitions/database_schema_prd.html
-- and .cursor/rules/database_schema_guidelines.mdc

-- event_competition_settings: Per-event competition configuration (1:1 with event_details).
CREATE TABLE public.event_competition_settings (
    id bigint DEFAULT nextval('public.event_competition_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    event_id bigint NOT NULL,
    audience_mode character varying(20) DEFAULT 'YOUTH' NOT NULL,
    registration_mode character varying(32) DEFAULT 'PARENT_CHILD' NOT NULL,
    registration_deadline timestamp without time zone,
    registration_open boolean DEFAULT true NOT NULL,
    allow_ticket_sales boolean DEFAULT false NOT NULL,
    points_first integer DEFAULT 5 NOT NULL,
    points_second integer DEFAULT 3 NOT NULL,
    points_third integer DEFAULT 1 NOT NULL,
    points_fourth integer DEFAULT 0,
    default_max_placements integer DEFAULT 3,
    champion_enabled boolean DEFAULT false NOT NULL,
    champion_exclude_group_points boolean DEFAULT true NOT NULL,
    champion_max_category integer,
    results_display_mode character varying(32) DEFAULT 'FULL_NAME',
    eligibility_text text,
    winners_published_email_sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_competition_settings_pkey PRIMARY KEY (id),
    CONSTRAINT chk_event_competition_settings__audience
        CHECK (audience_mode IN ('YOUTH', 'ADULT', 'MIXED')),
    CONSTRAINT chk_event_competition_settings__reg_mode
        CHECK (registration_mode IN ('PARENT_CHILD', 'SELF', 'TEAM_CAPTAIN', 'MIXED')),
    CONSTRAINT ux_event_competition_settings__event UNIQUE (event_id),
    CONSTRAINT fk_event_competition_settings__event
        FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.event_competition_settings IS 'Per-event competition settings (audience, registration, scoring, results display).';

-- event_competition_day: Multi-day festival schedule rows.
CREATE TABLE public.event_competition_day (
    id bigint DEFAULT nextval('public.event_competition_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    event_id bigint NOT NULL,
    day_label character varying(100) NOT NULL,
    event_date date NOT NULL,
    venue_name character varying(255) NOT NULL,
    venue_address character varying(500),
    sort_order integer DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_competition_day_pkey PRIMARY KEY (id),
    CONSTRAINT fk_event_competition_day__event
        FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

CREATE INDEX idx_event_competition_day__event_id ON public.event_competition_day(event_id);

COMMENT ON TABLE public.event_competition_day IS 'Competition festival days (venue, date, sort order).';

-- event_competition: Competition catalog entries for an event.
CREATE TABLE public.event_competition (
    id bigint DEFAULT nextval('public.event_competition_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    event_id bigint NOT NULL,
    competition_day_id bigint,
    name character varying(255) NOT NULL,
    description text,
    competition_type character varying(20) NOT NULL,
    eligible_audience character varying(20) DEFAULT 'ALL' NOT NULL,
    category_code character varying(20),
    division_label character varying(100),
    track character varying(50),
    fee_amount numeric(10,2) DEFAULT 0 NOT NULL,
    max_participants integer,
    min_group_size integer DEFAULT 3,
    max_group_size integer DEFAULT 10,
    time_limit_minutes integer,
    requires_soundtrack boolean DEFAULT false NOT NULL,
    judgment_criteria_json text,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    discipline_code character varying(32),
    min_age integer,
    max_age integer,
    min_grade integer,
    max_grade integer,
    max_placements integer DEFAULT 3,
    registration_deadline timestamp without time zone,
    rules_markdown text,
    requires_team_name boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_competition_pkey PRIMARY KEY (id),
    CONSTRAINT chk_event_competition__type
        CHECK (competition_type IN ('INDIVIDUAL', 'GROUP')),
    CONSTRAINT chk_event_competition__eligible_audience
        CHECK (eligible_audience IN ('YOUTH_ONLY', 'ADULT_ONLY', 'ALL')),
    CONSTRAINT fk_event_competition__event
        FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_competition__day
        FOREIGN KEY (competition_day_id) REFERENCES public.event_competition_day(id) ON DELETE SET NULL
);

CREATE INDEX idx_event_competition__event_id ON public.event_competition(event_id);

COMMENT ON TABLE public.event_competition IS 'Competition catalog (individual/group, fees, categories, eligibility).';

-- event_competition_participant: Child, adult, or team member profiles for registrations.
CREATE TABLE public.event_competition_participant (
    id bigint DEFAULT nextval('public.event_competition_participant_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    participant_type character varying(20) NOT NULL,
    user_profile_id bigint NOT NULL,
    clerk_user_id character varying(255) NOT NULL,
    guardian_user_profile_id bigint,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    display_name character varying(200),
    date_of_birth date,
    current_grade integer,
    school_name character varying(255),
    phone character varying(50),
    email character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_competition_participant_pkey PRIMARY KEY (id),
    CONSTRAINT chk_event_competition_participant__type
        CHECK (participant_type IN ('CHILD', 'ADULT', 'TEAM_MEMBER')),
    CONSTRAINT fk_event_competition_participant__user_profile
        FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id),
    CONSTRAINT fk_event_competition_participant__guardian
        FOREIGN KEY (guardian_user_profile_id) REFERENCES public.user_profile(id)
);

CREATE INDEX idx_event_competition_participant__tenant_clerk
    ON public.event_competition_participant(tenant_id, clerk_user_id);
CREATE INDEX idx_event_competition_participant__guardian
    ON public.event_competition_participant(tenant_id, guardian_user_profile_id)
    WHERE guardian_user_profile_id IS NOT NULL;

COMMENT ON TABLE public.event_competition_participant IS 'Competition participants (child/adult/team member) linked to user_profile.';

-- event_competition_registration: Participant enrolled in a competition.
CREATE TABLE public.event_competition_registration (
    id bigint DEFAULT nextval('public.event_competition_registration_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    event_id bigint NOT NULL,
    competition_id bigint NOT NULL,
    participant_profile_id bigint NOT NULL,
    registration_status character varying(32) DEFAULT 'PENDING_PAYMENT' NOT NULL,
    fee_amount numeric(10,2) NOT NULL,
    effective_category character varying(20),
    stripe_payment_intent_id character varying(255),
    team_name character varying(200),
    team_display_name character varying(200),
    group_leader_registration_id bigint,
    registered_by_user_profile_id bigint NOT NULL,
    confirmation_email_sent boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_competition_registration_pkey PRIMARY KEY (id),
    CONSTRAINT ux_event_comp_reg__participant_competition
        UNIQUE (competition_id, participant_profile_id),
    CONSTRAINT fk_event_comp_reg__competition
        FOREIGN KEY (competition_id) REFERENCES public.event_competition(id),
    CONSTRAINT fk_event_comp_reg__participant
        FOREIGN KEY (participant_profile_id) REFERENCES public.event_competition_participant(id),
    CONSTRAINT fk_event_comp_reg__event
        FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_comp_reg__registered_by
        FOREIGN KEY (registered_by_user_profile_id) REFERENCES public.user_profile(id),
    CONSTRAINT fk_event_comp_reg__group_leader
        FOREIGN KEY (group_leader_registration_id) REFERENCES public.event_competition_registration(id) ON DELETE SET NULL
);

CREATE INDEX idx_event_comp_reg__event_id ON public.event_competition_registration(event_id);

COMMENT ON TABLE public.event_competition_registration IS 'Competition registrations with payment and group leader linkage.';

-- event_competition_result: Placements, prizes, and winner media.
CREATE TABLE public.event_competition_result (
    id bigint DEFAULT nextval('public.event_competition_result_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    event_id bigint NOT NULL,
    competition_id bigint NOT NULL,
    participant_profile_id bigint,
    registration_id bigint,
    display_name character varying(200) NOT NULL,
    placement integer,
    placement_label character varying(50),
    prize_title character varying(255),
    prize_details text,
    points_awarded integer DEFAULT 0 NOT NULL,
    winner_photo_url character varying(1024),
    winner_media_id bigint,
    notes text,
    is_published boolean DEFAULT false NOT NULL,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_competition_result_pkey PRIMARY KEY (id),
    CONSTRAINT chk_event_comp_result__placement
        CHECK (placement IS NULL OR placement >= 1),
    CONSTRAINT fk_event_comp_result__competition
        FOREIGN KEY (competition_id) REFERENCES public.event_competition(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_comp_result__participant
        FOREIGN KEY (participant_profile_id) REFERENCES public.event_competition_participant(id),
    CONSTRAINT fk_event_comp_result__registration
        FOREIGN KEY (registration_id) REFERENCES public.event_competition_registration(id),
    CONSTRAINT fk_event_comp_result__winner_media
        FOREIGN KEY (winner_media_id) REFERENCES public.event_media(id) ON DELETE SET NULL
);

CREATE INDEX idx_event_comp_result__event_published
    ON public.event_competition_result(event_id, is_published);
CREATE INDEX idx_event_comp_result__competition_placement
    ON public.event_competition_result(competition_id, placement)
    WHERE is_published = true;

COMMENT ON TABLE public.event_competition_result IS 'Competition results (placement, prizes, winner photo via event_media).';

-- event_competition_content_block: Markdown content blocks per event (rules, FAQ, etc.).
CREATE TABLE public.event_competition_content_block (
    id bigint DEFAULT nextval('public.event_competition_content_block_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    event_id bigint NOT NULL,
    block_type character varying(32) NOT NULL,
    title character varying(255),
    body_markdown text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_competition_content_block_pkey PRIMARY KEY (id),
    CONSTRAINT ux_event_comp_content__event_type UNIQUE (event_id, block_type),
    CONSTRAINT fk_event_comp_content__event
        FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.event_competition_content_block IS 'Per-event competition content blocks (markdown).';

-- event_competition_group_member: Optional normalized group roster members (v1.1).
CREATE TABLE public.event_competition_group_member (
    id bigint DEFAULT nextval('public.event_competition_group_member_id_seq'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    registration_id bigint NOT NULL,
    participant_profile_id bigint NOT NULL,
    member_role character varying(20) DEFAULT 'MEMBER',
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_competition_group_member_pkey PRIMARY KEY (id),
    CONSTRAINT fk_event_comp_group_member__registration
        FOREIGN KEY (registration_id) REFERENCES public.event_competition_registration(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_comp_group_member__participant
        FOREIGN KEY (participant_profile_id) REFERENCES public.event_competition_participant(id)
);

COMMENT ON TABLE public.event_competition_group_member IS 'Group competition roster members linked to leader registration.';

-- Triggers for updated_at on tables that have updated_at
CREATE TRIGGER trg_event_competition_settings_updated_at
    BEFORE UPDATE ON public.event_competition_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_event_competition_day_updated_at
    BEFORE UPDATE ON public.event_competition_day
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_event_competition_updated_at
    BEFORE UPDATE ON public.event_competition
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_event_competition_participant_updated_at
    BEFORE UPDATE ON public.event_competition_participant
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_event_competition_registration_updated_at
    BEFORE UPDATE ON public.event_competition_registration
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_event_competition_result_updated_at
    BEFORE UPDATE ON public.event_competition_result
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_event_competition_content_block_updated_at
    BEFORE UPDATE ON public.event_competition_content_block
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- END OF EVENT COMPETITIONS TABLES
-- =====================================================

-- =====================================================
-- END OF PAYMENT ORCHESTRATION LAYER MIGRATION
-- =====================================================

-- =====================================================
-- SEQUENCE INITIALIZATION - PREVENT DUPLICATE KEY ERRORS
-- =====================================================
-- All sequence setval statements are consolidated here for maintainability
-- Each sequence must be set individually (they are different sequences)
-- =====================================================

-- Table-specific sequences (for tables using BIGSERIAL or explicit sequences)
-- =====================================================

-- Ensure discount_code_id_seq sequence is always ahead of existing data
SELECT pg_catalog.setval(
               'public.discount_code_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.discount_code), 1), 1),
               true
       );

-- Ensure event_live_update_attachment_id_seq sequence is always ahead of existing data
SELECT pg_catalog.setval(
               'public.event_live_update_attachment_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.event_live_update_attachment), 1), 1),
               true
       );

-- Ensure event_live_update_id_seq sequence is always ahead of existing data
SELECT pg_catalog.setval(
               'public.event_live_update_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.event_live_update), 1), 1),
               true
       );

-- Ensure event_score_card_detail_id_seq sequence is always ahead of existing data
SELECT pg_catalog.setval(
               'public.event_score_card_detail_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.event_score_card_detail), 1), 1),
               true
       );

-- Ensure event_score_card_id_seq sequence is always ahead of existing data
SELECT pg_catalog.setval(
               'public.event_score_card_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.event_score_card), 1), 1),
               true
       );

-- Batch job sequences (Spring Batch framework sequences)
-- =====================================================

-- Ensure batch_job_execution_log sequence is always ahead of existing data
-- (safe even if the table is empty)
SELECT pg_catalog.setval(
               'public.batch_job_execution_log_id_seq',
               GREATEST(COALESCE((SELECT MAX(id) FROM public.batch_job_execution_log), 1), 1),
               true
       );

-- Ensure batch_job_seq sequence is always ahead of existing data
-- (safe even if the table is empty)
SELECT pg_catalog.setval(
               'public.batch_job_seq',
               GREATEST(COALESCE((SELECT MAX(JOB_INSTANCE_ID) FROM public.BATCH_JOB_INSTANCE), 1), 1),
               true
       );

-- Ensure batch_job_execution_seq sequence is always ahead of existing data
-- (safe even if the table is empty)
SELECT pg_catalog.setval(
               'public.batch_job_execution_seq',
               GREATEST(COALESCE((SELECT MAX(JOB_EXECUTION_ID) FROM public.BATCH_JOB_EXECUTION), 1), 1),
               true
       );

-- Ensure batch_step_execution_seq sequence is always ahead of existing data
-- (safe even if the table is empty)
SELECT pg_catalog.setval(
               'public.batch_step_execution_seq',
               GREATEST(COALESCE((SELECT MAX(STEP_EXECUTION_ID) FROM public.BATCH_STEP_EXECUTION), 1), 1),
               true
       );

-- Per-table application sequences (synced from table MAX(id))
-- =====================================================
-- For full DB refresh after import, prefer sync_all_table_sequences.sql
-- Spring Batch sequences below are unchanged.
-- =====================================================

-- user_profile
SELECT pg_catalog.setval(
    'public.user_profile_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.user_profile), 1), 1),
    true
);
-- bulk_operation_log
SELECT pg_catalog.setval(
    'public.bulk_operation_log_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.bulk_operation_log), 1), 1),
    true
);
-- event_type_details
SELECT pg_catalog.setval(
    'public.event_type_details_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_type_details), 1), 1),
    true
);
-- event_details
SELECT pg_catalog.setval(
    'public.event_details_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_details), 1), 1),
    true
);
-- event_recurrence_series
SELECT pg_catalog.setval(
    'public.event_recurrence_series_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_recurrence_series), 1), 1),
    true
);
-- focus_group
SELECT pg_catalog.setval(
    'public.focus_group_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.focus_group), 1), 1),
    true
);
-- focus_group_members
SELECT pg_catalog.setval(
    'public.focus_group_members_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.focus_group_members), 1), 1),
    true
);
-- event_focus_groups
SELECT pg_catalog.setval(
    'public.event_focus_groups_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_focus_groups), 1), 1),
    true
);
-- event_guest_pricing
SELECT pg_catalog.setval(
    'public.event_guest_pricing_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_guest_pricing), 1), 1),
    true
);
-- event_live_update
SELECT pg_catalog.setval(
    'public.event_live_update_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_live_update), 1), 1),
    true
);
-- event_live_update_attachment
SELECT pg_catalog.setval(
    'public.event_live_update_attachment_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_live_update_attachment), 1), 1),
    true
);
-- event_admin
SELECT pg_catalog.setval(
    'public.event_admin_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_admin), 1), 1),
    true
);
-- event_admin_audit_log
SELECT pg_catalog.setval(
    'public.event_admin_audit_log_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_admin_audit_log), 1), 1),
    true
);
-- event_attendee
SELECT pg_catalog.setval(
    'public.event_attendee_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_attendee), 1), 1),
    true
);
-- event_attendee_guest
SELECT pg_catalog.setval(
    'public.event_attendee_guest_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_attendee_guest), 1), 1),
    true
);
-- event_attendee_attachment
SELECT pg_catalog.setval(
    'public.event_attendee_attachment_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_attendee_attachment), 1), 1),
    true
);
-- event_calendar_entry
SELECT pg_catalog.setval(
    'public.event_calendar_entry_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_calendar_entry), 1), 1),
    true
);
-- event_sponsors
SELECT pg_catalog.setval(
    'public.event_sponsors_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_sponsors), 1), 1),
    true
);
-- event_sponsors_join
SELECT pg_catalog.setval(
    'public.event_sponsors_join_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_sponsors_join), 1), 1),
    true
);
-- gallery_category
SELECT pg_catalog.setval(
    'public.gallery_category_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.gallery_category), 1), 1),
    true
);
-- gallery_album
SELECT pg_catalog.setval(
    'public.gallery_album_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.gallery_album), 1), 1),
    true
);
-- official_document_category
SELECT pg_catalog.setval(
    'public.official_document_category_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.official_document_category), 1), 1),
    true
);
-- event_media
SELECT pg_catalog.setval(
    'public.event_media_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_media), 1), 1),
    true
);
-- official_document_year_bundle
SELECT pg_catalog.setval(
    'public.official_document_year_bundle_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.official_document_year_bundle), 1), 1),
    true
);
-- event_organizer
SELECT pg_catalog.setval(
    'public.event_organizer_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_organizer), 1), 1),
    true
);
-- event_poll
SELECT pg_catalog.setval(
    'public.event_poll_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_poll), 1), 1),
    true
);
-- event_poll_option
SELECT pg_catalog.setval(
    'public.event_poll_option_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_poll_option), 1), 1),
    true
);
-- event_poll_response
SELECT pg_catalog.setval(
    'public.event_poll_response_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_poll_response), 1), 1),
    true
);
-- event_score_card
SELECT pg_catalog.setval(
    'public.event_score_card_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_score_card), 1), 1),
    true
);
-- event_score_card_detail
SELECT pg_catalog.setval(
    'public.event_score_card_detail_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_score_card_detail), 1), 1),
    true
);
-- discount_code
SELECT pg_catalog.setval(
    'public.discount_code_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.discount_code), 1), 1),
    true
);
-- event_ticket_transaction
SELECT pg_catalog.setval(
    'public.event_ticket_transaction_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_ticket_transaction), 1), 1),
    true
);
-- event_ticket_type
SELECT pg_catalog.setval(
    'public.event_ticket_type_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_ticket_type), 1), 1),
    true
);
-- event_ticket_transaction_item
SELECT pg_catalog.setval(
    'public.event_ticket_transaction_item_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_ticket_transaction_item), 1), 1),
    true
);
-- qr_code_usage
SELECT pg_catalog.setval(
    'public.qr_code_usage_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.qr_code_usage), 1), 1),
    true
);
-- tenant_organization
SELECT pg_catalog.setval(
    'public.tenant_organization_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.tenant_organization), 1), 1),
    true
);
-- tenant_settings
SELECT pg_catalog.setval(
    'public.tenant_settings_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.tenant_settings), 1), 1),
    true
);
-- tenant_email_addresses
SELECT pg_catalog.setval(
    'public.tenant_email_addresses_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.tenant_email_addresses), 1), 1),
    true
);
-- user_payment_transaction
SELECT pg_catalog.setval(
    'public.user_payment_transaction_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.user_payment_transaction), 1), 1),
    true
);
-- user_subscription
SELECT pg_catalog.setval(
    'public.user_subscription_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.user_subscription), 1), 1),
    true
);
-- user_task
SELECT pg_catalog.setval(
    'public.user_task_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.user_task), 1), 1),
    true
);
-- executive_committee_team_members
SELECT pg_catalog.setval(
    'public.executive_committee_team_members_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.executive_committee_team_members), 1), 1),
    true
);
-- team_groups
SELECT pg_catalog.setval(
    'public.team_groups_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.team_groups), 1), 1),
    true
);
-- team_members
SELECT pg_catalog.setval(
    'public.team_members_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.team_members), 1), 1),
    true
);
-- communication_campaign
SELECT pg_catalog.setval(
    'public.communication_campaign_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.communication_campaign), 1), 1),
    true
);
-- email_log
SELECT pg_catalog.setval(
    'public.email_log_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.email_log), 1), 1),
    true
);
-- whatsapp_log
SELECT pg_catalog.setval(
    'public.whatsapp_log_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.whatsapp_log), 1), 1),
    true
);
-- event_featured_performers
SELECT pg_catalog.setval(
    'public.event_featured_performers_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_featured_performers), 1), 1),
    true
);
-- event_contacts
SELECT pg_catalog.setval(
    'public.event_contacts_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_contacts), 1), 1),
    true
);
-- event_emails
SELECT pg_catalog.setval(
    'public.event_emails_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_emails), 1), 1),
    true
);
-- event_program_directors
SELECT pg_catalog.setval(
    'public.event_program_directors_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_program_directors), 1), 1),
    true
);
-- clerk_user_tenant
SELECT pg_catalog.setval(
    'public.clerk_user_tenant_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.clerk_user_tenant), 1), 1),
    true
);
-- clerk_organization_role
SELECT pg_catalog.setval(
    'public.clerk_organization_role_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.clerk_organization_role), 1), 1),
    true
);
-- clerk_webhook_event
SELECT pg_catalog.setval(
    'public.clerk_webhook_event_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.clerk_webhook_event), 1), 1),
    true
);
-- clerk_session
SELECT pg_catalog.setval(
    'public.clerk_session_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.clerk_session), 1), 1),
    true
);
-- payment_provider_config
SELECT pg_catalog.setval(
    'public.payment_provider_config_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.payment_provider_config), 1), 1),
    true
);
-- manual_payment_request
SELECT pg_catalog.setval(
    'public.manual_payment_request_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.manual_payment_request), 1), 1),
    true
);
-- manual_payment_summary_report
SELECT pg_catalog.setval(
    'public.manual_payment_summary_report_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.manual_payment_summary_report), 1), 1),
    true
);
-- platform_settlement
SELECT pg_catalog.setval(
    'public.platform_settlement_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.platform_settlement), 1), 1),
    true
);
-- platform_invoice
SELECT pg_catalog.setval(
    'public.platform_invoice_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.platform_invoice), 1), 1),
    true
);
-- membership_plan
SELECT pg_catalog.setval(
    'public.membership_plan_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.membership_plan), 1), 1),
    true
);
-- membership_subscription
SELECT pg_catalog.setval(
    'public.membership_subscription_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.membership_subscription), 1), 1),
    true
);
-- donation_transaction
SELECT pg_catalog.setval(
    'public.donation_transaction_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.donation_transaction), 1), 1),
    true
);
-- donation_statistics
SELECT pg_catalog.setval(
    'public.donation_statistics_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.donation_statistics), 1), 1),
    true
);
-- satellite_domain
SELECT pg_catalog.setval(
    'public.satellite_domain_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.satellite_domain), 1), 1),
    true
);
-- news_category
SELECT pg_catalog.setval(
    'public.news_category_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.news_category), 1), 1),
    true
);
-- news_article
SELECT pg_catalog.setval(
    'public.news_article_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.news_article), 1), 1),
    true
);
-- news_section_display_config
SELECT pg_catalog.setval(
    'public.news_section_display_config_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.news_section_display_config), 1), 1),
    true
);
-- news_sidebar_promotion
SELECT pg_catalog.setval(
    'public.news_sidebar_promotion_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.news_sidebar_promotion), 1), 1),
    true
);
-- news_flash
SELECT pg_catalog.setval(
    'public.news_flash_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.news_flash), 1), 1),
    true
);
-- news_live_stream_config
SELECT pg_catalog.setval(
    'public.news_live_stream_config_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.news_live_stream_config), 1), 1),
    true
);
-- news_article_category
SELECT pg_catalog.setval(
    'public.news_article_category_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.news_article_category), 1), 1),
    true
);
-- event_competition_settings
SELECT pg_catalog.setval(
    'public.event_competition_settings_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_competition_settings), 1), 1),
    true
);
-- event_competition_day
SELECT pg_catalog.setval(
    'public.event_competition_day_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_competition_day), 1), 1),
    true
);
-- event_competition
SELECT pg_catalog.setval(
    'public.event_competition_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_competition), 1), 1),
    true
);
-- event_competition_participant
SELECT pg_catalog.setval(
    'public.event_competition_participant_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_competition_participant), 1), 1),
    true
);
-- event_competition_registration
SELECT pg_catalog.setval(
    'public.event_competition_registration_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_competition_registration), 1), 1),
    true
);
-- event_competition_result
SELECT pg_catalog.setval(
    'public.event_competition_result_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_competition_result), 1), 1),
    true
);
-- event_competition_content_block
SELECT pg_catalog.setval(
    'public.event_competition_content_block_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_competition_content_block), 1), 1),
    true
);
-- event_competition_group_member
SELECT pg_catalog.setval(
    'public.event_competition_group_member_id_seq',
    GREATEST(COALESCE((SELECT MAX(id) FROM public.event_competition_group_member), 1), 1),
    true
);
-- Verify executive_committee_team_members sequence (per-table model)
SELECT
    (SELECT last_value FROM pg_sequences WHERE sequencename = 'executive_committee_team_members_id_seq') AS seq_last_value,
    (SELECT MAX(id) FROM public.executive_committee_team_members) AS table_max_id,
    CASE
        WHEN (SELECT last_value FROM pg_sequences WHERE sequencename = 'executive_committee_team_members_id_seq')
             >= COALESCE((SELECT MAX(id) FROM public.executive_committee_team_members), 0)
        THEN 'OK: per-table sequence >= max(id)'
        ELSE 'WARNING: run sync_all_table_sequences.sql'
    END AS status;


