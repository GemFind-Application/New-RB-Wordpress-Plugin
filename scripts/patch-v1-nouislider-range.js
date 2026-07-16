/**
 * Hard-guard noUiSlider against equal min/max ranges.
 *
 * Shopify / JewelCloud filter payloads often return a single value for a facet
 * (price, carat, cut, etc.). noUiSlider 14 throws:
 *   'range' 'min' and 'max' cannot be equal.
 *
 * This patch is applied to every shipped slider bundle so the error cannot
 * surface in either Version 1 or Version 2 storefronts.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const targets = [
  {
    file: path.join(root, "public/static/js/frontend-v1.js"),
    label: "frontend-v1.js",
  },
  {
    file: path.join(root, "public/static/js/nouislider.min.js"),
    label: "nouislider.min.js",
  },
  {
    file: path.join(root, "public/frontpublic/build/assets/frontend.js"),
    label: "frontpublic/frontend.js",
  },
];

const pkgFiles = [
  path.join(root, "src/rb-version-1-frontend/package.json"),
  path.join(root, "public/frontpublic/package.json"),
];

const FROM =
  'if(n.min===n.max)throw new Error("noUiSlider ("+e+"): \'range\' \'min\' and \'max\' cannot be equal.");';
const TO =
  'if(n.min===n.max){var __gfStep=t.singleStep&&t.singleStep>0?Number(t.singleStep):1;if(!isFinite(__gfStep)||__gfStep<=0)__gfStep=1;n=Object.assign({},n,{max:Number(n.min)+__gfStep});}';

function coerceEqualRange(src) {
  if (src.includes("__gfStep") && !src.includes("cannot be equal")) {
    return { src, changed: false, already: true };
  }

  let next = src;
  if (next.includes(FROM)) {
    next = next.split(FROM).join(TO);
  } else {
    // Generic minified forms: if(e.min===e.max)throw new Error(...cannot be equal...)
    const re =
      /if\((\w+)\.min===\1\.max\)throw new Error\([^;]*cannot be equal[^;]*;/;
    if (!re.test(next)) {
      return { src, changed: false, already: false, missing: true };
    }
    next = next.replace(
      re,
      'if($1.min===$1.max){var __gfStep=(typeof t!=="undefined"&&t&&t.singleStep&&t.singleStep>0)?Number(t.singleStep):1;if(!isFinite(__gfStep)||__gfStep<=0)__gfStep=1;$1=Object.assign({},$1,{max:Number($1.min)+__gfStep});}'
    );
  }

  return { src: next, changed: next !== src, already: false, missing: false };
}

function patchFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.warn(`nouislider range patch: skip missing ${label}`);
    return { ok: true, changed: 0 };
  }

  const original = fs.readFileSync(filePath, "utf8");
  const result = coerceEqualRange(original);

  if (result.already) {
    console.log(`nouislider range patch: ${label} already safe`);
    return { ok: true, changed: 0 };
  }
  if (result.missing) {
    // No throw left — treat as OK only if we never had the phrase.
    if (!original.includes("cannot be equal")) {
      console.log(`nouislider range patch: ${label} has no equal-range throw`);
      return { ok: true, changed: 0 };
    }
    console.error(`nouislider range patch: FAILED to sanitize ${label}`);
    return { ok: false, changed: 0 };
  }

  fs.writeFileSync(filePath, result.src, "utf8");
  if (result.src.includes("cannot be equal")) {
    console.error(`nouislider range patch: ${label} still contains throw after patch`);
    return { ok: false, changed: 1 };
  }
  console.log(`nouislider range patch: updated ${label}`);
  return { ok: true, changed: 1 };
}

function wirePackageJson(pkgPath) {
  if (!fs.existsSync(pkgPath)) {
    return;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const scripts = pkg.scripts || {};
  const fromPkgToScripts = path
    .relative(path.dirname(pkgPath), path.join(root, "scripts/patch-v1-nouislider-range.js"))
    .replace(/\\/g, "/");
  const cmd = `node ${fromPkgToScripts}`;

  let changed = false;
  for (const key of ["build", "build:wp", "postbuild"]) {
    if (typeof scripts[key] !== "string") {
      continue;
    }
    if (!scripts[key].includes("patch-v1-nouislider-range.js")) {
      scripts[key] = `${scripts[key]} && ${cmd}`;
      changed = true;
    }
  }
  if (!Object.values(scripts).some((v) => typeof v === "string" && v.includes("patch-v1-nouislider-range.js"))) {
    if (typeof scripts.build === "string") {
      scripts.build = `${scripts.build} && ${cmd}`;
      changed = true;
    } else {
      scripts["patch:nouislider-range"] = cmd;
      changed = true;
    }
  }

  if (changed) {
    pkg.scripts = scripts;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log(`nouislider range patch: wired ${path.relative(root, pkgPath)}`);
  }
}

let failed = false;
let changedCount = 0;
for (const t of targets) {
  const res = patchFile(t.file, t.label);
  if (!res.ok) {
    failed = true;
  }
  changedCount += res.changed;
}

for (const pkg of pkgFiles) {
  wirePackageJson(pkg);
}

// Final gate: any shipped bundle must not contain the original throw text.
for (const t of targets) {
  if (!fs.existsSync(t.file)) {
    continue;
  }
  const src = fs.readFileSync(t.file, "utf8");
  if (src.includes("cannot be equal")) {
    console.error(`nouislider range patch: VERIFY FAIL — ${t.label} still has "cannot be equal"`);
    failed = true;
  } else {
    console.log(`nouislider range patch: VERIFY OK — ${t.label}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  changedCount === 0
    ? "nouislider range patch: already up to date"
    : `nouislider range patch: done (${changedCount} file(s))`
);
