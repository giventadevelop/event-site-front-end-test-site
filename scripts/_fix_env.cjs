const fs = require('fs');
const path = require('path');

// Files with existing @/lib/env import (need to add getApiBaseUrl to existing import)
const filesWithEnvImport = [
  'src/app/admin/event-contacts/ApiServerActions.ts',
  'src/app/admin/event-emails/ApiServerActions.ts',
  'src/app/admin/event-featured-performers/ApiServerActions.ts',
  'src/app/admin/event-program-directors/ApiServerActions.ts',
  'src/app/admin/events/dashboard/ApiServerActions.ts',
  'src/app/admin/events/registrations/ApiServerActions.ts',
  'src/app/admin/events/[id]/contacts/ApiServerActions.ts',
  'src/app/admin/events/[id]/discount-codes/list/ApiServerActions.ts',
  'src/app/admin/events/[id]/emails/ApiServerActions.ts',
  'src/app/admin/events/[id]/media/ApiServerActions.ts',
  'src/app/admin/events/[id]/performers/ApiServerActions.ts',
  'src/app/admin/events/[id]/program-directors/ApiServerActions.ts',
  'src/app/admin/events/[id]/ticket-types/list/ApiServerActions.ts',
  'src/app/admin/events-analytics/[id]/contacts/ApiServerActions.ts',
  'src/app/admin/events-analytics/[id]/discount-codes/list/ApiServerActions.ts',
  'src/app/admin/events-analytics/[id]/emails/ApiServerActions.ts',
  'src/app/admin/events-analytics/[id]/media/ApiServerActions.ts',
  'src/app/admin/events-analytics/[id]/performers/ApiServerActions.ts',
  'src/app/admin/events-analytics/[id]/ticket-types/list/ApiServerActions.ts',
  'src/app/admin/executive-committee/ApiServerActions.ts',
  'src/app/admin/focus-groups/[id]/edit/ApiServerActions.ts',
  'src/app/admin/gallery/albums/ApiServerActions.ts',
  'src/app/admin/manage-usage/ApiServerActions.ts',
  'src/app/admin/membership/plans/ApiServerActions.ts',
  'src/app/admin/membership/subscriptions/ApiServerActions.ts',
  'src/app/admin/newsletter-emails/ApiServerActions.ts',
  'src/app/admin/qrcode-scan/tickets/events/[eventId]/transactions/[transactionId]/ApiServerActions.ts',
  'src/app/admin/tenant-email-addresses/ApiServerActions.ts',
  'src/app/admin/tenant-management/settings/ApiServerActions.ts',
  'src/app/admin/whatsapp/bulk-messaging/ApiServerActions.ts',
  'src/app/admin/whatsapp-settings/ApiServerActions.ts',
  'src/app/api/auth/me/route.ts',
  'src/app/api/auth/signin/route.ts',
  'src/app/api/auth/signup/route.ts',
  'src/app/api/auth/social/route.ts',
  'src/app/api/oauth/[provider]/initiate/route.ts',
  'src/app/api/profile/generate-email-token/route.ts',
  'src/app/api/profile/update/route.ts',
  'src/app/api/webhooks/clerk/route.ts',
  'src/app/api/webhooks/givebutter/route.ts',
  'src/app/api/webhooks/stripe/ApiServerActions.ts',
  'src/app/calendar/ApiServerActions.ts',
  'src/app/event/register/ApiServerActions.ts',
  'src/app/event/registration/actions.ts',
  'src/app/events/[id]/checkout/CheckoutServerData.tsx',
  'src/app/events/[id]/donation/DonationServerData.tsx',
  'src/app/events/[id]/donation-checkout/DonationCheckoutServerData.tsx',
  'src/app/events/[id]/eventcube-checkout/EventcubeCheckoutServerData.tsx',
  'src/app/events/[id]/givebutter-checkout/GivebutterCheckoutServerData.tsx',
  'src/app/events/[id]/manual-checkout/page.tsx',
  'src/app/events/[id]/manual-checkout/success/ApiServerActions.ts',
  'src/app/gallery/ApiServerActions.ts',
  'src/app/membership/manage/ApiServerActions.ts',
  'src/app/membership/plans/ApiServerActions.ts',
  'src/app/membership/subscribe/[planId]/ApiServerActions.ts',
  'src/app/profile/ApiServerActions.ts',
  'src/pages/api/event-medias/upload/featured-performer/[entityId]/[imageType].ts',
  'src/pages/api/event-medias/upload/sponsor/[entityId]/[imageType].ts',
  'src/pages/api/proxy/event-medias/upload/email-header-image.ts',
  'src/pages/api/proxy/event-medias/upload/focus-group-cover-image.ts',
  'src/pages/api/proxy/event-medias/upload/promotional-email-footer-image.ts',
  'src/pages/api/proxy/event-medias/upload/promotional-email-header-image.ts',
  'src/pages/api/proxy/event-poll-options/[...slug].ts',
  'src/pages/api/proxy/event-program-directors/index.ts',
  'src/pages/api/proxy/event-sponsors/index.ts',
  'src/pages/api/proxy/event-sponsors/[...slug].ts',
  'src/pages/api/proxy/event-sponsors-join/index.ts',
  'src/pages/api/proxy/events/[...slug].ts',
  'src/pages/api/proxy/events/[id]/transactions/qrcode.ts',
  'src/pages/api/proxy/promotion-email-templates/[id]/send-bulk.ts',
  'src/pages/api/proxy/promotion-email-templates/[id]/send-test.ts',
  'src/pages/api/proxy/promotion-email-templates/[id]/send-to-subscribed.ts',
  'src/pages/api/proxy/tenant-settings/upload/email-footer-html.ts',
  'src/pages/api/proxy/tenant-settings/upload/email-header-image.ts',
  'src/pages/api/proxy/tenant-settings/upload/tenant-logo.ts',
  'src/pages/api/proxy/user-profiles/[...slug].ts',
];

// Files WITHOUT existing @/lib/env import (need to add new import line)
const filesWithoutEnvImport = [
  'src/app/admin/check-in-analytics/ApiServerActions.ts',
  'src/app/admin/tenant-management/organizations/ApiServerActions.ts',
  'src/app/api/auth/profile-reconciliation/route.ts',
  'src/app/api/auth/refresh/route.ts',
  'src/app/api/auth/signout/route.ts',
  'src/app/api/clerk/sync-user/route.ts',
  'src/app/api/profile/fetch/route.ts',
  'src/app/api/qr/verify/route.ts',
  'src/app/tasks/[id]/edit/page.tsx',
  'src/pages/api/proxy/event-medias/index.ts',
  'src/pages/api/proxy/event-medias/upload/event-sponsor-media.ts',
  'src/pages/api/proxy/event-medias/upload/event-sponsor-poster.ts',
  'src/pages/api/proxy/event-medias/upload/featured-performer.ts',
  'src/pages/api/proxy/event-medias/upload/program-director/[entityId]/photo.ts',
  'src/pages/api/proxy/event-medias/upload/sponsor-image.ts',
  'src/pages/api/proxy/event-medias/upload/sponsor-media.ts',
  'src/pages/api/proxy/event-medias/upload/sponsor.ts',
  'src/pages/api/proxy/event-medias/upload-multiple.ts',
  'src/pages/api/proxy/event-medias/upload.ts',
  'src/pages/api/proxy/event-types/index.ts',
  'src/pages/api/proxy/events/index.ts',
  'src/pages/api/proxy/events/[id]/transactions/[transactionId]/emailHostUrlPrefix/[emailHostUrlPrefix]/qrcode.ts',
  'src/pages/api/proxy/ticket-transactions/index.ts',
  'src/pages/api/proxy/ticket-transactions/[...slug].ts',
  'src/pages/api/proxy/user-subscriptions/index.ts',
  'src/pages/api/proxy/user-subscriptions/[...slug].ts',
];

let fixCount = 0;
let errorCount = 0;

// Process files with existing @/lib/env import
filesWithEnvImport.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf-8');

    // Add getApiBaseUrl to existing import
    // Handle both single quotes and double quotes
    const importRegex = /import\s*\{([^}]+)\}\s*from\s*(['"])@\/lib\/env\2/;
    const match = content.match(importRegex);
    if (match && !match[1].includes('getApiBaseUrl')) {
      const existingImports = match[1].trim();
      const quote = match[2];
      const newImports = existingImports + ', getApiBaseUrl';
      content = content.replace(match[0], `import { ${newImports} } from ${quote}@/lib/env${quote}`);
    }

    // Replace all process.env.NEXT_PUBLIC_API_BASE_URL with getApiBaseUrl()
    content = content.replace(/process\.env\.NEXT_PUBLIC_API_BASE_URL/g, 'getApiBaseUrl()');

    fs.writeFileSync(f, content, 'utf-8');
    fixCount++;
    console.log('FIXED: ' + f);
  } catch (err) {
    errorCount++;
    console.error('ERROR: ' + f + ' - ' + err.message);
  }
});

// Process files without @/lib/env import
filesWithoutEnvImport.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf-8');

    // Add new import line after the last existing import
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].match(/^import\s/)) {
        lastImportIndex = i;
      }
      // Stop looking after we pass the import section (hit a non-import, non-empty, non-comment line)
      if (lastImportIndex >= 0 && !lines[i].startsWith('import ') && !lines[i].match(/^import\s/) && lines[i].trim() !== '' && !lines[i].trim().startsWith('//') && !lines[i].trim().startsWith('*') && !lines[i].trim().startsWith('/**')) {
        break;
      }
    }

    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, "import { getApiBaseUrl } from '@/lib/env';");
    } else {
      // No imports found, add at top (after 'use server' if present)
      let insertIndex = 0;
      if (lines[0] && (lines[0].includes('"use server"') || lines[0].includes("'use server'"))) {
        insertIndex = 1;
      }
      lines.splice(insertIndex, 0, "import { getApiBaseUrl } from '@/lib/env';");
    }

    content = lines.join('\n');

    // Replace all process.env.NEXT_PUBLIC_API_BASE_URL with getApiBaseUrl()
    content = content.replace(/process\.env\.NEXT_PUBLIC_API_BASE_URL/g, 'getApiBaseUrl()');

    fs.writeFileSync(f, content, 'utf-8');
    fixCount++;
    console.log('FIXED: ' + f);
  } catch (err) {
    errorCount++;
    console.error('ERROR: ' + f + ' - ' + err.message);
  }
});

console.log('\n=== SUMMARY ===');
console.log('Fixed: ' + fixCount + ' files');
console.log('Errors: ' + errorCount + ' files');
