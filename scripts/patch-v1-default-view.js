/**
 * Fix v1 diamond listing grid/list default: the component reads
 * `window.initData.data[0].default_viewmode`, but the backend
 * (GET /shop/configuration) only ever returns the field `default_view`.
 * The key mismatch means the mount-time effect that should apply the
 * admin's "Mounting Listing Default View" setting never fires, so the
 * listing always falls back to its hardcoded "grid" initial state until
 * the visitor manually clicks the list-view toggle.
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
    return;
  }
  const hits = js.split(from).length - 1;
  js = js.split(from).join(to);
  count += hits;
  console.log(`v1 default-view: ${label} (${hits})`);
}

// Mount-time effect that should apply the admin default view, but reads the wrong key.
replaceAll(
  '"grid"===window.initData.data[0].default_viewmode?(S(!0),_(!1),C("active"),E("inactive")):"list"===window.initData.data[0].default_viewmode&&(S(!1),_(!0),C("inactive"),E("active"))',
  '"grid"===window.initData.data[0].default_view?(S(!0),_(!1),C("active"),E("inactive")):"list"===window.initData.data[0].default_view&&(S(!1),_(!0),C("inactive"),E("active"))',
  "diamond listing mount effect reads default_view"
);

// Second component reading the same (wrong) key for its own view-mode state.
replaceAll(
  "null===(o=i.data[0])||void 0===o?void 0:o.default_viewmode",
  "null===(o=i.data[0])||void 0===o?void 0:o.default_view",
  "secondary listing reads default_view"
);

// Config-fetch error fallback: rename the mock key to match, so the fallback
// still resolves correctly if the real config request ever fails.
replaceAll(
  'default_viewmode:"grid"',
  'default_view:"list"',
  "error-fallback mock key renamed"
);
replaceAll(
  "default_viewmode:e.default_viewmode",
  "default_view:e.default_view",
  "error-fallback object copies default_view"
);

if (js.includes("default_viewmode")) {
  console.warn("v1 bundle still contains default_viewmode references — review patch rules");
  process.exitCode = 1;
}

fs.writeFileSync(jsFile, js, "utf8");
console.log(`Patched v1 default view: ${count} replacements`);
