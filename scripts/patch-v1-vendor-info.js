/**
 * Fix V1 Vendor Information modal rendering empty/dark after password auth.
 *
 * Cause: idle `_loading_overlay_wrapper` keeps height:100% + dark background inside
 * fixed-height `.popup_diamond-product`, covering the vendor info list.
 */
const fs = require("fs");
const path = require("path");

const jsFile = path.join(__dirname, "../public/static/js/frontend-v1.js");
const cssFile = path.join(__dirname, "../public/static/css/frontend-v1.css");
const pkgFile = path.join(__dirname, "../src/rb-version-1-frontend/package.json");

if (!fs.existsSync(jsFile) || !fs.existsSync(cssFile)) {
  console.error("Missing v1 bundle files");
  process.exit(1);
}

let js = fs.readFileSync(jsFile, "utf8");
let css = fs.readFileSync(cssFile, "utf8");
let jsChanged = 0;
let cssChanged = 0;

const filterWrappedVendor =
  'className:"gf-rb-v1-filter-popup",children:(0,He.jsxs)("div",{className:"diamond-information",children:[(0,He.jsx)("div",{className:"spacification-info",children:(0,He.jsx)("h2",{children:"Vendor Information"})})';
const vendorWrapped =
  'className:"gf-rb-v1-vendor-info",children:(0,He.jsxs)("div",{className:"diamond-information",children:[(0,He.jsx)("div",{className:"spacification-info",children:(0,He.jsx)("h2",{children:"Vendor Information"})})';

if (js.includes(filterWrappedVendor)) {
  const count = js.split(filterWrappedVendor).length - 1;
  js = js.split(filterWrappedVendor).join(vendorWrapped);
  console.log(`v1 vendor info patch: renamed vendor wrapper (${count})`);
  jsChanged++;
} else if (js.includes(vendorWrapped)) {
  console.log("v1 vendor info patch: vendor wrapper already renamed");
} else {
  console.warn("v1 vendor info patch: vendor wrapper pattern not found");
}

// Settings vendor modal only: show Setting Id (keep Diamond Id on diamond vendor modal).
const settingsIdFrom =
  'children:(null===(X=o.retailerInfo)||void 0===X?void 0:X.thirdParty)||"-"})})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("div",{className:"diamonds-details-title",children:(0,He.jsx)("p",{children:"Diamond Id"})}),(0,He.jsx)("div",{className:"diamonds-info",children:(0,He.jsx)("p",{children:o.diamondId?o.diamondId:"-"})})]})';
const settingsIdTo =
  'children:(null===(X=o.retailerInfo)||void 0===X?void 0:X.thirdParty)||"-"})})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("div",{className:"diamonds-details-title",children:(0,He.jsx)("p",{children:"Setting Id"})}),(0,He.jsx)("div",{className:"diamonds-info",children:(0,He.jsx)("p",{children:o.settingId||o.stockNumber||o.diamondId||"-"})})]})';
if (js.includes(settingsIdFrom)) {
  js = js.split(settingsIdFrom).join(settingsIdTo);
  console.log("v1 vendor info patch: Setting Id label (settings modal)");
  jsChanged++;
} else if (js.includes('children:"Setting Id"') && js.includes("(X=o.retailerInfo)")) {
  console.log("v1 vendor info patch: Setting Id already present");
} else {
  console.warn("v1 vendor info patch: Setting Id pattern not found (non-fatal)");
}

const cssMarker = "/* gf-rb-v1-vendor-info */";
const vendorCss = `${cssMarker}
.react-responsive-modal-root .popup_diamond-product{background:#fff;position:relative;overflow-y:auto;box-sizing:border-box;text-align:left}
.react-responsive-modal-root .popup_diamond-product>._loading_overlay_wrapper{background:transparent!important;height:0!important;width:0!important;overflow:hidden!important;pointer-events:none!important;position:absolute!important;inset:0;z-index:9}
.react-responsive-modal-root .popup_diamond-product>._loading_overlay_wrapper:has(.react-overlay-loader-spinner){background-color:#000c!important;height:100%!important;width:100%!important;overflow:visible!important;pointer-events:auto!important}
.gf-rb-v1-vendor-info{padding:10px 0 20px;max-height:100%;overflow-y:auto;box-sizing:border-box}
.gf-rb-v1-vendor-info .diamond-information{display:block;width:100%}
.gf-rb-v1-vendor-info .diamond-information ul{margin:0;padding:0;overflow:auto;max-height:560px}
`;

if (css.includes(cssMarker)) {
  const start = css.indexOf(cssMarker);
  const next = css.indexOf("\n/* ", start + cssMarker.length);
  const end = next === -1 ? css.length : next;
  css = css.slice(0, start) + vendorCss + css.slice(end);
  cssChanged++;
  console.log("v1 vendor info patch: updated CSS");
} else {
  css += "\n" + vendorCss;
  cssChanged++;
  console.log("v1 vendor info patch: appended CSS");
}

if (jsChanged > 0) {
  fs.writeFileSync(jsFile, js, "utf8");
}
if (cssChanged > 0) {
  fs.writeFileSync(cssFile, css, "utf8");
}

if (fs.existsSync(pkgFile)) {
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  const scripts = pkg.scripts || {};
  let pkgChanged = false;
  if (typeof scripts.build === "string" && !scripts.build.includes("patch-v1-vendor-info.js")) {
    scripts.build += " && node ../../scripts/patch-v1-vendor-info.js";
    pkg.scripts = scripts;
    pkgChanged = true;
  }
  if (pkgChanged) {
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log("v1 vendor info patch: wired into package.json build script");
  }
}

console.log(
  jsChanged === 0 && cssChanged === 0
    ? "v1 vendor info patch: already up to date"
    : `v1 vendor info patch: done (js=${jsChanged}, css=${cssChanged})`
);
