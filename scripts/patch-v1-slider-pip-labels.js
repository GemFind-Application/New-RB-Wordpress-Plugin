/**
 * Harden V1 noUiSlider pip formatters used on Diamond filters.
 *
 * When filter data has a single option (or equal min/max was coerced to min+step),
 * pip `format.to` looks up cut/color/clarity/etc by id and does `n[0].xxxName`.
 * If the id is missing, that throws and crashes the page — same class of issue
 * as equal min/max from the Shopify app.
 *
 * Replace unsafe `return n[0].prop` with a safe fallback.
 */
const fs = require("fs");
const path = require("path");

const jsFile = path.join(__dirname, "../public/static/js/frontend-v1.js");
const pkgFile = path.join(__dirname, "../src/rb-version-1-frontend/package.json");

if (!fs.existsSync(jsFile)) {
  console.error("Missing v1 bundle");
  process.exit(1);
}

let js = fs.readFileSync(jsFile, "utf8");
let changed = 0;

const pairs = [
  ["cutId", "cutName"],
  ["colorId", "colorName"],
  ["intensityId", "intensityName"],
  ["clarityId", "clarityName"],
  ["polishId", "polishName"],
  ["fluorescenceId", "fluorescenceName"],
  ["symmetryId", "symmteryName"], // intentional API typo in JewelCloud payload
];

for (const [idKey, nameKey] of pairs) {
  const from = `filter(function(e){return e.${idKey}==t});return n[0].${nameKey}}`;
  const to = `filter(function(e){return e.${idKey}==t});return n[0]&&n[0].${nameKey}||""}`;
  const fromSafe = to; // idempotent marker

  if (js.includes(fromSafe) && !js.includes(from)) {
    console.log(`v1 slider pip patch: ${nameKey} already safe`);
    continue;
  }
  if (!js.includes(from)) {
    // Alternate: already partially patched with optional different spacing
    const loose = new RegExp(
      `filter\\(function\\(e\\)\\{return e\\.${idKey}==t\\}\\);return n\\[0\\]\\.${nameKey}\\}`
    );
    if (loose.test(js)) {
      js = js.replace(
        new RegExp(
          `filter\\(function\\(e\\)\\{return e\\.${idKey}==t\\}\\);return n\\[0\\]\\.${nameKey}\\}`,
          "g"
        ),
        `filter(function(e){return e.${idKey}==t});return n[0]&&n[0].${nameKey}||""}`
      );
      console.log(`v1 slider pip patch: ${nameKey} (regex)`);
      changed++;
      continue;
    }
    console.warn(`v1 slider pip patch: pattern not found for ${nameKey}`);
    continue;
  }
  const count = js.split(from).length - 1;
  js = js.split(from).join(to);
  console.log(`v1 slider pip patch: ${nameKey} (${count})`);
  changed++;
}

if (changed > 0) {
  fs.writeFileSync(jsFile, js, "utf8");
}

if (fs.existsSync(pkgFile)) {
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  const scripts = pkg.scripts || {};
  if (typeof scripts.build === "string" && !scripts.build.includes("patch-v1-slider-pip-labels.js")) {
    scripts.build += " && node ../../scripts/patch-v1-slider-pip-labels.js";
    pkg.scripts = scripts;
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log("v1 slider pip patch: wired into package.json build");
  }
}

// Verify none of the unsafe forms remain.
const unsafe = pairs.filter(([, nameKey]) => {
  const bad = `return n[0].${nameKey}}`;
  const good = `return n[0]&&n[0].${nameKey}||""}`;
  return js.includes(bad) && !js.includes(good);
});
if (unsafe.length) {
  console.error(
    "v1 slider pip patch: VERIFY FAIL — still unsafe:",
    unsafe.map((p) => p[1]).join(", ")
  );
  process.exit(1);
}

console.log(
  changed === 0
    ? "v1 slider pip patch: already up to date"
    : `v1 slider pip patch: done (${changed})`
);
