/**
 * Production ZIP for WordPress upload (no React source / node_modules).
 * Run from plugin root: node scripts/package-plugin.cjs
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const pluginRoot = path.join(__dirname, "..");
const pluginName = "gemfind-ring-builder";
const version = "1.0.0";
const staging = path.join(require("os").tmpdir(), `${pluginName}-dist`);
const root = path.join(staging, pluginName);
const zipPath = path.join(pluginRoot, "..", `${pluginName}-${version}.zip`);

const COPY_DIRS = ["admin", "includes", "templates", "vendor", "assets"];
const COPY_FILES = ["gemfind-ring-builder.php", "readme.txt", "composer.json"];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function main() {
  console.log("Building bundles...");
  execSync("npm run build", { cwd: pluginRoot, stdio: "inherit" });

  if (fs.existsSync(staging)) {
    fs.rmSync(staging, { recursive: true, force: true });
  }
  fs.mkdirSync(root, { recursive: true });

  for (const file of COPY_FILES) {
    fs.copyFileSync(path.join(pluginRoot, file), path.join(root, file));
  }
  for (const dir of COPY_DIRS) {
    const src = path.join(pluginRoot, dir);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(root, dir));
    }
  }

  // public: only runtime bundles (v2 frontpublic/build + v1 static)
  const publicRoot = path.join(root, "public");
  fs.mkdirSync(publicRoot, { recursive: true });
  copyDir(
    path.join(pluginRoot, "public", "frontpublic", "build"),
    path.join(publicRoot, "frontpublic", "build")
  );
  copyDir(
    path.join(pluginRoot, "public", "static"),
    path.join(publicRoot, "static")
  );

  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${root}' -DestinationPath '${zipPath}' -CompressionLevel Optimal -Force"`,
    { stdio: "inherit" }
  );

  const sizeMB = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(2);
  console.log(`Created ${zipPath} (${sizeMB} MB)`);
  fs.rmSync(staging, { recursive: true, force: true });
}

main();
