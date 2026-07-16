/**
 * Fix V1 diamond advanced-filter "Last" pip sentinel IDs.
 *
 * Bug: polish/fluorescence/symmetry (and cut) used `range.length+1` for the
 * sentinel id. When API ids are sparse (e.g. polish only id "3"), that becomes
 * id "2", so noUiSlider gets min>max or min===max and renders a broken single
 * handle / grey bar — while Color already uses lastId+1 correctly.
 *
 * Use Math.max(...ids)+1 for the sentinel, matching the color slider pattern.
 */
const fs = require("fs");
const path = require("path");

const jsFile = path.join(__dirname, "../public/static/js/frontend-v1.js");
const pkgFile = path.join(__dirname, "../src/rb-version-1-frontend/package.json");

if (!fs.existsSync(jsFile)) {
  console.error("Missing v1 bundle");
  process.exit(1);
}

let js = fs.readFileSync(jsFile, "utf8");
let changed = 0;

const replacements = [
  {
    label: "polish Last sentinel",
    from: 'var v=D[1][0].polishRange,y=D[1][0].polishRange.length+1;v.push({$id:"000",polishId:y.toString(),polishName:"Last"})',
    to: 'var v=D[1][0].polishRange,y=(v&&v.length?Math.max.apply(null,v.map(function(e){return Number(e.polishId)||0}))+1:1);v.push({$id:"000",polishId:String(y),polishName:"Last"})',
  },
  {
    label: "fluorescence Last sentinel",
    from: 'var b=D[1][0].fluorescenceRange,x=D[1][0].fluorescenceRange.length+1;b.push({$id:"000",fluorescenceId:x.toString(),fluorescenceName:"Last"})',
    to: 'var b=D[1][0].fluorescenceRange,x=(b&&b.length?Math.max.apply(null,b.map(function(e){return Number(e.fluorescenceId)||0}))+1:1);b.push({$id:"000",fluorescenceId:String(x),fluorescenceName:"Last"})',
  },
  {
    label: "symmetry Last sentinel",
    from: 'var j=D[1][0].symmetryRange,k=D[1][0].symmetryRange.length+1;j.push({$id:"000",symmetryId:k.toString(),symmteryName:"Last"})',
    to: 'var j=D[1][0].symmetryRange,k=(j&&j.length?Math.max.apply(null,j.map(function(e){return Number(e.symmetryId)||0}))+1:1);j.push({$id:"000",symmetryId:String(k),symmteryName:"Last"})',
  },
  {
    label: "cut Last sentinel",
    from: 'var n=D[1][0].cutRange,r=D[1][0].cutRange.length+1;n.push({$id:"000",cutId:r.toString(),cutName:"Last"})',
    to: 'var n=D[1][0].cutRange,r=(n&&n.length?Math.max.apply(null,n.map(function(e){return Number(e.cutId)||0}))+1:1);n.push({$id:"000",cutId:String(r),cutName:"Last"})',
  },
];

for (const { label, from, to } of replacements) {
  if (js.includes(to) && !js.includes(from)) {
    console.log(`v1 filter Last sentinel: ${label} already patched`);
    continue;
  }
  if (!js.includes(from)) {
    console.warn(`v1 filter Last sentinel: pattern not found — ${label}`);
    continue;
  }
  js = js.split(from).join(to);
  changed++;
  console.log(`v1 filter Last sentinel: ${label}`);
}

// Harden equal/inverted range coerce in bundled noUiSlider (defense in depth).
const coerceFrom =
  'if(n.min===n.max){var __gfStep=t.singleStep&&t.singleStep>0?Number(t.singleStep):1;if(!isFinite(__gfStep)||__gfStep<=0)__gfStep=1;n=Object.assign({},n,{max:Number(n.min)+__gfStep});}';
const coerceTo =
  'if(Number(n.min)>Number(n.max)){var __gfTmp=n.min;n=Object.assign({},n,{min:n.max,max:__gfTmp});}if(n.min===n.max){var __gfStep=t.singleStep&&t.singleStep>0?Number(t.singleStep):1;if(!isFinite(__gfStep)||__gfStep<=0)__gfStep=1;n=Object.assign({},n,{max:Number(n.min)+__gfStep});}';
if (js.includes(coerceTo.replace(/\s+/g, " ")) || js.includes("Number(n.min)>Number(n.max)")) {
  console.log("v1 filter Last sentinel: range invert coerce already present");
} else if (js.includes(coerceFrom)) {
  js = js.split(coerceFrom).join(coerceTo);
  changed++;
  console.log("v1 filter Last sentinel: invert+equal range coerce");
} else {
  console.warn("v1 filter Last sentinel: equal-range coerce pattern not found (non-fatal)");
}

if (changed > 0) {
  fs.writeFileSync(jsFile, js, "utf8");
}

if (fs.existsSync(pkgFile)) {
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  const scripts = pkg.scripts || {};
  if (typeof scripts.build === "string" && !scripts.build.includes("patch-v1-filter-last-sentinel.js")) {
    scripts.build += " && node ../../scripts/patch-v1-filter-last-sentinel.js";
    pkg.scripts = scripts;
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log("v1 filter Last sentinel: wired into package.json build");
  }
}

console.log(
  changed === 0
    ? "v1 filter Last sentinel: already up to date"
    : `v1 filter Last sentinel: done (${changed})`
);
