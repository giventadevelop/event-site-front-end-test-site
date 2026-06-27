const fs = require('fs');
const path = require('path');

function walk(dir, list) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, list);
    else if (f === 'page.tsx') list.push(full);
  }
}

const pages = [];
walk('src/app/mosc', pages);
const sections = ['catholicate', 'the-church', 'holy-synod', 'ecumenical', 'dioceses', 'saints', 'spiritual-organizations', 'publications', 'institutions', 'training', 'theological-seminaries', 'lectionary'];
const filtered = pages.filter(p => sections.some(s => p.includes(s)) && !p.includes('administration' + path.sep + 'administration'));

let count = 0;
for (const file of filtered) {
  let c = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Add flex justify-center to image wrapper if missing (center images horizontally)
  if (c.includes('<div className="mb-8">') && c.includes('<Image')) {
    c = c.replace(/<div className="mb-8">\s*\n\s*<Image/g, '<div className="mb-8 flex justify-center">\n                  <Image');
    changed = true;
  }

  // 2. Remove inner wrapper div (relative w-full max-w-[125px] or max-w-[250px]) around Image
  c = c.replace(/<div className="mb-8 flex justify-center">\s*\n\s*<div className="relative w-full max-w-\[125px\] h-auto">\s*\n\s*<Image/g, '<div className="mb-8 flex justify-center">\n                  <Image');
  c = c.replace(/<div className="mb-8 flex justify-center">\s*\n\s*<div className="relative w-full max-w-\[250px\] h-auto">\s*\n\s*<Image/g, '<div className="mb-8 flex justify-center">\n                  <Image');
  // Remove the closing </div> that was for the inner wrapper (before </div> that closes mb-8 flex)
  c = c.replace(/(\s*)\/\* Featured Image[^*]*\*\/\s*\n\s*<div className="mb-8 flex justify-center">\s*\n\s*<Image/g, '$1<div className="mb-8 flex justify-center">\n                  <Image');
  c = c.replace(/(<Image[^>]*\/>)\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*{?\s*\/\* Content)/g, '$1\n                </div>\n\n                $2');
  if (c.includes('relative w-full max-w-')) {
    c = c.replace(/\s*<\/div>\s*\n\s*<\/div>\s*\n\s*{?\s*\/\* (Content|Featured)/g, '\n                </div>\n\n                {/* $2');
  }
  // Simpler: remove one level of </div> after Image when preceded by inner div pattern
  const innerDivClose = /(<Image[\s\S]*?\/>)\s*\n(\s*)<\/div>\s*\n\s*<\/div>\s*\n\s*<(div|\/\*)/g;
  if (innerDivClose.test(c)) {
    c = c.replace(/(<Image[\s\S]*?\/>)\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<(div|\/\*)/g, '$1\n                </div>\n                <$3');
    changed = true;
  }

  // 3. Standardize Image: ensure 175x175 and style, remove shadow/border/other size classes
  if (c.includes('shadow-syro-card') && c.includes('<Image')) {
    c = c.replace(/className="rounded-lg shadow-syro-card w-auto h-auto block mx-auto"/g, 'className="rounded-lg object-contain" style={{ width: \'175px\', height: \'175px\' }}');
    changed = true;
  }
  if (c.includes('width={175} height={175}') && c.includes('block mx-auto') && !c.includes("style={{ width: '175px'")) {
    c = c.replace(/className="rounded-lg[^"]*"/g, 'className="rounded-lg object-contain" style={{ width: \'175px\', height: \'175px\' }}');
    changed = true;
  }

  if (changed || c.includes('relative w-full max-w-')) fs.writeFileSync(file, c);
  if (changed) count++;
}
console.log('Updated', count, 'files');
