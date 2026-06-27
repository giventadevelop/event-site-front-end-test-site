const fs = require('fs');
const path = require('path');

// Map of legacy folder names to new URL-friendly slugs and metadata
const albumsMetadata = [
  { folder: 'enthronement-ceremony-of-his-holiness-baselios-marthoma-mathews-iii', slug: 'enthronement-mathews-iii', title: 'Enthronement Ceremony of His Holiness Baselios Marthoma Mathews III', date: '2021', category: 'Major Events' },
  { folder: 'russia-visit-of-h-h-baselios-marthoma-mathews-iii', slug: 'russia-visit', title: 'Russia Visit of H.H Baselios Marthoma Mathews III', date: '2019', category: 'Ecumenical Visits' },
  { folder: 'ceremonial-reception-given-to-h-h-the-catholicos-of-india-by-the-russian-orthodox-church', slug: 'ceremonial-reception-russian-orthodox', title: 'Ceremonial Reception given to H.H The Catholicos of India by the Russian Orthodox Church', date: '2019', category: 'Ecumenical Visits' },
  { folder: 'ethiopian-visit-of-his-holiness-2013-february-28', slug: 'ethiopian-visit', title: 'Ethiopian Visit of His Holiness', date: 'February 28, 2013', category: 'Ecumenical Visits' },
  { folder: 'vatican-visit-of-his-holiness', slug: 'vatican-visit', title: 'Vatican Visit of His Holiness', date: '2016', category: 'Ecumenical Visits' },
  { folder: 'visit-of-his-holiness-abune-mathias-patriarch-of-ethiopian-orthodox-church', slug: 'visit-abune-mathias', title: 'Visit of His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church', date: '2016', category: 'Ecumenical Visits' },
  { folder: 'order-of-st-thomas-to-his-holiness-abune-mathias-patriarch-ethiopian-orthodox-tewahedo-church', slug: 'order-st-thomas-abune-mathias', title: 'Order of St.Thomas to His Holiness Abune Mathias Patriarch Ethiopian Orthodox Tewahedo Church', date: '2016', category: 'Major Events' },
  { folder: '100th-anniversary-of-the-armenian-genocide-beirut-2015-july-18', slug: 'armenian-genocide-100th', title: '100th Anniversary of the Armenian Genocide', date: 'July 18, 2015', category: 'Special Events' },
  { folder: 'service-of-canonization-of-the-victims-of-armenian-genocideapril-23-2015', slug: 'armenian-genocide-canonization', title: 'Service of Canonization of the Victims of Armenian Genocide', date: 'April 23, 2015', category: 'Special Events' },
  { folder: 'private-audience-with-hh-aram-17th-july-2015-100th-anniversary-of-the-armenian-genocide', slug: 'private-audience-aram', title: 'Private Audience with H.H Aram - 100th Anniversary of the Armenian Genocide', date: 'July 17, 2015', category: 'Private Audiences' },
  { folder: 'private-audience-with-karekin-i-supreme-patriarch-and-catholicos-of-all-armenians-of-mother-see-of-holy-etchmiadzin', slug: 'private-audience-karekin', title: 'Private Audience with Karekin I, Supreme Patriarch and Catholicos of All Armenians', date: '2015', category: 'Private Audiences' },
  { folder: 'his-holiness-with-armenian-president-april-232015', slug: 'armenian-president', title: 'His Holiness with Armenian President', date: 'April 23, 2015', category: 'Special Events' },
  { folder: 'blessing-of-holy-myron-beirut-2015-july-19', slug: 'blessing-holy-myron', title: 'Blessing of Holy Myron', date: 'July 19, 2015, Beirut', category: 'Liturgical Events' },
  { folder: 'enthronement-ceremony-of-the-new-coptic-pope', slug: 'enthronement-coptic-pope', title: 'Enthronement Ceremony of the New Coptic Pope', date: '2012', category: 'Ecumenical Visits' },
  { folder: 'h-h-baselios-marthoma-paulose-ii-with-kiril-patriarch', slug: 'paulose-ii-with-kiril', title: 'H.H Baselios Marthoma Paulose II with Kiril Patriarch', date: '2012', category: 'Ecumenical Visits' },
  { folder: 'rome', slug: 'rome-visit', title: 'Rome', date: '2015', category: 'Ecumenical Visits' },
  { folder: 'h-h-visit-to-canberra17-nov-2015', slug: 'canberra-visit', title: 'H.H Visit to Canberra', date: 'November 17, 2015', category: 'Church Visits' },
  { folder: 'reception-to-h-b-tikon-at-puthupally-church', slug: 'reception-tikon-puthupally', title: 'Reception to H.B.Tikon at Puthupally Church', date: '2015', category: 'Receptions' },
  { folder: 'private-audience-with-h-b-tikon-at-devalokam-aramana-nov-252015', slug: 'private-audience-tikon-devalokam', title: 'Private Audience with H.B.Tikon at Devalokam Aramana', date: 'November 25, 2015', category: 'Private Audiences' },
  { slug: 'reception-mathews-iii', title: 'Reception to His Holiness Baselios Marthoma Mathews III', date: '2021', category: 'Receptions' },
  { folder: 'offering-incense-at-the-relics-of-st-thomas-devalokamaramana', slug: 'offering-incense-st-thomas', title: 'Offering Incense at the Relics of St.Thomas (Devalokam Aramana)', date: '2016', category: 'Liturgical Events' },
  { folder: 'official-website-inaugurationdevalokam-aramana', slug: 'website-inauguration', title: 'Official Website Inauguration, Devalokam Aramana', date: 'November 25, 2015', category: 'Special Events' },
  { folder: 'the-great-shepherd-of-malankara-prayerfully-in-pokrovsky-monastery-chapel', slug: 'pokrovsky-monastery', title: 'The Great Shepherd of Malankara Prayerfully in Pokrovsky Monastery Chapel', date: '2019', category: 'Liturgical Events' },
  { folder: 'the-fraternity-at-vienna-3rd-september-2013', slug: 'vienna-fraternity', title: 'The Fraternity at Vienna', date: 'September 3, 2013', category: 'Special Events' },
  { folder: 'official-reception-at-the-main-chapel-of-st-cyril-and-methodius-institute-of-post-graduate-studies', slug: 'st-cyril-methodius', title: 'Official Reception at the Main Chapel of St. Cyril and Methodius Institute', date: '2019', category: 'Receptions' },
  { folder: 'mother-feofania-and-the-little-flowers-of-the-convent-where-st-matrona-is-interred-welcomed-his-holiness-with-the-songs-of-their-heart', slug: 'mother-feofania', title: 'Mother Feofania and the Little Flowers of the Convent', date: '2019', category: 'Special Events' },
  { folder: '3rd-international-dharma-dhamma-conferenceindore-24-26-october-2015', slug: 'dharma-dhamma-conference', title: '3rd International Dharma-Dhamma Conference', date: 'October 24-26, 2015, Indore', category: 'Conferences' },
  { slug: 'vatican-visit-1', title: 'Visit of H.H The Catholicos to the Vatican', date: '2013', category: 'Ecumenical Visits' },
  { slug: 'vatican-visit-2', title: 'Visit of H.H The Catholicos to the Vatican', date: '2013', category: 'Ecumenical Visits' },
  { slug: 'vatican-visit-3', title: 'Visit of H.H The Catholicos to the Vatican', date: '2013', category: 'Ecumenical Visits' },
  { slug: 'vatican-visit-4', title: 'Visit of H.H The Catholicos to the Vatican', date: '2013', category: 'Ecumenical Visits' },
  { slug: 'vatican-visit-5', title: 'Visit of H.H The Catholicos to the Vatican', date: '2013', category: 'Ecumenical Visits' },
];

function extractImageNamesFromHTML(htmlFilePath) {
  try {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    const imageNames = [];
    
    // Extract image names from <img> tags
    // Pattern: src="../../wp-content/uploads/YYYY/MM/FILENAME.jpg"
    const imgRegex = /src="[^"]*\/([^\/]+\.jpg)"/gi;
    let match;
    
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const fileName = match[1];
      // Remove size suffixes like -1024x683, -150x150, etc.
      const cleanName = fileName.replace(/-\d+x\d+\.jpg$/, '.jpg');
      if (!imageNames.includes(cleanName)) {
        imageNames.push(cleanName);
      }
    }
    
    return imageNames;
  } catch (error) {
    console.error(`Error reading ${htmlFilePath}:`, error.message);
    return [];
  }
}

function generatePageTSX(albumData, imageNames) {
  const photosArray = imageNames.map(imgName => 
    `    { src: '/images/mosc/gallery/${albumData.slug}/${imgName}', alt: '${albumData.title}' },`
  ).join('\n');

  return `import React from 'react';
import { Metadata } from 'next';
import GalleryAlbum from '../components/GalleryAlbum';

export const metadata: Metadata = {
  title: '${albumData.title} | Gallery | MOSC',
  description: 'Photo gallery of ${albumData.title}.',
};

export default function ${albumData.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}Page() {
  const photos = [
${photosArray}
  ];

  return (
    <GalleryAlbum
      title="${albumData.title}"
      date="${albumData.date}"
      category="${albumData.category}"
      photos={photos}
    />
  );
}
`;
}

function main() {
  const legacyPhotoGalleryPath = path.join(__dirname, '..', 'code_clone_ref', 'mosc_in', 'photo-gallery');
  const outputBasePath = path.join(__dirname, '..', 'src', 'app', 'mosc', 'gallery');

  albumsMetadata.forEach(album => {
    if (!album.folder) {
      console.log(`⚠️  Skipping ${album.slug} - no legacy folder specified`);
      return;
    }

    const htmlFilePath = path.join(legacyPhotoGalleryPath, album.folder, 'index.html');
    
    if (!fs.existsSync(htmlFilePath)) {
      console.log(`⚠️  HTML file not found: ${htmlFilePath}`);
      return;
    }

    console.log(`📝 Processing: ${album.title}`);
    
    const imageNames = extractImageNamesFromHTML(htmlFilePath);
    console.log(`   Found ${imageNames.length} images`);
    
    if (imageNames.length === 0) {
      console.log(`   ⚠️  No images found, skipping...`);
      return;
    }

    const pageContent = generatePageTSX(album, imageNames);
    const outputDir = path.join(outputBasePath, album.slug);
    const outputFilePath = path.join(outputDir, 'page.tsx');

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the page file
    fs.writeFileSync(outputFilePath, pageContent, 'utf-8');
    console.log(`   ✅ Created: ${outputFilePath}`);
    
    // Log the image copy instructions
    console.log(`   📁 Copy images from: ${path.join(legacyPhotoGalleryPath, album.folder)}`);
    console.log(`      to: public/images/mosc/gallery/${album.slug}/`);
    console.log('');
  });

  console.log('✨ Gallery pages generation complete!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Copy all images from legacy folders to public/images/mosc/gallery/[album-slug]/');
  console.log('2. Ensure image filenames match (remove size suffixes like -1024x683)');
  console.log('3. Test each gallery page to verify images load correctly');
}

main();

