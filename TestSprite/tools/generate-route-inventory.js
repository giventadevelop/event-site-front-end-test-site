#!/usr/bin/env node

/**
 * Walks src/app page.tsx files and emits TestSprite/generated/route-inventory.json
 *
 * Usage: node TestSprite/tools/generate-route-inventory.js
 *        npm run test:inventory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, 'src', 'app');
const OUT_DIR = path.join(ROOT, 'TestSprite', 'generated');
const OUT_FILE = path.join(OUT_DIR, 'route-inventory.json');

/** Route group folders like (auth), (syro) are omitted from the URL */
function isRouteGroup(segment) {
  return segment.startsWith('(') && segment.endsWith(')');
}

/** Convert filesystem path under src/app to a URL path */
function fileToRoute(relFromApp) {
  // relFromApp e.g. admin/manage-events/page.tsx or (auth)/sign-in/[[...sign-in]]/page.tsx
  const parts = relFromApp.split(/[/\\]/).filter(Boolean);
  if (parts[parts.length - 1] !== 'page.tsx') return null;
  parts.pop(); // remove page.tsx

  const urlParts = [];
  let dynamic = false;
  const dynamicParams = [];

  for (const seg of parts) {
    if (isRouteGroup(seg)) continue;
    if (seg.startsWith('[[...') && seg.endsWith(']]')) {
      dynamic = true;
      const name = seg.slice(5, -2);
      dynamicParams.push(name);
      urlParts.push(`[[...${name}]]`);
      continue;
    }
    if (seg.startsWith('[...') && seg.endsWith(']')) {
      dynamic = true;
      const name = seg.slice(4, -1);
      dynamicParams.push(name);
      urlParts.push(`[...${name}]`);
      continue;
    }
    if (seg.startsWith('[') && seg.endsWith(']')) {
      dynamic = true;
      const name = seg.slice(1, -1);
      dynamicParams.push(name);
      urlParts.push(`[${name}]`);
      continue;
    }
    urlParts.push(seg);
  }

  const routePath = '/' + urlParts.join('/');
  return {
    path: routePath === '/' ? '/' : routePath.replace(/\/+/g, '/'),
    dynamic,
    dynamicParams,
  };
}

function classifyKind(routePath) {
  if (routePath === '/admin' || routePath.startsWith('/admin/')) return 'admin';
  if (routePath === '/mosc-redesign' || routePath.startsWith('/mosc-redesign/')) return 'mosc-redesign';
  if (routePath === '/mosc-old' || routePath.startsWith('/mosc-old/')) return 'mosc-old';
  if (routePath === '/mosc' || routePath.startsWith('/mosc/')) return 'mosc';
  return 'public';
}

function walkPageFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPageFiles(full, acc);
    } else if (entry.name === 'page.tsx') {
      acc.push(full);
    }
  }
  return acc;
}

function main() {
  const files = walkPageFiles(APP_DIR);
  const routes = [];
  const seen = new Set();

  for (const file of files) {
    const rel = path.relative(APP_DIR, file).replace(/\\/g, '/');
    const parsed = fileToRoute(rel);
    if (!parsed) continue;
    const key = parsed.path;
    if (seen.has(key)) continue;
    seen.add(key);

    routes.push({
      path: parsed.path,
      kind: classifyKind(parsed.path),
      dynamic: parsed.dynamic,
      dynamicParams: parsed.dynamicParams,
      sourceFile: `src/app/${rel}`,
    });
  }

  routes.sort((a, b) => a.path.localeCompare(b.path));

  const byKind = {};
  for (const r of routes) {
    byKind[r.kind] = (byKind[r.kind] || 0) + 1;
  }

  const inventory = {
    generatedAt: new Date().toISOString(),
    root: 'src/app',
    totalPages: files.length,
    totalUniqueRoutes: routes.length,
    byKind,
    routes,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(inventory, null, 2), 'utf8');

  console.log(`[inventory] Wrote ${OUT_FILE}`);
  console.log(`[inventory] page.tsx files: ${files.length}`);
  console.log(`[inventory] unique routes: ${routes.length}`);
  console.log(`[inventory] by kind:`, byKind);
}

main();
