/**
 * Build all Ring Builder frontend bundles and verify output paths.
 *
 * Usage (from plugin root):
 *   node scripts/build-all.cjs           # admin + v2 + v1
 *   node scripts/build-all.cjs admin
 *   node scripts/build-all.cjs v2
 *   node scripts/build-all.cjs v1
 *   node scripts/build-all.cjs admin v2  # multiple targets
 *
 * npm scripts: npm run build | build:all | build:admin | build:v2 | build:v1
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const pluginRoot = path.join(__dirname, "..");

const TARGETS = {
  admin: {
    label: "Admin UI (React)",
    cwd: path.join(pluginRoot, "src", "admin-frontend"),
    npmScript: "build",
    outputs: ["assets/build/admin.js"],
    optionalOutputs: ["assets/build/admin.css"],
  },
  v2: {
    label: "Storefront v2 (React)",
    cwd: path.join(pluginRoot, "public", "frontpublic"),
    npmScript: "build",
    outputs: [
      "public/frontpublic/build/assets/frontend.js",
      "public/frontpublic/build/assets/frontend.css",
    ],
  },
  v1: {
    label: "Storefront v1 (classic bundle)",
    cwd: path.join(pluginRoot, "src", "rb-version-1-frontend"),
    npmScript: "build",
    outputs: [
      "public/static/js/frontend-v1.js",
      "public/static/css/frontend-v1.css",
    ],
    optionalOutputs: ["public/static/css/frontend-v1.css"],
  },
};

const ALL_TARGETS = ["admin", "v2", "v1"];

function log(msg) {
  console.log(`\n▶ ${msg}`);
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ ${msg}`);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function ensureNodeModules(cwd, name) {
  const nm = path.join(cwd, "node_modules");
  if (fs.existsSync(nm)) {
    return;
  }
  log(`Installing dependencies for ${name}…`);
  execSync("npm install", { cwd, stdio: "inherit" });
}

function runTarget(key) {
  const target = TARGETS[key];
  if (!target) {
    throw new Error(`Unknown build target: ${key}`);
  }

  log(`Building ${target.label}`);

  if (!fs.existsSync(target.cwd)) {
    throw new Error(`Source directory missing: ${target.cwd}`);
  }

  if (key !== "v1") {
    ensureNodeModules(target.cwd, target.label);
  }

  execSync(`npm run ${target.npmScript}`, {
    cwd: target.cwd,
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  const missing = [];
  const written = [];

  for (const rel of target.outputs) {
    const abs = path.join(pluginRoot, rel);
    const isOptional =
      target.optionalOutputs && target.optionalOutputs.includes(rel);

    if (!fs.existsSync(abs)) {
      if (isOptional) {
        ok(`${rel} (optional, not present)`);
        continue;
      }
      missing.push(rel);
      continue;
    }

    const stat = fs.statSync(abs);
    written.push({ rel, size: stat.size, mtime: stat.mtime });
    ok(`${rel} (${formatSize(stat.size)})`);
  }

  if (missing.length) {
    throw new Error(
      `${target.label} finished but required files are missing:\n  - ${missing.join("\n  - ")}`
    );
  }

  return written;
}

function parseArgs(argv) {
  const args = argv.slice(2).map((a) => a.toLowerCase());
  if (!args.length) {
    return ALL_TARGETS;
  }

  const selected = [];
  for (const arg of args) {
    if (arg === "all") {
      return ALL_TARGETS;
    }
    if (!TARGETS[arg]) {
      throw new Error(
        `Invalid target "${arg}". Use: admin, v2, v1, or all`
      );
    }
    if (!selected.includes(arg)) {
      selected.push(arg);
    }
  }
  return selected;
}

function main() {
  const started = Date.now();
  console.log("GemFind Ring Builder — frontend build");
  console.log(`Plugin root: ${pluginRoot}`);

  let targets;
  try {
    targets = parseArgs(process.argv);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  console.log(`Targets: ${targets.join(", ")}`);

  const summary = [];

  try {
    for (const key of targets) {
      const files = runTarget(key);
      summary.push({ key, files });
    }
  } catch (err) {
    console.error("\nBuild failed.");
    console.error(err.message || err);
    process.exit(1);
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log("\n────────────────────────────────────────");
  console.log("Build complete");
  console.log(`Time: ${elapsed}s`);
  console.log("\nOutput locations (enqueued by WordPress):");
  console.log("  Admin  → assets/build/admin.js");
  console.log("  v2     → public/frontpublic/build/assets/frontend.js");
  console.log("  v1     → public/static/js/frontend-v1.js");
  console.log("\nRun from plugin root: npm run build");
}

main();
