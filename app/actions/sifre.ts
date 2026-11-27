'use server';

import { API_URL } from '@/lib/site';
import { SIFRE_EN_AZ, SIFRE_EN_COK } from '@/lib/sifre';

/**
 * Şifremi unuttum (26.11.2026).
 *
 * 1. /sifremi-unuttum: e-posta adresi API'ye gider (POST /auth/forgot-password). Kayıtlı hesap varsa API yenileme
 *    bağlantısını e-postayla gönderir; yanıt her durumda aynıdır, hangi adresin kayıtlı olduğu belli olmaz.
 * 2. /sifre-yenile?j=…: bağlantıdaki jeton ve yeni şifre API'ye gider (POST /auth/reset-password).
 *
 * Uygulamadaki "Şifremi unuttum" ekranı da aynı API ucunu çağırır; yeni şifre her durumda bu sitede belirlenir.
 */

export type SifreSonucu =
  | { ok: true; mesaj: string; kullaniciAdi?: string }
  | { ok: false; neden: 'gecersiz_baglanti' | 'gecersiz' | 'sinir' | 'hata'; mesaj: string };

const GENEL_HATA = 'Şu anda işlem yapılamadı. Lütfen biraz sonra yeniden deneyin.';

function apiMesaji(veri: unknown): string | null {
  const mesaj = veri && typeof veri === 'object' ? (veri as { message?: unknown }).message : null;
  return typeof mesaj === 'string' && mesaj.trim() !== '' && mesaj.length <= 400 ? mesaj.trim() : null;
}

async function apiye(yol: string, govde: unknown): Promise<{ durum: number; veri: unknown }> {
  const yanit = await fetch(`${API_URL}${yol}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(govde),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  return { durum: yanit.status, veri: await yanit.json().catch(() => null) };
}

/** tuzak: botlar için gizli alan; insan görmez ve doldurmaz. Doluysa istek gönderilmeden aynı yanıt döner. */
export async function sifreYenilemeIste(girdi: { eposta: string; tuzak?: string }): Promise<SifreSonucu> {
  const eposta = String(girdi?.eposta ?? '').trim().toLowerCase();
  if (eposta.length > 190 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta)) {
    return { ok: false, neden: 'gecersiz', mesaj: 'Lütfen geçerli bir e-posta adresi yazın.' };
  }
  const genelMesaj =
    'Bu adresle kayıtlı bir Menuland hesabı varsa şifre yenileme bağlantısını gönderdik. Gelen kutunuzu ve istenmeyen e-posta klasörünü kontrol edin. Bağlantı 1 saat geçerlidir.';
  if (girdi?.tuzak) return { ok: true, mesaj: genelMesaj };

  try {
    const { durum, veri } = await apiye('/auth/forgot-password', { email: eposta });
    if (durum === 429) return { ok: false, neden: 'sinir', mesaj: apiMesaji(veri) ?? 'Çok fazla deneme yapıldı. Lütfen bir saat sonra yeniden deneyin.' };
    if (durum === 400) return { ok: false, neden: 'gecersiz', mesaj: apiMesaji(veri) ?? 'Lütfen geçerli bir e-posta adresi yazın.' };
    if (durum !== 200) return { ok: false, neden: 'hata', mesaj: GENEL_HATA };
    return { ok: true, mesaj: apiMesaji(veri) ?? genelMesaj };
  } catch {
    return { ok: false, neden: 'hata', mesaj: GENEL_HATA };
  }
}

export async function sifreYenile(girdi: { jeton: string; sifre: string }): Promise<SifreSonucu> {
  const jeton = String(girdi?.jeton ?? '').trim();
  const sifre = String(girdi?.sifre ?? '');
  if (!jeton || jeton.length > 200) {
    return { ok: false, neden: 'gecersiz_baglanti', mesaj: 'Bu bağlantı geçersiz. Lütfen yeni bir şifre yenileme bağlantısı isteyin.' };
  }
  if (Array.from(sifre).length < SIFRE_EN_AZ) {
    return { ok: false, neden: 'gecersiz', mesaj: `Şifreniz en az ${SIFRE_EN_AZ} karakter olmalı.` };
  }
  if (Array.from(sifre).length > SIFRE_EN_COK) {
    return { ok: false, neden: 'gecersiz', mesaj: `Şifreniz en çok ${SIFRE_EN_COK} karakter olabilir.` };
  }

  try {
    const { durum, veri } = await apiye('/auth/reset-password', { token: jeton, password: sifre });
    const kayit = (veri ?? {}) as { success?: unknown; code?: unknown; username?: unknown };
    if (durum === 200 && kayit.success === true) {
      return {
        ok: true,
        mesaj: apiMesaji(veri) ?? 'Şifreniz yenilendi.',
        kullaniciAdi: typeof kayit.username === 'string' ? kayit.username : undefined,
      };
    }
    if (durum === 400 && kayit.code === 'gecersiz_baglanti') {
      return {
        ok: false,
        neden: 'gecersiz_baglanti',
        mesaj: apiMesaji(veri) ?? 'Bu bağlantı geçersiz ya da süresi dolmuş. Lütfen yeni bir şifre yenileme bağlantısı isteyin.',
      };
    }
    if (durum === 400) return { ok: false, neden: 'gecersiz', mesaj: apiMesaji(veri) ?? 'Şifreniz kurala uymuyor.' };
    return { ok: false, neden: 'hata', mesaj: GENEL_HATA };
  } catch {
    return { ok: false, neden: 'hata', mesaj: GENEL_HATA };
  }
}
