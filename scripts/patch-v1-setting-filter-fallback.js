/**
 * When a selected setting cookie (_shopify_ringsetting) forces shape/carat
 * filters that match zero inventory, diamondtools shows "No Records Found"
 * until the user hits Reset. Resetting also drops the setting pairing.
 *
 * Fix: if GetDiamond returns 0 while setting constraints are active, relax
 * those constraints for listing (keep the setting cookie for complete-ring),
 * then refetch so products appear without requiring Reset.
 */
const fs = require("fs");
const path = require("path");

const jsFile = path.join(__dirname, "../public/static/js/frontend-v1.js");
const pkgFile = path.join(__dirname, "../src/rb-version-1-frontend/package.json");
const shortcodeFile = path.join(__dirname, "../includes/class-gemfindrb-shortcode.php");

if (!fs.existsSync(jsFile)) {
  console.error("Missing v1 bundle");
  process.exit(1);
}

let js = fs.readFileSync(jsFile, "utf8");
let changed = 0;

const RELAX_CHECK =
  '!(window.__gemfindRbRelaxSettingDiamondFilters&&window.__gemfindRbRelaxSettingDiamondFilters())';

function replaceOnce(from, to, label) {
  if (!js.includes(from)) {
    if (js.includes(to) || (label && js.includes("__gemfindRbRelaxSettingDiamondFilters"))) {
      console.log(`v1 setting-filter fallback: ${label} already applied`);
      return;
    }
    console.warn(`v1 setting-filter fallback: pattern not found — ${label}`);
    return;
  }
  js = js.replace(from, to);
  changed++;
  console.log(`v1 setting-filter fallback: ${label}`);
}

function replaceAll(from, to, label) {
  if (!js.includes(from)) {
    console.warn(`v1 setting-filter fallback: pattern not found — ${label}`);
    return;
  }
  const n = js.split(from).length - 1;
  js = js.split(from).join(to);
  changed += n;
  console.log(`v1 setting-filter fallback: ${label} (${n})`);
}

// 1) Shape override in GetDiamond URL builder
replaceOnce(
  'St._shopify_ringsetting){var d=St._shopify_ringsetting[0].centerStoneFit.split(",").length;if(St._shopify_ringsetting&&St._shopify_ringsetting[0].centerStoneFit&&d<2)p=St._shopify_ringsetting[0].centerStoneFit.replace(/\\s/g,"");else if(d<1)p=St._shopify_ringsetting[0].centerStoneFit;else if(""===u||","===u)var p=St._shopify_ringsetting[0].centerStoneFit;else p=u}else p=u',
  `St._shopify_ringsetting&&${RELAX_CHECK}){var d=St._shopify_ringsetting[0].centerStoneFit.split(",").length;if(St._shopify_ringsetting&&St._shopify_ringsetting[0].centerStoneFit&&d<2)p=St._shopify_ringsetting[0].centerStoneFit.replace(/\\s/g,"");else if(d<1)p=St._shopify_ringsetting[0].centerStoneFit;else if(""===u||","===u)var p=St._shopify_ringsetting[0].centerStoneFit;else p=u}else p=u`,
  "API shape override respects relax flag"
);

// 2) Carat slider props from setting cookie
replaceAll(
  "minCarat:St._shopify_ringsetting?St._shopify_ringsetting[0].ringmincarat:D,maxCarat:St._shopify_ringsetting?St._shopify_ringsetting[0].ringmaxcarat:P",
  `minCarat:St._shopify_ringsetting&&${RELAX_CHECK}?St._shopify_ringsetting[0].ringmincarat:D,maxCarat:St._shopify_ringsetting&&${RELAX_CHECK}?St._shopify_ringsetting[0].ringmaxcarat:P`,
  "carat slider props"
);

// 3) Carat init from setting when D/P empty
replaceOnce(
  'if(""===D&&""===P&&St._shopify_ringsetting&&St._shopify_ringsetting[0].setting_id&&St._shopify_ringsetting[0].ringmincarat&&St._shopify_ringsetting[0].ringmaxcarat)',
  `if(""===D&&""===P&&St._shopify_ringsetting&&St._shopify_ringsetting[0].setting_id&&St._shopify_ringsetting[0].ringmincarat&&St._shopify_ringsetting[0].ringmaxcarat&&${RELAX_CHECK})`,
  "carat init from setting"
);

// 4) useEffect that forces shape from setting (appears in mined/lab/fancy branches)
replaceAll(
  '"mined"===it&&St._shopify_ringsetting&&St._shopify_ringsetting[0].setting_id&&p(St._shopify_ringsetting[0].centerStoneFit)',
  `"mined"===it&&St._shopify_ringsetting&&St._shopify_ringsetting[0].setting_id&&${RELAX_CHECK}&&p(St._shopify_ringsetting[0].centerStoneFit)`,
  "mined shape force"
);
replaceAll(
  '"labgrown"===it&&St._shopify_ringsetting&&St._shopify_ringsetting[0].setting_id&&p(St._shopify_ringsetting[0].centerStoneFit)',
  `"labgrown"===it&&St._shopify_ringsetting&&St._shopify_ringsetting[0].setting_id&&${RELAX_CHECK}&&p(St._shopify_ringsetting[0].centerStoneFit)`,
  "labgrown shape force"
);
replaceAll(
  '"fancycolor"===it&&St._shopify_ringsetting&&St._shopify_ringsetting[0].setting_id&&p(St._shopify_ringsetting[0].centerStoneFit)',
  `"fancycolor"===it&&St._shopify_ringsetting&&St._shopify_ringsetting[0].setting_id&&${RELAX_CHECK}&&p(St._shopify_ringsetting[0].centerStoneFit)`,
  "fancy shape force"
);

// 5) Carat component internal sync from cookie
replaceOnce(
  "v._shopify_ringsetting?(h(Number(v._shopify_ringsetting[0].ringmincarat)),g(Number(v._shopify_ringsetting[0].ringmaxcarat))):(h(void 0),g(void 0))",
  `v._shopify_ringsetting&&${RELAX_CHECK}?(h(Number(v._shopify_ringsetting[0].ringmincarat)),g(Number(v._shopify_ringsetting[0].ringmaxcarat))):(h(void 0),g(void 0))`,
  "carat component cookie sync"
);

// 6) On empty GetDiamond while setting constraints active → enable relax + clear filters + refetch
const responseFrom =
  "u.diamondList?$(u.diamondList):$([]),K(u.count);var m=Math.ceil(u.count/ze);Ie(m),Le((n||qe-1)*ze+1);var g=parseInt(n||qe*ze);Fe(g),X(!0),setTimeout(()=>{Xe(!1)},500),lt(!0)";
const responseTo =
  'u.diamondList?$(u.diamondList):$([]),K(u.count);if(0===Number(u.count)&&St._shopify_ringsetting&&St._shopify_ringsetting[0]&&St._shopify_ringsetting[0].setting_id&&window.__gemfindRbEnableRelaxSettingDiamondFilters&&!window.__gemfindRbRelaxSettingDiamondFilters()){window.__gemfindRbEnableRelaxSettingDiamondFilters();try{p("");}catch(e){}try{A("");T("");}catch(e){}setTimeout(function(){try{Lt("relax-"+Date.now());}catch(e){}Xe(!0);},0)}var m=Math.ceil(u.count/ze);Ie(m),Le((n||qe-1)*ze+1);var g=parseInt(n||qe*ze);Fe(g),X(!0),setTimeout(()=>{Xe(!1)},500),lt(!0)';
replaceOnce(responseFrom, responseTo, "zero-result enables relax + refetch");

// Keep a previously-patched early-return form upgraded to the non-blocking version.
replaceOnce(
  'u.diamondList?$(u.diamondList):$([]),K(u.count);if(0===Number(u.count)&&St._shopify_ringsetting&&St._shopify_ringsetting[0]&&St._shopify_ringsetting[0].setting_id&&window.__gemfindRbEnableRelaxSettingDiamondFilters&&!window.__gemfindRbRelaxSettingDiamondFilters()){window.__gemfindRbEnableRelaxSettingDiamondFilters();try{p("");}catch(e){}try{A("");T("");}catch(e){}try{Lt("relax-"+Date.now());}catch(e){}Xe(!0);return}var m=Math.ceil(u.count/ze);Ie(m),Le((n||qe-1)*ze+1);var g=parseInt(n||qe*ze);Fe(g),X(!0),setTimeout(()=>{Xe(!1)},500),lt(!0)',
  responseTo,
  "upgrade early-return relax to non-blocking"
);

// After shape resolution, drop setting-forced shape while relaxed (keeps user-chosen shapes).
replaceOnce(
  'erStoneFit;else p=u}else p=u;try{if("fancycolor"===it){var h',
  'erStoneFit;else p=u}else p=u;if(window.__gemfindRbRelaxSettingDiamondFilters&&window.__gemfindRbRelaxSettingDiamondFilters()&&St._shopify_ringsetting&&St._shopify_ringsetting[0]&&St._shopify_ringsetting[0].centerStoneFit){var __gfFit=String(St._shopify_ringsetting[0].centerStoneFit).replace(/\\s/g,"");if(String(p||"").replace(/\\s/g,"")===__gfFit)p=""}try{if("fancycolor"===it){var h',
  "clear setting shape while relaxed"
);
const clearHook =
  'window.__gemfindRbClearRelaxSettingDiamondFilters&&window.__gemfindRbClearRelaxSettingDiamondFilters(),z("_shopify_ringsetting",JSON.stringify(n),{path:"/",maxAge:604800})';
if (js.includes(clearHook)) {
  console.log("v1 setting-filter fallback: clear relax on new setting cookie already applied");
} else {
  replaceAll(
    'z("_shopify_ringsetting",JSON.stringify(n),{path:"/",maxAge:604800})',
    clearHook,
    "clear relax on new setting cookie"
  );
}

if (changed > 0) {
  fs.writeFileSync(jsFile, js, "utf8");
}

if (fs.existsSync(pkgFile)) {
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  const scripts = pkg.scripts || {};
  if (typeof scripts.build === "string" && !scripts.build.includes("patch-v1-setting-filter-fallback.js")) {
    scripts.build += " && node ../../scripts/patch-v1-setting-filter-fallback.js";
    pkg.scripts = scripts;
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log("v1 setting-filter fallback: wired into package.json build");
  }
}

// Inject helpers into shortcode mount patch if not already present.
if (fs.existsSync(shortcodeFile)) {
  let php = fs.readFileSync(shortcodeFile, "utf8");
  if (!php.includes("__gemfindRbRelaxSettingDiamondFilters")) {
    const helpers =
      "window.__gemfindRbRelaxSettingDiamondFilters=function(){try{return sessionStorage.getItem('gemfindrb_relax_setting_diamond')==='1'}catch(e){return!!window.__gemfindrbRelaxSettingDiamond}};window.__gemfindRbEnableRelaxSettingDiamondFilters=function(){window.__gemfindrbRelaxSettingDiamond=true;try{sessionStorage.setItem('gemfindrb_relax_setting_diamond','1')}catch(e){}};window.__gemfindRbClearRelaxSettingDiamondFilters=function(){window.__gemfindrbRelaxSettingDiamond=false;try{sessionStorage.removeItem('gemfindrb_relax_setting_diamond')}catch(e){}};";
    const assetFn = "window.__gemfindRbV1Asset=function(f)";
    const ai = php.indexOf(assetFn);
    if (ai === -1) {
      console.warn("v1 setting-filter fallback: mount patch asset fn not found");
    } else {
      const close = php.indexOf("})();", ai);
      if (close === -1) {
        console.warn("v1 setting-filter fallback: mount patch close not found");
      } else {
        php = php.slice(0, close) + helpers + php.slice(close);
        fs.writeFileSync(shortcodeFile, php, "utf8");
        console.log("v1 setting-filter fallback: helpers added to shortcode mount patch");
        changed++;
      }
    }
  } else {
    console.log("v1 setting-filter fallback: shortcode helpers already present");
  }
}

console.log(
  changed === 0
    ? "v1 setting-filter fallback: already up to date"
    : `v1 setting-filter fallback: done (${changed})`
);
