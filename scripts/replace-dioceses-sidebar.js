const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/app/mosc/dioceses');
const sidebarRegex = /(\s*\{\/\* Sidebar \*\/\}\s*<div className="space-y-6 lg:col-span-1">)\s*<div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">[\s\S]*?<\/nav>\s*<\/div>\s*(\s*<\/div>)/;
const replacement = '$1\n              <DiocesesSidebar />\n            $2';
const importLine = "import DiocesesSidebar from '../DiocesesSidebar';";
const importAfter = "import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';";

const entries = fs.readdirSync(dir, { withFileTypes: true });
for (const e of entries) {
  if (!e.isDirectory()) continue;
  const pagePath = path.join(dir, e.name, 'page.tsx');
  if (!fs.existsSync(pagePath)) continue;
  let content = fs.readFileSync(pagePath, 'utf8');
  if (content.includes('DiocesesSidebar')) continue;
  const newContent = content.replace(sidebarRegex, replacement);
  if (newContent === content) {
    console.log('No match:', pagePath);
    continue;
  }
  if (!newContent.includes(importLine)) {
    const idx = newContent.indexOf(importAfter);
    if (idx === -1) {
      console.log('No DiocesesQuickLinksNav import:', pagePath);
      continue;
    }
    const end = newContent.indexOf('\n', idx);
    content = newContent.slice(0, end + 1) + importLine + '\n' + newContent.slice(end + 1);
  } else {
    content = newContent;
  }
  fs.writeFileSync(pagePath, content);
  console.log('Updated:', pagePath);
}
console.log('Done');
