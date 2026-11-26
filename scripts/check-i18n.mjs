import fs from 'node:fs';
import path from 'node:path';

const LOCALES_DIR = path.resolve('src/i18n/locales');
const BASE_LOCALE = 'en-IN';
const REQUIRED_LOCALES = ['ta', 'te', 'kn', 'ml', 'hi', 'en-IN', 'en-GB', 'de', 'zh-CN'];
const REQUIRED_NAMESPACES = ['common', 'welcome', 'places', 'itinerary', 'booking', 'transit', 'sos'];

function collectLeafKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    if (k === '_meta') continue;
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectLeafKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValueByPath(obj, dotPath) {
  return dotPath.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj);
}

let hasErrors = false;

for (const ns of REQUIRED_NAMESPACES) {
  const basePath = path.join(LOCALES_DIR, BASE_LOCALE, `${ns}.json`);
  if (!fs.existsSync(basePath)) {
    console.error(`[i18n-check] Missing base file: ${basePath}`);
    hasErrors = true;
    continue;
  }
  const baseJson = JSON.parse(fs.readFileSync(basePath, 'utf8'));
  const baseKeys = collectLeafKeys(baseJson);

  for (const locale of REQUIRED_LOCALES) {
    const targetPath = path.join(LOCALES_DIR, locale, `${ns}.json`);
    if (!fs.existsSync(targetPath)) {
      console.error(`[i18n-check] Missing locale file: ${targetPath}`);
      hasErrors = true;
      continue;
    }
    let targetJson;
    try {
      targetJson = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    } catch (err) {
      console.error(`[i18n-check] Invalid JSON in ${targetPath}: ${err.message}`);
      hasErrors = true;
      continue;
    }

    for (const key of baseKeys) {
      const val = getValueByPath(targetJson, key);
      if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
        console.error(`[i18n-check] Missing or empty key "${ns}:${key}" in locale "${locale}"`);
        hasErrors = true;
      } else if (
        ns === 'sos' &&
        !locale.startsWith('en') &&
        key !== 'fabLabel' &&
        val === getValueByPath(baseJson, key)
      ) {
        console.error(
          `[i18n-check] SOS key "${ns}:${key}" in locale "${locale}" falls back to English; native translation required.`
        );
        hasErrors = true;
      }
    }
  }
}

if (hasErrors) {
  console.error('\n[i18n-check] FAILED: Missing translation keys detected. Build aborted.');
  process.exit(1);
}

console.log(
  `[i18n-check] PASSED: Verified all ${REQUIRED_NAMESPACES.length} namespaces across ${REQUIRED_LOCALES.length} locales with 0 missing keys.`
);
