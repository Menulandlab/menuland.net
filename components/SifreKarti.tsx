import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';

/** Şifremi unuttum ve şifre yenile sayfalarının kartı (giriş sayfasıyla aynı görünüm). */
export default function SifreKarti({ baslik, aciklama, children }: { baslik: string; aciklama?: string; children: ReactNode }) {
  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 p-8 shadow-xl relative overflow-hidden">
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="flex items-center mb-4 koyu-mod-muaf">
          <Image src="/images/menuland-600x200.png" alt="Menuland Logo" width={160} height={53} className="object-contain" />
        </Link>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{baslik}</h1>
        {aciklama && <p className="text-xs text-zinc-500 mt-1.5 text-center leading-relaxed">{aciklama}</p>}
      </div>
      {children}
      <div className="mt-8 text-center">
        <Link href="/login" className="text-xs font-bold text-[#D63F00] hover:underline">
          Giriş sayfasına dön
        </Link>
      </div>
    </div>
  );
}
