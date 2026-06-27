import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixDirectives() {
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
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;

      // Fix common directive patterns
      content = content.replace(/^use client';/gm, "'use client';");
      content = content.replace(/^use server';/gm, "'use server';");

      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
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

fixDirectives().catch(console.error);
