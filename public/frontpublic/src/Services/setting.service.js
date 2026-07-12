import { fetchWrapper } from '../Helpers';
import { resolveJcApiBase } from '../Helpers/jc-api-base';
import { appService } from './app.service';

const apiurlForForms = `${import.meta.env.VITE_APP_FORM_API_URL}`;
const ext = `${import.meta.env.VITE_SHOP_EXTENSION}`;

export const settingService = {
  getSettingFilters,
  getAllSettings,
  getSettingNavigation,
  getSettingDetail,
  dropAHint,
  friendsEmail,
  validateDealerPassword,
  scheduleViewing,
  requestMoreInfo,
};

function getSettingFilters(option, dealerId) {
  const queryParam = getQueryFilterParam(option);
  const base = resolveJcApiBase();
  return fetchWrapper.get(`${base}/GetFilters?DealerId=${dealerId}${queryParam}`);
}

function getSettingDetail(settingId, dealerId, isLabGrown, shop) {
  return fetchWrapper.get(
    `${apiurlForForms}/reactconfig/GetMountingDetail?DealerId=${dealerId}&SID=${settingId}&shop=${shop}`
  );
}

function getAllSettings(option, dealerId) {
  const queryParam = getQueryParam(option);
  const base = resolveJcApiBase();
  return fetchWrapper.get(`${base}/GetMountingList?DealerId=${dealerId}${queryParam}`);
}

function getSettingNavigation(dealerId) {
  if (dealerId != null && dealerId !== undefined) {
    const base = resolveJcApiBase();
    return fetchWrapper.get(`${base}/GetRBNavigation?DealerId=${dealerId}`);
  }
}

function dropAHint(formData, sendRequest) {
  let endpoint = '';
  if (sendRequest === 'settings') {
    endpoint = 'dropHintApi';
  } else if (sendRequest === 'diamondtools') {
    endpoint = 'dlDropHintApi';
  }

  if (typeof window !== 'undefined' && window.location.pathname.includes('/apps/ringbuilder')) {
    const proxyBase = `${window.location.origin}/apps/ringbuilder`;
    return fetchWrapper.postFormData(`${proxyBase}/${endpoint}`, formData);
  }

  const baseApiUrl = apiurlForForms.replace('/ringbuilder', '');
  return fetchWrapper.postFormData(`${baseApiUrl}/${endpoint}`, formData);
}

function friendsEmail(formData, sendRequest) {
  let endpoint = '';
  if (sendRequest === 'settings') {
    endpoint = 'emailFriendApi';
  } else if (sendRequest === 'diamondtools') {
    endpoint = 'dlEmailFriendApi';
  }

  if (typeof window !== 'undefined' && window.location.pathname.includes('/apps/ringbuilder')) {
    const proxyBase = `${window.location.origin}/apps/ringbuilder`;
    return fetchWrapper.postFormData(`${proxyBase}/${endpoint}`, formData);
  }

  const baseApiUrl = apiurlForForms.replace('/ringbuilder', '');
  return fetchWrapper.postFormData(`${baseApiUrl}/${endpoint}`, formData);
}

function validateDealerPassword(data, page) {
  const baseApiUrl = apiurlForForms.replace('/ringbuilder', '');

  if (page === 'setting') {
    return fetchWrapper.postFormData(`${baseApiUrl}/settings/authenticate`, data);
  }
  return fetchWrapper.postFormData(`${baseApiUrl}/diamondtools/authenticate`, data);
}

function scheduleViewing(formData, sendRequest, apiCall) {
  let endpoint = '';
  if (sendRequest === 'settings') {
    endpoint = apiCall.includes('_cr') ? 'crScheViewApi' : 'scheViewApi';
  } else if (sendRequest === 'diamondtools') {
    endpoint = apiCall.includes('_cr') ? 'crScheViewApi' : 'dlScheViewApi';
  }

  const baseApiUrl = apiurlForForms.replace('/ringbuilder', '');
  return fetchWrapper.postFormData(`${baseApiUrl}/${endpoint}`, formData);
}

function requestMoreInfo(formData, sendRequest, apiCall) {
  let endpoint = '';
  if (sendRequest === 'settings') {
    endpoint = apiCall.includes('_cr') ? 'crReqInfoApi' : 'reqInfoApi';
  } else if (sendRequest === 'diamondtools') {
    endpoint = apiCall.includes('_cr') ? 'crReqInfoApi' : 'dlReqInfoApi';
  }

  const baseApiUrl = apiurlForForms.replace('/ringbuilder', '');
  return fetchWrapper.postFormData(`${baseApiUrl}/${endpoint}`, formData);
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
  if (option.searchSetting && option.searchSetting !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'SID=' + option.searchSetting;
  }
  if (option.orderBy && option.orderBy !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'OrderBy=' + option.orderBy;
  }
  if (option.priceMin !== "" && option.priceMin !== undefined && option.priceMax !== "" && option.priceMax !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'priceMin=' + option.priceMin + "&priceMax=" + option.priceMax;
  }
  if (option.shape && option.shape !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'Shape=' + option.shape;
  }
  if (option.metalType && option.metalType !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'MetalType=' + option.metalType;
  }
  if (option.style && option.style !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'Collection=' + option.style;
  }
  if (option.isLabSettingsAvailable == false) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'IsLabSettingsAvailable=0';
  }
  if (option.isLabSettingsAvailable == true) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'IsLabSettingsAvailable=1';
  }
  if (option.CenterStoneMinCarat !== "" && option.CenterStoneMaxCarat !== "") {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'CenterStoneMinCarat=' + option.CenterStoneMinCarat + "&CenterStoneMaxCarat=" + option.CenterStoneMaxCarat;
  }
  if (filterString != "") {
    return "&" + filterString;
  }
  return filterString;
}

function getQueryFilterParam(option) {
  let filterString = "";
  if (option.shape && option.shape !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'Shape=' + option.shape;
  }
  if (option.metalType && option.metalType !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'MetalType=' + option.metalType;
  }
  if (option.style && option.style !== undefined) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'Collection=' + option.style;
  }
  if (option.isLabSettingsAvailable === true) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'IsLabSettingsAvailable=1';
  }
  if (option.isLabSettingsAvailable === false) {
    filterString += filterString.length > 0 ? `&` : '';
    filterString += 'IsLabSettingsAvailable=0';
  }
  if (filterString != "") {
    return "&" + filterString;
  }
  return filterString;
}
