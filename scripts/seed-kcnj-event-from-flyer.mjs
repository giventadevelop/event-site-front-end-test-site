#!/usr/bin/env node
/**
 * Create KCNJ events from flyer images (append-only — does not delete existing events).
 *
 * Details were scraped from the flyer pixels (vision + Tesseract OCR).
 *
 * Usage:
 *   node scripts/seed-kcnj-event-from-flyer.mjs
 *   IMAGE_PATH="C:/path/to/a-catalog-flyer.png" node scripts/seed-kcnj-event-from-flyer.mjs
 *
 * New posters that are not in EVENTS[] belong in the generic script:
 *   node scripts/seed-event-from-flyer.mjs --help
 *
 * Defaults: catalog under image-edit-ai-tools/kcnj. Tenant is whatever
 * MOSC_TENANT_ID / NEXT_PUBLIC_TENANT_ID this process loads (kcnj-prod → keralacenter_org_9).
 */
import { resolve } from 'path';
import { assertEnv, getServiceJwt, API_BASE_URL, TENANT_ID } from './mosc-in-migration/migration-api-lib.mjs';
import { seedFlyers } from './lib/seedEventFromFlyer.mjs';

const FLYER_DIR = 'C:/project_workspace/image-edit-ai-tools/public/images/kcnj/modify_aug_06';

const EVENT_TYPE_ID = Number(process.env.EVENT_TYPE_ID || 13);

/**
 * Scraped from:
 *  - onam_ad_hero_section.png (Parsippany Onam 2026)
 *  - painting_event_2000x800.jpg (Parsippany Onam Painting Competition)
 *  - Parsippany_Onam_Volunteer_Recognition_2026.png (Volunteer Recognition & Party)
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
  {
    key: 'parsippany-onam-volunteer-recognition-2026',
    title: 'Parsippany ONAM 2026 Volunteer Recognition & Party',
    caption: 'Celebrate the volunteers who made Onam 2026 possible',
    description: [
      'Kerala Center of New Jersey presents Parsippany ONAM 2026 Volunteer Recognition & Party.',
      'Celebrate the volunteers who made Onam 2026 possible.',
      'Free admission for volunteers. Non-volunteer tickets: $20 adults and $12 kids.',
      'Friday, October 9, 2026, 6:00 PM to 11:00 PM.',
      'Venue: Hildale Park Presbyterian Church, 85 Ridgedale Ave, Cedar Knolls, NJ 07927.',
      'Registration is required: https://forms.gle/4whs3o9arcFZELi97',
    ].join(' '),
    startDate: '2026-10-09',
    endDate: '2026-10-09',
    promotionStartDate: '2026-09-15',
    startTime: '18:00:00',
    endTime: '23:00:00',
    location: 'Hildale Park Presbyterian Church, 85 Ridgedale Ave, Cedar Knolls, NJ 07927',
    admissionType: 'ticketed',
    isFeaturedEvent: true,
    featuredEventPriorityRanking: 1,
    isCompetitionEvent: false,
    isRegistrationRequired: true,
    externalTicketUrl: 'https://forms.gle/4whs3o9arcFZELi97',
    fromEmail: 'contactus@keralacenter.org',
    imagePath: resolve(
      'C:/project_workspace/image-edit-ai-tools/public/images/kcnj/Parsippany_Onam_Volunteer_Recognition_2026.png'
    ),
    localCopyName: 'parsippany-onam-volunteer-recognition-2026.png',
  },
];

async function main() {
  assertEnv();

  const singlePath = process.env.IMAGE_PATH ? resolve(process.env.IMAGE_PATH) : null;
  const specs = singlePath ? EVENTS.filter((e) => e.imagePath === singlePath) : EVENTS;
  if (specs.length === 0) {
    throw new Error(
      `No KCNJ catalog entry matches IMAGE_PATH=${singlePath}. Use scripts/seed-event-from-flyer.mjs for a new poster.`
    );
  }

  console.log(`[seed-kcnj-flyer] API=${API_BASE_URL} tenant=${TENANT_ID}`);
  console.log(`[seed-kcnj-flyer] eventTypeId=${EVENT_TYPE_ID}`);
  console.log(`[seed-kcnj-flyer] seeding ${specs.length} flyer(s)`);

  const token = await getServiceJwt();
  await seedFlyers(specs, {
    token,
    eventTypeId: EVENT_TYPE_ID,
    assetFolder: 'KCNJ',
    logPrefix: '[seed-kcnj-flyer]',
  });
}

main().catch((err) => {
  console.error('[seed-kcnj-flyer] FAILED:', err);
  process.exit(1);
});
