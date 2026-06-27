#!/usr/bin/env node

/**
 * Fix Smart Quotes Script
 *
 * This script fixes all smart/curly quotes and apostrophes in TypeScript/TSX files
 * and replaces them with standard ASCII quotes.
 *
 * Smart quotes cause TypeScript compilation errors and AWS Amplify build failures.
 *
 * Usage:
 *   npm run fix:quotes
 *   or
 *   npx tsx scripts/fix-quotes.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Characters to replace
const REPLACEMENTS = {
  // Smart/curly double quotes
  '\u201C': '"', // Left double quotation mark "
  '\u201D': '"', // Right double quotation mark "
  '\u201E': '"', // Double low-9 quotation mark "
  '\u201F': '"', // Double high-reversed-9 quotation mark "
  '\u2033': '"', // Double prime "
  '\u301D': '"', // Double prime quotation mark "
  '\u301E': '"', // Double prime quotation mark "

  // Smart/curly single quotes and apostrophes
  '\u2018': "'", // Left single quotation mark '
  '\u2019': "'", // Right single quotation mark ' (also used as apostrophe)
  '\u201A': "'", // Single low-9 quotation mark '
  '\u201B': "'", // Single high-reversed-9 quotation mark '
  '\u2032': "'", // Prime '
  '\u0027': "'", // Apostrophe (normalize just in case)
  '\u02BC': "'", // Modifier letter apostrophe '
  '\u02C8': "'", // Modifier letter vertical line '
  '\u055A': "'", // Armenian apostrophe '
  '\u05F3': "'", // Hebrew punctuation geresh '
  '\u2019': "'", // Right single quotation mark (duplicate for emphasis)

  // Backticks and grave accents
  '\u0060': '`', // Grave accent ` (normalize)
  '\u02CB': '`', // Modifier letter grave accent `
  '\u1FEF': '`', // Greek varia `

  // Angle quotation marks
  '\u00AB': '"', // Left-pointing double angle quotation mark "
  '\u00BB': '"', // Right-pointing double angle quotation mark "
  '\u2039': "'", // Single left-pointing angle quotation mark '
  '\u203A': "'", // Single right-pointing angle quotation mark '

  // CJK quotation marks
  '\u300C': '"', // Left corner bracket "
  '\u300D': '"', // Right corner bracket "
  '\u300E': '"', // Left white corner bracket "
  '\u300F': '"', // Right white corner bracket "
};

interface FixStats {
  filesScanned: number;
  filesModified: number;
  totalReplacements: number;
  errors: string[];
}

/**
 * Fix smart quotes in a single file
 */
function fixQuotesInFile(filePath: string): { modified: boolean; replacements: number } {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let replacements = 0;

    // Replace each smart quote character
    for (const [smartChar, normalChar] of Object.entries(REPLACEMENTS)) {
      const regex = new RegExp(smartChar, 'g');
      const matches = content.match(regex);
      if (matches) {
        replacements += matches.length;
        content = content.replace(regex, normalChar);
      }
    }

    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { modified: true, replacements };
    }

    return { modified: false, replacements: 0 };
  } catch (error) {
    throw new Error(`Error processing ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Find all TypeScript/TSX files in the project
 */
async function findFiles(patterns: string[]): Promise<string[]> {
  const projectRoot = path.resolve(__dirname, '..');
  const allFiles: string[] = [];

  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: projectRoot,
      absolute: true,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/.git/**',
      ],
    });
    allFiles.push(...files);
  }

  // Remove duplicates
  return Array.from(new Set(allFiles));
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Smart Quote Fixer - Starting...\n');

  const stats: FixStats = {
    filesScanned: 0,
    filesModified: 0,
    totalReplacements: 0,
    errors: [],
  };

  try {
    // Find all TypeScript and TSX files
    const patterns = [
      'src/**/*.ts',
      'src/**/*.tsx',
      'scripts/**/*.ts',
      'scripts/**/*.tsx',
    ];

    console.log('📂 Searching for files...');
    const files = await findFiles(patterns);
    console.log(`✓ Found ${files.length} files to process\n`);

    // Process each file
    for (const file of files) {
      stats.filesScanned++;
      try {
        const result = fixQuotesInFile(file);
        if (result.modified) {
          stats.filesModified++;
          stats.totalReplacements += result.replacements;
          const relativePath = path.relative(process.cwd(), file);
          console.log(`✓ Fixed ${result.replacements} quote(s) in: ${relativePath}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        stats.errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`Files scanned:     ${stats.filesScanned}`);
    console.log(`Files modified:    ${stats.filesModified}`);
    console.log(`Total replacements: ${stats.totalReplacements}`);
    console.log(`Errors:            ${stats.errors.length}`);
    console.log('='.repeat(60));

    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      stats.errors.forEach(error => console.log(`  - ${error}`));
      process.exit(1);
    }

    if (stats.filesModified === 0) {
      console.log('\n✅ No smart quotes found - all files are clean!');
    } else {
      console.log(`\n✅ Successfully fixed ${stats.totalReplacements} smart quote(s) in ${stats.filesModified} file(s)!`);
      console.log('\n💡 Recommendation: Run "npm run build" to verify TypeScript compilation.');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
