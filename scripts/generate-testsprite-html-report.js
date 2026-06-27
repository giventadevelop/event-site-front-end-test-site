#!/usr/bin/env node

/**
 * Generate HTML report from TestSprite test results
 *
 * This script generates a comprehensive HTML report from filtered test results,
 * making it easy to review failures and share with Cursor AI for fixes.
 *
 * Usage:
 *   node scripts/generate-testsprite-html-report.js [test-results-path] [output-path]
 *
 * Default paths:
 *   test-results: testsprite_tests/tmp/test_results.json
 *   output: testsprite_tests/tmp/test_report.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate HTML report from test results
 */
function generateHTMLReport(testResults, outputPath) {
  const timestamp = new Date().toLocaleString();
  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.testStatus === 'PASSED').length;
  const failedTests = testResults.filter(t => t.testStatus === 'FAILED').length;
  const filteredTests = testResults.filter(t => t.originalStatus === 'FAILED' && t.testStatus === 'PASSED').length;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

  // Extract console errors from testError field
  function extractConsoleErrors(errorText) {
    if (!errorText) return [];
    const lines = errorText.split('\n');
    const errors = [];
    let inConsoleLogs = false;

    for (const line of lines) {
      if (line.includes('Browser Console Logs:')) {
        inConsoleLogs = true;
        continue;
      }
      if (inConsoleLogs) {
        if (line.match(/^\[(ERROR|WARNING)\]/)) {
          errors.push(line.trim());
        }
      }
    }
    return errors;
  }

  // Format error text for display
  function formatErrorText(errorText) {
    if (!errorText) return '';
    return errorText
      .replace(/\n/g, '<br>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[ERROR\]/g, '<span class="error-badge">ERROR</span>')
      .replace(/\[WARNING\]/g, '<span class="warning-badge">WARNING</span>');
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TestSprite Test Report - ${timestamp}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f5f7fa;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }
        .summary {
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-left: 4px solid;
        }
        .summary-card.total { border-left-color: #3b82f6; }
        .summary-card.passed { border-left-color: #10b981; }
        .summary-card.failed { border-left-color: #ef4444; }
        .summary-card.filtered { border-left-color: #f59e0b; }
        .summary-card h3 {
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            margin-bottom: 10px;
        }
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
            color: #1f2937;
        }
        .summary-card.total .number { color: #3b82f6; }
        .summary-card.passed .number { color: #10b981; }
        .summary-card.failed .number { color: #ef4444; }
        .summary-card.filtered .number { color: #f59e0b; }
        .test-section {
            padding: 30px;
        }
        .test-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            transition: box-shadow 0.2s;
        }
        .test-item:hover {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .test-item.passed {
            border-left: 4px solid #10b981;
            background: #f0fdf4;
        }
        .test-item.failed {
            border-left: 4px solid #ef4444;
            background: #fef2f2;
        }
        .test-item.filtered {
            border-left: 4px solid #f59e0b;
            background: #fffbeb;
        }
        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .test-title {
            flex: 1;
        }
        .test-title h3 {
            font-size: 1.3em;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .test-title .test-id {
            font-family: monospace;
            font-size: 0.85em;
            color: #6b7280;
            margin-right: 10px;
        }
        .test-status-badge {
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.9em;
            white-space: nowrap;
        }
        .test-status-badge.passed {
            background: #d1fae5;
            color: #065f46;
        }
        .test-status-badge.failed {
            background: #fee2e2;
            color: #991b1b;
        }
        .test-status-badge.filtered {
            background: #fef3c7;
            color: #92400e;
        }
        .test-description {
            color: #6b7280;
            margin: 10px 0;
            font-size: 0.95em;
        }
        .test-error {
            margin-top: 15px;
            padding: 15px;
            background: #fff;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }
        .test-error h4 {
            color: #991b1b;
            margin-bottom: 10px;
            font-size: 1em;
        }
        .test-error-content {
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            color: #374151;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 400px;
            overflow-y: auto;
            padding: 10px;
            background: #f9fafb;
            border-radius: 4px;
        }
        .test-note {
            margin-top: 10px;
            padding: 10px;
            background: #fef3c7;
            border-left: 3px solid #f59e0b;
            border-radius: 4px;
            font-size: 0.9em;
            color: #92400e;
        }
        .test-visualization {
            margin-top: 10px;
        }
        .test-visualization a {
            color: #3b82f6;
            text-decoration: none;
            font-size: 0.9em;
        }
        .test-visualization a:hover {
            text-decoration: underline;
        }
        .error-badge {
            display: inline-block;
            padding: 2px 6px;
            background: #fee2e2;
            color: #991b1b;
            border-radius: 3px;
            font-size: 0.8em;
            font-weight: 600;
            margin-right: 5px;
        }
        .warning-badge {
            display: inline-block;
            padding: 2px 6px;
            background: #fef3c7;
            color: #92400e;
            border-radius: 3px;
            font-size: 0.8em;
            font-weight: 600;
            margin-right: 5px;
        }
        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6b7280;
            border-top: 1px solid #e9ecef;
            font-size: 0.9em;
        }
        .filter-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
            color: #92400e;
        }
        .filter-info h4 {
            margin-bottom: 8px;
            color: #78350f;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 TestSprite Test Report</h1>
            <p>Generated: ${timestamp}</p>
            <p>Project: mosc-temp</p>
        </div>

        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="summary-grid">
                <div class="summary-card total">
                    <h3>Total Tests</h3>
                    <div class="number">${totalTests}</div>
                </div>
                <div class="summary-card passed">
                    <h3>Passed</h3>
                    <div class="number">${passedTests}</div>
                </div>
                <div class="summary-card failed">
                    <h3>Failed</h3>
                    <div class="number">${failedTests}</div>
                </div>
                <div class="summary-card filtered">
                    <h3>Filtered</h3>
                    <div class="number">${filteredTests}</div>
                    <p style="font-size: 0.8em; margin-top: 5px; color: #6b7280;">Expected warnings</p>
                </div>
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <h3 style="color: #1f2937;">Success Rate: <span style="color: ${successRate >= 80 ? '#10b981' : successRate >= 50 ? '#f59e0b' : '#ef4444'}">${successRate}%</span></h3>
            </div>
        </div>

        ${filteredTests > 0 ? `
        <div class="test-section">
            <div class="filter-info">
                <h4>ℹ️ Filtered Tests</h4>
                <p>${filteredTests} test(s) were filtered because they only failed due to expected Next.js 15 warnings (headers() async error). These tests actually render correctly and can be considered passed.</p>
            </div>
        </div>
        ` : ''}

        <div class="test-section">
            <h2 style="margin-bottom: 20px; color: #1f2937;">📋 Test Results</h2>
            ${testResults.map(test => {
              const isFiltered = test.originalStatus === 'FAILED' && test.testStatus === 'PASSED';
              const statusClass = isFiltered ? 'filtered' : test.testStatus.toLowerCase();

              return `
            <div class="test-item ${statusClass}">
                <div class="test-header">
                    <div class="test-title">
                        <h3>
                            <span class="test-id">${test.testId || test.id || 'N/A'}</span>
                            ${test.title || 'Untitled Test'}
                        </h3>
                        ${test.description ? `<p class="test-description">${test.description}</p>` : ''}
                    </div>
                    <span class="test-status-badge ${statusClass}">
                        ${isFiltered ? 'FILTERED' : test.testStatus}
                    </span>
                </div>

                ${isFiltered ? `
                <div class="test-note">
                    <strong>ℹ️ Note:</strong> ${test.testNote || 'This test was filtered because it only failed due to expected warnings.'}
                    ${test.originalError ? `<br><br><strong>Original Error:</strong> ${formatErrorText(test.originalError.substring(0, 500))}${test.originalError.length > 500 ? '...' : ''}` : ''}
                </div>
                ` : ''}

                ${test.testError && !isFiltered ? `
                <div class="test-error">
                    <h4>❌ Test Error</h4>
                    <div class="test-error-content">${formatErrorText(test.testError)}</div>
                </div>
                ` : ''}

                ${test.testVisualization ? `
                <div class="test-visualization">
                    <a href="${test.testVisualization}" target="_blank">📹 View Test Video/Visualization</a>
                </div>
                ` : ''}
            </div>
            `;
            }).join('')}
        </div>

        <div class="footer">
            <p>Generated by TestSprite HTML Report Generator</p>
            ${filteredTests > 0 ? '<p>This report shows filtered test results after removing expected Next.js 15 warnings</p>' : '<p>This report shows all test results without filtering (unfiltered report)</p>'}
            <p style="margin-top: 10px; font-size: 0.85em;">
                <strong>How to use this report:</strong><br>
                Review failed tests below. Copy the error details and share with Cursor AI to fix issues.
            </p>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}

/**
 * Main function
 */
function main() {
  const testResultsPath = process.argv[2] || path.join(__dirname, '../testsprite_tests/tmp/test_results.json');
  const outputPath = process.argv[3] || path.join(__dirname, '../testsprite_tests/tmp/test_report.html');

  if (!fs.existsSync(testResultsPath)) {
    console.error(`❌ Test results file not found: ${testResultsPath}`);
    process.exit(1);
  }

  try {
    const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));

    if (!Array.isArray(testResults)) {
      console.error('❌ Test results must be an array');
      process.exit(1);
    }

    const htmlPath = generateHTMLReport(testResults, outputPath);

    console.log('\n✅ HTML report generated successfully!\n');
    console.log(`📄 Report location: ${htmlPath}`);
    console.log(`\n📊 Report Summary:`);
    console.log(`   Total tests: ${testResults.length}`);
    console.log(`   Passed: ${testResults.filter(t => t.testStatus === 'PASSED').length}`);
    console.log(`   Failed: ${testResults.filter(t => t.testStatus === 'FAILED').length}`);
    console.log(`   Filtered: ${testResults.filter(t => t.originalStatus === 'FAILED' && t.testStatus === 'PASSED').length}`);
    console.log(`\n💡 Tip: Open the HTML file in your browser to view the full report.`);
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

if (isMainModule || !process.argv[1] || process.argv[1].includes('generate-testsprite-html-report')) {
  main();
}

export { generateHTMLReport };



