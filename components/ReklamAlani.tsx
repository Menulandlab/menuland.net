'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCerezTercihi } from '../lib/cerezTercihi';
import { ADSENSE_YAYINCI, REKLAM_BIRIMLERI, adsenseBetiginiYukle, type ReklamYeri } from '../lib/reklam';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

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
 * Google AdSense reklam kutusu. Kutu yalnızca ziyaretçi reklam çerezlerine onay verdiyse ve bu yerin
 * AdSense'te bir reklam birimi numarası varsa çizilir; aksi hâlde sayfada hiç yer kaplamaz.
 * Sayfa değişince (aynı türden başka bir işletmeye geçince de) kutu yeniden kurulur ve yeni reklam istenir.
 */
export default function ReklamAlani({ yer, className = '', yalnizGenisEkran = false }: ReklamAlaniProps) {
  const { tercih } = useCerezTercihi();
  const yol = usePathname();
  const birim = REKLAM_BIRIMLERI[yer];
  const [genis, setGenis] = useState(false);
  useEffect(() => {
    if (!yalnizGenisEkran) return;
    const sorgu = window.matchMedia('(min-width: 1024px)');
    const guncelle = () => setGenis(sorgu.matches);
    guncelle();
    sorgu.addEventListener('change', guncelle);
    return () => sorgu.removeEventListener('change', guncelle);
  }, [yalnizGenisEkran]);
  const gosterilir = tercih?.reklam === true && Boolean(birim) && (!yalnizGenisEkran || genis);
  const kutu = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!gosterilir) return;
    adsenseBetiginiYukle();
    const el = kutu.current;
    // AdSense doldurduğu kutuya data-adsbygoogle-status yazar; aynı kutu için ikinci istek hata verir.
    if (!el || el.getAttribute('data-adsbygoogle-status')) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Kutu görünmezken (genişlik 0) AdSense hata fırlatır; sayfanın geri kalanı etkilenmez.
    }
  }, [gosterilir, yol]);

  if (!gosterilir) return null;

  // Yerel denemede ve Vercel önizlemelerinde AdSense'ten deneme reklamı istenir; gösterim ve tıklama
  // sayılmaz. Kutu yalnızca tarayıcıda çizildiği için (onay sunucuda bilinmez) window burada vardır.
  const deneme = typeof window !== 'undefined' && !/(^|\.)menuland\.net$/.test(window.location.hostname);

  return (
    <aside
      aria-label="Reklam"
      className={`flex w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-zinc-50/50 p-3 ${className}`}
    >
      <span className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Reklam</span>
      <ins
        key={yol}
        ref={kutu}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_YAYINCI}
        data-ad-slot={birim}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(deneme ? { 'data-adtest': 'on' } : {})}
      />
    </aside>
  );
}
