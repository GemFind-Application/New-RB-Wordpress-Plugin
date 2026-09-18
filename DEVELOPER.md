# GemFind Ring Builder — Developer Guide

This plugin ships **three separate frontend bundles** (a legacy "v1" storefront, a modern "v2" storefront, and a wp-admin settings UI) plus a PHP/WordPress backend that exposes a REST API and proxies to GemFind's JewelCloud service. This doc explains how the pieces fit together and how to set up a local dev environment.

## 1. Directory map

| Path | What it is |
|---|---|
| `gemfind-ring-builder.php` | Main plugin bootstrap — defines constants, requires all PHP files, registers activation/deactivation hooks and the main `plugins_loaded`/`init` wiring. |
| `includes/` | Core PHP: REST API controller, shortcode + asset enqueuing, routing, migrations, and `includes/services/` (settings, JewelCloud client, email, PDF print, WooCommerce cart, CSS). |
| `admin/` | wp-admin PHP: menu registration, page scaffolding (mount points for the React admin bundle), asset enqueue. |
| `templates/` | The full-width WP page template that hosts the storefront SPA. |
| `public/frontpublic/build/` | **v2 build output only** — served by WordPress; not source. |
| `public/static/` | **v1 prebuilt bundle** (`frontend-v1.js`/`.css`, `nouislider.min.js`) — see §3, this is not built from source in this repo. |
| `src/admin-frontend/` | **Admin UI source** (React 18 + Vite), builds to `assets/build/admin.js`. |
| `src/rb-version-1-frontend/` | A shell — only a `package.json` with a no-op build guard. No real v1 source lives here (see §3). |
| `src/rb-version-2-frontend/` | **v2 source** (React 18 + Vite), builds to `public/frontpublic/build/assets/frontend.js`/`frontend.css`. |
| `assets/` | Compiled admin bundle output (`assets/build/`), static CSS overrides, images, bundled Font Awesome (used by v1, not loaded from CDN). |
| `scripts/` | Node build orchestration (`build-all.cjs`, `package-plugin.cjs`, `download-local-images.js`) and ~20 `patch-v1-*.js` scripts that string-patch the prebuilt v1 bundle. |
| `vendor/` | Composer deps — only `dompdf/dompdf` and its transitive deps, used for PDF export (print diamond/ring/certificate). Ignore the stray `vendor/vendor/...` nested duplicate tree; it's a packaging artifact the release script already excludes. |
| `composer.json` / `composer.lock` | PHP deps (`dompdf/dompdf ^3.1.6`, PHP >=8.1). |
| `readme.txt` | WordPress.org-style readme; also documents external services and shortcode usage. |

## 2. How it all runs together (request flow)

1. A WP page contains `[gemfindRB_ring_builder]` (or uses the "GemFind Ring Builder (full width)" page template created on activation at `/ringbuilder/`).
2. `GEMFINDRB_Shortcode` decides whether to enqueue v1 or v2 (per-shortcode `version` attribute, or the site-wide "Frontend experience" admin setting — v2 is the default) and localizes `window.gemfindRBConfig` (REST base URL, nonce, JewelCloud proxy URLs, image base URL, etc.) into the page.
3. The enqueued bundle (v1 or v2) boots as a client-side SPA and calls the plugin's own REST API at `gemfind-ring-builder/v1` (namespace registered by `GEMFINDRB_API::register_routes()` in `includes/class-gemfindrb-api.php`).
4. Most of those REST routes either read/write plugin settings (DB tables via `GEMFINDRB_DB`/`GEMFINDRB_Settings`) or proxy to GemFind's **JewelCloud API** (`https://api.jewelcloud.com/api/RingBuilder/`) via `GEMFINDRB_Jewelcloud`, so the browser never talks to JewelCloud directly (avoids CORS, keeps the dealer/account ID server-side).
5. Cart actions (`/addToCart`, `/cartadd/...`) go through `GEMFINDRB_Woo_Cart`, which requires WooCommerce to be active.
6. Contact-form actions (drop hint / request info / email a friend / schedule viewing) go through `GEMFINDRB_Email`, rendered from PHP templates in `includes/templates/` and sent via `GEMFINDRB_Mail` (which can use a per-shop custom SMTP config from `GEMFINDRB_Smtp`).
7. "Print"/PDF routes stream a PDF built with Dompdf (`GEMFINDRB_Print`).

The wp-admin side is separate: `admin/class-gemfindrb-admin.php` registers Settings / CSS Configurator / About pages, each rendering an empty mount div; the actual UI is the `src/admin-frontend` React bundle, which calls the same REST namespace (with admin auth) to read/write shop settings and CSS theme config.

## 3. Where the code for each version lives

### v1 — legacy/classic storefront (`public/static/js/frontend-v1.js`)

**There is no v1 React source in this repo.** `src/rb-version-1-frontend/` only contains a `package.json` whose `build` script is a guard that checks the prebuilt bundle exists, then chains ~19 `scripts/patch-v1-*.js` scripts that do **string replacement against the already-minified bundle** (e.g. rewriting `TN=e=>...`-style minified code). There is no JSX/CRA source to edit and no hot-reload dev server for v1.

What "building v1" actually does — categories of patches applied to the checked-in bundle:
- **WordPress path rewriting** (Shopify `/apps/ringbuilder` → WP `/ringbuilder`).
- **UI bug fixes patched into minified code** (toast dedup, sort direction, default grid/list view, compare-image fallback, gift deadline defaults, video modal centering, vendor-info overlay, advanced filter toggle, filter popup scoping).
- **noUiSlider safety** (guards against `min === max` throwing, unsafe pip-label lookups, sentinel id math) — reverified after every build via `scripts/smoke-nouislider-range.js`.
- **Asset/URL localization** (replacing external `ringbuilderdev.gemfind.us` image URLs with local plugin assets).
- **API/cart correctness** (sending `list_type`/`diamond_type` so the API resolves stone type; adding a WP REST nonce to PDF download links; relaxing filters when a setting+cookie combo returns zero results).
- **Privacy** (removing the Facebook JS SDK, replaced with plain click-out links).

On top of the build-time patches, `GEMFINDRB_Shortcode::do_enqueue()` also injects several **runtime** JS patches via `wp_add_inline_script` (sort-order fix, toast dedup, a "loader watchdog", the same noUiSlider safe-range guard, fetch/XHR nonce injection, mount-point fixups) — this is a second, independent patch mechanism that runs on every page load regardless of which build of the bundle is deployed. If you need to change v1 behavior, you generally have two options:
1. Add/extend a `scripts/patch-v1-*.js` script (locate the target substring in the minified bundle, patch it, re-run `npm run build:v1`), or
2. Add/extend an inline runtime patch in `GEMFINDRB_Shortcode::do_enqueue()`.

The original unminified v1 source (React/CRA) is not part of this checkout; per `readme.txt` it's expected to live in a separate public GitHub repo (`GemFind-Application/New-RB-Wordpress-Plugin`) under `src/rb-version-1-frontend/` "when present."

### v2 — current storefront (`src/rb-version-2-frontend/`)

Real source, React 18 + Vite, builds to `public/frontpublic/build/assets/frontend.js`/`frontend.css` (single-file output, no code-splitting — `vite.config.mjs` forces one `frontend.js` chunk name and wraps it in an IIFE).

- `src/index.jsx` — entry point.
- `src/App.jsx` — top-level component. Reads `window.gemfindRBConfig`, calls `appService.checkActivePlan`/`getConfigSetting`, and defines all `react-router-dom` routes (settings/mounting list, setting detail, diamond list/detail/compare, complete-ring flow, plus a full parallel `/diamondlink/*` legacy-alias route set). Additional legacy routes come from `src/routes/legacyRoutes.jsx`.
- `src/pages/` — route-level pages: `settings`, `setting-details`, `diamond`, `diamond-details`, `diamond-table`(-scroll), `compare`, `complete`, `hint-sent`, `request-sent`.
- `src/components/` — ~90 components. Some are clearly named (`FilterModal`, `SettingsFilterPanel`, `DiamondTable`, `MultiRangeSlider`, `VirtualTryOn*`, `RequestInfoPopup`, `Header`/`Footer`/`MainNav`); many others use generic/legacy names (`component.jsx`, `sh1.jsx`, `head2.jsx`, `frame-component5.jsx`, etc.) — known readability debt, not a sign they're unused.
- `src/Services/` — the API layer: `app.service.js`, `cart.service.js`, `diamond.service.js`, `email.service.js`, `setting.service.js`, `themes.json` (preset themes).
- `src/Helpers/` — `fetch-wrapper.js`, `http-common.js`, `jc-api-base.js` (resolves the JewelCloud proxy base URL), `printDiamond.js`, `role.js`, `storage.js`, `utils.js`.
- `src/utils/` — shape icons, font loading, CSS scoping helper, image base URL helper.
- No Redux/Context library — state is plain `useState`/`useEffect` lifted into `App.jsx` and prop-drilled, plus `localStorage` for a couple of cross-page values (compare list, "start flow" flag).
- API base URL resolution: prefers `window.gemfindRBConfig.restUrl` (the real WP REST base, injected by PHP) over the `VITE_APP_FORM_API_URL` build-time env var; JewelCloud calls always go through the WP `/jcProxy` REST route, never directly to `api.jewelcloud.com`, from the browser.

### Admin UI (`src/admin-frontend/`)

Real source, React 18 + Vite, builds to `assets/build/admin.js` (single IIFE bundle, `format: "iife"`, global name `GemfindRBAdmin`, terser-minified with `wp` reserved so the WordPress global isn't mangled).

- `src/index.jsx` — mounts into `#gemfindrb-admin-root`.
- `src/App.jsx` — reads the mount div's `data-page` attribute (`settings` or `css`) plus `window.gemfindRBAdminConfig` (localized by `admin/class-gemfindrb-admin.php`); shows a `RegistrationPage` gate first if the shop isn't registered yet.
- `src/pages/` — `SettingsPage`, `CssPage`, `RegistrationPage`, `KnowledgeBasePage`.
- `src/components/` — `AdminShell`, `AdminToast`, `ColorCard`, `Field`, `ViewInFrontendBanner`.
- `src/api.js` — talks to the same `gemfind-ring-builder/v1` REST namespace, using admin-authenticated routes (nonce from `gemfindRBAdminConfig`).
- `src/utils/` — color utilities, CSS-config mapper, font family utilities, "experience badge" helper.

### API / backend code (PHP)

All under `includes/`:

| File | Responsibility |
|---|---|
| `class-gemfindrb-api.php` | Registers every REST route under `gemfind-ring-builder/v1` (see table below). |
| `class-gemfindrb-shortcode.php` | `[gemfindRB_ring_builder]` shortcode; decides v1 vs v2; enqueues assets; localizes `window.gemfindRBConfig`; injects v1 runtime patches. |
| `class-gemfindrb-public-routes.php` | `/ringbuilder/*` SEO rewrite rules + legacy URL compatibility. |
| `class-gemfindrb-full-width-template.php` | Registers the full-width page template used to host the SPA. |
| `class-gemfindrb-frontend-version.php` | Decides/normalizes v1 vs v2 (default v2). |
| `class-gemfindrb-activator.php` / `-deactivator.php` | Activation: DB schema migration + creates the `/ringbuilder/` page. Deactivation: intentionally a no-op. |
| `class-gemfindrb-loader.php` | Small helper for registering WP hooks from the bootstrap file. |
| `gemfindrb-legacy-compat.php` | One-time migration of a legacy WP option into the new DB tables. |
| `gemfindrb-asset-revision.php` | Cache-busting version string for enqueued assets. |
| `gemfindrb-css-defaults.php` | Default color/theme values used before any CSS config is saved. |
| `gemfindrb-composer.php` | Loads Dompdf's autoloader defensively (guards against a class-name clash with a sibling `gemfind-diamond-link` plugin that ships its own dompdf copy). |
| `includes/services/class-gemfindrb-db.php` | Direct-SQL data layer for the plugin's custom DB tables. |
| `includes/services/class-gemfindrb-settings.php` | Shop config + CSS config CRUD, customer registration check/save. |
| `includes/services/class-gemfindrb-jewelcloud.php` | Server-side JewelCloud API client (`JC_BASE = https://api.jewelcloud.com/api/RingBuilder/`) — config, diamond/mounting detail, and the generic proxy used by `/jcProxy`. |
| `includes/services/class-gemfindrb-form-payload.php` | Normalizes storefront contact-form payloads before emailing. |
| `includes/services/class-gemfindrb-smtp.php` / `class-gemfindrb-mail.php` | Per-shop custom SMTP config, wired into `wp_mail`. |
| `includes/services/class-gemfindrb-email.php` | The 12 outbound email functions (ring/diamond/complete-ring × drop-hint/request-info/email-a-friend/schedule-viewing), rendering `includes/templates/email-*.php`. |
| `includes/services/class-gemfindrb-print.php` | Dompdf PDF streaming (diamond, complete ring, certificate). |
| `includes/services/class-gemfindrb-woo-cart.php` | WooCommerce cart integration (only registers hooks if WooCommerce is active). |
| `includes/services/class-gemfindrb-css.php` | Builds the dynamic inline `<style>` block from saved CSS config. |
| `includes/templates/*.php` | Server-rendered PDF/print page templates and email templates. |

**REST API** — namespace `gemfind-ring-builder/v1`, all registered in `includes/class-gemfindrb-api.php::register_routes()`:

| Method | Route | Purpose |
|---|---|---|
| GET | `/reactconfig`, `/reactconfig/getcssStyle`, `/reactconfig/GetDiamondDetail`, `/reactconfig/GetMountingDetail` | Bootstrap config / diamond / mounting data for the SPA |
| GET | `/billing/check-active-plan` | Always returns active (no billing system in the WP version) |
| GET/POST | `/shop/configuration` | Read/write shop settings (write = admin only) |
| GET/POST | `/smtp/configuration` | Read/write custom SMTP config (admin only) |
| GET/POST | `/css/configuration` | Read/write CSS theme config (write = admin only) |
| GET | `/customer/check-registration` | Check shop registration status |
| POST | `/customer/register` | Register the shop |
| POST | `/addToCart`, `/addRing` (+ `/api/*` aliases) | Add items to WooCommerce cart |
| GET/POST | `/cartadd/{diamond_id}[/{type}]`, `/cartaddsetting/{setting_id}`, `/completePurchase/{diamond_id}/{setting_id}` | Cart flows |
| POST | `/dropHintApi`, `/reqInfoApi`, `/emailFriendApi`, `/scheViewApi` and `dl`/`cr` prefixed variants (+ `/api/*` aliases) | Contact-form emails for ring / diamond / complete-ring flows |
| GET | `/getDiamondDetailsApi/...` (path or query form) | Diamond detail lookup |
| GET | `/printDiamond/...`, `/printCompleteRing/...`, `/certificatePdf/...` (+ `/api/*` aliases) | PDF streaming |
| GET/POST | `/jcProxy/{endpoint}` | Whitelisted proxy to 15 JewelCloud endpoints (`AccountAuthentication`, `GetMountingList`, `GetDiamond`, etc.) |
| GET | `/jcVideoProxy` | Proxies JewelCloud video URL lookups |

Cart-mutating routes require WooCommerce + either an authenticated admin or a valid `wp_rest` nonce, and unauthenticated writes are rate-limited (30 requests / 5 min per IP). The `/api/*` route aliases exist because the v1 bundle's HTTP client was originally built against a Laravel backend and still posts to those paths.

## 4. Build system

Root `package.json` scripts:

```
npm run install:all   # npm install in src/rb-version-2-frontend and src/admin-frontend
npm run build         # build all 3 targets (admin, v2, v1) via scripts/build-all.cjs
npm run build:admin   # admin only
npm run build:v2      # v2 only
npm run build:v1      # v1 only (re-applies the patch-v1-*.js chain)
npm run dev:admin     # vite dev server for the admin app
npm run dev:v2        # vite dev server for the v2 storefront
npm run download:images  # pulls legacy image assets so v2 doesn't depend on an external host at runtime
npm run package       # zips a release build (does not build anything itself)
```

`scripts/build-all.cjs` builds whichever targets are requested (default: all three), running `npm install` first if `node_modules` is missing for `admin`/`v2` (v1 has nothing to install), then `npm run build` in each target directory, then verifies the expected output files exist. After building `v1` and/or `v2` it always re-runs the noUiSlider range patch + a smoke test, since both bundles include a copy of the same slider code.

Output → WordPress enqueue mapping:

| Build target | Output | Enqueued by |
|---|---|---|
| Admin | `assets/build/admin.js` | `admin/class-gemfindrb-admin.php::enqueue_assets()` |
| v2 | `public/frontpublic/build/assets/frontend.js` / `frontend.css` | `includes/class-gemfindrb-shortcode.php::do_enqueue()` |
| v1 | `public/static/js/frontend-v1.js` / `public/static/css/frontend-v1.css` (+ `nouislider.min.js`) | `includes/class-gemfindrb-shortcode.php::do_enqueue()` |

`scripts/package-plugin.cjs` builds the release ZIP: it does **not** rebuild anything, it just asserts the expected build outputs already exist, then copies PHP + built assets (never `src/rb-version-2-frontend/`) into a staging folder, strips dev-only files (`node_modules`, `.git`, `.map`, the duplicate `vendor/vendor` tree, `index.html` build artifacts, etc.), zips with POSIX paths (so Linux hosts extract it correctly), and validates the result. Output: `../gemfind-ring-builder-<version>.zip`.

## 5. Local dev setup

1. **Prerequisites**: PHP >= 8.1, WordPress >= 6.3, Composer, Node.js/npm. WooCommerce is optional but required for cart features.
2. Install PHP deps: `composer install` (installs Dompdf, used only for PDF export).
3. Install JS deps: `npm run install:all` from the plugin root.
4. Build everything: `npm run build` (or `build:admin`/`build:v2`/`build:v1` individually while iterating).
5. Activate the plugin in a local WordPress install — activation creates the `/ringbuilder/` page automatically.
6. Configure the shop: in wp-admin → "GemFind Ring Builder" → Settings, register the shop and set the JewelCloud dealer/account ID; use the CSS Configurator to theme the storefront.
7. Visit `/ringbuilder/settings/` (mountings) or `/ringbuilder/diamondlink/` (diamonds) to see the live storefront.

**Iterating on v2 or the admin UI**: `npm run dev:v2` / `npm run dev:admin` start a Vite dev server, but neither app gets real WP data unless it's loaded against an actual WP page/admin screen — both apps read their config from `window.gemfindRBConfig` / `window.gemfindRBAdminConfig`, which is only ever localized by PHP on a real request. There's no dev-server proxy configured in either `vite.config.mjs`. In practice, the fastest loop for logic changes is: edit → `npm run build:v2` (or `:admin`) → refresh the real WP page.

v2's `src/rb-version-2-frontend/` also has `.env-dev`, `.env-live`, and `.env.production` files defining `VITE_APP_FORM_API_URL`/`VITE_IMAGE_URL` for different targets. Only `.env.production` follows Vite's actual env-file naming convention (`.env.<mode>`) and is confirmed to be what the production build uses (pointing at the relative WP REST path `/wp-json/gemfind-ring-builder/v1`); `.env-dev`/`.env-live` use non-standard filenames (dash instead of dot) — verify Vite is actually picking them up via `--mode` before relying on them.

**Iterating on v1**: there's no source to hot-reload. See §3 — either extend a `scripts/patch-v1-*.js` script and rebuild, or add an inline runtime patch in `GEMFINDRB_Shortcode::do_enqueue()`.

## 6. External dependencies

- **JewelCloud API** (`api.jewelcloud.com`) — required. This is GemFind's own inventory/catalog service; all diamond/mounting data comes from here, authenticated per-merchant via a JewelCloud dealer/account ID stored in plugin settings. The browser never calls it directly — everything goes through the plugin's `/jcProxy` and `/jcVideoProxy` REST routes, or server-side PHP calls in `GEMFINDRB_Jewelcloud`.
- **WooCommerce** — optional, required only for add-to-cart/checkout functionality.
- Optional, client-side-only integrations (no server dependency): Camweara virtual try-on iframe, Google Fonts, Google reCAPTCHA (only if a site key is configured), Facebook/Pinterest/Twitter share links (click-out only, no SDKs loaded), YouTube/Vimeo embeds when JewelCloud returns a video URL.

## 7. Known quirks worth knowing about

- `src/rb-version-1-frontend/` looks like a real source folder but isn't — don't spend time searching it for v1 logic; see §3.
- `vendor/vendor/...` is a duplicate/nested Composer install artifact, not something to maintain; the packaging script already excludes it.
- v1 has two independent patch mechanisms (build-time string patches in `scripts/patch-v1-*.js`, and runtime inline-script patches in `GEMFINDRB_Shortcode::do_enqueue()`) — check both when tracking down v1 behavior.
- Many `src/rb-version-2-frontend/src/components/` files have generic/legacy names (`component.jsx`, `sh1.jsx`, `head2.jsx`, etc.) rather than descriptive ones — this is pre-existing debt, not dead code.
