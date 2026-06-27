#!/usr/bin/env node

/**
 * Convert Markdown files to HTML with preserved formatting
 * Converts all .md files in testsprite_tests/documentation (excluding temp_docs) to HTML
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Markdown to HTML converter
function markdownToHtml(markdown) {
  let html = markdown;

  // Escape HTML entities first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore code blocks (they should not be escaped)
  html = html.replace(/&lt;code&gt;(.*?)&lt;\/code&gt;/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic (*text*)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Code blocks (```language ... ```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'text';
    return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // Unordered lists (- or *)
  html = html.replace(/^[\-\*] (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return '<ul>' + match + '</ul>';
  });

  // Ordered lists (1. 2. etc)
  html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    if (match.includes('<ul>')) return match; // Already processed
    return '<ol>' + match + '</ol>';
  });

  // Tables
  html = html.replace(/\|(.+)\|/g, (match, content) => {
    const cells = content.split('|').map(cell => cell.trim()).filter(cell => cell);
    if (cells.length === 0) return '';

    // Check if it's a header row (next line has dashes)
    const isHeader = match.includes('---') || match.includes('|--');
    if (isHeader) return '';

    return '<tr>' + cells.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
  });

  // Wrap tables
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (match) => {
    if (match.includes('<table>')) return match;
    return '<table>' + match + '</table>';
  });

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Horizontal rules (---)
  html = html.replace(/^---$/gim, '<hr>');

  // Line breaks (double newline = paragraph)
  html = html.split('\n\n').map(para => {
    if (para.trim().startsWith('<')) return para; // Already HTML
    if (para.trim() === '') return '';
    return '<p>' + para.trim() + '</p>';
  }).join('\n');

  // Single line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createHtmlDocument(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
            font-size: 2.5em;
        }

        h2 {
            color: #34495e;
            margin-top: 40px;
            margin-bottom: 20px;
            font-size: 2em;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 8px;
        }

        h3 {
            color: #555;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.5em;
        }

        p {
            margin-bottom: 15px;
            text-align: justify;
        }

        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }

        li {
            margin-bottom: 8px;
        }

        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #e83e8c;
        }

        pre {
            background-color: #2d2d2d;
            color: #f8f8f2;
            padding: 20px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 20px 0;
            border-left: 4px solid #3498db;
        }

        pre code {
            background: none;
            padding: 0;
            color: inherit;
            font-size: 0.9em;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        table th {
            background-color: #3498db;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }

        table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }

        table tr:hover {
            background-color: #f5f5f5;
        }

        a {
            color: #3498db;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 30px 0;
        }

        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin: 20px 0;
            color: #666;
            font-style: italic;
        }

        .emoji {
            font-size: 1.2em;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 0.85em;
            font-weight: 600;
            margin: 0 4px;
        }

        .badge-success {
            background-color: #27ae60;
            color: white;
        }

        .badge-error {
            background-color: #e74c3c;
            color: white;
        }

        .badge-warning {
            background-color: #f39c12;
            color: white;
        }

        .badge-info {
            background-color: #3498db;
            color: white;
        }

        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>`;
}

function convertMarkdownFile(mdPath, htmlPath) {
  try {
    const markdown = fs.readFileSync(mdPath, 'utf8');
    const title = path.basename(mdPath, '.md').replace(/_/g, ' ').replace(/-/g, ' ');
    const htmlContent = markdownToHtml(markdown);
    const fullHtml = createHtmlDocument(title, htmlContent);

    fs.writeFileSync(htmlPath, fullHtml, 'utf8');
    console.log(`✅ Converted: ${path.basename(mdPath)} → ${path.basename(htmlPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error converting ${mdPath}:`, error.message);
    return false;
  }
}

function main() {
  const docDir = path.join(__dirname, '../testsprite_tests/documentation');
  const files = [
    'HOW_TO_REUSE_TESTS.md',
    'HOW_TO_TRIGGER_TESTS_FROM_CURSOR_AI.md',
    'HOW_TO_VERIFY_TEST_COMPLETION_AND_TEST_PLAN.md',
    'PUBLIC_PAGES_TEST_INSTRUCTIONS.md',
    'TESTSPRITE_SOLUTION_SUMMARY.md'
  ];

  console.log('📄 Converting Markdown files to HTML...\n');

  let successCount = 0;
  let failCount = 0;

  files.forEach(file => {
    const mdPath = path.join(docDir, file);
    const htmlPath = path.join(docDir, file.replace('.md', '.html'));

    if (fs.existsSync(mdPath)) {
      if (convertMarkdownFile(mdPath, htmlPath)) {
        successCount++;
      } else {
        failCount++;
      }
    } else {
      console.warn(`⚠️  File not found: ${file}`);
      failCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully converted: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`\n📁 HTML files saved to: ${docDir}`);
}

main();



