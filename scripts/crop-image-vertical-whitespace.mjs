#!/usr/bin/env node
/**
 * Crop an image to reduce top and bottom empty space to half.
 * Removes 15% from top and 15% from bottom (keeps middle 70%).
 * Usage: node scripts/crop-image-vertical-whitespace.mjs <input> [output]
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath.replace(/(\.[^.]+)$/, '-cropped$1');

if (!inputPath || !fs.existsSync(inputPath)) {
  console.error('Usage: node scripts/crop-image-vertical-whitespace.mjs <input> [output]');
  console.error('Input file not found:', inputPath);
  process.exit(1);
}

async function run() {
  const meta = await sharp(inputPath).metadata();
  const { width, height } = meta;
  if (!width || !height) {
    console.error('Could not read image dimensions');
    process.exit(1);
  }
  // Remove 15% from top and 15% from bottom → keep middle 70%
  const cropTop = Math.round(height * 0.15);
  const cropBottom = Math.round(height * 0.15);
  const newHeight = height - cropTop - cropBottom;
  await sharp(inputPath)
    .extract({ left: 0, top: cropTop, width, height: newHeight })
    .toFile(outputPath);
  console.log('Cropped:', outputPath);
  console.log('Original height:', height, '→ New height:', newHeight, '(removed', cropTop + cropBottom, 'px)');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
