import fs from 'fs';

const END_TAG = ['</', 'div', '>'].join('');

function addImport(s) {
  if (s.includes('HomeSectionRail')) return s;
  return s.replace(
    /^('use client';\s*\n)?/,
    (m) => `${m || ''}import { HomeSectionRail } from '@/components/HomeSectionRail';\n`
  ).replace(
    /^(import React[^\n]*\n)/m,
    (m) => (s.includes("HomeSectionRail") ? m : `${m}import { HomeSectionRail } from '@/components/HomeSectionRail';\n`)
  );
}

function stripEyebrows(s) {
  return s
    .replace(
      /\s*<div className="flex items-center space-x-2 mb-\d+">\s*<motion.div className="w-5 h-2 bg-yellow-400 rounded"><\/motion.div>\s*/g,
      '\n'
    )
    .replace(
      /\s*<div className="flex items-center space-x-2 mb-\d+">\s*<div className="w-5 h-2 bg-yellow-400 rounded"><\/div>\s*<p className="[^"]*">[^<]+<\/p>\s*<\/div>\s*/g,
      '\n'
    )
    .replace(/\s*<div className="home-section-eyebrow[^>]*>[\s\S]*?<\/div>\s*/g, '\n')
    .replace(/\s*<div className="featured-events-eyebrow[^>]*>[\s\S]*?<\/div>\s*/g, '\n')
    .replace(
      /\s*<div className="flex justify-center mb-\d+">\s*<div className="home-section-eyebrow[^>]*>[\s\S]*?<\/motion.div>\s*<\/motion.div>\s*/g,
      '\n'
    )
    .replace(
      /\s*<div className="flex justify-center mb-\d+">\s*<div className="home-section-eyebrow[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*/g,
      '\n'
    );
}

function wrapContainer(s, eyebrow, containerClass) {
  const open = `<div className="${containerClass}">`;
  const rail = `<HomeSectionRail eyebrow="${eyebrow}" containerClassName="${containerClass}">`;
  if (!s.includes(open) || s.includes(rail)) return s;
  const idx = s.indexOf(open);
  s = s.slice(0, idx) + rail + s.slice(idx + open.length);
  let pos = idx + rail.length;
  let depth = 1;
  while (pos < s.length && depth > 0) {
    if (s.slice(pos, pos + 4) === '<div' || s.slice(pos, pos + 16) === '<HomeSectionRail') depth++;
    if (s.slice(pos, pos + END_TAG.length) === END_TAG) {
      depth--;
      if (depth === 0) {
        return s.slice(0, pos) + '</HomeSectionRail>' + s.slice(pos + END_TAG.length);
      }
    }
    pos++;
  }
  return s;
}

function patch(file, eyebrow, containerClass) {
  let s = fs.readFileSync(file, 'utf8');
  if (!s.includes("'use client'") && !s.includes('import React')) {
    console.log('skip', file);
    return;
  }
  s = addImport(s);
  s = stripEyebrows(s);
  s = wrapContainer(s, eyebrow, containerClass);
  fs.writeFileSync(file, s);
  console.log('patched', file);
}

const jobs = [
  ['src/components/CausesSection.tsx', 'Our causes', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'],
  ['src/components/TestimonialsSection.tsx', 'Testimonials', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'],
  ['src/components/ProjectsSection.tsx', 'Projects', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'],
  ['src/components/TeamSection.tsx', 'Our team', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'],
  ['src/components/OurSponsorsSection.tsx', 'Sponsors', 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'],
  ['src/components/UpcomingEventsSection.tsx', 'Events', 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'],
];

for (const [f, e, c] of jobs) patch(f, e, c);
