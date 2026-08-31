/**
 * Stop classic v1 from loading the Facebook JS SDK (connect.facebook.net).
 * Like buttons become the same click-out facebook.com/plugins/like.php links used by v2.
 */
const fs = require("fs");
const path = require("path");

const jsFile = path.join(__dirname, "../public/static/js/frontend-v1.js");

if (!fs.existsSync(jsFile)) {
  console.error("Missing v1 bundle:", jsFile);
  process.exit(1);
}

let js = fs.readFileSync(jsFile, "utf8");
let count = 0;

function replaceAll(from, to, label) {
  if (!js.includes(from)) {
    return false;
  }
  const hits = js.split(from).length - 1;
  js = js.split(from).join(to);
  count += hits;
  console.log(`v1 facebook: ${label} (${hits})`);
  return true;
}

const likeFrom =
  'x&&(0,He.jsx)("li",{children:(0,He.jsx)(qx.SI,{appId:"2069310279975989",children:(0,He.jsx)(qx.OV,{language:"en_US",href:window.location.href,colorScheme:"dark",layout:"button_count"})})})';
const likeTo =
  'x&&(0,He.jsx)("li",{children:(0,He.jsxs)("a",{target:"_blank",rel:"noopener noreferrer",href:"https://www.facebook.com/plugins/like.php?href=".concat(encodeURIComponent(window.location.href)),className:"blue",children:[(0,He.jsx)("i",{className:"fab fa-thumbs-up"}),(0,He.jsx)("span",{children:"Like"})]})})';

if (js.includes(likeTo)) {
  console.log("v1 facebook: Like widgets already use click-out links");
} else if (!replaceAll(likeFrom, likeTo, "replace SDK Like widgets with facebook.com links")) {
  console.warn("v1 facebook: Like widget pattern not found — review bundle");
  process.exitCode = 1;
}

if (js.includes('domain:"connect.facebook.net"')) {
  replaceAll(
    'domain:"connect.facebook.net"',
    'domain:""',
    "neutralize unused react-facebook SDK host"
  );
} else {
  console.log("v1 facebook: connect.facebook.net already removed from defaults");
}

fs.writeFileSync(jsFile, js, "utf8");
console.log(`Patched v1 Facebook SDK: ${count} replacements`);
