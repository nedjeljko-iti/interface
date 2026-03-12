'use strict';

const fs = require('fs');
const path = require('path');
const { parseCSV, buildClobParams } = require('../lib/csvParser');

const buf = fs.readFileSync(path.join(__dirname, '..', 'import_pocetno.csv'));
const rows = parseCSV(buf);
const { clobs } = buildClobParams(rows);

console.log('Ukupno redova:', rows.length);

// Prvih 5 vrijednosti svakog parametra (kao što Oracle dobiva)
const fields = ['p_datum', 'p_pod', 'p_god', 'p_iznosd', 'p_iznosp', 'p_iznval', 'p_val', 'p_br', 'p_datdok', 'p_datdosp'];
console.log('\n--- Prvih 5 vrijednosti po parametru (što ide u Oracle) ---');
for (const f of fields) {
  const vals = clobs[f].split('|').slice(0, 5);
  console.log(`${f.padEnd(12)}: ${vals.join(' | ')}`);
}

// Provjeri decimale - usporedi raw CSV vrijednost vs što šaljemo Oracle-u
console.log('\n--- Prvih 5 redova: raw iznos vs Oracle iznos ---');
for (let i = 0; i < Math.min(5, rows.length); i++) {
  const raw = rows[i][10];  // Duguje kolona
  const oracle = clobs.p_iznosd.split('|')[i];
  console.log(`  red ${i+2}: raw="${raw}"  →  Oracle="${oracle}"`);
}

// CLAUDE.md kaže Oracle očekuje: "1234.56" (s točkom)
// Provjeri ima li zarez u vrijednostima koje šaljemo Oracle-u
const izosd = clobs.p_iznosd.split('|');
const withComma = izosd.filter(v => v.includes(','));
console.log(`\np_iznosd - vrijednosti sa zarezom (${withComma.length}/${izosd.length}):`, withComma.slice(0, 5));
