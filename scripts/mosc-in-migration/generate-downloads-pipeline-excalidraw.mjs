#!/usr/bin/env node
/**
 * Generates documentation/mosc_document_downloads_page/downloads_migration_pipeline.excalidraw
 * Run: node scripts/mosc-in-migration/generate-downloads-pipeline-excalidraw.mjs
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../../documentation/mosc_document_downloads_page/downloads_migration_pipeline.excalidraw');

let seed = 1;
const id = () => `dl-${seed++}`;

function rect(x, y, w, h, label, bg = '#a5d8ff', stroke = '#1971c2') {
  const rid = id();
  const tid = id();
  return [
    {
      id: rid,
      type: 'rectangle',
      x,
      y,
      width: w,
      height: h,
      angle: 0,
      strokeColor: stroke,
      backgroundColor: bg,
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      roundness: { type: 3 },
      seed: seed++,
      version: 1,
      versionNonce: seed++,
      isDeleted: false,
      boundElements: [{ type: 'text', id: tid }],
    },
    {
      id: tid,
      type: 'text',
      x: x + 8,
      y: y + 8,
      width: w - 16,
      height: h - 16,
      angle: 0,
      strokeColor: '#1e1e1e',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      roundness: null,
      seed: seed++,
      version: 1,
      versionNonce: seed++,
      isDeleted: false,
      text: label,
      fontSize: 14,
      fontFamily: 3,
      textAlign: 'left',
      verticalAlign: 'top',
      containerId: rid,
      originalText: label,
      autoResize: true,
      lineHeight: 1.25,
    },
  ];
}

function title(x, y, text) {
  const tid = id();
  return {
    id: tid,
    type: 'text',
    x,
    y,
    width: 900,
    height: 28,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    roundness: null,
    seed: seed++,
    version: 1,
    versionNonce: seed++,
    isDeleted: false,
    text,
    fontSize: 22,
    fontFamily: 3,
    textAlign: 'left',
    verticalAlign: 'top',
    containerId: null,
    originalText: text,
    autoResize: true,
    lineHeight: 1.25,
  };
}

function arrow(x1, y1, x2, y2, label = '') {
  const aid = id();
  const elements = [
    {
      id: aid,
      type: 'arrow',
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
      angle: 0,
      strokeColor: '#495057',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      roundness: { type: 2 },
      seed: seed++,
      version: 1,
      versionNonce: seed++,
      isDeleted: false,
      points: [
        [0, 0],
        [x2 - x1, y2 - y1],
      ],
      startArrowhead: null,
      endArrowhead: 'arrow',
    },
  ];
  if (label) {
    elements.push({
      id: id(),
      type: 'text',
      x: (x1 + x2) / 2 - 40,
      y: (y1 + y2) / 2 - 20,
      width: 120,
      height: 20,
      angle: 0,
      strokeColor: '#495057',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 0,
      opacity: 100,
      roundness: null,
      seed: seed++,
      version: 1,
      versionNonce: seed++,
      isDeleted: false,
      text: label,
      fontSize: 12,
      fontFamily: 3,
      textAlign: 'center',
      verticalAlign: 'middle',
      containerId: null,
      originalText: label,
      autoResize: true,
      lineHeight: 1.25,
    });
  }
  return elements;
}

const elements = [];

elements.push(title(40, 20, 'MOSC Downloads — Scrape → Upload → Public Page (full pipeline)'));

// Phase headers
const phases = [
  [40, 60, '① SOURCE', '#fff3bf'],
  [280, 60, '② SCRAPE & MANIFEST', '#d0ebff'],
  [560, 60, '③ LOCAL FILES', '#b2f2bb'],
  [780, 60, '④ UPLOAD SCRIPTS', '#ffec99'],
  [1040, 60, '⑤ BACKEND', '#ffc9c9'],
  [1320, 60, '⑥ PUBLIC UI', '#e9ecef'],
];
for (const [x, y, label, bg] of phases) {
  elements.push(...rect(x, y, 200, 36, label, bg, '#868e96'));
}

// Source
elements.push(
  ...rect(
    40,
    110,
    220,
    100,
    '🌐 mosc.in\n/downloads/\n+ subsection pages\n(PDF, XLSX, DOC, …)',
    '#fff9db',
    '#f08c00'
  )
);
elements.push(
  ...rect(
    40,
    230,
    220,
    90,
    '📁 Legacy HTML mirror\n(code_clone_ref/mosc_in/downloads)\nUsed offline by manifest builders',
    '#fff9db',
    '#f08c00'
  )
);

// Scrape scripts
elements.push(
  ...rect(
    280,
    110,
    240,
    130,
    '_scrape-downloads-deep.mjs\n• GET mosc.in/downloads + subpages\n• lib/legacy-downloads-html.mjs\n• legacy-page-category-map.json\n• malankara-category-map.json\n→ url-list.mosc-in.generated.json',
    '#d0ebff'
  )
);
elements.push(
  ...rect(
    280,
    260,
    240,
    110,
    'build-full-downloads-manifest.mjs\n• Parse legacy HTML (+ --fetch-live)\n• hierarchyPath from link labels\n→ url-list.full-remapped.json',
    '#d0ebff'
  )
);
elements.push(
  ...rect(
    280,
    390,
    240,
    90,
    'build-malankara-manifest.mjs\n→ url-list.malankara-remapped.json',
    '#d0ebff'
  )
);
elements.push(
  ...rect(
    280,
    500,
    240,
    70,
    'mirror-downloads-tree.mjs\n(title/subtitle folder layout)',
    '#d0ebff'
  )
);

// Local disk
elements.push(
  ...rect(
    560,
    110,
    200,
    100,
    'fetch-urls.mjs\n• robots.mjs (robots.txt)\n• MOSC_DOWNLOAD_ROOT\n/<categorySlug>/<year>/<file>',
    '#b2f2bb',
    '#2f9e44'
  )
);
elements.push(
  ...rect(
    560,
    230,
    200,
    80,
    'Manifest JSON items:\nurl, categorySlug, year,\nfilename, hierarchyPath',
    '#b2f2bb',
    '#2f9e44'
  )
);
elements.push(
  ...rect(
    560,
    330,
    200,
    90,
    'seed-*-categories.mjs\nrun-seed-categories.mjs\n(SQL + API category seeds)',
    '#b2f2bb',
    '#2f9e44'
  )
);

// Upload scripts
elements.push(
  ...rect(
    780,
    110,
    240,
    200,
    'upload-manifest-to-official-docs.mjs\n(Primary path)\n• migration-api-lib.mjs\n• official-docs-query.mjs\n• official-doc-dedupe.mjs\n• dedupe manifest + DB before upload\n• Category covers → thumbnails\n• Year bundle cover assignment',
    '#ffec99',
    '#e67700'
  )
);
elements.push(
  ...rect(
    780,
    330,
    240,
    80,
    'upload-mirror-to-official-docs.mjs\n(mirror tree → official docs)',
    '#ffec99',
    '#e67700'
  )
);
elements.push(
  ...rect(
    780,
    430,
    240,
    80,
    'purge-duplicate-official-docs.mjs\nDELETE dup rows\n(logical: category+treePath)',
    '#ffec99',
    '#e67700'
  )
);
elements.push(
  ...rect(
    780,
    530,
    240,
    70,
    'Admin UI (optional)\n/admin/official-documents\nPOST …/bulk-tenant-official',
    '#ffec99',
    '#e67700'
  )
);

// Backend
elements.push(
  ...rect(
    1040,
    110,
    260,
    90,
    'Spring Boot REST API\n(NEXT_PUBLIC_API_BASE_URL :8080)\nService JWT: POST /api/authenticate\nHeaders: Authorization + X-Tenant-ID',
    '#ffc9c9',
    '#c92a2a'
  )
);
elements.push(
  ...rect(
    1040,
    220,
    260,
    180,
    'Upload APIs:\nPOST /api/event-medias/upload/tenant-official-document\nPATCH /api/event-medias/{id}\nPOST …/upload-official-document-thumbnail\n\nCatalog APIs:\nGET/POST /api/official-document-categories\nGET/POST/PATCH official-document-year-bundles\nGET event-medias?eventMediaType=TENANT_OFFICIAL_DOCUMENT\nDELETE /api/event-medias/{id}',
    '#ffc9c9',
    '#c92a2a'
  )
);
elements.push(
  ...rect(
    1040,
    420,
    260,
    120,
    'Database (tenant-scoped)\n• event_media (type=TENANT_OFFICIAL_DOCUMENT)\n• official_document_category\n• official_document_year_bundle\nFields: hierarchyPath, officialDocumentYear,\nfileUrl, displayPriority, description markers',
    '#ffc9c9',
    '#c92a2a'
  )
);
elements.push(
  ...rect(
    1040,
    560,
    260,
    70,
    'AWS S3 — eventapp-media-bucket\n…/official_document/{categorySlug}/{year}/…',
    '#ffc9c9',
    '#c92a2a'
  )
);

// Public UI
elements.push(
  ...rect(
    1320,
    110,
    280,
    100,
    'Next.js server\nApiServerActions.ts\nGET /api/event-medias/public-official-documents\n(fetchWithJwtRetry + tenantId)',
    '#e9ecef',
    '#495057'
  )
);
elements.push(
  ...rect(
    1320,
    230,
    280,
    110,
    'Dedupe + search\n• deduplicateOfficialDocuments.ts\n• downloadSearch.ts\n(category + treePath logical key)',
    '#e9ecef',
    '#495057'
  )
);
elements.push(
  ...rect(
    1320,
    360,
    280,
    90,
    '/mosc-redesign/downloads\nDownloadsPageClient.tsx\nYear/category filters + search + cards',
    '#e9ecef',
    '#495057'
  )
);
elements.push(
  ...rect(
    1320,
    470,
    280,
    100,
    'Public download proxy\n/api/public/official-documents/{id}/download\n/api/public/official-documents/{id}/thumbnail',
    '#e9ecef',
    '#495057'
  )
);

// Arrows - horizontal flow
elements.push(...arrow(260, 160, 280, 160, 'scrape'));
elements.push(...arrow(520, 160, 560, 160, 'fetch'));
elements.push(...arrow(760, 160, 780, 160, 'upload'));
elements.push(...arrow(1020, 200, 1040, 200, 'REST'));
elements.push(...arrow(1300, 250, 1320, 250, 'read'));

elements.push(...arrow(260, 270, 280, 300, 'HTML'));
elements.push(...arrow(520, 280, 780, 200, 'manifest'));
elements.push(...arrow(1020, 400, 1040, 480, 'persist'));
elements.push(...arrow(1170, 590, 1170, 620, 'files'));
elements.push(...arrow(1460, 210, 1460, 360, 'render'));

// npm shortcuts box
elements.push(
  ...rect(
    40,
    620,
    620,
    200,
    'npm shortcuts (package.json)\nmosc:migration:full:manifest → build manifest\nmosc:migration:full:fetch → download PDFs\nmosc:migration:full:upload → upload-manifest\nmosc:migration:purge-duplicates → DB cleanup\nmosc:migration:malankara:* → Malankara subset\n\nEnv: MOSC_DOWNLOAD_ROOT, NEXT_PUBLIC_TENANT_ID,\nAPI_JWT_USER/PASS, NEXT_PUBLIC_API_BASE_URL',
    '#f8f9fa',
    '#868e96'
  )
);

elements.push(
  ...rect(
    700,
    620,
    560,
    200,
    'Dedupe strategy (prevent + fix duplicates)\n• Re-uploads get new S3 URL + suffixed filename\n• Logical key: officialDocumentCategoryId + hierarchyPath\n• Upload: deduplicateManifestItems + DB skip (--missing-only too)\n• Public page: deduplicateOfficialDocumentTreeItems\n• Purge: purge-duplicate-official-docs.mjs --confirm\n\nExample: FCRA manifest has 10 files; DB had 50 rows before purge',
    '#fff5f5',
    '#e03131'
  )
);

elements.push(
  ...rect(
    1300,
    620,
    300,
    200,
    'Docs & refs\nscripts/mosc-in-migration/README.md\nDUPLICATE_OFFICIAL_DOCUMENTS.md\nMOSC_Document_Download_User_Manual.html\n.cursor/rules (proxy vs direct JWT)',
    '#f8f9fa',
    '#868e96'
  )
);

const doc = {
  type: 'excalidraw',
  version: 2,
  source: 'https://excalidraw.com',
  elements,
  appState: {
    gridSize: 20,
    gridStep: 5,
    gridModeEnabled: false,
    viewBackgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0,
    zoom: { value: 0.65 },
  },
  files: {},
};

await writeFile(OUT, JSON.stringify(doc, null, 2), 'utf8');
console.log('Wrote', OUT);
