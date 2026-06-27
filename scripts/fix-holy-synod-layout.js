const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), 'src', 'app', 'mosc', 'holy-synod');
const dirs = fs.readdirSync(baseDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => path.join(baseDir, d.name, 'page.tsx'))
  .filter(p => fs.existsSync(p));

const openBlockOld = `<div className="flex flex-col md:flex-row gap-8">
                  {/* Featured Portrait - Left Side - Large Display */}
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="relative w-72 h-[28rem] md:w-80 md:h-[32rem] lg:w-96 lg:h-[36rem] rounded-lg overflow-hidden shadow-syro-card-hover">`;

const openBlockNew = `{/* Featured Image - Top */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-72 h-[28rem] md:w-80 md:h-[32rem] rounded-lg overflow-hidden shadow-syro-card">`;

const contentWrapperOld = `                  {/* Content - Right Side of Image */}
                  <div className="flex-1">`;
const contentWrapperNew = `                {/* Content - Below Image */}
                <div>`;

const contentWrapperOld2 = `                  {/* Content - Right Side of Image */}
                  <div className="flex-1 min-w-0">`;
const contentWrapperNew2 = `                {/* Content - Below Image */}
                <div>`;

const closingOld = `                  </div>
                </div>
              </div>

              {/* Quick Links`;
const closingNew = `                </div>
              </div>

              {/* Quick Links`;

let count = 0;
for (const filePath of dirs) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\r\n/g, '\n');
  if (!content.includes('Featured Portrait - Left Side')) {
    continue;
  }
  const orig = content;
  content = content.replace(openBlockOld, openBlockNew);
  content = content.replace(contentWrapperOld2, contentWrapperNew2);
  content = content.replace(contentWrapperOld, contentWrapperNew);
  content = content.replace(closingOld, closingNew);
  if (content !== orig) {
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
    console.log(filePath);
  }
}
console.log('Updated', count, 'files');
