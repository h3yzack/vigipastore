import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token on app startup
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const email = localStorage.getItem('userEmail');
      
      if (token && email) {
        setUser({ email });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (email: string, token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    setUser({ email });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};