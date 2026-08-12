# GemFind Ring Builder — QA Test Cases

**Plugin:** GemFind Ring Builder `1.0.0`  
**Scope:** Manual / exploratory QA across install, admin, storefront (v1 & v2), REST, WooCommerce, emails, print/PDF, routing, and error paths.  
**Prerequisites:** WordPress ≥ 6.3, PHP ≥ 8.1, valid JewelCloud Dealer ID, WooCommerce (for cart cases), admin user with `manage_options`.

**How to use**

| Column | Meaning |
|--------|---------|
| **ID** | Unique case id |
| **Priority** | P0 blocker / P1 high / P2 medium / P3 low |
| **Type** | Functional, UI, API, Integration, Negative, Regression, Security, Perf |
| **Steps** | Exact actions |
| **Expected** | Pass criteria |

Mark each case: Pass / Fail / Blocked / N/A. Note environment (theme, WC on/off, tool_version).

---

## 0. Test environment matrix

Run critical storefront flows across at least:

| Dimension | Variants |
|-----------|----------|
| UI version | `tool_version` **2.0** and **1.0** |
| Theme | Block theme (e.g. Twenty Twenty-Four) + classic theme |
| WooCommerce | Active + inactive |
| Shortcode | Default page vs custom page with `[gemfindRB_ring_builder]` |
| Device | Desktop + mobile viewport |
| Diamond types | Natural, lab-grown, fancy color (where inventory exists) |
| Ring path | Setting-first and diamond-first (if both supported) |

---

## 1. Installation, activation, deactivation

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| INST-01 | P0 | Functional | Fresh activate | Install plugin ZIP/folder → Activate | Plugin active; no PHP fatal; admin menu **GemFind Ring Builder** appears |
| INST-02 | P0 | Functional | Pages created | After activate, check Pages | Pages exist: `/ringbuilder/` (Ring Builder), child **Settings** (`settings`), child **Diamond Link** (`diamondlink`); Ring Builder page contains shortcode; full-width template assigned where applicable |
| INST-03 | P0 | Functional | Options stored | Check options after activate | `gemfindRB_tool_page_id`, `gemfindRB_settings_page_id`, `gemfindRB_diamondlink_page_id` set to valid page IDs |
| INST-04 | P1 | Functional | DB tables | Inspect DB after activate | Tables `{prefix}ringbuilder_config`, `ringbuilder_css_configure`, `ringbuilder_customer` exist; `gemfindRB_db_ver` = `1.0.1` |
| INST-05 | P1 | Functional | Rewrite flush | Visit `/ringbuilder/settings/` after activate | SPA loads (200), not theme 404 |
| INST-06 | P2 | Functional | Reactivate | Deactivate → Activate again | Pages/options not duplicated; existing Dealer ID / config preserved |
| INST-07 | P2 | Functional | Deactivate data | Deactivate plugin | Pages and tables remain; site does not fatally error |
| INST-08 | P1 | Negative | Missing bundles | Temporarily rename `public/frontpublic/build/assets/frontend.js` → open storefront as admin | Admin notice or HTML comment about missing build; no white screen of death |
| INST-09 | P2 | Functional | Requirements | Confirm PHP & WP versions on About/readme | Matches Requires PHP 8.1+, WP 6.3+ |

---

## 2. Admin — access, menus, About

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| ADM-01 | P0 | Functional | Settings menu | WP Admin → GemFind Ring Builder → Settings | `#gemfindrb-admin-root` mounts; Settings React UI loads |
| ADM-02 | P0 | Functional | CSS Configurator | Open **CSS Configurator** | Admin CSS page loads (`data-page="css"`) |
| ADM-03 | P1 | Functional | About page | Open **About** | PHP About content; support contact (support@gemfind.com / phone) visible |
| ADM-04 | P1 | Security | Capability gate | Log in as Editor (no `manage_options`) | Cannot access Ring Builder admin screens (redirect / denied) |
| ADM-05 | P2 | UI | Admin assets | View source on Settings | `assets/build/admin.js` (+ CSS if present) and `admin/css/gemfindrb-admin.css` enqueued; `gemfindRBAdminConfig` localized |
| ADM-06 | P2 | Functional | Menu position | Check left admin menu | GemFind Ring Builder present near expected position |

---

## 3. Admin — General settings

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| SET-G01 | P0 | Functional | Save Dealer ID | Enter valid `dealerid` → Save | Saved; storefront inventory loads via JewelCloud |
| SET-G02 | P0 | Negative | Empty Dealer ID | Clear dealer id → Save → open storefront | Config may save; JC/inventory fails with clear dealer-not-configured style error (no fatal) |
| SET-G03 | P0 | Functional | Switch to v1 | Set `tool_version` = 1.0 → confirm modal if shown → Save → open `/ringbuilder/settings/` | v1 bundle loads (`frontend-v1.js` / `#ringbuilder-root`); UI is classic |
| SET-G04 | P0 | Functional | Switch to v2 | Set `tool_version` = 2.0 → Save | v2 bundle loads (`frontend.js` / `#gemfindrb-root` inside `#GemFind`) |
| SET-G05 | P1 | Functional | Products per page | Set `products_pp` to 12, 24, 48, 99 | Listing page size matches selection |
| SET-G06 | P1 | Functional | Default view | Toggle `default_view` list ↔ grid | Default listing layout matches |
| SET-G07 | P2 | Functional | Carat ranges | Set `settings_carat_ranges` comma list → save | Filter/range UI reflects configured ranges |
| SET-G08 | P2 | Functional | Shop title / phone | Set `shop_title`, `phone_number` | Values appear where UI/emails/print expect them |
| SET-G09 | P1 | Regression | Asset revision bump | Save shop settings | Storefront CSS/JS query string / revision updates (cache bust) |

---

## 4. Admin — Display toggles

For each toggle: ON shows control/feature; OFF hides it on storefront (v2 and spot-check v1).

| ID | Priority | Setting | Verify on |
|----|----------|---------|-----------|
| SET-D01 | P1 | `enable_hint` | Setting / diamond / complete ring — Drop a Hint |
| SET-D02 | P1 | `enable_email_friend` | Email a Friend |
| SET-D03 | P1 | `enable_schedule_viewing` | Schedule a Viewing |
| SET-D04 | P1 | `enable_more_info` | Request More Info |
| SET-D05 | P1 | `enable_print` | Print / PDF actions |
| SET-D06 | P2 | `enable_admin_notification` | Admin receives copy when forms submit |
| SET-D07 | P2 | `enable_sticky_header` | Sticky header behavior on scroll |
| SET-D08 | P2 | `show_powered_by` | Powered-by footer/branding |
| SET-D09 | P2 | `show_filter_info` | Filter info UI |
| SET-D10 | P1 | `display_tryon` | Virtual try-on entry; camera Permissions-Policy when used |
| SET-D11 | P1 | `buySingleDiamond` | Buy single diamond CTA / cart path |
| SET-D12 | P3 | `show_copyright` | Copyright line |
| SET-D13 | P2 | `price_row_format` left/right | Price alignment |
| SET-D14 | P2 | `font_family` / `theme_font_family` | Typography on storefront |
| SET-D15 | P2 | `shop_logo` | Logo on UI / emails / print where applicable |
| SET-D16 | P2 | `announcement_text` | Announcement on list/browse |
| SET-D17 | P2 | `announcement_text_rbdetail` | Announcement on detail |

---

## 5. Admin — Email, SEO, Advanced, CSS

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| SET-E01 | P1 | Functional | Admin emails | Set `admin_email_address` (comma-separated) → submit a form with notifications on | Each address receives admin notification |
| SET-E02 | P2 | Negative | Invalid admin email | Enter malformed address → save / submit form | Validation or graceful skip; no PHP warning |
| SET-S01 | P2 | Functional | Ring SEO fields | Set `ring_meta_title`, `ring_meta_description`, `ring_meta_keywords` | Values available to React / meta consumption |
| SET-S02 | P2 | Functional | Diamond SEO fields | Set diamond meta title/description/keywords + `diamond_details_textarea` | Values applied on diamond surfaces |
| SET-A01 | P1 | Functional | reCAPTCHA v2 | Set `recaptcha_version` v2 + `site_key` / `secret_key` → submit form | Captcha challenge appears; valid submit succeeds |
| SET-A02 | P1 | Functional | reCAPTCHA v3 | Switch to v3 keys → submit | Invisible/score flow works; invalid key fails clearly |
| SET-A03 | P2 | Negative | Missing secret | Site key only → submit | Form fails safely with message |
| CSS-01 | P0 | Functional | Apply theme | CSS Configurator → pick theme (e.g. `blue_ocean`) → Save → storefront | Colors/theme match selection |
| CSS-02 | P1 | Functional | Custom colors v2 | Edit link, CTA, hover, slider, background, nav active/inactive colors → Save | Dynamic CSS applied on storefront |
| CSS-03 | P1 | Functional | Custom colors v1 | With tool_version 1.0, edit `link_color`, `column_header_accent`, `call_to_action_button` | Only v1 fields apply; storefront updates |
| CSS-04 | P2 | Functional | Theme list | Cycle themes: default, ruby_red, golden_glow, royal_purple, emerald_green, tealwave, rosepink, neutral, champagne, sapphire, rosegold, emeraldvelvet, onyxgold, custom | Each saves and renders without breaking layout |
| CSS-05 | P1 | Regression | CSS save revision | Save CSS config | Asset revision bumps; hard refresh shows new styles |

---

## 6. Shortcodes & mount

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| SC-01 | P0 | Functional | Primary shortcode | Page with `[gemfindRB_ring_builder]` | App mounts; assets enqueue |
| SC-02 | P1 | Functional | Legacy alias | `[gemfind_ring_builder]` | Same behavior as primary |
| SC-03 | P0 | Functional | Force v1 attr | `[gemfindRB_ring_builder version="1.0"]` (or `version-one`) while admin is 2.0 | Loads v1 regardless of admin default |
| SC-04 | P0 | Functional | Force v2 attr | `version="2.0"` / `version-two` while admin is 1.0 | Loads v2 |
| SC-05 | P1 | Functional | Mount nodes v2 | Inspect DOM | `#GemFind` / `#gemfindrb-root` present |
| SC-06 | P1 | Functional | Mount nodes v1 | Inspect DOM | `#ringbuilder-root` (and `#root` if injected) present |
| SC-07 | P1 | Functional | Fallback inject | Visit `/ringbuilder/settings/` if content somehow lacks mount | `inject_mount_fallback` still renders tool |

---

## 7. Routing, redirects, SEO path handling

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| RT-01 | P0 | Functional | Settings URL | Open `/ringbuilder/settings/` | Settings browse loads |
| RT-02 | P0 | Functional | Diamond URL | Open `/ringbuilder/diamondlink/` | Diamond search loads |
| RT-03 | P1 | Functional | Bare redirect | Open `/ringbuilder` (no trailing path) | 302 → `/ringbuilder/settings/` |
| RT-04 | P1 | Functional | Legacy Shopify path | Open `/apps/ringbuilder/settings/` | 301 → `/ringbuilder/settings/` |
| RT-05 | P1 | Functional | Deep SPA path | Navigate setting PDP then refresh | Same route returns 200 (not WP 404) |
| RT-06 | P1 | Functional | 404 repair | Hit unknown deep path under `/ringbuilder/...` | Tool page resolves; SPA handles unknown route |
| RT-07 | P2 | Functional | Canonical | View source on SPA path | WP canonical does not break SPA URL (preserve behavior) |
| RT-08 | P1 | Functional | Cart URL proxy | Hit `/ringbuilder/cartaddsetting/{id}` (valid setting) | Proxies toward REST cart flow (307 or cart success) |
| RT-09 | P2 | Functional | Legacy cart proxy | `/apps/ringbuilder/cartadd...` | Redirects/proxies correctly |
| RT-10 | P2 | Functional | Subdirectory install | If WP in subdir, open basename-prefixed URLs | `routerBasename` includes home path; routes work |

---

## 8. Storefront — settings (rings) browse & PDP

Run for **v2** and **v1**.

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| RB-01 | P0 | Functional | Settings list loads | Open settings browse with valid dealer | Mountings/settings list from JC via `jcProxy` |
| RB-02 | P0 | Functional | Filters | Apply metal, shape, price, carat, style filters | Results update; empty filter set shows empty state |
| RB-03 | P1 | Functional | Sort / pagination | Change sort; page through results | Correct order; page size matches `products_pp` |
| RB-04 | P1 | UI | List vs grid | Toggle views | Layout switches; images/prices visible |
| RB-05 | P0 | Functional | Setting PDP | Open `/settings/product/:settingId` | Detail loads (`GetMountingDetail`); images, price, specs |
| RB-06 | P1 | Functional | Alternate PDP path | `/settings/view/path/:settingId` | Same product detail |
| RB-07 | P1 | Functional | Select & continue | Choose size/options → continue to diamonds | Diamond search opens with setting context |
| RB-08 | P2 | Functional | Lab settings legacy | `/settings/islabsettings/:settingSlug` | Loads if inventory supports; else graceful empty/error |
| RB-09 | P2 | UI | Sticky header | With toggle on, scroll long list | Header stays usable |
| RB-10 | P2 | UI | Announcement | With announcement set | Banner text visible |
| RB-11 | P1 | Negative | Invalid setting ID | Open PDP with fake ID | Error/empty message; no crash |

---

## 9. Storefront — diamond search, types, compare, PDP

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| DL-01 | P0 | Functional | Diamond list | Open `/ringbuilder/diamondlink/` or `/diamondtools` | Diamonds load via proxy |
| DL-02 | P0 | Functional | Natural filters | Shape, carat, color, clarity, cut, price, etc. | Filters apply; results match |
| DL-03 | P1 | Functional | Lab-grown nav | `/diamondtools/diamondtype/navlabgrown` (and diamondlink alias) | Lab inventory / filters |
| DL-04 | P1 | Functional | Fancy color nav | `.../navfancycolored` | Fancy color filters (`GetColorDiamond*`) |
| DL-05 | P0 | Functional | Diamond PDP | `/diamondtools/product/:diamondId[/:type]` | Detail + media + price |
| DL-06 | P1 | Functional | Compare | Add 2–3 diamonds → `/diamondtools/compare/` | Compare table accurate |
| DL-07 | P2 | Functional | Compare edge | Compare 0 or 1 item | Sensible empty/limit UX |
| DL-08 | P1 | Functional | Certificate | Open certificate PDF action | PDF downloads/opens (`/certificatePdf/...`) |
| DL-09 | P1 | Functional | Print diamond | Print with `enable_print` on | PDF/HTML print (`/printDiamond/...`) |
| DL-10 | P2 | UI | v1 empty specs | On v1 PDP with blank/`-` specs | Empty rows hidden (DOM patch) |
| DL-11 | P1 | Negative | Invalid diamond ID | Fake product URL | Clear error; no fatal |

---

## 10. Complete ring flow

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| CR-01 | P0 | Functional | Setting → diamond → complete | Pick setting → pick diamond → complete ring | `/completering` shows both items + total |
| CR-02 | P0 | Functional | Complete from both entry points | Via `/diamondtools/completering/`, `/settings/completering`, `/diamondlink/completering` | Same complete UI |
| CR-03 | P1 | Functional | Change setting/diamond | From complete ring, change either piece | Updates pairing and price |
| CR-04 | P1 | Functional | Print complete ring | Print action | `/printCompleteRing/...` PDF/HTML correct |
| CR-05 | P1 | Functional | Complete ring forms | Drop hint / email friend / schedule / more info on complete | Emails send; toggles respected |
| CR-06 | P0 | Integration | Add complete to cart | Add complete ring (WC on) | Cart has complete-ring product; line details show setting + diamond |

---

## 11. Shopper engagement forms (emails)

Test each surface: **Ring setting**, **Diamond**, **Complete ring**.  
Endpoints: `dropHintApi`, `reqInfoApi`, `emailFriendApi`, `scheViewApi` (+ `dl*` / `cr*` variants).

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| EM-01 | P0 | Functional | Drop a Hint happy path | Fill required fields → submit | Success message; recipient email; HTML template correct |
| EM-02 | P0 | Functional | Request More Info | Submit valid form | Success; admin/customer emails per config |
| EM-03 | P0 | Functional | Email a Friend | Submit | Friend receives email with product context |
| EM-04 | P0 | Functional | Schedule Viewing | Submit future date/time | Success; not past deadline |
| EM-05 | P1 | Negative | Required fields empty | Submit blank | Client/server validation; 422 or `{ success:false }` |
| EM-06 | P1 | Negative | Invalid email | Bad email format | Rejected with message |
| EM-07 | P1 | Negative | Past gift/viewing deadline | Date in the past | 422 / error message |
| EM-08 | P1 | Functional | Toggle off | Disable feature → reload PDP | CTA hidden; direct API still nonce-protected |
| EM-09 | P2 | Functional | Admin notification | Toggle on → submit | Admin mailbox receives copy |
| EM-10 | P2 | Integration | SMTP config | If SMTP configured via API | Mail goes through SMTP host |
| EM-11 | P2 | UI | Email branding | Check received HTML | Logo, shop title, product image/links present |
| EM-12 | P1 | Security | Missing nonce | POST form API without `X-WP-Nonce` | 401/403; no email sent |

---

## 12. WooCommerce cart & checkout

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| WC-01 | P0 | Integration | Add diamond | `buySingleDiamond` on → add diamond | Product `D-{id}` created/updated; in cart; type `gemfindRB_diamond` |
| WC-02 | P0 | Integration | Add setting | Add setting alone | Product `R-{id}`; type `gemfindRB_ring` |
| WC-03 | P0 | Integration | Add complete ring | Add pair | Type `gemfindRB_complete_ring`; details include both |
| WC-04 | P1 | Integration | Cart line details | Open cart | Shape/carat/color/clarity or metal/size shown |
| WC-05 | P1 | Integration | Checkout → order | Complete order | Order item meta has details + `_gemfind_product_type` |
| WC-06 | P1 | Integration | Price sync | Add item with known JC price | WC price matches (`cost`/`price`/`fltPrice`/etc.) |
| WC-07 | P1 | Integration | Image sync | Add item with image | Featured image set on product |
| WC-08 | P0 | Negative | WC inactive | Deactivate WooCommerce → add to cart | 503 / `gemfindRB_no_woocommerce`; UI message |
| WC-09 | P1 | Negative | No price | Item without price fields | Cannot add; `no_price` (or equivalent) |
| WC-10 | P2 | Negative | Invalid SKU / id | Malformed cart request | `invalid_sku` / validation error |
| WC-11 | P2 | Functional | Cart token TTL | Start cart flow; wait > 20 min if feasible | Token expiry handled (`gemfindRB_cart_ctx` ~1200s) |
| WC-12 | P2 | Integration | Coming Soon mode | Enable WC Coming Soon → open `/ringbuilder/*` | Storefront still allowed (`woocommerce_coming_soon_exclude`) |
| WC-13 | P2 | API | REST cart endpoints | Exercise `/addToCart`, `/addRing`, `/cartadd/{id}`, `/cartaddsetting/{id}`, `/completePurchase/{d}/{s}` + `/api/` aliases | Success with nonce; fail without |
| WC-14 | P2 | Functional | SKU length | Very long diamond/setting id | SKU sanitized, max 60 chars |

---

## 13. Print & PDF

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| PDF-01 | P0 | Functional | Diamond print | Trigger print diamond | Dompdf/HTML; layout from `diamond-print-page.php`; no-cache headers |
| PDF-02 | P0 | Functional | Complete ring print | Print complete | `complete-ring-print-page.php` content correct |
| PDF-03 | P1 | Functional | Certificate PDF | Open certificate | Valid PDF; lab/natural flag respected |
| PDF-04 | P1 | Negative | Missing item | Print unknown id | 404 WP_Error message |
| PDF-05 | P2 | UI | Print CSS | Check print stylesheet | `gemfindrb-diamond-print.css` applied; readable layout |
| PDF-06 | P2 | Functional | Toggle off | `enable_print` off | Print CTAs hidden |

---

## 14. Virtual try-on

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| TO-01 | P1 | Functional | Try-on visible | `display_tryon` on + eligible product | Camweara entry loads |
| TO-02 | P1 | Functional | Camera permission | Allow camera | Try-on works; Permissions-Policy allows camera |
| TO-03 | P2 | Negative | Deny camera | Block camera | Graceful message |
| TO-04 | P2 | Functional | Toggle off | `display_tryon` off | No try-on UI |

---

## 15. REST API & JewelCloud proxy

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| API-01 | P0 | API | reactconfig | `GET /wp-json/gemfind-ring-builder/v1/reactconfig` with nonce | Config JSON for storefront |
| API-02 | P1 | API | CSS style | `GET .../reactconfig/getcssStyle` | CSS vars/styles |
| API-03 | P1 | API | Diamond detail | `GetDiamondDetail?DID=&IsLabGrown=` | Detail payload |
| API-04 | P1 | API | Mounting detail | `GetMountingDetail?SID=` | Detail payload |
| API-05 | P1 | API | Plan check | `GET .../billing/check-active-plan` | `active: true` on WP |
| API-06 | P0 | API | jcProxy allowlist | Call allowlisted endpoint e.g. `GetFilters` | Proxied success with dealer |
| API-07 | P0 | Security | jcProxy deny | Call non-allowlisted endpoint name | Rejected |
| API-08 | P1 | API | jcVideoProxy | Request video proxy URL | Streams/returns without CORS error in app |
| API-09 | P1 | Security | Admin POST shop | `POST /shop/configuration` as subscriber | Denied |
| API-10 | P1 | Security | Admin POST as admin | Save shop/CSS/SMTP as admin | Succeeds |
| API-11 | P2 | API | Customer register | `POST /customer/register` with name/email/phone | Creates/updates `ringbuilder_customer` when used |
| API-12 | P2 | API | Check registration | `GET /customer/check-registration` | Accurate registered flag |
| API-13 | P1 | Functional | Browser rewrite | In Network tab while browsing | Browser does not call `api.jewelcloud.com` directly; uses `jcProxy` + nonce |
| API-14 | P2 | API | `/api/` aliases | Hit v1-style `/api/addToCart` etc. | Same as primary routes |

---

## 16. Assets, CSS isolation, performance

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| AS-01 | P0 | Functional | Assets only on tool pages | Visit homepage without shortcode | Ring Builder frontend JS/CSS **not** loaded |
| AS-02 | P0 | Functional | Assets on tool page | Visit `/ringbuilder/settings/` | Overrides + frontend bundle + dynamic CSS present |
| AS-03 | P1 | Functional | v1 extras | tool_version 1.0 | nouislider + v1 patches present |
| AS-04 | P1 | UI | Theme conflict smoke | Aggressive theme typography on tool page | Tool layout intact; theme header/footer still themed |
| AS-05 | P2 | Perf | List load | Load settings/diamonds with network throttle | No endless spinner; errors if timeout |
| AS-06 | P2 | Functional | Cache bust | Save CSS → hard reload without hard purge | New styles apply via revision |

---

## 17. Templates & full-width layout

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| TPL-01 | P1 | Functional | Full-width template | Ring Builder page uses **GemFind Ring Builder (full width)** | Body class `gemfind-full-width-layout`; content full bleed |
| TPL-02 | P2 | Functional | Template without assignment | Assign default theme template to a shortcode page | Tool still works; may be constrained by theme |
| TPL-03 | P2 | UI | Theme chrome | Full-width page | Header/footer per template design; tool usable |

---

## 18. Error, empty, and gate states

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| ERR-01 | P0 | Negative | No dealer ID | Clear dealer → browse | Clear inventory/config error |
| ERR-02 | P1 | Negative | JC API down | Simulate JC failure (bad URL / block host) | User-facing error; no WSOD |
| ERR-03 | P1 | Negative | Empty inventory | Filters that return zero | Empty state message |
| ERR-04 | P2 | UI | Activation modal | If plan inactive (mock if possible) | Activation Required modal |
| ERR-05 | P2 | Functional | Merchant registration gate | Enable `gemfindRB_admin_require_merchant_registration` | Admin blocked until register |
| ERR-06 | P1 | Negative | SSL verify | Default `gemfindRB_http_sslverify` true | Outbound HTTPS validates (filter documented for local only) |

---

## 19. Security & permissions

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| SEC-01 | P0 | Security | REST without nonce | Mutating storefront POST without nonce | Rejected |
| SEC-02 | P0 | Security | Privilege escalation | Non-admin cannot POST shop/CSS/SMTP | 401/403 |
| SEC-03 | P1 | Security | XSS in forms | Submit `<script>` in name/message fields | Escaped in emails/HTML; not executed |
| SEC-04 | P1 | Security | XSS in announcement | Admin announcement with HTML/script | Safely rendered or stripped per design |
| SEC-05 | P2 | Security | Open redirect | Email links / return URLs | Only trusted/site URLs |
| SEC-06 | P2 | Security | Sensitive SMTP | GET SMTP config as non-admin | Denied; password not exposed to storefront |

---

## 20. Compatibility & environment

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| CMP-01 | P1 | Regression | With Diamond Link plugin | Both GemFind plugins active | No shortcode/REST/menu clash; both tools work |
| CMP-02 | P1 | Regression | Caching plugin | Enable common page cache | SPA routes and REST still work (nonce/cookies) |
| CMP-03 | P2 | Compatibility | Multisite | Activate on one site (if available) | Shop key = that site host; isolated config |
| CMP-04 | P2 | Compatibility | HTTP vs HTTPS | Site on HTTPS | Mixed-content free; JC/Camweara OK |
| CMP-05 | P1 | UI | Mobile | iPhone/Android widths | Filters, PDP, cart CTAs usable |
| CMP-06 | P2 | UI | Browser matrix | Chrome, Firefox, Safari, Edge | Core flows pass |
| CMP-07 | P3 | Compatibility | PHP 8.1 vs 8.x | Run on 8.1 and current 8.x | No deprecations fatals |

---

## 21. Localization & content

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| I18N-01 | P3 | Functional | Text domain | Spot-check admin strings | Domain `gemfind-ring-builder` |
| I18N-02 | P2 | Functional | Special chars | Product titles with `&`, quotes, unicode | Display/email/cart correct |
| I18N-03 | P2 | Functional | Currency/price format | Various price magnitudes | Formatted consistently |

---

## 22. Build & developer smoke (optional for QA)

| ID | Priority | Type | Title | Steps | Expected |
|----|----------|------|-------|-------|----------|
| BLD-01 | P2 | Functional | Full build | `npm run build` from plugin root | admin + v2 + v1 outputs exist at enqueue paths |
| BLD-02 | P3 | Functional | Package ZIP | `npm run package` | ZIP produced; installs cleanly |

---

## 23. End-to-end smoke suites (run every release)

### Smoke A — Happy path v2 + WooCommerce (P0)

1. Activate plugin; confirm pages.  
2. Set Dealer ID; tool_version **2.0**; save.  
3. Open `/ringbuilder/settings/` → filter → open setting PDP.  
4. Continue to diamonds → select diamond → complete ring.  
5. Add complete ring to cart → checkout → place order → verify order meta.  
6. Submit one engagement form (e.g. Request More Info).  
7. Print diamond PDF once.

### Smoke B — v1 parity (P0)

1. Switch tool_version **1.0** (or shortcode `version="1.0"`).  
2. Settings list + diamond list + one PDP.  
3. Complete ring + add to cart.  
4. Confirm nouislider filters work.

### Smoke C — Negatives (P1)

1. Empty dealer ID.  
2. WooCommerce off + add to cart.  
3. Form validation failures.  
4. Legacy `/apps/ringbuilder/` redirect.  
5. Feature toggles hide CTAs.

---

## 24. Traceability — features → case IDs

| Feature area | Case ID prefixes |
|--------------|------------------|
| Install / DB / pages | INST-* |
| Admin UI | ADM-* |
| Settings General/Display/Email/SEO/Advanced | SET-* |
| CSS themes | CSS-* |
| Shortcodes | SC-* |
| Routing / redirects | RT-* |
| Settings browse/PDP | RB-* |
| Diamonds / compare | DL-* |
| Complete ring | CR-* |
| Emails / forms | EM-* |
| WooCommerce | WC-* |
| Print / PDF | PDF-* |
| Try-on | TO-* |
| REST / JC proxy | API-* |
| Assets / CSS load | AS-* |
| Templates | TPL-* |
| Errors / gates | ERR-* |
| Security | SEC-* |
| Compatibility | CMP-* |
| i18n | I18N-* |
| Build | BLD-* |

---

## 25. Suggested test data checklist

- [ ] Valid JewelCloud Dealer ID with settings + natural + lab + fancy inventory  
- [ ] At least one setting with multiple metals/sizes and images  
- [ ] At least one diamond with certificate  
- [ ] WooCommerce payments in test mode  
- [ ] Mail catcher (Mailhog / Mailpit / WP Mail Logging)  
- [ ] Admin + shopper (+ optional Editor) users  
- [ ] reCAPTCHA test keys (optional)  
- [ ] Camweara-capable browser for try-on  

---

*Generated for GemFind Ring Builder QA. Update this file when settings, routes, or REST contracts change.*
