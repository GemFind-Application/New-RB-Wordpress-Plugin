/**
 * Bake #gemfindrb-admin-root.gemfind-ring-builder-scope into admin-frontend CSS sources.
 */
const fs = require("fs");
const path = require("path");
const postcss = require(path.join(
  __dirname,
  "..",
  "..",
  "..",
  "public",
  "frontpublic",
  "node_modules",
  "postcss"
));
const prefixSelector = require(path.join(
  __dirname,
  "..",
  "..",
  "..",
  "public",
  "frontpublic",
  "node_modules",
  "postcss-prefix-selector"
));

const SCOPE = "#gemfindrb-admin-root.gemfind-ring-builder-scope";
const SRC_DIR = path.join(__dirname, "..", "src");
const SKIP_FILES = new Set(["gemfindrb-scope.css"]);

const scoper = prefixSelector({
  prefix: SCOPE,
  transform(prefix, selector, prefixed) {
    if (
      selector.includes(SCOPE) ||
      selector.includes("gemfind-ring-builder-scope")
    ) {
      return selector;
    }
    if (selector === ":root" || selector === "body" || selector.startsWith("body")) {
      return selector;
    }
    if (/^(@|:root$|html$|from |to |\d+%$)/.test(selector.trim())) {
      return selector;
    }
    return prefixed;
  },
});

function walkCssFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkCssFiles(full, files);
    } else if (entry.name.endsWith(".css")) {
      files.push(full);
    }
  }
  return files;
}

async function scopeFile(filePath) {
  const rel = path.relative(SRC_DIR, filePath).replace(/\\/g, "/");
  if (SKIP_FILES.has(path.basename(filePath))) {
    return { rel, status: "skipped-special" };
  }

  const input = fs.readFileSync(filePath, "utf8");
  const result = await postcss([scoper]).process(input, {
    from: filePath,
    to: filePath,
  });

  if (result.css === input) {
    return { rel, status: "unchanged" };
  }

  fs.writeFileSync(filePath, result.css, "utf8");
  return { rel, status: "scoped" };
}

async function main() {
  const files = walkCssFiles(SRC_DIR);
  const summary = { scoped: [], unchanged: [], skipped: [] };

  for (const file of files) {
    const { rel, status } = await scopeFile(file);
    if (status === "scoped") summary.scoped.push(rel);
    else if (status === "unchanged") summary.unchanged.push(rel);
    else summary.skipped.push(rel);
  }

  console.log(`Scoped ${summary.scoped.length} admin files.`);
  if (summary.scoped.length) {
    console.log(summary.scoped.join("\n"));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
