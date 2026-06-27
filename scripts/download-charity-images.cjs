const https = require('https');
const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../public/images/charity-theme');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// List of images to download
const images = [
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_4.jpg',
    filename: 'hero_photo.jpg'
  },
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_5.jpg',
    filename: 'hero_photo_2.jpg'
  },
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/cause_4-640x476.jpeg',
    filename: 'cause_4.jpg'
  },
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2023/06/cause_5-640x476.jpg',
    filename: 'cause_5.jpg'
  },
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2023/06/cause_6-640x476.jpeg',
    filename: 'cause_6.jpg'
  },
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/port-1-480x731.jpg',
    filename: 'project_1.jpg'
  },
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/portfolio-480x731.jpg',
    filename: 'project_2.jpg'
  },
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/port-3-480x731.jpg',
    filename: 'project_3.jpg'
  },
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/testimonials_photo_2.jpg',
    filename: 'testimonial_1.jpg'
  },
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/event_9-255x155.jpg',
    filename: 'event_1.jpg'
  },
  {
    url: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/children_photo.jpg',
    filename: 'children_photo.jpg'
  }
];

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(imagesDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`✓ ${filename} already exists, skipping...`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded ${filename}`);
          resolve();
        });
      } else {
        console.log(`✗ Failed to download ${filename}: ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if there was an error
      console.log(`✗ Error downloading ${filename}: ${err.message}`);
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('Starting image downloads...\n');
  
  for (const image of images) {
    try {
      await downloadImage(image.url, image.filename);
    } catch (error) {
      console.log(`Failed to download ${image.filename}`);
    }
  }
  
  console.log('\nImage download process completed!');
}

downloadAllImages();
