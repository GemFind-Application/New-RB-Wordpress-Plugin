function kFormatter(num) {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
    : Math.sign(num) * Math.abs(num);
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
/**
 * Maps metal type string (e.g. "18K White Gold", "9K Rose Gold") to a CSS-safe class
 * used for the ring icon color. Works for 9K, 14K, 18K, etc.
 */
function getMetalColorClass(metalType) {
  if (!metalType || typeof metalType !== 'string') return '';
  const m = metalType.toLowerCase();
  if (m.includes('two') && m.includes('tone')) return 'two tone';
  if (m.includes('white') || m.includes('wg')) return 'white';
  if (m.includes('yellow') || m.includes('yg')) return 'yellow';
  if (m.includes('rose') || m.includes('rg')) return 'rose';
  if (m.includes('platinum') || m.includes('pt')) return 'platinum';
  if (m.includes('gold')) return 'yellow';
  return '';
}

function getUrl(metalType,name,settingId,page=""){
  let metalTypeForUrl = metalType;
  let viewUrl = metalTypeForUrl.split(" ").join("-");
 
  let newUrl = (viewUrl.split("&").join("%26")).split('/').join('-');  
  if(page==='details') {newUrl=newUrl+'-metaltype';}
  let ringName =(name.replace(/ /g,'-').replace(/&/g,'%26').replace('/','-')).toLowerCase();       
  let sku = '-sku-'+(settingId); 
  return newUrl.toLowerCase()+'-'+ringName+sku;
}
function truncateString  (string)  {
  let truncatedString=string;
  if (string.length > 20) {
    //truncatedString = `${string.slice(0, 20)} ...`;
    return truncatedString
  } else {
    
    return truncatedString;
  };
}
function hasSpecValue(value) {
  if (value === null || value === undefined || value === false) {
    return false;
  }
  const text = String(value).trim();
  return text !== '' && text !== '-' && text !== '—';
}

/** Always show a spec field; use "-" when the API value is empty/missing. */
function displaySpecValue(value, fallback = '-') {
  if (typeof value === 'object' && value !== null) {
    return value;
  }
  if (!hasSpecValue(value)) {
    return fallback;
  }
  return String(value).trim();
}

function getskuForVirtualTryOn(styleNumber) {
  if (!styleNumber || typeof styleNumber !== 'string') {
    return '';
  }
  if (styleNumber.indexOf(':') > -1) {
    const colonarray = styleNumber.split(':');
    return colonarray[0].split('-')[0];
  }
  return styleNumber.split('-')[0];
}

/** Admin toggle: Enable Virtual Try-On in plugin settings. */
function isDisplayTryOnEnabled(config) {
  if (!config) {
    return false;
  }
  const flag = config.display_tryon ?? config.displayTryon;
  return flag === true || flag === 1 || flag === '1' || flag === 'true';
}

function getProductTryOnFlag(product) {
  if (!product) {
    return undefined;
  }
  return product.tryon ?? product.tryOn ?? product.TryOn ?? product.Tryon;
}

/**
 * Per-product try-on from JewelCloud. List endpoints often omit tryon — treat as enabled
 * unless explicitly false (Shopify app parity; Camweara validates SKU on open).
 */
function isProductTryOnEnabled(product) {
  if (!product) {
    return false;
  }
  const flag = getProductTryOnFlag(product);
  if (flag === false || flag === 0 || flag === '0' || flag === 'false') {
    return false;
  }
  if (flag === true || flag === 1 || flag === '1' || flag === 'true') {
    return true;
  }
  return true;
}

/** Show setting try-on CTA when admin enabled and product has a Camweara SKU. */
function canShowSettingVirtualTryOn(config, product, context = 'list') {
  const sku = context === 'detail'
    ? getDetailProductTryOnSku(product)
    : getListProductTryOnSku(product);
  return isDisplayTryOnEnabled(config)
    && isProductTryOnEnabled(product)
    && !!sku;
}

/** List/grid — Shopify v2: getskuForVirtualTryOn(product.stockNumber). */
function getListProductTryOnSku(product) {
  if (!product) {
    return '';
  }
  const stock = product.stockNumber ? String(product.stockNumber).trim() : '';
  if (stock) {
    return getskuForVirtualTryOn(stock);
  }
  const style = product.styleNumber ? String(product.styleNumber).trim() : '';
  return style ? getskuForVirtualTryOn(style) : '';
}

/** PDP / complete ring — Shopify v2: getskuForVirtualTryOn(product.styleNumber). */
function getDetailProductTryOnSku(product) {
  if (!product) {
    return '';
  }
  const style = product.styleNumber ? String(product.styleNumber).trim() : '';
  return style ? getskuForVirtualTryOn(style) : '';
}

/** @deprecated Prefer getListProductTryOnSku or getDetailProductTryOnSku */
function getProductTryOnSku(product) {
  return getListProductTryOnSku(product);
}

/** Full URL to tryon-overrides.css for Camweara custom_css (Shopify v2 parity). */
function getTryOnOverrideCssUrl() {
  if (typeof window === 'undefined') {
    return '';
  }
  const cfg = window.gemfindRBConfig || {};
  if (cfg.tryOnOverrideCssUrl) {
    return String(cfg.tryOnOverrideCssUrl).trim();
  }
  if (cfg.imageBaseUrl) {
    return `${String(cfg.imageBaseUrl).replace(/\/$/, '')}/tryon-overrides.css`;
  }
  if (window.location?.origin) {
    const basePath = cfg.shopExtension || '';
    return `${window.location.origin}${basePath}/tryon-overrides.css`;
  }
  return '';
}

function buildRingVirtualTryOnUrl(sku) {
  const value = typeof sku === 'string' ? sku.trim() : '';
  if (!value) {
    return '';
  }
  const baseUrl = `https://cdn.camweara.com/gemfind/index_client.php?company_name=Gemfind&ringbuilder=1&skus=${encodeURIComponent(value)}&buynow=0`;
  const overrideCss = getTryOnOverrideCssUrl();
  return overrideCss ? `${baseUrl}&custom_css=${encodeURIComponent(overrideCss)}` : baseUrl;
}

function buildDiamondVirtualTryOnUrl(shape, caratweight) {
  return `https://cdn.camweara.com/camweara_diamond/?company_name=gemfind&carat=${caratweight}&dshape=${shape}`;
}

/** Handle Camweara diamond search postMessage (Shopify v1 parity). */
function handleDiamondCamwearaSearchMessage(data, lastSegment, navigate) {
  if (data?.type !== 'search' || typeof navigate !== 'function') {
    return;
  }
  const carat = data.carat;
  localStorage.removeItem('saveDiamondFiltersMined');
  localStorage.removeItem('saveAdvanceDiamondFiltersMined');
  localStorage.removeItem('saveDiamondFiltersLab');
  localStorage.removeItem('saveAdvanceDiamondFiltersLab');
  localStorage.removeItem('saveDiamondFiltersfancy');
  localStorage.removeItem('saveAdvanceDiamondFiltersFancy');
  const obj = {
    shape: [data.shape],
    cut: [],
    colour: [],
    clarity: [],
    intensity: [],
    carat: [parseFloat(carat - 1), parseFloat(carat + 1)],
    price: [],
    search: '',
  };

  if (lastSegment === 'fancydiamonds') {
    localStorage.setItem('saveDiamondFiltersfancy', JSON.stringify(obj));
    navigate('/diamondtools/diamondtype/navlabgrown');
  } else if (lastSegment === 'labcreated') {
    localStorage.setItem('saveDiamondFiltersLab', JSON.stringify(obj));
    navigate('/diamondtools/diamondtype/navlabgrown');
  } else {
    localStorage.setItem('saveDiamondFiltersMined', JSON.stringify(obj));
    navigate('/diamondtools');
  }
}

function isJsonString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}
function getDiamondIdFromSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return '';
  }
  const skuMatch = slug.match(/--sku-(.+)$/i) || slug.match(/sku-(.+)$/i);
  if (skuMatch) {
    return skuMatch[1].split('/')[0];
  }
  return slug.substring(slug.lastIndexOf('-') + 1);
}

function getDiamondViewUrl(diamondDetail,typeD){
 
  let diamondviewurl = '';   
  let type= diamondDetail.isLabCreated? 'labcreated':'';
  let urlshape = diamondDetail.shape?diamondDetail.shape.split(" ").join("-")+'-shape-':'-shape-';
  let urlcarat = diamondDetail.carat?diamondDetail.carat.split(" ").join("-")+'-carat-':'-carat-';
  let urlcolor = diamondDetail.color?diamondDetail.color.split(" ").join("-")+'-color-':'-color-';            
  let urlclarity = diamondDetail.clarity?diamondDetail.clarity.split(" ").join("-")+'-clarity-':'-clarity-';           
  let urlcut = diamondDetail.cut ? diamondDetail.cut!==""? diamondDetail.cut.split(" ").join("-")+'-cut-':'-cut-':'-cut-';            
  let urlcert = diamondDetail.cert?diamondDetail.cert.split(" ").join("-")+'-certificate-':'-certificate-';  
  
  let urlstring = (urlshape+urlcarat+urlcolor+urlclarity+urlcut+urlcert+'sku-'+diamondDetail.diamondId).toLowerCase();
 let typeToadd = typeD=='fancy' ?'/fancydiamonds' :typeD==true?'/labcreated':''
 
      return  urlstring+  typeToadd       
//$diamondviewurl = $this->diamond_lib->getDiamondViewUrl($urlstring,$type,$base_shop_domain,$pathprefixshop); 
}
const utils = {
  kFormatter,
  numberWithCommas,
  getUrl,
  truncateString,
  hasSpecValue,
  displaySpecValue,
  getskuForVirtualTryOn,
  getTryOnOverrideCssUrl,
  isDisplayTryOnEnabled,
  isProductTryOnEnabled,
  canShowSettingVirtualTryOn,
  getListProductTryOnSku,
  getDetailProductTryOnSku,
  getProductTryOnSku,
  handleDiamondCamwearaSearchMessage,
  buildRingVirtualTryOnUrl,
  buildDiamondVirtualTryOnUrl,
  getDiamondViewUrl,
  getDiamondIdFromSlug,
  isJsonString,
  getMetalColorClass,
};
export { utils };
