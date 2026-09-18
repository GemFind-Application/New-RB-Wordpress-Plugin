import axios from 'axios';

// Email endpoints send multiple SMTP messages + JewelCloud lookups before
// responding. 15s was too short (UI showed timeout while mail still arrived).
const EMAIL_REQUEST_TIMEOUT_MS = 60000;

// Create axios instance for email APIs
const createEmailClient = () => {
  // When running inside Shopify app proxy (store.com/apps/ringbuilder/...)
  // always go through the proxy so requests are same-origin and avoid CORS.
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const cfg = typeof window !== 'undefined' ? window.gemfindRBConfig : null;
  if (cfg?.restUrl) {
    return axios.create({
      baseURL: cfg.restUrl.replace(/\/$/, ''),
      timeout: EMAIL_REQUEST_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': cfg.nonce || '',
      },
    });
  }
  if (path.includes('/ringbuilder') || path.includes('/apps/ringbuilder')) {
    const base = path.includes('/apps/ringbuilder')
      ? `${window.location.origin}/apps/ringbuilder`
      : `${window.location.origin}/wp-json/gemfind-ring-builder/v1`;
    return axios.create({
      baseURL: base,
      timeout: EMAIL_REQUEST_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Fallback for non-proxy environments (local dev, direct API, etc.)
  let baseURL = import.meta.env.VITE_APP_FORM_API_URL || window.location.origin;

  // Remove /ringbuilder if it exists
  if (baseURL.endsWith('/ringbuilder')) {
    baseURL = baseURL.replace('/ringbuilder', '');
  }

  // Remove trailing /api if it exists to avoid double /api/api
  if (baseURL.endsWith('/api')) {
    baseURL = baseURL.replace('/api', '');
  }

  return axios.create({
    baseURL: `${baseURL}/api`,
    timeout: EMAIL_REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Helper function to convert FormData to JSON or use plain object
const formDataToJson = (formData) => {
  // If it's already a plain object, return it as is
  if (formData && typeof formData === 'object' && !(formData instanceof FormData)) {
    return formData;
  }
  
  // Otherwise, convert FormData to JSON
  const json = {};
  for (let [key, value] of formData.entries()) {
    // Preserve null values for date/time fields, convert empty strings to null
    if ((key === 'avail_date' || key === 'appnt_time') && value === '') {
      json[key] = null;
    } else {
      json[key] = value;
    }
  }
  return json;
};

// Helper function to get common form data
const getCommonFormData = (additionalData = {}) => {
  return {
    shopurl: window.location.hostname || '',
    currency: 'USD',
    ...additionalData
  };
};

// Helper function to handle API responses
const handleEmailResponse = (response, successMessage = 'Email sent successfully') => {
  // Check for new format: {success: true, message: "..."}
  // or old format: {status: 1 or 'success', message: "..."}
  const isSuccess = response.data.success === true || 
                    response.data.status === 'success' || 
                    response.data.status === 1;
  
  if (isSuccess) {
    return {
      output: {
        status: 1,
        msg: response.data.message || successMessage
      }
    };
  } else {
    return {
      output: {
        status: 2,
        msg: response.data.message || 'Email sending failed'
      }
    };
  }
};

export const emailService = {
  // ==================== DIAMOND EMAIL APIs ====================
  
  /**
   * Drop a hint for diamond
   * @param {FormData} formData - Form data for drop hint
   * @returns {Promise<Object>} Response data
   */
  diamondDropHint: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/dlDropHintApi', requestData);
      return handleEmailResponse(response, 'Hint dropped successfully');
    } catch (error) {
      console.error('Error in diamondDropHint:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  /**
   * Request more info for diamond
   * @param {FormData} formData - Form data for request info
   * @returns {Promise<Object>} Response data
   */
  diamondRequestInfo: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/dlReqInfoApi', requestData);
      return handleEmailResponse(response, 'Request sent successfully');
    } catch (error) {
      console.error('Error in diamondRequestInfo:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  /**
   * Email a friend about diamond
   * @param {FormData} formData - Form data for email friend
   * @returns {Promise<Object>} Response data
   */
  diamondEmailFriend: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/dlEmailFriendApi', requestData);
      return handleEmailResponse(response, 'Email sent to friend successfully');
    } catch (error) {
      console.error('Error in diamondEmailFriend:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  /**
   * Schedule viewing for diamond
   * @param {FormData} formData - Form data for schedule viewing
   * @returns {Promise<Object>} Response data
   */
  diamondScheduleViewing: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/dlScheViewApi', requestData);
      return handleEmailResponse(response, 'Viewing scheduled successfully');
    } catch (error) {
      console.error('Error in diamondScheduleViewing:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  // ==================== RING EMAIL APIs ====================

  /**
   * Drop a hint for ring
   * @param {FormData} formData - Form data for drop hint
   * @returns {Promise<Object>} Response data
   */
  ringDropHint: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/dropHintApi', requestData);
      return handleEmailResponse(response, 'Hint dropped successfully');
    } catch (error) {
      console.error('Error in ringDropHint:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  /**
   * Request more info for ring
   * @param {FormData} formData - Form data for request info
   * @returns {Promise<Object>} Response data
   */
  ringRequestInfo: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/reqInfoApi', requestData);
      return handleEmailResponse(response, 'Request sent successfully');
    } catch (error) {
      console.error('Error in ringRequestInfo:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  /**
   * Email a friend about ring
   * @param {FormData} formData - Form data for email friend
   * @returns {Promise<Object>} Response data
   */
  ringEmailFriend: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/emailFriendApi', requestData);
      return handleEmailResponse(response, 'Email sent to friend successfully');
    } catch (error) {
      console.error('Error in ringEmailFriend:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  /**
   * Schedule viewing for ring
   * @param {FormData} formData - Form data for schedule viewing
   * @returns {Promise<Object>} Response data
   */
  ringScheduleViewing: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/scheViewApi', requestData);
      return handleEmailResponse(response, 'Viewing scheduled successfully');
    } catch (error) {
      console.error('Error in ringScheduleViewing:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  // ==================== COMPLETE RING EMAIL APIs ====================

  /**
   * Request more info for complete ring
   * @param {FormData} formData - Form data for request info
   * @returns {Promise<Object>} Response data
   */
  completeRingRequestInfo: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/crReqInfoApi', requestData);
      return handleEmailResponse(response, 'Request sent successfully');
    } catch (error) {
      console.error('Error in completeRingRequestInfo:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  /**
   * Schedule viewing for complete ring
   * @param {FormData} formData - Form data for schedule viewing
   * @returns {Promise<Object>} Response data
   */
  completeRingScheduleViewing: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/crScheViewApi', requestData);
      return handleEmailResponse(response, 'Viewing scheduled successfully');
    } catch (error) {
      console.error('Error in completeRingScheduleViewing:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  /**
   * Drop a hint for complete ring
   * @param {FormData} formData - Form data for drop hint
   * @returns {Promise<Object>} Response data
   */
  completeRingDropHint: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/crDropHintApi', requestData);
      return handleEmailResponse(response, 'Hint dropped successfully');
    } catch (error) {
      console.error('Error in completeRingDropHint:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },

  /**
   * Email a friend about complete ring
   * @param {FormData} formData - Form data for email friend
   * @returns {Promise<Object>} Response data
   */
  completeRingEmailFriend: async (formData) => {
    try {
      const emailClient = createEmailClient();
      const jsonData = formDataToJson(formData);
      const requestData = getCommonFormData(jsonData);

      const response = await emailClient.post('/crEmailFriendApi', requestData);
      return handleEmailResponse(response, 'Email sent to friend successfully');
    } catch (error) {
      console.error('Error in completeRingEmailFriend:', error);
      return {
        output: {
          status: 2,
          msg: error.response?.data?.message || error.message || 'Failed to send email'
        }
      };
    }
  },
};
