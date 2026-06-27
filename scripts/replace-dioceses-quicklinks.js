const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/app/mosc/dioceses');
const importOld = "import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';";
const importNew = "import QuickLinks from '../../components/QuickLinks';";
const blockOld = `              {/* Quick Links - below content */}
              <div className="mt-8">
                <DiocesesQuickLinksNav />
              </div>`;
const blockNew = `              {/* Quick Links - below content (desktop, same as administration) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>`;
const footerOld = `            </div>
          </div>
        </div>
      </section>`;
const footerNew = `            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>`;

const entries = fs.readdirSync(dir, { withFileTypes: true });
let count = 0;
for (const e of entries) {
  if (!e.isDirectory()) continue;
  const pagePath = path.join(dir, e.name, 'page.tsx');
  if (!fs.existsSync(pagePath)) continue;
  let content = fs.readFileSync(pagePath, 'utf8');
  if (!content.includes('DiocesesQuickLinksNav')) continue;
  content = content.replace(importOld, importNew);
  content = content.replace(blockOld, blockNew);
  if (!content.includes(footerNew)) {
    content = content.replace(footerOld, footerNew);
  }
  fs.writeFileSync(pagePath, content);
  console.log('Updated:', pagePath);
  count++;
}
console.log('Done. Updated', count, 'files.');
