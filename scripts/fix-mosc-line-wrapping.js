import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixLineWrapping() {
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
      const lines = content.split('\n');

      // Check if file has the wrapping quote pattern
      // Lines should NOT start and end with single quotes
      const hasIssue = lines.some(line => {
        const trimmed = line.trim();
        return trimmed.length > 0 &&
               trimmed.startsWith("'") &&
               trimmed.endsWith("'") &&
               !trimmed.match(/^'[^']*'$/); // Skip actual string literals like 'hello'
      });

      if (hasIssue) {
        // Fix each line by removing wrapping quotes
        const fixed = lines.map(line => {
          const trimmed = line.trim();

          // If line starts and ends with single quote, remove them
          if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
            // Get the original indentation
            const indent = line.substring(0, line.indexOf(trimmed));
            // Remove first and last quote
            const unwrapped = trimmed.substring(1, trimmed.length - 1);
            return indent + unwrapped;
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

fixLineWrapping().catch(console.error);
