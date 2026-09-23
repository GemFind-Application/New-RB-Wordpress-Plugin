/**
 * Must be the first import in index.js.
 *
 * The bundle is served from the plugin (…/wp-content/plugins/gemfind-ring-builder/public/static/js/),
 * not the site root, so webpack-emitted assets (images under static/media/) need a runtime public path.
 * CSS url()s are already relative (PUBLIC_URL=. in .env) and need nothing.
 */
/* eslint-disable no-undef, camelcase */
const fromConfig = (window.gemfindRBConfig || {}).v1AssetUrl;
const script = document.currentScript && document.currentScript.src;
const fromScript = script ? script.replace(/js\/[^/]*$/, '') : '';

const base = fromConfig || fromScript;
if (base) {
    __webpack_public_path__ = base.replace(/\/?$/, '/');
}
