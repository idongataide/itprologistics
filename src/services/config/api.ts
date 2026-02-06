const getBaseUrl = () => {
  // If we have an environment variable set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // For production, use cPanel backend URL
  if (process.env.NODE_ENV === 'production') {
    console.log('Using production API URL');
    return 'https://api.itprologistics.com/api';
  }
  console.log('Using development API URL');
  // Default to local development
  return 'http://localhost:5000/api';
};

const baseUrl = getBaseUrl();

export const API_URL = baseUrl; 
export const API_AUTH_URL = `${baseUrl}/auth`;

export const API_CONFIG = {
  BASE_URL: baseUrl,
  AUTH: `${baseUrl}/auth`,
};