import fs from 'fs';
import path from 'path';

const root = path.resolve('src');

function patch(file, transforms) {
  const p = path.join(root, file);
  let s = fs.readFileSync(p, 'utf8');
  for (const [from, to] of transforms) {
    if (!s.includes(from)) {
      console.warn(`WARN ${file}: pattern not found:`, from.slice(0, 60));
    } else {
      s = s.replace(from, to);
    }
  }
  fs.writeFileSync(p, s);
  console.log('OK', file);
}

// FeaturedEventsSection
patch('components/FeaturedEventsSection.tsx', [
  [
    `      <motion.div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — matches What We Do (ServicesSection) */}
        <div className="featured-events-section-header mb-5 mt-4 text-center md:mb-6">
          <div className="featured-events-eyebrow mb-3">
            <div className="home-section-eyebrow-mark" aria-hidden />
            <p className="featured-events-eyebrow-label text-sm font-medium tracking-wide text-gray-600">
              Featured
            </p>
          </div>
          <h2 className="featured-events-title font-heading text-2xl font-bold text-gray-900 md:text-3xl">
            Featured Events
          </h2>
        </div>

        {/* Featured Events Strip - max 3 */}`,
    `      <HomeSectionRail eyebrow="Featured" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="featured-events-section-header mb-5 mt-4 text-center md:mb-6">
          <h2 className="featured-events-title font-heading text-2xl font-bold text-gray-900 md:text-3xl">
            Featured Events
          </h2>
        </div>`,
  ],
]);

// Fix featured closing - find last </section> area
{
  const p = path.join(root, 'components/FeaturedEventsSection.tsx');
  let s = fs.readFileSync(p, 'utf8');
  // Replace closing of max-w container before </section>
  s = s.replace(
    /(\s+<\/div>\s*\n\s*)<\/div>(\s*\n\s*<\/section>)/,
    '$1</HomeSectionRail>$2'
  );
  s = s.replace(/<\/motion.div>\n\s*<\/section>/, '</HomeSectionRail>\n    </section>');
  s = s.replace(/featured-events-section-header mb-5 mt-4 text-center md:mb-6">\n          <h2/, 'featured-events-section-header mb-5 mt-4 text-center md:mb-6">\n          <h2');
  s = s.replace(/<motion.div className="featured-events-section-header/, '<div className="featured-events-section-header');
  fs.writeFileSync(p, s);
  console.log('OK FeaturedEventsSection close');
}
