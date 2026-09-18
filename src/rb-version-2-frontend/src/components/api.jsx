import { resolveJcApiBase } from '../Helpers/jc-api-base';

export const BASE_URL = resolveJcApiBase();
export const DEALER_ID = 4141;

export const getMountingList = (isLabSettingsAvailable, pageNumber, pageSize, shape = '', collection = '', metalType = '', centerStoneMinCarat = '', centerStoneMaxCarat = '', priceMin = 0, priceMax = 29678.00, orderBy = 'cost asc') => {
  const base = resolveJcApiBase();
  return `${base}/GetMountingList?DealerID=${DEALER_ID}&IsLabSettingsAvailable=${isLabSettingsAvailable}&PageNumber=${pageNumber}&PageSize=${pageSize}&Shape=${shape}&Collection=${collection}&MetalType=${metalType}&CenterStoneMinCarat=${centerStoneMinCarat}&CenterStoneMaxCarat=${centerStoneMaxCarat}&PriceMin=${priceMin}&PriceMax=${priceMax}&OrderBy=${orderBy}`;
};

export const getFilters = (isLabSettingsAvailable) => {
  const base = resolveJcApiBase();
  return `${base}/GetFilters?DealerID=${DEALER_ID}&IsLabSettingsAvailable=${isLabSettingsAvailable}`;
};

export const getMountingDetail = (sid) => {
  const base = resolveJcApiBase();
  return `${base}/GetMountingDetail?DealerId=${DEALER_ID}&SID=${sid}`;
};
