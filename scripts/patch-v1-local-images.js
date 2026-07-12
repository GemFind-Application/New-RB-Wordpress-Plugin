/**
 * Replace external ringbuilderdev image URLs in the v1 bundle with local plugin assets.
 */
const fs = require("fs");
const path = require("path");

const jsFile = path.join(__dirname, "../public/static/js/frontend-v1.js");
const cssFile = path.join(__dirname, "../public/static/css/frontend-v1.css");

if (!fs.existsSync(jsFile) || !fs.existsSync(cssFile)) {
  console.error("Missing v1 bundle files");
  process.exit(1);
}

let js = fs.readFileSync(jsFile, "utf8");
let css = fs.readFileSync(cssFile, "utf8");
let jsCount = 0;
let cssCount = 0;

function asset(filename) {
  return `window.__gemfindRbV1Asset("${filename}")`;
}

const jsReplacements = [
  [
    /[\w$]+\.initData\.data\[0\]\.server_url\+"https:\/\/ringbuilderdev\.gemfind\.us\/images\/([^"]+)"/g,
    (_, file) => asset(file),
  ],
  ['"".concat("https://ringbuilderdev.gemfind.us","/assest/images/1back-icon.png")', asset("1back-icon.png")],
  ['At("https://ringbuilderdev.gemfind.us","/assest/images/1back-icon.png")', asset("1back-icon.png")],
  ['"https://ringbuilderdev.gemfind.us/assest/images/loader-2.gif"', asset("loader-2.gif")],
  ['"https://ringbuilderdev.gemfind.us/images/ring.gif"', asset("ring.gif")],
  ['"https://ringbuilderdev.gemfind.us/images/spinner.gif"', asset("spinner.gif")],
  ['"https://ringbuilderdev.gemfind.us/images/color.jpg"', asset("color.jpg")],
  ['"https://ringbuilderdev.gemfind.us/images/carat.jpg"', asset("carat.jpg")],
  ['"https://ringbuilderdev.gemfind.us/images/diamond.gif"', asset("diamond.gif")],
  ['"https://ringbuilderdev.gemfind.us/images/360-view.png"', asset("360-view.png")],
  ['"/assest/images/diamond.gif"', asset("diamond-loader.gif")],
  ['src:"/assest/images/diamond.gif"', `src:${asset("diamond-loader.gif")}`],
];

for (const item of jsReplacements) {
  if (item[0] instanceof RegExp) {
    const re = item[0];
    const before = js;
    js = js.replace(re, (...args) => {
      jsCount++;
      return typeof item[1] === "function" ? item[1](...args) : item[1];
    });
    if (js !== before) {
      console.log(`v1 local images: regex ${re}`);
    }
    continue;
  }

  const [from, to] = item;
  if (!js.includes(from)) {
    continue;
  }
  const count = js.split(from).length - 1;
  js = js.split(from).join(to);
  jsCount += count;
  console.log(`v1 local images: ${from.slice(0, 60)}… (${count})`);
}

const cssReplacements = [
  [
    "url(https://ringbuilderdev.gemfind.us/static/media/diamond.ab83c6d22d8820a8944a.gif)",
    "url(../../frontpublic/build/diamond-overlay.gif)",
  ],
  [
    "url(https://ringbuilderdev.gemfind.us/static/media/shape-images.cdd2376994bc14bad604.png)",
    "url(../../frontpublic/build/shape-images.png)",
  ],
];

for (const [from, to] of cssReplacements) {
  if (!css.includes(from)) {
    continue;
  }
  const count = css.split(from).length - 1;
  css = css.split(from).join(to);
  cssCount += count;
  console.log(`v1 local images css: ${from.slice(0, 70)}… (${count})`);
}

if (js.includes("ringbuilderdev.gemfind.us/images") || js.includes("ringbuilderdev.gemfind.us/assest")) {
  console.warn("v1 bundle still contains ringbuilderdev image URLs — review patch rules");
  process.exitCode = 1;
}

fs.writeFileSync(jsFile, js, "utf8");
fs.writeFileSync(cssFile, css, "utf8");
console.log(`Patched v1 bundle: ${jsCount} JS replacements, ${cssCount} CSS replacements`);
