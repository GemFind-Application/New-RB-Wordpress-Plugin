# GemFind Ring Builder — Developer Guide

Technical reference for building, extending, and debugging the WordPress plugin.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ recommended |
| npm | 9+ |
| PHP | 8.1+ |
| WordPress | 6.3+ |
| Composer | For PHP dependencies (`vendor/`) |

---

## Quick start — manual builds

From the **plugin root** (`wp-content/plugins/gemfind-ring-builder/`):

```bash
# First time (or after dependency changes)
npm run install:all

# Build everything: admin + v2 + v1
npm run build
```

### Windows shortcuts (Diamond Link style)

```powershell
.\build.ps1              # install + build all
.\build.ps1 -Target v2   # v2 only
```

```cmd
build.cmd                # install + build all
build.cmd admin v2       # admin + v2 only
```

### Individual targets

| Command | What it builds | Output |
|---------|----------------|--------|
| `npm run build` | All bundles | See table below |
| `npm run build:admin` | WordPress admin React UI | `assets/build/admin.js` |
| `npm run build:v2` | Storefront React 2.0 | `public/frontpublic/build/assets/frontend.js` |
| `npm run build:v1` | Classic v1 bundle patch | `public/static/js/frontend-v1.js` |
| `npm run dev:admin` | Admin Vite dev server | — |
| `npm run dev:v2` | Storefront Vite dev server | — |
| `npm run package` | Production ZIP (runs full build first) | `../gemfind-ring-builder-1.0.0.zip` |

The orchestrator lives at `scripts/build-all.cjs`. It runs each Vite/CRA step, then verifies required files exist in the paths WordPress enqueues.

---

## Build output map

WordPress loads bundles from these **fixed paths** — do not change without updating PHP enqueue code.

| Surface | Source | Build tool | Enqueued by |
|---------|--------|------------|-------------|
| **Admin** | `src/admin-frontend/` | Vite → IIFE | `admin/class-gemfindrb-admin.php` |
| | → `assets/build/admin.js` | | |
| | → `assets/build/admin.css` (optional; CSS may be inlined in JS) | | |
| **Storefront v2** | `public/frontpublic/` | Vite → IIFE-wrapped ES | `includes/class-gemfindrb-shortcode.php` |
| | → `public/frontpublic/build/assets/frontend.js` | | |
| | → `public/frontpublic/build/assets/frontend.css` | | |
| **Storefront v1** | Pre-built CRA bundle | Path patch script | `includes/class-gemfindrb-shortcode.php` |
| | → `public/static/js/frontend-v1.js` | | |
| | → `public/static/css/frontend-v1.css` | | |

### Vite configs

- **v2:** `public/frontpublic/vite.config.mjs` — output `build/assets/frontend.js`, entire bundle wrapped in IIFE.
- **Admin:** `src/admin-frontend/vite.config.mjs` — output `../../assets/build/admin.js`, IIFE with terser `reserved: ["wp"]` to avoid clashing with WordPress globals.

### v1 bundle notes

v1 source (CRA) is **not** in this repo by default. The shipped bundle is in `public/static/`. `npm run build:v1` runs `scripts/patch-v1-wp-paths.js`, which rewrites Shopify paths `/apps/ringbuilder` → `/ringbuilder`.

To rebuild v1 from CRA source:

1. Place the CRA project in `src/rb-version-1-frontend/` (or build elsewhere).
2. Copy build output to:
   - `public/static/js/frontend-v1.js`
   - `public/static/css/frontend-v1.css`
3. Run `npm run build:v1` to apply WordPress path patches.

---

## Project layout

```
gemfind-ring-builder/
├── gemfind-ring-builder.php      # Bootstrap, hooks, migrations
├── package.json                  # Root build orchestration
├── build.cmd / build.ps1         # One-click build scripts
├── developer.md                  # This file
├── admin/
│   ├── class-gemfindrb-admin.php # Admin menu, enqueue admin.js
│   └── css/                      # Static admin CSS (non-React)
├── assets/
│   ├── build/                    # Admin Vite output (generated)
│   └── css/                      # WP theme overrides
├── includes/
│   ├── class-gemfindrb-api.php           # REST routes
│   ├── class-gemfindrb-shortcode.php     # [gemfindRB_ring_builder], asset enqueue
│   ├── class-gemfindrb-public-routes.php # /ringbuilder/* rewrite rules
│   ├── class-gemfindrb-frontend-version.php
│   └── services/                         # DB, JewelCloud, email, cart, CSS
├── public/
│   ├── frontpublic/              # v2 React source + build/
│   └── static/                   # v1 pre-built bundles
├── scripts/
│   ├── build-all.cjs             # Unified build command
│   ├── patch-v1-wp-paths.js      # v1 Shopify → WP route patch
│   └── package-plugin.cjs        # Release ZIP packager
└── src/
    ├── admin-frontend/             # Admin React source
    └── rb-version-1-frontend/      # v1 placeholder / future CRA source
```

---

## Frontend versions (v1 vs v2)

Controlled by `tool_version` in `wp_ringbuilder_config` (admin **Settings → Tool Version**).

| Value | Bundle | Mount element | Router basename |
|-------|--------|---------------|-----------------|
| `1.0` / `version-one` | `frontend-v1.js` | `#ringbuilder-root` | `/ringbuilder` |
| `2.0` / `version-two` (default) | `frontend.js` | `#gemfindrb-root` inside `#GemFind` | `/ringbuilder` |

Shortcode override: `[gemfindRB_ring_builder version="1.0"]`

### v2 routing (`public/frontpublic/src/App.jsx`)

Basename from `window.gemfindRBConfig.routerBasename` (default `/ringbuilder`).

Key routes:

- `/diamondtools` — diamond search
- `/diamondtools/product/:slug` — diamond PDP
- `/settings` — setting search
- `/settings/product/:settingId` — setting PDP
- `/complete` — complete ring review

### v1 routing

Classic CRA routes under `/ringbuilder/*` (e.g. `/ringbuilder/settings/*`, `/ringbuilder/diamondtools/*`). Paths must use `/ringbuilder`, not Shopify `/apps/ringbuilder`.

### `window.gemfindRBConfig` (localized by PHP)

Injected on both v1 and v2:

```js
{
  restUrl, nonce, shop, siteUrl, dealerId,
  routerBasename, jcProxyUrl, imageBaseUrl,
  tryOnOverrideCssUrl, formApiUrl, toolVersion
}
```

v1 also receives `gemfindRBShopify` with `api_url`, `jc_api_url`, etc.

### Fetch proxy patch

Inline script rewrites `api.jewelcloud.com/api/RingBuilder/*` requests to the WordPress REST proxy (`/wp-json/gemfind-ring-builder/v1/jcProxy/...`) and attaches `X-WP-Nonce` for authenticated REST calls.

---

## PHP architecture

### Bootstrap

`gemfind-ring-builder.php` loads services, registers activation hooks, and runs idempotent DB migrations on `plugins_loaded`.

### Database tables

| Table | Purpose |
|-------|---------|
| `{prefix}ringbuilder_config` | Dealer ID, API URLs, feature flags, `tool_version` |
| `{prefix}ringbuilder_css_configure` | Theme colors, fonts, layout |
| `{prefix}ringbuilder_customer` | Merchant registration |

### Key classes

| Class | Role |
|-------|------|
| `GEMFINDRB_Shortcode` | Shortcode render, frontend asset enqueue, mount HTML |
| `GEMFINDRB_API` | REST API (`gemfind-ring-builder/v1`) |
| `GEMFINDRB_JewelCloud` | Server-side JC API client + `get_react_config()` |
| `GEMFINDRB_DB` | Config/CSS/customer CRUD + runtime migrations |
| `GEMFINDRB_Public_Routes` | `/ringbuilder/*` SPA rewrites, legacy redirects |
| `GEMFINDRB_Admin` | WP admin pages, React admin mount |

### Config API (`mountinglistapifancy`)

v1 `SettingDetails` reads `window.initData.data[0].mountinglistapifancy` for single-setting fetches. On Shopify this points to `GetMountingDetail?`. WordPress backfills it from `mountingdetailapi` in `GEMFINDRB_JewelCloud::get_react_config()` when empty.

---

## REST API

Namespace: `/wp-json/gemfind-ring-builder/v1`

### Storefront / config

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/reactconfig` | GET | Full shop config for React (`initData`) |
| `/reactconfig/getcssStyle` | GET | Dynamic CSS colors |
| `/reactconfig/GetDiamondDetail` | GET | Diamond PDP proxy |
| `/reactconfig/GetMountingDetail` | GET | Setting PDP proxy |
| `/jcProxy/{Action}` | GET/POST | JewelCloud API proxy (allowlist in `JC_PROXY_ALLOWED`) |
| `/jcVideoProxy` | GET | Camweara / video try-on proxy |
| `/billing/check-active-plan` | GET | Always active on WordPress |

### Admin (requires `manage_options` + nonce)

| Endpoint | Purpose |
|----------|---------|
| `/shop/configuration` | GET/POST shop settings |
| `/css/configuration` | GET/POST theme CSS |
| `/smtp/configuration` | GET/POST email SMTP |

### Cart & emails

- `/addToCart`, `/addRing`, `/cartadd/{id}`, `/cartaddsetting/{id}`, `/completePurchase/{diamond}/{setting}`
- Form endpoints: `/dropHintApi`, `/reqInfoApi`, `/emailFriendApi`, `/scheViewApi` (+ diamond/complete-ring variants)
- **v1 legacy aliases:** same endpoints also registered under `/api/dropHintApi`, etc. (v1 axios appends `/api` to the REST base URL)

Authentication: `X-WP-Nonce` header with `wp_rest` nonce for mutating storefront form requests.

---

## URL routing (WordPress)

### Storefront SPA

All paths under `/ringbuilder/*` resolve to the Ring Builder page (rewrite rules in `GEMFINDRB_Public_Routes`).

Examples:

```
/ringbuilder
/ringbuilder/diamondtools
/ringbuilder/diamondtools/product/asscher-shape-...--sku-1941166927
/ringbuilder/settings/solitaire/14k-white-gold-sku-7726307
```

### Legacy redirects

- `/apps/ringbuilder/*` → `/ringbuilder/*` (301)
- `ringBuilder-old` cart URLs proxied to REST

### Shortcode

```
[gemfindRB_ring_builder]
[gemfindRB_ring_builder version="1.0"]
```

Legacy alias: `[gemfind_ring_builder]`

If the page content lacks the mount node but the URL is `/ringbuilder/*`, `inject_mount_fallback` appends the shortcode output automatically.

---

## CSS scoping (v2)

Storefront CSS is scoped to `#GemFind.gemfind-ring-builder-scope` so theme styles do not bleed in.

- Source files should include the scope prefix (run `npm run scope:css` in `public/frontpublic/`).
- `postcss.config.cjs` adds a build-time safety net.
- Portal modals render under `#portals` (document body) — selectors for `#portals` are **not** prefixed.

Admin UI uses separate styles in `admin/css/gemfindrb-admin.css` plus generated `assets/build/admin.css`.

---

## Local development

### WordPress (recommended)

1. Local site with plugin active.
2. Create a page with `[gemfindRB_ring_builder]` or visit `/ringbuilder`.
3. After source changes:
   ```bash
   npm run build:v2    # or build:admin
   ```
4. Hard-refresh the browser (bundles are cache-busted via `filemtime`).

### Vite dev servers

```bash
npm run dev:v2      # http://localhost:5173 — needs WP proxy or mock config
npm run dev:admin   # Admin UI only
```

Dev servers do not replace the WordPress enqueue flow; use them for component work, then `npm run build`.

### Asset cache busting

`gemfindRB_get_asset_revision()` in `includes/gemfindrb-asset-revision.php` appends file modification time to `GEMFINDRB_VERSION` for script/style query strings.

---

## Release packaging

```bash
npm run package
```

This:

1. Runs `npm run build` (all bundles).
2. Stages PHP, `assets/build/`, `public/frontpublic/build/`, `public/static/`.
3. Excludes `node_modules`, React source, and dev files.
4. Creates `wp-content/plugins/gemfind-ring-builder-1.0.0.zip`.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Admin shows “bundle missing” | `assets/build/admin.js` absent | `npm run build:admin` |
| Storefront blank / no React | `frontend.js` missing | `npm run build:v2` |
| v1 stuck on skeleton | `mountinglistapifancy` null in config | Fixed in `get_react_config()`; reload page |
| v1 Drop a Hint / email forms 404 | v1 posts to `/api/dropHintApi`; WP had only `/dropHintApi` | Fixed: `/api/*` REST aliases + XHR nonce patch for v1 axios |
| v1 PDF download says “Try to sign in” | Plain `<a download>` cannot send the REST nonce header | `patch-v1-print-nonce.js` adds `_wpnonce` to the print URL |
| v1 wrong routes / 404 content | `/apps/ringbuilder` in bundle | `npm run build:v1` (path patch) |
| Modal invisible (reset filter) | Portal CSS outside scope | Check `#portals` rules in `portal-alert-overrides.css` |
| JC API CORS errors | Direct browser calls to JewelCloud | Ensure fetch patch runs; calls should go via `jcProxy` |
| `Identifier 'wp' has already been declared` | Admin bundle not IIFE | Rebuild admin; verify terser `reserved: ["wp"]` |

---

## Related Shopify / Laravel reference

Original Ring Builder CRA (v1) and Laravel backend live in:

```
Ring-builder-CI-to-Laravel-main/frontend-version-1/
```

Use that repo when rebuilding `frontend-v1.js` from source. WordPress replaces Laravel `reactconfig` and `jcProxy` endpoints with the plugin REST API.

---

## Command reference (copy-paste)

```bash
cd wp-content/plugins/gemfind-ring-builder

npm run install:all     # install v2 + admin deps
npm run build           # admin + v2 + v1
npm run build:admin     # admin only
npm run build:v2        # storefront v2 only
npm run build:v1        # patch v1 paths only
npm run scope:css       # re-apply v2 CSS scope prefixes
npm run package         # production ZIP
```
