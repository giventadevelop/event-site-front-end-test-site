import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs for each pilgrim centre detail page
const centreUrls = [
  {
    slug: 'thiruvithamcode-arappally',
    url: 'https://mosc.in/pilgrimcentres/thiruvithamcode-arappally/',
  },
  {
    slug: 'parumala-church',
    url: 'https://mosc.in/pilgrimcentres/parumala-church/',
  },
  {
    slug: 'niranam-valiyapally',
    url: 'https://mosc.in/pilgrimcentres/niranam-valiyapally/',
  },
  {
    slug: 'arthat-st-marys-cathedral',
    url: 'https://mosc.in/pilgrimcentres/arthat-st-marys-cathedral/',
  },
  {
    slug: 'pampady-dayara',
    url: 'https://mosc.in/pilgrimcentres/pampady-dayara/',
  },
  {
    slug: 'puthuppally-church',
    url: 'https://mosc.in/pilgrimcentres/puthuppally-church/',
  },
  {
    slug: 'koonan-kurishu-pilgrim-centre',
    url: 'https://mosc.in/pilgrimcentres/koonan-kurishu-pilgrim-centre/',
  },
  {
    slug: 'old-seminary-pazhaya-seminary',
    url: 'https://mosc.in/pilgrimcentres/old-seminary-pazhaya-seminary/',
  },
  {
    slug: 'st-george-orthodox-church-kadamattom',
    url: 'https://mosc.in/pilgrimcentres/st-george-orthodox-church-kadamattom/',
  },
  {
    slug: 'kottayam-cheriapally',
    url: 'https://mosc.in/pilgrimcentres/kottayam-cheriapally/',
  },
  {
    slug: 'st-marys-orthodox-church-kallooppara',
    url: 'https://mosc.in/pilgrimcentres/st-marys-orthodox-church-kallooppara/',
  },
  {
    slug: 'st-george-orthodox-church-chandanapally',
    url: 'https://mosc.in/pilgrimcentres/st-george-orthodox-church-chandanapally/',
  },
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function extractContent(html) {
  // Extract main content from HTML
  // Look for content between specific tags or classes
  const contentMatch = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  
  if (contentMatch) {
    // Remove HTML tags and clean up
    let text = contentMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text;
  }
  
  // Fallback: extract text from body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    let text = bodyMatch[1]
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text.substring(0, 2000); // Limit length
  }
  
  return '';
}

async function fetchAll() {
  const results = [];
  
  for (const centre of centreUrls) {
    try {
      console.log(`Fetching ${centre.slug}...`);
      const html = await fetchPage(centre.url);
      const content = extractContent(html);
      results.push({
        slug: centre.slug,
        content: content || 'Content not available',
      });
      console.log(`✓ Fetched ${centre.slug}`);
    } catch (error) {
      console.error(`Error fetching ${centre.slug}:`, error.message);
      results.push({
        slug: centre.slug,
        content: 'Content not available',
      });
    }
  }
  
  // Save to file
  const outputPath = path.join(__dirname, '..', 'pilgrim-centres-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nContent saved to ${outputPath}`);
}

fetchAll();

