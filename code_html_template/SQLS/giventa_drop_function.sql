--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0 (Debian 16.0-1.pgdg120+1)
-- Dumped by pg_dump version 17.0

-- Started on 2025-06-08 23:51:02

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
--SET transaction_timeout = 0;
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


ALTER DATABASE giventa_event_management OWNER TO giventa_event_management;

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

--
-- TOC entry 256 (class 1255 OID 71145)
-- Name: generate_attendee_qr_code(); Type: FUNCTION; Schema: public; Owner: nextjs_template_boot
--


-- Drop existing types if they exist (for clean recreation)
DROP TYPE IF EXISTS guest_age_group CASCADE;
DROP TYPE IF EXISTS user_to_guest_relationship CASCADE;
DROP TYPE IF EXISTS user_event_registration_status CASCADE;
DROP TYPE IF EXISTS user_event_check_in_status CASCADE;
DROP TYPE IF EXISTS subscription_plan_type CASCADE;
DROP TYPE IF EXISTS subscription_status_type CASCADE;
DROP TYPE IF EXISTS user_role_type CASCADE;
DROP TYPE IF EXISTS user_status_type CASCADE;
DROP TYPE IF EXISTS event_admission_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;

-- ===================================================
-- SEQUENCE CREATION
-- ===================================================

-- Drop sequence if exists and recreate
DROP SEQUENCE IF EXISTS public.sequence_generator CASCADE;

-- ===================================================
-- DROP EXISTING TABLES (in reverse dependency order)
-- ===================================================

DROP TABLE IF EXISTS public.bulk_operation_log CASCADE;
DROP TABLE IF EXISTS public.qr_code_usage CASCADE;
DROP TABLE IF EXISTS public.user_registration_request CASCADE;
DROP TABLE IF EXISTS public.event_attendee_guest CASCADE;
DROP TABLE IF EXISTS public.event_guest_pricing CASCADE;
DROP TABLE IF EXISTS public.event_attendee CASCADE;
DROP TABLE IF EXISTS public.event_admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.event_calendar_entry CASCADE;
DROP TABLE IF EXISTS public.event_media CASCADE;
DROP TABLE IF EXISTS public.event_poll_response CASCADE;
DROP TABLE IF EXISTS public.event_poll_option CASCADE;
DROP TABLE IF EXISTS public.event_poll CASCADE;
DROP TABLE IF EXISTS public.event_ticket_transaction CASCADE;
DROP TABLE IF EXISTS public.user_payment_transaction CASCADE;
DROP TABLE IF EXISTS public.event_ticket_type CASCADE;
DROP TABLE IF EXISTS public.event_organizer CASCADE;
DROP TABLE IF EXISTS public.event_details CASCADE;
DROP TABLE IF EXISTS public.event_admin CASCADE;
DROP TABLE IF EXISTS public.user_task CASCADE;
DROP TABLE IF EXISTS public.user_subscription CASCADE;
DROP TABLE IF EXISTS public.event_type_details CASCADE;
DROP TABLE IF EXISTS public.tenant_settings CASCADE;
DROP TABLE IF EXISTS public.user_profile CASCADE;
DROP TABLE IF EXISTS public.tenant_organization CASCADE;
DROP TABLE IF EXISTS public.databasechangeloglock CASCADE;
DROP TABLE IF EXISTS public.databasechangelog CASCADE;
DROP TABLE IF EXISTS public.discount_code CASCADE;
DROP TABLE IF EXISTS public.event_discount_code CASCADE;

CREATE FUNCTION IF NOT EXISTS  public.generate_attendee_qr_code() RETURNS trigger
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


ALTER FUNCTION public.generate_attendee_qr_code() OWNER TO nextjs_template_boot;

--
-- TOC entry 272 (class 1255 OID 71151)
-- Name: generate_enhanced_qr_code(); Type: FUNCTION; Schema: public; Owner: nextjs_template_boot
--

CREATE FUNCTION IF NOT EXISTS  public.generate_enhanced_qr_code() RETURNS trigger
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
        WHERE up.id = NEW.attendee_id;

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


ALTER FUNCTION public.generate_enhanced_qr_code() OWNER TO nextjs_template_boot;

--
-- TOC entry 273 (class 1255 OID 71150)
-- Name: manage_ticket_inventory(); Type: FUNCTION; Schema: public; Owner: nextjs_template_boot
--

CREATE FUNCTION IF NOT EXISTS  public.manage_ticket_inventory() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    ticket_type_record RECORD;
    available_quantity INTEGER;
BEGIN
    -- Get ticket type details
    SELECT * INTO ticket_type_record
    FROM public.event_ticket_type
    WHERE id = COALESCE(NEW.ticket_type_id, OLD.ticket_type_id);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket type not found for ID: %', COALESCE(NEW.ticket_type_id, OLD.ticket_type_id);
    END IF;

    -- Handle different operations
    IF TG_OP = 'INSERT' AND NEW.status = 'COMPLETED' THEN
        -- Check availability before increasing sold quantity
        available_quantity := ticket_type_record.available_quantity - ticket_type_record.sold_quantity;
        IF available_quantity < NEW.quantity THEN
            RAISE EXCEPTION 'Insufficient tickets available. Requested: %, Available: %',
                NEW.quantity, available_quantity;
        END IF;

        UPDATE public.event_ticket_type
        SET sold_quantity = sold_quantity + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.ticket_type_id;

        RAISE NOTICE 'Added % tickets to sold quantity for ticket type %', NEW.quantity, NEW.ticket_type_id;

    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
            -- Ticket sale completed
            UPDATE public.event_ticket_type
            SET sold_quantity = sold_quantity + NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.ticket_type_id;

        ELSIF OLD.status = 'COMPLETED' AND NEW.status != 'COMPLETED' THEN
            -- Ticket sale cancelled/refunded
            UPDATE public.event_ticket_type
            SET sold_quantity = sold_quantity - OLD.quantity,
                updated_at = NOW()
            WHERE id = OLD.ticket_type_id;

        ELSIF OLD.status = 'COMPLETED' AND NEW.status = 'COMPLETED' AND OLD.quantity != NEW.quantity THEN
            -- Quantity changed for completed sale
            UPDATE public.event_ticket_type
            SET sold_quantity = sold_quantity - OLD.quantity + NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.ticket_type_id;
        END IF;

    ELSIF TG_OP = 'DELETE' AND OLD.status = 'COMPLETED' THEN
        -- Remove sold tickets when transaction is deleted
        UPDATE public.event_ticket_type
        SET sold_quantity = sold_quantity - OLD.quantity,
            updated_at = NOW()
        WHERE id = OLD.ticket_type_id;

        RAISE NOTICE 'Removed % tickets from sold quantity for ticket type %', OLD.quantity, OLD.ticket_type_id;
    END IF;

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION public.manage_ticket_inventory() OWNER TO nextjs_template_boot;

--
-- TOC entry 255 (class 1255 OID 71143)
-- Name: update_ticket_sold_quantity(); Type: FUNCTION; Schema: public; Owner: nextjs_template_boot
--

CREATE FUNCTION IF NOT EXISTS  public.update_ticket_sold_quantity() RETURNS trigger
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


ALTER FUNCTION public.update_ticket_sold_quantity() OWNER TO nextjs_template_boot;

--
-- TOC entry 271 (class 1255 OID 70264)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: nextjs_template_boot
--

CREATE FUNCTION IF NOT EXISTS  public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO nextjs_template_boot;

--
-- TOC entry 254 (class 1255 OID 71141)
-- Name: validate_event_dates(); Type: FUNCTION; Schema: public; Owner: nextjs_template_boot
--

CREATE FUNCTION IF NOT EXISTS  public.validate_event_dates() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure start_date is not in the past (allow same day)
    IF NEW.start_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Event start date cannot be in the past';
    END IF;

    -- Ensure registration deadline is before event start
    IF NEW.registration_deadline IS NOT NULL AND NEW.registration_deadline::date > NEW.start_date THEN
        RAISE EXCEPTION 'Registration deadline must be before event start date';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_event_dates() OWNER TO nextjs_template_boot;

--
-- TOC entry 257 (class 1255 OID 71147)
-- Name: validate_event_dates_alt1(); Type: FUNCTION; Schema: public; Owner: nextjs_template_boot
--

CREATE FUNCTION IF NOT EXISTS  public.validate_event_dates_alt1() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.start_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Event start date cannot be in the past';
    END IF;

    IF NEW.registration_deadline IS NOT NULL AND NEW.registration_deadline::date > NEW.start_date THEN
        RAISE EXCEPTION 'Registration deadline must be before event start date';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_event_dates_alt1() OWNER TO nextjs_template_boot;

--
-- TOC entry 258 (class 1255 OID 71148)
-- Name: validate_event_dates_alt2(); Type: FUNCTION; Schema: public; Owner: nextjs_template_boot
--

CREATE FUNCTION IF NOT EXISTS  public.validate_event_dates_alt2() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.start_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Event start date cannot be in the past';
    END IF;

    IF NEW.registration_deadline IS NOT NULL AND NEW.registration_deadline::date > NEW.start_date THEN
        RAISE EXCEPTION 'Registration deadline must be before event start date';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_event_dates_alt2() OWNER TO nextjs_template_boot;

--
-- TOC entry 270 (class 1255 OID 71149)
-- Name: validate_event_details(); Type: FUNCTION; Schema: public; Owner: nextjs_template_boot
--

CREATE FUNCTION IF NOT EXISTS  public.validate_event_details() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Validate start date
    IF NEW.start_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Event start date (%) cannot be in the past. Current date: %',
            NEW.start_date, CURRENT_DATE;
    END IF;

    -- Validate end date
    IF NEW.end_date < NEW.start_date THEN
        RAISE EXCEPTION 'Event end date (%) cannot be before start date (%)',
            NEW.end_date, NEW.start_date;
    END IF;

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


ALTER FUNCTION public.validate_event_details() OWNER TO nextjs_template_boot;

--
-- TOC entry 224 (class 1259 OID 82754)
-- Name: sequence_generator; Type: SEQUENCE; Schema: public; Owner: nextjs_template_boot
--

CREATE SEQUENCE public.sequence_generator
    START WITH 1050
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sequence_generator OWNER TO nextjs_template_boot;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 238 (class 1259 OID 82938)
-- Name: bulk_operation_log; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.bulk_operation_log (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    operation_type character varying(50) NOT NULL,
    operation_name character varying(255),
    performed_by bigint,
    target_count integer NOT NULL,
    success_count integer DEFAULT 0,
    error_count integer DEFAULT 0,
    skipped_count integer DEFAULT 0,
    operation_details text,
    error_details text,
    execution_time_ms integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    CONSTRAINT check_operation_counts CHECK ((((success_count + error_count) + skipped_count) <= target_count))
);


ALTER TABLE public.bulk_operation_log OWNER TO nextjs_template_boot;

--
-- TOC entry 225 (class 1259 OID 82755)
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: nextjs_template_boot
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


ALTER TABLE public.databasechangelog OWNER TO nextjs_template_boot;

--
-- TOC entry 226 (class 1259 OID 82760)
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.databasechangeloglock (
    id integer NOT NULL,
    locked boolean NOT NULL,
    lockgranted timestamp without time zone,
    lockedby character varying(255)
);


ALTER TABLE public.databasechangeloglock OWNER TO nextjs_template_boot;

--
-- TOC entry 228 (class 1259 OID 82766)
-- Name: discount_code; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.discount_code (
    id bigint NOT NULL,
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
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.discount_code OWNER TO nextjs_template_boot;

--
-- TOC entry 3927 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE discount_code; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.discount_code IS 'Discount codes for ticket purchases';


--
-- TOC entry 227 (class 1259 OID 82765)
-- Name: discount_code_id_seq; Type: SEQUENCE; Schema: public; Owner: nextjs_template_boot
--

CREATE SEQUENCE public.discount_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discount_code_id_seq OWNER TO nextjs_template_boot;

--
-- TOC entry 3929 (class 0 OID 0)
-- Dependencies: 227
-- Name: discount_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nextjs_template_boot
--

ALTER SEQUENCE public.discount_code_id_seq OWNED BY public.discount_code.id;


--
-- TOC entry 235 (class 1259 OID 82890)
-- Name: event_admin; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_admin (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    role character varying(255) NOT NULL,
    permissions text[],
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id bigint,
    created_by_id bigint
);


ALTER TABLE public.event_admin OWNER TO nextjs_template_boot;

--
-- TOC entry 249 (class 1259 OID 83122)
-- Name: event_admin_audit_log; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_admin_audit_log (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    action character varying(255) NOT NULL,
    table_name character varying(255) NOT NULL,
    record_id character varying(255) NOT NULL,
    changes jsonb,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    session_id character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    admin_id bigint
);


ALTER TABLE public.event_admin_audit_log OWNER TO nextjs_template_boot;

--
-- TOC entry 3932 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE event_admin_audit_log; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.event_admin_audit_log IS 'Comprehensive audit logging for all admin actions';


--
-- TOC entry 248 (class 1259 OID 83101)
-- Name: event_attendee; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_attendee (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    event_id bigint NOT NULL,
    attendee_id bigint NOT NULL,
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
    check_in_status character varying(20) DEFAULT 'NOT_CHECKED_IN'::character varying,
    check_in_time timestamp without time zone,
    check_out_time timestamp without time zone,
    attendance_rating integer,
    feedback text,
    notes text,
    qr_code_data character varying(1000),
    qr_code_generated boolean DEFAULT false,
    qr_code_generated_at timestamp without time zone,
    registration_source character varying(100) DEFAULT 'DIRECT'::character varying,
    waitlist_position integer,
    priority_score integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_waitlist_position_positive CHECK (((waitlist_position IS NULL) OR (waitlist_position > 0))),
    CONSTRAINT event_attendee_attendance_rating_check CHECK (((attendance_rating >= 1) AND (attendance_rating <= 5)))
);


ALTER TABLE public.event_attendee OWNER TO nextjs_template_boot;

--
-- TOC entry 3934 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE event_attendee; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.event_attendee IS 'Enhanced event registration and attendance tracking with QR code support';


--
-- TOC entry 3935 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN event_attendee.qr_code_data; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_attendee.qr_code_data IS 'QR code data for check-in (auto-generated)';


--
-- TOC entry 3936 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN event_attendee.qr_code_generated; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_attendee.qr_code_generated IS 'Whether QR code has been generated for this attendee';


--
-- TOC entry 3937 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN event_attendee.qr_code_generated_at; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_attendee.qr_code_generated_at IS 'Timestamp when QR code was generated';


--
-- TOC entry 250 (class 1259 OID 83131)
-- Name: event_attendee_guest; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_attendee_guest (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    primary_attendee_id bigint NOT NULL,
    guest_name character varying(255) NOT NULL,
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
    CONSTRAINT check_guest_fee_non_negative CHECK ((fee_amount >= (0)::numeric))
);


ALTER TABLE public.event_attendee_guest OWNER TO nextjs_template_boot;

--
-- TOC entry 3939 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE event_attendee_guest; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.event_attendee_guest IS 'Guest registrations linked to primary attendees using JDL enum types';


--
-- TOC entry 3940 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN event_attendee_guest.age_group; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_attendee_guest.age_group IS 'Guest age group: ADULT, TEEN, CHILD, INFANT';


--
-- TOC entry 3941 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN event_attendee_guest.relationship; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_attendee_guest.relationship IS 'Relationship to primary attendee';


--
-- TOC entry 247 (class 1259 OID 83088)
-- Name: event_calendar_entry; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_calendar_entry (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
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
    created_by_id bigint
);


ALTER TABLE public.event_calendar_entry OWNER TO nextjs_template_boot;

--
-- TOC entry 234 (class 1259 OID 82865)
-- Name: event_details; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_details (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    title character varying(255) NOT NULL,
    caption character varying(500),
    description text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    start_time character varying(100) NOT NULL,
    end_time character varying(100) NOT NULL,
    location character varying(500),
    directions_to_venue text,
    capacity integer,
    admission_type character varying(50),
    is_active boolean DEFAULT true,
    max_guests_per_attendee integer DEFAULT 0,
    allow_guests boolean DEFAULT false,
    require_guest_approval boolean DEFAULT false,
    enable_guest_pricing boolean DEFAULT false,
    registration_deadline timestamp without time zone,
    cancellation_deadline timestamp without time zone,
    minimum_age integer,
    maximum_age integer,
    requires_approval boolean DEFAULT false,
    enable_waitlist boolean DEFAULT true,
    external_registration_url character varying(1024),
    created_by_id bigint,
    event_type_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_registration_required boolean DEFAULT false,
    is_sports_event boolean DEFAULT false,
    is_live boolean DEFAULT false,
    CONSTRAINT check_age_ranges CHECK (((minimum_age IS NULL) OR (maximum_age IS NULL) OR (maximum_age >= minimum_age))),
    CONSTRAINT check_capacity_positive CHECK (((capacity IS NULL) OR (capacity > 0))),
    CONSTRAINT check_deadlines CHECK (((registration_deadline IS NULL) OR (cancellation_deadline IS NULL) OR (cancellation_deadline <= registration_deadline))),
    CONSTRAINT check_event_dates CHECK ((end_date >= start_date)),
    CONSTRAINT event_details_max_guests_per_attendee_check CHECK ((max_guests_per_attendee >= 0))
);


ALTER TABLE public.event_details OWNER TO nextjs_template_boot;

--
-- TOC entry 3944 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE event_details; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.event_details IS 'Enhanced event details with guest management and validation';


--
-- TOC entry 3945 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.max_guests_per_attendee; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_details.max_guests_per_attendee IS 'Maximum number of guests allowed per primary attendee';


--
-- TOC entry 3946 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.allow_guests; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_details.allow_guests IS 'Whether guest registrations are allowed for this event';


--
-- TOC entry 3947 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.require_guest_approval; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_details.require_guest_approval IS 'Whether guest registrations require admin approval';


--
-- TOC entry 3948 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.enable_guest_pricing; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_details.enable_guest_pricing IS 'Whether special pricing applies to guests';


--
-- TOC entry 3949 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_registration_required; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_details.is_registration_required IS 'Whether formal registration is required for this event';


--
-- TOC entry 3950 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_sports_event; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_details.is_sports_event IS 'Whether this event is a sports event';


--
-- TOC entry 3951 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN event_details.is_live; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_details.is_live IS 'Whether this event is currently live and should be featured on the home page';


--
-- TOC entry 253 (class 1259 OID 83390)
-- Name: event_discount_code; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_discount_code (
    event_id bigint NOT NULL,
    discount_code_id bigint NOT NULL
);


ALTER TABLE public.event_discount_code OWNER TO nextjs_template_boot;

--
-- TOC entry 3953 (class 0 OID 0)
-- Dependencies: 253
-- Name: TABLE event_discount_code; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.event_discount_code IS 'Links discount codes to events';


--
-- TOC entry 251 (class 1259 OID 83147)
-- Name: event_guest_pricing; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_guest_pricing (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
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
    CONSTRAINT event_guest_pricing_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.event_guest_pricing OWNER TO nextjs_template_boot;

--
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE event_guest_pricing; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.event_guest_pricing IS 'Flexible pricing structure for event guests with JDL validation';


--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.price; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_guest_pricing.price IS 'Guest price (required, minimum 0)';


--
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.is_active; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_guest_pricing.is_active IS 'Whether this pricing is currently active';


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.valid_from; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_guest_pricing.valid_from IS 'Start date for pricing validity';


--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.valid_to; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_guest_pricing.valid_to IS 'End date for pricing validity';


--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN event_guest_pricing.description; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_guest_pricing.description IS 'Pricing description (max 255 chars)';


--
-- TOC entry 220 (class 1259 OID 77428)
-- Name: event_live_update; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_live_update (
    id bigint NOT NULL,
    event_id bigint NOT NULL,
    update_type character varying(20) NOT NULL,
    content_text text,
    content_image_url character varying(1024),
    content_video_url character varying(1024),
    content_link_url character varying(1024),
    metadata jsonb,
    display_order integer DEFAULT 0,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.event_live_update OWNER TO giventa_event_management;

--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 220
-- Name: TABLE event_live_update; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_live_update IS 'Live updates (text, image, video, etc.) for events';


--
-- TOC entry 222 (class 1259 OID 77446)
-- Name: event_live_update_attachment; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_live_update_attachment (
    id bigint NOT NULL,
    live_update_id bigint NOT NULL,
    attachment_type character varying(20),
    attachment_url character varying(1024),
    display_order integer DEFAULT 0,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.event_live_update_attachment OWNER TO giventa_event_management;

--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE event_live_update_attachment; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_live_update_attachment IS 'Attachments (image, video, etc.) for live event updates';


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


ALTER SEQUENCE public.event_live_update_attachment_id_seq OWNER TO giventa_event_management;

--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 221
-- Name: event_live_update_attachment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: giventa_event_management
--

ALTER SEQUENCE public.event_live_update_attachment_id_seq OWNED BY public.event_live_update_attachment.id;


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


ALTER SEQUENCE public.event_live_update_id_seq OWNER TO giventa_event_management;

--
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 219
-- Name: event_live_update_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: giventa_event_management
--

ALTER SEQUENCE public.event_live_update_id_seq OWNED BY public.event_live_update.id;


--
-- TOC entry 246 (class 1259 OID 83070)
-- Name: event_media; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_media (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    title character varying(255) NOT NULL,
    description text,
    event_media_type character varying(255) NOT NULL,
    storage_type character varying(255) NOT NULL,
    file_url character varying(2048),
    file_data oid,
    file_data_content_type character varying(255),
    content_type character varying(255),
    file_size bigint,
    is_public boolean DEFAULT true,
    event_flyer boolean DEFAULT false,
    is_event_management_official_document boolean DEFAULT false,
    pre_signed_url character varying(2048),
    pre_signed_url_expires_at timestamp without time zone,
    alt_text character varying(500),
    display_order integer DEFAULT 0,
    download_count integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    event_id bigint,
    uploaded_by_id bigint,
    CONSTRAINT check_download_count_non_negative CHECK ((download_count >= 0)),
    CONSTRAINT check_file_size_positive CHECK (((file_size IS NULL) OR (file_size >= 0)))
);


ALTER TABLE public.event_media OWNER TO nextjs_template_boot;

--
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN event_media.pre_signed_url; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_media.pre_signed_url IS 'Pre-signed URL for temporary access (max length 2048 chars)';


--
-- TOC entry 239 (class 1259 OID 82951)
-- Name: event_organizer; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_organizer (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
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
    CONSTRAINT check_contact_email_format CHECK (((contact_email IS NULL) OR ((contact_email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)))
);


ALTER TABLE public.event_organizer OWNER TO nextjs_template_boot;

--
-- TOC entry 243 (class 1259 OID 83028)
-- Name: event_poll; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_poll (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
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
    CONSTRAINT check_poll_dates CHECK (((end_date IS NULL) OR (end_date >= start_date)))
);


ALTER TABLE public.event_poll OWNER TO nextjs_template_boot;

--
-- TOC entry 244 (class 1259 OID 83045)
-- Name: event_poll_option; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_poll_option (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    option_text character varying(500) NOT NULL,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    poll_id bigint
);


ALTER TABLE public.event_poll_option OWNER TO nextjs_template_boot;

--
-- TOC entry 245 (class 1259 OID 83057)
-- Name: event_poll_response; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_poll_response (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    comment text,
    response_value character varying(1000),
    is_anonymous boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    poll_id bigint,
    poll_option_id bigint,
    user_id bigint
);


ALTER TABLE public.event_poll_response OWNER TO nextjs_template_boot;

--
-- TOC entry 216 (class 1259 OID 77393)
-- Name: event_score_card; Type: TABLE; Schema: public; Owner: giventa_event_management
--

CREATE TABLE public.event_score_card (
    id bigint NOT NULL,
    event_id bigint NOT NULL,
    team_a_name character varying(255) NOT NULL,
    team_b_name character varying(255) NOT NULL,
    team_a_score integer DEFAULT 0 NOT NULL,
    team_b_score integer DEFAULT 0 NOT NULL,
    remarks text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.event_score_card OWNER TO giventa_event_management;

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
    id bigint NOT NULL,
    score_card_id bigint NOT NULL,
    team_name character varying(255) NOT NULL,
    player_name character varying(255),
    points integer DEFAULT 0 NOT NULL,
    remarks text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.event_score_card_detail OWNER TO giventa_event_management;

--
-- TOC entry 3973 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE event_score_card_detail; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.event_score_card_detail IS 'Detailed breakdown for event score cards (per player or per team)';


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


ALTER SEQUENCE public.event_score_card_detail_id_seq OWNER TO giventa_event_management;

--
-- TOC entry 3974 (class 0 OID 0)
-- Dependencies: 217
-- Name: event_score_card_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: giventa_event_management
--

ALTER SEQUENCE public.event_score_card_detail_id_seq OWNED BY public.event_score_card_detail.id;


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


ALTER SEQUENCE public.event_score_card_id_seq OWNER TO giventa_event_management;

--
-- TOC entry 3975 (class 0 OID 0)
-- Dependencies: 215
-- Name: event_score_card_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: giventa_event_management
--

ALTER SEQUENCE public.event_score_card_id_seq OWNED BY public.event_score_card.id;


--
-- TOC entry 241 (class 1259 OID 82986)
-- Name: event_ticket_transaction; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_ticket_transaction (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    transaction_reference character varying(255),
    email character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    phone character varying(255),
    quantity integer NOT NULL,
    price_per_unit numeric(21,2) NOT NULL,
    total_amount numeric(21,2) NOT NULL,
    tax_amount numeric(21,2) DEFAULT 0,
    fee_amount numeric(21,2) DEFAULT 0,
    discount_code_id bigint,
    discount_amount numeric(21,2) DEFAULT 0,
    final_amount numeric(21,2) NOT NULL,
    status character varying(255) DEFAULT 'PENDING'::character varying NOT NULL,
    payment_method character varying(100),
    payment_reference character varying(255),
    purchase_date timestamp without time zone NOT NULL,
    confirmation_sent_at timestamp without time zone,
    refund_amount numeric(21,2) DEFAULT 0,
    refund_date timestamp without time zone,
    refund_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    event_id bigint,
    ticket_type_id bigint,
    user_id bigint,
    CONSTRAINT check_email_format_transaction CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT check_transaction_amounts CHECK (((total_amount >= (0)::numeric) AND (tax_amount >= (0)::numeric) AND (fee_amount >= (0)::numeric) AND (discount_amount >= (0)::numeric) AND (refund_amount >= (0)::numeric) AND (final_amount >= (0)::numeric) AND (quantity > 0)))
);


ALTER TABLE public.event_ticket_transaction OWNER TO nextjs_template_boot;

--
-- TOC entry 3976 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN event_ticket_transaction.discount_code_id; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_ticket_transaction.discount_code_id IS 'Discount code used for this ticket purchase';


--
-- TOC entry 3977 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN event_ticket_transaction.discount_amount; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_ticket_transaction.discount_amount IS 'Discount amount applied to this ticket purchase';


--
-- TOC entry 240 (class 1259 OID 82964)
-- Name: event_ticket_type; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_ticket_type (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    name character varying(255) NOT NULL,
    description text,
    price numeric(21,2) NOT NULL,
    code character varying(255) NOT NULL,
    available_quantity integer,
    sold_quantity integer DEFAULT 0,
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
    CONSTRAINT check_sold_vs_available CHECK (((available_quantity IS NULL) OR (sold_quantity <= available_quantity)))
);


ALTER TABLE public.event_ticket_type OWNER TO nextjs_template_boot;

--
-- TOC entry 3979 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN event_ticket_type.sold_quantity; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON COLUMN public.event_ticket_type.sold_quantity IS 'Number of tickets sold (auto-updated by triggers)';


--
-- TOC entry 232 (class 1259 OID 82832)
-- Name: event_type_details; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.event_type_details (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    name character varying(255) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    icon character varying(100),
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_color_format CHECK (((color)::text ~* '^#[0-9A-Fa-f]{6}$'::text))
);


ALTER TABLE public.event_type_details OWNER TO nextjs_template_boot;

--
-- TOC entry 3981 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE event_type_details; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.event_type_details IS 'Event type classifications with visual customization';


--
-- TOC entry 252 (class 1259 OID 83166)
-- Name: qr_code_usage; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.qr_code_usage (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
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
    CONSTRAINT check_usage_counts CHECK (((usage_count >= 0) AND (max_usage_count > 0) AND (usage_count <= max_usage_count)))
);


ALTER TABLE public.qr_code_usage OWNER TO nextjs_template_boot;

--
-- TOC entry 3983 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE qr_code_usage; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
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


ALTER TABLE public.rel_event_details__discount_codes OWNER TO giventa_event_management;

--
-- TOC entry 3985 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE rel_event_details__discount_codes; Type: COMMENT; Schema: public; Owner: giventa_event_management
--

COMMENT ON TABLE public.rel_event_details__discount_codes IS 'Join table for EventDetails <-> DiscountCode many-to-many relationship';


--
-- TOC entry 229 (class 1259 OID 82779)
-- Name: tenant_organization; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.tenant_organization (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
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
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_monthly_fee_positive CHECK ((monthly_fee_usd >= (0)::numeric)),
    CONSTRAINT check_subscription_dates CHECK (((subscription_end_date IS NULL) OR (subscription_end_date >= subscription_start_date)))
);


ALTER TABLE public.tenant_organization OWNER TO nextjs_template_boot;

--
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE tenant_organization; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.tenant_organization IS 'Multi-tenant organization configuration and subscription management';


--
-- TOC entry 231 (class 1259 OID 82809)
-- Name: tenant_settings; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.tenant_settings (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    allow_user_registration boolean DEFAULT true,
    require_admin_approval boolean DEFAULT false,
    enable_whatsapp_integration boolean DEFAULT false,
    enable_email_marketing boolean DEFAULT false,
    whatsapp_api_key character varying(500),
    email_provider_config text,
    custom_css text,
    custom_js text,
    max_events_per_month integer,
    max_attendees_per_event integer,
    enable_guest_registration boolean DEFAULT true,
    max_guests_per_attendee integer DEFAULT 5,
    default_event_capacity integer DEFAULT 100,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_default_capacity_positive CHECK (((default_event_capacity IS NULL) OR (default_event_capacity > 0))),
    CONSTRAINT check_max_attendees_positive CHECK (((max_attendees_per_event IS NULL) OR (max_attendees_per_event > 0))),
    CONSTRAINT check_max_events_positive CHECK (((max_events_per_month IS NULL) OR (max_events_per_month > 0))),
    CONSTRAINT check_max_guests_positive CHECK (((max_guests_per_attendee IS NULL) OR (max_guests_per_attendee >= 0)))
);


ALTER TABLE public.tenant_settings OWNER TO nextjs_template_boot;

--
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE tenant_settings; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.tenant_settings IS 'Tenant-specific configuration settings with enhanced options';


--
-- TOC entry 242 (class 1259 OID 83010)
-- Name: user_payment_transaction; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.user_payment_transaction (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
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
    metadata jsonb,
    external_transaction_id character varying(255),
    payment_method character varying(100),
    failure_reason text,
    reconciliation_date date,
    event_id bigint,
    ticket_transaction_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_payment_amounts CHECK (((amount >= (0)::numeric) AND (platform_fee_amount >= (0)::numeric) AND (tenant_amount >= (0)::numeric) AND (processing_fee >= (0)::numeric)))
);


ALTER TABLE public.user_payment_transaction OWNER TO nextjs_template_boot;

--
-- TOC entry 230 (class 1259 OID 82796)
-- Name: user_profile; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.user_profile (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
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
    user_status character varying(50),
    user_role character varying(50),
    reviewed_by_admin_at timestamp without time zone,
    reviewed_by_admin_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_email_format CHECK (((email IS NULL) OR ((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)))
);


ALTER TABLE public.user_profile OWNER TO nextjs_template_boot;

--
-- TOC entry 3991 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE user_profile; Type: COMMENT; Schema: public; Owner: nextjs_template_boot
--

COMMENT ON TABLE public.user_profile IS 'User profiles with tenant isolation and enhanced fields';


--
-- TOC entry 237 (class 1259 OID 82919)
-- Name: user_registration_request; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.user_registration_request (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    request_id character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    email character varying(255) NOT NULL,
    phone character varying(255),
    address_line_1 character varying(255),
    address_line_2 character varying(255),
    city character varying(255),
    state character varying(255),
    zip_code character varying(255),
    country character varying(255),
    family_name character varying(255),
    city_town character varying(255),
    district character varying(255),
    educational_institution character varying(255),
    profile_image_url character varying(1024),
    request_reason text,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    admin_comments text,
    automatic_approval_eligible boolean DEFAULT false,
    priority_score integer DEFAULT 0,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp without time zone,
    approved_at timestamp without time zone,
    rejected_at timestamp without time zone,
    reviewed_by_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_email_format_request CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text))
);


ALTER TABLE public.user_registration_request OWNER TO nextjs_template_boot;

--
-- TOC entry 233 (class 1259 OID 82848)
-- Name: user_subscription; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.user_subscription (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_subscription OWNER TO nextjs_template_boot;

--
-- TOC entry 236 (class 1259 OID 82903)
-- Name: user_task; Type: TABLE; Schema: public; Owner: nextjs_template_boot
--

CREATE TABLE public.user_task (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    title character varying(255) NOT NULL,
    description text,
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
    CONSTRAINT user_task_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100)))
);


ALTER TABLE public.user_task OWNER TO nextjs_template_boot;

--
-- TOC entry 3363 (class 2604 OID 82769)
-- Name: discount_code id; Type: DEFAULT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.discount_code ALTER COLUMN id SET DEFAULT nextval('public.discount_code_id_seq'::regclass);


--
-- TOC entry 3354 (class 2604 OID 77431)
-- Name: event_live_update id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_live_update ALTER COLUMN id SET DEFAULT nextval('public.event_live_update_id_seq'::regclass);


--
-- TOC entry 3359 (class 2604 OID 77449)
-- Name: event_live_update_attachment id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_live_update_attachment ALTER COLUMN id SET DEFAULT nextval('public.event_live_update_attachment_id_seq'::regclass);


--
-- TOC entry 3345 (class 2604 OID 77396)
-- Name: event_score_card id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_score_card ALTER COLUMN id SET DEFAULT nextval('public.event_score_card_id_seq'::regclass);


--
-- TOC entry 3350 (class 2604 OID 77414)
-- Name: event_score_card_detail id; Type: DEFAULT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_score_card_detail ALTER COLUMN id SET DEFAULT nextval('public.event_score_card_detail_id_seq'::regclass);


--
-- TOC entry 3900 (class 0 OID 82938)
-- Dependencies: 238
-- Data for Name: bulk_operation_log; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3887 (class 0 OID 82755)
-- Dependencies: 225
-- Data for Name: databasechangelog; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3888 (class 0 OID 82760)
-- Dependencies: 226
-- Data for Name: databasechangeloglock; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3890 (class 0 OID 82766)
-- Dependencies: 228
-- Data for Name: discount_code; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3897 (class 0 OID 82890)
-- Dependencies: 235
-- Data for Name: event_admin; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3911 (class 0 OID 83122)
-- Dependencies: 249
-- Data for Name: event_admin_audit_log; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3910 (class 0 OID 83101)
-- Dependencies: 248
-- Data for Name: event_attendee; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--

INSERT INTO public.event_attendee VALUES (3500, 'tenant_demo_001', 2800, 2600, 'CONFIRMED', '2025-05-29 20:16:39.697806', NULL, NULL, NULL, 'MEMBER', NULL, NULL, NULL, NULL, NULL, NULL, 'NOT_CHECKED_IN', NULL, NULL, NULL, NULL, NULL, 'ATTENDEE:3500|EVENT:2800|TENANT:tenant_demo_001|NAME:John Smith|EVENT_TITLE:Annual Tech Conference 2025|TIMESTAMP:1749428199.697806|TYPE:MEMBER', true, '2025-06-08 20:16:39.697806', 'DIRECT', NULL, 0, '2025-06-08 20:16:39.697806', '2025-06-08 20:16:39.697806');
INSERT INTO public.event_attendee VALUES (3550, 'tenant_demo_001', 2800, 2650, 'CONFIRMED', '2025-05-31 20:16:39.697806', NULL, NULL, NULL, 'MEMBER', NULL, NULL, NULL, NULL, NULL, NULL, 'NOT_CHECKED_IN', NULL, NULL, NULL, NULL, NULL, 'ATTENDEE:3550|EVENT:2800|TENANT:tenant_demo_001|NAME:Jane Doe|EVENT_TITLE:Annual Tech Conference 2025|TIMESTAMP:1749428199.697806|TYPE:MEMBER', true, '2025-06-08 20:16:39.697806', 'DIRECT', NULL, 0, '2025-06-08 20:16:39.697806', '2025-06-08 20:16:39.697806');
INSERT INTO public.event_attendee VALUES (3600, 'tenant_demo_001', 2850, 2650, 'CONFIRMED', '2025-06-03 20:16:39.697806', NULL, NULL, NULL, 'MEMBER', NULL, NULL, NULL, NULL, NULL, NULL, 'NOT_CHECKED_IN', NULL, NULL, NULL, NULL, NULL, 'ATTENDEE:3600|EVENT:2850|TENANT:tenant_demo_001|NAME:Jane Doe|EVENT_TITLE:React Workshop for Beginners|TIMESTAMP:1749428199.697806|TYPE:MEMBER', true, '2025-06-08 20:16:39.697806', 'DIRECT', NULL, 0, '2025-06-08 20:16:39.697806', '2025-06-08 20:16:39.697806');
INSERT INTO public.event_attendee VALUES (3650, 'tenant_demo_002', 2900, 2700, 'CONFIRMED', '2025-06-05 20:16:39.697806', NULL, NULL, NULL, 'ORGANIZER', NULL, NULL, NULL, NULL, NULL, NULL, 'NOT_CHECKED_IN', NULL, NULL, NULL, NULL, NULL, 'ATTENDEE:3650|EVENT:2900|TENANT:tenant_demo_002|NAME:Bob Johnson|EVENT_TITLE:Family Fun Day|TIMESTAMP:1749428199.697806|TYPE:ORGANIZER', true, '2025-06-08 20:16:39.697806', 'DIRECT', NULL, 0, '2025-06-08 20:16:39.697806', '2025-06-08 20:16:39.697806');


--
-- TOC entry 3912 (class 0 OID 83131)
-- Dependencies: 250
-- Data for Name: event_attendee_guest; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--

INSERT INTO public.event_attendee_guest VALUES (3700, 'tenant_demo_001', 3500, 'Sarah Smith', 'ADULT', 'SPOUSE', NULL, NULL, NULL, 'CONFIRMED', 'NOT_CHECKED_IN', NULL, NULL, 'PENDING', NULL, NULL, NULL, NULL, 0.00, 'PENDING', NULL, '2025-06-08 20:16:39.763069', '2025-06-08 20:16:39.763069');
INSERT INTO public.event_attendee_guest VALUES (3750, 'tenant_demo_001', 3500, 'Tommy Smith', 'CHILD', 'CHILD', NULL, NULL, NULL, 'CONFIRMED', 'NOT_CHECKED_IN', NULL, NULL, 'PENDING', NULL, NULL, NULL, NULL, 0.00, 'PENDING', NULL, '2025-06-08 20:16:39.763069', '2025-06-08 20:16:39.763069');
INSERT INTO public.event_attendee_guest VALUES (3800, 'tenant_demo_002', 3650, 'Emma Johnson', 'TEEN', 'CHILD', NULL, NULL, NULL, 'PENDING', 'NOT_CHECKED_IN', NULL, NULL, 'PENDING', NULL, NULL, NULL, NULL, 0.00, 'PENDING', NULL, '2025-06-08 20:16:39.763069', '2025-06-08 20:16:39.763069');
INSERT INTO public.event_attendee_guest VALUES (3850, 'tenant_demo_002', 3650, 'Lisa Johnson', 'ADULT', 'SPOUSE', NULL, NULL, NULL, 'CONFIRMED', 'NOT_CHECKED_IN', NULL, NULL, 'PENDING', NULL, NULL, NULL, NULL, 0.00, 'PENDING', NULL, '2025-06-08 20:16:39.763069', '2025-06-08 20:16:39.763069');


--
-- TOC entry 3909 (class 0 OID 83088)
-- Dependencies: 247
-- Data for Name: event_calendar_entry; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3896 (class 0 OID 82865)
-- Dependencies: 234
-- Data for Name: event_details; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--

INSERT INTO public.event_details VALUES (2800, 'tenant_demo_001', 'Annual Tech Conference 2025', 'Join us for the biggest tech event of the year', 'A comprehensive conference featuring the latest in technology trends, networking opportunities, and expert speakers from around the globe.', '2025-07-15', '2025-07-17', '09:00', '17:00', 'Convention Center, Downtown', NULL, 500, 'TICKETED', true, 2, true, false, true, NULL, NULL, NULL, NULL, false, true, NULL, 2600, 2400, '2025-06-08 20:16:39.532111', '2025-06-08 20:16:39.532111', false, false, false);
INSERT INTO public.event_details VALUES (2900, 'tenant_demo_002', 'Family Fun Day', 'Community event for all ages', 'A family-friendly event with activities for all age groups, food, games, and entertainment.', '2025-08-10', '2025-08-10', '10:00', '18:00', 'Community Park', NULL, 200, 'FREE', true, 4, true, true, true, NULL, NULL, NULL, NULL, false, true, NULL, 2700, 2450, '2025-06-08 20:16:39.532111', '2025-06-08 20:16:39.532111', false, false, false);
INSERT INTO public.event_details VALUES (2850, 'tenant_demo_001', 'React Workshop for Beginners', 'Learn React from scratch in this hands-on workshop', 'A beginner-friendly workshop covering React fundamentals, component creation, state management, and building your first React application.', '2025-06-20', '2025-06-20', '10:00', '16:00', 'Tech Hub Building A', NULL, 30, 'FREE', true, 0, false, false, false, NULL, NULL, NULL, NULL, false, true, NULL, 2600, 2350, '2025-06-08 20:16:39.532111', '2025-06-08 20:46:43.612386', true, false, false);
INSERT INTO public.event_details VALUES (3951, 'tenant_demo_001', 'xxxcxc', 'cxcx', 'cxcxcxc', '2025-06-22', '2025-06-22', '10:15 AM', '11:15 AM', 'xcxcx', 'xcxcxc', 2, 'free', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, true, NULL, NULL, 2350, '2025-06-09 01:16:21.63', '2025-06-08 21:17:06.742427', true, NULL, NULL);
INSERT INTO public.event_details VALUES (3952, 'tenant_demo_001', 'xcxcx', 'xcxcxc', 'xcxcxxc', '2025-06-22', '2025-06-22', '10:15 AM', '11:15 AM', 'cxcx', 'xcxxc', NULL, 'free', true, NULL, NULL, true, NULL, NULL, NULL, NULL, NULL, false, true, NULL, NULL, 2350, '2025-06-09 01:20:26.525', '2025-06-08 22:04:48.609372', NULL, NULL, NULL);


--
-- TOC entry 3915 (class 0 OID 83390)
-- Dependencies: 253
-- Data for Name: event_discount_code; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3913 (class 0 OID 83147)
-- Dependencies: 251
-- Data for Name: event_guest_pricing; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--

INSERT INTO public.event_guest_pricing VALUES (3100, 'tenant_demo_001', 2800, 'ADULT', 150.00, true, '2025-06-01', '2025-07-14', 'Adult guest pricing for conference', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');
INSERT INTO public.event_guest_pricing VALUES (3150, 'tenant_demo_001', 2800, 'TEEN', 75.00, true, '2025-06-01', '2025-07-14', 'Teen guest pricing (13-17 years)', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');
INSERT INTO public.event_guest_pricing VALUES (3200, 'tenant_demo_001', 2800, 'CHILD', 25.00, true, '2025-06-01', '2025-07-14', 'Child guest pricing (5-12 years)', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');
INSERT INTO public.event_guest_pricing VALUES (3250, 'tenant_demo_001', 2800, 'INFANT', 0.00, true, '2025-06-01', '2025-07-14', 'Free admission for infants (under 5)', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');
INSERT INTO public.event_guest_pricing VALUES (3300, 'tenant_demo_002', 2900, 'ADULT', 0.00, true, NULL, NULL, 'Free adult admission to family event', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');
INSERT INTO public.event_guest_pricing VALUES (3350, 'tenant_demo_002', 2900, 'TEEN', 0.00, true, NULL, NULL, 'Free teen admission to family event', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');
INSERT INTO public.event_guest_pricing VALUES (3400, 'tenant_demo_002', 2900, 'CHILD', 0.00, true, NULL, NULL, 'Free child admission to family event', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');
INSERT INTO public.event_guest_pricing VALUES (3450, 'tenant_demo_002', 2900, 'INFANT', 0.00, true, NULL, NULL, 'Free infant admission to family event', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-08 20:16:39.631864', '2025-06-08 20:16:39.631864');


--
-- TOC entry 3882 (class 0 OID 77428)
-- Dependencies: 220
-- Data for Name: event_live_update; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3884 (class 0 OID 77446)
-- Dependencies: 222
-- Data for Name: event_live_update_attachment; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3908 (class 0 OID 83070)
-- Dependencies: 246
-- Data for Name: event_media; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3901 (class 0 OID 82951)
-- Dependencies: 239
-- Data for Name: event_organizer; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3905 (class 0 OID 83028)
-- Dependencies: 243
-- Data for Name: event_poll; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3906 (class 0 OID 83045)
-- Dependencies: 244
-- Data for Name: event_poll_option; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3907 (class 0 OID 83057)
-- Dependencies: 245
-- Data for Name: event_poll_response; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3878 (class 0 OID 77393)
-- Dependencies: 216
-- Data for Name: event_score_card; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3880 (class 0 OID 77411)
-- Dependencies: 218
-- Data for Name: event_score_card_detail; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3903 (class 0 OID 82986)
-- Dependencies: 241
-- Data for Name: event_ticket_transaction; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3902 (class 0 OID 82964)
-- Dependencies: 240
-- Data for Name: event_ticket_type; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--

INSERT INTO public.event_ticket_type VALUES (2950, 'tenant_demo_001', 'Early Bird', 'Early bird discount ticket', 199.00, 'EARLYBIRD2025', 100, 15, true, NULL, NULL, 1, 10, false, 0, '2025-06-08 20:16:39.583923', '2025-06-08 20:16:39.583923', 2800);
INSERT INTO public.event_ticket_type VALUES (3000, 'tenant_demo_001', 'Regular', 'Standard conference ticket', 299.00, 'REGULAR2025', 300, 45, true, NULL, NULL, 1, 10, false, 0, '2025-06-08 20:16:39.583923', '2025-06-08 20:16:39.583923', 2800);
INSERT INTO public.event_ticket_type VALUES (3050, 'tenant_demo_001', 'VIP', 'VIP access with exclusive benefits', 499.00, 'VIP2025', 50, 8, true, NULL, NULL, 1, 10, false, 0, '2025-06-08 20:16:39.583923', '2025-06-08 20:16:39.583923', 2800);


--
-- TOC entry 3894 (class 0 OID 82832)
-- Dependencies: 232
-- Data for Name: event_type_details; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--

INSERT INTO public.event_type_details VALUES (2350, 'tenant_demo_001', 'Workshop', 'Educational workshops and training sessions', '#10B981', NULL, true, 1, '2025-06-08 20:16:39.454859', '2025-06-08 20:16:39.454859');
INSERT INTO public.event_type_details VALUES (2400, 'tenant_demo_001', 'Conference', 'Professional conferences and seminars', '#3B82F6', NULL, true, 2, '2025-06-08 20:16:39.454859', '2025-06-08 20:16:39.454859');
INSERT INTO public.event_type_details VALUES (2450, 'tenant_demo_001', 'Social Event', 'Community gatherings and social activities', '#F59E0B', NULL, true, 3, '2025-06-08 20:16:39.454859', '2025-06-08 20:16:39.454859');
INSERT INTO public.event_type_details VALUES (2500, 'tenant_demo_002', 'Meeting', 'Regular team and organizational meetings', '#6366F1', NULL, true, 1, '2025-06-08 20:16:39.454859', '2025-06-08 20:16:39.454859');
INSERT INTO public.event_type_details VALUES (2550, 'tenant_demo_002', 'Training', 'Skills development and training programs', '#EF4444', NULL, true, 2, '2025-06-08 20:16:39.454859', '2025-06-08 20:16:39.454859');


--
-- TOC entry 3914 (class 0 OID 83166)
-- Dependencies: 252
-- Data for Name: qr_code_usage; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3885 (class 0 OID 78121)
-- Dependencies: 223
-- Data for Name: rel_event_details__discount_codes; Type: TABLE DATA; Schema: public; Owner: giventa_event_management
--



--
-- TOC entry 3891 (class 0 OID 82779)
-- Dependencies: 229
-- Data for Name: tenant_organization; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--

INSERT INTO public.tenant_organization VALUES (1950, 'tenant_demo_001', 'Demo Organization 1', NULL, NULL, NULL, NULL, 'demo1@example.com', NULL, 'FREE', 'ACTIVE', NULL, NULL, NULL, NULL, true, '2025-06-08 20:16:39.374375', '2025-06-08 20:16:39.374375');
INSERT INTO public.tenant_organization VALUES (2000, 'tenant_demo_002', 'Demo Organization 2', NULL, NULL, NULL, NULL, 'demo2@example.com', NULL, 'BASIC', 'ACTIVE', NULL, NULL, NULL, NULL, true, '2025-06-08 20:16:39.374375', '2025-06-08 20:16:39.374375');
INSERT INTO public.tenant_organization VALUES (2050, 'tenant_demo_003', 'Premium Corp', NULL, NULL, NULL, NULL, 'premium@example.com', NULL, 'PREMIUM', 'ACTIVE', NULL, NULL, NULL, NULL, true, '2025-06-08 20:16:39.374375', '2025-06-08 20:16:39.374375');
INSERT INTO public.tenant_organization VALUES (2100, 'tenant_demo_004', 'Enterprise Solutions', NULL, NULL, NULL, NULL, 'enterprise@example.com', NULL, 'ENTERPRISE', 'ACTIVE', NULL, NULL, NULL, NULL, true, '2025-06-08 20:16:39.374375', '2025-06-08 20:16:39.374375');


--
-- TOC entry 3893 (class 0 OID 82809)
-- Dependencies: 231
-- Data for Name: tenant_settings; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--

INSERT INTO public.tenant_settings VALUES (2150, 'tenant_demo_001', true, false, false, false, NULL, NULL, NULL, NULL, NULL, NULL, true, 5, 100, '2025-06-08 20:16:39.418496', '2025-06-08 20:16:39.418496');
INSERT INTO public.tenant_settings VALUES (2200, 'tenant_demo_002', true, true, false, false, NULL, NULL, NULL, NULL, NULL, NULL, true, 5, 100, '2025-06-08 20:16:39.418496', '2025-06-08 20:16:39.418496');
INSERT INTO public.tenant_settings VALUES (2250, 'tenant_demo_003', true, false, true, true, NULL, NULL, NULL, NULL, NULL, NULL, true, 5, 100, '2025-06-08 20:16:39.418496', '2025-06-08 20:16:39.418496');
INSERT INTO public.tenant_settings VALUES (2300, 'tenant_demo_004', true, true, true, true, NULL, NULL, NULL, NULL, NULL, NULL, true, 5, 100, '2025-06-08 20:16:39.418496', '2025-06-08 20:16:39.418496');


--
-- TOC entry 3904 (class 0 OID 83010)
-- Dependencies: 242
-- Data for Name: user_payment_transaction; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3892 (class 0 OID 82796)
-- Dependencies: 230
-- Data for Name: user_profile; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--

INSERT INTO public.user_profile VALUES (2600, 'tenant_demo_001', 'user_001', 'John', 'Smith', 'john.smith@example.com', '+1-555-0101', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ACTIVE', 'ADMIN', NULL, NULL, '2025-06-08 20:16:39.497138', '2025-06-08 20:16:39.497138');
INSERT INTO public.user_profile VALUES (2650, 'tenant_demo_001', 'user_002', 'Jane', 'Doe', 'jane.doe@example.com', '+1-555-0102', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ACTIVE', 'MEMBER', NULL, NULL, '2025-06-08 20:16:39.497138', '2025-06-08 20:16:39.497138');
INSERT INTO public.user_profile VALUES (2700, 'tenant_demo_002', 'user_003', 'Bob', 'Johnson', 'bob.johnson@example.com', '+1-555-0103', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ACTIVE', 'ORGANIZER', NULL, NULL, '2025-06-08 20:16:39.497138', '2025-06-08 20:16:39.497138');
INSERT INTO public.user_profile VALUES (2750, 'tenant_demo_002', 'user_004', 'Alice', 'Williams', 'alice.williams@example.com', '+1-555-0104', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PENDING_APPROVAL', 'MEMBER', NULL, NULL, '2025-06-08 20:16:39.497138', '2025-06-08 20:16:39.497138');
INSERT INTO public.user_profile VALUES (3901, 'tenant_demo_001', 'user_2vVLxhPnsIPGYf6qpfozk383Slr', 'Gain', 'Joseph', 'giventauser@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydlZMeGVDUnFWTnpkTDBLUXMySXNWekFBVG8ifQ', 'PENDING_APPROVAL', 'MEMBER', NULL, NULL, '2025-06-09 00:36:14.99', '2025-06-09 00:36:14.99');


--
-- TOC entry 3899 (class 0 OID 82919)
-- Dependencies: 237
-- Data for Name: user_registration_request; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3895 (class 0 OID 82848)
-- Dependencies: 233
-- Data for Name: user_subscription; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3898 (class 0 OID 82903)
-- Dependencies: 236
-- Data for Name: user_task; Type: TABLE DATA; Schema: public; Owner: nextjs_template_boot
--



--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 227
-- Name: discount_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nextjs_template_boot
--

SELECT pg_catalog.setval('public.discount_code_id_seq', 1, false);


--
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 221
-- Name: event_live_update_attachment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

SELECT pg_catalog.setval('public.event_live_update_attachment_id_seq', 1, false);


--
-- TOC entry 3998 (class 0 OID 0)
-- Dependencies: 219
-- Name: event_live_update_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

SELECT pg_catalog.setval('public.event_live_update_id_seq', 1, false);


--
-- TOC entry 3999 (class 0 OID 0)
-- Dependencies: 217
-- Name: event_score_card_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

SELECT pg_catalog.setval('public.event_score_card_detail_id_seq', 1, false);


--
-- TOC entry 4000 (class 0 OID 0)
-- Dependencies: 215
-- Name: event_score_card_id_seq; Type: SEQUENCE SET; Schema: public; Owner: giventa_event_management
--

SELECT pg_catalog.setval('public.event_score_card_id_seq', 1, false);


--
-- TOC entry 4001 (class 0 OID 0)
-- Dependencies: 224
-- Name: sequence_generator; Type: SEQUENCE SET; Schema: public; Owner: nextjs_template_boot
--

SELECT pg_catalog.setval('public.sequence_generator', 4000, true);


--
-- TOC entry 3623 (class 2606 OID 82950)
-- Name: bulk_operation_log bulk_operation_log_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.bulk_operation_log
    ADD CONSTRAINT bulk_operation_log_pkey PRIMARY KEY (id);


--
-- TOC entry 3573 (class 2606 OID 82764)
-- Name: databasechangeloglock databasechangeloglock_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.databasechangeloglock
    ADD CONSTRAINT databasechangeloglock_pkey PRIMARY KEY (id);


--
-- TOC entry 3575 (class 2606 OID 82778)
-- Name: discount_code discount_code_code_key; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.discount_code
    ADD CONSTRAINT discount_code_code_key UNIQUE (code);


--
-- TOC entry 3577 (class 2606 OID 82776)
-- Name: discount_code discount_code_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.discount_code
    ADD CONSTRAINT discount_code_pkey PRIMARY KEY (id);


--
-- TOC entry 3664 (class 2606 OID 83130)
-- Name: event_admin_audit_log event_admin_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_admin_audit_log
    ADD CONSTRAINT event_admin_audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 3611 (class 2606 OID 82900)
-- Name: event_admin event_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_admin
    ADD CONSTRAINT event_admin_pkey PRIMARY KEY (id);


--
-- TOC entry 3666 (class 2606 OID 83146)
-- Name: event_attendee_guest event_attendee_guest_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_attendee_guest
    ADD CONSTRAINT event_attendee_guest_pkey PRIMARY KEY (id);


--
-- TOC entry 3657 (class 2606 OID 83119)
-- Name: event_attendee event_attendee_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_attendee
    ADD CONSTRAINT event_attendee_pkey PRIMARY KEY (id);


--
-- TOC entry 3653 (class 2606 OID 83098)
-- Name: event_calendar_entry event_calendar_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_calendar_entry
    ADD CONSTRAINT event_calendar_entry_pkey PRIMARY KEY (id);


--
-- TOC entry 3605 (class 2606 OID 82889)
-- Name: event_details event_details_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_details
    ADD CONSTRAINT event_details_pkey PRIMARY KEY (id);


--
-- TOC entry 3680 (class 2606 OID 83394)
-- Name: event_discount_code event_discount_code_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_discount_code
    ADD CONSTRAINT event_discount_code_pkey PRIMARY KEY (event_id, discount_code_id);


--
-- TOC entry 3668 (class 2606 OID 83163)
-- Name: event_guest_pricing event_guest_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_guest_pricing
    ADD CONSTRAINT event_guest_pricing_pkey PRIMARY KEY (id);


--
-- TOC entry 3569 (class 2606 OID 77456)
-- Name: event_live_update_attachment event_live_update_attachment_pkey; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_live_update_attachment
    ADD CONSTRAINT event_live_update_attachment_pkey PRIMARY KEY (id);


--
-- TOC entry 3567 (class 2606 OID 77439)
-- Name: event_live_update event_live_update_pkey; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_live_update
    ADD CONSTRAINT event_live_update_pkey PRIMARY KEY (id);


--
-- TOC entry 3649 (class 2606 OID 83087)
-- Name: event_media event_media_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_media
    ADD CONSTRAINT event_media_pkey PRIMARY KEY (id);


--
-- TOC entry 3625 (class 2606 OID 82963)
-- Name: event_organizer event_organizer_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_organizer
    ADD CONSTRAINT event_organizer_pkey PRIMARY KEY (id);


--
-- TOC entry 3643 (class 2606 OID 83056)
-- Name: event_poll_option event_poll_option_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_poll_option
    ADD CONSTRAINT event_poll_option_pkey PRIMARY KEY (id);


--
-- TOC entry 3641 (class 2606 OID 83044)
-- Name: event_poll event_poll_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_poll
    ADD CONSTRAINT event_poll_pkey PRIMARY KEY (id);


--
-- TOC entry 3645 (class 2606 OID 83067)
-- Name: event_poll_response event_poll_response_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT event_poll_response_pkey PRIMARY KEY (id);


--
-- TOC entry 3565 (class 2606 OID 77421)
-- Name: event_score_card_detail event_score_card_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_score_card_detail
    ADD CONSTRAINT event_score_card_detail_pkey PRIMARY KEY (id);


--
-- TOC entry 3563 (class 2606 OID 77404)
-- Name: event_score_card event_score_card_pkey; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_score_card
    ADD CONSTRAINT event_score_card_pkey PRIMARY KEY (id);


--
-- TOC entry 3633 (class 2606 OID 83002)
-- Name: event_ticket_transaction event_ticket_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_ticket_transaction
    ADD CONSTRAINT event_ticket_transaction_pkey PRIMARY KEY (id);


--
-- TOC entry 3627 (class 2606 OID 82983)
-- Name: event_ticket_type event_ticket_type_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_ticket_type
    ADD CONSTRAINT event_ticket_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3593 (class 2606 OID 82845)
-- Name: event_type_details event_type_details_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_type_details
    ADD CONSTRAINT event_type_details_pkey PRIMARY KEY (id);


--
-- TOC entry 3676 (class 2606 OID 83180)
-- Name: qr_code_usage qr_code_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.qr_code_usage
    ADD CONSTRAINT qr_code_usage_pkey PRIMARY KEY (id);


--
-- TOC entry 3571 (class 2606 OID 78125)
-- Name: rel_event_details__discount_codes rel_event_details__discount_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.rel_event_details__discount_codes
    ADD CONSTRAINT rel_event_details__discount_codes_pkey PRIMARY KEY (event_details_id, discount_codes_id);


--
-- TOC entry 3579 (class 2606 OID 82795)
-- Name: tenant_organization tenant_organization_domain_key; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.tenant_organization
    ADD CONSTRAINT tenant_organization_domain_key UNIQUE (domain);


--
-- TOC entry 3581 (class 2606 OID 82791)
-- Name: tenant_organization tenant_organization_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.tenant_organization
    ADD CONSTRAINT tenant_organization_pkey PRIMARY KEY (id);


--
-- TOC entry 3583 (class 2606 OID 82793)
-- Name: tenant_organization tenant_organization_tenant_id_key; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.tenant_organization
    ADD CONSTRAINT tenant_organization_tenant_id_key UNIQUE (tenant_id);


--
-- TOC entry 3589 (class 2606 OID 82829)
-- Name: tenant_settings tenant_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3591 (class 2606 OID 82831)
-- Name: tenant_settings tenant_settings_tenant_id_key; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT tenant_settings_tenant_id_key UNIQUE (tenant_id);


--
-- TOC entry 3637 (class 2606 OID 83025)
-- Name: user_payment_transaction user_payment_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_payment_transaction
    ADD CONSTRAINT user_payment_transaction_pkey PRIMARY KEY (id);


--
-- TOC entry 3585 (class 2606 OID 82806)
-- Name: user_profile user_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT user_profile_pkey PRIMARY KEY (id);


--
-- TOC entry 3617 (class 2606 OID 82933)
-- Name: user_registration_request user_registration_request_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_registration_request
    ADD CONSTRAINT user_registration_request_pkey PRIMARY KEY (id);


--
-- TOC entry 3619 (class 2606 OID 82935)
-- Name: user_registration_request user_registration_request_request_id_key; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_registration_request
    ADD CONSTRAINT user_registration_request_request_id_key UNIQUE (request_id);


--
-- TOC entry 3597 (class 2606 OID 82858)
-- Name: user_subscription user_subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_subscription
    ADD CONSTRAINT user_subscription_pkey PRIMARY KEY (id);


--
-- TOC entry 3615 (class 2606 OID 82918)
-- Name: user_task user_task_pkey; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_task
    ADD CONSTRAINT user_task_pkey PRIMARY KEY (id);


--
-- TOC entry 3655 (class 2606 OID 83100)
-- Name: event_calendar_entry ux_calendar_entry_provider_external; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_calendar_entry
    ADD CONSTRAINT ux_calendar_entry_provider_external UNIQUE (calendar_provider, external_event_id);


--
-- TOC entry 3613 (class 2606 OID 82902)
-- Name: event_admin ux_event_admin_user_tenant; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_admin
    ADD CONSTRAINT ux_event_admin_user_tenant UNIQUE (user_id, tenant_id);


--
-- TOC entry 3662 (class 2606 OID 83121)
-- Name: event_attendee ux_event_attendee__event_attendee; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_attendee
    ADD CONSTRAINT ux_event_attendee__event_attendee UNIQUE (event_id, attendee_id);


--
-- TOC entry 3674 (class 2606 OID 83165)
-- Name: event_guest_pricing ux_event_guest_pricing_event_age_tier; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_guest_pricing
    ADD CONSTRAINT ux_event_guest_pricing_event_age_tier UNIQUE (event_id, age_group, pricing_tier);


--
-- TOC entry 3631 (class 2606 OID 82985)
-- Name: event_ticket_type ux_event_ticket_type_event_code; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_ticket_type
    ADD CONSTRAINT ux_event_ticket_type_event_code UNIQUE (event_id, code);


--
-- TOC entry 3595 (class 2606 OID 82847)
-- Name: event_type_details ux_event_type_tenant_name; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_type_details
    ADD CONSTRAINT ux_event_type_tenant_name UNIQUE (tenant_id, name);


--
-- TOC entry 3639 (class 2606 OID 83027)
-- Name: user_payment_transaction ux_payment_transaction_stripe_intent; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_payment_transaction
    ADD CONSTRAINT ux_payment_transaction_stripe_intent UNIQUE (stripe_payment_intent_id);


--
-- TOC entry 3647 (class 2606 OID 83069)
-- Name: event_poll_response ux_poll_response_user_option; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT ux_poll_response_user_option UNIQUE (poll_id, poll_option_id, user_id);


--
-- TOC entry 3678 (class 2606 OID 83182)
-- Name: qr_code_usage ux_qr_code_attendee_type; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.qr_code_usage
    ADD CONSTRAINT ux_qr_code_attendee_type UNIQUE (attendee_id, qr_code_type);


--
-- TOC entry 3635 (class 2606 OID 83004)
-- Name: event_ticket_transaction ux_ticket_transaction_reference; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_ticket_transaction
    ADD CONSTRAINT ux_ticket_transaction_reference UNIQUE (transaction_reference);


--
-- TOC entry 3587 (class 2606 OID 82808)
-- Name: user_profile ux_user_profile__user_id; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT ux_user_profile__user_id UNIQUE (user_id);


--
-- TOC entry 3621 (class 2606 OID 82937)
-- Name: user_registration_request ux_user_registration_tenant_user; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_registration_request
    ADD CONSTRAINT ux_user_registration_tenant_user UNIQUE (tenant_id, user_id);


--
-- TOC entry 3599 (class 2606 OID 82860)
-- Name: user_subscription ux_user_subscription__stripe_customer_id; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_subscription
    ADD CONSTRAINT ux_user_subscription__stripe_customer_id UNIQUE (stripe_customer_id);


--
-- TOC entry 3601 (class 2606 OID 82862)
-- Name: user_subscription ux_user_subscription__stripe_subscription_id; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_subscription
    ADD CONSTRAINT ux_user_subscription__stripe_subscription_id UNIQUE (stripe_subscription_id);


--
-- TOC entry 3603 (class 2606 OID 82864)
-- Name: user_subscription ux_user_subscription__user_profile_id; Type: CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_subscription
    ADD CONSTRAINT ux_user_subscription__user_profile_id UNIQUE (user_profile_id);


--
-- TOC entry 3658 (class 1259 OID 83371)
-- Name: idx_event_attendee_qr_data; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_attendee_qr_data ON public.event_attendee USING btree (qr_code_data) WHERE (qr_code_data IS NOT NULL);


--
-- TOC entry 3659 (class 1259 OID 83369)
-- Name: idx_event_attendee_qr_generated; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_attendee_qr_generated ON public.event_attendee USING btree (qr_code_generated) WHERE (qr_code_generated = true);


--
-- TOC entry 3660 (class 1259 OID 83370)
-- Name: idx_event_attendee_qr_generated_at; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_attendee_qr_generated_at ON public.event_attendee USING btree (qr_code_generated_at);


--
-- TOC entry 3606 (class 1259 OID 83363)
-- Name: idx_event_details_allow_guests; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_details_allow_guests ON public.event_details USING btree (allow_guests) WHERE (allow_guests = true);


--
-- TOC entry 3607 (class 1259 OID 83364)
-- Name: idx_event_details_guest_pricing; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_details_guest_pricing ON public.event_details USING btree (enable_guest_pricing) WHERE (enable_guest_pricing = true);


--
-- TOC entry 3608 (class 1259 OID 83366)
-- Name: idx_event_details_max_guests; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_details_max_guests ON public.event_details USING btree (max_guests_per_attendee) WHERE (max_guests_per_attendee > 0);


--
-- TOC entry 3609 (class 1259 OID 83365)
-- Name: idx_event_details_require_guest_approval; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_details_require_guest_approval ON public.event_details USING btree (require_guest_approval) WHERE (require_guest_approval = true);


--
-- TOC entry 3669 (class 1259 OID 83375)
-- Name: idx_event_guest_pricing_description; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_guest_pricing_description ON public.event_guest_pricing USING btree (description) WHERE (description IS NOT NULL);


--
-- TOC entry 3670 (class 1259 OID 83374)
-- Name: idx_event_guest_pricing_event_age_active; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_guest_pricing_event_age_active ON public.event_guest_pricing USING btree (event_id, age_group, is_active) WHERE (is_active = true);


--
-- TOC entry 3671 (class 1259 OID 83372)
-- Name: idx_event_guest_pricing_is_active; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_guest_pricing_is_active ON public.event_guest_pricing USING btree (is_active) WHERE (is_active = true);


--
-- TOC entry 3672 (class 1259 OID 83373)
-- Name: idx_event_guest_pricing_valid_period; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_guest_pricing_valid_period ON public.event_guest_pricing USING btree (valid_from, valid_to);


--
-- TOC entry 3650 (class 1259 OID 83377)
-- Name: idx_event_media_pre_signed_expires; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_media_pre_signed_expires ON public.event_media USING btree (pre_signed_url_expires_at);


--
-- TOC entry 3651 (class 1259 OID 83376)
-- Name: idx_event_media_pre_signed_url; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_media_pre_signed_url ON public.event_media USING btree (pre_signed_url) WHERE (pre_signed_url IS NOT NULL);


--
-- TOC entry 3628 (class 1259 OID 83368)
-- Name: idx_event_ticket_type_availability; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_ticket_type_availability ON public.event_ticket_type USING btree (available_quantity, sold_quantity);


--
-- TOC entry 3629 (class 1259 OID 83367)
-- Name: idx_event_ticket_type_sold_quantity; Type: INDEX; Schema: public; Owner: nextjs_template_boot
--

CREATE INDEX idx_event_ticket_type_sold_quantity ON public.event_ticket_type USING btree (sold_quantity);


--
-- TOC entry 3730 (class 2620 OID 83389)
-- Name: event_attendee generate_enhanced_qr_code_trigger; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER generate_enhanced_qr_code_trigger BEFORE INSERT OR UPDATE ON public.event_attendee FOR EACH ROW EXECUTE FUNCTION public.generate_enhanced_qr_code();


--
-- TOC entry 3729 (class 2620 OID 83388)
-- Name: event_ticket_transaction manage_ticket_inventory_trigger; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER manage_ticket_inventory_trigger AFTER INSERT OR DELETE OR UPDATE ON public.event_ticket_transaction FOR EACH ROW EXECUTE FUNCTION public.manage_ticket_inventory();


--
-- TOC entry 3732 (class 2620 OID 83384)
-- Name: event_attendee_guest update_event_attendee_guest_updated_at; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER update_event_attendee_guest_updated_at BEFORE UPDATE ON public.event_attendee_guest FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3731 (class 2620 OID 83383)
-- Name: event_attendee update_event_attendee_updated_at; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER update_event_attendee_updated_at BEFORE UPDATE ON public.event_attendee FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3726 (class 2620 OID 83382)
-- Name: event_details update_event_details_updated_at; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER update_event_details_updated_at BEFORE UPDATE ON public.event_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3733 (class 2620 OID 83385)
-- Name: event_guest_pricing update_event_guest_pricing_updated_at; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER update_event_guest_pricing_updated_at BEFORE UPDATE ON public.event_guest_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3728 (class 2620 OID 83386)
-- Name: event_ticket_type update_event_ticket_type_updated_at; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER update_event_ticket_type_updated_at BEFORE UPDATE ON public.event_ticket_type FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3725 (class 2620 OID 83381)
-- Name: event_type_details update_event_type_details_updated_at; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER update_event_type_details_updated_at BEFORE UPDATE ON public.event_type_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3722 (class 2620 OID 83378)
-- Name: tenant_organization update_tenant_organization_updated_at; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER update_tenant_organization_updated_at BEFORE UPDATE ON public.tenant_organization FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3724 (class 2620 OID 83379)
-- Name: tenant_settings update_tenant_settings_updated_at; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON public.tenant_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3723 (class 2620 OID 83380)
-- Name: user_profile update_user_profile_updated_at; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER update_user_profile_updated_at BEFORE UPDATE ON public.user_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3727 (class 2620 OID 83387)
-- Name: event_details validate_event_details_trigger; Type: TRIGGER; Schema: public; Owner: nextjs_template_boot
--

CREATE TRIGGER validate_event_details_trigger BEFORE INSERT OR UPDATE ON public.event_details FOR EACH ROW EXECUTE FUNCTION public.validate_event_details();


--
-- TOC entry 3682 (class 2606 OID 77457)
-- Name: event_live_update_attachment event_live_update_attachment_live_update_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_live_update_attachment
    ADD CONSTRAINT event_live_update_attachment_live_update_id_fkey FOREIGN KEY (live_update_id) REFERENCES public.event_live_update(id) ON DELETE CASCADE;


--
-- TOC entry 3688 (class 2606 OID 83213)
-- Name: event_admin fk_admin__created_by_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_admin
    ADD CONSTRAINT fk_admin__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3689 (class 2606 OID 83208)
-- Name: event_admin fk_admin__user_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_admin
    ADD CONSTRAINT fk_admin__user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- TOC entry 3715 (class 2606 OID 83338)
-- Name: event_admin_audit_log fk_admin_audit_log__admin_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_admin_audit_log
    ADD CONSTRAINT fk_admin_audit_log__admin_id FOREIGN KEY (admin_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3693 (class 2606 OID 83233)
-- Name: bulk_operation_log fk_bulk_operation_log__performed_by; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.bulk_operation_log
    ADD CONSTRAINT fk_bulk_operation_log__performed_by FOREIGN KEY (performed_by) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3711 (class 2606 OID 83323)
-- Name: event_calendar_entry fk_calendar_event__created_by_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_calendar_entry
    ADD CONSTRAINT fk_calendar_event__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3712 (class 2606 OID 83318)
-- Name: event_calendar_entry fk_calendar_event__event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_calendar_entry
    ADD CONSTRAINT fk_calendar_event__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3686 (class 2606 OID 83198)
-- Name: event_details fk_event__created_by_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_details
    ADD CONSTRAINT fk_event__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3687 (class 2606 OID 83203)
-- Name: event_details fk_event__event_type_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_details
    ADD CONSTRAINT fk_event__event_type_id FOREIGN KEY (event_type_id) REFERENCES public.event_type_details(id) ON DELETE SET NULL;


--
-- TOC entry 3713 (class 2606 OID 83333)
-- Name: event_attendee fk_event_attendee__attendee_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_attendee
    ADD CONSTRAINT fk_event_attendee__attendee_id FOREIGN KEY (attendee_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- TOC entry 3714 (class 2606 OID 83328)
-- Name: event_attendee fk_event_attendee__event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_attendee
    ADD CONSTRAINT fk_event_attendee__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3716 (class 2606 OID 83348)
-- Name: event_attendee_guest fk_event_attendee_guest__approved_by_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_attendee_guest
    ADD CONSTRAINT fk_event_attendee_guest__approved_by_id FOREIGN KEY (approved_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3717 (class 2606 OID 83343)
-- Name: event_attendee_guest fk_event_attendee_guest__primary_attendee_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_attendee_guest
    ADD CONSTRAINT fk_event_attendee_guest__primary_attendee_id FOREIGN KEY (primary_attendee_id) REFERENCES public.event_attendee(id) ON DELETE CASCADE;


--
-- TOC entry 3720 (class 2606 OID 83400)
-- Name: event_discount_code fk_event_discount_code__discount_code_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_discount_code
    ADD CONSTRAINT fk_event_discount_code__discount_code_id FOREIGN KEY (discount_code_id) REFERENCES public.discount_code(id) ON DELETE CASCADE;


--
-- TOC entry 3721 (class 2606 OID 83395)
-- Name: event_discount_code fk_event_discount_code__event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_discount_code
    ADD CONSTRAINT fk_event_discount_code__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3718 (class 2606 OID 83353)
-- Name: event_guest_pricing fk_event_guest_pricing__event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_guest_pricing
    ADD CONSTRAINT fk_event_guest_pricing__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3709 (class 2606 OID 83308)
-- Name: event_media fk_event_media__event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_media
    ADD CONSTRAINT fk_event_media__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3710 (class 2606 OID 83313)
-- Name: event_media fk_event_media__uploaded_by_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_media
    ADD CONSTRAINT fk_event_media__uploaded_by_id FOREIGN KEY (uploaded_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3694 (class 2606 OID 83238)
-- Name: event_organizer fk_event_organizer__event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_organizer
    ADD CONSTRAINT fk_event_organizer__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3695 (class 2606 OID 83243)
-- Name: event_organizer fk_event_organizer__organizer_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_organizer
    ADD CONSTRAINT fk_event_organizer__organizer_id FOREIGN KEY (organizer_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3701 (class 2606 OID 83268)
-- Name: user_payment_transaction fk_payment_transaction__event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_payment_transaction
    ADD CONSTRAINT fk_payment_transaction__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE SET NULL;


--
-- TOC entry 3702 (class 2606 OID 83273)
-- Name: user_payment_transaction fk_payment_transaction__ticket_transaction_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_payment_transaction
    ADD CONSTRAINT fk_payment_transaction__ticket_transaction_id FOREIGN KEY (ticket_transaction_id) REFERENCES public.event_ticket_transaction(id) ON DELETE SET NULL;


--
-- TOC entry 3703 (class 2606 OID 83283)
-- Name: event_poll fk_poll__created_by_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_poll
    ADD CONSTRAINT fk_poll__created_by_id FOREIGN KEY (created_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3704 (class 2606 OID 83278)
-- Name: event_poll fk_poll__event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_poll
    ADD CONSTRAINT fk_poll__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3705 (class 2606 OID 83288)
-- Name: event_poll_option fk_poll_option__poll_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_poll_option
    ADD CONSTRAINT fk_poll_option__poll_id FOREIGN KEY (poll_id) REFERENCES public.event_poll(id) ON DELETE CASCADE;


--
-- TOC entry 3706 (class 2606 OID 83293)
-- Name: event_poll_response fk_poll_response__poll_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT fk_poll_response__poll_id FOREIGN KEY (poll_id) REFERENCES public.event_poll(id) ON DELETE CASCADE;


--
-- TOC entry 3707 (class 2606 OID 83298)
-- Name: event_poll_response fk_poll_response__poll_option_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT fk_poll_response__poll_option_id FOREIGN KEY (poll_option_id) REFERENCES public.event_poll_option(id) ON DELETE CASCADE;


--
-- TOC entry 3708 (class 2606 OID 83303)
-- Name: event_poll_response fk_poll_response__user_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT fk_poll_response__user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- TOC entry 3719 (class 2606 OID 83358)
-- Name: qr_code_usage fk_qr_code_usage__attendee_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.qr_code_usage
    ADD CONSTRAINT fk_qr_code_usage__attendee_id FOREIGN KEY (attendee_id) REFERENCES public.event_attendee(id) ON DELETE CASCADE;


--
-- TOC entry 3681 (class 2606 OID 77422)
-- Name: event_score_card_detail fk_score_card_detail__score_card_id; Type: FK CONSTRAINT; Schema: public; Owner: giventa_event_management
--

ALTER TABLE ONLY public.event_score_card_detail
    ADD CONSTRAINT fk_score_card_detail__score_card_id FOREIGN KEY (score_card_id) REFERENCES public.event_score_card(id) ON DELETE CASCADE;


--
-- TOC entry 3684 (class 2606 OID 83183)
-- Name: tenant_settings fk_tenant_settings__tenant_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.tenant_settings
    ADD CONSTRAINT fk_tenant_settings__tenant_id FOREIGN KEY (tenant_id) REFERENCES public.tenant_organization(tenant_id) ON DELETE CASCADE;


--
-- TOC entry 3697 (class 2606 OID 83405)
-- Name: event_ticket_transaction fk_ticket_transaction__discount_code_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_ticket_transaction
    ADD CONSTRAINT fk_ticket_transaction__discount_code_id FOREIGN KEY (discount_code_id) REFERENCES public.discount_code(id) ON DELETE SET NULL;


--
-- TOC entry 3698 (class 2606 OID 83253)
-- Name: event_ticket_transaction fk_ticket_transaction__event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_ticket_transaction
    ADD CONSTRAINT fk_ticket_transaction__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3699 (class 2606 OID 83258)
-- Name: event_ticket_transaction fk_ticket_transaction__ticket_type_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_ticket_transaction
    ADD CONSTRAINT fk_ticket_transaction__ticket_type_id FOREIGN KEY (ticket_type_id) REFERENCES public.event_ticket_type(id) ON DELETE RESTRICT;


--
-- TOC entry 3700 (class 2606 OID 83263)
-- Name: event_ticket_transaction fk_ticket_transaction__user_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_ticket_transaction
    ADD CONSTRAINT fk_ticket_transaction__user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3696 (class 2606 OID 83248)
-- Name: event_ticket_type fk_ticket_type__event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.event_ticket_type
    ADD CONSTRAINT fk_ticket_type__event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE CASCADE;


--
-- TOC entry 3683 (class 2606 OID 83188)
-- Name: user_profile fk_user_profile_reviewed_by_admin; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_profile
    ADD CONSTRAINT fk_user_profile_reviewed_by_admin FOREIGN KEY (reviewed_by_admin_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3692 (class 2606 OID 83228)
-- Name: user_registration_request fk_user_registration_request__reviewed_by_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_registration_request
    ADD CONSTRAINT fk_user_registration_request__reviewed_by_id FOREIGN KEY (reviewed_by_id) REFERENCES public.user_profile(id) ON DELETE SET NULL;


--
-- TOC entry 3685 (class 2606 OID 83193)
-- Name: user_subscription fk_user_subscription__user_profile_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_subscription
    ADD CONSTRAINT fk_user_subscription__user_profile_id FOREIGN KEY (user_profile_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- TOC entry 3690 (class 2606 OID 83223)
-- Name: user_task fk_user_task_event_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_task
    ADD CONSTRAINT fk_user_task_event_id FOREIGN KEY (event_id) REFERENCES public.event_details(id) ON DELETE SET NULL;


--
-- TOC entry 3691 (class 2606 OID 83218)
-- Name: user_task fk_user_task_user_id; Type: FK CONSTRAINT; Schema: public; Owner: nextjs_template_boot
--

ALTER TABLE ONLY public.user_task
    ADD CONSTRAINT fk_user_task_user_id FOREIGN KEY (user_id) REFERENCES public.user_profile(id) ON DELETE CASCADE;


--
-- TOC entry 3922 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO giventa_event_management;


--
-- TOC entry 3923 (class 0 OID 0)
-- Dependencies: 224
-- Name: SEQUENCE sequence_generator; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,USAGE ON SEQUENCE public.sequence_generator TO giventa_event_management;


--
-- TOC entry 3924 (class 0 OID 0)
-- Dependencies: 238
-- Name: TABLE bulk_operation_log; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.bulk_operation_log TO giventa_event_management;


--
-- TOC entry 3925 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE databasechangelog; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.databasechangelog TO giventa_event_management;


--
-- TOC entry 3926 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE databasechangeloglock; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.databasechangeloglock TO giventa_event_management;


--
-- TOC entry 3928 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE discount_code; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.discount_code TO giventa_event_management;


--
-- TOC entry 3930 (class 0 OID 0)
-- Dependencies: 227
-- Name: SEQUENCE discount_code_id_seq; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,USAGE ON SEQUENCE public.discount_code_id_seq TO giventa_event_management;


--
-- TOC entry 3931 (class 0 OID 0)
-- Dependencies: 235
-- Name: TABLE event_admin; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_admin TO giventa_event_management;


--
-- TOC entry 3933 (class 0 OID 0)
-- Dependencies: 249
-- Name: TABLE event_admin_audit_log; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_admin_audit_log TO giventa_event_management;


--
-- TOC entry 3938 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE event_attendee; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_attendee TO giventa_event_management;


--
-- TOC entry 3942 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE event_attendee_guest; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_attendee_guest TO giventa_event_management;


--
-- TOC entry 3943 (class 0 OID 0)
-- Dependencies: 247
-- Name: TABLE event_calendar_entry; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_calendar_entry TO giventa_event_management;


--
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE event_details; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_details TO giventa_event_management;


--
-- TOC entry 3954 (class 0 OID 0)
-- Dependencies: 253
-- Name: TABLE event_discount_code; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_discount_code TO giventa_event_management;


--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 251
-- Name: TABLE event_guest_pricing; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_guest_pricing TO giventa_event_management;


--
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE event_media; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_media TO giventa_event_management;


--
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE event_organizer; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_organizer TO giventa_event_management;


--
-- TOC entry 3969 (class 0 OID 0)
-- Dependencies: 243
-- Name: TABLE event_poll; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_poll TO giventa_event_management;


--
-- TOC entry 3970 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE event_poll_option; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_poll_option TO giventa_event_management;


--
-- TOC entry 3971 (class 0 OID 0)
-- Dependencies: 245
-- Name: TABLE event_poll_response; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_poll_response TO giventa_event_management;


--
-- TOC entry 3978 (class 0 OID 0)
-- Dependencies: 241
-- Name: TABLE event_ticket_transaction; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_ticket_transaction TO giventa_event_management;


--
-- TOC entry 3980 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE event_ticket_type; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_ticket_type TO giventa_event_management;


--
-- TOC entry 3982 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE event_type_details; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.event_type_details TO giventa_event_management;


--
-- TOC entry 3984 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE qr_code_usage; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.qr_code_usage TO giventa_event_management;


--
-- TOC entry 3987 (class 0 OID 0)
-- Dependencies: 229
-- Name: TABLE tenant_organization; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.tenant_organization TO giventa_event_management;


--
-- TOC entry 3989 (class 0 OID 0)
-- Dependencies: 231
-- Name: TABLE tenant_settings; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.tenant_settings TO giventa_event_management;


--
-- TOC entry 3990 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE user_payment_transaction; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_payment_transaction TO giventa_event_management;


--
-- TOC entry 3992 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE user_profile; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_profile TO giventa_event_management;


--
-- TOC entry 3993 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE user_registration_request; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_registration_request TO giventa_event_management;


--
-- TOC entry 3994 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE user_subscription; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_subscription TO giventa_event_management;


--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 236
-- Name: TABLE user_task; Type: ACL; Schema: public; Owner: nextjs_template_boot
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public.user_task TO giventa_event_management;


-- Completed on 2025-06-08 23:51:06

--
-- PostgreSQL database dump complete
--

