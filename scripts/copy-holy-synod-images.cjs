const fs = require('fs');
const path = require('path');

// Map of image names to source paths in legacy files
const imageMap = {
  'hh-scaled.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/hh-scaled.jpg',
  'ath.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/ath.jpg',
  'milithios.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/milithios.jpg',
  'mar-clemis.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/mar-clemis.jpg',
  'coor.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/coor.jpg',
  'nico.png': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/nico.png',
  'irne.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/irne.jpg',
  'mar-gregorios.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/mar-gregorios.jpg',
  'chris.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/chris.jpg',
  'poly.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/poly.jpg',
  'thevo.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/thevo.jpg',
  'cul.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/cul.jpg',
  'mar-ephipanios.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/mar-ephipanios.jpg',
  'thimothios.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/thimothios.jpg',
  'eusebius.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/eusebius.jpg',
  'pani.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/pani.jpg',
  'del.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/del.jpg',
  'mar-thevodoros.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/mar-thevodoros.jpg',
  'mar-eliyas.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/mar-eliyas.jpg',
  'mar-nicodimos.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/mar-nicodimos.jpg',
  'mar-aprem.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/mar-aprem.jpg',
  'yulios.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/yulios.jpg',
  'sera.png': 'code_clone_ref/mosc_in/wp-content/uploads/2015/05/sera.png',
  'Abraham-Mar-Stephanos.png': 'code_clone_ref/mosc_in/wp-content/uploads/2022/07/Abraham-Mar-Stephanos.png',
  'Thomas-Mar-Ivanios.png': 'code_clone_ref/mosc_in/wp-content/uploads/2022/07/Thomas-Mar-Ivanios.png',
  'Dr-Geevarghese-Mar-Theophilos.png': 'code_clone_ref/mosc_in/wp-content/uploads/2022/07/Dr-Geevarghese-Mar-Theophilos.png',
  'Geevarghese-Mar-Philaxenos.png': 'code_clone_ref/mosc_in/wp-content/uploads/2022/07/Geevarghese-Mar-Philaxenos.png',
  'Geevarghese-Mar-Pachomios-300x193-1.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2022/07/Geevarghese-Mar-Pachomios-300x193-1.jpg',
  'Geevarghese-Mar-Barnabas.png': 'code_clone_ref/mosc_in/wp-content/uploads/2022/07/Geevarghese-Mar-Barnabas.png',
  'zaker.jpg': 'code_clone_ref/mosc_in/wp-content/uploads/2022/07/zaker.jpg'
};

const projectRoot = path.join(__dirname, '..');
const targetDir = path.join(projectRoot, 'public/images/holy-synod');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('Copying Holy Synod images...\n');

let copied = 0;
let skipped = 0;
let missing = 0;

for (const [imageName, sourcePath] of Object.entries(imageMap)) {
  const source = path.join(projectRoot, sourcePath);
  const target = path.join(targetDir, imageName);

  if (!fs.existsSync(source)) {
    console.log(`⚠️  Source not found: ${sourcePath}`);
    missing++;
    continue;
  }

  if (fs.existsSync(target)) {
    console.log(`⏭️  Already exists: ${imageName}`);
    skipped++;
    continue;
  }

  try {
    fs.copyFileSync(source, target);
    console.log(`✅ Copied: ${imageName}`);
    copied++;
  } catch (error) {
    console.error(`❌ Error copying ${imageName}:`, error.message);
  }
}

console.log(`\n✨ Done! Copied: ${copied}, Skipped: ${skipped}, Missing: ${missing}`);
