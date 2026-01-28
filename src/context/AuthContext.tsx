// context/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService.ts';

interface User {
  id: string;
  role: string;
  // Add any other user properties you expect from the token/backend
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ token?: string; msg?: string; message?: string; }>;
  register: (fullname: string, email: string, phone:string, password: string, role: string) => Promise<{ token?: string; msg?: string; message?: string; }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = authService.getToken();
    if (storedToken) {
      setToken(storedToken);
      // In a real app, you would decode the token or make an API call to get user info
      // For simplicity, we'll just set a placeholder user
      setUser({ id: 'someId', role: 'user' }); // Placeholder
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    if (data.token) {
      setToken(data.token);
      // Decode token or fetch user data
      setUser({ id: 'someId', role: 'user' }); // Placeholder
    }
    return data;
  };

  const register = async (fullname: string, email: string, phone: string, password: string, role: string) => {
    const data = await authService.register(fullname, email, phone, password, role);
    if (data.token) {
      setToken(data.token);
      // Decode token or fetch user data
      setUser({ id: 'someId', role: 'user' }); // Placeholder
    }
    return data;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export both
export { AuthContext };
export default AuthContext; // Keep default export for backward compatibility