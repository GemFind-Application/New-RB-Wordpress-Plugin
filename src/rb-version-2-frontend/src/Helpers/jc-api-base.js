function wpConfig() {
  return typeof window !== "undefined" ? window.gemfindRBConfig : null;
}

function shopifyConfig() {
  return typeof window !== "undefined" ? window.gemfindRBShopify : null;
}

function legacyBaseFromDealerAuth(dealerAuthApi) {
  const url = String(dealerAuthApi || "");
  const index = url.indexOf(".com");
  if (index !== -1) {
    return `${url.substring(0, index + 4)}/api/RingBuilder`;
  }
  return url.replace(/\/AccountAuthentication\/?$/, "").replace(/\/$/, "");
}

/**
 * JewelCloud RingBuilder API base — WordPress jcProxy when embedded (Diamond Link pattern).
 */
export function resolveJcApiBase(configData) {
  const wp = wpConfig();
  if (wp?.jcProxyUrl) {
    return String(wp.jcProxyUrl).replace(/\/$/, "");
  }
  if (wp?.restUrl) {
    return `${String(wp.restUrl).replace(/\/$/, "")}/jcProxy`;
  }

  const shopify = shopifyConfig();
  if (shopify?.jc_api_url) {
    return String(shopify.jc_api_url).replace(/\/$/, "");
  }

  const data = configData || {};
  if (data.jc_api_url) {
    return String(data.jc_api_url).replace(/\/$/, "");
  }
  if (data.dealerauthapi) {
    return legacyBaseFromDealerAuth(data.dealerauthapi);
  }

  const env = import.meta.env.VITE_APP_API_URL;
  if (env && !String(env).includes("jewelcloud.com")) {
    return String(env).replace(/\/$/, "");
  }

  return "/wp-json/gemfind-ring-builder/v1/jcProxy";
}

/**
 * JewelCloud video URL API base — WordPress jcVideoProxy when embedded.
 */
export function resolveJcVideoBase(configData) {
  const wp = wpConfig();
  if (wp?.jcVideoUrl) {
    return String(wp.jcVideoUrl).replace(/\?$/, "").replace(/\/$/, "");
  }
  if (wp?.restUrl) {
    return `${String(wp.restUrl).replace(/\/$/, "")}/jcVideoProxy`;
  }

  const shopify = shopifyConfig();
  if (shopify?.jc_video_url) {
    return String(shopify.jc_video_url).replace(/\?$/, "").replace(/\/$/, "");
  }

  const data = configData || {};
  const raw = data.videoapi || data.getvideoapi || import.meta.env.VITE_APP_API_VIDEOURL || "";
  if (raw && !String(raw).includes("jewelcloud.com")) {
    return String(raw).replace(/\?$/, "").replace(/\/$/, "");
  }
  if (raw) {
    return String(raw).replace(/\?$/, "").replace(/\/$/, "");
  }

  return "/wp-json/gemfind-ring-builder/v1/jcVideoProxy";
}
