import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Metropolitan image mapping based on actual files found
const imageMapping = [
  { name: 'thomas-mar-athanasius.jpg', source: 'ath.jpg', year: '2015', month: '05' },
  { name: 'yuhanon-mar-meletius.jpg', source: 'milithios.jpg', year: '2015', month: '05' },
  { name: 'kuriakose-mar-clemis.jpg', source: 'mar-clemis.jpg', year: '2015', month: '05' },
  { name: 'zacharias-mar-aprem.jpg', source: 'mar-aprem.jpg', year: '2015', month: '05' },
  { name: 'gabriel-mar-gregorios.jpg', source: 'mar-gregorios.jpg', year: '2015', month: '05' },
  { name: 'yakob-mar-elias.jpg', source: 'mar-eliyas.jpg', year: '2015', month: '05' },
  { name: 'joshua-mar-nicodimos.jpg', source: 'mar-nicodimos.jpg', year: '2015', month: '05' },
  { name: 'yuhanon-mar-thevodoros.jpg', source: 'mar-thevodoros.jpg', year: '2015', month: '05' },
  { name: 'abraham-mar-epiphanios.jpg', source: 'mar-ephipanios.jpg', year: '2015', month: '05' },
  { name: 'geevarghese-mar-pachomios.jpg', source: 'Geevarghese-Mar-Pachomios-300x193-1.jpg', year: '2022', month: '07' },
  // Add more mappings as needed
  { name: 'mathews-mar-thimothios.jpg', source: 'mathews.jpg', year: '2015', month: '05' },
  { name: 'geevarghese-mar-yulios.jpg', source: 'yulios.jpg', year: '2015', month: '05' }
];

// Function to find and copy images
function copyMetropolitanImages() {
  console.log('Copying metropolitan images...');
  
  const uploadsDir = path.join('code_clone_ref', 'mosc_in', 'wp-content', 'uploads');
  const targetDir = path.join('public', 'images', 'holy-synod');
  
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  let copiedCount = 0;
  
  imageMapping.forEach((mapping, index) => {
    console.log(`Processing ${index + 1}/${imageMapping.length}: ${mapping.name}`);
    
    // Use specific year/month if provided, otherwise try common directories
    const possibleSources = mapping.year && mapping.month 
      ? [path.join(uploadsDir, mapping.year, mapping.month, mapping.source)]
      : [
          path.join(uploadsDir, '2015', '05', mapping.source),
          path.join(uploadsDir, '2015', '01', mapping.source),
          path.join(uploadsDir, '2015', '06', mapping.source),
          path.join(uploadsDir, '2015', '08', mapping.source),
          path.join(uploadsDir, '2015', '09', mapping.source),
          path.join(uploadsDir, '2015', '10', mapping.source),
          path.join(uploadsDir, '2015', '11', mapping.source),
          path.join(uploadsDir, '2015', '12', mapping.source),
          path.join(uploadsDir, '2016', '01', mapping.source),
          path.join(uploadsDir, '2016', '02', mapping.source),
          path.join(uploadsDir, '2016', '03', mapping.source),
          path.join(uploadsDir, '2016', '04', mapping.source),
          path.join(uploadsDir, '2016', '05', mapping.source),
          path.join(uploadsDir, '2016', '06', mapping.source),
          path.join(uploadsDir, '2016', '07', mapping.source),
          path.join(uploadsDir, '2016', '08', mapping.source),
          path.join(uploadsDir, '2016', '09', mapping.source),
          path.join(uploadsDir, '2016', '10', mapping.source),
          path.join(uploadsDir, '2016', '11', mapping.source),
          path.join(uploadsDir, '2016', '12', mapping.source)
        ];
    
    let sourceFound = false;
    
    for (const sourcePath of possibleSources) {
      if (fs.existsSync(sourcePath)) {
        const targetPath = path.join(targetDir, mapping.name);
        try {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✓ Copied: ${mapping.name}`);
          copiedCount++;
          sourceFound = true;
          break;
        } catch (error) {
          console.log(`✗ Error copying ${mapping.name}: ${error.message}`);
        }
      }
    }
    
    if (!sourceFound) {
      console.log(`✗ Source not found for: ${mapping.name}`);
    }
  });
  
  console.log(`\nCopy complete! Successfully copied ${copiedCount}/${imageMapping.length} images.`);
}

// Run the copy function
copyMetropolitanImages();
