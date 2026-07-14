import { fetchWrapper } from '../Helpers';

function getRestBase() {
  if (typeof window !== 'undefined' && window.gemfindRBConfig?.restUrl) {
    return String(window.gemfindRBConfig.restUrl).replace(/\/$/, '');
  }
  return String(import.meta.env.VITE_APP_FORM_API_URL || '/wp-json/gemfind-ring-builder/v1').replace(/\/$/, '');
}

export function isShopifyStorefront() {
  return typeof window !== 'undefined' && Boolean(window.Shopify?.shop);
}

export function resolveDiamondListType(diamondDetail, isLabGrown) {
  if (isLabGrown === true || isLabGrown === 'labcreated') {
    return 'labcreated';
  }
  if (isLabGrown === 'fancy' || isLabGrown === 'fancydiamonds') {
    return 'fancydiamonds';
  }
  if (diamondDetail?.isLabCreated === true || diamondDetail?.isLabCreated === 'true') {
    return 'labcreated';
  }
  if (
    diamondDetail?.isfancy === true ||
    diamondDetail?.isfancy === 'true' ||
    (diamondDetail?.fancyColorIntensity && diamondDetail.fancyColorIntensity !== '') ||
    (diamondDetail?.fancyColor && diamondDetail.fancyColor !== '')
  ) {
    return 'fancydiamonds';
  }
  return 'mined';
}

function resolveIsLabFlag(isLabGrown, listType) {
  if (listType === 'labcreated') {
    return true;
  }
  if (listType === 'fancydiamonds') {
    return 'fancy';
  }
  if (isLabGrown === true || isLabGrown === 'labcreated') {
    return true;
  }
  if (isLabGrown === 'fancy' || isLabGrown === 'fancydiamonds') {
    return 'fancy';
  }
  return false;
}

export function parseCartUrlResponse(data) {
  if (typeof data === 'string') {
    const trimmed = data.trim();
    return trimmed !== '' ? trimmed : null;
  }
  if (data && typeof data === 'object') {
    if (typeof data.cart_url === 'string' && data.cart_url.trim() !== '') {
      return data.cart_url.trim();
    }
    if (typeof data.url === 'string' && data.url.trim() !== '') {
      return data.url.trim();
    }
    if (typeof data.data === 'string' && data.data.trim() !== '') {
      return data.data.trim();
    }
    if (typeof data.message === 'string' && /^https?:\/\//i.test(data.message)) {
      return data.message.trim();
    }
  }
  return null;
}

export function redirectToCartUrl(url) {
  const target = String(url || '').trim();
  if (target === '') {
    return false;
  }
  if (/^https?:\/\//i.test(target)) {
    window.location.href = target;
    return true;
  }
  if (target.startsWith('//')) {
    window.location.href = `${window.location.protocol}${target}`;
    return true;
  }
  if (target.startsWith('/')) {
    window.location.href = `${window.location.origin}${target}`;
    return true;
  }
  if (target.startsWith('?')) {
    window.location.href = `${window.location.origin}${window.location.pathname}${target}`;
    return true;
  }
  try {
    window.location.href = new URL(target, window.location.href).href;
    return true;
  } catch (_error) {
    return false;
  }
}

async function addDiamondToCartShopify(diamondDetail, configAppData) {
  const shopDomain = window.Shopify?.shop || configAppData?.shop || window.location.hostname;
  const diamondType = diamondDetail.isLabCreated ? 'labcreated' : 'mined';
  const cartAddUrl = `${window.location.origin}/apps/ringbuilder/cartadd/${diamondDetail.diamondId}/${diamondType}?shop=${encodeURIComponent(shopDomain)}`;

  const response = await fetch(cartAddUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to add to cart: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to add to cart');
  }

  const cartApiUrl = `${window.location.origin}${(window.Shopify?.routes?.root ?? '/')}cart/add.js`;
  let properties = data.properties || {};
  if (Array.isArray(properties)) {
    properties = {};
  }
  const variantId = data.variant_id ?? data.diamond_variant_id;

  const items = [{
    id: parseInt(variantId, 10),
    quantity: data.quantity ?? 1,
    properties,
  }];

  const cartFetchOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  };
  const maxCartRetries = 7;
  const cartRetryDelayMs = 1500;
  let cartResponse = await fetch(cartApiUrl, cartFetchOptions);
  let attempt = 1;
  while (cartResponse.status === 422 && attempt < maxCartRetries) {
    await new Promise((resolve) => setTimeout(resolve, cartRetryDelayMs));
    cartResponse = await fetch(cartApiUrl, cartFetchOptions);
    attempt += 1;
  }

  if (!cartResponse.ok) {
    const errorData = await cartResponse.json().catch(() => ({}));
    throw new Error(errorData.description || 'Failed to add item to cart');
  }

  return {
    mode: 'shopify',
    productTitle: data.product_title || diamondDetail.mainHeader || 'Product',
    cartData: await cartResponse.json(),
  };
}

async function addDiamondToCartWooCommerce(diamondDetail, configAppData, isLabGrown) {
  const shopDomain = configAppData?.shop || window.location.hostname;
  const listType = resolveDiamondListType(diamondDetail, isLabGrown);
  const body = {
    shop_domain: shopDomain,
    diamond_id: String(diamondDetail.diamondId),
    dealer_id: configAppData?.dealerid || configAppData?.dealerId || '',
    is_lab: resolveIsLabFlag(isLabGrown, listType),
    list_type: listType,
  };

  const data = await fetchWrapper.post(`${getRestBase()}/addToCart`, body);
  const cartUrl = parseCartUrlResponse(data);
  if (!cartUrl) {
    throw new Error(typeof data?.message === 'string' ? data.message : 'Could not add to cart.');
  }

  return {
    mode: 'woocommerce',
    cartUrl,
    productTitle: diamondDetail.mainHeader || 'Product',
  };
}

async function addCompleteRingToCartShopify(diamondDetail, settingDetail, configAppData, options) {
  const shopDomain = window.Shopify?.shop || configAppData?.shop || window.location.hostname;
  const completePurchaseUrl = `${window.location.origin}/apps/ringbuilder/completePurchase/${diamondDetail.diamondId}/${settingDetail.settingId}?shop=${encodeURIComponent(shopDomain)}`;

  const response = await fetch(completePurchaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`Failed to add to cart: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.success || !data.items || data.items.length === 0) {
    throw new Error('Failed to add to cart');
  }

  const cartApiUrl = `${window.location.origin}${(window.Shopify?.routes?.root ?? '/')}cart/add.js`;
  const items = data.items.map((item) => {
    let properties = item.properties || {};
    if (Array.isArray(properties)) {
      properties = {};
    }
    return {
      id: parseInt(item.variant_id, 10),
      quantity: item.quantity || 1,
      properties,
    };
  });

  const cartFetchOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  };
  const maxCartRetries = 7;
  const cartRetryDelayMs = 1500;
  let cartResponse = await fetch(cartApiUrl, cartFetchOptions);
  let attempt = 1;
  while (cartResponse.status === 422 && attempt < maxCartRetries) {
    await new Promise((resolve) => setTimeout(resolve, cartRetryDelayMs));
    cartResponse = await fetch(cartApiUrl, cartFetchOptions);
    attempt += 1;
  }

  if (!cartResponse.ok) {
    const errorData = await cartResponse.json().catch(() => ({}));
    throw new Error(errorData.description || 'Failed to add items to cart');
  }

  const productNames = data.items.map((item) => item.product_title).filter(Boolean);
  return {
    mode: 'shopify',
    productTitle: productNames.length > 0 ? productNames.join(' & ') : 'Your items',
    cartData: await cartResponse.json(),
  };
}

function addCompleteRingToCartWooCommerce(diamondDetail, settingDetail, configAppData, isLabGrown, ringOptions = {}) {
  const shopDomain = configAppData?.shop || window.location.hostname;
  const listType = resolveDiamondListType(diamondDetail, isLabGrown);
  const nonce = typeof window !== 'undefined' ? window.gemfindRBConfig?.nonce : '';
  const params = new URLSearchParams({
    shop: shopDomain,
    type: listType,
  });
  if (nonce) {
    params.set('_wpnonce', nonce);
  }
  if (ringOptions?.ringsizesettingonly) {
    params.set('ringsizesettingonly', String(ringOptions.ringsizesettingonly));
  }
  if (ringOptions?.metaltype) {
    params.set('metaltype', String(ringOptions.metaltype));
  }
  if (ringOptions?.islabsettings !== undefined && ringOptions?.islabsettings !== null) {
    params.set('islabsettings', String(ringOptions.islabsettings));
  }

  const cartUrl = `${getRestBase()}/completePurchase/${diamondDetail.diamondId}/${settingDetail.settingId}?${params.toString()}`;
  return {
    mode: 'woocommerce',
    cartUrl,
    productTitle: `${settingDetail.mainHeader || settingDetail.settingName || 'Ring'} + ${diamondDetail.mainHeader || 'Diamond'}`,
  };
}

export async function addDiamondToCart({ diamondDetail, configAppData, isLabGrown }) {
  if (isShopifyStorefront()) {
    return addDiamondToCartShopify(diamondDetail, configAppData);
  }
  return addDiamondToCartWooCommerce(diamondDetail, configAppData, isLabGrown);
}

export async function addCompleteRingToCart({
  diamondDetail,
  settingDetail,
  configAppData,
  isLabGrown,
  ringOptions,
}) {
  if (isShopifyStorefront()) {
    return addCompleteRingToCartShopify(diamondDetail, settingDetail, configAppData, ringOptions);
  }
  return addCompleteRingToCartWooCommerce(diamondDetail, settingDetail, configAppData, isLabGrown, ringOptions);
}

export const cartService = {
  addDiamondToCart,
  addCompleteRingToCart,
  redirectToCartUrl,
  isShopifyStorefront,
};
