const prefixSelector = require("postcss-prefix-selector");

/**
 * Safety-net scoper at build time. Source CSS should already include
 * #GemFind.gemfind-ring-builder-scope on selectors (run npm run scope:css).
 */
const SCOPE = "#GemFind.gemfind-ring-builder-scope";
const SKIP_PREFIX =
  /^(#GemFind|#portals|\.gemfind-ring-builder-scope|@|:root$|html$|body$|from |to |\d+%$)/;
const THIRD_PARTY =
  /(image-gallery|noUi-|Mui|react-datepicker|slick-|rc-slider)/;

module.exports = {
  plugins: [
    prefixSelector({
      prefix: SCOPE,
      transform(prefix, selector, prefixed) {
        if (selector.includes("#portals")) {
          return selector;
        }
        if (selector.includes(SCOPE) || selector.includes("gemfind-ring-builder-scope")) {
          return selector;
        }
        if (selector === ":root" || selector === "body") {
          return SCOPE;
        }
        if (selector.startsWith("body ")) {
          return `${SCOPE} ${selector.slice(5)}`;
        }
        if (selector.startsWith("body.")) {
          return `${SCOPE}${selector.slice(4)}`;
        }
        if (SKIP_PREFIX.test(selector.trim())) {
          return selector;
        }
        if (THIRD_PARTY.test(selector)) {
          return `${SCOPE} ${selector}`;
        }
        return prefixed;
      },
    }),
  ],
};
