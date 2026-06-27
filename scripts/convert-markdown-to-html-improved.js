#!/usr/bin/env node

/**
 * Improved Markdown to HTML converter
 * Better handling of tables, code blocks, lists, and formatting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function markdownToHtml(markdown) {
  let html = markdown;
  const lines = html.split('\n');
  const output = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent = [];
  let inTable = false;
  let tableRows = [];
  let tableHeaders = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const code = codeBlockContent.join('\n');
        output.push(`<pre><code class="language-${codeBlockLang}">${escapeHtml(code)}</code></pre>`);
        codeBlockContent = [];
        codeBlockLang = '';
        inCodeBlock = false;
      } else {
        // Start code block
        codeBlockLang = line.trim().substring(3).trim() || 'text';
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Tables
    if (line.includes('|') && !line.trim().startsWith('|--')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
        tableHeaders = [];
      }

      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length > 0) {
        // Check if next line is separator (---)
        if (nextLine.includes('---') || nextLine.includes('|--')) {
          tableHeaders = cells;
          i++; // Skip separator line
        } else {
          tableRows.push(cells);
        }
      }
      continue;
    } else if (inTable && tableRows.length > 0) {
      // End table
      let tableHtml = '<table>\n';
      if (tableHeaders.length > 0) {
        tableHtml += '<thead><tr>';
        tableHeaders.forEach(header => {
          tableHtml += `<th>${escapeHtml(header)}</th>`;
        });
        tableHtml += '</tr></thead>\n';
      }
      tableHtml += '<tbody>\n';
      tableRows.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => {
          tableHtml += `<td>${processInlineMarkdown(cell)}</td>`;
        });
        tableHtml += '</tr>\n';
      });
      tableHtml += '</tbody></table>';
      output.push(tableHtml);
      inTable = false;
      tableRows = [];
      tableHeaders = [];
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      output.push(`<h3>${processInlineMarkdown(line.substring(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      output.push(`<h2>${processInlineMarkdown(line.substring(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      output.push(`<h1>${processInlineMarkdown(line.substring(2))}</h1>`);
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      output.push('<hr>');
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      output.push('');
      continue;
    }

    // Lists
    if (line.match(/^[\-\*\+]\s/)) {
      const content = line.substring(2).trim();
      output.push(`<li>${processInlineMarkdown(content)}</li>`);
      continue;
    }

    if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, '').trim();
      output.push(`<li>${processInlineMarkdown(content)}</li>`);
      continue;
    }

    // Regular paragraph
    if (line.trim()) {
      output.push(processInlineMarkdown(line));
    }
  }

  // Close any open code block
  if (inCodeBlock && codeBlockContent.length > 0) {
    const code = codeBlockContent.join('\n');
    output.push(`<pre><code class="language-${codeBlockLang}">${escapeHtml(code)}</code></pre>`);
  }

  // Process lists
  let result = output.join('\n');

  // Wrap consecutive <li> in <ul> or <ol>
  result = result.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
    if (match.includes('<ul>') || match.includes('<ol>')) return match;
    // Check if previous context suggests ordered list
    const beforeMatch = result.substring(0, result.indexOf(match));
    const isOrdered = /\d+\./.test(beforeMatch.split('\n').pop() || '');
    return isOrdered ? `<ol>${match}</ol>` : `<ul>${match}</ul>`;
  });

  // Wrap paragraphs
  result = result.split('\n').map(line => {
    if (line.trim() === '') return '';
    if (line.startsWith('<')) return line; // Already HTML
    if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().match(/^\d+\./)) {
      return line; // List item, will be processed
    }
    return `<p>${line}</p>`;
  }).join('\n');

  return result;
}

function processInlineMarkdown(text) {
  if (!text) return '';

  // Bold (**text**)
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic (*text* but not **text**)
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Inline code (`code`)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return text;
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
            line-height: 1.8;
            color: #2c3e50;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 50px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        h1 {
            color: #2c3e50;
            border-bottom: 4px solid #3498db;
            padding-bottom: 15px;
            margin-bottom: 30px;
            font-size: 2.8em;
            font-weight: 700;
        }

        h2 {
            color: #34495e;
            margin-top: 50px;
            margin-bottom: 25px;
            font-size: 2.2em;
            font-weight: 600;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }

        h3 {
            color: #555;
            margin-top: 35px;
            margin-bottom: 20px;
            font-size: 1.6em;
            font-weight: 600;
        }

        p {
            margin-bottom: 18px;
            text-align: justify;
            font-size: 1.05em;
        }

        ul, ol {
            margin: 20px 0;
            padding-left: 40px;
        }

        li {
            margin-bottom: 10px;
            line-height: 1.8;
        }

        code {
            background-color: #f4f4f4;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
            font-size: 0.9em;
            color: #e83e8c;
            border: 1px solid #e1e8ed;
        }

        pre {
            background: linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%);
            color: #f8f8f2;
            padding: 25px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 25px 0;
            border-left: 5px solid #3498db;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        pre code {
            background: none;
            padding: 0;
            color: inherit;
            font-size: 0.95em;
            border: none;
            white-space: pre;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        table thead {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        }

        table th {
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 1.05em;
        }

        table td {
            padding: 15px;
            border-bottom: 1px solid #e1e8ed;
            background: white;
        }

        table tbody tr:hover {
            background-color: #f8f9fa;
        }

        table tbody tr:last-child td {
            border-bottom: none;
        }

        a {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        a:hover {
            color: #2980b9;
            text-decoration: underline;
        }

        hr {
            border: none;
            border-top: 3px solid #ecf0f1;
            margin: 40px 0;
            border-radius: 2px;
        }

        blockquote {
            border-left: 5px solid #3498db;
            padding: 15px 25px;
            margin: 25px 0;
            background-color: #f8f9fa;
            color: #555;
            font-style: italic;
            border-radius: 4px;
        }

        strong {
            color: #2c3e50;
            font-weight: 700;
        }

        em {
            color: #555;
            font-style: italic;
        }

        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }

            h1 {
                font-size: 2em;
            }

            h2 {
                font-size: 1.6em;
            }

            h3 {
                font-size: 1.3em;
            }
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
    const title = path.basename(mdPath, '.md')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const htmlContent = markdownToHtml(markdown);
    const fullHtml = createHtmlDocument(title, htmlContent);

    fs.writeFileSync(htmlPath, fullHtml, 'utf8');
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

  console.log('📄 Converting Markdown files to HTML (Improved)...\n');

  let successCount = 0;
  let failCount = 0;

  files.forEach(file => {
    const mdPath = path.join(docDir, file);
    const htmlPath = path.join(docDir, file.replace('.md', '.html'));

    if (fs.existsSync(mdPath)) {
      if (convertMarkdownFile(mdPath, htmlPath)) {
        console.log(`✅ Converted: ${file} → ${file.replace('.md', '.html')}`);
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
  console.log(`\n💡 Open any HTML file in your browser to view the formatted documentation.`);
}

main();



