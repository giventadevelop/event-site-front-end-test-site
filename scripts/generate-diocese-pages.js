import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diocese data mapping from the main page
const dioceseData = [
  // Kerala Dioceses
  { name: 'Diocese of Thiruvananthapuram', slug: 'diocese-of-thiruvananthapuram-diocese', legacyPath: 'dioceses/diocese-of-thiruvananthapuram-diocese/index.html', region: 'Kerala' },
  { name: 'Diocese of Kollam', slug: 'diocese-of-kollam', legacyPath: 'dioceses/diocese-of-kollam/index.html', region: 'Kerala' },
  { name: 'Diocese of Kottarakara – Punalur', slug: 'diocese-of-kottarakara-punalur', legacyPath: 'dioceses/diocese-of-kottarakara-punalur/index.html', region: 'Kerala' },
  { name: 'Diocese of Adoor – Kadampanadu', slug: 'diocese-of-adoor-kadampanadu', legacyPath: 'dioceses/diocese-of-adoor-kadampanadu/index.html', region: 'Kerala' },
  { name: 'Diocese of Thumpamon', slug: 'diocese-of-thumpamon', legacyPath: 'dioceses/diocese-of-thumpamon/index.html', region: 'Kerala' },
  { name: 'Diocese of Mavelikara', slug: 'diocese-of-mavelikara', legacyPath: 'dioceses/diocese-of-mavelikara/index.html', region: 'Kerala' },
  { name: 'Diocese of Chengannur', slug: 'diocese-of-chengannur', legacyPath: 'dioceses/diocese-of-chengannur/index.html', region: 'Kerala' },
  { name: 'Diocese of Niranam', slug: 'diocese-of-niranam', legacyPath: 'dioceses/diocese-of-niranam/index.html', region: 'Kerala' },
  { name: 'Diocese of Nilackal', slug: 'diocese-of-nilackal', legacyPath: 'dioceses/diocese-of-nilackal/index.html', region: 'Kerala' },
  { name: 'Diocese of Kottayam', slug: 'diocese-of-kottayam', legacyPath: 'dioceses/diocese-of-kottayam/index.html', region: 'Kerala' },
  { name: 'Diocese of Kottayam Central', slug: 'diocese-of-kottayam-central', legacyPath: 'dioceses/diocese-of-kottayam-central/index.html', region: 'Kerala' },
  { name: 'Diocese of Idukki', slug: 'diocese-of-idukki', legacyPath: 'dioceses/diocese-of-idukki/index.html', region: 'Kerala' },
  { name: 'Diocese of Kandanad East', slug: 'diocese-of-kandanad-east', legacyPath: 'dioceses/diocese-of-kandanad-east/index.html', region: 'Kerala' },
  { name: 'Diocese of Kandanad West', slug: 'diocese-of-kandanad-west', legacyPath: 'dioceses/diocese-of-kandanad-west/index.html', region: 'Kerala' },
  { name: 'Diocese of Ankamaly', slug: 'diocese-of-ankamaly', legacyPath: 'dioceses/diocese-of-ankamaly/index.html', region: 'Kerala' },
  { name: 'Diocese of Kochi', slug: 'diocese-of-kochi', legacyPath: 'dioceses/diocese-of-kochi/index.html', region: 'Kerala' },
  { name: 'Diocese of Thrissur', slug: 'diocese-of-thrissur', legacyPath: 'dioceses/diocese-of-thrissur/index.html', region: 'Kerala' },
  { name: 'Diocese of Kunnamkulam', slug: 'diocese-of-kunnamkulam', legacyPath: 'dioceses/diocese-of-kunnamkulam/index.html', region: 'Kerala' },
  { name: 'Diocese of Malabar', slug: 'diocese-of-malabar', legacyPath: 'dioceses/diocese-of-malabar/index.html', region: 'Kerala' },
  { name: 'Diocese of Sulthan Bathery', slug: 'diocese-of-sulthan-bathery-diocese', legacyPath: 'dioceses/diocese-of-sulthan-bathery-diocese/index.html', region: 'Kerala' },
  { name: 'Diocese of Brahamavar', slug: 'diocese-of-brahamavar', legacyPath: 'dioceses/diocese-of-brahamavar/index.html', region: 'Kerala' },
  
  // Indian Dioceses (Outside Kerala)
  { name: 'Diocese of Madras', slug: 'diocese-of-chennai-diocese', legacyPath: 'dioceses/diocese-of-chennai-diocese/index.html', region: 'India' },
  { name: 'Diocese of Bangalore', slug: 'diocese-of-bangalore', legacyPath: 'dioceses/diocese-of-bangalore/index.html', region: 'India' },
  { name: 'Diocese of Bombay', slug: 'diocese-of-mumbai', legacyPath: 'dioceses/diocese-of-mumbai/index.html', region: 'India' },
  { name: 'Diocese of Calcutta', slug: 'diocese-of-calcutta', legacyPath: 'dioceses/diocese-of-calcutta/index.html', region: 'India' },
  { name: 'Diocese of Delhi', slug: 'diocese-of-delhi', legacyPath: 'dioceses/diocese-of-delhi/index.html', region: 'India' },
  { name: 'Diocese of Ahmedabad', slug: 'diocese-of-ahmedabad', legacyPath: 'dioceses/diocese-of-ahmedabad/index.html', region: 'India' },
  
  // International Dioceses
  { name: 'Diocese of Northeast America', slug: 'northeast-america', legacyPath: 'dioceses/northeast-america/index.html', region: 'International' },
  { name: 'Diocese of South West America', slug: 'diocese-of-south-west-america', legacyPath: 'dioceses/diocese-of-south-west-america/index.html', region: 'International' },
  { name: 'Diocese of UK Europe and Africa', slug: 'diocese-of-uk-europe-and-africa', legacyPath: 'dioceses/diocese-of-uk-europe-and-africa/index.html', region: 'International' }
];

// Function to extract content from HTML
function extractContent(htmlContent) {
  // Extract the main content between cnt-box-inner tags
  const contentMatch = htmlContent.match(/<div class="cnt-box-inner">([\s\S]*?)<\/div>/);
  if (!contentMatch) return null;
  
  const content = contentMatch[1];
  
  // Extract image
  const imageMatch = content.match(/src="([^"]*)"[^>]*class="[^"]*wp-post-image[^"]*"/);
  const imageSrc = imageMatch ? imageMatch[1] : null;
  
  // Extract title
  const titleMatch = content.match(/<h3[^>]*>([^<]+)<\/h3>/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // Extract paragraphs and other content (remove HTML tags)
  const paragraphs = content.match(/<p[^>]*>([\s\S]*?)<\/p>/g);
  const textContent = paragraphs ? paragraphs.map(p => 
    p.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
  ).filter(p => p.length > 0) : [];
  
  // Extract table content if present
  const tableMatch = content.match(/<table[^>]*>([\s\S]*?)<\/table>/);
  if (tableMatch) {
    const tableContent = tableMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (tableContent) {
      textContent.push(tableContent);
    }
  }
  
  return {
    title,
    imageSrc,
    content: textContent
  };
}

// Function to generate Next.js page
function generatePage(diocese) {
  const legacyPath = path.join('code_clone_ref', 'mosc_in', diocese.legacyPath);
  
  if (!fs.existsSync(legacyPath)) {
    console.log(`Legacy file not found: ${legacyPath}`);
    return null;
  }
  
  const htmlContent = fs.readFileSync(legacyPath, 'utf8');
  const extracted = extractContent(htmlContent);
  
  if (!extracted) {
    console.log(`Could not extract content from: ${legacyPath}`);
    return null;
  }
  
  const regionIcon = diocese.region === 'Kerala' ? '🏞️' : diocese.region === 'India' ? '🇮🇳' : '🌍';
  
  const pageContent = `import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: '${diocese.name}',
  description: 'Learn about the ${diocese.name} of the Malankara Orthodox Syrian Church.',
};

const ${diocese.slug.replace(/-/g, '').replace(/[^a-zA-Z0-9]/g, '')}Page = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Diocese">⛪</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              ${diocese.name}
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              ${diocese.region} Diocese of the Malankara Orthodox Syrian Church
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/dioceses/${diocese.slug}.jpg"
                    alt="${diocese.name}"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    ${extracted.title || diocese.name}
                  </h2>
                  
                  ${extracted.content.map(paragraph => 
                    `<p className="font-body text-muted-foreground leading-relaxed mb-6">
                      ${paragraph}
                    </p>`
                  ).join('\n                  ')}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Dioceses
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/dioceses" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Dioceses Overview
                  </Link>
                  <div className="border-t border-border my-2"></div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    ${diocese.region} Dioceses
                  </div>
                  ${dioceseData.filter(d => d.region === diocese.region).map(d => 
                    `<Link 
                      href="/mosc/dioceses/${d.slug}" 
                      className="block px-3 py-2 ${d.slug === diocese.slug ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'} rounded-md font-body text-sm reverent-transition"
                    >
                      ${d.name}
                    </Link>`
                  ).join('\n                  ')}
                </nav>
              </div>

              {/* Quick Links */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Quick Links
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/holy-synod" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Holy Synod
                  </Link>
                  <Link 
                    href="/mosc/ecumenical" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Ecumenical Relations
                  </Link>
                  <Link 
                    href="/mosc/institutions" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Institutions
                  </Link>
                  <Link 
                    href="/mosc/training" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Training
                  </Link>
                  <Link 
                    href="/mosc/publications" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Publications
                  </Link>
                  <Link 
                    href="/mosc/spiritual" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Spiritual Organisations
                  </Link>
                  <Link 
                    href="/mosc/theological" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Theological Seminaries
                  </Link>
                  <Link 
                    href="/mosc/lectionary" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Lectionary
                  </Link>
                  <Link 
                    href="/mosc/gallery" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Gallery
                  </Link>
                  <Link 
                    href="/mosc/contact-info" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Contact Info
                  </Link>
                  <Link 
                    href="/mosc/faqs" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    FAQs
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ${diocese.slug.replace(/-/g, '').replace(/[^a-zA-Z0-9]/g, '')}Page;`;

  return pageContent;
}

// Generate all pages
console.log('Generating diocese pages...');

dioceseData.forEach((diocese, index) => {
  console.log(`Processing ${index + 1}/${dioceseData.length}: ${diocese.name}`);
  
  // Create directory
  const dirPath = path.join('src', 'app', 'mosc', 'dioceses', diocese.slug);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Generate page content
  const pageContent = generatePage(diocese);
  if (pageContent) {
    const filePath = path.join(dirPath, 'page.tsx');
    fs.writeFileSync(filePath, pageContent);
    console.log(`✓ Created: ${filePath}`);
  } else {
    console.log(`✗ Failed: ${diocese.name}`);
  }
});

console.log('Generation complete!');

