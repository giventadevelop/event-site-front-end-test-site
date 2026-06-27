import fs from 'fs';

const D = 'div';
const file = 'src/app/HomePageClient.tsx';
let s = fs.readFileSync(file, 'utf8');

const removeEyebrow = new RegExp(
  `[\\r\\n]+        <${D} className="flex justify-center mb-4">[\\s\\S]*?<\\/${D}>[\\r\\n]+        <\\/${D}>[\\r\\n]+`,
  'g'
);
s = s.replace(removeEyebrow, '\n');

const nl = s.includes('\r\n') ? '\r\n' : '\n';

function wrapFallback(marker, eyebrow) {
  const old = `${marker}${nl}  <section className="py-24 bg-green-50">${nl}    <${D} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">`;
  const neu = `${marker}${nl}  <section className="py-24 bg-green-50">${nl}    <HomeSectionRail eyebrow="${eyebrow}" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">`;
  if (!s.includes(old)) {
    console.warn('missing:', eyebrow, JSON.stringify(old.slice(0, 80)));
    return;
  }
  s = s.replace(old, neu);
}

wrapFallback('const EventsFallback = () => (', 'Events');
wrapFallback('const TeamFallback = () => (', 'Our team');

const eventsEnd = `    </${D}>${nl}  </section>${nl});${nl}${nl}const TeamFallback`;
const eventsEndNew = `    </HomeSectionRail>${nl}  </section>${nl});${nl}${nl}const TeamFallback`;
if (s.includes(eventsEnd)) s = s.replace(eventsEnd, eventsEndNew);
else console.warn('events end missing');

const teamEnd = `    </${D}>${nl}  </section>${nl});${nl}${nl}// Main content`;
const teamEndNew = `    </HomeSectionRail>${nl}  </section>${nl});${nl}${nl}// Main content`;
if (s.includes(teamEnd)) s = s.replace(teamEnd, teamEndNew);
else console.warn('team end missing');

const contactOld = `        <${D} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">${nl}          {/* Section Header - Matching "What We Do" style */}${nl}          <${D} className="mb-16">${nl}            <${D} className="home-section-eyebrow flex items-center space-x-2 mb-6">${nl}              <${D} className="home-section-eyebrow-mark" aria-hidden />${nl}              <p className="home-section-eyebrow-label text-gray-600">Contact</p>${nl}            </${D}>${nl}            <h2 className="home-section-title text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">${nl}              Get in Touch${nl}            </h2>${nl}          </${D}>`;

const contactNew = `        <HomeSectionRail eyebrow="Contact" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">${nl}          <${D} className="mb-16">${nl}            <h2 className="home-section-title text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">${nl}              Get in Touch${nl}            </h2>${nl}          </${D}>`;

if (s.includes(contactOld)) {
  s = s.replace(contactOld, contactNew);
  const contactEnd = `          </${D}>${nl}        </${D}>${nl}      </${D}>${nl}    </main>`;
  const contactEndNew = `          </${D}>${nl}        </HomeSectionRail>${nl}      </${D}>${nl}    </main>`;
  if (s.includes(contactEnd)) s = s.replace(contactEnd, contactEndNew);
  else console.warn('contact end missing');
} else {
  console.warn('contact block missing');
}

fs.writeFileSync(file, s);
console.log('done, eyebrow count', (s.match(/flex justify-center mb-4/g) || []).length);
