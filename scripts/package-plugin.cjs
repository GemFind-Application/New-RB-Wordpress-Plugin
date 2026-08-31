/**
 * Production ZIP for WordPress upload (no React source / node_modules).
 * Uses forward-slash zip paths so Linux hosts extract real folders.
 * Run from plugin root: node scripts/package-plugin.cjs
 *
 * public/ in the ZIP is only:
 *   - Version 2 build: public/frontpublic/build/
 *   - Version 1 build: public/static/js + public/static/css
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const pluginRoot = path.join(__dirname, "..");
const pluginName = "gemfind-ring-builder";
const version = "1.0.0";
const maxMb = 10;
const staging = path.join(require("os").tmpdir(), `${pluginName}-dist`);
const root = path.join(staging, pluginName);
const zipInPlugin = path.join(pluginRoot, `${pluginName}.zip`);
const zipVersioned = path.join(pluginRoot, "..", `${pluginName}-${version}.zip`);
const zipAlias = path.join(pluginRoot, "..", `${pluginName}.zip`);

const COPY_DIRS = ["admin", "includes", "templates", "vendor", "assets", "languages"];
const COPY_FILES = ["gemfind-ring-builder.php", "readme.txt", "composer.json"];

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  "tests",
  "Tests",
  "docs",
  ".github",
  "generator",
  "thecodingmachine",
]);

const SKIP_FILE_EXT = new Set([".map", ".zip", ".md"]);
const SKIP_FONT_EXT = new Set([".svg", ".eot", ".ttf"]);

function shouldSkipDir(name, relPosix) {
  if (SKIP_DIR_NAMES.has(name)) {
    return true;
  }
  if (relPosix === "vendor/vendor") {
    return true;
  }
  return false;
}

function shouldSkipFile(name, relPosix) {
  const ext = path.extname(name).toLowerCase();
  if (name === "composer.json" || name.toLowerCase().startsWith("license")) {
    return false;
  }
  if (name.toLowerCase() === "index.html") {
    return true;
  }
  if (SKIP_FILE_EXT.has(ext) && name.toLowerCase() !== "license.md") {
    return true;
  }
  if (relPosix.includes("fontawesome/webfonts/") && SKIP_FONT_EXT.has(ext)) {
    return true;
  }
  return false;
}

function copyDir(src, dest, rel = "") {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const relPosix = rel ? `${rel}/${entry.name}` : entry.name;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name, relPosix)) {
        continue;
      }
      copyDir(s, d, relPosix);
    } else if (!shouldSkipFile(entry.name, relPosix)) {
      fs.copyFileSync(s, d);
    }
  }
}

function copyFileRel(rel, destRoot) {
  const src = path.join(pluginRoot, rel);
  if (!fs.existsSync(src)) {
    throw new Error(`Missing ${rel}`);
  }
  const dest = path.join(destRoot, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyPublicBuilds(destRoot) {
  copyDir(
    path.join(pluginRoot, "public", "frontpublic", "build"),
    path.join(destRoot, "public", "frontpublic", "build"),
    "frontpublic/build"
  );
  copyFileRel("public/static/js/frontend-v1.js", destRoot);
  copyFileRel("public/static/css/frontend-v1.css", destRoot);
  const v1Slider = "public/static/js/nouislider.min.js";
  if (fs.existsSync(path.join(pluginRoot, v1Slider))) {
    copyFileRel(v1Slider, destRoot);
  }
}

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function assertRuntimeFiles() {
  const required = [
    "gemfind-ring-builder.php",
    "readme.txt",
    "vendor/autoload.php",
    "assets/build/admin.js",
    "public/frontpublic/build/assets/frontend.js",
    "public/frontpublic/build/assets/frontend.css",
    "public/static/js/frontend-v1.js",
  ];
  const missing = required.filter((rel) => !fs.existsSync(path.join(pluginRoot, rel)));
  if (missing.length) {
    throw new Error(`Missing runtime files:\n  - ${missing.join("\n  - ")}`);
  }
}

function createPosixZip(sourceDir, destinationZip) {
  const ps = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$src = '${sourceDir.replace(/'/g, "''")}'
$dest = '${destinationZip.replace(/'/g, "''")}'
if (Test-Path $dest) { Remove-Item -Force $dest }
$zip = [System.IO.Compression.ZipFile]::Open($dest, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  $rootName = [System.IO.Path]::GetFileName($src.TrimEnd('\\','/'))
  $files = Get-ChildItem -LiteralPath $src -Recurse -File
  foreach ($file in $files) {
    $rel = $file.FullName.Substring($src.Length).TrimStart([char]92, [char]47)
    $entryName = ($rootName + '/' + $rel.Replace([string][char]92, '/')).Replace('//', '/')
    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal
    )
  }
} finally {
  $zip.Dispose()
}
`;
  const result = spawnSync("powershell", ["-NoProfile", "-Command", ps], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`ZIP creation failed:\n${result.stdout || ""}\n${result.stderr || ""}`);
  }
}

function assertPosixZip(zipFile) {
  const check = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('${zipFile.replace(/'/g, "''")}')
$names = @($z.Entries | ForEach-Object { $_.FullName })
$z.Dispose()
$main = @($names | Where-Object { $_ -eq 'gemfind-ring-builder/gemfind-ring-builder.php' })
$bs = @($names | Where-Object { $_ -like '*\\*' }).Count
$nm = @($names | Where-Object { $_ -like '*node_modules*' }).Count
$pubBad = @($names | Where-Object {
  $_ -like 'gemfind-ring-builder/public/*' -and
  $_ -notlike 'gemfind-ring-builder/public/frontpublic/build/*' -and
  $_ -notlike 'gemfind-ring-builder/public/static/*'
}).Count
$pubSrc = @($names | Where-Object { $_ -like 'gemfind-ring-builder/public/frontpublic/src*' }).Count
if ($main.Count -lt 1) { throw 'Main plugin file entry missing (forward-slash path).' }
if ($bs -gt 0) { throw "ZIP still has $bs backslash paths." }
if ($nm -gt 0) { throw "ZIP still has $nm node_modules files." }
if ($pubSrc -gt 0) { throw 'ZIP still has public/frontpublic/src.' }
if ($pubBad -gt 0) { throw "ZIP public/ has $pubBad files outside v1 static / v2 build." }
Write-Output ("OK entries=" + $names.Count + " main=gemfind-ring-builder/gemfind-ring-builder.php")
`,
    ],
    { encoding: "utf8" }
  );
  if (check.status !== 0) {
    throw new Error(`ZIP validation failed:\n${check.stdout}\n${check.stderr}`);
  }
  console.log(String(check.stdout || "").trim());
}

function main() {
  console.log("Packaging GemFind Ring Builder (runtime files only, no rebuild)…");
  assertRuntimeFiles();

  if (fs.existsSync(staging)) {
    fs.rmSync(staging, { recursive: true, force: true });
  }
  fs.mkdirSync(root, { recursive: true });

  for (const file of COPY_FILES) {
    const src = path.join(pluginRoot, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(root, file));
    }
  }
  for (const dir of COPY_DIRS) {
    const src = path.join(pluginRoot, dir);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(root, dir));
    }
  }

  copyPublicBuilds(root);

  const fileCount = walkFiles(root).length;
  console.log(`Staging ${fileCount} files → creating POSIX ZIP…`);

  createPosixZip(root, zipVersioned);
  assertPosixZip(zipVersioned);

  fs.copyFileSync(zipVersioned, zipAlias);
  if (fs.existsSync(zipInPlugin)) {
    fs.rmSync(zipInPlugin, { force: true });
  }

  const sizeMb = fs.statSync(zipVersioned).size / (1024 * 1024);
  console.log(`Created ${zipVersioned} (${sizeMb.toFixed(2)} MB)`);
  console.log(`Copied to ${zipAlias}`);
  fs.rmSync(staging, { recursive: true, force: true });

  if (sizeMb >= maxMb) {
    throw new Error(`ZIP is ${sizeMb.toFixed(2)} MB; must stay under ${maxMb} MB.`);
  }
}

main();
