'use client';

import { useEffect, useRef } from 'react';
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
}

/**
 * Google AdSense reklam kutusu. Kutu yalnızca ziyaretçi reklam çerezlerine onay verdiyse ve bu yerin
 * AdSense'te bir reklam birimi numarası varsa çizilir; aksi hâlde sayfada hiç yer kaplamaz.
 * Sayfa değişince (aynı türden başka bir işletmeye geçince de) kutu yeniden kurulur ve yeni reklam istenir.
 */
export default function ReklamAlani({ yer, className = '' }: ReklamAlaniProps) {
  const { tercih } = useCerezTercihi();
  const yol = usePathname();
  const birim = REKLAM_BIRIMLERI[yer];
  const gosterilir = tercih?.reklam === true && Boolean(birim);
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
