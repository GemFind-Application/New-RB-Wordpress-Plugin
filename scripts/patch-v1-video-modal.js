/**
 * Keep Bootstrap video preview modal centered while the loader/video is loading.
 */
const fs = require("fs");
const path = require("path");

const bundle = path.join(__dirname, "../public/static/js/frontend-v1.js");

if (!fs.existsSync(bundle)) {
  console.error("Missing v1 bundle:", bundle);
  process.exit(1);
}

let js = fs.readFileSync(bundle, "utf8");
let changed = 0;

const replacements = [
  [
    'ru.Body,{style:{position:"relative"},children:["true"===k?(0,He.jsx)("div",{className:"modal__spinner",style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"500px",position:"absolute",width:"100%",top:0,left:0,zIndex:10},children:',
    'ru.Body,{className:"gf-rb-video-modal-body",style:{position:"relative",minHeight:"500px"},children:["true"===k?(0,He.jsx)("div",{className:"modal__spinner gf-rb-video-modal-spinner",style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"500px",width:"100%"},children:',
  ],
  [
    'style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"500px",width:"100%",children:(0,He.jsx)("img",{className:"preloaderr",alt:"preLoad",src:window.__gemfindRbV1Asset("ring.gif"),style:{width:"200px",height:"200px"}})}):null,j?(0,He.jsx)("iframe",{className:"modal__video-style",onLoad:()=>{C("false")}',
    'style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"500px",width:"100%"},children:(0,He.jsx)("img",{className:"preloaderr",alt:"preLoad",src:window.__gemfindRbV1Asset("ring.gif"),style:{width:"200px",height:"200px"}})}):null,j?(0,He.jsx)("iframe",{className:"modal__video-style",onLoad:()=>{C("false")}',
  ],
  [
    'ru.Body,{children:["true"===V?(0,He.jsx)("div",{className:"modal__spinner"',
    'ru.Body,{className:"gf-rb-video-modal-body",style:{minHeight:"500px"},children:["true"===V?(0,He.jsx)("div",{className:"modal__spinner gf-rb-video-modal-spinner"',
  ],
  [
    'ru.Body,{children:["true"===X?(0,He.jsx)("div",{className:"modal__spinner"',
    'ru.Body,{className:"gf-rb-video-modal-body",style:{minHeight:"500px"},children:["true"===X?(0,He.jsx)("div",{className:"modal__spinner gf-rb-video-modal-spinner"',
  ],
];

for (const [from, to] of replacements) {
  if (!js.includes(from)) {
    continue;
  }
  const count = js.split(from).length - 1;
  js = js.split(from).join(to);
  changed += count;
  console.log(`v1 video modal: patched ${count} occurrence(s)`);
}

if (changed === 0) {
  if (js.includes("gf-rb-video-modal-body")) {
    console.log("v1 video modal patch: already applied");
  } else {
    console.log("v1 video modal patch: pattern not found (bundle layout changed)");
  }
  process.exit(0);
}

fs.writeFileSync(bundle, js, "utf8");
console.log(`Patched video modal alignment in frontend-v1.js (${changed} replacements)`);
