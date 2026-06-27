import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixFinal() {
  console.log('Finding all files in src/app/mosc...');

  // Find all .tsx, .ts, .jsx, .js files in the mosc directory
  const files = await glob('src/app/mosc/**/*.{tsx,ts,jsx,js}', {
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

      // Check if any line ends with a trailing quote that looks like corruption
      const hasIssue = lines.some(line => {
        // Remove any trailing \r that might still be there
        const cleanLine = line.replace(/\r$/, '');

        // Check if line ends with ' (but preserve lines that are legitimately just quotes in strings)
        const endsWithQuote = cleanLine.endsWith("'");
        if (!endsWithQuote) return false;

        // If the line is ONLY a quote, it's corrupt
        if (cleanLine.trim() === "'") return true;

        // If line ends with patterns like ;' ,' }' ]' )' >' {' (' [' these are corrupt
        return /[;,}\])>{(\[]'$/.test(cleanLine);
      });

      if (hasIssue) {
        // Fix by removing the trailing ' from lines that match our corruption pattern
        const fixed = lines.map(line => {
          // Remove any trailing \r
          const cleanLine = line.replace(/\r$/, '');

          // If entire line is just a quote (possibly with whitespace), make it empty
          if (cleanLine.trim() === "'") {
            return '';
          }

          // If line ends with corruption pattern, remove last character
          if (/[;,}\])>{(\[]'$/.test(cleanLine)) {
            return cleanLine.substring(0, cleanLine.length - 1);
          }

          return cleanLine;
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

fixFinal().catch(console.error);
