/**
 * Rewrites Shopify /apps/ringbuilder routes to WordPress /ringbuilder in the v1 bundle.
 * Run after copying or building frontend-v1.js.
 */
const fs = require('fs');
const path = require('path');

const bundle = path.join(__dirname, '../public/static/js/frontend-v1.js');

if (!fs.existsSync(bundle)) {
  console.error('Missing v1 bundle:', bundle);
  process.exit(1);
}

const text = fs.readFileSync(bundle, 'utf8');
const count = (text.match(/\/apps\/ringbuilder/g) || []).length;

if (count === 0) {
  console.log('v1 bundle already uses /ringbuilder paths');
  process.exit(0);
}

fs.writeFileSync(bundle, text.replace(/\/apps\/ringbuilder/g, '/ringbuilder'), 'utf8');
console.log(`Patched ${count} /apps/ringbuilder → /ringbuilder in frontend-v1.js`);
