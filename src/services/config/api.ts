const getBaseUrl = () => {
  // Vite environment variable
  if (import.meta.env.VITE_API_URL) {
    console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // Production fallback
  if (import.meta.env.PROD) {
    console.log('Using production API URL');
    return 'https://api.itprologistics.com';
  }

  console.log('Using local development API URL');
  return 'http://localhost:5000/api';
};

const baseUrl = getBaseUrl();

export const API_URL = baseUrl;
export const API_AUTH_URL = `${baseUrl}/auth`;

export const API_CONFIG = {
  BASE_URL: baseUrl,
  AUTH: `${baseUrl}/auth`,
};
