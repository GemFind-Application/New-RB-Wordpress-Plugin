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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const appService = {
  // Get configuration settings
  getConfigSetting: async (shopDomain) => {
    try {
      const response = await apiClient.get(`/reactconfig?shop=${shopDomain}`);
      return response.data; // Return the actual data
    } catch (error) {
      console.error('Error in getConfigSetting:', error);
      throw error;
    }
  },

  // Get additional options
  getAdditionalOption: async (dealerId, url) => {
    try {
      const response = await apiClient.get(`/reactconfig/GetDiamondsJCOptions?DealerId=${dealerId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getAdditionalOption:', error);
      throw error;
    }
  },

  // Get style data
  getStyleData: async (dealerId, shop) => {
    try {
      const response = await apiClient.get(`/reactconfig/getcssStyle?shop=${shop}`);
      return response.data;
    } catch (error) {
      console.error('Error in getStyleData:', error);
      throw error;
    }
  },

  // Check if shop has active plan
  checkActivePlan: async (shopDomain) => {
    try {
      const response = await apiClient.get('/billing/check-active-plan', {
        params: { shop: shopDomain },
      });
      // WordPress wraps the payload: { status, message, data: { hasActivePlan } }.
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('Error in checkActivePlan:', error);
      throw error;
    }
  }
};
