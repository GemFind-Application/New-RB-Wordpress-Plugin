/**
 * Repair filter popup modal classNames corrupted by an earlier sync pass.
 */
const fs = require("fs");
const path = require("path");

const srcRoot = path.join(
  __dirname,
  "../../../../Ring-builder-CI-to-Laravel-main/Ring-builder-CI-to-Laravel-main/frontend-version-1/src"
);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".js")) out.push(full);
  }
  return out;
}

let fixed = 0;

for (const file of walk(srcRoot)) {
  let text = fs.readFileSync(file, "utf8");
  if (!/overlay:\s*"popup_Overlay",\s*\n\s*,/.test(text)) continue;
  text = text.replace(
    /(overlay:\s*"popup_Overlay",)\s*\n(\s*),/g,
    '$1\n$2modal: "popup_Modal gf-rb-v1-filter-modal",'
  );
  fs.writeFileSync(file, text, "utf8");
  fixed++;
  console.log("repaired", path.relative(srcRoot, file));
}

console.log(`v1 filter popup repair: ${fixed} file(s)`);
