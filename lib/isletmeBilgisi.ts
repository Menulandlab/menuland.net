/**
 * İşletme sayfasında gerçekten bulunan bilgiler (24.11.2026, Search Console incelemesi).
 *
 * Google'daki başlık ve açıklama, arayanın sayfada ne bulacağını söyler; ama yalnızca kayıtta gerçekten
 * olanı söyler. Adresi olmayan işletmede "adres", menüsü olmayan işletmede "menü" yazılmaz.
 */
import { disMenu } from './disMenu';

const GUNLER: Array<[string, string, string]> = [
  ['monday', 'Pazartesi', 'Monday'],
  ['tuesday', 'Salı', 'Tuesday'],
  ['wednesday', 'Çarşamba', 'Wednesday'],
  ['thursday', 'Perşembe', 'Thursday'],
  ['friday', 'Cuma', 'Friday'],
  ['saturday', 'Cumartesi', 'Saturday'],
  ['sunday', 'Pazar', 'Sunday'],
];

export interface CalismaGunu {
  gun: string;
  metin: string;
  /** schema.org gün adı (Monday...) */
  schemaGun: string;
  acilis: string | null;
  kapanis: string | null;
}

/** working_hours alanı (JSON metni ya da nesne) → gün gün çalışma saatleri; okunamazsa boş liste. */
export function calismaSaatleri(ham: unknown): CalismaGunu[] {
  let veri: unknown = ham;
  if (typeof ham === 'string') {
    try {
      veri = JSON.parse(ham);
    } catch {
      return [];
    }
  }
  if (!veri || typeof veri !== 'object' || Array.isArray(veri)) return [];
  const kayit = veri as Record<string, { open?: string; close?: string; closed?: boolean } | undefined>;
  const saat = (s: unknown) => (typeof s === 'string' && /^\d{1,2}:\d{2}$/.test(s.trim()) ? s.trim() : null);
  const sonuc: CalismaGunu[] = [];
  for (const [anahtar, ad, schemaGun] of GUNLER) {
    const g = kayit[anahtar];
    if (!g) continue;
    if (g.closed === true) {
      sonuc.push({ gun: ad, metin: 'Kapalı', schemaGun, acilis: null, kapanis: null });
      continue;
    }
    const acilis = saat(g.open);
    const kapanis = saat(g.close);
    if (acilis && kapanis) sonuc.push({ gun: ad, metin: `${acilis}–${kapanis}`, schemaGun, acilis, kapanis });
  }
  return sonuc;
}

export interface SayfadaOlanlar {
  /** Menuland'de gösterilen menü (günlük menüde ürün ya da sabit menüde kategori) */
  menuVar: boolean;
  /** Menuland menüsü yok ama işletmenin kendi menü bağlantısı geçerli */
  disMenuVar: boolean;
  telefon: boolean;
  adres: boolean;
  konum: boolean;
  gorsel: boolean;
  saatler: boolean;
}

export function sayfadaOlanlar(business: Record<string, unknown> | null | undefined, menuVar: boolean): SayfadaOlanlar {
  const enlem = Number(business?.latitude);
  const boylam = Number(business?.longitude);
  return {
    menuVar,
    disMenuVar: !menuVar && Boolean(disMenu(business?.menu_url)),
    telefon: Boolean(String(business?.phone || '').trim()),
    adres: Boolean(String(business?.adres || business?.address || '').trim()),
    konum: Number.isFinite(enlem) && Number.isFinite(boylam) && enlem !== 0 && boylam !== 0,
    gorsel: Boolean(business?.image_url_1 || business?.image_url_medium || business?.image_url),
    saatler: calismaSaatleri(business?.working_hours).length > 0,
  };
}

/** "Menü, Telefon ve Yol Tarifi" gibi; liste boşsa boş metin. */
function liste(parcalar: string[]): string {
  if (parcalar.length <= 1) return parcalar.join('');
  return `${parcalar.slice(0, -1).join(', ')} ve ${parcalar[parcalar.length - 1]}`;
}

/**
 * Google başlığı. Menuland menüsü varsa "X Menü ve Fiyatları · İlçe, İl"; yoksa sayfada olanlar:
 * "X · İlçe, İl: Menü, Telefon ve Yol Tarifi". En değerli bilgi önde, çünkü Google uzun başlığı keser.
 */
export function isletmeBasligi(ad: string, yer: string, o: SayfadaOlanlar): string {
  if (o.menuVar) return `${ad} Menü ve Fiyatları${yer ? ` · ${yer}` : ''}`;
  const neler = [
    o.disMenuVar ? 'Menü' : null,
    o.telefon ? 'Telefon' : null,
    o.adres ? 'Adres' : o.konum ? 'Yol Tarifi' : null,
  ].filter(Boolean) as string[];
  return `${ad}${yer ? ` · ${yer}` : ''}${neler.length ? `: ${liste(neler)}` : ''}`;
}

/** Google açıklaması: "X (İlçe, İl): Kahvaltı, Pizza. Menüsü, telefon numarası ve yol tarifi Menuland'de." */
export function isletmeAciklamasi(ad: string, yer: string, kategoriler: string, o: SayfadaOlanlar): string {
  const sunulanlar = [
    o.menuVar ? 'güncel menüsü ve fiyatları' : o.disMenuVar ? 'menüsü' : null,
    o.telefon ? 'telefon numarası' : null,
    o.adres ? 'adresi' : null,
    o.konum ? 'yol tarifi' : null,
    o.saatler ? 'çalışma saatleri' : null,
    o.gorsel ? 'fotoğrafları' : null,
  ].filter(Boolean) as string[];
  const bas = `${ad}${yer ? ` (${yer})` : ''}${kategoriler ? `: ${kategoriler}` : ''}.`;
  if (!sunulanlar.length) return `${ad}${yer ? ` (${yer})` : ''} Menuland'de listeleniyor.`;
  const cumle = (parcalar: string[]) => {
    const metin = liste(parcalar);
    return `${bas} ${metin.charAt(0).toLocaleUpperCase('tr')}${metin.slice(1)} Menuland'de.`;
  };
  // Google açıklamayı yaklaşık 158 karakterde keser: sığmazsa önce fotoğraf, sonra saat, sonra adres sözü düşer.
  let parcalar = sunulanlar;
  for (const dusen of ['fotoğrafları', 'çalışma saatleri', 'adresi']) {
    if (cumle(parcalar).length <= 158) break;
    if (parcalar.length > 1) parcalar = parcalar.filter((p) => p !== dusen);
  }
  return cumle(parcalar);
}

/** Mesafe metni: 1 km altı 50 metrelik adımlarla ("300 m"), 10 km altı bir ondalıkla ("2,4 km"). */
export function mesafeMetni(km: number): string {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  if (km < 10) return `${km.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} km`;
  return `${Math.round(km)} km`;
}

/** "Her gün 09:00–00:00" ya da "Pazartesi–Cuma 08:00–22:00, Cumartesi Kapalı" gibi kısa özet. */
export function saatOzeti(saatler: CalismaGunu[]): string {
  if (saatler.length === 0) return '';
  if (saatler.length === 7 && saatler.every((s) => s.metin === saatler[0].metin)) return `Her gün ${saatler[0].metin}`;
  const gruplar: Array<{ ilk: string; son: string; metin: string }> = [];
  for (const s of saatler) {
    const son = gruplar[gruplar.length - 1];
    if (son && son.metin === s.metin) son.son = s.gun;
    else gruplar.push({ ilk: s.gun, son: s.gun, metin: s.metin });
  }
  return gruplar.map((g) => `${g.ilk === g.son ? g.ilk : `${g.ilk}–${g.son}`} ${g.metin}`).join(', ');
}
