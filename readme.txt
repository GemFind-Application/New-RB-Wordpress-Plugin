=== GemFind Ring Builder ===
Contributors: gemfind
Tags: jewelry, diamonds, woocommerce, ecommerce, engagement
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 8.1
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed GemFind Ring Builder on WordPress with a shortcode, JewelCloud inventory, admin settings, and optional WooCommerce cart.

== Description ==

**GemFind Ring Builder** brings GemFind's ring-building experience to WordPress. Jewelers can let visitors browse ring settings, search natural, lab-grown, and fancy-color diamonds, pair a diamond with a setting, complete the ring, print or export PDFs, and use engagement tools such as Drop a Hint, Email a Friend, Schedule a Viewing, and Request More Info.

= Features =

* React-powered storefront (classic v1 or modern v2 UI)
* Shortcode: `[gemfindRB_ring_builder]` with optional `version="1"` or `version="2"`
* WordPress admin: settings, CSS configurator, and onboarding help
* REST API for the storefront and admin UI
* Server-side proxy to JewelCloud APIs (avoids browser CORS issues)
* Optional **WooCommerce** add-to-cart for diamonds, settings, and complete rings
* PDF print export (Dompdf)
* Full-width page template for a clean storefront layout
* SEO-friendly path routing under `/ringbuilder/` (settings browse, diamond search, complete ring)

= Requirements =

* WordPress 6.3+
* PHP 8.1+
* A **GemFind / JewelCloud dealer account** and Dealer ID (contact GemFind support)
* WooCommerce is optional (only needed for cart checkout flows)

= Shortcode =

Place on any page or use the page created on activation:

`[gemfindRB_ring_builder]`

Force a specific UI version:

`[gemfindRB_ring_builder version="2"]`
`[gemfindRB_ring_builder version="1"]`

= Support =

For dealer setup and JewelCloud Account ID, contact GemFind at [support@gemfind.com](mailto:support@gemfind.com) or visit [gemfind.com](https://gemfind.com).

**Source code (Guideline 4):** compiled JavaScript/CSS ships in this plugin. The unminified React/JSX source is **not** included in the WordPress.org ZIP. It is maintained in a public GitHub repository — see **Source code and build instructions** below.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/` or install the ZIP via **Plugins -> Add New -> Upload**.
2. Activate **GemFind Ring Builder** through the **Plugins** menu.
3. Go to **GemFind Ring Builder -> Settings** and enter your JewelCloud Account ID (Dealer ID) and admin email.
4. Open the Ring Builder page (created on install at `/ringbuilder/`) or add `[gemfindRB_ring_builder]` to a page using the **GemFind Ring Builder (full width)** template if desired.
5. Shoppers browse mountings at `/ringbuilder/settings/` and diamonds at `/ringbuilder/diamondlink/`.
6. Pre-built JavaScript bundles are included under `public/` (storefront) and `assets/build/` (admin). If you develop from source, run `npm run build` in the plugin directory before deploying.

== Source code and build instructions ==

This WordPress.org package contains compiled production bundles only (smaller download):

* `assets/build/admin.js` — wp-admin React UI
* `public/frontpublic/build/assets/frontend.js` — storefront v2
* `public/static/js/frontend-v1.js` — storefront v1 (classic)

Unminified source (React/JSX, Vite configs, and build scripts) is **not** in this ZIP. It is publicly available here:

https://github.com/GemFind-Application/New-RB-Wordpress-Plugin

Source folders in that repository:

* `src/admin-frontend/` — admin UI
* `public/frontpublic/src/` — storefront v2
* `src/rb-version-1-frontend/` — storefront v1 (when present)
* `scripts/` — `npm run build` orchestration

= Build steps =

1. Clone the public repository above.
2. `composer install --no-dev`
3. `npm install` and `npm run install:all`
4. `npm run build` (admin, then v2, then v1)

The WordPress.org ZIP is produced with `npm run package`, which copies runtime PHP, vendor, compiled assets, and `readme.txt` only. Under `public/` it includes only the v2 build (`public/frontpublic/build/`) and the v1 build (`public/static/`). It does not copy React source, `node_modules`, or other `public/` files.

== Frequently Asked Questions ==

= Do I need a GemFind account? =

Yes. Live ring settings and diamond inventory are loaded from JewelCloud using your dealer credentials. GemFind support provides your Account ID.

= Does this work without WooCommerce? =

Yes. Browsing settings and diamonds, pairing a complete ring, email actions, and print work without WooCommerce. Add-to-cart requires WooCommerce to be installed and active.

= What is the difference between v1 and v2? =

v2 is the current Ring Builder experience (default). v1 is the classic UI for sites that still rely on the older layout. Choose the default under **Settings -> Frontend experience**, or override per page with the shortcode `version` attribute.

= What data is sent to external servers? =

This plugin requires JewelCloud for live ring and diamond inventory and optionally connects to other third-party services (analytics, spam protection, social widgets, virtual try-on, webfonts). See the **External services** section below for what each service is used for, what data is sent, when calls happen, and links to each provider's terms of service and privacy policy.

== Screenshots ==

1. Ring settings listing on the storefront
2. Setting detail page with metal and size options
3. Diamond search and listing
4. Complete ring page with total price
5. GemFind Ring Builder settings in wp-admin
6. CSS configurator

== External services ==

This plugin connects to third-party and external services. JewelCloud is **required** for live ring settings and diamond inventory. Other services below are optional or only used when a merchant enables the related feature. The policy links below were verified at the time of this release.

= 1. JewelCloud API (api.jewelcloud.com) =

* **What it is and what it's used for.** JewelCloud is GemFind Digital Solutions' jewelry inventory platform. The plugin loads live catalog data for ring settings and diamonds: filters, search results, mounting lists, detail pages, navigation, dealer authentication, jewelry video URLs, and JC options. Browser requests are proxied through the WordPress REST API (`gemfind-ring-builder/v1/jcProxy/*` and `/jcVideoProxy`) to avoid CORS issues. PHP also calls `https://api.jewelcloud.com` directly for activation defaults, email detail lookups, and server-side diamond/setting resolution. Endpoints used include: `AccountAuthentication`, `GetNavigation`, `GetRBNavigation`, `GetFilters`, `GetMountingList`, `GetMountingDetail`, `GetStyleSetting`, `GetDiamondFilter`, `GetColorDiamondFilter`, `GetDiamond`, `GetColorDiamond`, `GetShapeByColorFilter`, `GetDiamondDetail`, `GetDiamondsJCOptions`, `GetInitialFilter`, `ProductTracking`, and `api/jewelry/GetVideoUrl`.
* **What data is sent and when.** The merchant's JewelCloud Dealer ID (saved in plugin settings) is sent on every call. Filter and search query parameters (shape, carat range, metal, colour, clarity, etc.) are sent when the storefront loads or the visitor changes filters. Setting IDs and diamond inventory IDs are sent when a visitor opens a detail page, requests a video URL, or uses WooCommerce add-to-cart. If the merchant enables AccountAuthentication, the configured dealer password is also sent once during plugin initialisation. The plugin does not intentionally send visitor name, email, or phone number to JewelCloud inventory APIs.
* **Terms of service.** https://gemfind.com/pages/terms-of-service — please refer to GemFind for Terms of Service, as JewelCloud is operated by GemFind Digital Solutions.
* **Privacy policy.** https://www.jewelcloud.com/policies/privacy-policy

JewelCloud is operated by GemFind Digital Solutions. GemFind's Terms of Service define the GemFind Network as including `www.jewelcloud.com`. Use the GemFind Terms link above for contractual terms; use the JewelCloud privacy policy link above for JewelCloud data-handling practices.

= 2. JewelCloud diamond and product view tracking (apps-api.jewelcloud.com) =

* **What it is and what it's used for.** GemFind/JewelCloud analytics endpoints that record when a visitor views a diamond detail page or a ring setting detail page in the storefront (v1 and v2).
* **What data is sent and when.** Dealer ID, vendor/retailer ID, diamond or setting inventory ID, the site's origin URL, and price. Diamond views are sent as a GET to `https://apps-api.jewelcloud.com/api/DiamondLink/DiamondTracking`. Setting views are sent through the WordPress `jcProxy` to JewelCloud `ProductTracking` (`https://api.jewelcloud.com/api/RingBuilder/ProductTracking`). Sent once per detail page load after details are loaded. The plugin does not look up or send the visitor's IP address.
* **Terms of service.** https://gemfind.com/pages/terms-of-service — please refer to GemFind for Terms of Service, as JewelCloud is operated by GemFind Digital Solutions.
* **Privacy policy.** https://www.jewelcloud.com/policies/privacy-policy

= 3. Facebook (facebook.com) =

* **What it is and what it's used for.** Optional Facebook Share and Like on diamond and setting detail pages when the merchant enables "Show Facebook Share" or "Show Facebook Like" in plugin settings. The storefront opens `facebook.com/sharer/sharer.php` or `facebook.com/plugins/like.php` in a new tab. No Facebook SDK is loaded.
* **What data is sent and when.** The current page URL is passed in the share/like link when the visitor clicks. Sent only when the related setting is enabled and the visitor clicks Share or Like. The plugin does not send visitor form data to Facebook.
* **Terms of service.** https://www.facebook.com/terms.php
* **Privacy policy.** https://www.facebook.com/privacy/policy

= 4. Google reCAPTCHA =

* **What it is and what it's used for.** Optional spam protection on storefront contact forms (Drop a Hint, Email a Friend, Schedule a Viewing, Request More Info). Loaded only when the merchant configures a reCAPTCHA Site Key in plugin settings (scripts from Google).
* **What data is sent and when.** Standard reCAPTCHA telemetry (browser/device signals, IP address, interaction data) is sent to Google when a visitor submits a protected form. With no Site Key configured, the plugin makes no calls to Google reCAPTCHA. The plugin does not store this data; Google does.
* **Terms of service.** https://policies.google.com/terms
* **Privacy policy.** https://policies.google.com/privacy

= 5. Camweara virtual try-on (cdn.camweara.com) =

* **What it is and what it's used for.** Optional virtual try-on experience (iframe) provided by Modaka Technologies (Camweara) when the merchant enables try-on in plugin settings (`display_tryon`). The iframe is loaded from `https://cdn.camweara.com` (ring SKU try-on at `/gemfind/index_client.php` and diamond try-on at `/camweara_diamond/`). The plugin also sends a Permissions-Policy header so the Camweara iframe may use the camera on Ring Builder storefront pages.
* **What data is sent and when.** Diamond or setting identifiers embedded in the iframe URL (carat, shape, SKU/stock number, company name). Sent only when the visitor opens the try-on feature on a diamond, setting, or complete-ring page and try-on is enabled in settings. No visitor name, email, or message content is sent by the plugin to Camweara.
* Terms of service. At the time of release, Camweara does not publish a separate Terms of Service page. Please
contact Camweara directly for any contractual terms applicable to your account.
* Contact: https://camweara.com/contact-us/
* **Privacy policy.** https://www.camweara.com/privacy-policy

Use of GemFind Ring Builder (including the optional Camweara try-on integration) is governed by GemFind Terms of Service. Camweara is operated by Modaka Technologies; data handling for the try-on iframe is described in Camweara's privacy policy. Modaka Technologies does not publish a separate public Terms of Service URL for Camweara — merchant contractual terms are provided when subscribing to Camweara (contact info@modakatech.com).

= 6. Optional: Social share links (pinterest.com, twitter.com — user-initiated) =

* **What it is and what it's used for.** Optional share icons on diamond and setting detail pages. When a visitor clicks a share icon, the browser opens a Pinterest or Twitter/X share URL with the current page address. No SDK is loaded and no request is made until the visitor clicks.
* **What data is sent and when.** Only the current page URL is passed in the share link when the visitor clicks Pinterest or Twitter/X share. No visitor name, email, or form data is sent by the plugin.
* **Terms of service (Pinterest).** https://policy.pinterest.com/en/terms-of-service
* **Privacy policy (Pinterest).** https://policy.pinterest.com/en/privacy-policy
* **Terms of service (Twitter/X).** https://twitter.com/en/tos
* **Privacy policy (Twitter/X).** https://twitter.com/en/privacy

= 7. Google Fonts (fonts.googleapis.com, fonts.gstatic.com) =

* **What it is and what it's used for.** Webfonts used by the Ring Builder storefront. Default families (Lato for classic v1; Manrope, Libre Baskerville, and Inter for v2) are loaded with WordPress `wp_enqueue_style()`. The v2 storefront may also load a merchant-selected Google Font from the CSS configurator (`font_family` / `theme_font_family`). Font Awesome icons for classic v1 are bundled locally in the plugin (`assets/vendor/fontawesome/`); they are not loaded from a CDN.
* **What data is sent and when.** The visitor's browser requests stylesheet and font files from Google Fonts when a Ring Builder storefront page loads, or when a custom Google Font is applied from settings. Google may receive the visitor's IP address and standard browser request headers. The plugin does not send visitor name, email, or form data to Google Fonts.
* **Terms of service.** https://policies.google.com/terms
* **Privacy policy.** https://policies.google.com/privacy

= 8. YouTube and Vimeo (jewelry videos) =

* **What they are and what they are used for.** When JewelCloud `GetVideoUrl` returns a YouTube or Vimeo URL for a diamond or setting, the storefront may embed that video (YouTube nocookie / Vimeo player). This is part of showing inventory media from JewelCloud, not a standalone advertising pixel.
* **What data is sent and when.** The video ID/URL from JewelCloud is loaded in an iframe or player only when the visitor opens a video on a detail page. YouTube or Vimeo may receive the visitor's IP address and standard browser request headers. No visitor form data is sent by the plugin.
* **Terms of service (YouTube).** https://www.youtube.com/t/terms
* **Privacy policy (YouTube).** https://policies.google.com/privacy
* **Terms of service (Vimeo).** https://vimeo.com/terms
* **Privacy policy (Vimeo).** https://vimeo.com/privacy

== Privacy policy ==

Sites using this plugin should disclose in their privacy policy that:

* Visitor ring and diamond search and inventory requests are processed through the JewelCloud API (`api.jewelcloud.com`), operated by GemFind Digital Solutions.
* When a visitor views a diamond or setting detail page, the storefront may send a tracking ping to JewelCloud (`apps-api.jewelcloud.com` and/or `api.jewelcloud.com` ProductTracking) with dealer ID, inventory ID, site URL, and price.
* Email addresses and messages submitted through Drop a Hint, Email a Friend, Schedule a Viewing, or Request More Info are sent to the jeweler's configured admin email address using either the WordPress mailer or the SMTP credentials saved in the plugin.
* If the merchant configures a reCAPTCHA Site Key, Google reCAPTCHA collects browser and device signals on protected forms.
* If the merchant enables Facebook Share or Like, Meta/Facebook may receive the page URL when the visitor clicks those links.
* If visitors use social share icons, Pinterest or Twitter/X may receive the page URL per their policies (see "External services" #6 above).
* If the merchant enables virtual try-on, Camweara (`cdn.camweara.com`) loads in an iframe with product identifiers in the URL.
* If JewelCloud provides a YouTube or Vimeo video URL, that host may load when the visitor plays the video.
* The storefront loads webfonts from Google Fonts (`fonts.googleapis.com`). Classic v1 Font Awesome icons are bundled in the plugin and are not loaded from a CDN.
* WooCommerce, if used, applies its own checkout and customer data policies.

== Changelog ==

= 1.0.0 =
* Initial 1.0.0 release for WordPress.org Plugin Directory.
* WordPress.org review: completed External services documentation with verified Terms/Privacy links for JewelCloud, Facebook, Google reCAPTCHA, Camweara, Pinterest/Twitter share links, Google Fonts, and YouTube/Vimeo.
* Expanded JewelCloud API endpoint list and clarified GemFind as the legal operator of JewelCloud.
* Ring Builder storefront with settings browse, diamond search, complete-ring flow, and optional WooCommerce cart.
