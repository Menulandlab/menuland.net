/** Sitenin kanonik adresi: menuland.net kalıcı yönlendirmeyle www adresine gider. */
export const SITE_URL = 'https://www.menuland.net';
export const SITE_NAME = 'Menuland';

/**
 * Menuland API adresi. Canlıda ortam değişkeni yoktur ve canlı API kullanılır; MENULAND_API_URL yalnızca yerel
 * denemede (ör. http://127.0.0.1:3141) verilir. Tarayıcıda okunmaz; tarayıcı istekleri /api-proxy üzerinden gider.
 */
export const API_URL = process.env.MENULAND_API_URL || 'https://api.service.menuland.net';

/** WhatsApp destek hattı ve kaynak kodlu hazır mesaj (kod, mesajın nereden geldiğini gösterir). */
export const WHATSAPP_NUMARASI = '908508401302';
export function whatsappBaglantisi(mesaj: string, kod: string): string {
  return `https://wa.me/${WHATSAPP_NUMARASI}?text=${encodeURIComponent(`${mesaj}\n\n(Kod: ${kod})`)}`;
}

/** Sayfaya özel görseli olmayan sayfalar için paylaşım görseli (1200×630, açık zemin). */
export const DEFAULT_OG_IMAGE = {
  url: '/images/menuland-og.png',
  width: 1200,
  height: 630,
  alt: 'Menuland: restoranların güncel menüleri, tek yerde',
};

export const APP_STORE_URL = 'https://apps.apple.com/tr/app/menuland/id6618147785?l=tr';
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.mycompany.menuland';
export const KURUMSAL_URL = 'https://kurumsal.menuland.net';

/** JSON-LD'yi <script> içine güvenle yazar: "<" karakteri kaçırılır (Next.js JSON-LD kılavuzundaki öneri). */
export function jsonLd(veri: unknown): string {
  return JSON.stringify(veri).replace(/</g, '\\u003c');
}

/** Metni kelime sınırında kısaltır (arama sonucu açıklamaları için). */
export function kisalt(metin: string, enCok: number): string {
  const temiz = metin.replace(/\s+/g, ' ').trim();
  if (temiz.length <= enCok) return temiz;
  const kesik = temiz.slice(0, enCok - 1);
  const bosluk = kesik.lastIndexOf(' ');
  return `${(bosluk > 40 ? kesik.slice(0, bosluk) : kesik).replace(/[\s,.;:]+$/, '')}…`;
}
