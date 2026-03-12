'use strict';

/**
 * Kopira .next/static i public/ u .next/standalone/.next/
 * što je potrebno za Next.js standalone build.
 */

const fs   = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true });
  console.log(`  ✓ ${path.relative(root, src)} → ${path.relative(root, dest)}`);
}

console.log('Pripremam standalone distribuciju...');

copyDir(
  path.join(root, '.next', 'static'),
  path.join(root, '.next', 'standalone', '.next', 'static')
);

copyDir(
  path.join(root, 'public'),
  path.join(root, '.next', 'standalone', 'public')
);

console.log('Gotovo.');
