import axios from 'axios';
import { wpAxiosInterceptor } from '../wp/wpEnv';

// Create axios instance for email APIs (WordPress REST; URL + X-WP-Nonce resolved per request)
const createEmailClient = () => {
  const client = axios.create({
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  client.interceptors.request.use(wpAxiosInterceptor);
  return client;
};

// Helper function to get common form data
const getCommonFormData = (additionalData = {}) => {
  return {
    shopurl: window.initData?.data?.[0]?.shop || '',
    // In v1, window.currencyFrom is the code (e.g. JPY/USD) and window.currency
    // is the symbol (e.g. ¥/$). Send both so the email price/wholesale label
    // matches the storefront's display currency (backend uses currencySymbol).
    currency: window.currencyFrom || 'USD',
    currencySymbol: window.currency || '$',
    ...additionalData
  };
};

// Helper function to handle API responses
const handleEmailResponse = (response, successMessage = 'Email sent successfully') => {
  if (response.data.success || response.data.status === 'success') {
    return {
      success: true,
      message: response.data.message || successMessage,
      data: response.data
    };
  } else {
    throw new Error(response.data.message || 'Email sending failed');
  }
};

export const emailService = {
  // ==================== DIAMOND EMAIL APIs ====================
  
  /**
   * Drop a hint for diamond
   * @param {Object} formData - Form data for drop hint
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  diamondDropHint: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        hint_Recipient_name: formData.hint_Recipient_name,
        hint_Recipient_email: formData.hint_Recipient_email,
        reason_of_gift: formData.reason_of_gift,
        hint_message: formData.hint_message,
        deadline: formData.deadline,
        diamondurl: window.location.href,
        diamondid: formData.diamondId,
        diamondtype: formData.diamondType,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/dlDropHintApi', requestData);
      return handleEmailResponse(response, 'Hint dropped successfully');
    } catch (error) {
      console.error('Error in diamondDropHint:', error);
      throw error;
    }
  },

  /**
   * Request more info for diamond
   * @param {Object} formData - Form data for request info
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  diamondRequestInfo: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        message: formData.message,
        contact_preference: formData.contact_preference,
        diamondurl: window.location.href,
        diamondid: formData.diamondId,
        diamondtype: formData.diamondType,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/dlReqInfoApi', requestData);
      return handleEmailResponse(response, 'Request sent successfully');
    } catch (error) {
      console.error('Error in diamondRequestInfo:', error);
      throw error;
    }
  },

  /**
   * Email a friend about diamond
   * @param {Object} formData - Form data for email friend
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  diamondEmailFriend: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        frnd_name: formData.frnd_name,
        frnd_email: formData.frnd_email,
        frnd_message: formData.frnd_message,
        diamondurl: window.location.href,
        diamondid: formData.diamondId,
        diamondtype: formData.diamondType,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/dlEmailFriendApi', requestData);
      return handleEmailResponse(response, 'Email sent to friend successfully');
    } catch (error) {
      console.error('Error in diamondEmailFriend:', error);
      throw error;
    }
  },

  /**
   * Schedule viewing for diamond
   * @param {Object} formData - Form data for schedule viewing
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  diamondScheduleViewing: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        schl_message: formData.schl_message,
        location: formData.location,
        availability_date: formData.availability_date,
        appnt_time: formData.appnt_time,
        diamondurl: window.location.href,
        diamondid: formData.diamondId,
        diamondtype: formData.diamondType,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/dlScheViewApi', requestData);
      return handleEmailResponse(response, 'Viewing scheduled successfully');
    } catch (error) {
      console.error('Error in diamondScheduleViewing:', error);
      throw error;
    }
  },

  // ==================== RING EMAIL APIs ====================

  /**
   * Drop a hint for ring
   * @param {Object} formData - Form data for drop hint
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  ringDropHint: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        hint_Recipient_name: formData.hint_Recipient_name,
        hint_Recipient_email: formData.hint_Recipient_email,
        reason_of_gift: formData.reason_of_gift,
        hint_message: formData.hint_message,
        deadline: formData.deadline,
        ring_url: window.location.href,
        settingid: formData.settingId,
        islabsettings: formData.isLabSetting,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/dropHintApi', requestData);
      return handleEmailResponse(response, 'Hint dropped successfully');
    } catch (error) {
      console.error('Error in ringDropHint:', error);
      throw error;
    }
  },

  /**
   * Request more info for ring
   * @param {Object} formData - Form data for request info
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  ringRequestInfo: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        message: formData.message,
        contact_preference: formData.contact_preference,
        ring_url: window.location.href,
        settingid: formData.settingId,
        islabsettings: formData.isLabSetting,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/reqInfoApi', requestData);
      return handleEmailResponse(response, 'Request sent successfully');
    } catch (error) {
      console.error('Error in ringRequestInfo:', error);
      throw error;
    }
  },

  /**
   * Email a friend about ring
   * @param {Object} formData - Form data for email friend
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  ringEmailFriend: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        frnd_name: formData.frnd_name,
        frnd_email: formData.frnd_email,
        frnd_message: formData.frnd_message,
        ring_url: window.location.href,
        settingid: formData.settingId,
        islabsettings: formData.isLabSetting,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/emailFriendApi', requestData);
      return handleEmailResponse(response, 'Email sent to friend successfully');
    } catch (error) {
      console.error('Error in ringEmailFriend:', error);
      throw error;
    }
  },

  /**
   * Schedule viewing for ring
   * @param {Object} formData - Form data for schedule viewing
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  ringScheduleViewing: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        schl_message: formData.schl_message,
        location: formData.location,
        availability_date: formData.availability_date,
        appnt_time: formData.appnt_time,
        ring_url: window.location.href,
        settingid: formData.settingId,
        islabsettings: formData.isLabSetting,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/scheViewApi', requestData);
      return handleEmailResponse(response, 'Viewing scheduled successfully');
    } catch (error) {
      console.error('Error in ringScheduleViewing:', error);
      throw error;
    }
  },

  // ==================== COMPLETE RING EMAIL APIs ====================

  /**
   * Request more info for complete ring
   * @param {Object} formData - Form data for request info
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  completeRingRequestInfo: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        req_message: formData.req_message,
        contact_preference: formData.contact_preference,
        ring_url: formData.ringUrl || window.location.href,
        diamondurl: formData.diamondUrl || window.location.href,
        settingid: formData.settingId,
        diamondid: formData.diamondId,
        diamondtype: formData.diamondType,
        islabsettings: formData.isLabSetting,
        price: formData.price,
        max_carat: formData.max_carat,
        min_carat: formData.min_carat,
        metalType: formData.metalType,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/crReqInfoApi', requestData);
      return handleEmailResponse(response, 'Request sent successfully');
    } catch (error) {
      console.error('Error in completeRingRequestInfo:', error);
      throw error;
    }
  },

  /**
   * Schedule viewing for complete ring
   * @param {Object} formData - Form data for schedule viewing
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  completeRingScheduleViewing: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        schl_message: formData.schl_message,
        location: formData.location,
        availability_date: formData.availability_date,
        appnt_time: formData.appnt_time,
        ring_url: formData.ringUrl || window.location.href,
        diamondurl: formData.diamondUrl || window.location.href,
        settingid: formData.settingId,
        diamondid: formData.diamondId,
        diamondtype: formData.diamondType,
        islabsettings: formData.isLabSetting,
        price: formData.price,
        max_carat: formData.max_carat,
        min_carat: formData.min_carat,
        metalType: formData.metalType,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/crScheViewApi', requestData);
      return handleEmailResponse(response, 'Viewing scheduled successfully');
    } catch (error) {
      console.error('Error in completeRingScheduleViewing:', error);
      throw error;
    }
  },

  /**
   * Drop a hint for complete ring
   * @param {Object} formData - Form data for drop hint
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  completeRingDropHint: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        hint_Recipient_name: formData.hint_Recipient_name,
        hint_Recipient_email: formData.hint_Recipient_email,
        reason_of_gift: formData.reason_of_gift,
        hint_message: formData.hint_message,
        deadline: formData.deadline,
        ring_url: formData.ringUrl || window.location.href,
        diamondurl: formData.diamondUrl || window.location.href,
        settingid: formData.settingId,
        diamondid: formData.diamondId,
        diamondtype: formData.diamondType,
        islabsettings: formData.isLabSetting,
        price: formData.price,
        max_carat: formData.max_carat,
        min_carat: formData.min_carat,
        metalType: formData.metalType,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/crDropHintApi', requestData);
      return handleEmailResponse(response, 'Hint dropped successfully');
    } catch (error) {
      console.error('Error in completeRingDropHint:', error);
      throw error;
    }
  },

  /**
   * Email a friend about complete ring
   * @param {Object} formData - Form data for email friend
   * @param {string} recaptchaToken - reCAPTCHA token
   * @returns {Promise<Object>} Response data
   */
  completeRingEmailFriend: async (formData, recaptchaToken) => {
    try {
      const emailClient = createEmailClient();
      const requestData = getCommonFormData({
        name: formData.name,
        email: formData.email,
        phone_no: formData.phone_no,
        frnd_name: formData.frnd_name,
        frnd_email: formData.frnd_email,
        frnd_message: formData.frnd_message,
        ring_url: formData.ringUrl || window.location.href,
        diamondurl: formData.diamondUrl || window.location.href,
        settingid: formData.settingId,
        diamondid: formData.diamondId,
        diamondtype: formData.diamondType,
        islabsettings: formData.isLabSetting,
        price: formData.price,
        max_carat: formData.max_carat,
        min_carat: formData.min_carat,
        metalType: formData.metalType,
        recaptchaToken: recaptchaToken,
      });

      const response = await emailClient.post('/crEmailFriendApi', requestData);
      return handleEmailResponse(response, 'Email sent to friend successfully');
    } catch (error) {
      console.error('Error in completeRingEmailFriend:', error);
      throw error;
    }
  },

  // ==================== UTILITY METHODS ====================

  /**
   * Get diamond details for email purposes
   * @param {string} diamondId - Diamond ID
   * @param {string} type - Diamond type
   * @param {string} shop - Shop domain
   * @param {boolean} showRetailerInfo - Whether to show retailer info
   * @returns {Promise<Object>} Diamond details
   */
  getDiamondDetails: async (diamondId, type, shop, showRetailerInfo = true) => {
    try {
      const emailClient = createEmailClient();
      const response = await emailClient.get(
        `/getDiamondDetailsApi/${diamondId}/${type}/${shop}/${showRetailerInfo}`
      );
      return response.data;
    } catch (error) {
      console.error('Error in getDiamondDetails:', error);
      throw error;
    }
  },

  /**
   * Validate reCAPTCHA token (if needed)
   * @param {string} token - reCAPTCHA token
   * @returns {Promise<boolean>} Validation result
   */
  validateRecaptcha: async (token) => {
    try {
      // This would typically call your backend reCAPTCHA validation endpoint
      // For now, we'll assume the token is valid if it exists
      return !!token;
    } catch (error) {
      console.error('Error in validateRecaptcha:', error);
      return false;
    }
  }
};
