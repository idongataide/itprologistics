import axios from "axios";

// Helper function to safely access localStorage
const getAuthTokens = () => {
  if (typeof window !== 'undefined') {
    const tokens = localStorage.getItem("adminToken");
    return tokens ? JSON.parse(tokens) : null;
  }
  return null;
};

export const axiosAPIInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/admins',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosAPIInstance.interceptors.request.use(
  async (req) => {
    const authTokens = getAuthTokens();

    if (authTokens?.access) {
      req.headers.Authorization = `Bearer ${authTokens?.access}`;
    }
    return req;
  },
  (error) => {
    console.log("error", error);
    return Promise.reject(error);
  },
);

axiosAPIInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("adminToken");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Enhanced error handler
export const handleApiError = (error: any) => {
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return {
      error: true,
      message: "Cannot connect to server. Please check your network connection.",
      isNetworkError: true,
      originalError: error,
    };
  }

  if (error.code === "ECONNABORTED" || error.code === "ERR_BAD_RESPONSE") {
    return {
      error: true,
      message: "Request timed out. Please try again.",
      isTimeoutError: true,
      originalError: error,
    };
  }

  if (error.response) {
    return {
      error: true,
      message:
        error.response.data?.error ||
        error.response.data?.message ||
        "An error occurred",
      status: error.response.status,
      data: error.response.data,
      originalError: error,
    };
  }

  return {
    error: true,
    message: "An unexpected error occurred",
    originalError: error,
  };
};

// export { axiosAPIInstance };
