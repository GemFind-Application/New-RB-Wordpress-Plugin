import { fetchWrapper } from '../Helpers';
import { resolveJcApiBase } from '../Helpers/jc-api-base';

function wpFormApiBase() {
  if (typeof window !== "undefined" && window.gemfindRBConfig?.restUrl) {
    return String(window.gemfindRBConfig.restUrl).replace(/\/$/, "");
  }
  return String(import.meta.env.VITE_APP_FORM_API_URL || "/wp-json/gemfind-ring-builder/v1").replace(/\/$/, "");
}

const apiurlForForms = wpFormApiBase();

export const appService = {
  getAdditionalOption,
  getStyleData,
  getConfigSetting,
  checkActivePlan,
};

function getAdditionalOption(dealerId) {
  const base = resolveJcApiBase();
  return fetchWrapper.get(`${base}/GetDiamondsJCOptions?DealerId=${dealerId}`);
}

function getStyleData(dealerId, shop) {
  return fetchWrapper.get(`${apiurlForForms}/reactconfig/getcssStyle?shop=${shop}`);
}

function getConfigSetting(shop) {
  const apiUrl = wpFormApiBase();
  return fetchWrapper.get(`${apiUrl}/reactconfig?shop=${shop}`);
}

function checkActivePlan(shopDomain) {
  let apiUrl = wpFormApiBase();

  try {
    const parsed = new URL(apiUrl);
    parsed.pathname = parsed.pathname.replace(/\/ringbuilder\/?$/, '');
    apiUrl = parsed.toString().replace(/\/$/, '');
  } catch {
    apiUrl = apiUrl.replace(/\/ringbuilder\/?$/, '').replace(/\/$/, '');
  }
  return fetchWrapper.get(`${apiUrl}/billing/check-active-plan?shop=${shopDomain}`);
}
