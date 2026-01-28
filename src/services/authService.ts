import { API_AUTH_URL } from "./config/api";

interface AuthResponse {
  token?: string;
  msg?: string;
  message?: string;
  success?: boolean;
  status?: string;
  data?: any;
  error?: string;
}

interface InitiateResetResponse {
  success?: boolean;
  message?: string;
  status?: string; // Add this line
  data?: {
    message?: string;
    token?: string;
    status?: string;

  };
  error?: any;
  response?: {
    data?: {
      status?: string;
      message?: string;
      msg?: string;
    }
  };
}

interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
  error?: string;
}

interface ResetPasswordResponse {
  success?: boolean;
  message?: string;
  msg?: string;
  status?: string; // Add this line
  data?: {
    message?: string;
    token?: string;
  };
  error?: any;
  response?: {
    data?: {
      message?: string;
      msg?: string;
      status?: string;
    }
  };
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
  error?: string;
}

interface VerifyOtpResponse {
  success?: boolean;
  message?: string;
  status?: string;
  data?: {
    message?: string;
    valid?: boolean;
    token?: string; 
    status?: string;
  }
    error?: string;
}

const register = async (
  fullname: string, 
  email: string, 
  phone: string, 
  password: string, 
  role: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_AUTH_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullname, email, phone, password, role }),
    });

    const data: AuthResponse = await response.json();
    if (response.ok && data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      msg: 'Network error. Please try again.', 
      error: 'Network error' 
    };
  }
};

const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();
    if (response.ok && data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { 
      msg: 'Network error. Please try again.', 
      error: 'Network error' 
    };
  }
};

// Initiate password reset - sends OTP to email
const initiatePasswordReset = async (email: any): Promise<InitiateResetResponse> => {
  try {
    const response = await fetch(`${API_AUTH_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data: InitiateResetResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Initiate password reset error:', error);
    return { 
      message: 'Network error. Please try again.', 
      error: 'Network error' 
    };
  }
};

// Verify OTP for password reset
const verifyOtp = async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
  try {
    const response = await fetch(`${API_AUTH_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: VerifyOtpResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { 
      message: 'Network error. Please try again.', 
      error: 'Network error' 
    };
  }
};

// Reset password with OTP verification
const resetPassword = async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
  try {
    const response = await fetch(`${API_AUTH_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: ResetPasswordResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    return { 
      message: 'Network error. Please try again.', 
      error: 'Network error' 
    };
  }
};

// Optional: Resend OTP
const resendOtp = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_AUTH_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data: AuthResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { 
      msg: 'Network error. Please try again.', 
      error: 'Network error' 
    };
  }
};

const logout = (): void => {
  localStorage.removeItem('token');
  // Optional: Clear other auth-related items
  localStorage.removeItem('user');
  sessionStorage.clear();
};

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  // Optional: Add token expiration check
  // You can decode JWT token and check expiration
  try {
    // Example for JWT token:
    // const payload = JSON.parse(atob(token.split('.')[1]));
    // return payload.exp * 1000 > Date.now();
    return true;
  } catch {
    return false;
  }
};

// Get current user from token (if JWT)
const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const authService = {
  register,
  login,
  initiatePasswordReset,
  verifyOtp,
  resetPassword,
  resendOtp,
  logout,
  getToken,
  isAuthenticated,
  getCurrentUser,
};

export default authService;