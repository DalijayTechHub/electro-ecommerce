import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth } from 'aws-amplify';

interface User {
  username: string;
  email: string;
  attributes: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, attributes: any) => Promise<void>;
  logout: () => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const user = await Auth.signIn(email, password);
    setUser(user);
  };

  const register = async (email: string, password: string, attributes: any) => {
    await Auth.signUp({
      username: email,
      password,
      attributes
    });
  };

  const confirmSignUp = async (email: string, code: string) => {
    await Auth.confirmSignUp(email, code);
  };

  const logout = async () => {
    await Auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    confirmSignUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};