/**
 * Remove duplicate ToastContainer from v1 SettingDetails skeleton branch.
 * The skeleton and loaded branches each mount a container; the skeleton
 * portal can linger and cause duplicate success toasts.
 */
const fs = require("fs");
const path = require("path");

const bundle = path.join(__dirname, "../public/static/js/frontend-v1.js");

if (!fs.existsSync(bundle)) {
  console.error("Missing v1 bundle:", bundle);
  process.exit(1);
}

const text = fs.readFileSync(bundle, "utf8");

// SettingDetails skeleton branch ToastContainer (keep the loaded-state one).
const skeletonToast =
  '(0,He.jsx)(Tx,{position:"bottom-center",autoClose:1e3,hideProgressBar:!1,newestOnTop:!1,closeOnClick:!0,rtl:!1,pauseOnFocusLoss:!0,draggable:!0,pauseOnHover:!0}),';

const skeletonMarker = `${skeletonToast}(0,He.jsxs)("div",{className:"tool-container"`;

if (!text.includes(skeletonMarker)) {
  if (!text.includes(skeletonToast)) {
    console.log("v1 toast patch: skeleton ToastContainer already removed");
    process.exit(0);
  }
  console.warn("v1 toast patch: skeleton marker not found; bundle layout may have changed");
  process.exit(0);
}

const patched = text.replace(skeletonMarker, `(0,He.jsxs)("div",{className:"tool-container"`);
fs.writeFileSync(bundle, patched, "utf8");
console.log("v1 toast patch: removed skeleton ToastContainer from frontend-v1.js");
