import { useMemo, useSyncExternalStore } from 'react';

/**
 * Ziyaretçinin çerez tercihi (KVKK çerez rehberi). Tercih tarayıcıda saklanır; çerez penceresi ve
 * reklam kutuları aynı kaydı okur. Sunucuda ve ilk boyamada tercih bilinmez (`hazir: false`).
 */

export const DEPO_ANAHTARI = 'menuland_cerez_tercihi';
/**
 * 2. sürüm (22.11.2026): reklam ağı Yandex'ten Google AdSense'e geçti. Yandex reklamlarına verilen onay
 * Google için geçerli sayılmaz; o ziyaretçilere pencere yeniden sorulur. Reklamı reddetmiş olanların
 * tercihi aynen korunur, onlara yeniden sorulmaz.
 */
const SURUM = 2;
/** Alt bilgideki bağlantı bu olayı yayınlar; çerez penceresi tercih ayarlarıyla yeniden açılır. */
export const CEREZ_TERCIHLERI_OLAYI = 'menuland:cerez-tercihleri-ac';

export type CerezTercihi = { analiz: boolean; reklam: boolean; tarih: string; surum: number };

const SUNUCU_ANLIK = '__sunucu__';
const dinleyiciler = new Set<() => void>();

function abone(dinleyici: () => void) {
  dinleyiciler.add(dinleyici);
  window.addEventListener('storage', dinleyici);
  return () => {
    dinleyiciler.delete(dinleyici);
    window.removeEventListener('storage', dinleyici);
  };
}

function hamTercih(): string {
  try {
    return window.localStorage.getItem(DEPO_ANAHTARI) ?? '';
  } catch {
    return '';
  }
}

function tercihiCoz(ham: string): CerezTercihi | null {
  if (!ham || ham === SUNUCU_ANLIK) return null;
  try {
    const t = JSON.parse(ham);
    if (!t || typeof t.analiz !== 'boolean' || typeof t.reklam !== 'boolean') return null;
    if (t.surum === SURUM) return t;
    // 1. sürümde reklamı reddeden ziyaretçinin kararı değişmedi; analiz tercihiyle birlikte korunur.
    if (t.surum === 1 && t.reklam === false) return { ...t, surum: SURUM };
  } catch {
    // Bozuk kayıt: tercih yokmuş gibi davranılır, pencere yeniden sorar.
  }
  return null;
}

/** Kayıtlı tercihi anında okur (olay dinleyicileri gibi React dışındaki yerler için). */
export function kayitliTercih(): CerezTercihi | null {
  return tercihiCoz(hamTercih());
}

export function tercihiKaydet(analiz: boolean, reklam: boolean) {
  const tercih: CerezTercihi = { analiz, reklam, tarih: new Date().toISOString(), surum: SURUM };
  try {
    window.localStorage.setItem(DEPO_ANAHTARI, JSON.stringify(tercih));
  } catch {
    // Tarayıcı depolamaya izin vermiyorsa tercih yalnızca bu sayfa için geçerli olur.
  }
  dinleyiciler.forEach((dinleyici) => dinleyici());
}

export function useCerezTercihi(): { hazir: boolean; tercih: CerezTercihi | null } {
  const ham = useSyncExternalStore(abone, hamTercih, () => SUNUCU_ANLIK);
  const tercih = useMemo(() => tercihiCoz(ham), [ham]);
  return { hazir: ham !== SUNUCU_ANLIK, tercih };
}
