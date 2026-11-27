import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { jetonDurumu } from '@/lib/sifre';
import SifreKarti from '@/components/SifreKarti';
import SifreYenileFormu from './SifreYenileFormu';

export const metadata: Metadata = {
  title: 'Şifre yenile',
  robots: { index: false, follow: false },
  // Bağlantıdaki jeton başka sitelere "geldiği adres" olarak gitmesin.
  referrer: 'no-referrer',
};

type Props = { searchParams: Promise<{ j?: string | string[] }> };

/** E-postadaki şifre yenileme bağlantısının açtığı sayfa (/sifre-yenile?j=…). */
export default async function SifreYenileSayfasi({ searchParams }: Props) {
  const { j } = await searchParams;
  const jeton = Array.isArray(j) ? j[0] : j;
  const durum = jetonDurumu(jeton);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10">
      {durum === 'gecerli' && jeton ? (
        <SifreYenileFormu jeton={jeton} />
      ) : (
        <SifreKarti baslik="Şifre yenile">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-amber-800">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {durum === 'suresi_dolmus'
                ? 'Bu bağlantının süresi dolmuş. Şifre yenileme bağlantıları 1 saat geçerlidir.'
                : 'Bu bağlantı geçersiz. E-postadaki bağlantının tamamını açtığınızdan emin olun.'}
            </span>
          </div>
          <Link
            href="/sifremi-unuttum"
            className="mt-6 w-full bg-[#D63F00] hover:bg-[#B83600] text-white font-black text-sm py-3.5 rounded-2xl transition-colors flex justify-center"
          >
            Yeni bağlantı iste
          </Link>
        </SifreKarti>
      )}
    </div>
  );
}
