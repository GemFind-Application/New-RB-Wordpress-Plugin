const AUTH_TOKEN_KEY = 'AUTH_TOKEN_KEY';
const USER_ID = 'USER_ID';
const ROLE = 'ROLE';
const EMAIL = 'EMAIL';

const setToken = token => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};
const setUserID = userId => {
  localStorage.setItem(USER_ID, userId);
};

const setUserRole = role => {
  localStorage.setItem(ROLE, role);
};

const setEmail = email => {
  localStorage.setItem(EMAIL, email);
};

const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const getUserId = () => localStorage.getItem(USER_ID);

const getUserRole = () => localStorage.getItem(ROLE);

const getEmail = () => localStorage.getItem(EMAIL);

const deleteToken = () => localStorage.removeItem(AUTH_TOKEN_KEY);

const clearStorage = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(EMAIL);
  localStorage.removeItem(ROLE);
  localStorage.removeItem(USER_ID);
};

export const storageHandler = {
  setToken,
  setUserID,
  setUserRole,
  setEmail,
  getToken,
  getUserRole,
  getUserId,
  getEmail,
  deleteToken,
  clearStorage
};
