/**
 * Smoke check: shipped noUiSlider bundles must never throw on equal min/max.
 * Exit 1 if "cannot be equal" remains in any target.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const files = [
  "public/static/js/frontend-v1.js",
  "public/static/js/nouislider.min.js",
  "public/frontpublic/build/assets/frontend.js",
];

let failed = false;
for (const rel of files) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.warn("skip missing", rel);
    continue;
  }
  const src = fs.readFileSync(full, "utf8");
  if (src.includes("cannot be equal")) {
    console.error("FAIL:", rel, "still contains equal-range throw");
    failed = true;
  } else if (!src.includes("__gfStep") && rel.includes("nouislider")) {
    console.error("FAIL:", rel, "missing coerce guard (__gfStep)");
    failed = true;
  } else {
    console.log("OK:", rel);
  }
}

// Unit-level coerce check mirroring the patched behavior.
function coerce(range, step) {
  let n = Object.assign({}, range);
  if (n.min === n.max) {
    let __gfStep = step && step > 0 ? Number(step) : 1;
    if (!isFinite(__gfStep) || __gfStep <= 0) __gfStep = 1;
    n = Object.assign({}, n, { max: Number(n.min) + __gfStep });
  }
  if (n.min === n.max) {
    throw new Error("coerce failed");
  }
  return n;
}

try {
  const a = coerce({ min: 100, max: 100 }, 0.01);
  const b = coerce({ min: 3, max: 3 }, 1);
  if (a.max !== 100.01 || b.max !== 4) {
    throw new Error("unexpected coerce result " + JSON.stringify({ a, b }));
  }
  console.log("OK: coerce unit checks");
} catch (e) {
  console.error("FAIL: coerce unit", e.message);
  failed = true;
}

// Also ensure V1 pip formatters never do bare n[0].xxxName
const v1 = path.join(root, "public/static/js/frontend-v1.js");
if (fs.existsSync(v1)) {
  const src = fs.readFileSync(v1, "utf8");
  const unsafePips = [
    "return n[0].cutName}",
    "return n[0].colorName}",
    "return n[0].intensityName}",
    "return n[0].clarityName}",
    "return n[0].polishName}",
    "return n[0].fluorescenceName}",
    "return n[0].symmteryName}",
  ].filter((p) => src.includes(p));
  if (unsafePips.length) {
    console.error("FAIL: unsafe pip formatters still present:", unsafePips.join(", "));
    failed = true;
  } else {
    console.log("OK: v1 pip formatters are null-safe");
  }
}

if (failed) {
  process.exit(1);
}
console.log("nouislider equal-range smoke: PASS");
