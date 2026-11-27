'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { sifreYenilemeIste } from '@/app/actions/sifre';
import SifreKarti from '@/components/SifreKarti';

export default function SifremiUnuttumFormu() {
  const [eposta, setEposta] = useState('');
  // Botlar için gizli alan; insan görmez ve doldurmaz.
  const [tuzak, setTuzak] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [bilgi, setBilgi] = useState<string | null>(null);
  const [bekliyor, baslat] = useTransition();

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    setBilgi(null);
    if (!eposta.trim()) {
      setHata('Lütfen e-posta adresinizi yazın.');
      return;
    }
    baslat(async () => {
      const sonuc = await sifreYenilemeIste({ eposta, tuzak });
      if (sonuc.ok) setBilgi(sonuc.mesaj);
      else setHata(sonuc.mesaj);
    });
  }

  return (
    <SifreKarti
      baslik="Şifremi unuttum"
      aciklama="Hesabınızın e-posta adresini yazın; şifrenizi yenilemeniz için bir bağlantı gönderelim. Uygulamadaki hesabınız için de geçerlidir."
    >
      {hata && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-red-700" role="alert">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{hata}</span>
        </div>
      )}

      {bilgi ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-green-800" role="status">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{bilgi}</span>
        </div>
      ) : (
        <form onSubmit={gonder} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700" htmlFor="eposta">
              E-posta adresi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              </span>
              <input
                id="eposta"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={190}
                required
                value={eposta}
                onChange={(olay) => setEposta(olay.target.value)}
                placeholder="eposta@adresiniz.com"
                disabled={bekliyor}
                className="w-full bg-zinc-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Botlar için gizli alan: ekranda ve ekran okuyucuda görünmez. */}
          <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="web_sitesi">Web siteniz</label>
            <input id="web_sitesi" type="text" tabIndex={-1} autoComplete="off" value={tuzak} onChange={(olay) => setTuzak(olay.target.value)} />
          </div>

          <button
            type="submit"
            disabled={bekliyor}
            className="w-full bg-[#D63F00] hover:bg-[#B83600] disabled:opacity-60 text-white font-black text-sm py-3.5 rounded-2xl transition-colors flex justify-center items-center gap-2"
          >
            {bekliyor && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Bağlantı gönder
          </button>
        </form>
      )}
    </SifreKarti>
  );
}
