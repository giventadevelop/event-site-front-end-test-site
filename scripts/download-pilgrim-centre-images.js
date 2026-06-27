import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Image URLs from the legacy site
const images = [
  {
    filename: 'thiruvithamcode.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/11/arapally-300x199.jpg',
  },
  {
    filename: 'parumala.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/10/parumala1-300x199.jpg',
  },
  {
    filename: 'niranam.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/11/niranam1-300x199.jpg',
  },
  {
    filename: 'pampady.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/11/pampaduy.jpg',
  },
  {
    filename: 'arthat.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/12/arthat.jpg',
  },
  // Additional images - using full-size images when available
  {
    filename: 'puthuppally.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/11/puthu.jpg',
  },
  {
    filename: 'koonan-kurishu.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/11/kkk.jpg',
  },
  {
    filename: 'old-seminary.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/10/pazhaya-seminary.jpg',
  },
  {
    filename: 'kadamattom.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/11/kadamattom.jpg',
  },
  {
    filename: 'cheriapally.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/11/cheria-pally.jpg',
  },
  {
    filename: 'kallooppara.jpg',
    url: 'https://mosc.in/wp-content/uploads/2015/11/kalloopara.jpg',
  },
  {
    filename: 'chandanapally.jpg',
    url: 'https://mosc.in/wp-content/uploads/2016/06/chandan.jpg',
  },
];

const outputDir = path.join(__dirname, '..', 'public', 'images', 'pilgrim-centres');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(image) {
  return new Promise((resolve, reject) => {
    const url = new URL(image.url);
    const protocol = url.protocol === 'https:' ? https : http;
    const filePath = path.join(outputDir, image.filename);

    console.log(`Downloading ${image.filename}...`);

    const file = fs.createWriteStream(filePath);

    protocol.get(image.url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        return downloadImage({ ...image, url: response.headers.location }).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        console.error(`Failed to download ${image.filename}: ${response.statusCode}`);
        file.close();
        fs.unlinkSync(filePath);
        reject(new Error(`Failed to download ${image.filename}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${image.filename}`);
        resolve();
      });
    }).on('error', (err) => {
      console.error(`Error downloading ${image.filename}:`, err.message);
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Starting download of pilgrim centre images...\n');
  
  for (const image of images) {
    try {
      await downloadImage(image);
    } catch (error) {
      console.error(`Error with ${image.filename}:`, error.message);
    }
  }

  console.log('\nDownload complete!');
}

downloadAll();

