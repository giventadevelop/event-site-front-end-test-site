#!/usr/bin/env node
/**
 * Create KCNJ events from flyer images (append-only — does not delete existing events).
 *
 * Details were scraped from the flyer pixels (vision + Tesseract OCR).
 *
 * Usage:
 *   node scripts/seed-kcnj-event-from-flyer.mjs
 *   IMAGE_PATH="F:/path/to/flyer.jpeg" node scripts/seed-kcnj-event-from-flyer.mjs
 *
 * Defaults: both Aug 2026 flyers under image-edit-ai-tools/modify_aug_06.
 */
import { readFileSync, existsSync, copyFileSync, mkdirSync } from 'fs';
import { basename, dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { File } from 'node:buffer';
import {
  assertEnv,
  getServiceJwt,
  apiFetch,
  API_BASE_URL,
  TENANT_ID,
} from './mosc-in-migration/migration-api-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FLYER_DIR = 'F:/project_workspace/image-edit-ai-tools/public/images/kcnj/modify_aug_06';

const EVENT_TYPE_ID = Number(process.env.EVENT_TYPE_ID || 13);

/**
 * Scraped from:
 *  - onam_ad_hero_section.png (Parsippany Onam 2026)
 *  - painting_event_2000x800.jpg (Parsippany Onam Painting Competition)
 */
const EVENTS = [
  {
    key: 'parsippany-onam-2026',
    title: 'Parsippany ONAM 2026',
    caption: "Let's celebrate our heritage, together as one!",
    description: [
      'Kerala Center of New Jersey presents Parsippany ONAM 2026 — a community celebration of Kerala heritage.',
      'Join us for a full day of culture, family, and festivities. Title sponsor: Spectrum Auto.',
      'Venue: Parsippany Hills High School, 20 Rita Dr, Morris Plains, NJ 07950.',
      'Scan the flyer QR code to register and book tickets.',
    ].join(' '),
    startDate: '2026-09-05',
    endDate: '2026-09-05',
    promotionStartDate: '2026-06-01',
    startTime: '11:30:00',
    endTime: '18:00:00',
    location: 'Parsippany Hills High School, 20 Rita Dr, Morris Plains, NJ 07950',
    admissionType: 'ticketed',
    isFeaturedEvent: true,
    featuredEventPriorityRanking: 1,
    isCompetitionEvent: false,
    isRegistrationRequired: false,
    fromEmail: 'contactus@keralacenter.org',
    imagePath: resolve(FLYER_DIR, 'onam_ad_hero_section.png'),
    localCopyName: 'parsippany-onam-2026-hero.png',
  },
  {
    key: 'parsippany-onam-painting-2026',
    title: 'Parsippany Onam Painting Competition',
    caption: 'Onam theme · Ages 4–6, 7–11, and 12–16',
    description: [
      'Kerala Center of New Jersey — a community cultural initiative — presents the Parsippany Onam Painting Competition.',
      'Theme: Onam. Age groups: 4–6, 7–11, and 12–16. Register before August 20, 2026.',
      'Sunday, August 30, 2026 at Volunteers Park, 435 N Beverwyck Rd, Lake Hiawatha, NJ 07034.',
      'Schedule: 10:00–10:30 AM check-in · 10:30–11:30 AM competition · 11:30 AM–12:00 PM judges review · 12:00–12:30 PM winners announcement.',
      'Organizers provide a chart and pencil. Participants must bring their own coloring utensils (color pencils, color pens, crayons).',
      'Inquiries: Jyothylekshmy Vijayan 862-529-7223 · Vidya Rajeev 201-787-6244.',
    ].join(' '),
    startDate: '2026-08-30',
    endDate: '2026-08-30',
    promotionStartDate: '2026-07-01',
    startTime: '10:00:00',
    endTime: '12:30:00',
    location: 'Volunteers Park, 435 N Beverwyck Rd, Lake Hiawatha, NJ 07034',
    admissionType: 'free',
    isFeaturedEvent: true,
    featuredEventPriorityRanking: 2,
    isCompetitionEvent: true,
    isRegistrationRequired: true,
    fromEmail: 'contactus@keralacenter.org',
    imagePath: resolve(FLYER_DIR, 'painting_event_2000x800.jpg'),
    localCopyName: 'parsippany-onam-painting-2026.jpg',
  },
];

function mimeFor(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function extractUploadUrl(result) {
  if (!result || typeof result !== 'object') return null;
  if (Array.isArray(result.data) && result.data[0]) {
    return result.data[0].fileUrl || result.data[0].url || null;
  }
  return result.fileUrl || result.url || null;
}

async function createEvent(spec, token) {
  const now = new Date().toISOString();
  const payload = {
    title: spec.title,
    caption: spec.caption,
    description: spec.description,
    startDate: spec.startDate,
    endDate: spec.endDate,
    promotionStartDate: spec.promotionStartDate,
    startTime: spec.startTime,
    endTime: spec.endTime,
    timezone: 'America/New_York',
    location: spec.location,
    directionsToVenue: '',
    admissionType: spec.admissionType,
    isActive: true,
    allowGuests: false,
    requireGuestApproval: false,
    enableGuestPricing: false,
    isRegistrationRequired: !!spec.isRegistrationRequired,
    isSportsEvent: false,
    isCompetitionEvent: !!spec.isCompetitionEvent,
    isLive: false,
    isFeaturedEvent: !!spec.isFeaturedEvent,
    featuredEventPriorityRanking: spec.featuredEventPriorityRanking || 0,
    liveEventPriorityRanking: 0,
    isRecurring: false,
    paymentFlowMode: 'STRIPE_ONLY',
    manualPaymentEnabled: false,
    tenantId: TENANT_ID,
    eventType: { id: EVENT_TYPE_ID },
    donationMetadata: JSON.stringify({ isFundraiserEvent: false, isCharityEvent: false }),
    fromEmail: spec.fromEmail || 'contactus@keralacenter.org',
    createdAt: now,
    updatedAt: now,
  };

  const { res, json, text } = await apiFetch(
    '/api/event-details',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    token
  );
  if (!res.ok) {
    throw new Error(`Create "${spec.title}" failed (${res.status}): ${text.slice(0, 600)}`);
  }
  return json;
}

async function uploadHeroImage(eventId, imagePath, spec, token) {
  const buf = readFileSync(imagePath);
  const safeTitle = (spec.title || 'Event').normalize('NFKD').replace(/[^\x20-\x7E]/g, '');
  const safeCaption = (spec.caption || '').normalize('NFKD').replace(/[^\x20-\x7E]/g, '');
  const safeFileName = basename(imagePath).replace(/[^a-zA-Z0-9._-]/g, '_');
  const formData = new FormData();
  formData.append('file', new File([buf], safeFileName, { type: mimeFor(imagePath) }));

  const params = new URLSearchParams({
    eventId: String(eventId),
    eventFlyer: 'true',
    isEventManagementOfficialDocument: 'false',
    isHeroImage: 'true',
    isActiveHeroImage: 'true',
    isHomePageHeroImage: 'true',
    isFeaturedEventImage: String(!!spec.isFeaturedEvent),
    isFeaturedImage: String(!!spec.isFeaturedEvent),
    isPublic: 'true',
    title: safeTitle.slice(0, 120),
    description: safeCaption.slice(0, 200),
    tenantId: TENANT_ID,
    displayOrder: '0',
  });

  const url = `${API_BASE_URL}/api/event-medias/upload?${params.toString()}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': TENANT_ID,
    },
    body: formData,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new Error(`Upload for event ${eventId} failed (${res.status}): ${text.slice(0, 400)}`);
  }
  return extractUploadUrl(json);
}

async function findExistingByTitle(title, token) {
  const { res, json } = await apiFetch(
    `/api/event-details?title.equals=${encodeURIComponent(title)}&size=5`,
    { method: 'GET' },
    token
  );
  if (!res.ok) return [];
  return Array.isArray(json) ? json : json?.content || [];
}

async function seedOne(spec, token) {
  if (!existsSync(spec.imagePath)) {
    throw new Error(`Flyer image not found: ${spec.imagePath}`);
  }

  const localDir = join(ROOT, 'public', 'images', 'KCNJ', 'events');
  mkdirSync(localDir, { recursive: true });
  const localCopy = join(localDir, spec.localCopyName);
  copyFileSync(spec.imagePath, localCopy);
  console.log(`[seed-kcnj-flyer] copied → ${localCopy}`);

  const existing = await findExistingByTitle(spec.title, token);
  if (existing.length > 0) {
    const id = existing[0].id;
    console.log(
      `[seed-kcnj-flyer] Event already exists (id=${id} "${spec.title}"). Skipping create; uploading media.`
    );
    const imageUrl = await uploadHeroImage(id, spec.imagePath, spec, token);
    console.log(`[seed-kcnj-flyer] ✓ id=${id} media=${imageUrl || 'MISSING'}`);
    return { id, created: false, imageUrl };
  }

  const created = await createEvent(spec, token);
  const id = created?.id;
  if (id == null) {
    throw new Error(`Create returned no id: ${JSON.stringify(created)}`);
  }
  const imageUrl = await uploadHeroImage(id, spec.imagePath, spec, token);
  console.log(`[seed-kcnj-flyer] ✓ Created id=${id} "${spec.title}"`);
  console.log(`[seed-kcnj-flyer] ✓ Media upload: ${imageUrl || 'MISSING URL (check admin media)'}`);
  return { id, created: true, imageUrl };
}

async function main() {
  assertEnv();

  const singlePath = process.env.IMAGE_PATH ? resolve(process.env.IMAGE_PATH) : null;
  const specs = singlePath
    ? EVENTS.filter((e) => e.imagePath === singlePath).concat(
        EVENTS.some((e) => e.imagePath === singlePath)
          ? []
          : [{ ...EVENTS[0], imagePath: singlePath, localCopyName: basename(singlePath) }]
      )
    : EVENTS;

  console.log(`[seed-kcnj-flyer] API=${API_BASE_URL} tenant=${TENANT_ID}`);
  console.log(`[seed-kcnj-flyer] eventTypeId=${EVENT_TYPE_ID}`);
  console.log(`[seed-kcnj-flyer] seeding ${specs.length} flyer(s)`);

  const token = await getServiceJwt();
  for (const spec of specs) {
    console.log(
      `[seed-kcnj-flyer] plan: ${spec.title} | ${spec.startDate} ${spec.startTime}–${spec.endTime}`
    );
    console.log(`[seed-kcnj-flyer] location: ${spec.location}`);
    console.log(`[seed-kcnj-flyer] image=${spec.imagePath}`);
    await seedOne(spec, token);
  }
}

main().catch((err) => {
  console.error('[seed-kcnj-flyer] FAILED:', err);
  process.exit(1);
});
