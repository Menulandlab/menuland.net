'use server';

import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { API_URL } from '@/lib/site';
import { isletmeEtiketi, isletmeNumarasi } from '@/lib/isletmeKaydi';
import {
  BILDIRIM_NEDENLERI,
  YORUM_EN_AZ,
  YORUM_EN_COK,
  karakterSayisi,
  yorumMetniniTemizle,
  yorumuDuzenle,
  type Yorum,
} from '@/lib/yorumlar';
import { logoutAction } from './auth';

/**
 * Sitedeki yorum işlemleri (yazma, silme, bildirme).
 *
 * Oturum jetonu httpOnly çerezde (authToken) durur ve tarayıcı kodu onu göremez; API'ye isteği bu sunucu eylemleri
 * gönderir. Jeton geçersizse (401) ya da bireysel hesaba ait değilse (403) çerezler silinir ve kullanıcıdan yeniden
 * giriş istenir.
 *
 * Yorum kaydedilince işletme sayfasının önbelleği hemen yenilenir. API de aynı işi kendi tarafında yapar
 * (SiteYenileme); ikisinden biri yeter, ikisi birden zarar vermez.
 */

type Neden = 'giris' | 'gecersiz' | 'sinir' | 'hata';
type Basarisiz = { ok: false; neden: Neden; mesaj: string };

export type YorumGondermeSonucu = { ok: true; yorum: Yorum | null; kazanilanPuan: number } | Basarisiz;
export type YorumIslemSonucu = { ok: true; mesaj: string } | Basarisiz;

const GENEL_HATA = 'Şu anda işlem yapılamadı. Lütfen biraz sonra yeniden deneyin.';

function basarisiz(neden: Neden, mesaj: string): Basarisiz {
  return { ok: false, neden, mesaj };
}

async function oturumJetonu(): Promise<string | null> {
  const jeton = (await cookies()).get('authToken')?.value;
  return jeton && jeton.length < 4096 ? jeton : null;
}

/** API'nin kullanıcıya yönelik Türkçe mesajı (yalnızca 4xx yanıtlarda kullanılır; 5xx ayrıntısı gösterilmez). */
function apiMesaji(veri: unknown): string | null {
  const mesaj = veri && typeof veri === 'object' ? (veri as { message?: unknown }).message : null;
  return typeof mesaj === 'string' && mesaj.trim() !== '' && mesaj.length <= 300 ? mesaj.trim() : null;
}

async function apiIstegi(yol: string, jeton: string, method: string, govde?: unknown): Promise<Response> {
  return fetch(`${API_URL}${yol}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jeton}`,
    },
    body: govde === undefined ? undefined : JSON.stringify(govde),
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
}

/** Jeton çerezi yok: kalmış olabilecek kullanıcı çerezi de silinir, tarayıcıdaki oturum kapanır. */
async function oturumYok(mesaj: string): Promise<Basarisiz> {
  await logoutAction();
  return basarisiz('giris', mesaj);
}

/** 401/403: oturum geçersiz ya da hesap türü uygun değil; çerezler silinir. */
async function oturumHatasi(durum: number): Promise<Basarisiz> {
  await logoutAction();
  return basarisiz(
    'giris',
    durum === 401
      ? 'Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.'
      : 'Bu işlem için Menuland bireysel hesabınızla giriş yapın.',
  );
}

export async function yorumGonder(girdi: { isletmeId: number; puan: number; metin: string }): Promise<YorumGondermeSonucu> {
  const isletmeId = isletmeNumarasi(girdi?.isletmeId);
  const puan = Number(girdi?.puan);
  const metin = yorumMetniniTemizle(girdi?.metin);

  if (isletmeId === null) return basarisiz('gecersiz', 'İşletme bulunamadı.');
  if (!Number.isInteger(puan) || puan < 1 || puan > 5) return basarisiz('gecersiz', 'Lütfen 1 ile 5 arasında bir puan seçin.');
  const uzunluk = karakterSayisi(metin);
  if (uzunluk < YORUM_EN_AZ) return basarisiz('gecersiz', `Yorumunuz en az ${YORUM_EN_AZ} karakter olmalı.`);
  if (uzunluk > YORUM_EN_COK) return basarisiz('gecersiz', `Yorumunuz en çok ${YORUM_EN_COK} karakter olabilir.`);

  const jeton = await oturumJetonu();
  if (!jeton) return oturumYok('Yorum yazmak için giriş yapın.');

  let yanit: Response;
  try {
    yanit = await apiIstegi('/comments', jeton, 'POST', { business_id: isletmeId, rating: puan, comment_text: metin });
  } catch {
    return basarisiz('hata', GENEL_HATA);
  }

  if (yanit.status === 401 || yanit.status === 403) return oturumHatasi(yanit.status);
  const veri: unknown = await yanit.json().catch(() => null);
  if (yanit.status === 429) {
    return basarisiz('sinir', apiMesaji(veri) ?? 'Kısa sürede çok fazla yorum yazdınız. Lütfen biraz sonra yeniden deneyin.');
  }
  if (yanit.status >= 400 && yanit.status < 500) return basarisiz('gecersiz', apiMesaji(veri) ?? 'Yorumunuz kaydedilemedi.');
  const kayit = (veri ?? {}) as { success?: unknown; comment?: unknown; puan_earned?: unknown };
  if (!yanit.ok || kayit.success !== true) return basarisiz('hata', GENEL_HATA);

  revalidateTag(isletmeEtiketi(isletmeId), { expire: 0 });
  const kazanilanPuan = Number(kayit.puan_earned);
  return { ok: true, yorum: yorumuDuzenle(kayit.comment), kazanilanPuan: Number.isFinite(kazanilanPuan) ? kazanilanPuan : 0 };
}

export async function yorumSil(girdi: { yorumId: number; isletmeId: number }): Promise<YorumIslemSonucu> {
  const yorumId = isletmeNumarasi(girdi?.yorumId);
  const isletmeId = isletmeNumarasi(girdi?.isletmeId);
  if (yorumId === null || isletmeId === null) return basarisiz('gecersiz', 'Yorum bulunamadı.');

  const jeton = await oturumJetonu();
  if (!jeton) return oturumYok('Yorumunuzu silmek için giriş yapın.');

  let yanit: Response;
  try {
    yanit = await apiIstegi(`/comments/${yorumId}`, jeton, 'DELETE');
  } catch {
    return basarisiz('hata', GENEL_HATA);
  }

  if (yanit.status === 401) return oturumHatasi(401);
  const veri: unknown = await yanit.json().catch(() => null);
  // 403 burada "yorum başkasına ait" demektir (oturum sorunu değil).
  if (yanit.status === 403 || yanit.status === 404) return basarisiz('gecersiz', apiMesaji(veri) ?? 'Bu yorum silinemez.');
  if (!yanit.ok) return basarisiz('hata', GENEL_HATA);

  revalidateTag(isletmeEtiketi(isletmeId), { expire: 0 });
  return { ok: true, mesaj: 'Yorumunuz silindi.' };
}

export async function yorumBildir(girdi: { yorumId: number; neden: string }): Promise<YorumIslemSonucu> {
  const yorumId = isletmeNumarasi(girdi?.yorumId);
  const neden = BILDIRIM_NEDENLERI.find((secenek) => secenek === girdi?.neden);
  if (yorumId === null || !neden) return basarisiz('gecersiz', 'Lütfen bir bildirim nedeni seçin.');

  // Bildirimi yalnızca giriş yapmış kullanıcı gönderebilir; adsız toplu bildirimin önüne geçer.
  const jeton = await oturumJetonu();
  if (!jeton) return oturumYok('Bildirmek için giriş yapın.');

  let yanit: Response;
  try {
    yanit = await apiIstegi(`/comments/${yorumId}/report`, jeton, 'POST', { reason: neden, details: 'menuland.net' });
  } catch {
    return basarisiz('hata', GENEL_HATA);
  }

  if (yanit.status === 401) return oturumHatasi(401);
  if (yanit.status === 429) return basarisiz('sinir', 'Kısa sürede çok fazla bildirim gönderdiniz. Lütfen biraz sonra yeniden deneyin.');
  if (!yanit.ok) return basarisiz('hata', GENEL_HATA);
  return { ok: true, mesaj: 'Bildiriminiz için teşekkür ederiz. Yorum incelemeye alındı.' };
}
