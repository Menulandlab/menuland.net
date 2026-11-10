'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';
import { CEREZ_TERCIHLERI_OLAYI, kayitliTercih, tercihiKaydet, useCerezTercihi } from '../lib/cerezTercihi';

/**
 * Çerez onayı (KVKK çerez rehberi): zorunlu çerezler her zaman çalışır; Google Analytics ve Yandex
 * reklamları yalnızca ziyaretçi onay verirse yüklenir. Tercih tarayıcıda saklanır ve alt bilgideki
 * "Çerez tercihleri" bağlantısından istenildiği zaman değiştirilebilir.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-PKW5J07KW0';

/** Onay geri alındığında Google Analytics'in bu alan adında bıraktığı çerezleri siler. */
function analizCerezleriniSil() {
  const adlar = document.cookie
    .split(';')
    .map((cerez) => cerez.trim().split('=')[0])
    .filter((ad) => ad === '_ga' || ad.startsWith('_ga_') || ad === '_gid' || ad === '_gat');
  const host = window.location.hostname;
  const alanlar = new Set(['', host, `.${host}`]);
  if (host.endsWith('menuland.net')) alanlar.add('.menuland.net');
  for (const ad of adlar) {
    for (const alan of alanlar) {
      document.cookie = `${ad}=; Max-Age=0; path=/${alan ? `; domain=${alan}` : ''}`;
    }
  }
}

const bosAbone = () => () => {};

export default function CookieConsent() {
  const { hazir, tercih } = useCerezTercihi();
  // Analytics yalnızca gerçek alan adında yüklenir; yerel geliştirme ve önizleme adresleri ölçümü kirletmez.
  const gaIzinliAlan = useSyncExternalStore(
    bosAbone,
    () => /(^|\.)menuland\.net$/.test(window.location.hostname),
    () => false
  );

  const [ayarlarAcik, setAyarlarAcik] = useState(false);
  const [taslakAnaliz, setTaslakAnaliz] = useState(false);
  const [taslakReklam, setTaslakReklam] = useState(false);

  useEffect(() => {
    const ac = () => {
      const mevcut = kayitliTercih();
      setTaslakAnaliz(mevcut?.analiz ?? false);
      setTaslakReklam(mevcut?.reklam ?? false);
      setAyarlarAcik(true);
    };
    window.addEventListener(CEREZ_TERCIHLERI_OLAYI, ac);
    return () => window.removeEventListener(CEREZ_TERCIHLERI_OLAYI, ac);
  }, []);

  const kaydet = (analiz: boolean, reklam: boolean) => {
    const onceki = tercih;
    tercihiKaydet(analiz, reklam);
    setAyarlarAcik(false);
    // Yüklenmiş bir betik sayfadan sökülemez; daha önce verilen onay geri alındıysa sayfa yenilenir.
    const geriAlindi = (onceki?.analiz && !analiz) || (onceki?.reklam && !reklam);
    if (geriAlindi) {
      if (onceki?.analiz && !analiz) analizCerezleriniSil();
      window.location.reload();
    }
  };

  const afisGoster = hazir && !tercih && !ayarlarAcik;

  return (
    <>
      {tercih?.analiz && gaIzinliAlan && <GoogleAnalytics gaId={GA_ID} />}
      {tercih?.reklam && (
        <Script id="yandex-rtb-context" src="https://yandex.com.tr/ads/system/context.js" strategy="afterInteractive" />
      )}

      {afisGoster && (
        <section
          role="dialog"
          aria-labelledby="cerez-baslik"
          aria-describedby="cerez-metin"
          className="fixed inset-x-3 bottom-3 z-[60] rounded-2xl border border-[#FDCEAC] bg-white p-5 shadow-[0_12px_40px_rgba(255,77,0,0.14)] sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-md"
        >
          <h2 id="cerez-baslik" className="text-base font-bold text-zinc-900">
            Çerez tercihiniz
          </h2>
          <p id="cerez-metin" className="mt-2 text-sm leading-relaxed text-zinc-600">
            Sitenin çalışması için gerekli çerezleri her zaman kullanırız. Ziyaretleri ölçmek için Google Analytics,
            reklam göstermek için Yandex çerezlerini ise yalnızca onay verirseniz kullanırız. Ayrıntılar{' '}
            <Link href="/gizlilik-politikasi" className="font-semibold text-[#FF4D00] underline underline-offset-2">
              Gizlilik Politikası
            </Link>
            &apos;nda.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => kaydet(false, false)}
              className="rounded-xl bg-[#FDCEAC] px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-[#fbbf94]"
            >
              Reddet
            </button>
            <button
              type="button"
              onClick={() => kaydet(true, true)}
              className="rounded-xl bg-[#FF4D00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e64500]"
            >
              Kabul et
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setTaslakAnaliz(false);
              setTaslakReklam(false);
              setAyarlarAcik(true);
            }}
            className="mt-3 w-full text-center text-sm font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-800"
          >
            Tercihleri ayarla
          </button>
        </section>
      )}

      {ayarlarAcik && (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="cerez-ayar-baslik"
          className="fixed inset-x-3 bottom-3 z-[60] max-h-[85vh] overflow-y-auto rounded-2xl border border-[#FDCEAC] bg-white p-5 shadow-[0_12px_40px_rgba(255,77,0,0.14)] sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-md"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id="cerez-ayar-baslik" className="text-base font-bold text-zinc-900">
              Çerez tercihleri
            </h2>
            {tercih && (
              <button
                type="button"
                onClick={() => setAyarlarAcik(false)}
                aria-label="Kapat"
                className="-mr-1 -mt-1 rounded-lg px-2 py-1 text-lg leading-none text-zinc-400 hover:text-zinc-700"
              >
                ×
              </button>
            )}
          </div>

          <ul className="mt-3 divide-y divide-[#FDCEAC]/60">
            <li className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Zorunlu çerezler</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                  Oturum, konum seçimi ve güvenlik için gereklidir. Kapatılamaz.
                </p>
              </div>
              <span className="mt-0.5 shrink-0 text-xs font-semibold text-zinc-500">Her zaman açık</span>
            </li>
            <li className="flex items-start justify-between gap-4 py-3">
              <label htmlFor="cerez-analiz" className="cursor-pointer">
                <span className="block text-sm font-semibold text-zinc-900">Analiz çerezleri</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
                  Google Analytics ile hangi sayfaların ziyaret edildiğini ölçeriz.
                </span>
              </label>
              <input
                id="cerez-analiz"
                type="checkbox"
                role="switch"
                checked={taslakAnaliz}
                onChange={(e) => setTaslakAnaliz(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#FF4D00]"
              />
            </li>
            <li className="flex items-start justify-between gap-4 py-3">
              <label htmlFor="cerez-reklam" className="cursor-pointer">
                <span className="block text-sm font-semibold text-zinc-900">Reklam çerezleri</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
                  Yandex reklam ağı, reklam göstermek ve ölçmek için çerez kullanır.
                </span>
              </label>
              <input
                id="cerez-reklam"
                type="checkbox"
                role="switch"
                checked={taslakReklam}
                onChange={(e) => setTaslakReklam(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#FF4D00]"
              />
            </li>
          </ul>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => kaydet(taslakAnaliz, taslakReklam)}
              className="rounded-xl bg-[#FDCEAC] px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-[#fbbf94]"
            >
              Seçimi kaydet
            </button>
            <button
              type="button"
              onClick={() => kaydet(true, true)}
              className="rounded-xl bg-[#FF4D00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e64500]"
            >
              Tümünü kabul et
            </button>
          </div>
        </section>
      )}
    </>
  );
}
