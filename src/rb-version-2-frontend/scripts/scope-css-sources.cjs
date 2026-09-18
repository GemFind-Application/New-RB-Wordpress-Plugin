/**
 * Bake #GemFind.gemfind-ring-builder-scope into every selector in frontend/src CSS.
 */
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const prefixSelector = require("postcss-prefix-selector");

const SCOPE = "#GemFind.gemfind-ring-builder-scope";
const SRC_DIR = path.join(__dirname, "..", "src");
const SKIP_FILES = new Set(["gemfind-scope.css"]);

const scoper = prefixSelector({
  prefix: SCOPE,
  transform(prefix, selector, prefixed) {
    if (
      selector.includes(SCOPE) ||
      selector.includes("gemfind-ring-builder-scope") ||
      selector.includes("#GemFind")
    ) {
      return selector;
    }
    if (selector === ":root" || selector === "body") {
      return selector;
    }
    if (selector.startsWith("body ")) {
      return `${SCOPE} ${selector.slice(5)}`;
    }
    if (selector.startsWith("body.")) {
      return `${SCOPE}${selector.slice(4)}`;
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

  console.log(`Scoped ${summary.scoped.length} files.`);
  if (summary.scoped.length) {
    console.log(summary.scoped.join("\n"));
  }
  console.log(`Unchanged: ${summary.unchanged.length}`);
  console.log(`Skipped: ${summary.skipped.join(", ") || "(none)"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
