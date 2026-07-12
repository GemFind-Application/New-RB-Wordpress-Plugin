/**
 * Add the WordPress REST nonce to v1's plain-link PDF download.
 *
 * Fetch/XHR requests already receive X-WP-Nonce from the WP compatibility
 * patches, but an <a download> navigation cannot send custom headers.
 */
const fs = require("fs");
const path = require("path");

const bundle = path.join(__dirname, "../public/static/js/frontend-v1.js");

if (!fs.existsSync(bundle)) {
  console.error("Missing v1 bundle:", bundle);
  process.exit(1);
}

const text = fs.readFileSync(bundle, "utf8");
const oldCode =
  'const r="".concat(n,"/api/printDiamond/")+window.initData.data[0].shop+"/"+e.productDetailsData.diamondId+"/"+e.diamondType,a=document.createElement("a");';
const newCode =
  'const r="".concat(n,"/api/printDiamond/")+window.initData.data[0].shop+"/"+e.productDetailsData.diamondId+"/"+e.diamondType+((window.gemfindRBConfig||{}).nonce?"?_wpnonce="+encodeURIComponent(window.gemfindRBConfig.nonce):""),a=document.createElement("a");';

if (text.includes(newCode)) {
  console.log("v1 print nonce patch: already applied");
  process.exit(0);
}

if (!text.includes(oldCode)) {
  console.error("v1 print nonce patch: print URL pattern not found");
  process.exit(1);
}

fs.writeFileSync(bundle, text.replace(oldCode, newCode), "utf8");
console.log("v1 print nonce patch: added _wpnonce to PDF download URL");
