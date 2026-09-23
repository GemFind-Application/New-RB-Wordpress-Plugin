/**
 * Remove the remote Luma-Icons webfont from frontend-v1.css.
 *
 * The classic bundle's stylesheet declared @font-face for "Luma-Icons" with every
 * src pointing at db.onlinewebfonts.com (a third-party font mirror). WordPress.org
 * rejects plugins that load assets from remote hosts, and Luma-Icons is Magento's
 * OSL-licensed icon font, so it cannot simply be vendored into a GPL plugin either.
 *
 * Only four glyphs were ever used. Each is swapped for the equivalent glyph from
 * Font Awesome 5 Free, which is already bundled at assets/vendor/fontawesome/ and
 * enqueued as a dependency of frontend-v1.css by GEMFINDRB_Shortcode.
 */
const fs = require("fs");
const path = require("path");

const cssFile = path.join(__dirname, "../public/static/css/frontend-v1.css");

if (!fs.existsSync(cssFile)) {
  console.error("Missing v1 CSS:", cssFile);
  process.exit(1);
}

let css = fs.readFileSync(cssFile, "utf8");
const original = css;

/** Luma-Icons private-use codepoint -> Font Awesome 5 Free (solid) codepoint. */
const GLYPHS = {
  "": "\\f063", // arrow-down  -> fa-arrow-down  (.save-icon)
  "": "\\f3e5", // reply arrow -> fa-reply       (.reset-icon)
  "": "\\f002", // magnifier   -> fa-search      (.search-btn)
  "": "\\f0c9", // three bars  -> fa-bars        (.listview)
};

const FA_FAMILY = '"Font Awesome 5 Free"';

// 1. Drop the remote @font-face declaration entirely.
const fontFaceRe = /@font-face\{font-family:Luma-Icons;[^}]*\}/g;
const fontFaces = (css.match(fontFaceRe) || []).length;
css = css.replace(fontFaceRe, "");

// 2. Rewrite every rule that renders a Luma glyph so it uses Font Awesome instead.
let rules = 0;
css = css.replace(/\{([^{}]*font-family:luma-icons[^{}]*)\}/gi, (block, decls) => {
  const glyphMatch = decls.match(/content:"([-])"/);
  if (!glyphMatch || !GLYPHS[glyphMatch[1]]) {
    console.error(
      `v1 luma icons: unmapped Luma glyph in rule ${JSON.stringify(decls)} — add it to GLYPHS`
    );
    process.exit(1);
  }
  let next = decls
    .replace(/content:"[-]"/, `content:"${GLYPHS[glyphMatch[1]]}"`)
    .replace(/font-family:luma-icons/i, `font-family:${FA_FAMILY}`);
  // FA5 Free solid glyphs only exist at weight 900.
  next = /font-weight:/.test(next)
    ? next.replace(/font-weight:[^;}]+/, "font-weight:900")
    : next.replace(`font-family:${FA_FAMILY}`, `font-family:${FA_FAMILY};font-weight:900`);
  rules++;
  return `{${next}}`;
});

if (/onlinewebfonts\.com|luma-icons/i.test(css)) {
  console.error("v1 luma icons: frontend-v1.css still references Luma-Icons / onlinewebfonts.com");
  process.exit(1);
}

if (css === original) {
  console.log("v1 luma icons: already up to date");
  process.exit(0);
}

fs.writeFileSync(cssFile, css, "utf8");
console.log(`v1 luma icons: removed ${fontFaces} @font-face, rewrote ${rules} rule(s) to Font Awesome`);
