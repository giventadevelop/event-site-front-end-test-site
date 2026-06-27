import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Metropolitan data mapping from the main page
const metropolitanData = [
  {
    name: 'H. G. Dr. Thomas Mar Athanasius Metropolitan',
    slug: 'his-grace-dr-thomas-mar-athanasius',
    legacyPath: 'holysynod/his-grace-dr-thomas-mar-athanasius/index.html',
    imageName: 'thomas-mar-athanasius.jpg'
  },
  {
    name: 'H.G. Dr. Yuhanon Mar Meletius Metropolitan',
    slug: 'h-g-dr-yuhanon-mor-meletius-metropolitan',
    legacyPath: 'holysynod/h-g-dr-yuhanon-mor-meletius-metropolitan/index.html',
    imageName: 'yuhanon-mar-meletius.jpg'
  },
  {
    name: 'H.G. Kuriakose Mar Clemis Metropolitan',
    slug: 'his-grace-kuriakose-mar-clemis',
    legacyPath: 'holysynod/his-grace-kuriakose-mar-clemis/index.html',
    imageName: 'kuriakose-mar-clemis.jpg'
  },
  {
    name: 'H.G.Geevarghese Mar Coorilos Metropolitan',
    slug: 'his-grace-geevarghese-mar-coorilose-metropolitan',
    legacyPath: 'holysynod/his-grace-geevarghese-mar-coorilose-metropolitan/index.html',
    imageName: 'geevarghese-mar-coorilos.jpg'
  },
  {
    name: 'H.G. Zachariah Mar Nicholovos Metropolitan',
    slug: 'h-g-zachariah-mar-nicholovos-metropolitan',
    legacyPath: 'holysynod/h-g-zachariah-mar-nicholovos-metropolitan/index.html',
    imageName: 'zachariah-mar-nicholovos.jpg'
  },
  {
    name: 'H.G. Dr. Yakoob Mar Irenaios Metropolitan',
    slug: 'his-grace-jacob-mar-irenios',
    legacyPath: 'holysynod/his-grace-jacob-mar-irenios/index.html',
    imageName: 'yakoob-mar-irenaios.jpg'
  },
  {
    name: 'H.G. Dr. Gabriel Mar Gregorios Metropolitan',
    slug: 'his-grace-dr-gabriel-mar-gregorios',
    legacyPath: 'holysynod/his-grace-dr-gabriel-mar-gregorios/index.html',
    imageName: 'gabriel-mar-gregorios.jpg'
  },
  {
    name: 'H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan',
    slug: 'his-grace-dr-yoohanon-mar-chrysostamus',
    legacyPath: 'holysynod/his-grace-dr-yoohanon-mar-chrysostamus/index.html',
    imageName: 'yuhanon-mar-chrisostomos.jpg'
  },
  {
    name: 'H.G.Yuhanon Mar Policarpos Metropolitan',
    slug: 'h-g-youhanon-mar-polycarpus-metropolitan',
    legacyPath: 'holysynod/h-g-youhanon-mar-polycarpus-metropolitan/index.html',
    imageName: 'yuhanon-mar-policarpos.jpg'
  },
  {
    name: 'H. G. Mathews Mar Theodosius Metropolitan',
    slug: 'h-g-mathews-mar-theodosius',
    legacyPath: 'holysynod/h-g-mathews-mar-theodosius/index.html',
    imageName: 'mathews-mar-theodosius.jpg'
  },
  {
    name: 'H.G.Dr. Joseph Mar Dionysius Metropolitan',
    slug: 'h-g-joseph-mar-dionysius-metropolitan',
    legacyPath: 'holysynod/h-g-joseph-mar-dionysius-metropolitan/index.html',
    imageName: 'joseph-mar-dionysius.jpg'
  },
  {
    name: 'H. G. Abraham Mar Epiphanios Metropolitan',
    slug: 'h-g-abraham-mar-epiphanios',
    legacyPath: 'holysynod/h-g-abraham-mar-epiphanios/index.html',
    imageName: 'abraham-mar-epiphanios.jpg'
  },
  {
    name: 'H. G. Dr. Mathews Mar Thimothios Metropolitan',
    slug: 'h-g-dr-mathews-mar-thimothios-metropolitan',
    legacyPath: 'holysynod/h-g-dr-mathews-mar-thimothios-metropolitan/index.html',
    imageName: 'mathews-mar-thimothios.jpg'
  },
  {
    name: 'H. G. Alexios mar Eusebius Metropolitan',
    slug: 'h-g-alexios-mar-eusebius-metropolitan',
    legacyPath: 'holysynod/h-g-alexios-mar-eusebius-metropolitan/index.html',
    imageName: 'alexios-mar-eusebius.jpg'
  },
  {
    name: 'H.G. Dr. Yuhanon Mar Diascoros Metropolitan',
    slug: 'h-g-dr-yuhanon-mar-dioscoros-metropolitan',
    legacyPath: 'holysynod/h-g-dr-yuhanon-mar-dioscoros-metropolitan/index.html',
    imageName: 'yuhanon-mar-diascoros.jpg'
  },
  {
    name: 'H.G. Dr. Youhanon Mar Demetrios Metropolitan',
    slug: 'h-g-dr-yuhanon-mar-demetrius-metropolitan',
    legacyPath: 'holysynod/h-g-dr-yuhanon-mar-demetrius-metropolitan/index.html',
    imageName: 'youhanon-mar-demetrios.jpg'
  },
  {
    name: 'H.G. Dr.Yuhanon Mar Thevodoros Metropolitan',
    slug: 'h-g-yuhanon-mar-theodorus-metropolitan',
    legacyPath: 'holysynod/h-g-yuhanon-mar-theodorus-metropolitan/index.html',
    imageName: 'yuhanon-mar-thevodoros.jpg'
  },
  {
    name: 'H.G. Yakob Mar Elias Metropolitan',
    slug: 'h-g-yakoob-mar-elias-metropolitan',
    legacyPath: 'holysynod/h-g-yakoob-mar-elias-metropolitan/index.html',
    imageName: 'yakob-mar-elias.jpg'
  },
  {
    name: 'H. G. Dr.Joshua Mar Nicodimos Metropolitan',
    slug: 'h-g-joshua-mar-nicodemus-metropolitan',
    legacyPath: 'holysynod/h-g-joshua-mar-nicodemus-metropolitan/index.html',
    imageName: 'joshua-mar-nicodimos.jpg'
  },
  {
    name: 'H.G. Dr. Zacharias Mar Aprem Metropolitan',
    slug: 'h-g-dr-zacharias-mar-aprem-metropolitan',
    legacyPath: 'holysynod/h-g-dr-zacharias-mar-aprem-metropolitan/index.html',
    imageName: 'zacharias-mar-aprem.jpg'
  },
  {
    name: 'H.G. Dr. Geevarghese Mar Yulios Metropolitan',
    slug: 'h-g-dr-geevarghese-mar-julius-metropolitan',
    legacyPath: 'holysynod/h-g-dr-geevarghese-mar-julius-metropolitan/index.html',
    imageName: 'geevarghese-mar-yulios.jpg'
  },
  {
    name: 'H.G. Dr. Abraham Mar Seraphim Metropolitan',
    slug: 'h-g-dr-abraham-mar-seraphim-metropolitan',
    legacyPath: 'holysynod/h-g-dr-abraham-mar-seraphim-metropolitan/index.html',
    imageName: 'abraham-mar-seraphim.jpg'
  },
  {
    name: 'H.G. Abraham Mar Stephanos Metropolitan',
    slug: 'h-g-abraham-mar-stephanos-metropolitan',
    legacyPath: 'holysynod/h-g-abraham-mar-stephanos-metropolitan/index.html',
    imageName: 'abraham-mar-stephanos.jpg'
  },
  {
    name: 'H.G. Dr. Thomas Mar Ivanios Metropolitan',
    slug: 'h-g-thomas-mar-ivanios-metropolitan',
    legacyPath: 'holysynod/h-g-thomas-mar-ivanios-metropolitan/index.html',
    imageName: 'thomas-mar-ivanios.jpg'
  },
  {
    name: 'H.G. Dr. Geevarghese Mar Theophilos Metropolitan',
    slug: 'hg-dr-geevarghese-mar-theophilos-metropolitan',
    legacyPath: 'holysynod/hg-dr-geevarghese-mar-theophilos-metropolitan/index.html',
    imageName: 'geevarghese-mar-theophilos.jpg'
  },
  {
    name: 'H.G. Geevarghese Mar Philoxenos Metropolitan',
    slug: 'h-g-geevarghese-mar-philaxenos-metropolitan',
    legacyPath: 'holysynod/h-g-geevarghese-mar-philaxenos-metropolitan/index.html',
    imageName: 'geevarghese-mar-philoxenos.jpg'
  },
  {
    name: 'H.G. Geevarghese Mar Pachomios Metropolitan',
    slug: 'h-g-geevarghese-mar-pachomios-metropolitan',
    legacyPath: 'holysynod/h-g-geevarghese-mar-pachomios-metropolitan/index.html',
    imageName: 'geevarghese-mar-pachomios.jpg'
  },
  {
    name: 'H.G. Dr. Geevarghese Mar Barnabas Metropolitan',
    slug: 'h-g-dr-geevarghese-mar-barnabas-metropolitan',
    legacyPath: 'holysynod/h-g-dr-geevarghese-mar-barnabas-metropolitan/index.html',
    imageName: 'geevarghese-mar-barnabas.jpg'
  },
  {
    name: 'H.G. Zachariah Mar Severios Metropolitan',
    slug: 'h-g-zacharia-mar-severios-metropolitan',
    legacyPath: 'holysynod/h-g-zacharia-mar-severios-metropolitan/index.html',
    imageName: 'zachariah-mar-severios.jpg'
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
function generatePage(metropolitan) {
  const legacyPath = path.join('code_clone_ref', 'mosc_in', metropolitan.legacyPath);
  
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
  title: '${metropolitan.name}',
  description: 'Biography and information about ${metropolitan.name}.',
};

const ${metropolitan.slug.replace(/-/g, '').replace(/[^a-zA-Z0-9]/g, '')}Page = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Metropolitan">👨‍💼</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              ${metropolitan.name}
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Metropolitan of the Malankara Orthodox Syrian Church
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
                    src="/images/holy-synod/${metropolitan.imageName}"
                    alt="${metropolitan.name}"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Biography
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
                  Holy Synod
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc/holy-synod" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Holy Synod Overview
                  </Link>
                  <Link 
                    href="/mosc/holy-synod/his-holiness-baselios-marthoma-mathews-iii" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    His Holiness the Catholicos
                  </Link>
                  <Link 
                    href="/mosc/holy-synod/${metropolitan.slug}" 
                    className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
                  >
                    ${metropolitan.name}
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

export default ${metropolitan.slug.replace(/-/g, '').replace(/[^a-zA-Z0-9]/g, '')}Page;`;

  return pageContent;
}

// Generate all pages
console.log('Generating metropolitan pages...');

metropolitanData.forEach((metropolitan, index) => {
  console.log(`Processing ${index + 1}/${metropolitanData.length}: ${metropolitan.name}`);
  
  // Create directory
  const dirPath = path.join('src', 'app', 'mosc', 'holy-synod', metropolitan.slug);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Generate page content
  const pageContent = generatePage(metropolitan);
  if (pageContent) {
    const filePath = path.join(dirPath, 'page.tsx');
    fs.writeFileSync(filePath, pageContent);
    console.log(`✓ Created: ${filePath}`);
  } else {
    console.log(`✗ Failed: ${metropolitan.name}`);
  }
});

console.log('Generation complete!');
