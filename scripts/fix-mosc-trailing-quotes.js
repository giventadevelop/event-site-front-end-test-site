import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixTrailingQuotes() {
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

      // Check if file has lines ending with ';' pattern
      const hasTrailingQuotes = content.split('\n').some(line =>
        line.endsWith(";'") || line === "'"
      );

      if (hasTrailingQuotes) {
        // Fix by removing trailing ' from all lines
        const fixed = content.split('\n').map(line => {
          // Remove trailing ' from lines that have it
          if (line.endsWith("'")) {
            return line.substring(0, line.length - 1);
          }
          return line;
        }).join('\n');

        fs.writeFileSync(file, fixed, 'utf8');
        console.log(`✓ Fixed: ${path.relative(process.cwd(), file)}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\nComplete! Fixed ${fixedCount} files, ${errorCount} errors`);
}

fixTrailingQuotes().catch(console.error);
