const TRACKING_BASE = 'https://apps-api.jewelcloud.com/api';
const DEDUPE_MS = 3000;

const IP_LOOKUP_URL = 'https://api.ipify.org?format=json';
const IP_STORAGE_KEY = 'gemfindrb_visitor_ip';
const IP_LOOKUP_TIMEOUT_MS = 3000;

let lastSent = { key: '', at: 0 };
let visitorIpPromise = null;

/** Public visitor IP (the browser cannot read its own), looked up once per session. */
function getVisitorIp() {
  if (visitorIpPromise) return visitorIpPromise;
  try {
    const cached = window.sessionStorage.getItem(IP_STORAGE_KEY);
    if (cached) return (visitorIpPromise = Promise.resolve(cached));
  } catch (_e) {
    /* storage blocked — fall through to lookup */
  }
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), IP_LOOKUP_TIMEOUT_MS) : null;
  visitorIpPromise = fetch(IP_LOOKUP_URL, controller ? { signal: controller.signal } : {})
    .then((res) => (res.ok ? res.json() : {}))
    .then((data) => {
      const ip = typeof data?.ip === 'string' ? data.ip : '';
      if (ip) {
        try {
          window.sessionStorage.setItem(IP_STORAGE_KEY, ip);
        } catch (_e) {
          /* ignore */
        }
      }
      return ip;
    })
    .catch(() => {
      visitorIpPromise = null; // retry on the next view
      return '';
    })
    .finally(() => timer && clearTimeout(timer));
  return visitorIpPromise;
}

function formatPrice(value) {
  const num = Number(String(value ?? '').replace(/[^0-9.\-]/g, ''));
  return value !== null && value !== undefined && value !== '' && Number.isFinite(num) ? num.toFixed(2) : '';
}

function sendTracking(path, params) {
  // Detail pages can re-fetch the same product on mount + route effects; count one view.
  const key = `${path}:${params.DInventoryID || params.GFInventoryID}`;
  const now = Date.now();
  if (lastSent.key === key && now - lastSent.at < DEDUPE_MS) return;
  lastSent = { key, at: now };

  // Fire-and-forget: tracking must never block or break the detail page.
  getVisitorIp()
    .then((ip) => {
      const query = new URLSearchParams({
        ...params,
        URL: window.location.origin,
        UsersIPAddress: ip,
      });
      return fetch(`${TRACKING_BASE}/${path}?${query.toString()}`, { method: 'GET' });
    })
    .catch((error) => {
      console.error('JewelCloud tracking failed:', error);
    });
}

// JewelCloud detail responses swap the two IDs: `vendorID`/`vendorId` holds the retailer,
// `retailerInfo.retailerID` holds the vendor.

/** Diamond detail view → DiamondLink/DiamondTracking. */
export function trackDiamondView(diamond, dealerId) {
  if (!diamond?.diamondId || !dealerId) return;
  sendTracking('DiamondLink/DiamondTracking', {
    RetailerID: String(diamond.vendorID || dealerId),
    VendorID: String(diamond.retailerInfo?.retailerID || ''),
    DInventoryID: String(diamond.diamondId),
    Price: formatPrice(diamond.fltPrice ?? diamond.price),
  });
}

/** Ring setting detail view → RingBuilder/ProductTracking. */
export function trackSettingView(setting, dealerId) {
  if (!setting?.settingId || !dealerId) return;
  sendTracking('RingBuilder/ProductTracking', {
    RetailerID: String(setting.vendorId || dealerId),
    VendorID: String(setting.retailerInfo?.retailerID || ''),
    GFInventoryID: String(setting.settingId),
    Price: formatPrice(setting.cost),
  });
}
