#!/usr/bin/env node

/**
 * Convert a single markdown file to HTML
 * Usage: node scripts/convert-single-markdown.js <input.md> [output.html]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import functions from the main converter
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function processInlineMarkdown(text) {
  if (!text) return '';

  // Inline code first (to avoid conflicts)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold (**text**)
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic (*text* but not **text**)
  text = text.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return text;
}

function markdownToHtml(markdown) {
  const lines = markdown.split('\n');
  const output = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent = [];
  let inTable = false;
  let tableRows = [];
  let tableHeaders = [];
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';

    // Code blocks
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        const code = codeBlockContent.join('\n');
        output.push(`<pre><code class="language-${codeBlockLang}">${escapeHtml(code)}</code></pre>`);
        codeBlockContent = [];
        codeBlockLang = '';
        inCodeBlock = false;
      } else {
        codeBlockLang = trimmedLine.substring(3).trim() || 'text';
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Close list if needed
    if (inList && !trimmedLine.match(/^[\-\*\+]\s/) && !trimmedLine.match(/^\d+\.\s/) && trimmedLine !== '') {
      output.push(`</${listType}>`);
      inList = false;
      listType = '';
    }

    // Tables
    if (trimmedLine.includes('|') && trimmedLine.length > 1) {
      if (trimmedLine.match(/^\|[\s\-\|:]+\|$/)) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableRows = [];
        tableHeaders = [];
      }

      const cells = trimmedLine.split('|')
        .map(c => c.trim())
        .filter(c => c && !c.match(/^[\-\s:]+$/));

      if (cells.length > 0) {
        if (nextLine && (nextLine.match(/^\|[\s\-\|:]+\|$/) || nextLine.match(/^[\s\-\|:]+\|$/))) {
          tableHeaders = cells;
          i++;
        } else if (tableHeaders.length === 0) {
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
      }
      continue;
    } else if (inTable) {
      let tableHtml = '<table>\n';
      if (tableHeaders.length > 0) {
        tableHtml += '<thead><tr>';
        tableHeaders.forEach(header => {
          tableHtml += `<th>${processInlineMarkdown(header)}</th>`;
        });
        tableHtml += '</tr></thead>\n';
      }
      if (tableRows.length > 0) {
        tableHtml += '<tbody>\n';
        tableRows.forEach(row => {
          tableHtml += '<tr>';
          row.forEach(cell => {
            tableHtml += `<td>${processInlineMarkdown(cell)}</td>`;
          });
          tableHtml += '</tr>\n';
        });
        tableHtml += '</tbody>\n';
      }
      tableHtml += '</table>';
      output.push(tableHtml);
      inTable = false;
      tableRows = [];
      tableHeaders = [];
    }

    // Headers
    if (trimmedLine.startsWith('### ')) {
      output.push(`<h3>${processInlineMarkdown(trimmedLine.substring(4))}</h3>`);
      continue;
    }
    if (trimmedLine.startsWith('## ')) {
      output.push(`<h2>${processInlineMarkdown(trimmedLine.substring(3))}</h2>`);
      continue;
    }
    if (trimmedLine.startsWith('# ')) {
      output.push(`<h1>${processInlineMarkdown(trimmedLine.substring(2))}</h1>`);
      continue;
    }

    // Horizontal rule
    if (trimmedLine === '---' || trimmedLine === '***') {
      output.push('<hr>');
      continue;
    }

    // Empty line
    if (trimmedLine === '') {
      output.push('');
      continue;
    }

    // Unordered lists
    if (trimmedLine.match(/^[\-\*\+]\s/)) {
      const content = trimmedLine.substring(2).trim();
      if (!inList || listType !== 'ul') {
        if (inList) output.push(`</${listType}>`);
        output.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      output.push(`<li>${processInlineMarkdown(content)}</li>`);
      continue;
    }

    // Ordered lists
    if (trimmedLine.match(/^\d+\.\s/)) {
      const content = trimmedLine.replace(/^\d+\.\s/, '').trim();
      if (!inList || listType !== 'ol') {
        if (inList) output.push(`</${listType}>`);
        output.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      output.push(`<li>${processInlineMarkdown(content)}</li>`);
      continue;
    }

    // Regular paragraph
    if (trimmedLine) {
      output.push(`<p>${processInlineMarkdown(trimmedLine)}</p>`);
    }
  }

  // Close any open code block
  if (inCodeBlock && codeBlockContent.length > 0) {
    const code = codeBlockContent.join('\n');
    output.push(`<pre><code class="language-${codeBlockLang}">${escapeHtml(code)}</code></pre>`);
  }

  // Close any open list
  if (inList) {
    output.push(`</${listType}>`);
  }

  // Close any open table
  if (inTable && tableRows.length > 0) {
    let tableHtml = '<table>\n';
    if (tableHeaders.length > 0) {
      tableHtml += '<thead><tr>';
      tableHeaders.forEach(header => {
        tableHtml += `<th>${processInlineMarkdown(header)}</th>`;
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
  }

  return output.join('\n');
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

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3] || inputPath.replace(/\.md$/, '.html');

  if (!inputPath) {
    console.error('Usage: node scripts/convert-single-markdown.js <input.md> [output.html]');
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  try {
    const markdown = fs.readFileSync(inputPath, 'utf8');
    const title = path.basename(inputPath, '.md')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const htmlContent = markdownToHtml(markdown);
    const fullHtml = createHtmlDocument(title, htmlContent);

    fs.writeFileSync(outputPath, fullHtml, 'utf8');
    console.log(`✅ Converted: ${inputPath} → ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error.message);
    process.exit(1);
  }
}

main();

