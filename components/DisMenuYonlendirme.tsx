'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Smartphone } from 'lucide-react';
import { DIS_MENU_SAYAC_URL, YONLENDIRME_SURESI_SN } from '@/lib/disMenu';

/**
 * Dış menü yönlendirme ekranı (20.11.2026). Ziyaretçi birkaç saniye içinde işletmenin kendi menü bağlantısına
 * geçer. Sayfayla etkileşirse (kaydırma, dokunma, tuş) yönlendirme durur ki bilgilendirmeyi ve davetleri
 * okuyabilsin. Menüye geçerken yönlendirme bir kez, kişisel bilgi olmadan sayılır (lib/disMenu.ts).
 */

type Props = {
  isletme: { id: number; ad: string; yol: string; konum: string; gorsel: string | null };
  menu: { adres: string; alanAdi: string };
  baglantilar: { sahibiyim: string; duzelt: string; kurumsal: string; appStore: string; googlePlay: string };
};

type Durum = 'sayiyor' | 'durdu' | 'gidiyor';

function Etiket({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD3300]">
      <span aria-hidden="true" className="h-px w-8 bg-[#D63F00]" />
      {children}
    </p>
  );
}

export default function DisMenuYonlendirme({ isletme, menu, baglantilar }: Props) {
  const [kalan, setKalan] = useState(YONLENDIRME_SURESI_SN);
  const [durum, setDurum] = useState<Durum>('sayiyor');
  const sayildi = useRef(false);
  const oturumAnahtari = `menuland-dis-menu-${isletme.id}`;

  /** Yönlendirmeyi bir kez sayar (işletme numarası ve kaynak; kişisel bilgi yok). */
  const say = useCallback(() => {
    if (sayildi.current) return;
    sayildi.current = true;
    try {
      const govde = new URLSearchParams({ isletme: String(isletme.id), kaynak: 'web' });
      if (typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(DIS_MENU_SAYAC_URL, govde);
      } else {
        fetch(DIS_MENU_SAYAC_URL, { method: 'POST', body: govde, keepalive: true, mode: 'no-cors' }).catch(() => {});
      }
    } catch {
      // Sayım olmasa da ziyaretçi menüye gider
    }
  }, [isletme.id]);

  const isaretle = useCallback(() => {
    try {
      sessionStorage.setItem(oturumAnahtari, '1');
    } catch {
      // Gizli sekmede depolama kapalı olabilir
    }
  }, [oturumAnahtari]);

  const git = useCallback(() => {
    setDurum('gidiyor');
    say();
    isaretle();
    // Bu sayfa geçmişten çıkarılır: geri tuşu işletme sayfasına döner
    window.location.replace(menu.adres);
  }, [menu.adres, say, isaretle]);

  // Aynı oturumda bu menüye zaten gidildiyse (ör. geri tuşuyla dönüş) yönlendirme kendiliğinden başlamaz
  useEffect(() => {
    try {
      if (sessionStorage.getItem(oturumAnahtari)) setDurum('durdu');
    } catch {
      // depolama yoksa sayaç normal başlar
    }
    const geriDonus = (e: PageTransitionEvent) => {
      if (e.persisted) setDurum('durdu');
    };
    window.addEventListener('pageshow', geriDonus);
    return () => window.removeEventListener('pageshow', geriDonus);
  }, [oturumAnahtari]);

  // Geri sayım
  useEffect(() => {
    if (durum !== 'sayiyor') return;
    if (kalan <= 0) {
      git();
      return;
    }
    const zamanlayici = window.setTimeout(() => setKalan((k) => k - 1), 1000);
    return () => window.clearTimeout(zamanlayici);
  }, [durum, kalan, git]);

  // Ziyaretçi sayfayla etkileşirse yönlendirme durur (menüye git düğmesi hariç)
  useEffect(() => {
    if (durum !== 'sayiyor') return;
    const durdur = (e: Event) => {
      const hedef = e.target instanceof Element ? e.target : null;
      if (hedef?.closest('[data-menuye-git]')) return;
      setDurum('durdu');
    };
    const olaylar = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const;
    olaylar.forEach((olay) => window.addEventListener(olay, durdur, { passive: true }));
    return () => olaylar.forEach((olay) => window.removeEventListener(olay, durdur));
  }, [durum]);

  const menuyeGitTiklandi = (e: MouseEvent<HTMLAnchorElement>) => {
    // Yeni sekmede açma isteğine dokunulmaz; yalnızca sayılır
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      say();
      return;
    }
    e.preventDefault();
    git();
  };

  const durumMetni =
    durum === 'sayiyor'
      ? `${kalan} saniye içinde menüye geçiyorsunuz.`
      : durum === 'durdu'
        ? 'Yönlendirme durdu. Hazır olduğunuzda menüye geçebilirsiniz.'
        : 'Menüye geçiliyor…';

  return (
    <div className="-mx-4 -mt-8 sm:-mx-6 lg:-mx-8">
      {/* Üst bölüm: nereye gidildiği ve geri sayım */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF4ED] via-[#FFF8F3] to-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(253,206,172,0.7),rgba(253,206,172,0))]"
        />
        <div className="relative mx-auto max-w-4xl px-6 pb-14 pt-12 sm:pt-16">
          <Etiket>Menuland&apos;den ayrılıyorsunuz</Etiket>

          <div className="mt-8 flex items-center gap-4">
            {isletme.gorsel ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={isletme.gorsel}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-[#F6D3BD]"
              />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#D63F00] ring-1 ring-[#F6D3BD]">
                {isletme.ad.slice(0, 1)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-zinc-900">{isletme.ad}</p>
              {isletme.konum && <p className="text-sm text-zinc-500">{isletme.konum}</p>}
            </div>
          </div>

          <h1 className="mt-8 max-w-2xl text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-[#1C1917] sm:text-[2.75rem]">
            {isletme.ad} menüsüne yönlendiriliyorsunuz.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
            Menü, işletmenin kendi bağlantısında açılır:{' '}
            <span className="font-semibold text-zinc-900">{menu.alanAdi}</span>. Gideceğiniz sayfa Menuland&apos;e ait
            değildir; içeriğinden işletme ve sayfanın sağlayıcısı sorumludur.{' '}
            <a href="#yasal-bilgilendirme" className="font-semibold text-[#AD3300] underline-offset-4 hover:underline">
              Ayrıntılar
            </a>
          </p>

          {/* Geri sayım */}
          <div className="mt-8 max-w-xl">
            <p aria-hidden="true" className="text-sm font-medium text-zinc-700">
              {durumMetni}
            </p>
            <p className="sr-only" aria-live="polite">
              {durum === 'sayiyor'
                ? `${YONLENDIRME_SURESI_SN} saniye içinde menüye geçiyorsunuz.`
                : durumMetni}
            </p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#F6D3BD]/60">
              <div
                className="h-full rounded-full bg-[#D63F00] transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
                style={{ width: `${durum === 'gidiyor' ? 0 : (kalan / YONLENDIRME_SURESI_SN) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={menu.adres}
              rel="nofollow noopener"
              data-menuye-git
              onClick={menuyeGitTiklandi}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#D63F00] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(214,63,0,0.7)] transition-colors hover:bg-[#B83600] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D63F00] focus-visible:ring-offset-2"
            >
              Menüye git
              <ArrowRight className="h-4 w-4" />
            </a>
            {durum === 'sayiyor' ? (
              <button
                type="button"
                onClick={() => setDurum('durdu')}
                className="min-h-12 text-sm font-semibold text-[#AD3300] underline-offset-4 hover:underline"
              >
                Burada kal
              </button>
            ) : (
              <Link
                href={isletme.yol}
                className="inline-flex min-h-12 items-center gap-1.5 text-sm font-semibold text-[#AD3300] underline-offset-4 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                {isletme.ad} sayfasına dön
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Davetler: işletme sahibi ve ziyaretçi */}
      <section className="mx-auto grid max-w-4xl gap-12 px-6 py-14 md:grid-cols-2 md:gap-10">
        <div className="border-t border-[#F1DCCD] pt-6">
          <Etiket>İşletme sahipleri için</Etiket>
          <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#1C1917]">
            Bu işletme sizin mi? Menünüz Menuland&apos;de açılsın.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600">
            Menüsü Menuland&apos;de olan işletmenin menüsü, Menuland&apos;deki işletme sayfasında ve uygulamada doğrudan
            açılır; müşteriniz başka bir siteye gitmez. Menünüzü sizin için ücretsiz giriyoruz ve paneli 30 gün ücretsiz
            deneyebilirsiniz.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href={baglantilar.sahibiyim}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#25D366] bg-white px-5 py-2.5 text-sm font-semibold text-[#128C4B] transition-colors hover:bg-[#F0FBF4]"
            >
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#25D366]" />
              WhatsApp&apos;tan yazın
            </a>
            <a
              href={baglantilar.kurumsal}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#AD3300] underline-offset-4 hover:underline"
            >
              İşletmeler için Menuland
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="border-t border-[#F1DCCD] pt-6">
          <Etiket>Menuland uygulaması</Etiket>
          <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[#1C1917]">
            Beğendiğiniz işletmeleri kaydedin, kampanyaları kaçırmayın.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600">
            Menuland uygulamasıyla işletmeleri favorilerinize ekler, kampanyaları görür ve PuanLand ile puan
            biriktirirsiniz.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { ad: 'App Store', adres: baglantilar.appStore },
              { ad: 'Google Play', adres: baglantilar.googlePlay },
            ].map((m) => (
              <a
                key={m.ad}
                href={m.adres}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#F1DCCD] bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition-colors hover:border-[#D63F00] hover:text-[#D63F00]"
              >
                <Smartphone className="h-4 w-4" />
                {m.ad}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Yasal bilgilendirme */}
      <section id="yasal-bilgilendirme" className="mx-auto max-w-4xl scroll-mt-24 px-6 pb-16">
        <div className="border-t border-[#F1DCCD] pt-6">
          <h2 className="text-sm font-semibold text-zinc-900">Yasal bilgilendirme</h2>
          <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-zinc-500 marker:text-zinc-400">
            <li>
              Bu bağlantı, {isletme.ad} işletmesinin herkese açık menüsüne gider ({menu.alanAdi}). Bağlantının açtığı sayfa
              Menuland&apos;e ait değildir ve Menuland tarafından yönetilmez.
            </li>
            <li>
              Menüdeki ürün, fiyat, alerjen ve diğer bilgilerden işletme ve sayfayı sunan hizmet sağlayıcı sorumludur.
              Fiyat ve içeriği siparişten önce işletmeye teyit etmenizi öneririz.
            </li>
            <li>
              Bağlantının Menuland&apos;de yer alması, işletmenin Menuland müşterisi ya da iş ortağı olduğu veya
              Menuland&apos;in bu sayfanın içeriğini benimsediği anlamına gelmez.
            </li>
            <li>Gideceğiniz sayfada o sitenin kendi kullanım koşulları, gizlilik ve çerez politikası geçerlidir.</li>
            <li>
              Menuland bu yönlendirme için yalnızca bağlantının kaç kez kullanıldığını sayar; bu sayımda sizi tanıtan bir
              bilgi tutulmaz.
            </li>
            <li>
              Bağlantı yanlışsa ya da işletme sahibi olarak kaldırılmasını istiyorsanız{' '}
              <a
                href={baglantilar.duzelt}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#AD3300] underline-offset-4 hover:underline"
              >
                bize yazın
              </a>
              ; bağlantıyı inceleyip düzeltir ya da kaldırırız.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
