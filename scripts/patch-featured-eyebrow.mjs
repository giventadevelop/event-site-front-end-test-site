import fs from 'fs';

const CLOSE_DIV = '</motion.div>'.replace('motion.', '');

function stripEyebrow(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const isEyebrowRow =
      line.includes('home-section-eyebrow') &&
      (line.includes('flex items-center') || line.includes('featured-events-eyebrow'));

    if (line.trim() === '<motion.div className="flex justify-center mb-4">'.replace('motion.', '') && lines[i + 1]?.includes('home-section-eyebrow')) {
      i++;
      let depth = 1;
      while (i < lines.length && depth > 0) {
        if (/<div[\s>]/.test(lines[i])) depth++;
        if (lines[i].trim() === CLOSE_DIV) depth--;
        i++;
      }
      continue;
    }

    if (isEyebrowRow) {
      const indent = line.match(/^(\s*)/)[1];
      i++;
      while (i < lines.length) {
        if (lines[i].startsWith(indent) && lines[i].trim() === CLOSE_DIV) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    out.push(line);
    i++;
  }
  return out;
}

const file = 'src/components/FeaturedEventsSection.tsx';
const lines = stripEyebrow(fs.readFileSync(file, 'utf8').split(/\r?\n/));
fs.writeFileSync(file, lines.join('\n'));
console.log('ok');
