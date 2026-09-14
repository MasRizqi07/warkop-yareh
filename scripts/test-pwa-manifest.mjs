import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('--- Testing PWA Manifest and Assets ---');

// 1. Verify manifest.json exists and is valid JSON
const manifestJsonPath = path.resolve('apps/web/public/manifest.json');
assert(fs.existsSync(manifestJsonPath), 'manifest.json must exist in apps/web/public');
const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));

assert.strictEqual(manifestJson.name, "Warkop Ya'reh — Specialty Coffee & Coworking");
assert.strictEqual(manifestJson.short_name, "Warkop Ya'reh");
assert.strictEqual(manifestJson.display, 'standalone');
assert.strictEqual(manifestJson.start_url, '/');
assert.strictEqual(manifestJson.theme_color, '#c27803');
assert.strictEqual(manifestJson.background_color, '#14110e');

console.log('✔ manifest.json structure verified');

// 2. Verify icons
assert(Array.isArray(manifestJson.icons) && manifestJson.icons.length >= 2, 'Must have at least 2 icons');
for (const icon of manifestJson.icons) {
  const iconPath = path.join(path.resolve('apps/web/public'), icon.src);
  assert(fs.existsSync(iconPath), `Icon file ${icon.src} must exist at ${iconPath}`);
  const header = fs.readFileSync(iconPath).subarray(0, 8);
  const isPng = header.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  assert(isPng, `Icon ${icon.src} must have valid PNG signature`);
  console.log(`✔ Verified icon ${icon.src} (${icon.sizes}, ${icon.purpose || 'any'})`);
}

// 3. Verify service worker and offline fallbacks
const swPath = path.resolve('apps/web/public/sw.js');
assert(fs.existsSync(swPath), 'sw.js must exist in apps/web/public');
const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('install'), 'sw.js must handle install');
assert(swContent.includes('activate'), 'sw.js must handle activate');
assert(swContent.includes('fetch'), 'sw.js must handle fetch');
console.log('✔ sw.js lifecycle verified');

const offlineHtmlPath = path.resolve('apps/web/public/offline.html');
assert(fs.existsSync(offlineHtmlPath), 'offline.html must exist in apps/web/public');
const offlinePagePath = path.resolve('apps/web/src/app/offline/page.tsx');
assert(fs.existsSync(offlinePagePath), 'apps/web/src/app/offline/page.tsx must exist');
console.log('✔ offline fallbacks verified');

console.log('--- ALL PWA ASSERTIONS PASSED ---');

