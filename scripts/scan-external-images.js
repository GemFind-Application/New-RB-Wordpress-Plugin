const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "vendor") continue;
      walk(full);
      continue;
    }
    if (!/\.(js|jsx|php|css|scss|html|json)$/.test(entry.name)) continue;
    const text = fs.readFileSync(full, "utf8");
    const patterns = [
      /https?:\/\/[^\s"'`)]+/g,
      /\/images\/[a-zA-Z0-9_.-]+/g,
      /\/assest\/images\/[a-zA-Z0-9_.-]+/g,
    ];
    for (const re of patterns) {
      let m;
      while ((m = re.exec(text))) {
        const match = m[0];
        if (
          match.includes("ringbuilderdev") ||
          match.includes("jewelcloud.com") && match.match(/\.(jpg|jpeg|png|gif|svg|webp)/i) ||
          match.match(/\/images\/(carat|color|cut|clarity|depth|table|polish|symmetry|fluorescence|ring|spinner|diamond)/) ||
          match.match(/\/assest\/images\//)
        ) {
          hits.push({ file: path.relative(root, full).replace(/\\/g, "/"), match });
        }
      }
    }
  }
}

walk(root);
const uniq = [...new Map(hits.map((h) => [`${h.file}|${h.match}`, h])).values()];
for (const h of uniq) console.log(`${h.file} -> ${h.match}`);
console.log(`TOTAL ${uniq.length}`);
