'use client';

import { CEREZ_TERCIHLERI_OLAYI } from '../lib/cerezTercihi';

/** Alt bilgideki "Çerez tercihleri" bağlantısı: çerez penceresini tercih ayarlarıyla açar. */
export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CEREZ_TERCIHLERI_OLAYI))}
      className="text-left hover:text-[#FF4D00] transition-colors"
    >
      Çerez Tercihleri
    </button>
  );
}
