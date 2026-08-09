'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useRef } from 'react';
import { MapPin, ChevronDown, Building, Smartphone } from 'lucide-react';

export default function Header() {
  const { location, cities, districts, selectCity, selectDistrict } = useLocation();
  const { user, logout } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  // Backdrop'a tıklandığında kapat
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      closeDialog();
    }
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 w-full">
        {/* Arka plan katmanı — pointer-events-none ile iOS sticky+blur touch bug'ını engeller */}
        <div className="absolute inset-0 bg-white border-b border-gray-100 pointer-events-none" />

        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
            <Link href="/" className="flex items-center relative pr-7 shrink-0">
              <Image
                src="/images/menuland-600x200.png"
                alt="Menuland Logo"
                width={110}
                height={37}
                priority
                className="object-contain"
              />
              <span className="absolute top-0.5 right-0 text-[8px] font-black tracking-widest text-[#FF4D00]/80">
                BETA
              </span>
            </Link>

            {/* Konum Butonu — <dialog> açar */}
            <button
              type="button"
              onClick={openDialog}
              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-full border border-gray-200 bg-white text-[11px] sm:text-xs font-semibold text-zinc-700 h-9 sm:h-10 shrink-0"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', cursor: 'pointer' }}
            >
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#FF4D00] shrink-0 pointer-events-none" />
              <span className="pointer-events-none max-w-[50px] sm:max-w-[72px] truncate text-left">
                {location.districtName || location.cityName || <span className="text-zinc-400">Konum</span>}
              </span>
              <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-zinc-400 shrink-0 pointer-events-none" />
            </button>
          </div>

          {/* Nav & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 mr-2">
              <Link href="/kesfet" className="hover:text-[#FF4D00] transition-colors">Keşfet</Link>
              <a
                href="https://isletme.menuland.net"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FF4D00] transition-colors flex items-center gap-1"
              >
                <Building className="h-3.5 w-3.5 text-zinc-400" />
                İşletme Kaydı
              </a>
            </nav>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-zinc-900 max-w-[100px] truncate">{user.name}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Link href="/profil" className="text-[9px] text-[#FF4D00] hover:underline font-bold">
                      Profilim
                    </Link>
                    <span className="text-[8px] text-zinc-300">•</span>
                    <Link href="/rezervasyonlarim" className="text-[9px] text-zinc-550 hover:text-[#FF4D00] hover:underline font-bold">
                      Rezervasyonlarım
                    </Link>
                    <span className="text-[8px] text-zinc-300">•</span>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="text-[9px] text-zinc-400 hover:text-red-500 font-bold transition-colors"
                    >
                      Çıkış
                    </button>
                  </div>
                </div>
                <Link
                  href="/profil"
                  className="h-9 w-9 rounded-full bg-orange-100 text-[#FF4D00] flex items-center justify-center font-black text-xs hover:bg-orange-200 transition-all shrink-0"
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[11px] sm:text-xs font-black text-[#FF4D00] hover:text-white px-3 sm:px-4 rounded-full border border-orange-100 hover:bg-[#FF4D00] hover:border-[#FF4D00] transition-all whitespace-nowrap h-9 sm:h-10 flex items-center justify-center"
              >
                Giriş Yap
              </Link>
            )}

            <a
              href="#download-app"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('download-app-footer')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-full bg-[#FF4D00] px-4 py-2 text-xs font-bold text-white hover:bg-[#e04300] transition-all shadow-md shadow-[#FF4D00]/20 hidden sm:flex items-center gap-1.5 whitespace-nowrap"
            >
              <Smartphone className="h-3.5 w-3.5" />
              Uygulamayı İndir
            </a>
          </div>

        </div>
      </header>

      {/* ===== NATIVE DIALOG — Konum Seçici ===== */}
      {/* dialog elementi tarayıcı tarafından native yönetilir — iOS touch sorunları yoktur */}
      <dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        className="w-[calc(100vw-1rem)] max-w-sm rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-4 p-5">
          {/* Başlık */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FF4D00]" />
              <span className="text-sm font-bold text-zinc-900">Konum Seçin</span>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-700 transition-colors text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {/* Şehir */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Şehir</label>
            <select
              value={location.cityId || ''}
              onChange={(e) => {
                const selected = cities.find(c => String(c.id) === e.target.value);
                if (selected) selectCity(String(selected.id), selected.name);
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#FF4D00] focus:outline-none"
            >
              <option value="" disabled>Şehir seçin...</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* İlçe */}
          {location.cityId && districts.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">İlçe</label>
              <select
                value={location.districtId || ''}
                onChange={(e) => {
                  const selected = districts.find(d => String(d.id) === e.target.value);
                  if (selected) {
                    selectDistrict(String(selected.id), selected.name);
                    closeDialog();
                  }
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-zinc-900 focus:border-[#FF4D00] focus:outline-none"
              >
                <option value="" disabled>İlçe seçin...</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Kapat */}
          <button
            type="button"
            onClick={closeDialog}
            className="w-full rounded-xl bg-[#FF4D00] py-3 text-sm font-bold text-white hover:bg-[#e04300] transition-colors"
          >
            Kapat
          </button>
        </div>
      </dialog>
    </>
  );
}
