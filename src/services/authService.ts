const API_URL = 'http://localhost:5000/api/auth';

interface AuthResponse {
  token?: string;
  msg?: string; 
  message?: string; 
}

const register = async (fullname: string, email: string, phone: string, password: string, role: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/register`, {
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
};

const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
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
};

const logout = (): void => {
  localStorage.removeItem('token');
};

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const authService = {
  register,
  login,
  logout,
  getToken,
};

export default authService;
