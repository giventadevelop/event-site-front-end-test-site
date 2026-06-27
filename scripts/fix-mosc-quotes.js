import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixSmartQuotes() {
  console.log('Finding all .tsx files in src/app/mosc...');

  // Find all .tsx files in the mosc directory
  const files = await glob('src/app/mosc/**/*.tsx', {
    cwd: process.cwd(),
    absolute: true,
    windowsPathsNoEscape: true
  });

  console.log(`Found ${files.length} files to check`);

  let fixedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // Check if file has smart quotes
      const hasSmartQuotes = content.includes('\u2018') || content.includes('\u2019') ||
          content.includes('\u201C') || content.includes('\u201D');

      if (hasSmartQuotes) {
        // Replace smart quotes with regular quotes
        let fixed = content
          .replace(/\u2018/g, "'")  // Left single quote
          .replace(/\u2019/g, "'")  // Right single quote
          .replace(/\u201C/g, '"')  // Left double quote
          .replace(/\u201D/g, '"'); // Right double quote

        fs.writeFileSync(file, fixed, 'utf8');
        console.log(`✓ Fixed: ${path.relative(process.cwd(), file)}`);
        fixedCount++;
      } else {
        // Debug: check first few lines
        const firstLines = content.split('\n').slice(0, 3).join('\n');
        if (file.includes('administration/administration')) {
          console.log(`DEBUG ${path.relative(process.cwd(), file)}:`);
          console.log(`First 3 lines: ${JSON.stringify(firstLines)}`);
        }
      }
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\nComplete! Fixed ${fixedCount} files, ${errorCount} errors`);
}

fixSmartQuotes().catch(console.error);
