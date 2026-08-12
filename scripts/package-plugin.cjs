/**
 * Production ZIP for WordPress upload (no React source / node_modules).
 * Uses forward-slash zip paths so Linux hosts (Cloudways) extract real folders.
 * Run from plugin root: node scripts/package-plugin.cjs
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { spawnSync } = require("child_process");

const pluginRoot = path.join(__dirname, "..");
const pluginName = "gemfind-ring-builder";
const version = "1.0.0";
const staging = path.join(require("os").tmpdir(), `${pluginName}-dist`);
const root = path.join(staging, pluginName);
const zipPath = path.join(pluginRoot, "..", `${pluginName}-${version}.zip`);
const zipPathAlias = path.join(pluginRoot, "..", `${pluginName}.zip`);

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

function walkFiles(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, base, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

/**
 * Create a ZIP with POSIX (forward-slash) entry names via PowerShell + .NET.
 * Compress-Archive uses backslashes and breaks WordPress on Linux.
 */
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
  const result = spawnSync(
    "powershell",
    ["-NoProfile", "-Command", ps],
    { encoding: "utf8" }
  );
  if (result.status !== 0) {
    throw new Error(
      `ZIP creation failed:\n${result.stdout || ""}\n${result.stderr || ""}`
    );
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
if ($main.Count -lt 1) { throw 'Main plugin file entry missing (forward-slash path).' }
if ($bs -gt 0) { throw "ZIP still has $bs backslash paths." }
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

  const fileCount = walkFiles(root).length;
  console.log(`Staging ${fileCount} files → creating POSIX ZIP...`);

  createPosixZip(root, zipPath);
  assertPosixZip(zipPath);

  fs.copyFileSync(zipPath, zipPathAlias);

  const sizeMB = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(2);
  console.log(`Created ${zipPath} (${sizeMB} MB)`);
  console.log(`Also copied to ${zipPathAlias}`);
  fs.rmSync(staging, { recursive: true, force: true });
}

main();
