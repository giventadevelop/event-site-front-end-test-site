import sharp from 'sharp';
import { resolve } from 'path';
import { existsSync } from 'fs';

const src = process.argv[2] || 'public/images/adwiise_logo.png';
if (!existsSync(src)) {
  console.error('Source image not found:', src);
  console.log('Available alternatives:');
  console.log('- public/images/mcefee_logo_black_border.jpeg');
  console.log('- public/images/mcefee_logo_black_border_transparent.png');
  console.log('- public/images/adwiise_logo_fav_ico.ico');
  process.exit(1);
}

const out = 'public';
const tasks = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'android-chrome-192x192.png', size: 192 },
  { file: 'android-chrome-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

console.log(`Generating icons from: ${src}`);
console.log(`Output directory: ${out}`);

try {
  await Promise.all(tasks.map(async (t) => {
    const outputPath = resolve(out, t.file);
    await sharp(src)
      .resize(t.size, t.size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${t.file} (${t.size}x${t.size})`);
  }));

  console.log('\n🎉 All icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Create public/manifest.webmanifest');
  console.log('2. Update src/app/(app)/layout.tsx metadata');
  console.log('3. Deploy and test');

} catch (error) {
  console.error('Error generating icons:', error);
  process.exit(1);
}
