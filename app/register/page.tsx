'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Eye, EyeOff, Lock, User, Mail, UserCheck, AlertCircle, CheckSquare, Square, Sparkles } from 'lucide-react';
import { registerAction } from '../actions/auth';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_CLIENT_ID = '956589611008-ftqqljp9fo186apcmsrguommeaftf5eg.apps.googleusercontent.com';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { loginWithGoogle, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Consent states
  const [isToSAccepted, setIsToSAccepted] = useState(false);
  const [isKVKKAcknowledged, setIsKVKKAcknowledged] = useState(false);
  const [isExplicitConsentGiven, setIsExplicitConsentGiven] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Eğer zaten giriş yapılmışsa yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(response.credential);
      if (res.success) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(res.message || 'Google ile bağlantı başarısız.');
      }
    } catch (err) {
      setError('Google ile bağlanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const initGoogleSignIn = () => {
    if (typeof window !== 'undefined' && (window as any).google) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          cancel_on_tap_outside: true,
        });
        
        const googleBtnDiv = document.getElementById('google-signup-btn-container');
        if (googleBtnDiv) {
          (window as any).google.accounts.id.renderButton(
            googleBtnDiv,
            { 
              theme: 'outline', 
              size: 'large', 
              width: 240, 
              shape: 'pill',
              text: 'signup_with'
            }
          );
        }
      } catch (err) {
        console.error('Google Sign-In initialization failed:', err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      initGoogleSignIn();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (!isToSAccepted || !isKVKKAcknowledged) {
      setError('Kayıt olabilmek için Kullanım Şartları\'nı kabul etmeli ve KVKK Aydınlatma Metni\'ni okumalısınız.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerAction(
        name.trim(),
        email.trim(),
        username.trim(),
        password.trim()
      );

      if (res.success) {
        setSuccess('Kaydınız başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push(`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`);
        }, 2000);
      } else {
        setError(res.message || 'Kayıt sırasında bir hata oluştu.');
      }
    } catch (err) {
      setError('Sistem hatası. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 p-8 shadow-xl relative overflow-hidden">
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
        onLoad={initGoogleSignIn}
      />

      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D00]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF4D00]/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="flex items-center group relative mb-4">
          <Image
            src="/images/menuland-600x200.png"
            alt="Menuland Logo"
            width={160}
            height={53}
            priority
            className="object-contain"
          />
          <span className="absolute -top-1 -right-8 text-[8px] font-black tracking-widest text-[#FF4D00]/85 select-none bg-orange-50 px-1.5 py-0.5 rounded-full">
            BETA
          </span>
        </Link>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
          Bireysel Kayıt <Sparkles className="h-5 w-5 text-[#FF4D00]" />
        </h1>
        <p className="text-xs text-zinc-500 mt-1.5 text-center">
          Menuland dünyasına katılın, favori mekanlarınızı seçin ve indirimler kazanın.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-150 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-green-700 animate-pulse">
          <AlertCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-650" htmlFor="name">
            Ad Soyad
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-zinc-400" />
            </span>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız ve Soyadınız"
              disabled={loading}
              className="w-full bg-zinc-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-450 focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-650" htmlFor="email">
            E-posta Adresi
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-zinc-400" />
            </span>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="eposta@adresiniz.com"
              disabled={loading}
              className="w-full bg-zinc-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-450 focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-650" htmlFor="username">
            Kullanıcı Adı
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <UserCheck className="h-4 w-4 text-zinc-400" />
            </span>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="kullanıcıadınız"
              disabled={loading}
              className="w-full bg-zinc-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-450 focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-650" htmlFor="password">
            Şifre
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-zinc-400" />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full bg-zinc-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-11 text-sm text-zinc-900 placeholder-zinc-450 focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-605"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Agreements Consent */}
        <div className="space-y-3 pt-2">
          {/* ToS Checkbox */}
          <button 
            type="button"
            className="flex items-start gap-2.5 text-left w-full touch-manipulation"
            onClick={() => setIsToSAccepted(!isToSAccepted)}
          >
            <div className="mt-0.5 shrink-0 text-[#FF4D00]">
              {isToSAccepted ? <CheckSquare className="h-4.5 w-4.5 fill-[#FF4D00]/10 pointer-events-none" /> : <Square className="h-4.5 w-4.5 text-zinc-350 pointer-events-none" />}
            </div>
            <span className="text-[11px] leading-relaxed text-zinc-650">
              <span onClick={(e) => e.stopPropagation()}>
                <Link href="/kullanim-kosullari" target="_blank" className="text-[#FF4D00] font-bold hover:underline">
                  Kullanım Şartları
                </Link>
              </span>
              &apos;nı kabul ediyorum. <span className="text-[#FF4D00] font-bold">(Zorunlu)</span>
            </span>
          </button>

          {/* KVKK Checkbox */}
          <button 
            type="button"
            className="flex items-start gap-2.5 text-left w-full touch-manipulation"
            onClick={() => setIsKVKKAcknowledged(!isKVKKAcknowledged)}
          >
            <div className="mt-0.5 shrink-0 text-[#FF4D00]">
              {isKVKKAcknowledged ? <CheckSquare className="h-4.5 w-4.5 fill-[#FF4D00]/10 pointer-events-none" /> : <Square className="h-4.5 w-4.5 text-zinc-350 pointer-events-none" />}
            </div>
            <span className="text-[11px] leading-relaxed text-zinc-650">
              <span onClick={(e) => e.stopPropagation()}>
                <Link href="/kvkk" target="_blank" className="text-[#FF4D00] font-bold hover:underline">
                  KVKK Aydınlatma Metni
                </Link>
              </span>
              &apos;ni okudum ve bilgilendirildim. <span className="text-[#FF4D00] font-bold">(Zorunlu)</span>
            </span>
          </button>

          {/* Explicit Consent Checkbox */}
          <button 
            type="button"
            className="flex items-start gap-2.5 text-left w-full touch-manipulation"
            onClick={() => setIsExplicitConsentGiven(!isExplicitConsentGiven)}
          >
            <div className="mt-0.5 shrink-0 text-[#FF4D00]">
              {isExplicitConsentGiven ? <CheckSquare className="h-4.5 w-4.5 fill-[#FF4D00]/10 pointer-events-none" /> : <Square className="h-4.5 w-4.5 text-zinc-350 pointer-events-none" />}
            </div>
            <span className="text-[11px] leading-relaxed text-zinc-650">
              <span onClick={(e) => e.stopPropagation()}>
                <Link href="/kvkk" target="_blank" className="text-[#FF4D00] font-bold hover:underline">
                  Açık Rıza Metni
                </Link>
              </span>
              &apos;ni onaylıyorum. <span className="text-zinc-400">(İsteğe Bağlı)</span>
            </span>
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !isToSAccepted || !isKVKKAcknowledged}
          className="w-full bg-[#FF4D00] hover:bg-[#e04300] disabled:bg-zinc-305 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-[#FF4D00]/15 hover:shadow-[#FF4D00]/25 transition-all flex justify-center items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Hesap Oluştur'
          )}
        </button>
      </form>

      {/* Social Logins */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider text-zinc-400 mb-5">
          <span className="bg-white px-3 z-10">Sosyal Hesaplar ile Kayıt Ol</span>
        </div>

        <div className="space-y-3 flex flex-col items-center">
          {/* Google Sign-in Container */}
          <div id="google-signup-btn-container" className="w-[240px] h-[40px] flex justify-center" />

          {/* Apple placeholder */}
          <button
            type="button"
            onClick={() => alert('Apple ile Kayıt yakında web sitemizde de aktif olacaktır. Lütfen Google ile kayıt olun veya şifrenizi kullanın.')}
            className="w-[240px] flex items-center justify-center gap-2 bg-black border border-black rounded-full h-[40px] text-xs font-bold text-white hover:bg-zinc-850 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.17.67-2.88 1.49-.6.69-1.12 1.84-.98 2.94 1.1.09 2.21-.56 2.87-1.37z" />
            </svg>
            Apple ile Kayıt (Yakında)
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-zinc-500 font-semibold">
          Zaten bir hesabınız var mı?{' '}
          <Link href={`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-[#FF4D00] hover:underline font-bold">
            Giriş Yapın
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10">
      <Suspense fallback={<div className="text-zinc-500 text-sm font-semibold">Yükleniyor...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
