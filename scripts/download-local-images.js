/**
 * Download Ring Builder UI images into public/frontpublic/build/ (served via imageBaseUrl).
 * Run from plugin root: node scripts/download-local-images.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const pluginRoot = path.join(__dirname, "..");
const outDir = path.join(pluginRoot, "public", "frontpublic", "build");
const base = "https://ringbuilderdev.gemfind.us";

/** remotePath -> local filename in build/ */
const ASSETS = [
  ["/images/carat.jpg", "carat.jpg"],
  ["/images/color.jpg", "color.jpg"],
  ["/images/ring.gif", "ring.gif"],
  ["/images/spinner.gif", "spinner.gif"],
  ["/images/diamond.gif", "diamond.gif"],
  ["/images/360-view.png", "360-view.png"],
  ["/assest/images/loader-2.gif", "loader-2.gif"],
  ["/assest/images/diamond.gif", "diamond-loader.gif"],
  ["/assest/images/1back-icon.png", "1back-icon.png"],
  ["/static/media/diamond.ab83c6d22d8820a8944a.gif", "diamond-overlay.gif"],
  ["/static/media/shape-images.cdd2376994bc14bad604.png", "shape-images.png"],
  ["/images/no-image.jpg", "no-image.jpg"],
  ["/images/no-image1.jpg", "no-image1.jpg"],
  ["/images/downarrow_dir.png", "downarrow_dir.png"],
  ["/images/uparrow_dir.png", "uparrow_dir.png"],
  ["/images/double-arrow-left.png", "double-arrow-left.png"],
  ["/images/double-arrow-right.png", "double-arrow-right.png"],
  ["/images/round.png", "round.png"],
  ["/images/asscher.png", "asscher.png"],
  ["/images/marquise.png", "marquise.png"],
  ["/images/oval.png", "oval.png"],
  ["/images/cushion.png", "cushion.png"],
  ["/images/radiant.png", "radiant.png"],
  ["/images/pear.png", "pear.png"],
  ["/images/emerald.png", "emerald.png"],
  ["/images/heart.png", "heart.png"],
  ["/images/princess.png", "princess.png"],
  ["/images/image-9-2x.png", "image-9-2x.png"],
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "gemfind-ring-builder-asset-sync" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          res.resume();
          fetchUrl(next).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const [remotePath, localName] of ASSETS) {
    const dest = path.join(outDir, localName);
    const url = base + remotePath;

    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      console.log(`skip ${localName} (exists)`);
      skip++;
      continue;
    }

    try {
      const buf = await fetchUrl(url);
      if (!buf.length) {
        throw new Error("empty response");
      }
      fs.writeFileSync(dest, buf);
      console.log(`ok   ${localName} (${buf.length} bytes)`);
      ok++;
    } catch (err) {
      console.warn(`fail ${localName} <- ${url} (${err.message})`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} downloaded, ${skip} skipped, ${fail} failed`);
  if (fail > 0) {
    process.exitCode = 1;
  }
}

main();
