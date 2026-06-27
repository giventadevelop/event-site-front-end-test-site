const fs = require('fs');
const path = require('path');

// Remove inner wrapper div around Image (relative w-full max-w-[125px] or [250px])
const dir = 'src/app/mosc/the-church';
const files = [];
function walk(d) {
  try {
    for (const e of fs.readdirSync(d)) {
      const full = path.join(d, e);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (e === 'page.tsx') files.push(full);
    }
  } catch (_) {}
}
walk(dir);

let count = 0;
for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  if (!c.includes('relative w-full max-w-')) continue;
  // Remove opening inner div (with optional comment)
  c = c.replace(/\s*<div className="relative w-full max-w-\[125px\] h-auto">\s*\n\s*/g, '\n                  ');
  c = c.replace(/\s*<div className="relative w-full max-w-\[250px\] h-auto">\s*\n\s*/g, '\n                  ');
  // Remove closing </div> that was wrapping Image only (the one after Image and before the next </div>)
  // Pattern: </div>\n                </div>  where first closes inner, second closes mb-8
  c = c.replace(/(<Image[\s\S]*?\/>)\s*\n\s*<\/div>\s*\n(\s*)<\/div>/g, (m, img, sp) => {
    return img + '\n' + sp + '</div>';
  });
  fs.writeFileSync(file, c);
  count++;
}
console.log('Removed inner div in', count, 'the-church files');
