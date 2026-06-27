/**
 * One-off: fetch https://mosc.in/downloads/ and list hrefs for building url-list.json.
 * Run: node scripts/mosc-in-migration/_scrape-downloads-page-once.mjs
 */
const PAGE = 'https://mosc.in/downloads/';

const res = await fetch(PAGE, {
  headers: { 'User-Agent': 'MOSC-MigrationScript/1.0 (url-list generator; +project)' },
});
const html = await res.text();
const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);
const abs = new Set();
for (const h of hrefs) {
  try {
    const x = new URL(h, PAGE);
    if (x.hostname.endsWith('mosc.in')) abs.add(x.href.split('#')[0]);
  } catch {
    /* ignore */
  }
}

const exts = /\.(pdf|zip|rar|7z|docx?|xlsx?|pptx?|csv)(\?|$)/i;
const keywords = /uploads|download|media|wp-content|\.pdf|\.zip/i;
const list = [...abs].filter((u) => exts.test(u) || keywords.test(u));
list.sort();

console.log(JSON.stringify({ count: list.length, sample: list.slice(0, 15) }, null, 2));
for (const u of list) console.log(u);
