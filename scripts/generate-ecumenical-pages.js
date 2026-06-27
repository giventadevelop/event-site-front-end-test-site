import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ecumenical pages data mapping
const ecumenicalData = [
  {
    title: 'World Council of Churches',
    slug: 'world-council-of-churches',
    legacyPath: 'ecumenical/department-of-ecumenical-relations/index.html',
    imageName: 'world-council-of-churches.jpg',
    icon: '🌍'
  },
  {
    title: 'Orthodox Churches',
    slug: 'orthodox-churches',
    legacyPath: 'ecumenical/the-relation-between-orthodox-churches/index.html',
    imageName: 'orthodox-churches.jpg',
    icon: '⛪'
  },
  {
    title: 'Catholic Church',
    slug: 'catholic-church',
    legacyPath: 'ecumenical/relationship-with-the-catholic-church/index.html',
    imageName: 'catholic-church.jpg',
    icon: '✟'
  },
  {
    title: 'Protestant Churches',
    slug: 'protestant-churches',
    legacyPath: 'ecumenical/co-operation-with-the-protestant-churches/index.html',
    imageName: 'protestant-churches.jpg',
    icon: '📖'
  },
  {
    title: 'Oriental Orthodox',
    slug: 'oriental-orthodox',
    legacyPath: 'ecumenical/the-relation-between-orthodox-churches/index.html',
    imageName: 'oriental-orthodox.jpg',
    icon: '🤝'
  },
  {
    title: 'Interfaith Dialogue',
    slug: 'interfaith-dialogue',
    legacyPath: 'ecumenical/ecumenical-ventures-in-modern-times/index.html',
    imageName: 'interfaith-dialogue.jpg',
    icon: '🕊️'
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
  
  // Extract paragraphs (remove HTML tags)
  const paragraphs = content.match(/<p[^>]*>([\s\S]*?)<\/p>/g);
  const textContent = paragraphs ? paragraphs.map(p => 
    p.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
  ).filter(p => p.length > 0) : [];
  
  return {
    title,
    imageSrc,
    content: textContent
  };
}

// Function to generate Next.js page
function generatePage(ecumenical) {
  const legacyPath = path.join('code_clone_ref', 'mosc_in', ecumenical.legacyPath);
  
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
  title: '${ecumenical.title}',
  description: 'Learn about the ${ecumenical.title.toLowerCase()} relations of the Malankara Orthodox Syrian Church.',
};

const ${ecumenical.slug.replace(/-/g, '').replace(/[^a-zA-Z0-9]/g, '')}Page = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="${ecumenical.title}">${ecumenical.icon}</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              ${ecumenical.title}
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              ${ecumenical.title === 'World Council of Churches' ? 'Active participation in global Christian unity initiatives' :
                ecumenical.title === 'Orthodox Churches' ? 'Relations with other Orthodox jurisdictions worldwide' :
                ecumenical.title === 'Catholic Church' ? 'Dialogue and cooperation with the Roman Catholic Church' :
                ecumenical.title === 'Protestant Churches' ? 'Relations with various Protestant denominations' :
                ecumenical.title === 'Oriental Orthodox' ? 'Unity within the Oriental Orthodox family' :
                'Engagement with other religious traditions'}
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
                    src="/images/ecumenical/${ecumenical.imageName}"
                    alt="${ecumenical.title}"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    ${extracted.title || ecumenical.title}
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
                  Ecumenical Relations
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/ecumenical" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Ecumenical Overview
                  </Link>
                  <Link 
                    href="/mosc/ecumenical/world-council-of-churches" 
                    className="block px-3 py-2 ${ecumenical.slug === 'world-council-of-churches' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'} rounded-md font-body text-sm reverent-transition"
                  >
                    World Council of Churches
                  </Link>
                  <Link 
                    href="/mosc/ecumenical/orthodox-churches" 
                    className="block px-3 py-2 ${ecumenical.slug === 'orthodox-churches' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'} rounded-md font-body text-sm reverent-transition"
                  >
                    Orthodox Churches
                  </Link>
                  <Link 
                    href="/mosc/ecumenical/catholic-church" 
                    className="block px-3 py-2 ${ecumenical.slug === 'catholic-church' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'} rounded-md font-body text-sm reverent-transition"
                  >
                    Catholic Church
                  </Link>
                  <Link 
                    href="/mosc/ecumenical/protestant-churches" 
                    className="block px-3 py-2 ${ecumenical.slug === 'protestant-churches' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'} rounded-md font-body text-sm reverent-transition"
                  >
                    Protestant Churches
                  </Link>
                  <Link 
                    href="/mosc/ecumenical/oriental-orthodox" 
                    className="block px-3 py-2 ${ecumenical.slug === 'oriental-orthodox' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'} rounded-md font-body text-sm reverent-transition"
                  >
                    Oriental Orthodox
                  </Link>
                  <Link 
                    href="/mosc/ecumenical/interfaith-dialogue" 
                    className="block px-3 py-2 ${ecumenical.slug === 'interfaith-dialogue' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-muted'} rounded-md font-body text-sm reverent-transition"
                  >
                    Interfaith Dialogue
                  </Link>
                </nav>
              </div>

              {/* Quick Links */}
              <div className="bg-background rounded-lg sacred-shadow p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Quick Links
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/downloads/kalpana" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Kalpana
                  </Link>
                  <Link 
                    href="/mosc/downloads" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Downloads
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

export default ${ecumenical.slug.replace(/-/g, '').replace(/[^a-zA-Z0-9]/g, '')}Page;`;

  return pageContent;
}

// Generate all pages
console.log('Generating ecumenical pages...');

ecumenicalData.forEach((ecumenical, index) => {
  console.log(`Processing ${index + 1}/${ecumenicalData.length}: ${ecumenical.title}`);
  
  // Create directory
  const dirPath = path.join('src', 'app', 'mosc', 'ecumenical', ecumenical.slug);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Generate page content
  const pageContent = generatePage(ecumenical);
  if (pageContent) {
    const filePath = path.join(dirPath, 'page.tsx');
    fs.writeFileSync(filePath, pageContent);
    console.log(`✓ Created: ${filePath}`);
  } else {
    console.log(`✗ Failed: ${ecumenical.title}`);
  }
});

console.log('Generation complete!');

