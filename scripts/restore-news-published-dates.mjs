/**
 * DEPRECATED for Strapi 5 draft & publish: REST PUT resets publishedAt to "now"
 * and can drop tenant from the published row.
 *
 * Use instead:
 *   node scripts/fix-news-published-dates-sqlite.mjs --apply
 */
console.error(
  'Do not use this script against Strapi 5 (REST PUT overwrites publishedAt).\n' +
    'Run: node scripts/fix-news-published-dates-sqlite.mjs [--apply]'
);
process.exit(1);
