#!/usr/bin/env node

/**
 * Generate HTML report from TestSprite test results WITHOUT filtering
 *
 * This script generates a comprehensive HTML report from raw test results,
 * showing ALL errors and warnings without any filtering.
 *
 * Usage:
 *   node scripts/generate-testsprite-html-report-unfiltered.js [test-results-path] [output-path]
 *
 * Default paths:
 *   test-results: testsprite_tests/tmp/test_results.json
 *   output: testsprite_tests/tmp/test_report_unfiltered.html
 *
 * Comparison:
 *   - filter-testsprite-errors.js: Filters expected errors, then generates HTML
 *   - generate-testsprite-html-report-unfiltered.js: Generates HTML directly without filtering
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHTMLReport } from './generate-testsprite-html-report.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main function
 */
function main() {
  const testResultsPath = process.argv[2] || path.join(__dirname, '../testsprite_tests/tmp/test_results.json');
  const outputPath = process.argv[3] || path.join(__dirname, '../testsprite_tests/tmp/test_report_unfiltered.html');

  if (!fs.existsSync(testResultsPath)) {
    console.error(`❌ Test results file not found: ${testResultsPath}`);
    console.error(`\n💡 Make sure you've run TestSprite tests first.`);
    console.error(`   The test results should be at: ${testResultsPath}\n`);
    process.exit(1);
  }

  try {
    const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));

    if (!Array.isArray(testResults)) {
      console.error('❌ Test results must be an array');
      process.exit(1);
    }

    console.log('📊 Generating unfiltered HTML report...');
    console.log(`   Reading from: ${testResultsPath}`);
    console.log(`   Writing to: ${outputPath}\n`);

    // Generate HTML report directly without filtering
    const htmlPath = generateHTMLReport(testResults, outputPath);

    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.testStatus === 'PASSED').length;
    const failedTests = testResults.filter(t => t.testStatus === 'FAILED').length;
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    console.log('\n✅ Unfiltered HTML report generated successfully!\n');
    console.log(`📄 Report location: ${htmlPath}`);
    console.log(`\n📊 Report Summary (Unfiltered - All Errors Shown):`);
    console.log(`   Total tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Success rate: ${successRate}%`);
    console.log(`\n💡 Note: This report shows ALL errors and warnings without filtering.`);
    console.log(`   For a filtered report (expected errors removed), use:`);
    console.log(`   node scripts/filter-testsprite-errors.js\n`);
    console.log(`💡 Tip: Open the HTML file in your browser to view the full report.`);
    console.log(`   You can share this report with Cursor AI to help fix any failures.\n`);

  } catch (error) {
    console.error(`❌ Error generating HTML report: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` ||
                     process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || !process.argv[1] || process.argv[1].includes('generate-testsprite-html-report-unfiltered')) {
  main();
}

export { main as generateUnfilteredHTMLReport };

