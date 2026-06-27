#!/usr/bin/env node
/**
 * Print SalesIQ department and article category IDs for bulk upload env vars.
 *
 * Usage:
 *   npm run zobot:list-portal-ids
 */

import { loadZohoEnv, getSalesIqConfig } from './load-zoho-env.mjs';
import { listArticleCategories, listDepartments, listFaqCategories } from './zoho-salesiq-api.mjs';

async function main() {
  const envPath = loadZohoEnv();
  const { screenName } = getSalesIqConfig();
  if (envPath) console.log(`Loaded env from: ${envPath}`);
  console.log(`Portal: ${screenName}\n`);

  console.log('\nArticle categories:');
  let departmentsFromCategories = [];
  try {
    const categories = await listArticleCategories(screenName);
    if (!categories.length) console.log('  (none)');
    for (const c of categories) {
      const deptNote = c.department_id ? `  dept_id=${c.department_id}` : '';
      console.log(`  ${c.id}  ${c.name}${c.is_default === 'true' || c.is_default === true ? ' (default)' : ''}${deptNote}`);
      if (c.department_id) departmentsFromCategories.push(String(c.department_id));
    }

    console.log('\nSuggested .env.local lines:');
    const general = categories.find((c) => String(c.name || '').toLowerCase() === 'general');
    if (general?.department_id) console.log(`ZOHO_SALESIQ_DEPARTMENT_ID=${general.department_id}`);
    if (general?.id) console.log(`ZOHO_SALESIQ_CATEGORY_ID=${general.id}`);
  } catch (error) {
    console.error(`  Error: ${error instanceof Error ? error.message : error}`);
  }

  console.log('\nFAQ categories (requires SalesIQ.faqs.READ scope):');
  try {
    const faqCategories = await listFaqCategories(screenName);
    if (!faqCategories.length) console.log('  (none)');
    for (const c of faqCategories) {
      console.log(
        `  ${c.id}  ${c.name}${c.is_default === 'true' || c.is_default === true ? ' (default)' : ''}${c.faq_count != null ? `  faqs=${c.faq_count}` : ''}`,
      );
    }
    const faqGeneral = faqCategories.find((c) => String(c.name || '').toLowerCase() === 'general');
    if (faqGeneral?.id) {
      console.log('\nSuggested FAQ .env.local line:');
      console.log(`ZOHO_SALESIQ_FAQ_CATEGORY_ID=${faqGeneral.id}`);
    }
  } catch (error) {
    console.error(`  Error: ${error instanceof Error ? error.message : error}`);
  }

  console.log('\nDepartments (requires SalesIQ.departments.READ scope):');
  try {
    const departments = await listDepartments(screenName);
    if (!departments.length) console.log('  (none)');
    for (const d of departments) {
      console.log(`  ${d.id}  ${d.display_name || d.name}`);
    }
  } catch (error) {
    console.error(`  Error: ${error instanceof Error ? error.message : error}`);
    if (departmentsFromCategories.length) {
      console.log(`  Use department_id from category above: ${departmentsFromCategories[0]}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
