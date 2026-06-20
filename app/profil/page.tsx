'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, 
  Calendar, 
  Heart, 
  MessageSquare, 
  HelpCircle, 
  LogOut, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Building,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profil');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = async () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      setLoading(true);
      await logout();
      router.push('/');
    }
  };

  if (authLoading || (!isAuthenticated && !user) || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 text-[#FF4D00] animate-spin" />
        <span className="text-zinc-500 font-semibold text-sm">Profil yükleniyor...</span>
      </div>
    );
  }

  // Katılım Yılı hesabı
  const joinYear = user?.created_at 
    ? new Date(user.created_at).getFullYear() 
    : new Date().getFullYear();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Geri Dönüş Linki */}
      <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4D00] hover:underline mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Ana Sayfaya Dön
      </Link>

      {/* Profil Kartı */}
      <div className="bg-gradient-to-br from-white to-zinc-50/50 rounded-3xl border border-gray-100 p-6 md:p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-orange-100 text-[#FF4D00] flex items-center justify-center font-black text-2xl md:text-3xl shadow-inner shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{user?.name}</h1>
              {user?.is_verified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  <UserCheck className="h-3.5 w-3.5" /> Doğrulanmış
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-sm mt-1">@{user?.username}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-zinc-650 max-w-md">
            <div className="flex items-center justify-center md:justify-start gap-2 bg-white border border-gray-100 px-3 py-2.5 rounded-xl">
              <Mail className="h-4 w-4 text-[#FF4D00]" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 bg-white border border-gray-100 px-3 py-2.5 rounded-xl">
              <Phone className="h-4 w-4 text-[#FF4D00]" />
              <span>{user?.phone || 'Telefon belirtilmemiş'}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 self-center md:self-start">
          <span className="inline-block text-xs font-bold text-zinc-500 bg-zinc-100 px-4 py-1.5 rounded-full border border-zinc-200">
            {user?.role === 'business' ? 'İşletme Hesabı' : 'Bireysel Hesap'}
          </span>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-100 p-4 rounded-2xl text-center flex flex-col items-center justify-center shadow-sm">
          <Heart className="h-5 w-5 text-[#FF4D00] mb-1.5" />
          <span className="text-xl font-bold text-zinc-900">{user?.favorite_business_ids?.length || 0}</span>
          <span className="text-[10px] sm:text-xs text-zinc-500 font-bold mt-1">Favoriler</span>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-2xl text-center flex flex-col items-center justify-center shadow-sm">
          <Calendar className="h-5 w-5 text-blue-500 mb-1.5" />
          <span className="text-xl font-bold text-zinc-900">{joinYear}</span>
          <span className="text-[10px] sm:text-xs text-zinc-500 font-bold mt-1">Katılım Yılı</span>
        </div>

        <div className="bg-white border border-gray-100 p-4 rounded-2xl text-center flex flex-col items-center justify-center shadow-sm">
          <MessageSquare className="h-5 w-5 text-emerald-500 mb-1.5" />
          <span className="text-xl font-bold text-zinc-900">0</span>
          <span className="text-[10px] sm:text-xs text-zinc-500 font-bold mt-1">Yorumlar</span>
        </div>
      </div>

      {/* Menü Seçenekleri */}
      <div className="bg-white rounded-3xl border border-gray-100 divide-y divide-gray-100 shadow-sm overflow-hidden mb-8">
        {/* Rezervasyonlarım */}
        <Link 
          href="/rezervasyonlarim" 
          className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-50 text-[#FF4D00] flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-zinc-900">Rezervasyonlarım</span>
              <span className="block text-[10px] text-zinc-500">Masa rezervasyonlarınızı görüntüleyin</span>
            </div>
          </div>
          <span className="text-zinc-400 group-hover:translate-x-0.5 transition-transform text-xs font-semibold">→</span>
        </Link>

        {/* PuanLand */}
        <div 
          className="flex items-center justify-between p-5 hover:bg-zinc-50/50 transition-colors group cursor-not-allowed"
          title="Çok Yakında"
        >
          <div className="flex items-center gap-3 opacity-60">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-zinc-900">PuanLand Hesabım</span>
              <span className="block text-[10px] text-zinc-500">Puanland puanlarınızı yönetin</span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#FF4D00] bg-orange-50 px-2.5 py-1 rounded-full">Yakında</span>
        </div>

        {/* Yardım & İletişim */}
        <Link 
          href="/iletisim" 
          className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-zinc-900">Yardım & Destek</span>
              <span className="block text-[10px] text-zinc-500">Müşteri hizmetleri ve iletişim kanalları</span>
            </div>
          </div>
          <span className="text-zinc-400 group-hover:translate-x-0.5 transition-transform text-xs font-semibold">→</span>
        </Link>
      </div>

      {/* Çıkış Yap Butonu */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-rose-100 text-sm font-bold text-rose-600 hover:bg-rose-50 hover:borderColor-rose-250 transition-all cursor-pointer shadow-sm shadow-rose-100/50"
        >
          <LogOut className="h-4.5 w-4.5" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
