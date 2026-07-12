/**
 * V1 advanced filters:
 * 1) Relax show_Advance_options gate in JS bundle
 * 2) Fix inverted Advance Search open/close handlers (minus click kept panel open)
 * 3) Remove broken CSS overrides that fought the original toggle styles
 */
const fs = require("fs");
const path = require("path");

const bundle = path.join(__dirname, "../public/static/js/frontend-v1.js");
const cssBundle = path.join(__dirname, "../public/static/css/frontend-v1.css");

if (!fs.existsSync(bundle)) {
  console.error("Missing v1 bundle:", bundle);
  process.exit(1);
}

let js = fs.readFileSync(bundle, "utf8");
let changed = false;

const gateFrom =
  '"1"===window.initData.data[0].show_Advance_options_as_Default_in_Diamond_Search&&';
const gateTo =
  '(!window.initData||!window.initData.data||!window.initData.data[0]||"0"!==String(window.initData.data[0].show_Advance_options_as_Default_in_Diamond_Search||""))&&';

if (js.includes(gateFrom)) {
  js = js.split(gateFrom).join(gateTo);
  changed = true;
  console.log("Patched advanced filters gate in frontend-v1.js");
} else if (js.includes(gateTo)) {
  console.log("v1 advanced filters gate: already applied");
}

const toggleBroken =
  '[En,Dn]=(0,t.useState)("grid"===Nn),[An,Pn]=(0,t.useState)("list"===Nn),Tn=e=>{e.preventDefault(),Dn(!0),Pn(!1)},On=e=>{e.preventDefault(),Pn(!0),Dn(!1)}';
const toggleFixed =
  '[En,Dn]=(0,t.useState)(!0),[An,Pn]=(0,t.useState)(!1),Tn=e=>{e.preventDefault(),Dn(!1),Pn(!0)},On=e=>{e.preventDefault(),Pn(!1),Dn(!0)}';

if (js.includes(toggleBroken)) {
  js = js.split(toggleBroken).join(toggleFixed);
  changed = true;
  console.log("Patched Advance Search toggle handlers in frontend-v1.js");
} else if (js.includes(toggleFixed)) {
  console.log("v1 Advance Search toggle: already applied");
} else {
  console.log("v1 Advance Search toggle: pattern not found (bundle layout changed)");
}

if (changed) {
  fs.writeFileSync(bundle, js, "utf8");
}

if (fs.existsSync(cssBundle)) {
  let css = fs.readFileSync(cssBundle, "utf8");
  const marker =
    "/* GemFind RB v1: show collapsed Advanced Search heading after bundle config patch. */";
  const beforeLen = css.length;
  while (css.includes(marker)) {
    const start = css.indexOf(marker);
    let end = css.indexOf("\n\n", start);
    if (end === -1) {
      end = css.length;
    } else {
      end += 2;
    }
    css = css.slice(0, start) + css.slice(end);
  }
  if (css.length !== beforeLen) {
    fs.writeFileSync(cssBundle, css, "utf8");
    console.log("Removed broken Advance Search CSS overrides from frontend-v1.css");
  } else {
    console.log("v1 advanced filters CSS cleanup: nothing to remove");
  }
}

if (!changed && !fs.existsSync(cssBundle)) {
  console.log("v1 advanced filters patch: no changes");
}
