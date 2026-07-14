/**
 * Fix v1 Add to Cart:
 * 1) Send list_type/diamond_type (fancy/lab) so the API can look up the stone.
 * 2) Accept API responses shaped as a URL string or { success, cart_url|url }.
 */
const fs = require("fs");
const path = require("path");

const jsFile = path.join(__dirname, "../public/static/js/frontend-v1.js");

if (!fs.existsSync(jsFile)) {
  console.error("Missing v1 bundle:", jsFile);
  process.exit(1);
}

let js = fs.readFileSync(jsFile, "utf8");
let count = 0;

function replaceAll(from, to, label) {
  if (!js.includes(from)) {
    return false;
  }
  const hits = js.split(from).length - 1;
  js = js.split(from).join(to);
  count += hits;
  console.log(`v1 addToCart: ${label} (${hits})`);
  return true;
}

const payloadFrom = "diamond_type:e.diamondType";
const payloadTo = "list_type:e.diamondType||_e(),diamond_type:e.diamondType||_e()";

if (js.includes(payloadTo)) {
  console.log("v1 addToCart: payload already patched");
} else if (!replaceAll(payloadFrom, payloadTo, "send list_type + diamond_type via _e()")) {
  console.warn("v1 addToCart: payload pattern not found — review bundle");
  process.exitCode = 1;
}

const responseFrom =
  'const e=await zj(n);e.success&&e.cart_url?(Le(!1),console.log("DiamondProductInformation: cart status modal closed on success"),window.location.href=e.cart_url):(Le(!1),console.log("DiamondProductInformation: cart status modal closed with error response"),Wx.error(e.error||"Failed to add to cart"))';
const responseTo =
  'const e=await zj(n),r=typeof e==="string"?e:e&&(e.cart_url||e.url);r?(Le(!1),console.log("DiamondProductInformation: cart status modal closed on success"),window.location.href=r):(Le(!1),console.log("DiamondProductInformation: cart status modal closed with error response"),Wx.error(e&&e.error||"Failed to add to cart"))';

if (js.includes(responseTo)) {
  console.log("v1 addToCart: response handler already patched");
} else if (!replaceAll(responseFrom, responseTo, "accept cart_url/url/string response")) {
  console.warn("v1 addToCart: response handler pattern not found — review bundle");
  process.exitCode = 1;
}

fs.writeFileSync(jsFile, js, "utf8");
console.log(`Patched v1 addToCart: ${count} replacements`);
