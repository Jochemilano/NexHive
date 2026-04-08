const getBaseURL = () => {
  if (process.env.REACT_APP_BASE_URL) {
    return process.env.REACT_APP_BASE_URL;
  }
  const host = window.location.hostname;
  return `http://${host}:3001`;
};

const BASE = getBaseURL();

export const CONFIG = {
  BASE_URL: BASE,
  API_URL:    `${BASE}/api`,
  UPLOAD_URL: `${BASE}/upload`,
  STATIC_URL: `${BASE}`,
};