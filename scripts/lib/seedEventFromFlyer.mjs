/**
 * Append-only: create one event_details row from a scraped flyer spec and upload the poster.
 * Tenant comes from migration-api-lib (MOSC_TENANT_ID, else NEXT_PUBLIC_TENANT_ID in .env.local).
 */
import { readFileSync, existsSync, copyFileSync, mkdirSync } from 'fs';
import { basename, dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { File } from 'node:buffer';
import { apiFetch, API_BASE_URL, TENANT_ID } from '../mosc-in-migration/migration-api-lib.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

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

function ascii(value) {
  return String(value || '').normalize('NFKD').replace(/[^\x20-\x7E]/g, '');
}

export async function findExistingByTitle(title, token) {
  const { res, json } = await apiFetch(
    `/api/event-details?title.equals=${encodeURIComponent(title)}&size=5`,
    { method: 'GET' },
    token
  );
  if (!res.ok) return [];
  return Array.isArray(json) ? json : json?.content || [];
}

export async function createEvent(spec, token, eventTypeId) {
  const now = new Date().toISOString();
  const payload = {
    title: spec.title,
    caption: spec.caption || '',
    description: spec.description || '',
    startDate: spec.startDate,
    endDate: spec.endDate || spec.startDate,
    promotionStartDate: spec.promotionStartDate || spec.startDate,
    startTime: spec.startTime,
    endTime: spec.endTime,
    timezone: spec.timezone || 'America/New_York',
    location: spec.location || '',
    directionsToVenue: spec.directionsToVenue || '',
    admissionType: spec.admissionType || 'free',
    isActive: spec.isActive !== false,
    allowGuests: false,
    requireGuestApproval: false,
    enableGuestPricing: false,
    isRegistrationRequired: !!spec.isRegistrationRequired,
    ...(spec.externalTicketUrl ? { externalTicketUrl: spec.externalTicketUrl } : {}),
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
    eventType: { id: eventTypeId },
    donationMetadata: JSON.stringify({ isFundraiserEvent: false, isCharityEvent: false }),
    ...(spec.fromEmail ? { fromEmail: spec.fromEmail } : {}),
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

export async function uploadHeroImage(eventId, imagePath, spec, token) {
  const buf = readFileSync(imagePath);
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
    title: ascii(spec.title || 'Event').slice(0, 120),
    description: ascii(spec.caption || '').slice(0, 200),
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

/**
 * @param {object} spec Scraped flyer fields plus imagePath
 * @param {{ token: string, eventTypeId: number, assetFolder?: string, logPrefix?: string }} options
 */
export async function seedOne(spec, options) {
  const { token, eventTypeId } = options;
  const logPrefix = options.logPrefix || '[seed-flyer]';
  if (!spec.title) throw new Error('Flyer spec is missing title');
  if (!spec.imagePath || !existsSync(spec.imagePath)) {
    throw new Error(`Flyer image not found: ${spec.imagePath}`);
  }
  if (!eventTypeId) {
    throw new Error('eventTypeId is required (EVENT_TYPE_ID or --event-type-id)');
  }

  const folder = (options.assetFolder || TENANT_ID || 'events').replace(/[^a-zA-Z0-9_-]/g, '_');
  const localDir = join(ROOT, 'public', 'images', folder, 'events');
  mkdirSync(localDir, { recursive: true });
  const localName = spec.localCopyName || basename(spec.imagePath).replace(/[^a-zA-Z0-9._-]/g, '_');
  const localCopy = join(localDir, localName);
  copyFileSync(spec.imagePath, localCopy);
  console.log(`${logPrefix} copied → ${localCopy}`);

  const existing = await findExistingByTitle(spec.title, token);
  if (existing.length > 0) {
    const id = existing[0].id;
    console.log(`${logPrefix} Event already exists (id=${id} "${spec.title}"). Skipping create; uploading media.`);
    const imageUrl = await uploadHeroImage(id, spec.imagePath, spec, token);
    console.log(`${logPrefix} id=${id} media=${imageUrl || 'MISSING'}`);
    return { id, created: false, imageUrl };
  }

  const created = await createEvent(spec, token, eventTypeId);
  const id = created?.id;
  if (id == null) {
    throw new Error(`Create returned no id: ${JSON.stringify(created)}`);
  }
  const imageUrl = await uploadHeroImage(id, spec.imagePath, spec, token);
  console.log(`${logPrefix} Created id=${id} "${spec.title}" tenant=${TENANT_ID}`);
  console.log(`${logPrefix} Media upload: ${imageUrl || 'MISSING URL (check admin media)'}`);
  return { id, created: true, imageUrl };
}

export async function seedFlyers(specs, options) {
  const results = [];
  for (const spec of specs) {
    const logPrefix = options.logPrefix || '[seed-flyer]';
    console.log(
      `${logPrefix} plan: ${spec.title} | ${spec.startDate} ${spec.startTime}–${spec.endTime}`
    );
    console.log(`${logPrefix} location: ${spec.location}`);
    console.log(`${logPrefix} image=${spec.imagePath}`);
    results.push(await seedOne(spec, options));
  }
  return results;
}
