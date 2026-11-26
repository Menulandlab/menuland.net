/**
 * Giriş ve kayıt sonrası dönülecek adres (?redirect=). Yalnızca sitenin kendi yolları kabul edilir; başka bir siteye
 * yönlendirme ("//ornek.com", "https://…", "/\ornek.com") ana sayfaya çevrilir.
 */
export function guvenliYol(deger: string | null | undefined): string {
  const yol = String(deger ?? '').trim();
  if (!yol.startsWith('/') || yol.startsWith('//') || yol.startsWith('/\\') || yol.length > 300) return '/';
  // Satır sonu ya da denetim karakteri içeren yollar kabul edilmez.
  if (/[\u0000-\u001F\u007F]/.test(yol)) return '/';
  return yol;
}

/** Giriş sayfasının adresi; giriş bitince kullanıcı bu yola döner. */
export function girisAdresi(donus: string, sayfa: '/login' | '/register' = '/login'): string {
  const yol = guvenliYol(donus);
  return yol === '/' ? sayfa : `${sayfa}?redirect=${encodeURIComponent(yol)}`;
}
