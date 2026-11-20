/**
 * İşletmenin dış menü bağlantısı (businesses.menu_url) için yardımcılar (20.11.2026).
 *
 * Menüsü Menuland'de olmayan bazı işletmelerin menüsü kendi sitelerinde ya da başka bir QR menü
 * sağlayıcısındadır. menuland.net bu bağlantıya doğrudan gitmez: ziyaretçi önce yasal bilgilendirmeyi ve
 * işletme sahibine yönelik daveti gösteren yönlendirme sayfasına (/business/<işletme>/menu) gelir.
 */

export type DisMenu = {
  /** Gidilecek tam adres (yalnızca http ya da https) */
  adres: string;
  /** Ziyaretçiye gösterilen alan adı (www olmadan) */
  alanAdi: string;
  /** Bağlantı Menuland'in kendi QR menüsüne mi gidiyor (*.menuland.net)? */
  menuland: boolean;
};

/** Veritabanındaki bağlantıyı doğrular; geçersiz ya da http(s) olmayan bağlantı için null döner. */
export function disMenu(ham: unknown): DisMenu | null {
  if (typeof ham !== 'string') return null;
  const temiz = ham.trim();
  if (!temiz) return null;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(temiz) ? temiz : `https://${temiz}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const alan = url.hostname.toLowerCase();
  if (!alan.includes('.')) return null;
  return {
    adres: url.toString(),
    alanAdi: alan.replace(/^www\./, ''),
    menuland: alan === 'menuland.net' || alan.endsWith('.menuland.net'),
  };
}

/** Yönlendirme sayfasının adresi (işletme sayfasının altında). */
export const disMenuSayfasi = (isletmeYolu: string) => `${isletmeYolu}/menu`;

/** Yönlendirme sayfası bu kadar saniye sonra menüye geçer; ziyaretçi sayfayla etkileşirse bekler. */
export const YONLENDIRME_SURESI_SN = 5;

/**
 * Yönlendirmeleri kişisel bilgi olmadan sayan uç (api.isletme menu/dis-menu-sayac.php). Yerel denemede
 * NEXT_PUBLIC_DIS_MENU_SAYAC_URL ile başka bir adres verilebilir.
 */
export const DIS_MENU_SAYAC_URL =
  process.env.NEXT_PUBLIC_DIS_MENU_SAYAC_URL || 'https://prod.api.isletme.menuland.net/menu/dis-menu-sayac.php';
