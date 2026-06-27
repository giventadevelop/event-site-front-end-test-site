const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat?.isDirectory() && file !== 'node_modules') results = results.concat(walk(full));
      else if (/\.(tsx?|jsx?|json)$/.test(file)) results.push(full);
    }
  } catch (_) {}
  return results;
}

const files = walk(srcDir);
let total = 0;
for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  const orig = content;
  // Replace /mosc-new with /mosc (do not touch /mosc-old)
  content = content
    .replace(/"\/mosc-new/g, '"/mosc')
    .replace(/'\/mosc-new/g, "'/mosc")
    .replace(/}\/mosc-new/g, '}/mosc')
    .replace(/`\/mosc-new/g, '`/mosc');
  if (content !== orig) {
    fs.writeFileSync(f, content, 'utf8');
    total++;
  }
}
console.log('Updated', total, 'files');
