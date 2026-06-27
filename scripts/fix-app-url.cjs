const fs = require('fs');
const path = require('path');

// Files that need to be updated to use getAppUrl()
const filesToUpdate = [
  'src/lib/utils.ts',
  'src/lib/tenantSettingsCache.ts',
  'src/lib/stripe/checkout.ts',
  'src/app/profile/ApiServerActions.ts',
  'src/app/dashboard/ApiServerActions.ts',
  'src/app/event/success/ApiServerActions.ts',
  'src/app/ApiServerActions.ts',
  'src/app/admin/promotion-emails/serverActions.ts',
  'src/app/admin/qrcode-scan/tickets/events/[eventId]/transactions/[transactionId]/ApiServerActions.ts',
  'src/app/admin/events/[id]/ticket-types/list/ApiServerActions.ts',
  'src/app/admin/events/[id]/tickets/list/ApiServerActions.ts',
  'src/app/admin/events/ApiServerActions.ts',
  'src/app/admin/events/[id]/discount-codes/list/ApiServerActions.ts',
  'src/app/api/tasks/route.ts',
  'src/app/api/event/success/process/route.ts',
  'src/app/api/billing/manage-subscription/route.ts',
  'src/app/api/billing/cancel-subscription/route.ts'
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Check if file already imports getAppUrl
    const hasGetAppUrlImport = content.includes('getAppUrl') || content.includes('@/lib/env');

    // Replace hardcoded NEXT_PUBLIC_APP_URL patterns
    const patterns = [
      {
        from: /const\s+(\w+)\s*=\s*process\.env\.NEXT_PUBLIC_APP_URL\s*\|\|\s*['"]http:\/\/localhost:3000['"]/g,
        to: 'const $1 = getAppUrl()'
      },
      {
        from: /const\s+(\w+)\s*=\s*process\.env\.NEXT_PUBLIC_APP_URL\s*\|\|\s*['"]http:\/\/localhost:3001['"]/g,
        to: 'const $1 = getAppUrl()'
      },
      {
        from: /let\s+(\w+)\s*=\s*process\.env\.NEXT_PUBLIC_APP_URL/g,
        to: 'let $1 = getAppUrl()'
      }
    ];

    patterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        updated = true;
      }
    });

    // Add import if needed
    if (updated && !hasGetAppUrlImport) {
      // Find the last import statement
      const importMatch = content.match(/(import.*?from.*?['"][^'"]*['"];?\s*)/g);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const newImport = lastImport.includes('@/lib/env')
          ? lastImport.replace('from \'@/lib/env\'', 'from \'@/lib/env\'')
          : lastImport.replace(';', '') + ', getAppUrl } from \'@/lib/env\';';

        content = content.replace(lastImport, newImport);
      } else {
        // Add import at the top if no imports exist
        content = 'import { getAppUrl } from \'@/lib/env\';\n' + content;
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing hardcoded NEXT_PUBLIC_APP_URL usage...\n');

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    updateFile(filePath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✅ All files updated!');