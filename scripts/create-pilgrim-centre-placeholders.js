/**
 * Script to create placeholder images for Pilgrim Centres
 * Run with: node scripts/create-pilgrim-centre-placeholders.js
 */

const fs = require('fs');
const path = require('path');

const centres = [
  'thiruvithamcode',
  'parumala',
  'niranam',
  'arthat',
  'pampady',
  'puthuppally',
  'koonan-kurishu',
  'old-seminary',
  'kadamattom',
  'cheriapally',
  'kallooppara',
  'chandanapally',
];

const outputDir = path.join(__dirname, '..', 'public', 'images', 'pilgrim-centres');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create a simple SVG placeholder for each centre
centres.forEach((centre) => {
  const filePath = path.join(outputDir, `${centre}.jpg`);
  
  // Create a simple SVG placeholder
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#8B7D6B"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#F5F1E8" text-anchor="middle" dominant-baseline="middle">
    ${centre.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
  </text>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="16" fill="#EDE7D3" text-anchor="middle" dominant-baseline="middle">
    Pilgrim Centre Image Placeholder
  </text>
</svg>`;

  // For now, just create a note that the image should be replaced
  // In a real implementation, you would convert SVG to JPG or use actual images
  const note = `Placeholder for ${centre}.jpg\n\nReplace with actual image (800x600px recommended)\n\nSVG content:\n${svg}`;
  
  // Create a text file as a reminder (in production, use actual images)
  fs.writeFileSync(filePath.replace('.jpg', '.txt'), note);
  
  console.log(`Created placeholder note for ${centre}`);
});

console.log('\n✅ All placeholder notes created!');
console.log('\n📝 Note: Replace these with actual images in JPG format.');
console.log('   Recommended size: 800x600px (4:3 aspect ratio)');













