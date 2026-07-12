/**
 * Gift Deadline date inputs: default to today and disallow past dates.
 */
const fs = require("fs");
const path = require("path");

const bundle = path.join(__dirname, "../public/static/js/frontend-v1.js");

if (!fs.existsSync(bundle)) {
  console.error("Missing v1 bundle:", bundle);
  process.exit(1);
}

let js = fs.readFileSync(bundle, "utf8");
const todayExpr = '(new Date).toISOString().split("T")[0]';
const minProps = `inputProps:{min:${todayExpr}}`;
let changed = 0;

const replacements = [
  [
    '[Rt,Lt]=(0,t.useState)(""),[Mt,Ft]=(0,t.useState)(""),[zt,Bt]=(0,t.useState)([""])',
    `[Rt,Lt]=(0,t.useState)(""),[Mt,Ft]=(0,t.useState)(${todayExpr}),[zt,Bt]=(0,t.useState)([""])`,
  ],
  [
    '[Ge,Xe]=(0,t.useState)(""),[Qe,Je]=(0,t.useState)(""),[Ze,et]=(0,t.useState)([""]),tt=',
    `[Ge,Xe]=(0,t.useState)(""),[Qe,Je]=(0,t.useState)(${todayExpr}),[Ze,et]=(0,t.useState)([""]),tt=`,
  ],
  [
    '[Ge,Xe]=(0,t.useState)(""),[Qe,Je]=(0,t.useState)(""),[Ze,et]=(0,t.useState)([""]),[tt,nt]=(0,t.useState)("")',
    "[Ge,Xe]=(0,t.useState)(\"\"),[Qe,Je]=(0,t.useState)(F),[Ze,et]=(0,t.useState)([\"\"]),[tt,nt]=(0,t.useState)(\"\")",
  ],
  [
    '(0,He.jsx)(Uv,{label:"Gift Deadline",id:"date",type:"date",focused:!0,inputformat:"MM/dd/yyyy",variant:"outlined",InputLabelProps:{shrink:!0},value:Mt,onChange:e=>{Ft(e.target.value)}})',
    `(0,He.jsx)(Uv,{label:"Gift Deadline",id:"date",type:"date",focused:!0,inputformat:"MM/dd/yyyy",variant:"outlined",InputLabelProps:{shrink:!0},value:Mt,onChange:e=>{Ft(e.target.value)},${minProps}})`,
  ],
  [
    '(0,He.jsx)(Uv,{label:"Gift Deadline",focused:!0,id:"date",type:"date",inputformat:"MM/dd/yyyy",variant:"outlined",InputLabelProps:{shrink:!0},value:Qe,onChange:e=>{Je(e.target.value)}})',
    `(0,He.jsx)(Uv,{label:"Gift Deadline",focused:!0,id:"date",type:"date",inputformat:"MM/dd/yyyy",variant:"outlined",InputLabelProps:{shrink:!0},value:Qe,onChange:e=>{Je(e.target.value)},${minProps}})`,
  ],
];

for (const [from, to] of replacements) {
  if (!js.includes(from)) {
    continue;
  }
  const count = js.split(from).length - 1;
  js = js.split(from).join(to);
  changed += count;
  console.log(`v1 gift deadline: patched ${count} occurrence(s)`);
}

if (changed === 0) {
  const hasDefaults =
    js.includes(`[Mt,Ft]=(0,t.useState)(${todayExpr})`) ||
    js.includes("[Qe,Je]=(0,t.useState)(F)") ||
    js.includes(`[Qe,Je]=(0,t.useState)(${todayExpr})`);
  const hasMin = js.includes(minProps) || js.includes("inputProps:{min:F}");

  if (hasDefaults && hasMin) {
    console.log("v1 gift deadline patch: already applied");
  } else {
    console.log("v1 gift deadline patch: pattern not found (bundle layout changed)");
  }
  process.exit(0);
}

fs.writeFileSync(bundle, js, "utf8");
console.log(`Patched gift deadline defaults/min date in frontend-v1.js (${changed} replacements)`);
