/**
 * One-time script: copy MOSC app files to Syro with style mapping and /mosc/ → /syro/ link rewrites.
 * Run from repo root: node scripts/copy-mosc-to-syro.js
 * Does not overwrite syro layout or header/footer. Skips files that are layout/global.
 */

const fs = require('fs');
const path = require('path');

const MOSC_ROOT = path.join(__dirname, '../src/app/mosc');
const SYRO_ROOT = path.join(__dirname, '../src/app/syro');

const STYLE_REPLACEMENTS = [
  [/\bbg-background\b/g, 'bg-syro-bg-gray'],
  [/\bfrom-background to-muted\b/g, 'from-syro-bg-gray to-syro-bg-gray'],
  [/\bbg-primary\/10\b/g, 'bg-syro-red/10'],
  [/\bsacred-shadow-lg\b/g, 'shadow-syro-card-hover'],
  [/\bborder-border\/50\b/g, 'border-syro-table-border'],
  [/\bborder-border\b/g, 'border-syro-table-border'],
  [/\btext-primary\b/g, 'text-syro-red'],
  [/\bfont-heading\b/g, 'font-syro-display'],
  [/\bfont-body\b/g, 'font-syro-primary'],
  [/\bfont-caption\b/g, 'font-syro-primary'],
  [/\btext-foreground\b/g, 'text-syro-blue'],
  [/\btext-muted-foreground\b/g, 'text-syro-dark-gray'],
  [/\bbg-card\b/g, 'bg-white'],
  [/\bsacred-shadow\b/g, 'shadow-syro-card'],
  [/\breverent-transition\b/g, 'transition-all duration-300'],
  [/\bhover:text-primary\b/g, 'hover:text-syro-red'],
  [/\bhover:bg-muted\b/g, 'hover:bg-syro-bg-gray'],
  [/\bborder-muted\/50\b/g, 'border-syro-table-border'],
  [/\bbg-primary\b/g, 'bg-syro-red'],
  [/\btext-primary-foreground\b/g, 'text-white'],
  [/\bbg-muted\/30\b/g, 'bg-syro-bg-gray'],
  [/\bbg-muted\b/g, 'bg-syro-bg-gray'],
];

function applyStyleMapping(content) {
  let out = content;
  for (const [re, replacement] of STYLE_REPLACEMENTS) {
    out = out.replace(re, replacement);
  }
  return out;
}

function applyLinkRewrites(content) {
  return content
    .replace(/href="\/mosc\//g, 'href="/syro/')
    .replace(/href: '\/mosc\//g, "href: '/syro/")
    .replace(/href='\/mosc\//g, "href='/syro/");
}

function fixImports(content, fileRelativePath) {
  let out = content;
  const dir = path.dirname(fileRelativePath);
  const segments = dir.split(path.sep).filter(Boolean);
  const depth = segments.length;
  const prefix = depth === 0 ? '.' : Array(depth).fill('..').join('/');
  const quickLinksPath = depth === 0 ? './components/QuickLinks' : `${prefix}/components/QuickLinks`;
  const synodPath = depth === 0 ? './components/SynodMembersSidebar' : `${prefix}/components/SynodMembersSidebar`;
  out = out.replace(/from\s+['"]@\/components\/holy-synod\/QuickLinks['"]/g, `from '${quickLinksPath}'`);
  out = out.replace(/from\s+['"]@\/components\/holy-synod\/SynodMembersSidebar['"]/g, `from '${synodPath}'`);
  return out;
}

function processFile(moscPath) {
  const relative = path.relative(MOSC_ROOT, moscPath);
  if (relative === 'layout.tsx') return; // do not overwrite syro root layout
  const syroPath = path.join(SYRO_ROOT, relative);
  if (!fs.existsSync(moscPath)) return;
  let content = fs.readFileSync(moscPath, 'utf8');
  content = applyStyleMapping(content);
  content = applyLinkRewrites(content);
  content = fixImports(content, relative);
  const dir = path.dirname(syroPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(syroPath, content, 'utf8');
  console.log('OK', relative);
}

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'components' && dir === MOSC_ROOT) continue; // already copied in Phase 2
      walkDir(full, callback);
    } else if (e.isFile() && (e.name.endsWith('.tsx') || e.name.endsWith('.ts'))) {
      callback(full);
    }
  }
}

// Copy root page and all sections (skip root layout; components already in Phase 2)
const rootPage = path.join(MOSC_ROOT, 'page.tsx');
if (fs.existsSync(rootPage)) processFile(rootPage);

const SECTIONS = [
  'the-church', 'administration', 'catholicate', 'holy-synod', 'dioceses', 'ecumenical', 'saints',
  'spiritual-organizations', 'institutions', 'theological-seminaries', 'training',
  'lectionary', 'gallery', 'photo-gallery', 'downloads', 'publications', 'news',
  'directory', 'calendar', 'contact-info', 'contact-form-email', 'email',
  'creator-analytics', 'speeches', 'sitemap', 'pilgrim-centres', 'utils'
];
for (const section of SECTIONS) {
  const sectionPath = path.join(MOSC_ROOT, section);
  if (!fs.existsSync(sectionPath)) continue;
  walkDir(sectionPath, processFile);
}
console.log('Done.');
