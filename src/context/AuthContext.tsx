
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthContextProps {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user session
  useEffect(() => {
    const storedUser = localStorage.getItem('assurecare_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, this would be an API call
    const user = mockUsers.find(u => u.email === email);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('assurecare_user', JSON.stringify(user));
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('Invalid email or password'));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('assurecare_user');
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
