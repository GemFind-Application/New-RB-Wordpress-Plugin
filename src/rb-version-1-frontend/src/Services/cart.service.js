import axios from 'axios';
import { wpAxiosInterceptor } from '../wp/wpEnv';

// WordPress REST (gemfind-ring-builder/v1); URL + X-WP-Nonce resolved per request.
const apiClient = axios.create({
  timeout: 30000, // Increased timeout to 30 seconds for product creation
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Important: tells Laravel we want JSON response
    // Do not set X-Requested-With for cross-origin API calls; CORS must allow it or preflight fails
  },
});

// Request interceptor for logging (optional)
apiClient.interceptors.request.use(
  wpAxiosInterceptor,
  (error) => {
    return Promise.reject(error);
  }
);

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

export const cartService = {
  // Add diamond to cart using JSON API (matches the curl example)
  addToCart: async (cartData) => {
    try {
      const response = await apiClient.post('/addToCart', cartData);
      return response.data;
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error;
    }
  },

  // Complete purchase (add diamond + ring to cart) - normal API call: POST JSON, get JSON response
  completePurchase: async (diamondId, settingId, shopDomain, formData) => {
    const body = formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : (formData || {});
    const response = await apiClient.post(
      `/completePurchase/${diamondId}/${settingId}?shop=${encodeURIComponent(shopDomain)}`,
      body
    );
    return response.data;
  },

  // Add diamond to cart - normal API call: POST JSON payload, get JSON response
  addDiamondToCart: async (diamondId, diamondType, shopDomain) => {
    const response = await apiClient.post('/addToCart', {
      shop_domain: shopDomain,
      diamond_id: diamondId,
      // WordPress reads list_type (v2) or diamond_type (v1): fancydiamonds | labcreated | mined
      list_type: diamondType || undefined,
      diamond_type: diamondType || undefined,
    });
    return response.data;
  },

  // Add ring to cart - normal API call: POST JSON payload, get JSON response
  addRingToCart: async (settingId, shopDomain, options = {}) => {
    const response = await apiClient.post('/addRing', {
      shop_domain: shopDomain,
      setting_id: settingId,
      ...options,
    });
    return response.data;
  },
};
