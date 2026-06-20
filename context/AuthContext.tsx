'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/src/context/AuthContext';
import { loginAction, logoutAction, getSessionAction, loginWithGoogleAction } from '../app/actions/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (googleToken: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa yüklendiğinde aktif oturumu getir
  useEffect(() => {
    async function initSession() {
      try {
        const session = await getSessionAction();
        setUser(session.user);
        setIsAuthenticated(session.isAuthenticated);
      } catch (e) {
        console.error('Session initialization failed:', e);
      } finally {
        setIsLoading(false);
      }
    }
    initSession();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    const res = await loginAction(username, password);
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, message: res.message };
  };

  const loginWithGoogle = async (googleToken: string) => {
    setIsLoading(true);
    const res = await loginWithGoogleAction(googleToken);
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, message: res.message };
  };

  const logout = async () => {
    setIsLoading(true);
    await logoutAction();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, loginWithGoogle, logout }}>
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
