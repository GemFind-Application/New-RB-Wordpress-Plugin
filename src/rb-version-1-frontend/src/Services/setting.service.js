import axios from 'axios';
import { wpAxiosInterceptor } from '../wp/wpEnv';

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

export const settingService = {
  // Get setting filters
  getSettingFilters: async (options, dealerId) => {
    try {
      const params = {
        DealerId: dealerId,
        ...options
      };
      
      const queryString = buildQueryString(params);
      const queryParam = queryString ? `&${queryString}` : '';
      const response = await apiClient.get(`/RingBuilder/GetFilters?DealerId=${dealerId}${queryParam}`);
      return response.data;
    } catch (error) {
      console.error('Error in getSettingFilters:', error);
      throw error;
    }
  },

  // Get all settings
  getAllSettings: async (options, dealerId) => {
    try {
      const params = {
        DealerId: dealerId,
        ...options
      };
      
      const queryString = buildQueryString(params);
      const queryParam = queryString ? `&${queryString}` : '';
      const response = await apiClient.get(`/RingBuilder/GetMountingList?DealerId=${dealerId}${queryParam}`);
      return response.data;
    } catch (error) {
      console.error('Error in getAllSettings:', error);
      throw error;
    }
  },

  // Get setting navigation
  getSettingNavigation: async (dealerId) => {
    try {
      const response = await apiClient.get(`/RingBuilder/GetRBNavigation?DealerId=${dealerId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getSettingNavigation:', error);
      throw error;
    }
  },

  // Get setting details
  getSettingDetail: async (settingId, dealerId, isLabGrown, shop) => {
    try {
      const response = await apiClient.get(`/reactconfig/GetMountingDetail?DealerId=${dealerId}&SID=${settingId}&shop=${shop}`);
      return response.data;
    } catch (error) {
      console.error('Error in getSettingDetail:', error);
      throw error;
    }
  },

  // Get setting video URL
  getSettingVideoUrl: async (settingId) => {
    try {
      const response = await apiClient.get(`/jewelry/GetVideoUrl?InventoryID=${settingId}&Type=Jewelry`);
      return response.data;
    } catch (error) {
      console.error('Error in getSettingVideoUrl:', error);
      throw error;
    }
  },

  // Drop a hint
  dropAHint: async (formData, sendRequest, apiCall) => {
    try {
      const response = await apiClient.post(`/${sendRequest}/${apiCall}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in dropAHint:', error);
      throw error;
    }
  },

  // Send email to friend
  friendsEmail: async (formData, sendRequest, apiCall) => {
    try {
      const response = await apiClient.post(`/${sendRequest}/${apiCall}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in friendsEmail:', error);
      throw error;
    }
  },

  // Validate dealer password
  validateDealerPassword: async (data, page) => {
    try {
      const endpoint = page === 'setting' ? 'settings/authenticate' : 'diamondtools/authenticate';
      const response = await apiClient.post(`/${endpoint}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in validateDealerPassword:', error);
      throw error;
    }
  },

  // Schedule viewing
  scheduleViewing: async (formData, sendRequest, apiCall) => {
    try {
      const response = await apiClient.post(`/${sendRequest}/${apiCall}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in scheduleViewing:', error);
      throw error;
    }
  },

  // Request more info
  requestMoreInfo: async (formData, sendRequest, apiCall) => {
    try {
      const response = await apiClient.post(`/${sendRequest}/${apiCall}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in requestMoreInfo:', error);
      throw error;
    }
  },

  // Get CSS configuration
  getCSSConfiguration: async (shop) => {
    try {
      const response = await apiClient.get(`/reactconfig/getcssStyle?shop=${shop}`);
      return response.data;
    } catch (error) {
      console.error('Error in getCSSConfiguration:', error);
      throw error;
    }
  }
};
