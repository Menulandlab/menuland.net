/** Şifre kuralları ve şifre yenileme bağlantısının jetonu (API: src/Support/SifreSifirlama.php). */

export const SIFRE_EN_AZ = 8;
export const SIFRE_EN_COK = 128;

/**
 * Bağlantıdaki jetonu ("<kullanıcı no>.<bitiş zamanı>.<imza>") yalnızca biçim ve süre için okur. İmzayı yalnızca
 * API denetleyebilir; burada süresi dolmuş bağlantıyı formu göstermeden önce yakalamak için kullanılır.
 */
export function jetonDurumu(jeton: string | undefined | null, simdi = Date.now()): 'gecerli' | 'suresi_dolmus' | 'bozuk' {
  const eslesme = /^([1-9][0-9]{0,9})\.([1-9][0-9]{9,10})\.([A-Za-z0-9_-]{43})$/.exec(String(jeton ?? ''));
  if (!eslesme) return 'bozuk';
  return Number(eslesme[2]) * 1000 < simdi ? 'suresi_dolmus' : 'gecerli';
}
