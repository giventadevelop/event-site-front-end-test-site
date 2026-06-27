import fs from 'fs';
import path from 'path';

const root = 'src';

function dedupeImport(s) {
  const lines = s.split(/\r?\n/);
  const out = [];
  let seenRail = false;
  for (const line of lines) {
    if (line.includes("from '@/components/HomeSectionRail'")) {
      if (seenRail) continue;
      seenRail = true;
    }
    out.push(line);
  }
  s = out.join('\n');
  // ensure single import after use client
  if ((s.match(/HomeSectionRail/g) || []).length > 2) {
    s = s.replace(/import \{ HomeSectionRail \} from '@\/components\/HomeSectionRail';\n/g, '');
    s = s.replace(
      /^('use client';\s*\n)/,
      "$1import { HomeSectionRail } from '@/components/HomeSectionRail';\n"
    );
  }
  return s;
}

function fixOrphanCenter(s) {
  return s.replace(
    /\s*<div className="flex justify-center mb-\d+">\s*<\/div>\s*/g,
    '\n'
  );
}

function fixProjects(s) {
  const file = path.join(root, 'components/ProjectsSection.tsx');
  let s = fs.readFileSync(file, 'utf8');
  s = dedupeImport(s);
  s = s.replace(
    '<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">',
    '<HomeSectionRail eyebrow="Projects" containerClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">'
  );
  s = s.replace(
    /(\s+<\/div>\s*\n\s*)<\/div>(\s*\n\s*<\/div>\s*\n\s*\);\s*\n\};\s*\n\s*export default ProjectsSection)/,
    '$1</HomeSectionRail>$2'
  );
  s = s.replace(
    '<h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight max-w-4xl">',
    '<h2 className="home-section-title text-4xl md:text-6xl font-normal leading-tight tracking-tight max-w-4xl">'
  );
  fs.writeFileSync(file, s);
  console.log('projects');
}

function fixSponsorsMain(s) {
  const file = path.join(root, 'components/OurSponsorsSection.tsx');
  let s = fs.readFileSync(file, 'utf8');
  s = dedupeImport(s);
  s = fixOrphanCenter(s);
  if (!s.includes('Our Sponsors</h2>')) return;
  s = s.replace(
    '<section className="py-24 bg-green-50">\n      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">',
    '<section className="py-24 bg-green-50">\n      <HomeSectionRail eyebrow="Sponsors" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">'
  );
  // close before </section> for main return - last HomeSectionRail
  const idx = s.lastIndexOf('<HomeSectionRail eyebrow="Sponsors"');
  if (idx >= 0) {
    const closeSection = s.indexOf('</section>', idx);
    const before = s.lastIndexOf('</div>', closeSection);
    if (before > idx) {
      s = s.slice(0, before) + '</HomeSectionRail>' + s.slice(before + 6);
    }
  }
  fs.writeFileSync(file, s);
  console.log('sponsors');
}

const files = [
  'components/CausesSection.tsx',
  'components/TestimonialsSection.tsx',
  'components/ProjectsSection.tsx',
  'components/TeamSection.tsx',
  'components/OurSponsorsSection.tsx',
  'components/UpcomingEventsSection.tsx',
  'components/FeaturedEventsSection.tsx',
  'components/ServicesSection.tsx',
  'components/AboutSection.tsx',
];

for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  let s = fs.readFileSync(p, 'utf8');
  s = dedupeImport(s);
  s = fixOrphanCenter(s);
  s = s.replace(
    /<h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight max-w-2xl">/g,
    '<h2 className="home-section-title text-4xl md:text-6xl font-normal leading-tight tracking-tight max-w-2xl">'
  );
  fs.writeFileSync(p, s);
}

fixProjects();
fixSponsorsMain();
