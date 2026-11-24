'use client';

import { useEffect, useState, useSyncExternalStore, type MouseEvent } from 'react';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import {
  ArrowRight,
  CalendarCheck,
  Gift,
  MapPin,
  Pause,
  Play,
  Smartphone,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { APP_STORE_URL, GOOGLE_PLAY_URL, whatsappBaglantisi } from '@/lib/site';
import { UST_SERIT_MESAJLARI, type UstSeritIkon, type UstSeritMesaji } from '@/lib/ustSerit';
import styles from './UstSerit.module.css';

/**
 * Sitenin en üstündeki dönen duyuru şeridi (kurucu kararı, 24.11.2026: hep görünür, kapatma düğmesi yok).
 * Sunucuda da çizilir; ilk HTML'de 40 px yüksekliğiyle geldiği için sayfa açılırken içerik kaymaz.
 * Mesajlar lib/ustSerit.ts dosyasındadır.
 */

const IKONLAR: Record<UstSeritIkon, LucideIcon> = {
  takvim: CalendarCheck,
  telefon: Smartphone,
  hediye: Gift,
  dukkan: Store,
  konum: MapPin,
};

const MESAJ_SURESI_MS = 4500;
const INDIRME_BOLUMU = '#download-app-footer';
const HAREKETI_AZALT = '(prefers-reduced-motion: reduce)';

function hareketiAzaltAboneOl(bildir: () => void) {
  const sorgu = window.matchMedia(HAREKETI_AZALT);
  sorgu.addEventListener('change', bildir);
  return () => sorgu.removeEventListener('change', bildir);
}

function hicAbonelik() {
  return () => {};
}

/** Telefona göre mağaza adresi. Sunucuda ve masaüstünde alttaki indirme bölümü kullanılır. */
function uygulamaAdresi(): string {
  const ua = navigator.userAgent;
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || iPadOS) return APP_STORE_URL;
  if (/Android/i.test(ua)) return GOOGLE_PLAY_URL;
  return INDIRME_BOLUMU;
}

function tiklamayiKaydet(mesaj: UstSeritMesaji) {
  // GA yalnızca çerez onayından sonra yüklenir; onay yoksa bu çağrı hiçbir şey göndermez.
  sendGAEvent('event', 'ust_serit_tiklama', { mesaj: mesaj.id });
}

export default function UstSerit() {
  const mesajlar = UST_SERIT_MESAJLARI;
  const adet = mesajlar.length;

  const [sira, setSira] = useState(0);
  const [durduruldu, setDurduruldu] = useState(false);
  const [fareUstunde, setFareUstunde] = useState(false);
  const [klavyeIceride, setKlavyeIceride] = useState(false);

  const hareketiAzalt = useSyncExternalStore(
    hareketiAzaltAboneOl,
    () => window.matchMedia(HAREKETI_AZALT).matches,
    () => false,
  );
  const uygulamaHref = useSyncExternalStore(hicAbonelik, uygulamaAdresi, () => INDIRME_BOLUMU);

  const beklesin = durduruldu || fareUstunde || klavyeIceride || hareketiAzalt || adet < 2;

  useEffect(() => {
    if (beklesin) return;
    const zamanlayici = window.setInterval(() => setSira((s) => (s + 1) % adet), MESAJ_SURESI_MS);
    return () => window.clearInterval(zamanlayici);
  }, [beklesin, adet]);

  const gidenSira = (sira - 1 + adet) % adet;

  function indirmeBolumuneKaydir(olay: MouseEvent<HTMLAnchorElement>) {
    if (uygulamaHref !== INDIRME_BOLUMU) return;
    olay.preventDefault();
    document.getElementById(INDIRME_BOLUMU.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }

  function dugme(mesaj: UstSeritMesaji) {
    const ic = (
      <>
        <span className={styles.uzun}>{mesaj.dugme}</span>
        <span className={styles.kisa}>{mesaj.kisaDugme}</span>
        <ArrowRight className={styles.ok} aria-hidden="true" />
      </>
    );
    const hedef = mesaj.hedef;

    if (hedef.tur === 'sayfa') {
      return (
        <Link href={hedef.adres} prefetch={false} className={styles.dugme} onClick={() => tiklamayiKaydet(mesaj)}>
          {ic}
        </Link>
      );
    }

    if (hedef.tur === 'whatsapp') {
      return (
        <a
          href={whatsappBaglantisi(hedef.mesaj, hedef.kod)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.dugme}
          onClick={() => tiklamayiKaydet(mesaj)}
        >
          {ic}
        </a>
      );
    }

    const disari = uygulamaHref !== INDIRME_BOLUMU;
    return (
      <a
        href={uygulamaHref}
        {...(disari ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={styles.dugme}
        onClick={(olay) => {
          tiklamayiKaydet(mesaj);
          indirmeBolumuneKaydir(olay);
        }}
      >
        {ic}
      </a>
    );
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Duyurular"
      data-nosnippet
      className={durduruldu ? `${styles.serit} ${styles.durdu}` : styles.serit}
      onPointerEnter={(olay) => {
        if (olay.pointerType === 'mouse') setFareUstunde(true);
      }}
      onPointerLeave={(olay) => {
        if (olay.pointerType === 'mouse') setFareUstunde(false);
      }}
      onFocus={(olay) => {
        // Yalnızca klavye odağı durdurur; fareyle tıklanan düğme odak alsa da dönüş kullanıcının seçimine bağlı kalır.
        if (olay.target instanceof HTMLElement && olay.target.matches(':focus-visible')) setKlavyeIceride(true);
      }}
      onBlur={(olay) => {
        if (!olay.currentTarget.contains(olay.relatedTarget as Node | null)) setKlavyeIceride(false);
      }}
    >
      <div className={styles.ic}>
        <div className={styles.sahne} aria-live={beklesin ? 'polite' : 'off'}>
          {mesajlar.map((mesaj, i) => {
            const Ikon = IKONLAR[mesaj.ikon];
            const durum = i === sira ? styles.aktif : i === gidenSira ? styles.giden : styles.bekleyen;
            return (
              <div
                key={mesaj.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${adet}`}
                className={`${styles.mesaj} ${durum}`}
                inert={i !== sira}
              >
                <Ikon className={styles.ikon} aria-hidden="true" />
                <span className={styles.metin}>
                  <span className={styles.uzun}>{mesaj.metin}</span>
                  <span className={styles.kisa}>{mesaj.kisaMetin}</span>
                </span>
                {dugme(mesaj)}
              </div>
            );
          })}
        </div>
        {adet > 1 && (
          <button
            type="button"
            className={styles.durdur}
            onClick={() => setDurduruldu((d) => !d)}
            aria-label={durduruldu ? 'Duyuruları başlat' : 'Duyuruları durdur'}
          >
            {durduruldu ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}
