const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../src/app/mosc/dioceses/diocese-of-kollam/page.tsx');
let s = fs.readFileSync(filePath, 'utf8');

// P1: bifurcation
const p1 = /(\s+<p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">\s+)In 1979[\s\S]*?dioceses \.(\s+<\/p>)/;
s = s.replace(p1, '$1In 1979, the diocese of Kollam was bifurcated to Trivandrum and Kollam Diocese (------?) churches went to Trivandrum diocese. Again in 1985 four churches detached from Kollam diocese and included in Chengannur diocese. In 2002, from Kollam diocese twenty seven churches detached and formed the new Mavelikara diocese. In 2010 a rearrangement of churches of Kollam and Trivandrum dioceses resulted in the formation of Adoor – Kadampanadu and Kottarakara – Punalur dioceses.$2');

// P2: first headquarters
const p2 = /(\s+<p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">\s+)The first headquarters of[\s\S]*?Baselious Geevarghese II \.(\s+<\/p>)/;
s = s.replace(p2, '$1The first headquarters of Kollam Diocese was Kottapuram Seminary during the reign of Geevarghese Mar Gregorious of Parumala and Kundara Seminary was the headquarters of Kollam Diocese during the reign of Geevarghese Mar Gregorious who later known as Baselious Geevarghese II.$2');

// P3: Mathews Coorilous
const p3 = /(\s+<p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">\s+)Mathews Mar Coorilous later known as Baselious Marthoma Mathews -II[\s\S]*?Kollam [^<]*\.(\s+<\/p>)/;
s = s.replace(p3, '$1Mathews Mar Coorilous later known as Baselious Marthoma Mathews II, the Catholicos of the East, established the present headquarters at Cross Junction, Kollam.$2');

fs.writeFileSync(filePath, s);
console.log('Done');
