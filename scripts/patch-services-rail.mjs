import fs from 'fs';

const p = 'src/components/ServicesSection.tsx';
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);

const out = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  if (line.includes('home-section-eyebrow mb-6')) {
    while (i < lines.length && !lines[i].includes('home-section-title')) i++;
    continue;
  }
  if (line.trim() === '</motion.div>' && i + 2 < lines.length && lines[i + 1].trim() === '</motion.div>' && lines[i + 2].trim() === ');') {
    // skip - wrong
  }
  if (line === '      </motion.div>' && out[out.length - 1]?.trim() === '</motion.div>') {
    out.push('      </HomeSectionRail>');
    i++;
    continue;
  }
  if (line === '      </motion.div>' && out.some((l) => l.includes('HomeSectionRail'))) {
    out.push('      </HomeSectionRail>');
    i++;
    continue;
  }
  out.push(line);
  i++;
}

// Fix closing: last inner before outer should be HomeSectionRail
const joined = out.join('\n');
const fixed = joined.replace(
  /(\s+<\/div>\s*\n\s*)<\/div>(\s*\n\s*<\/motion.div>\s*\n\s*\);)/,
  '$1</HomeSectionRail>$2'
).replace('</motion.div>\n  );', '</div>\n  );');

fs.writeFileSync(p, fixed);
console.log('ok');
