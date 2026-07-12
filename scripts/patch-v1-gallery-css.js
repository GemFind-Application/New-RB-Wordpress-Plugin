/**
 * Sync v1 gallery centering into frontend-v1.css (matches inspect-mode fix).
 */
const fs = require("fs");
const path = require("path");

const cssFile = path.join(__dirname, "../public/static/css/frontend-v1.css");

if (!fs.existsSync(cssFile)) {
  console.error("Missing v1 CSS:", cssFile);
  process.exit(1);
}

let text = fs.readFileSync(cssFile, "utf8");

const replacements = [
  [
    ".ring-diamond-image .imageloader{text-align:center}",
    ".ring-diamond-image .imageloader{text-align:center;display:flex;justify-content:center;align-items:center;width:100%}",
  ],
  [
    ".ring-diamond-image-dia .imageloader{text-align:center}",
    ".ring-diamond-image-dia .imageloader{text-align:center;display:flex;justify-content:center;align-items:center;width:100%}",
  ],
  [
    ".ring-diamond-image-dia img{width:40%}",
    ".ring-diamond-image-dia img{width:40%;margin-inline:auto}",
  ],
];

let changed = 0;
for (const [from, to] of replacements) {
  if (text.includes(from) && !text.includes(to)) {
    text = text.replace(from, to);
    changed++;
  }
}

if (changed === 0) {
  console.log("v1 gallery CSS patch: already up to date");
  process.exit(0);
}

fs.writeFileSync(cssFile, text, "utf8");
console.log(`v1 gallery CSS patch: updated ${changed} rule(s) in frontend-v1.css`);
