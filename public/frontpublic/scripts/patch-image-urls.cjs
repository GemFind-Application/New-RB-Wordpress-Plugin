/**
 * Replace import.meta.env.VITE_IMAGE_URL with getImageBaseUrl() across storefront source.
 */
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "src");
const importLine = 'import { getImageBaseUrl } from "../utils/imageBaseUrl";\n';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".jsx") || entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

let updated = 0;
for (const file of walk(srcDir)) {
  if (file.includes(`${path.sep}utils${path.sep}imageBaseUrl.js`)) continue;
  let content = fs.readFileSync(file, "utf8");
  if (!content.includes("import.meta.env.VITE_IMAGE_URL")) continue;

  content = content.replace(/import\.meta\.env\.VITE_IMAGE_URL/g, "getImageBaseUrl()");

  const rel = path.relative(path.dirname(file), path.join(srcDir, "utils", "imageBaseUrl.js"))
    .replace(/\\/g, "/");
  const importStmt = `import { getImageBaseUrl } from "${rel.replace(/\.js$/, "")}";\n`;

  if (!content.includes("getImageBaseUrl } from")) {
    const importMatch = content.match(/^import .+;\r?\n/m);
    if (importMatch) {
      const idx = content.indexOf(importMatch[0]) + importMatch[0].length;
      content = content.slice(0, idx) + importStmt + content.slice(idx);
    } else {
      content = importStmt + content;
    }
  }

  fs.writeFileSync(file, content, "utf8");
  updated++;
  console.log(path.relative(srcDir, file));
}

console.log(`Updated ${updated} files.`);
