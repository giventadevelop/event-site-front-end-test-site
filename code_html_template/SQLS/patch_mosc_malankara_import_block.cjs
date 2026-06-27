#!/usr/bin/env node
/**
 * Patches corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql:
 * - Removes stale mosc user_profile rows from BASE section (old +500000 ids)
 * - Moves tenant_organization + tenant_settings to top of duplicated block
 * - Fixes unique domain collision (mosc.in2)
 * - Adds missing event_type_details rows (600001-600006)
 */
const fs = require('fs');
const path = require('path');

const TARGET = path.join(
  __dirname,
  'corrected_event_media_inserts.ordered.mosc_malankara_orthodox_2.sql',
);

const TENANT = 'mosc_malankara_orthodox_2';
const MARKER = `-- ========== DUPLICATED TENANT: ${TENANT}`;

const EVENT_TYPES = [
  [600001, 'Gala', 'Formal gala event'],
  [600002, 'Conference', 'Tech conference'],
  [600003, 'Run', 'Charity run'],
  [600004, 'Picnic', 'Family picnic'],
  [600005, 'Dinner', 'VIP dinner'],
  [600006, 'Festival', 'Summer festival'],
];

const TS = '2025-06-22 11:31:26.181502';

function eventTypeInsert(id, name, description) {
  return (
    `INSERT INTO public.event_type_details (id, tenant_id, name, description, color, icon, is_active, display_order, created_at, updated_at) ` +
    `VALUES (${id}, '${TENANT}', '${name}', '${description}', '#3B82F6', NULL, true, 0, '${TS}', '${TS}');`
  );
}

const tenantOrganization = `INSERT INTO public.tenant_organization (id, tenant_id, organization_name, domain, primary_color, secondary_color, logo_url, contact_email, contact_phone, subscription_plan, subscription_status, subscription_start_date, subscription_end_date, monthly_fee_usd, stripe_customer_id, description, address_line_1, address_line_2, city, state_province, zip_code, country, website_url, is_active, created_at, updated_at) VALUES (600002, '${TENANT}', 'MOSC Malankara Orthodox', 'mosc.in2', '#3B82F6', '#1E40AF', '', 'giventauser@gmail.com', '13123430073', 'BASIC', 'TRIAL', NULL, NULL, 0.00, '', NULL, '165 Hopkins Avenue', 'APT 7', 'Jersey City', 'NJ', '60657', 'United States', 'https://www.mosc.in', true, '2025-06-22 11:31:27.518852', '2026-01-13 06:42:44.040745');`;

const tenantSettings = `INSERT INTO public.tenant_settings (id, tenant_id, tenant_organization_id, allow_user_registration, show_events_section_in_home_page, show_executive_committee_section_in_home_page, show_team_members_section_in_home_page, show_sponsors_section_in_home_page, is_membership_subscription_enabled, require_admin_approval, enable_whatsapp_integration, address_line_1, address_line_2, phone_number, zip_code, country, state_province, email, whatsapp_api_key, twilio_account_sid, twilio_auth_token, twilio_whatsapp_from, whatsapp_webhook_url, whatsapp_webhook_token, enable_email_marketing, homepage_cache_version, email_provider_config, custom_css, custom_js, max_events_per_month, max_attendees_per_event, enable_guest_registration, max_guests_per_attendee, default_event_capacity, platform_fee_percentage, email_header_image_url, email_footer_html_url, logo_image_url, default_hero_image_urls_json, default_hero_display_mode, default_hero_include_with_events, default_hero_max_display_count, facebook_url, instagram_url, twitter_url, linkedin_url, youtube_url, tiktok_url, created_at, updated_at) VALUES (600002, '${TENANT}', 600002, true, true, false, true, true, true, true, true, '165 Hopkins Ave, APT #7', '', '13123430073', '07306', 'United States', 'NJ', 'giventauser@gmail.com', '', '', '', NULL, '', '', false, 0, '{}', '', '', NULL, NULL, true, 10, 200, NULL, '', '', '', NULL, 'slideshow', true, NULL, 'https://www.facebook.com', 'https://www.instagram.com/', 'https://x.com/', 'https://www.linkedin.com', 'https://www.youtube.com', '', '2025-06-22 11:31:27.571', '2026-02-20 10:01:51.614984');`;

const preludeLines = [
  '',
  '-- Patched: tenant org/settings first, unique domain, event_type_details for FK order',
  tenantOrganization,
  '',
  tenantSettings,
  '',
  ...EVENT_TYPES.map(([id, name, desc]) => eventTypeInsert(id, name, desc)),
  '',
];

const content = fs.readFileSync(TARGET, 'utf8');
const lines = content.split(/\r?\n/);

const markerIdx = lines.findIndex((l) => l.includes(MARKER));
if (markerIdx === -1) {
  console.error('Marker not found:', MARKER);
  process.exit(1);
}

const baseLines = lines.slice(0, markerIdx);
const dupLines = lines.slice(markerIdx);

// Strip stale mosc user_profile from BASE only (dup block has correct +600000 ids)
let removedBaseProfiles = 0;
const cleanedBase = baseLines.filter((line) => {
  if (
    line.includes('INSERT INTO public.user_profile') &&
    line.includes(`'${TENANT}'`)
  ) {
    removedBaseProfiles += 1;
    return false;
  }
  return true;
});

const filteredDup = dupLines.filter((line) => {
  if (!line.includes(TENANT)) return true;
  if (line.includes('INSERT INTO public.tenant_organization')) return false;
  if (line.includes('INSERT INTO public.tenant_settings')) return false;
  if (line.includes('INSERT INTO public.event_type_details')) return false;
  return true;
});

const markerIdx2 = filteredDup.findIndex((l) => l.includes(MARKER));
const insertAt = markerIdx2 + 1;

const patched = [
  ...cleanedBase,
  ...filteredDup.slice(0, insertAt),
  ...preludeLines,
  ...filteredDup.slice(insertAt),
];

fs.writeFileSync(TARGET, patched.join('\n'), 'utf8');
console.log(`Patched ${TARGET}`);
console.log(`  Removed ${removedBaseProfiles} stale mosc user_profile row(s) from base section`);
console.log(`  Inserted ${preludeLines.length} prelude lines after duplicated-tenant marker`);
console.log(`  Removed duplicate tenant_organization/settings/event_type_details for ${TENANT}`);
