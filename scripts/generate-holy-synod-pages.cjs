const fs = require('fs');
const path = require('path');

// Map of legacy folder names to new route paths
const memberRoutes = {
  'his-holiness-baselios-marthoma-mathews-iii.html': {
    route: 'his-holiness-baselios-marthoma-mathews-iii',
    image: 'hh-scaled.jpg',
    imagePath: '../wp-content/uploads/2015/05/hh-scaled.jpg'
  },
  'his-grace-dr-thomas-mar-athanasius': {
    route: 'his-grace-dr-thomas-mar-athanasius',
    image: 'ath.jpg',
    imagePath: '../../wp-content/uploads/2015/05/ath.jpg'
  },
  'h-g-dr-yuhanon-mor-meletius-metropolitan': {
    route: 'h-g-dr-yuhanon-mor-meletius-metropolitan',
    image: 'milithios.jpg',
    imagePath: '../../wp-content/uploads/2015/05/milithios.jpg'
  },
  'his-grace-kuriakose-mar-clemis': {
    route: 'his-grace-kuriakose-mar-clemis',
    image: 'mar-clemis.jpg',
    imagePath: '../../wp-content/uploads/2015/05/mar-clemis.jpg'
  },
  'his-grace-geevarghese-mar-coorilose-metropolitan': {
    route: 'his-grace-geevarghese-mar-coorilose-metropolitan',
    image: 'coor.jpg',
    imagePath: '../../wp-content/uploads/2015/05/coor.jpg'
  },
  'h-g-zachariah-mar-nicholovos-metropolitan': {
    route: 'h-g-zachariah-mar-nicholovos-metropolitan',
    image: 'nico.png',
    imagePath: '../../wp-content/uploads/2015/05/nico.png'
  },
  'his-grace-jacob-mar-irenios': {
    route: 'his-grace-jacob-mar-irenios',
    image: 'irne.jpg',
    imagePath: '../../wp-content/uploads/2015/05/irne.jpg'
  },
  'his-grace-dr-gabriel-mar-gregorios': {
    route: 'his-grace-dr-gabriel-mar-gregorios',
    image: 'mar-gregorios.jpg',
    imagePath: '../../wp-content/uploads/2015/05/mar-gregorios.jpg'
  },
  'his-grace-dr-yoohanon-mar-chrysostamus': {
    route: 'his-grace-dr-yoohanon-mar-chrysostamus',
    image: 'chris.jpg',
    imagePath: '../../wp-content/uploads/2015/05/chris.jpg'
  },
  'h-g-youhanon-mar-polycarpus-metropolitan': {
    route: 'h-g-youhanon-mar-polycarpus-metropolitan',
    image: 'poly.jpg',
    imagePath: '../../wp-content/uploads/2015/05/poly.jpg'
  },
  'h-g-mathews-mar-theodosius': {
    route: 'h-g-mathews-mar-theodosius',
    image: 'thevo.jpg',
    imagePath: '../../wp-content/uploads/2015/05/thevo.jpg'
  },
  'h-g-joseph-mar-dionysius-metropolitan': {
    route: 'h-g-joseph-mar-dionysius-metropolitan',
    image: 'cul.jpg',
    imagePath: '../../wp-content/uploads/2015/05/cul.jpg'
  },
  'h-g-abraham-mar-epiphanios': {
    route: 'h-g-abraham-mar-epiphanios',
    image: 'mar-ephipanios.jpg',
    imagePath: '../../wp-content/uploads/2015/05/mar-ephipanios.jpg'
  },
  'h-g-dr-mathews-mar-thimothios-metropolitan': {
    route: 'h-g-dr-mathews-mar-thimothios-metropolitan',
    image: 'thimothios.jpg',
    imagePath: '../../wp-content/uploads/2015/05/thimothios.jpg'
  },
  'h-g-alexios-mar-eusebius-metropolitan': {
    route: 'h-g-alexios-mar-eusebius-metropolitan',
    image: 'eusebius.jpg',
    imagePath: '../../wp-content/uploads/2015/05/eusebius.jpg'
  },
  'h-g-dr-yuhanon-mar-dioscoros-metropolitan': {
    route: 'h-g-dr-yuhanon-mar-dioscoros-metropolitan',
    image: 'pani.jpg',
    imagePath: '../../wp-content/uploads/2015/05/pani.jpg'
  },
  'h-g-dr-yuhanon-mar-demetrius-metropolitan': {
    route: 'h-g-dr-yuhanon-mar-demetrius-metropolitan',
    image: 'del.jpg',
    imagePath: '../../wp-content/uploads/2015/05/del.jpg'
  },
  'h-g-yuhanon-mar-theodorus-metropolitan': {
    route: 'h-g-yuhanon-mar-theodorus-metropolitan',
    image: 'mar-thevodoros.jpg',
    imagePath: '../../wp-content/uploads/2015/05/mar-thevodoros.jpg'
  },
  'h-g-yakoob-mar-elias-metropolitan': {
    route: 'h-g-yakoob-mar-elias-metropolitan',
    image: 'mar-eliyas.jpg',
    imagePath: '../../wp-content/uploads/2015/05/mar-eliyas.jpg'
  },
  'h-g-joshua-mar-nicodemus-metropolitan': {
    route: 'h-g-joshua-mar-nicodemus-metropolitan',
    image: 'mar-nicodimos.jpg',
    imagePath: '../../wp-content/uploads/2015/05/mar-nicodimos.jpg'
  },
  'h-g-dr-zacharias-mar-aprem-metropolitan': {
    route: 'h-g-dr-zacharias-mar-aprem-metropolitan',
    image: 'mar-aprem.jpg',
    imagePath: '../../wp-content/uploads/2015/05/mar-aprem.jpg'
  },
  'h-g-dr-geevarghese-mar-julius-metropolitan': {
    route: 'h-g-dr-geevarghese-mar-julius-metropolitan',
    image: 'yulios.jpg',
    imagePath: '../../wp-content/uploads/2015/05/yulios.jpg'
  },
  'h-g-dr-abraham-mar-seraphim-metropolitan': {
    route: 'h-g-dr-abraham-mar-seraphim-metropolitan',
    image: 'sera.png',
    imagePath: '../../wp-content/uploads/2015/05/sera.png'
  },
  'h-g-abraham-mar-stephanos-metropolitan': {
    route: 'h-g-abraham-mar-stephanos-metropolitan',
    image: 'Abraham-Mar-Stephanos.png',
    imagePath: '../wp-content/uploads/2022/07/Abraham-Mar-Stephanos.png'
  },
  'h-g-thomas-mar-ivanios-metropolitan': {
    route: 'h-g-thomas-mar-ivanios-metropolitan',
    image: 'Thomas-Mar-Ivanios.png',
    imagePath: '../wp-content/uploads/2022/07/Thomas-Mar-Ivanios.png'
  },
  'hg-dr-geevarghese-mar-theophilos-metropolitan': {
    route: 'hg-dr-geevarghese-mar-theophilos-metropolitan',
    image: 'Dr-Geevarghese-Mar-Theophilos.png',
    imagePath: '../wp-content/uploads/2022/07/Dr-Geevarghese-Mar-Theophilos.png'
  },
  'h-g-geevarghese-mar-philaxenos-metropolitan': {
    route: 'h-g-geevarghese-mar-philaxenos-metropolitan',
    image: 'Geevarghese-Mar-Philaxenos.png',
    imagePath: '../wp-content/uploads/2022/07/Geevarghese-Mar-Philaxenos.png'
  },
  'h-g-geevarghese-mar-pachomios-metropolitan': {
    route: 'h-g-geevarghese-mar-pachomios-metropolitan',
    image: 'Geevarghese-Mar-Pachomios-300x193-1.jpg',
    imagePath: '../wp-content/uploads/2022/07/Geevarghese-Mar-Pachomios-300x193-1.jpg'
  },
  'h-g-dr-geevarghese-mar-barnabas-metropolitan': {
    route: 'h-g-dr-geevarghese-mar-barnabas-metropolitan',
    image: 'Geevarghese-Mar-Barnabas.png',
    imagePath: '../wp-content/uploads/2022/07/Geevarghese-Mar-Barnabas.png'
  },
  'h-g-zacharia-mar-severios-metropolitan': {
    route: 'h-g-zacharia-mar-severios-metropolitan',
    image: 'zaker.jpg',
    imagePath: '../wp-content/uploads/2022/07/zaker.jpg'
  }
};

// Function to extract content from HTML
function extractContent(html) {
  const content = {
    name: '',
    paragraphs: [],
    contactInfo: []
  };

  // Extract name from h3 tag
  const nameMatch = html.match(/<h3[^>]*>([^<]+)<\/h3>/);
  if (nameMatch) {
    content.name = nameMatch[1].trim();
  }

  // Find the content box inner div
  const contentBoxMatch = html.match(/<div class="cnt-box-inner">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="col-md-3/);
  if (!contentBoxMatch) {
    return content;
  }

  const contentBox = contentBoxMatch[1];

  // First, try to extract content from p tags (older pages)
  const paragraphMatches = contentBox.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g);
  for (const match of paragraphMatches) {
    let text = match[1]
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8211;/g, '-')
      .replace(/&#038;/g, '&')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (text && text.length > 10) {
      // Check if it's contact info (contains Address, Email, Phone, etc.)
      if (text.match(/Address|Email|Phone|ph\s*:|Cell:|Tel:|Facebook|Instagram|Visit|website/i)) {
        // Extract email links
        const emailMatch = text.match(/<a[^>]*href="mailto:([^"]+)"[^>]*>([^<]+)<\/a>/);
        if (emailMatch) {
          text = text.replace(/<a[^>]*href="mailto:[^"]*"[^>]*>([^<]+)<\/a>/g, emailMatch[2] || emailMatch[1]);
        }
        // Extract regular links
        text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/g, '$2 ($1)');
        text = text.replace(/<[^>]+>/g, ''); // Remove any remaining HTML
        content.contactInfo.push(text);
      } else {
        // Remove any links but keep text
        text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/g, '$2');
        text = text.replace(/<[^>]+>/g, ''); // Remove any remaining HTML
        if (text.length > 10) {
          content.paragraphs.push(text);
        }
      }
    }
  }

  // If no paragraphs found, extract plain text content (newer pages)
  if (content.paragraphs.length === 0) {
    // Remove image and h3 tags to get the remaining content
    let textContent = contentBox
      .replace(/<img[^>]*>/g, '') // Remove image tags
      .replace(/<h3[^>]*>([^<]+)<\/h3>/g, '') // Remove h3 tags
      .replace(/<strong[^>]*>/g, '\n<strong>') // Add line break before strong tags
      .replace(/<\/strong>/g, '</strong>\n') // Add line break after strong tags
      .replace(/<[^>]+>/g, ' ') // Replace other HTML tags with spaces
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ') // Convert &nbsp; to spaces
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8211;/g, '-')
      .replace(/&#038;/g, '&')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Extract email and phone links before removing HTML
    const emailLinks = [];
    const phoneLinks = [];
    const webLinks = [];
    contentBox.replace(/<a[^>]*href="mailto:([^"]+)"[^>]*>([^<]+)<\/a>/g, (match, email, text) => {
      emailLinks.push(text || email);
      return '';
    });
    contentBox.replace(/<a[^>]*href="tel:([^"]+)"[^>]*>([^<]+)<\/a>/g, (match, phone, text) => {
      phoneLinks.push(text || phone);
      return '';
    });
    contentBox.replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g, (match, url, text) => {
      if (url && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
        webLinks.push({ text, url });
      }
      return '';
    });

    // Split by patterns that indicate paragraph breaks (multiple spaces, or specific keywords)
    // Look for patterns like "Address", "Email", "Phone" that indicate contact section
    const contactKeywords = /(Address|Email|Phone|Mob|Tel|Web|Urshlem)/i;
    const parts = textContent.split(contactKeywords);
    
    let currentParagraph = '';
    let inContactSection = false;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      // Check if this part is a contact keyword
      if (part.match(/^(Address|Email|Phone|Mob|Tel|Web|Urshlem)$/i)) {
        // Save current paragraph if exists
        if (currentParagraph.trim().length > 20) {
          content.paragraphs.push(currentParagraph.trim());
          currentParagraph = '';
        }
        inContactSection = true;
        // Add the keyword and next part as contact info
        if (i + 1 < parts.length) {
          const nextPart = parts[i + 1].trim();
          if (nextPart) {
            content.contactInfo.push(`${part} ${nextPart}`);
            i++; // Skip next part as we've processed it
          } else {
            content.contactInfo.push(part);
          }
        } else {
          content.contactInfo.push(part);
        }
        continue;
      }

      // If we're in contact section, add to contact info
      if (inContactSection || part.match(/@|^\+\d|^\d{10,}/)) {
        content.contactInfo.push(part);
        continue;
      }

      // Otherwise, build paragraphs
      if (part.length > 5) {
        if (currentParagraph) {
          currentParagraph += ' ' + part;
        } else {
          currentParagraph = part;
        }
        
        // If paragraph is getting long (more than 300 chars) or ends with period, save it
        if (currentParagraph.length > 300 || currentParagraph.match(/\.\s*$/)) {
          content.paragraphs.push(currentParagraph.trim());
          currentParagraph = '';
        }
      }
    }

    // Save any remaining paragraph
    if (currentParagraph.trim().length > 20) {
      content.paragraphs.push(currentParagraph.trim());
    }

    // Add extracted email/phone/web links to contact info
    emailLinks.forEach(email => {
      if (!content.contactInfo.some(info => info.includes(email))) {
        content.contactInfo.push(`Email: ${email}`);
      }
    });
    phoneLinks.forEach(phone => {
      if (!content.contactInfo.some(info => info.includes(phone))) {
        content.contactInfo.push(`Phone: ${phone}`);
      }
    });
    webLinks.forEach(({ text, url }) => {
      if (!content.contactInfo.some(info => info.includes(url))) {
        content.contactInfo.push(`Web: ${text} (${url})`);
      }
    });

    // Clean up contact info formatting
    content.contactInfo = content.contactInfo.map(info => {
      return info
        .replace(/\s+([:\.])/g, '$1') // Remove space before colons and periods
        .replace(/([:\.,])\s+/g, '$1 ') // Ensure single space after punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    });
  }

  // Also extract divs with content (some legacy pages use divs instead of p tags)
  const divMatches = contentBox.matchAll(/<div[^>]*align="(?:center|left|justify)"[^>]*>([\s\S]*?)<\/div>/g);
  for (const match of divMatches) {
    let text = match[1]
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/g, '$1') // Extract p tags inside divs
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8211;/g, '-')
      .replace(/&#038;/g, '&')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (text && text.length > 20 && !text.match(/^\s*$/)) {
      // Check if it's contact info
      if (text.match(/Address|Email|Phone|ph\s*:|Cell:|Tel:|Facebook|Instagram|Visit|website/i)) {
        content.contactInfo.push(text);
      } else {
        // Avoid duplicates
        if (!content.paragraphs.some(p => p.substring(0, 50) === text.substring(0, 50))) {
          content.paragraphs.push(text);
        }
      }
    }
  }

  // Extract address if present in <address> tags
  const addressMatches = contentBox.matchAll(/<address[^>]*>([\s\S]*?)<\/address>/g);
  for (const match of addressMatches) {
    let addressText = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    if (addressText) {
      content.contactInfo.push(addressText);
    }
  }

  return content;
}

// Function to generate page component
function generatePage(route, memberData, content) {
  const isCatholicos = route === 'his-holiness-baselios-marthoma-mathews-iii';
  const pageContent = `import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: '${content.name}',
  description: 'Biography and information about ${content.name}.',
};

const ${route.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page = () => {
  return (
    <div className="bg-background">
      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Featured Image - Left Side */}
                  <div className="flex-shrink-0">
                    <div className="w-64 h-auto">
                      <Image
                        src="/images/holy-synod/${memberData.image}"
                        alt="${content.name}"
                        width={300}
                        height={${isCatholicos ? 400 : 193}}
                        className="rounded-lg sacred-shadow w-full h-auto object-contain"
                        priority
                      />
                    </div>
                  </div>

                  {/* Content - Right Side of Image */}
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
                      ${content.name}
                    </h3>

                    <div className="prose prose-lg max-w-none">
${content.paragraphs.map(p => `                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        ${p.replace(/'/g, "\\'").replace(/\\n/g, ' ')}
                      </p>`).join('\n\n')}

${content.contactInfo.length > 0 ? `                      <div className="mt-6 pt-6 border-t border-border">
${content.contactInfo.map(info => {
  // Format contact info - split by line breaks if present
  const cleanInfo = info.replace(/<[^>]+>/g, '').replace(/\\n/g, ' ').trim();
  return `                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          ${cleanInfo.replace(/'/g, "\\'")}
                        </p>`;
}).join('\n')}
                      </div>` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content */}
              <div className="mt-8">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <SynodMembersSidebar />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ${route.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page;
`;

  return pageContent;
}

// Main function
function main() {
  const legacyDir = path.join(__dirname, '../code_clone_ref/mosc_in/holysynod');
  const outputDir = path.join(__dirname, '../src/app/mosc/holy-synod');

  console.log('Generating Holy Synod member pages...\n');

  for (const [legacyPath, memberData] of Object.entries(memberRoutes)) {
    try {
      let htmlPath;
      if (legacyPath.endsWith('.html')) {
        htmlPath = path.join(legacyDir, legacyPath);
      } else {
        htmlPath = path.join(legacyDir, legacyPath, 'index.html');
      }

      if (!fs.existsSync(htmlPath)) {
        console.log(`⚠️  File not found: ${htmlPath}`);
        continue;
      }

      const html = fs.readFileSync(htmlPath, 'utf-8');
      const content = extractContent(html);
      
      if (!content.name) {
        console.log(`⚠️  Could not extract name from: ${legacyPath}`);
        continue;
      }

      const pageContent = generatePage(memberData.route, memberData, content);
      const pageDir = path.join(outputDir, memberData.route);
      const pageFile = path.join(pageDir, 'page.tsx');

      // Create directory if it doesn't exist
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }

      // Write page file
      fs.writeFileSync(pageFile, pageContent, 'utf-8');
      console.log(`✅ Generated: ${memberData.route}`);

    } catch (error) {
      console.error(`❌ Error processing ${legacyPath}:`, error.message);
    }
  }

  console.log('\n✨ Done!');
}

main();
