import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixSimple() {
  console.log('Finding all files in src/app/mosc...');

  // Find all .tsx, .ts files in the mosc directory
  const files = await glob('src/app/mosc/**/*.{tsx,ts}', {
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
      // Normalize line endings to \n
      const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = normalizedContent.split('\n');

      // Check if any line ends with  a quote
      const hasTrailingQuotes = lines.some(line => line.endsWith("'"));

      if (hasTrailingQuotes) {
        // Remove the last character from every line that ends with a quote
        const fixed = lines.map(line => {
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

fixSimple().catch(console.error);
