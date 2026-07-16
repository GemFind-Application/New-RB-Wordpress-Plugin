const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(
  path.join(__dirname, "../public/static/js/frontend-v1.js"),
  "utf8"
);

const markers = [
  "polishRange.length+1",
  "fluorescenceRange.length+1",
  "symmetryRange.length+1",
  "cutRange.length+1",
  "colorRange[D[1][0].colorRange.length-1].colorId)+1",
];
for (const m of markers) {
  console.log(m, s.includes(m), s.split(m).length - 1);
}

const i = s.indexOf("polishRange.length+1");
console.log("\npolish context:\n", s.slice(i - 120, i + 500));

// Start value init in symmetry component L_
const j = s.indexOf(",L_=e=>{const[n,r]=(0,t.useState)(!1)");
console.log("\nsymmetry component start logic:");
console.log(s.slice(j, j + 1400));
