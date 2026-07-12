import { fetchWrapper } from '../Helpers';
import { resolveJcApiBase, resolveJcVideoBase } from '../Helpers/jc-api-base';

const apiurlForForms = `${import.meta.env.VITE_APP_FORM_API_URL}`;

export const diamondService = {
  getDiamondFilter,
  getAllDiamond,
  getDiamondNavigation,
  getDiamondDetail,
  getFancyDiamondFilter,
  getDiamondVideoUrl,
};

function getDiamondFilter(option, dealerId) {
  const base = resolveJcApiBase();
  let initialFilter = '';
  const startflowPath = JSON.parse(localStorage.getItem('startflow'));
  if (startflowPath && startflowPath.path == '/diamondtools' && startflowPath.isLoaded === false) {
    localStorage.setItem('startflow', JSON.stringify({ path: startflowPath.path, isLoaded: true }));
    initialFilter = true;
  } else {
    initialFilter = false;
  }
  if (option.isLabGrown === 'fancy') {
    return fetchWrapper.get(`${base}/GetColorDiamondFilter?DealerId=${dealerId}`);
  }
  if (initialFilter === true) {
    if (option.isLabGrown === 0) {
      return fetchWrapper.get(`${base}/GetInitialFilter?DealerId=${dealerId}&IsLabGrown=false`);
    }
    return fetchWrapper.get(`${base}/GetInitialFilter?DealerId=${dealerId}&IsLabGrown=true`);
  }
  if (option.isLabGrown === false) {
    return fetchWrapper.get(`${base}/GetDiamondFilter?DealerId=${dealerId}&IsLabGrown=false`);
  }
  return fetchWrapper.get(`${base}/GetDiamondFilter?DealerId=${dealerId}&IsLabGrown=true`);
}

function getDiamondVideoUrl(diamondId) {
  const videoUrl = resolveJcVideoBase();
  return fetchWrapper.get(`${videoUrl}?InventoryID=${diamondId}&Type=Diamond`);
}

function getFancyDiamondFilter(option, settingId, dealerId) {
  const base = resolveJcApiBase();
  return fetchWrapper.get(`${base}/GetColorDiamondFilter?DealerId=${dealerId}`);
}

function getDiamondDetail(diamondId, isLabGrown, dealerId) {
  const base = resolveJcApiBase();
  if (isLabGrown === 'fancy') {
    return fetchWrapper.get(`${base}/GetDiamondDetail?DealerID=${dealerId}&DID=${diamondId}&IsFancy=true`);
  }
  if (isLabGrown === true) {
    return fetchWrapper.get(`${base}/GetDiamondDetail?DealerID=${dealerId}&DID=${diamondId}&IsLabGrown=true`);
  }
  return fetchWrapper.get(`${base}/GetDiamondDetail?DealerID=${dealerId}&DID=${diamondId}&IsLabGrown=false`);
}

function getAllDiamond(option, dealerId) {
  const base = resolveJcApiBase();
  const queryParam = getQueryParam(option);
  if (option.isLabGrown === 'fancy') {
    return fetchWrapper.get(`${base}/GetColorDiamond?DealerId=${dealerId}${queryParam}&IsLabGrown=false`);
  }
  return fetchWrapper.get(`${base}/GetDiamond?DealerId=${dealerId}${queryParam}`);
}

function getDiamondNavigation(dealerId) {
  const base = resolveJcApiBase();
  return fetchWrapper.get(`${base}/GetNavigation?DealerId=${dealerId}`);
}

function getQueryParam(option) {
  let filterString = "";
  if (option.pageSize && option.pageSize !== undefined) {
    filterString = 'pageSize=' + option.pageSize;
  }
  if (option.pageNumber && option.pageNumber !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'pageNumber=' + option.pageNumber;
  }
  if (option.searchDiamond && option.searchDiamond !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'DID=' + option.searchDiamond;
  }
  if (option.orderBy) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'OrderBy=' + option.orderBy + "&OrderType=" + option.orderDirection;
  }
  if (option.priceMin !== undefined && option.priceMax !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'PriceMin=' + option.priceMin + "&PriceMax=" + option.priceMax;
  }
  if (option.depth && option.depth !== undefined && option.depth.length > 0) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'DepthMin=' + option.depth[0] + "&DepthMax=" + option.depth[1];
  }
  if (option.depth && option.table !== undefined && option.table.length > 0) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'TableMin=' + option.table[0] + "&TableMax=" + option.table[1];
  }
  if (option.shape && option.shape !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'Shape=' + option.shape;
  }
  if (option.symmetry && option.symmetry !== undefined && option.symmetry != "") {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'SymmetryId=' + option.symmetry;
  }
  if (option.polish && option.polish !== undefined && option.polish != "") {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'PolishId=' + option.polish;
  }
  if (option.certificates && option.certificates !== undefined && option.certificates != "" && option.certificates != "Show All Cerificate") {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'Certificate=' + option.certificates;
  }
  if (option.fluorescence && option.fluorescence !== undefined && option.fluorescence != "") {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'FluorescenceId=' + option.fluorescence;
  }
  if (option.carat && option.carat !== undefined && option.carat.length > 0 && option.carat[0] != "" && option.carat[1] != "") {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'CaratMin=' + option.carat[0] + "&CaratMax=" + option.carat[1];
  }
  if (option.cut && option.cut !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'CutGradeId=' + option.cut;
  }
  if (option.colour && option.colour !== undefined) {
    if (option.isLabGrown === 'fancy') {
      filterString += filterString.length > 0 ? `&` : '';
      filterString += 'FancyColor=' + option.colour;
    } else {
      filterString += filterString.length > 0 ? `&` : '';
      filterString += 'ColorId=' + option.colour;
    }
  }
  if (option.clarity && option.clarity !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'ClarityId=' + option.clarity;
  }
  if (option.isLabGrown === true) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'IsLabGrown=true';
  }
  if (option.isLabGrown === false) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'IsLabGrown=false';
  }
  if (option.FancyColor && option.FancyColor !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'FancyColor=' + option.FancyColor;
  }
  if (option.intensity && option.intensity !== undefined && option.intensity !== '') {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'intIntensity=' + option.intensity;
  }
  if (option.diamondfilter && option.diamondfilter !== 'all') {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'diamondfilter=' + option.diamondfilter;
  }

  if (filterString != "") {
    return "&" + filterString;
  }
  return filterString;
}
