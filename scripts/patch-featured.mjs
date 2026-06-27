import fs from 'fs';

const p = 'src/components/FeaturedEventsSection.tsx';
let s = fs.readFileSync(p, 'utf8');

const old = [
  '      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">',
  '        {/* Section header — matches What We Do (ServicesSection) */}',
  '        <div className="featured-events-section-header mb-5 mt-4 text-center md:mb-6">',
  '          <motion.div className="featured-events-eyebrow mb-3">',
].join('\n');
