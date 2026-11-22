/**
 * Google AdSense ayarları (22.11.2026, Yandex reklamlarının yerine).
 *
 * Yayıncı kimliği gizli değildir: ads.txt dosyasında ve sayfa kaynağında herkese açık durur.
 * Reklam birimi numaraları AdSense siteyi onayladıktan sonra panelde oluşturulup aşağıya yazılır.
 * Numarası boş olan yerde reklam kutusu hiç çizilmez ve reklam betiği yüklenmez.
 *
 * Reklam yalnızca içeriği olan sayfalara konur (AdSense kuralı: az özgün içerikli sayfaya reklam kodu
 * konmaz). Menüsü olmayan işletme sayfası, "yakında" il sayfaları, dış menü yönlendirme sayfası,
 * yasal metinler, giriş ve profil sayfaları reklamsızdır.
 */

export const ADSENSE_YAYINCI = 'ca-pub-3776725197972523';

const ADSENSE_BETIK_ADRESI = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_YAYINCI}`;
const BETIK_KIMLIGI = 'adsense-betigi';

export type ReklamYeri =
  | 'ana-sayfa-orta'
  | 'ana-sayfa-alt'
  | 'blog-liste'
  | 'blog-yazi-sonu'
  | 'isletme-yan'
  | 'isletme-menu-alti'
  | 'kesfet';

/**
 * AdSense panelindeki reklam birimi numaraları (data-ad-slot). Onaydan önce boştur.
 * Aynı numara birden fazla yerde kullanılabilir; yerleri ayrı raporlamak için ayrı birim açılabilir.
 */
export const REKLAM_BIRIMLERI: Record<ReklamYeri, string> = {
  'ana-sayfa-orta': '',
  'ana-sayfa-alt': '',
  'blog-liste': '',
  'blog-yazi-sonu': '',
  'isletme-yan': '',
  'isletme-menu-alti': '',
  kesfet: '',
};

/**
 * AdSense betiğini sayfaya bir kez ekler. Yalnızca ziyaretçi reklam çerezlerine onay verdiyse ve
 * sayfada numarası olan bir reklam kutusu varsa çağrılır. next/script yerine elle eklenir, çünkü
 * AdSense betiği next/script'in eklediği data-nscript özniteliği için konsolda uyarı veriyor.
 */
export function adsenseBetiginiYukle() {
  if (typeof document === 'undefined' || document.getElementById(BETIK_KIMLIGI)) return;
  const betik = document.createElement('script');
  betik.id = BETIK_KIMLIGI;
  betik.async = true;
  betik.src = ADSENSE_BETIK_ADRESI;
  betik.crossOrigin = 'anonymous';
  document.head.appendChild(betik);
}

/** Onay geri alınınca ya da reklam ağı değişince bu alan adında kalan reklam çerezlerinin adları. */
export function reklamCereziMi(ad: string) {
  return ad === '__gads' || ad === '__gpi' || ad === '__eoi' || ad.startsWith('_ym_');
}
