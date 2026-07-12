/**
 * Gift Deadline date inputs must not allow past dates.
 * Complete Ring already had min; Diamond/Settings Drop Hint fields did not.
 */
const fs = require("fs");
const path = require("path");

const bundle = path.join(__dirname, "../public/static/js/frontend-v1.js");

if (!fs.existsSync(bundle)) {
  console.error("Missing v1 bundle:", bundle);
  process.exit(1);
}

let js = fs.readFileSync(bundle, "utf8");
const minProps = 'inputProps:{min:(new Date).toISOString().split("T")[0]}';
let changed = 0;

const replacements = [
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
  console.log(`v1 gift deadline: patched ${count} field(s)`);
}

if (changed === 0) {
  if (js.includes(minProps) || js.includes('label:"Gift Deadline"') && js.includes("inputProps:{min:")) {
    console.log("v1 gift deadline patch: already applied or alternate layout");
  } else {
    console.log("v1 gift deadline patch: pattern not found (bundle layout changed)");
  }
  process.exit(0);
}

fs.writeFileSync(bundle, js, "utf8");
console.log(`Patched gift deadline min date in frontend-v1.js (${changed} replacements)`);
