import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';

interface BlogCtaCardProps {
  type?: 'business' | 'user' | 'none';
}

export default function BlogCtaCard({ type = 'business' }: BlogCtaCardProps) {
  if (type === 'none') return null;

  if (type === 'user') {
    return (
      <div className="bg-gradient-to-b from-zinc-50 to-orange-50/30 border border-orange-100 rounded-3xl p-8 sm:p-12 text-center my-8 shadow-xs flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 bg-[#FF4D00]/10 text-[#FF4D00] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <Compass className="h-4 w-4" /> Menuland Keşfet
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-3">
          Şehrin En İyi Mekanlarını ve Menülerini Keşfedin!
        </h3>
        <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed mb-8">
          Yakınınızdaki popüler lezzet duraklarını, güncel fiyatlı menüleri ve kullanıcı değerlendirmelerini hemen inceleyin.
        </p>
        <Link
          href="/kesfet"
          className="inline-flex items-center justify-center gap-2 bg-[#FF4D00] hover:bg-[#e04400] text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-[#FF4D00]/25 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          Mekanları Keşfet <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Default: business (İşletmeler İçin)
  return (
    <div className="bg-gradient-to-b from-zinc-50 to-zinc-100/60 border border-gray-150 rounded-3xl p-8 sm:p-12 text-center my-8 shadow-xs flex flex-col items-center">
      <div className="inline-flex items-center gap-1.5 bg-[#FF4D00]/10 text-[#FF4D00] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
        <Sparkles className="h-4 w-4" /> İşletmeniz İçin Menuland
      </div>
      <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-3">
        Bu özellikleri işletmenizde denemek ister misiniz?
      </h3>
      <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed mb-8">
        Menuland ile saniyeler içinde kendi dijital menünüzü oluşturun, müşteri etkileşiminizi artırın.
      </p>
      <a
        href="https://isletme.menuland.net/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 bg-[#FF4D00] hover:bg-[#e04400] text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-[#FF4D00]/25 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
      >
        Hemen Ücretsiz Başla <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
