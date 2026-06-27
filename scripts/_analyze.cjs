const fs = require('fs');
const { execSync } = require('child_process');
const files = execSync('grep -rl "process.env.NEXT_PUBLIC_API_BASE_URL" src/ --include="*.ts" --include="*.tsx"', { encoding: 'utf-8' })
  .trim().split('\n').map(f => f.trim()).filter(Boolean);

const skipPatterns = [
  'lib/env.ts', 'lib/proxyHandler.ts', 'lib/api/jwt.ts',
  'proxy/user-tasks/', 'services/api/apiClient.ts', '__tests__/',
  'layout.tsx', 'webhooks/stripe/route.ts', 'profile/actions.ts',
  'billing/cancel-subscription/route.ts',
  'app/ApiServerActions.ts', 'admin/ApiServerActions.ts',
  'ProfileBootstrapperApiServerActions.ts',
  'admin/promotion-emails/ApiServerActions.ts',
  'sponsors/ApiServerActions.ts',
  'sponsors/page.tsx',
  'admin/sales-analytics/ApiServerActions.ts',
  'tickets/list/ApiServerActions.ts',
  'admin/manual-payments/ApiServerActions.ts',
];

const remaining = files.filter(f => !skipPatterns.some(p => f.includes(p)));

remaining.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  const re = /import\s*\{([^}]+)\}\s*from\s*['"]@\/lib\/env['"]/;
  const envImportMatch = content.match(re);
  const hasEnvImport = !!envImportMatch;
  const importedNames = hasEnvImport ? envImportMatch[1].trim() : '';
  const alreadyHas = importedNames.includes('getApiBaseUrl');
  const sep = '|||';
  console.log(f + sep + (hasEnvImport ? 'Y' : 'N') + sep + (alreadyHas ? 'DONE' : 'NEED') + sep + importedNames);
});
