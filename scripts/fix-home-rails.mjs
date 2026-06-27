import fs from 'fs';
import path from 'path';

const components = path.join(process.cwd(), 'src', 'components');

const files = [
  'ProjectsSection.tsx',
  'OurSponsorsSection.tsx',
  'UpcomingEventsSection.tsx',
  'TeamSection.tsx',
  'TestimonialsSection.tsx',
  'CausesSection.tsx',
];

const railImport = "import { HomeSectionRail } from '@/components/HomeSectionRail';\n";
const orphanRe = /\s*<motion.div className="flex justify-center mb-4">\s*<\/motion.div>\s*/g;

for (const name of files) {
  const file = path.join(components, name);
  let s = fs.readFileSync(file, 'utf8');
  let n = 0;
  s = s.replace(/import \{ HomeSectionRail \} from '@\/components\/HomeSectionRail';\n/g, () => (++n === 1 ? railImport : ''));
  s = s.replace(orphanRe, '\n');
  s = s.replace(/\s*<motion.div className="flex justify-center mb-4">\s*<\/motion.div>\s*/g, '\n');
  fs.writeFileSync(file, s);
  console.log('cleaned', name);
}

// Projects: fix stray motion closing tags
{
  const file = path.join(components, 'ProjectsSection.tsx');
  let s = fs.readFileSync(file, 'utf8');
  s = s.replace('    </motion.div>\n  );', '    </div>\n  );');
  fs.writeFileSync(file, s);
  console.log('fixed ProjectsSection');
}

// Sponsors: wrap remaining max-w-6xl blocks
{
  const file = path.join(components, 'OurSponsorsSection.tsx');
  let s = fs.readFileSync(file, 'utf8');
  s = s.replace(
    '  if (sponsors.length === 0) {\n    return (\n      <section className="py-24 bg-green-50">\n        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">',
    '  if (sponsors.length === 0) {\n    return (\n      <section className="py-24 bg-green-50">\n        <HomeSectionRail eyebrow="Sponsors" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">'
  );
  s = s.replace(
    '          </motion.div>\n        </motion.div>\n      </section>\n    );\n  }\n\n  return (\n    <section className="py-24 bg-green-50">\n      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">',
    '          </motion.div>\n        </HomeSectionRail>\n      </section>\n    );\n  }\n\n  return (\n    <section className="py-24 bg-green-50">\n      <HomeSectionRail eyebrow="Sponsors" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">'
  );
  // empty state closing
  s = s.replace(
    /if \(sponsors\.length === 0\)[\s\S]*?<\/div>\s*<\/section>\s*\);\s*}\s*\n\s*return/,
    (block) => block.replace('        </motion.div>\n      </section>', '        </HomeSectionRail>\n      </section>').replace('        </motion.div>\n      </section>', '        </HomeSectionRail>\n      </section>')
  );
  s = s.replace(
    '        </motion.div>\n      </div>\n\n    </section>\n  );\n};',
    '        </motion.div>\n      </HomeSectionRail>\n    </section>\n  );\n};'
  );
  s = s.replace(
    '        </motion.div>\n      </motion.div>\n\n    </section>',
    '        </motion.div>\n      </HomeSectionRail>\n    </section>'
  );
  s = s.replace(
    '        </motion.div>\n      </motion.div>\n    </section>',
    '        </motion.div>\n      </HomeSectionRail>\n    </section>'
  );
  s = s.replace(
    '        </motion.div>\n      </motion.div>\n\n    </section>',
    '        </motion.div>\n      </HomeSectionRail>\n    </section>'
  );
  // simpler: last closing before section end in main return
  s = s.replace(
    `        </motion.div>
      </motion.div>

    </section>
  );
};

export default OurSponsorsSection;`,
    `        </motion.div>
      </HomeSectionRail>
    </section>
  );
};

export default OurSponsorsSection;`
  );
  // fix empty sponsors - replace closing div with HomeSectionRail
  if (s.includes('sponsors.length === 0') && s.includes('No Sponsors Available')) {
    s = s.replace(
      `              <p className="text-gray-500">We're currently seeking sponsors for our events. Contact us to learn about sponsorship opportunities!</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>`,
      `              <p className="text-gray-500">We're currently seeking sponsors for our events. Contact us to learn about sponsorship opportunities!</p>
            </motion.div>
          </motion.div>
        </HomeSectionRail>
      </section>`
    );
  }
  // use div not motion for sponsors file
  s = s.replace(
    `              <p className="text-gray-500">We're currently seeking sponsors for our events. Contact us to learn about sponsorship opportunities!</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>`,
    ''
  );
  fs.writeFileSync(file, s);
  console.log('fixed OurSponsorsSection (partial)');
}

console.log('done');
