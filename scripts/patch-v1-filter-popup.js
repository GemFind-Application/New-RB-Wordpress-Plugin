/**
 * Scope v1 filter info popups with BEM classes in the prebuilt bundle.
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
let jsChanged = 0;
let cssChanged = 0;

function replaceAll(haystack, from, to, label) {
  if (!haystack.includes(from)) {
    return haystack;
  }
  const count = haystack.split(from).length - 1;
  console.log(`v1 filter popup patch: ${label} (${count})`);
  return haystack.split(from).join(to);
}

if (!js.includes('modal:"popup_Modal gf-rb-v1-filter-modal"')) {
  js = replaceAll(js, 'modal:"popup_Modal"', 'modal:"popup_Modal gf-rb-v1-filter-modal"', "modal class");
  jsChanged++;
}

if (js.includes('className:"gf-rb-popup_content"')) {
  js = replaceAll(js, 'className:"gf-rb-popup_content"', 'className:"gf-rb-v1-filter-popup"', "popup wrapper");
  jsChanged++;
}

// Only filter info modals (popup_Modal) use popup_content — safe in this bundle.
if (js.includes('className:"popup_content"')) {
  const parts = js.split('modal:"popup_Modal gf-rb-v1-filter-modal"');
  if (parts.length > 1) {
    const head = parts[0];
    const tail = parts
      .slice(1)
      .map((chunk) => chunk.replace(/className:"popup_content"/g, 'className:"gf-rb-v1-filter-popup"'))
      .join('modal:"popup_Modal gf-rb-v1-filter-modal"');
    if (tail !== parts.slice(1).join('modal:"popup_Modal gf-rb-v1-filter-modal"')) {
      js = head + tail;
      console.log("v1 filter popup patch: settings popup_content wrappers");
      jsChanged++;
    }
  }
}

if (js.includes('className:"popup-Diamond-Table"')) {
  js = replaceAll(js, 'className:"popup-Diamond-Table"', 'className:"gf-rb-v1-filter-popup__shape-grid"', "shape grid wrapper");
  jsChanged++;
}

if (js.includes('className:"gf-rb-v1-filter-popup__shape-grid",children:(0,He.jsxs)("ul",{children:')) {
  js = replaceAll(
    js,
    'className:"gf-rb-v1-filter-popup__shape-grid",children:(0,He.jsxs)("ul",{children:',
    'className:"gf-rb-v1-filter-popup__shape-grid",children:(0,He.jsxs)("ul",{className:"gf-rb-v1-filter-popup__shape-list",children:',
    "shape list"
  );
  jsChanged++;
}

const shapeLiFrom = '(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img"';
const shapeLiTo =
  '(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img"';
if (js.includes(shapeLiFrom)) {
  js = replaceAll(js, shapeLiFrom, shapeLiTo, "shape items");
  jsChanged++;
}

js = js.replace(
  /className:"gf-rb-v1-filter-popup__shape-icon",children:\(0,He\.jsx\)\("img",(\{[^]*?\})\)\}\),\(0,He\.jsx\)\("span",\{children:/g,
  'className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",$1)}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:'
);
if (js.includes('className:"gf-rb-v1-filter-popup__shape-label"')) {
  console.log("v1 filter popup patch: shape labels");
  jsChanged++;
}

const shapeIntro =
  'Select the overall outline of the diamond, from timeless rounds to more distinctive shapes like oval, emerald, or pear. Shape defines the diamond\u2019s character and plays a big role in its visual appeal.';
const shapeIntroFrom = `className:"gf-rb-v1-filter-popup",children:[(0,He.jsx)("p",{children:"${shapeIntro}"}),`;
const shapeIntroTo = `className:"gf-rb-v1-filter-popup",children:[(0,He.jsx)("p",{className:"gf-rb-v1-filter-popup__text",children:"${shapeIntro}"}),`;
if (js.includes(shapeIntroFrom)) {
  js = replaceAll(js, shapeIntroFrom, shapeIntroTo, "shape intro text");
  jsChanged++;
}

const oldShapeBlock = `className:"gf-rb-v1-filter-popup",children:[(0,He.jsx)("p",{children:"${shapeIntro}"}),(0,He.jsx)("div",{className:"popup-Diamond-Table",children:(0,He.jsxs)("ul",{children:[(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img",{src:_t,alt:"Round",style:{width:"26px",height:"26px"}})}),(0,He.jsx)("span",{children:"Round"})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img",{src:Ot,alt:"asscher"})}),(0,He.jsx)("span",{children:"asscher"})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img",{src:Dt,alt:"marquise"})}),(0,He.jsx)("span",{children:"marquise"})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img",{src:It,alt:"oval"})}),(0,He.jsx)("span",{children:"oval"})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img",{src:Ft,alt:"cushion"})}),(0,He.jsx)("span",{children:"cushion"})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img",{src:zt,alt:"radiant"})}),(0,He.jsx)("span",{children:"radiant"})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img",{src:Bt,alt:"pear"})}),(0,He.jsx)("span",{children:"pear"})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img",{src:Ht,alt:"emerald"})}),(0,He.jsx)("span",{children:"emerald"})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img",{src:Ut,alt:"heart"})}),(0,He.jsx)("span",{children:"heart"})]}),(0,He.jsxs)("li",{children:[(0,He.jsx)("span",{children:(0,He.jsx)("img",{src:Wt,alt:"princess"})}),(0,He.jsx)("span",{children:"princess"})]})]})})]})`;

const newShapeBlock = `className:"gf-rb-v1-filter-popup",children:[(0,He.jsx)("p",{className:"gf-rb-v1-filter-popup__text",children:"${shapeIntro}"}),(0,He.jsx)("div",{className:"gf-rb-v1-filter-popup__shape-grid",children:(0,He.jsxs)("ul",{className:"gf-rb-v1-filter-popup__shape-list",children:[(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",{src:_t,alt:"Round",style:{width:"26px",height:"26px"}})}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:"Round"})]}),(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",{src:Ot,alt:"asscher"})}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:"asscher"})]}),(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",{src:Dt,alt:"marquise"})}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:"marquise"})]}),(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",{src:It,alt:"oval"})}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:"oval"})]}),(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",{src:Ft,alt:"cushion"})}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:"cushion"})]}),(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",{src:zt,alt:"radiant"})}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:"radiant"})]}),(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",{src:Bt,alt:"pear"})}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:"pear"})]}),(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",{src:Ht,alt:"emerald"})}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:"emerald"})]}),(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",{src:Ut,alt:"heart"})}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:"heart"})]}),(0,He.jsxs)("li",{className:"gf-rb-v1-filter-popup__shape-item",children:[(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-icon",children:(0,He.jsx)("img",{src:Wt,alt:"princess"})}),(0,He.jsx)("span",{className:"gf-rb-v1-filter-popup__shape-label",children:"princess"})]})]})})]})`;

if (js.includes(oldShapeBlock)) {
  js = js.replace(oldShapeBlock, newShapeBlock);
  console.log("v1 filter popup patch: shape grid markup (fallback block)");
  jsChanged++;
} else if (!js.includes("gf-rb-v1-filter-popup__shape-list")) {
  console.warn("v1 filter popup patch: shape grid pattern not found (bundle may already be patched or minified differently)");
}

if (js.includes('className:"gf-rb-v1-filter-popup__shape-icon"')) {
  js = replaceAll(
    js,
    'className:"gf-rb-v1-filter-popup__shape-icon"',
    'className:"gf-rb-v1-filter-popup__shape-icon popup-Dimond-Sketch"',
    "shape icon wrapper"
  );
  jsChanged++;
}

const shapeSrcPatches = [
  ['{src:_t,alt:"Round",style:{width:"26px",height:"26px"}}', '{src:window.__gemfindRbV1ShapeIcon("f_round.svg"),alt:"Round"}'],
  ['{src:Ot,alt:"asscher"}', '{src:window.__gemfindRbV1ShapeIcon("f_asscher.svg"),alt:"Asscher"}'],
  ['{src:Dt,alt:"marquise"}', '{src:window.__gemfindRbV1ShapeIcon("f_marquise.svg"),alt:"Marquise"}'],
  ['{src:Et,alt:"oval"}', '{src:window.__gemfindRbV1ShapeIcon("f_oval.svg"),alt:"Oval"}'],
  ['{src:Tt,alt:"cushion"}', '{src:window.__gemfindRbV1ShapeIcon("f_cushion.svg"),alt:"Cushion"}'],
  ['{src:kt,alt:"radiant"}', '{src:window.__gemfindRbV1ShapeIcon("f_radiant.svg"),alt:"Radiant"}'],
  ['{src:Nt,alt:"pear"}', '{src:window.__gemfindRbV1ShapeIcon("f_pear.svg"),alt:"Pear"}'],
  ['{src:Pt,alt:"emerald"}', '{src:window.__gemfindRbV1ShapeIcon("f_emerald.svg"),alt:"Emerald"}'],
  ['{src:At,alt:"heart"}', '{src:window.__gemfindRbV1ShapeIcon("f_heart.svg"),alt:"Heart"}'],
  ['{src:jt,alt:"princess"}', '{src:window.__gemfindRbV1ShapeIcon("f_princess.svg"),alt:"Princess"}'],
  ['{src:Wt,alt:"princess"}', '{src:window.__gemfindRbV1ShapeIcon("f_princess.svg"),alt:"Princess"}'],
  ['{src:Rt,alt:"princess"}', '{src:window.__gemfindRbV1ShapeIcon("f_princess.svg"),alt:"Princess"}'],
  ['{src:Ct,alt:"princess"}', '{src:window.__gemfindRbV1ShapeIcon("f_princess.svg"),alt:"Princess"}'],
];

for (const [from, to] of shapeSrcPatches) {
  if (js.includes(from)) {
    js = replaceAll(js, from, to, "shape svg src");
    jsChanged++;
  }
}

const labelPatches = [
  ['{className:"gf-rb-v1-filter-popup__shape-label",children:"asscher"}', '{className:"gf-rb-v1-filter-popup__shape-label",children:"Asscher"}'],
  ['{className:"gf-rb-v1-filter-popup__shape-label",children:"marquise"}', '{className:"gf-rb-v1-filter-popup__shape-label",children:"Marquise"}'],
  ['{className:"gf-rb-v1-filter-popup__shape-label",children:"oval"}', '{className:"gf-rb-v1-filter-popup__shape-label",children:"Oval"}'],
  ['{className:"gf-rb-v1-filter-popup__shape-label",children:"cushion"}', '{className:"gf-rb-v1-filter-popup__shape-label",children:"Cushion"}'],
  ['{className:"gf-rb-v1-filter-popup__shape-label",children:"radiant"}', '{className:"gf-rb-v1-filter-popup__shape-label",children:"Radiant"}'],
  ['{className:"gf-rb-v1-filter-popup__shape-label",children:"pear"}', '{className:"gf-rb-v1-filter-popup__shape-label",children:"Pear"}'],
  ['{className:"gf-rb-v1-filter-popup__shape-label",children:"emerald"}', '{className:"gf-rb-v1-filter-popup__shape-label",children:"Emerald"}'],
  ['{className:"gf-rb-v1-filter-popup__shape-label",children:"heart"}', '{className:"gf-rb-v1-filter-popup__shape-label",children:"Heart"}'],
  ['{className:"gf-rb-v1-filter-popup__shape-label",children:"princess"}', '{className:"gf-rb-v1-filter-popup__shape-label",children:"Princess"}'],
];

for (const [from, to] of labelPatches) {
  if (js.includes(from)) {
    js = replaceAll(js, from, to, "shape label text");
    jsChanged++;
  }
}

const scopedCss =
  ".react-responsive-modal-modal.gf-rb-v1-filter-modal{max-width:600px;width:100%;padding:30px;box-sizing:border-box;background-color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.3);position:relative}.react-responsive-modal-modal.gf-rb-v1-filter-modal .react-responsive-modal-closeButton{top:0;right:0;background-color:#836a5d!important;border:none;padding:4px;margin:0;line-height:1}.react-responsive-modal-modal.gf-rb-v1-filter-modal .react-responsive-modal-closeButton svg path{fill:#fff!important}.react-responsive-modal-modal.gf-rb-v1-filter-modal .react-responsive-modal-closeButton:hover{background-color:#6d574c!important}.gf-rb-v1-filter-popup__text{margin-top:20px;margin-bottom:10px;font-size:14px;line-height:1.56;text-align:left;color:#262523;font-family:Lato,sans-serif}.gf-rb-v1-filter-popup__shape-list{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;justify-content:space-around}.gf-rb-v1-filter-popup__shape-item{list-style:none;display:flex;flex-direction:column;align-items:center;flex:1 1 15%;margin:10px;padding:0;text-align:center}.gf-rb-v1-filter-popup__shape-item::before,.gf-rb-v1-filter-popup__shape-item::marker{content:none;display:none}.gf-rb-v1-filter-popup__shape-icon,.popup-Dimond-Sketch{display:block}.gf-rb-v1-filter-popup__shape-icon img,.popup-Dimond-Sketch img{width:auto!important;height:45px!important;object-fit:contain;margin:0;display:block}.gf-rb-v1-filter-popup__shape-label{display:block;text-transform:capitalize;font-size:14px;color:#b9a9a1;margin-top:4px}";

const oldScopedCss =
  ".react-responsive-modal-modal.gf-rb-v1-filter-modal{max-width:600px;width:100%;padding:30px;box-sizing:border-box;background-color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.3);position:relative}.react-responsive-modal-modal.gf-rb-v1-filter-modal .react-responsive-modal-closeButton{top:0;right:0;background-color:var(--button,#836a5d);border:none;padding:4px;margin:0;line-height:1}.react-responsive-modal-modal.gf-rb-v1-filter-modal .react-responsive-modal-closeButton svg path{fill:#fff}.react-responsive-modal-modal.gf-rb-v1-filter-modal .react-responsive-modal-closeButton:hover{background-color:var(--hover,#6d574c)}.gf-rb-v1-filter-popup__text{margin-top:20px;margin-bottom:10px;font-size:14px;line-height:1.56;text-align:left;color:#262523;font-family:Lato,sans-serif}.gf-rb-v1-filter-popup__shape-list{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;justify-content:space-around}.gf-rb-v1-filter-popup__shape-item{list-style:none;display:flex;flex-direction:column;align-items:center;flex:1 1 15%;margin:10px;padding:0;text-align:center}.gf-rb-v1-filter-popup__shape-item::before,.gf-rb-v1-filter-popup__shape-item::marker{content:none;display:none}.gf-rb-v1-filter-popup__shape-icon,.popup-Dimond-Sketch{display:block}.gf-rb-v1-filter-popup__shape-icon img,.popup-Dimond-Sketch img{width:auto;height:45px;object-fit:contain;margin:0;display:block}.gf-rb-v1-filter-popup__shape-label{display:block;text-transform:capitalize;font-size:14px;color:#b9a9a1;margin-top:4px}";

if (css.includes(oldScopedCss)) {
  css = css.replace(oldScopedCss, scopedCss);
  cssChanged++;
  console.log("v1 filter popup patch: updated scoped CSS");
} else if (!css.includes(".popup-Dimond-Sketch img{width:auto;height:45px")) {
  css += scopedCss;
  cssChanged++;
  console.log("v1 filter popup patch: appended scoped CSS");
}

if (jsChanged > 0) {
  fs.writeFileSync(jsFile, js, "utf8");
}
if (cssChanged > 0) {
  fs.writeFileSync(cssFile, css, "utf8");
}

if (jsChanged === 0 && cssChanged === 0) {
  console.log("v1 filter popup patch: already up to date");
}
