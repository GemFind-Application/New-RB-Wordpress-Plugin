=== GemFind Ring Builder ===
Contributors: gemfind
Requires at least: 6.3
Tested up to: 6.7
Requires PHP: 8.1
Stable tag: 1.0.0
License: GPLv2 or later

Full-featured Ring Builder for WordPress with React storefront (v1 or v2), REST API backend, admin settings, JewelCloud integration, and WooCommerce cart.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/gemfind-ring-builder/`
2. Activate through the Plugins menu
3. Configure Dealer ID under GemFind Ring Builder → Settings
4. Visit `/ringbuilder/settings/` on your site

== Source code and build layout (same pattern as GemFind Diamond Link) ==

| App | Source (dev) | Production bundle |
|-----|----------------|-------------------|
| Storefront v2 | `public/frontpublic/` | `public/frontpublic/build/assets/frontend.js` + `frontend.css` |
| Storefront v1 | `src/rb-version-1-frontend/` | `public/static/js/frontend-v1.js` + `public/static/css/frontend-v1.css` |
| WP Admin | `src/admin-frontend/` | `assets/build/admin.js` + `admin.css` |

== Build ==

From the plugin root:

1. `composer install --no-dev`
2. `npm install` and `npm run install:all`
3. `npm run build` (admin, then v2, then v1)

Individual targets: `npm run build:admin`, `npm run build:v2`, `npm run build:v1`

CSS scope helper (v2 source): `npm run scope:css`

== URLs ==

* `/ringbuilder/settings/` — ring settings browse
* `/ringbuilder/diamondlink/` — diamond search
* Legacy Shopify `/apps/ringbuilder/*` redirects to `/ringbuilder/*`
