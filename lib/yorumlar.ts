/**
 * İşletme yorumları.
 *
 * Yorumlar uygulamadaki yorumlarla aynı tabloda durur.
 * - Okuma: GET /comments/<işletme no> (herkese açık).
 * - Yazma, silme, bildirme: yalnızca bireysel (uygulama) hesabının jetonuyla. Sitede jeton httpOnly çerezde durur;
 *   istekleri tarayıcı değil sunucu eylemi gönderir (app/actions/yorum.ts).
 *
 * Sayfada yorum yazanın yalnızca kullanıcı adı gösterilir (uygulamadaki gibi). API ad soyadı da gönderir ama
 * kullanılmaz: işletme sayfaları arama motorlarında dizinde.
 */

export type Yorum = {
  id: number;
  kullaniciNo: number | null;
  kullaniciAdi: string | null;
  /** 1–5 */
  puan: number;
  metin: string;
  fotograflar: string[];
  /** Uygulamada son 24 saatte işletmede "Buradayım" (check-in) yapılarak yazılmış yorum. */
  dogrulanmisZiyaret: boolean;
  /** API'nin yazdığı tarih ('YYYY-MM-DD HH:MM:SS', Türkiye saati). */
  tarih: string;
};

/** Sitede yazılan yorumun en kısa ve en uzun hâli (karakter). Uygulama yalnızca puanla da yorum bırakabiliyor. */
export const YORUM_EN_AZ = 10;
export const YORUM_EN_COK = 1000;

/** Bildirim nedenleri; API'ye bu metinlerle gider ve yönetim panelindeki şikâyet listesinde görünür. */
export const BILDIRIM_NEDENLERI = [
  'Hakaret, küfür ya da nefret söylemi',
  'Spam ya da reklam',
  'Yanıltıcı ya da gerçeğe aykırı',
  'Kişisel bilgi içeriyor',
  'Bu işletmeyle ilgili değil',
] as const;

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function sayi(deger: unknown): number | null {
  const n = typeof deger === 'number' ? deger : typeof deger === 'string' && deger.trim() !== '' ? Number(deger) : NaN;
  return Number.isFinite(n) ? n : null;
}

/** API'den gelen tek bir yorumu sayfanın kullandığı biçime çevirir; kullanılamayan kayıtta null döner. */
export function yorumuDuzenle(ham: unknown): Yorum | null {
  if (!ham || typeof ham !== 'object') return null;
  const kayit = ham as Record<string, unknown>;
  const id = sayi(kayit.id);
  const puan = sayi(kayit.rating);
  if (id === null || id <= 0 || puan === null) return null;

  const fotoKaynagi: unknown[] = Array.isArray(kayit.image_urls)
    ? kayit.image_urls
    : typeof kayit.image_url === 'string'
      ? kayit.image_url.split(',')
      : [];
  const fotograflar = fotoKaynagi
    .map((adres) => (typeof adres === 'string' ? adres.trim() : ''))
    .filter((adres) => /^https:\/\//i.test(adres))
    .slice(0, 4);

  const kullaniciAdi = typeof kayit.username === 'string' && kayit.username.trim() !== '' ? kayit.username.trim() : null;

  return {
    id,
    kullaniciNo: sayi(kayit.user_id),
    kullaniciAdi,
    // Eski kayıtlarda aralık dışı puan olabilir; sayfada 1–5 arasında gösterilir.
    puan: Math.min(5, Math.max(1, Math.round(puan))),
    metin: typeof kayit.comment_text === 'string' ? kayit.comment_text.trim() : '',
    fotograflar,
    dogrulanmisZiyaret: Number(kayit.is_verified_visit) === 1,
    tarih: typeof kayit.created_at === 'string' ? kayit.created_at : '',
  };
}

export function yorumlariDuzenle(ham: unknown): Yorum[] {
  if (!Array.isArray(ham)) return [];
  return ham.map(yorumuDuzenle).filter((yorum): yorum is Yorum => yorum !== null);
}

/**
 * '2026-07-30 12:05:00' → '30 Temmuz 2026'. Metinden okunur; tarayıcıya ve saat dilimine bağlı değildir, bu yüzden
 * sunucuda ve tarayıcıda aynı yazılır (Safari bu biçimi Date ile okuyamıyor).
 */
export function yorumTarihi(tarih: string): string {
  const eslesme = /^(\d{4})-(\d{2})-(\d{2})/.exec(tarih);
  if (!eslesme) return '';
  const ay = Number(eslesme[2]);
  if (ay < 1 || ay > 12) return '';
  return `${Number(eslesme[3])} ${AYLAR[ay - 1]} ${eslesme[1]}`;
}

/** Yorumun karakter sayısı (emoji tek karakter sayılır; API de mb_strlen kullanır). */
export function karakterSayisi(metin: string): number {
  return Array.from(metin).length;
}

/** Kullanıcının yazdığı metni kaydetmeden önce temizler: denetim karakterleri, fazla boş satır, baştaki/sondaki boşluk. */
export function yorumMetniniTemizle(metin: unknown): string {
  if (typeof metin !== 'string') return '';
  return (
    metin
      .replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}
