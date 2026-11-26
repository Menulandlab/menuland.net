'use client';

import React, { createContext, useContext, useMemo, useState, useSyncExternalStore, ReactNode } from 'react';
import { User } from '@/src/context/AuthContext';
import { loginAction, logoutAction, loginWithGoogleAction } from '../app/actions/auth';

/**
 * Oturumdaki kullanıcı tarayıcıda authUser çerezinden okunur. Jeton httpOnly authToken çerezinde durur ve buradan
 * görünmez; iki çerez birlikte yazılıp birlikte silinir (sunucu eylemleri: app/actions/auth.ts). Jetonun süresi
 * dolmuşsa ilk API isteği 401 alır ve sunucu eylemi iki çerezi de siler.
 *
 * 26.11.2026'ya kadar oturum her sayfa açılışında bir sunucu eylemiyle (getSessionAction) alınıyordu; her ziyaret
 * Vercel'de ayrı bir sunucu çağrısı demekti. Artık çerez tarayıcıda okunur, sunucuya istek gitmez.
 *
 * Çerez giriş, kayıt ve çıkış sunucu eylemleriyle değişir; eylem bitince oturumDegisti() çağrılır ve bileşenler
 * çerezi yeniden okur.
 */
const dinleyiciler = new Set<() => void>();

function oturumaAboneOl(dinleyici: () => void) {
  dinleyiciler.add(dinleyici);
  return () => {
    dinleyiciler.delete(dinleyici);
  };
}

function oturumDegisti() {
  // Bildirim bir sonraki görev turuna bırakılır. Hemen çağrılınca, girişten sonra sayfanın kendi yönlendirmesi
  // (router.push) ile aynı anda zorunlu bir yeniden çizim tetikleniyor ve yönlendirme yarıda kalıyordu (26.11.2026).
  setTimeout(() => dinleyiciler.forEach((dinleyici) => dinleyici()), 0);
}

function cerezDegeri(): string | null {
  const satir = document.cookie.split('; ').find((cerez) => cerez.startsWith('authUser='));
  return satir ? satir.slice('authUser='.length) : null;
}

function kullaniciyiCoz(ham: string | null): User | null {
  if (!ham) return null;
  try {
    const kullanici = JSON.parse(decodeURIComponent(ham));
    return kullanici && typeof kullanici === 'object' && kullanici.id ? (kullanici as User) : null;
  } catch {
    return null;
  }
}

const bosAbonelik = () => () => {};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (googleToken: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  /** Çerezler bir sunucu eyleminde değiştiyse (ör. oturum süresi dolunca silindiyse) oturumu yeniden okur. */
  oturumuYenile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Sunucuda ve sayfa ilk canlanırken oturum bilinmez (null); tarayıcıda çerezden okunur.
  const cerez = useSyncExternalStore(oturumaAboneOl, cerezDegeri, () => null);
  const tarayicida = useSyncExternalStore(bosAbonelik, () => true, () => false);
  const [islemde, setIslemde] = useState(false);

  const user = useMemo(() => kullaniciyiCoz(cerez), [cerez]);
  const isAuthenticated = user !== null;
  const isLoading = !tarayicida || islemde;

  const login = async (username: string, password: string) => {
    setIslemde(true);
    try {
      const res = await loginAction(username, password);
      return res.success && res.user ? { success: true } : { success: false, message: res.message };
    } finally {
      oturumDegisti();
      setIslemde(false);
    }
  };

  const loginWithGoogle = async (googleToken: string) => {
    setIslemde(true);
    try {
      const res = await loginWithGoogleAction(googleToken);
      return res.success && res.user ? { success: true } : { success: false, message: res.message };
    } finally {
      oturumDegisti();
      setIslemde(false);
    }
  };

  const logout = async () => {
    setIslemde(true);
    try {
      await logoutAction();
    } finally {
      oturumDegisti();
      setIslemde(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, loginWithGoogle, logout, oturumuYenile: oturumDegisti }}
    >
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
