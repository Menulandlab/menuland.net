import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';

// Sitenin Türkçe 404 sayfası (16.11.2026). Önce Next.js'in İngilizce varsayılan sayfası görünüyordu.
export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı',
  robots: { index: false, follow: true },
};

export default function SayfaBulunamadi() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <Compass className="h-14 w-14 text-zinc-300" aria-hidden="true" />
      <h1 className="text-2xl font-black text-zinc-900">Sayfa bulunamadı</h1>
      <p className="max-w-md text-sm text-zinc-500">Aradığınız sayfa kaldırılmış ya da adresi değişmiş olabilir.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/" className="rounded-full bg-[#FF4D00] px-5 py-2 text-xs font-bold text-white">
          Ana Sayfa
        </Link>
        <Link href="/sehirler" className="rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-zinc-700 hover:border-[#FF4D00]">
          Şehirler
        </Link>
        <Link href="/all-businesses" className="rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-bold text-zinc-700 hover:border-[#FF4D00]">
          Tüm Mekanlar
        </Link>
      </div>
    </div>
  );
}
