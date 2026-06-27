import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Saint data mapping from the main page
const saintData = [
  {
    title: 'The Apostles',
    slug: 'the-apostles',
    legacyPath: 'saints/the-apostles/index.html',
    icon: '👥',
    description: 'The twelve apostles of Jesus Christ and their missionary work'
  },
  {
    title: 'St. Mary Mother of God',
    slug: 'st-mary-mother-of-god',
    legacyPath: 'saints/st-mary-mother-of-god/index.html',
    icon: '👸',
    description: 'The Theotokos and her role in salvation history'
  },
  {
    title: 'Church Fathers',
    slug: 'church-fathers',
    legacyPath: 'saints/early-church-father/index.html',
    icon: '📚',
    description: 'The early church fathers and their theological contributions'
  },
  {
    title: 'Indian Saints',
    slug: 'indian-saints',
    legacyPath: 'saints/st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios/index.html',
    icon: '🇮🇳',
    description: 'Saints who lived and served in the Indian Orthodox tradition'
  }
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
    p.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').trim()
  ).filter(p => p.length > 0) : [];
  
  // Extract table content if present
  const tableMatch = content.match(/<table[^>]*>([\s\S]*?)<\/table>/);
  if (tableMatch) {
    const tableContent = tableMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (tableContent) {
      textContent.push(tableContent);
    }
  }
  
  // Extract list content
  const listItems = content.match(/<li[^>]*>([\s\S]*?)<\/li>/g);
  if (listItems) {
    const listContent = listItems.map(li => 
      li.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').trim()
    ).filter(li => li.length > 0);
    textContent.push(...listContent);
  }
  
  return {
    title,
    imageSrc,
    content: textContent
  };
}

// Function to generate Next.js page
function generatePage(saint) {
  const legacyPath = path.join('code_clone_ref', 'mosc_in', saint.legacyPath);
  
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
  
  const pageContent = `import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: '${saint.title}',
  description: '${saint.description}',
};

const ${saint.slug.replace(/-/g, '').replace(/[^a-zA-Z0-9]/g, '')}Page = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Saint">${saint.icon}</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              ${saint.title}
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              ${saint.description}
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
                    src="/images/saints/${saint.slug}.jpg"
                    alt="${saint.title}"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    ${extracted.title || saint.title}
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
                  Saints Categories
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/saints" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Saints Overview
                  </Link>
                  <div className="border-t border-border my-2"></div>
                  ${saintData.map(s => 
                    `<Link 
                      href="/mosc/saints/${s.slug}" 
                      className="block px-3 py-2 ${s.slug === saint.slug ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'} rounded-md font-body text-sm reverent-transition"
                    >
                      ${s.title}
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
                    href="/mosc/the-church" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    The Church
                  </Link>
                  <Link 
                    href="/mosc/holy-synod" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Holy Synod
                  </Link>
                  <Link 
                    href="/mosc/dioceses" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Dioceses
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

export default ${saint.slug.replace(/-/g, '').replace(/[^a-zA-Z0-9]/g, '')}Page;`;

  return pageContent;
}

// Generate all pages
console.log('Generating saint pages...');

saintData.forEach((saint, index) => {
  console.log(`Processing ${index + 1}/${saintData.length}: ${saint.title}`);
  
  // Create directory
  const dirPath = path.join('src', 'app', 'mosc', 'saints', saint.slug);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Generate page content
  const pageContent = generatePage(saint);
  if (pageContent) {
    const filePath = path.join(dirPath, 'page.tsx');
    fs.writeFileSync(filePath, pageContent);
    console.log(`✓ Created: ${filePath}`);
  } else {
    console.log(`✗ Failed: ${saint.title}`);
  }
});

console.log('Generation complete!');

