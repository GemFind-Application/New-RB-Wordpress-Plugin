/**
 * WordPress runtime environment for the classic (v1) Ring Builder storefront.
 *
 * Everything the storefront needs from its host comes from `window.gemfindRBConfig`,
 * localized by GEMFINDRB_Shortcode::do_enqueue() (PHP). Nothing here is resolved at
 * build time, so one bundle works on any WordPress install / subdirectory.
 */

const JC_DIRECT_BASE = 'https://api.jewelcloud.com/api/RingBuilder';
const JC_DIRECT_VIDEO = 'https://api.jewelcloud.com/api/jewelry/GetVideoUrl?';

const trimSlash = (value) => String(value || '').replace(/\/+$/, '');

export const wpConfig = () => window.gemfindRBConfig || {};

/** Storefront route prefix, e.g. "/ringbuilder" or "/shop/ringbuilder" for subdirectory installs. */
export const RB_BASE = trimSlash(wpConfig().routerBasename) || '/ringbuilder';

/** Plugin REST namespace base: https://example.com/wp-json/gemfind-ring-builder/v1 */
export const apiBase = () => trimSlash(wpConfig().restUrl) || `${window.location.origin}/wp-json/gemfind-ring-builder/v1`;

/**
 * Join a REST path onto apiBase(). Works with pretty permalinks (/wp-json/...) and with
 * plain permalinks (?rest_route=/...), where the path's own "?" must become "&".
 */
export const apiUrl = (path = '') => {
    const base = apiBase();
    const rel = String(path);
    const joined = base + (rel && !rel.startsWith('/') ? '/' : '') + rel;
    if (base.includes('?')) {
        const first = joined.indexOf('?');
        return joined.slice(0, first + 1) + joined.slice(first + 1).replace('?', '&');
    }
    return joined;
};

export const restNonce = () => wpConfig().nonce || '';

/** Headers every plugin REST call must carry (WordPress cookie auth). */
export const nonceHeaders = () => (restNonce() ? { 'X-WP-Nonce': restNonce() } : {});

/**
 * fetch() that adds the REST nonce to plugin API calls (jcProxy, jcVideoProxy, …).
 * Other URLs pass through unchanged.
 */
export const wpFetch = (url, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (String(url).includes('/gemfind-ring-builder/v1') && restNonce() && !headers.has('X-WP-Nonce')) {
        headers.set('X-WP-Nonce', restNonce());
    }
    return fetch(url, { ...options, headers });
};

/** Query-string suffix for plain-link navigations (PDF downloads) that cannot send headers. */
export const nonceQuery = (url) => {
    const nonce = restNonce();
    if (!nonce) return url;
    return `${url}${url.includes('?') ? '&' : '?'}_wpnonce=${encodeURIComponent(nonce)}`;
};

/**
 * axios request interceptor: resolves relative URLs via apiUrl() and adds the REST nonce.
 * Use on axios instances created without a baseURL.
 */
export const wpAxiosInterceptor = (config) => {
    if (config.url && !/^https?:\/\//i.test(config.url)) {
        config.url = apiUrl(config.url);
    }
    config.headers = { ...nonceHeaders(), ...(config.headers || {}) };
    return config;
};

/** JewelCloud RingBuilder API, proxied through WordPress REST (no CORS, no dealer secrets in browser). */
export const jcBase = () => trimSlash(wpConfig().jcProxyUrl) || JC_DIRECT_BASE;

/** JewelCloud jewelry video lookup (expects query string appended, e.g. `InventoryID=...`). */
export const jcVideoUrl = () => {
    const proxied = trimSlash(wpConfig().jcVideoUrl);
    return proxied ? `${proxied}?` : JC_DIRECT_VIDEO;
};

/** Shop key used by the plugin REST API (hostname of the WordPress site). */
export const shopDomain = () =>
    wpConfig().shop
    || document.getElementById('shop_domain')?.value
    || window.initData?.data?.[0]?.shop
    || window.location.hostname;

/** WooCommerce cart page (fallback when an API response carries no URL). */
export const cartPageUrl = () => wpConfig().cartUrl || `${trimSlash(wpConfig().siteUrl) || window.location.origin}/cart/`;

/** Absolute URL for a storefront route, e.g. rbUrl('/settings'). */
export const rbUrl = (path = '') => `${window.location.origin}${RB_BASE}${path}`;
