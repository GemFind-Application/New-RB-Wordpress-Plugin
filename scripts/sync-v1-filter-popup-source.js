/**
 * Add scoped BEM classes to v1 filter info popup source components.
 */
const fs = require("fs");
const path = require("path");

const srcRoot = path.join(
  __dirname,
  "../../../../Ring-builder-CI-to-Laravel-main/Ring-builder-CI-to-Laravel-main/frontend-version-1/src/components"
);

const filterFiles = [
  "settings/settings-element/ReangeSlider.js",
  "settings/settings-element/PriceSlider.js",
  "settings/settings-element/Navigation.js",
  "settings/settings-element/Metal.js",
  "diamondtoolsettings/settings-element/TableSlider.js",
  "diamondtoolsettings/settings-element/SymmetrySlider.js",
  "diamondtoolsettings/settings-element/PriceSlider.js",
  "diamondtoolsettings/settings-element/PolishSlider.js",
  "diamondtoolsettings/settings-element/FluorescenceSlider.js",
  "diamondtoolsettings/settings-element/FancyPriceSlider.js",
  "diamondtoolsettings/settings-element/FancyIntensity.js",
  "diamondtoolsettings/settings-element/FancyColorSlider.js",
  "diamondtoolsettings/settings-element/DepthSlider.js",
  "diamondtoolsettings/settings-element/CutSlider.js",
  "diamondtoolsettings/settings-element/ColorSlider.js",
  "diamondtoolsettings/settings-element/ClaritySlider.js",
  "diamondtoolsettings/settings-element/CaratSlider.js",
  "diamondtoolsettings/settings-element/Filter.js",
];

let changed = 0;

for (const rel of filterFiles) {
  const file = path.join(srcRoot, rel);
  if (!fs.existsSync(file)) {
    console.warn("skip missing", rel);
    continue;
  }

  let text = fs.readFileSync(file, "utf8");
  const original = text;

  text = text.replace(/modal:\s*"popup_Modal"(?! gf-rb-v1-filter-modal)/g, 'modal: "popup_Modal gf-rb-v1-filter-modal"');
  text = text.replace(/className="gf-rb-popup_content"/g, 'className="gf-rb-v1-filter-popup"');
  text = text.replace(
    /(modal:\s*"popup_Modal gf-rb-v1-filter-modal"[\s\S]*?)className="popup_content"/g,
    '$1className="gf-rb-v1-filter-popup"'
  );

  // Add text class to first <p> directly inside gf-rb-v1-filter-popup.
  text = text.replace(
    /(<div className="gf-rb-v1-filter-popup">\s*)<p>/g,
    '$1<p className="gf-rb-v1-filter-popup__text">'
  );

  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    changed++;
    console.log("updated", rel);
  }
}

console.log(`v1 filter popup source sync: ${changed} file(s)`);
