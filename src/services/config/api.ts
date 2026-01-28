const getBaseUrl = () => {
  // If we have an environment variable set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // For production, use relative path
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
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