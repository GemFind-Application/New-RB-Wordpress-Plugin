import axios from 'axios';
import { wpAxiosInterceptor, jcBase } from '../wp/wpEnv';

// WordPress REST (gemfind-ring-builder/v1); URL + X-WP-Nonce resolved per request.
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(wpAxiosInterceptor, (error) => Promise.reject(error));

// Helper function to build query parameters
const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length === 2) {
          // Handle range parameters like [min, max]
          queryParams.append(`${key}Min`, value[0]);
          queryParams.append(`${key}Max`, value[1]);
        } else {
          // Handle array parameters
          value.forEach(item => queryParams.append(key, item));
        }
      } else {
        queryParams.append(key, value);
      }
    }
  });
  
  return queryParams.toString();
};

export const diamondService = {
  // Get diamond filters
  getDiamondFilter: async (options, dealerId) => {
    try {
      if (options.isLabGrown === 'fancy') {
        const response = await apiClient.get(`/RingBuilder/GetColorDiamondFilter?DealerId=${dealerId}`);
        return response.data;
      } else {
        const isLabGrownParam = options.isLabGrown === true ? 'true' : 'false';
        const response = await apiClient.get(`/RingBuilder/GetDiamondFilter?DealerId=${dealerId}&IsLabGrown=${isLabGrownParam}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error in getDiamondFilter:', error);
      throw error;
    }
  },

  // Get all diamonds
  getAllDiamond: async (options, dealerId) => {
    try {
      const params = {
        DealerId: dealerId,
        ...options
      };
      
      const queryString = buildQueryString(params);
      const queryParam = queryString ? `&${queryString}` : '';
      
      if (options.isLabGrown === 'fancy') {
        const response = await apiClient.get(`/RingBuilder/GetColorDiamond?DealerId=${dealerId}${queryParam}&IsLabGrown=false`);
        return response.data;
      } else {
        const response = await apiClient.get(`/RingBuilder/GetDiamond?DealerId=${dealerId}${queryParam}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error in getAllDiamond:', error);
      throw error;
    }
  },

  // Get diamond navigation
  getDiamondNavigation: async (dealerId) => {
    try {
      const response = await apiClient.get(`/RingBuilder/GetNavigation?DealerId=${dealerId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getDiamondNavigation:', error);
      throw error;
    }
  },

  // Get diamond details
  getDiamondDetail: async (diamondId, isLabGrown, dealerId, shop) => {
    try {
      let url = `/reactconfig/GetDiamondDetail?DealerId=${dealerId}&DID=${diamondId}&shop=${shop}`;
      
      if (isLabGrown === true) {
        url += '&IsLabGrown=labcreated';
      } else if (isLabGrown === 'fancy') {
        url += '&IsLabGrown=fancydiamonds';
      }
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error in getDiamondDetail:', error);
      throw error;
    }
  },

  // Get fancy diamond filter
  getFancyDiamondFilter: async (options, settingId, dealerId) => {
    try {
      const response = await apiClient.get(`/RingBuilder/GetColorDiamondFilter?DealerId=${dealerId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getFancyDiamondFilter:', error);
      throw error;
    }
  },

  // Get diamond video URL
  getDiamondVideoUrl: async (diamondId) => {
    try {
      const response = await apiClient.get(`/jewelry/GetVideoUrl?InventoryID=${diamondId}&Type=Diamond`);
      return response.data;
    } catch (error) {
      console.error('Error in getDiamondVideoUrl:', error);
      throw error;
    }
  },

  // Get diamonds JC options (social icons configuration)
  getDiamondsJCOptions: async (dealerId) => {
    try {
      // JewelCloud via the WordPress jcProxy route (apiClient adds X-WP-Nonce; absolute URL kept as-is)
      const response = await apiClient.get(`${jcBase()}/GetDiamondsJCOptions?DealerID=${dealerId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getDiamondsJCOptions:', error);
      throw error;
    }
  }
};
