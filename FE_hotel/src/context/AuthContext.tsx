import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService from '../services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (userData: any) => void;
  logout: () => void;
  updateAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  const updateAuthState = () => {
    const authenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();
    setIsAuthenticated(authenticated);
    setUser(currentUser);
  };

  useEffect(() => {
    updateAuthState();
  }, []);

  const login = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
