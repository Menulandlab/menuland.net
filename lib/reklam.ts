/**
 * Reklam ayarları: Yandex Reklam Ağı (26.11.2026'dan beri; 22–26.11 arasında Google AdSense kodu duruyordu).
 *
 * Reklam bloğu numaraları gizli değildir: sayfa kaynağında herkese açık durur. Bütün yerler şimdilik aynı bloğu
 * kullanır; Yandex aynı bloğun bir sayfada birden çok kez gösterilmesine izin verir (her kutunun kimliği farklı
 * olmalıdır). Yerlerin kazancı Yandex raporlarında `statId` ile ayrı görünür. Bir yer için Yandex panelinde ayrı
 * blok açılırsa numarası aşağıdaki tabloya yazılır.
 *
 * Reklam şu sayfalarda yoktur: Menuland menüsü olan işletmelerin sayfaları (müşterilerimizin sayfasında rakip
 * reklamı çıkmasın), dış menü yönlendirme sayfası, "yakında" il sayfaları, yasal metinler, giriş ve profil sayfaları.
 */

/** Google AdSense yayıncı kimliği: yalnızca site doğrulama etiketi için (app/layout.tsx); AdSense betiği yüklenmez. */
export const ADSENSE_YAYINCI = 'ca-pub-3776725197972523';

/** Ekim–Kasım 2026'da kullanılan, Yandex'in onayladığı blok. */
const VARSAYILAN_BLOK = 'R-A-20154632-1';

const YANDEX_BETIK_ADRESI = 'https://yandex.com.tr/ads/system/context.js';
const BETIK_KIMLIGI = 'yandex-reklam-betigi';

export type ReklamYeri =
  | 'ana-sayfa-orta'
  | 'ana-sayfa-alt'
  | 'blog-liste'
  | 'blog-yazi-ici'
  | 'blog-yazi-sonu'
  | 'isletme-yan'
  | 'isletme-menu-alti'
  | 'kesfet'
  | 'sehir-sayfasi'
  | 'liste-orta'
  | 'liste-alti';

/**
 * Her yerin Yandex bloğu ve rapor numarası (statId, 1–1.000.000.000). Rapor numarası aynı bloğun hangi yerde ne
 * kazandığını Yandex panelindeki raporlarda ayırır. Numaralar değiştirilmemelidir; eski raporlar karışır.
 */
export const REKLAM_YERLERI: Record<ReklamYeri, { blok: string; raporNo: number }> = {
  'ana-sayfa-orta': { blok: VARSAYILAN_BLOK, raporNo: 1 },
  'ana-sayfa-alt': { blok: VARSAYILAN_BLOK, raporNo: 2 },
  'blog-liste': { blok: VARSAYILAN_BLOK, raporNo: 3 },
  'blog-yazi-ici': { blok: VARSAYILAN_BLOK, raporNo: 4 },
  'blog-yazi-sonu': { blok: VARSAYILAN_BLOK, raporNo: 5 },
  'isletme-yan': { blok: VARSAYILAN_BLOK, raporNo: 6 },
  'isletme-menu-alti': { blok: VARSAYILAN_BLOK, raporNo: 7 },
  kesfet: { blok: VARSAYILAN_BLOK, raporNo: 8 },
  'sehir-sayfasi': { blok: VARSAYILAN_BLOK, raporNo: 9 },
  'liste-orta': { blok: VARSAYILAN_BLOK, raporNo: 10 },
  'liste-alti': { blok: VARSAYILAN_BLOK, raporNo: 11 },
};

/** Yandex'in onError ile verdiği bilgi (Yandex belgesi: type "error" ya da "warning", code, text). */
export type YandexHata = { type?: string; code?: string; text?: string };

type YandexCizimAyari = {
  blockId: string;
  renderTo: string;
  statId?: number;
  onRender?: (veri: { product?: string }) => void;
  onError?: (veri: YandexHata) => void;
};

declare global {
  interface Window {
    yaContextCb?: Array<() => void>;
    Ya?: { Context?: { AdvManager?: { render: (ayar: YandexCizimAyari, reklamYoksa?: () => void) => void } } };
  }
}

/**
 * Yandex betiğini sayfaya bir kez ekler. Yalnızca ziyaretçi reklam çerezlerine onay verdiyse ve sayfada bir reklam
 * kutusu varsa çağrılır. Betik yüklenene kadar istekler window.yaContextCb kuyruğunda bekler (Yandex'in kendi kodu
 * da bu kuyruğu kullanır).
 */
export function yandexBetiginiYukle() {
  if (typeof document === 'undefined') return;
  window.yaContextCb = window.yaContextCb || [];
  if (document.getElementById(BETIK_KIMLIGI)) return;
  const betik = document.createElement('script');
  betik.id = BETIK_KIMLIGI;
  betik.async = true;
  betik.src = YANDEX_BETIK_ADRESI;
  document.head.appendChild(betik);
}

let kutuSayaci = 0;

/** Sayfadaki her reklam kutusuna ayrı kimlik (Yandex: aynı blok için yalnızca renderTo değişir). */
export function yeniKutuKimligi(blok: string) {
  kutuSayaci += 1;
  return `yandex_rtb_${blok}-${kutuSayaci}`;
}

/**
 * Reklamı kutuya çizdirir. Yandex açık artırmada uygun reklam bulamazsa `reklamYok`, kutu bulunamazsa ya da blok
 * yüklenemezse `hata` çağrılır; ikisinde de kutu sayfadan kaldırılır, boş çerçeve kalmaz.
 */
export function yandexReklaminiCiz(
  ayar: { blok: string; kutuKimligi: string; raporNo: number },
  geriBildirim: { reklamVar: () => void; reklamYok: () => void; hata: (h: YandexHata) => void },
) {
  yandexBetiginiYukle();
  (window.yaContextCb = window.yaContextCb || []).push(() => {
    const yonetici = window.Ya?.Context?.AdvManager;
    if (!yonetici || !document.getElementById(ayar.kutuKimligi)) return;
    yonetici.render(
      {
        blockId: ayar.blok,
        renderTo: ayar.kutuKimligi,
        statId: ayar.raporNo,
        onRender: () => geriBildirim.reklamVar(),
        onError: (h) => geriBildirim.hata(h || {}),
      },
      () => geriBildirim.reklamYok(),
    );
  });
}

/** Onay geri alınınca bu alan adında kalan reklam çerezlerinin adları (Yandex ve daha önce denenen AdSense). */
export function reklamCereziMi(ad: string) {
  return ad === '__gads' || ad === '__gpi' || ad === '__eoi' || ad.startsWith('_ym_');
}
