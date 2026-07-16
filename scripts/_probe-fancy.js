const fs = require("fs");
const j = fs.readFileSync("public/static/js/frontend-v1.js", "utf8");
const keys = [
  "fancycolored",
  "FancyColor",
  "nav/fancy",
  "navfancy",
  "diamondtools/nav",
  "LabGrown",
  "natural",
];
for (const k of keys) {
  let i = 0;
  let c = 0;
  console.log("===", k, "count", j.split(k).length - 1);
  while ((i = j.indexOf(k, i)) !== -1 && c < 4) {
    console.log(JSON.stringify(j.slice(Math.max(0, i - 80), i + k.length + 80)));
    i += k.length;
    c++;
  }
}
