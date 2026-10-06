#!/usr/bin/env node
/**
 * Create an event from a scraped flyer for whatever tenant this app is pointed at.
 *
 * Tenant: MOSC_TENANT_ID if set, otherwise NEXT_PUBLIC_TENANT_ID from .env.local.
 * Event type: --event-type-id or EVENT_TYPE_ID (required; ids differ per tenant).
 *
 * Usage (JSON spec — one object or an array):
 *   node scripts/seed-event-from-flyer.mjs --spec scripts/flyers/my-event.json --event-type-id 13
 *
 * Usage (flags):
 *   node scripts/seed-event-from-flyer.mjs ^
 *     --image C:\path\poster.png ^
 *     --title "Event title" ^
 *     --start-date 2026-10-09 --end-date 2026-10-09 ^
 *     --start-time 18:00:00 --end-time 23:00:00 ^
 *     --location "Venue, street, city" ^
 *     --admission ticketed ^
 *     --registration-required ^
 *     --external-url https://forms.gle/example ^
 *     --event-type-id 13
 *
 * Other flags: --caption --description --promotion-start-date --featured --featured-rank
 *   --competition --from-email --timezone --asset-folder
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { assertEnv, getServiceJwt, API_BASE_URL, TENANT_ID } from './mosc-in-migration/migration-api-lib.mjs';
import { seedFlyers } from './lib/seedEventFromFlyer.mjs';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next == null || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function usage() {
  console.log(`seed-event-from-flyer

Tenant: ${TENANT_ID || '(unset — set MOSC_TENANT_ID or NEXT_PUBLIC_TENANT_ID)'}
API:    ${API_BASE_URL || '(unset)'}

  node scripts/seed-event-from-flyer.mjs --spec <file.json> --event-type-id <id>
  node scripts/seed-event-from-flyer.mjs --image <poster> --title <title> --start-date YYYY-MM-DD --end-date YYYY-MM-DD --start-time HH:mm:ss --end-time HH:mm:ss --location <venue> --event-type-id <id>

Optional: --caption --description --promotion-start-date --admission free|ticketed
  --registration-required --external-url <url> --featured --featured-rank <n>
  --competition --from-email <email> --timezone <IANA> --asset-folder <name>
`);
}

function specFromFlags(args) {
  const required = ['image', 'title', 'start-date', 'start-time', 'end-time', 'location'];
  const missing = required.filter((key) => !args[key]);
  if (missing.length) {
    throw new Error(`Missing --${missing.join(', --')}`);
  }
  return {
    title: args.title,
    caption: args.caption || '',
    description: args.description || '',
    startDate: args['start-date'],
    endDate: args['end-date'] || args['start-date'],
    promotionStartDate: args['promotion-start-date'] || args['start-date'],
    startTime: args['start-time'],
    endTime: args['end-time'],
    timezone: args.timezone || 'America/New_York',
    location: args.location,
    admissionType: args.admission || 'free',
    isRegistrationRequired: args['registration-required'] === true || args['registration-required'] === 'true',
    externalTicketUrl: args['external-url'] || '',
    isFeaturedEvent: args.featured === true || args.featured === 'true',
    featuredEventPriorityRanking: Number(args['featured-rank'] || 0),
    isCompetitionEvent: args.competition === true || args.competition === 'true',
    fromEmail: args['from-email'] || '',
    imagePath: resolve(args.image),
  };
}

function loadSpecs(args) {
  if (args.spec) {
    const raw = JSON.parse(readFileSync(resolve(args.spec), 'utf8'));
    const list = Array.isArray(raw) ? raw : [raw];
    return list.map((spec) => ({
      ...spec,
      imagePath: spec.imagePath ? resolve(spec.imagePath) : spec.imagePath,
    }));
  }
  return [specFromFlags(args)];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    usage();
    return;
  }
  assertEnv();
  const eventTypeId = Number(args['event-type-id'] || process.env.EVENT_TYPE_ID || 0);
  if (!eventTypeId) {
    throw new Error('Set --event-type-id or EVENT_TYPE_ID. Event type ids are per tenant.');
  }
  const specs = loadSpecs(args);
  console.log(`[seed-flyer] API=${API_BASE_URL} tenant=${TENANT_ID} eventTypeId=${eventTypeId}`);
  console.log(`[seed-flyer] seeding ${specs.length} flyer(s)`);
  const token = await getServiceJwt();
  await seedFlyers(specs, {
    token,
    eventTypeId,
    assetFolder: args['asset-folder'] || undefined,
    logPrefix: '[seed-flyer]',
  });
}

main().catch((err) => {
  console.error('[seed-flyer] FAILED:', err.message || err);
  process.exit(1);
});
