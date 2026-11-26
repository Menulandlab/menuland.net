'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCerezTercihi } from '../lib/cerezTercihi';
import { REKLAM_YERLERI, yandexReklaminiCiz, yeniKutuKimligi, type ReklamYeri, type YandexHata } from '../lib/reklam';

interface ReklamAlaniProps {
  yer: ReklamYeri;
  className?: string;
  /**
   * Yalnızca geniş ekranda (1024 px ve üstü) göster (24.11.2026). Kutu ziyaretçinin onayı okunduktan sonra
   * eklendiği için ilk ekrandaki bir yere eklenirse altındaki içeriği aşağı iter; Google bunu sayfa kayması (CLS)
   * sayar. Telefonda ilk ekrana düşen yerler (işletme sayfasının yan sütunu, blog listesinin başı) bu yüzden
   * telefonda reklamsızdır.
   */
  yalnizGenisEkran?: boolean;
}

/**
 * Yandex reklam kutusu. Kutu yalnızca ziyaretçi reklam çerezlerine onay verdiyse çizilir; aksi hâlde sayfada hiç
 * yer kaplamaz ve Yandex betiği yüklenmez. Yandex reklam bulamazsa ya da blok yüklenemezse kutu kaldırılır.
 * Sayfa değişince (aynı türden başka bir işletmeye geçince de) kutu yeniden kurulur ve yeni reklam istenir.
 */
export default function ReklamAlani({ yer, className = '', yalnizGenisEkran = false }: ReklamAlaniProps) {
  const { tercih } = useCerezTercihi();
  const yol = usePathname();
  const [genis, setGenis] = useState(false);
  useEffect(() => {
    if (!yalnizGenisEkran) return;
    const sorgu = window.matchMedia('(min-width: 1024px)');
    const guncelle = () => setGenis(sorgu.matches);
    guncelle();
    sorgu.addEventListener('change', guncelle);
    return () => sorgu.removeEventListener('change', guncelle);
  }, [yalnizGenisEkran]);

  if (tercih?.reklam !== true || (yalnizGenisEkran && !genis)) return null;
  // Anahtar sayfa adresi: başka bir sayfaya geçilince kutu sıfırdan kurulur.
  return <ReklamKutusu key={`${yol}-${yer}`} yer={yer} className={className} />;
}

type Durum = 'bekliyor' | 'dolu' | 'bos';

function ReklamKutusu({ yer, className }: { yer: ReklamYeri; className: string }) {
  const { blok, raporNo } = REKLAM_YERLERI[yer];
  // Kimlik ilk çizimde bir kez üretilir ve kutu yaşadıkça değişmez.
  const [kutuKimligi] = useState(() => yeniKutuKimligi(blok));
  const [durum, setDurum] = useState<Durum>('bekliyor');
  const [hataKodu, setHataKodu] = useState<string | null>(null);
  const istendi = useRef(false);

  useEffect(() => {
    // Geliştirme kipinde React efektleri iki kez çalıştırır; aynı kutu için Yandex'ten ikinci reklam istenmez.
    if (istendi.current) return;
    istendi.current = true;
    yandexReklaminiCiz(
      { blok, kutuKimligi, raporNo },
      {
        reklamVar: () => setDurum('dolu'),
        reklamYok: () => setDurum('bos'),
        hata: (h: YandexHata) => {
          // "warning" türü (ör. kutu o an görünmüyor) reklamı engellemez; yalnızca "error" kutuyu kaldırır.
          if (h.type === 'error') {
            setHataKodu(h.code || 'HATA');
            setDurum('bos');
          }
        },
      },
    );
  }, [blok, kutuKimligi, raporNo]);

  // Yerel denemede ve önizleme adreslerinde Yandex "WRONG_DOMAIN" döner; kutunun yerini görebilmek için boş kutu
  // burada kaldırılmaz, nedeniyle birlikte gösterilir. menuland.net'te boş kutu hiç görünmez.
  const deneme = typeof window !== 'undefined' && !/(^|\.)menuland\.net$/.test(window.location.hostname);
  if (durum === 'bos' && !deneme) return null;

  return (
    <aside
      aria-label="Reklam"
      data-reklam-yeri={yer}
      data-reklam-durumu={durum}
      className={`flex w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-zinc-50/50 p-3 ${className}`}
    >
      <span className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Reklam</span>
      {durum === 'bos' ? (
        <p className="px-1 py-6 text-center text-xs text-zinc-400">
          {`Deneme: Yandex bu adreste reklam vermedi${hataKodu ? ` (${hataKodu})` : ''}.`}
        </p>
      ) : (
        // Yandex en az 160 × 50 piksellik kutu istiyor; yükseklik reklam gelene kadar yer tutar.
        <div id={kutuKimligi} className="block min-h-[100px] w-full overflow-hidden text-center" />
      )}
    </aside>
  );
}
