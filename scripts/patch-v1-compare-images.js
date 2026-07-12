/**
 * Fix compare page diamond images in the v1 bundle.
 * Detail API returns image2; compare previously only used colorDiamond/biggerDiamondimage.
 */
const fs = require("fs");
const path = require("path");

const bundle = path.join(__dirname, "../public/static/js/frontend-v1.js");

if (!fs.existsSync(bundle)) {
  console.error("Missing v1 bundle:", bundle);
  process.exit(1);
}

let js = fs.readFileSync(bundle, "utf8");
let changed = 0;

const replacements = [
  [
    'TN=e=>(e=>!!e&&(!0===e.isfancy||"true"===e.isfancy||!0===e.isFancy||e.fancyColorIntensity||e.fancyColor))(e)&&e.colorDiamond?e.colorDiamond:e.defaultDiamondImage||e.biggerDiamondimage||""',
    'TN=e=>e&&(e.image2||e.image1||e.biggerDiamondimage||e.defaultDiamondImage||e.colorDiamond||e.diamondImage||e.diamondImageUrl||"")',
  ],
  [
    'o+=i&&a?"&IsLabGrown=true&IsFancy=true":i?"&IsFancy=true":a?"&IsLabGrown=true":"&IsLabGrown=false"',
    'o+=i&&a?"&IsLabGrown=true&IsFancy=true":i?"&IsLabGrown=false&IsFancy=true":a?"&IsLabGrown=true":"&IsLabGrown=false"',
  ],
];

for (const [from, to] of replacements) {
  if (!js.includes(from)) {
    continue;
  }
  const count = js.split(from).length - 1;
  js = js.split(from).join(to);
  changed += count;
  console.log(`v1 compare images: ${from.slice(0, 70)}… (${count})`);
}

if (changed === 0) {
  console.log("v1 compare images patch: already applied or bundle layout changed");
} else {
  fs.writeFileSync(bundle, js, "utf8");
  console.log(`Patched compare images in frontend-v1.js (${changed} replacements)`);
}
