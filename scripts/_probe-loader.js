const fs = require("fs");
const j = fs.readFileSync("public/static/js/frontend-v1.js", "utf8");
const keys = [
  "react-overlay-loader-spinner",
  "OverlayLoader",
  "LoadingOverlay",
  "showLoader",
  "hideLoader",
  "setIsLoading",
  "isLoading",
  "Xe(!0)",
  "Xe(!1)",
];
for (const k of keys) {
  console.log(k, "count", j.split(k).length - 1);
}
let i = j.indexOf("react-overlay-loader-spinner");
while (i !== -1 && i < j.indexOf("react-overlay-loader-spinner") + 1) {
  console.log("CONTEXT", JSON.stringify(j.slice(Math.max(0, i - 200), i + 250)));
  i = j.indexOf("react-overlay-loader-spinner", i + 1);
  break;
}
// find LoadingOverlay usage patterns
const re = /react-overlay-loader-spinner|OverlayLoader|loader-spinner/g;
let m;
let c = 0;
while ((m = re.exec(j)) && c < 8) {
  console.log("---", m[0], JSON.stringify(j.slice(Math.max(0, m.index - 120), m.index + 180)));
  c++;
}
