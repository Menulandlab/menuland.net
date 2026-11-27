'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { sifreYenile } from '@/app/actions/sifre';
import { SIFRE_EN_AZ } from '@/lib/sifre';
import SifreKarti from '@/components/SifreKarti';

export default function SifreYenileFormu({ jeton }: { jeton: string }) {
  const [sifre, setSifre] = useState('');
  const [tekrar, setTekrar] = useState('');
  const [goster, setGoster] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [baglantiGecersiz, setBaglantiGecersiz] = useState(false);
  const [tamam, setTamam] = useState<{ mesaj: string; kullaniciAdi?: string } | null>(null);
  const [bekliyor, baslat] = useTransition();

  // Jeton adres çubuğundan ve tarayıcı geçmişinden silinir (ekran görüntüsünde ya da geçmişte kalmasın).
  useEffect(() => {
    window.history.replaceState(null, '', '/sifre-yenile');
  }, []);

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    if (Array.from(sifre).length < SIFRE_EN_AZ) return setHata(`Şifreniz en az ${SIFRE_EN_AZ} karakter olmalı.`);
    if (sifre !== tekrar) return setHata('Şifreler birbirini tutmuyor.');
    baslat(async () => {
      const sonuc = await sifreYenile({ jeton, sifre });
      if (sonuc.ok) {
        setTamam({ mesaj: sonuc.mesaj, kullaniciAdi: sonuc.kullaniciAdi });
        setSifre('');
        setTekrar('');
        return;
      }
      setBaglantiGecersiz(sonuc.neden === 'gecersiz_baglanti');
      setHata(sonuc.mesaj);
    });
  }

  if (tamam) {
    return (
      <SifreKarti baslik="Şifreniz yenilendi">
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-green-800" role="status">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{tamam.mesaj}</span>
        </div>
        {tamam.kullaniciAdi && (
          <p className="mt-4 text-xs text-zinc-600 text-center">
            Kullanıcı adınız: <span className="font-bold text-zinc-900">{tamam.kullaniciAdi}</span>. E-posta adresinizle de giriş
            yapabilirsiniz.
          </p>
        )}
        <Link
          href="/login"
          className="mt-6 w-full bg-[#D63F00] hover:bg-[#B83600] text-white font-black text-sm py-3.5 rounded-2xl transition-colors flex justify-center"
        >
          Sitede giriş yap
        </Link>
        <p className="mt-3 text-[11px] text-zinc-500 text-center">Uygulamayı kullanıyorsanız uygulamaya dönüp yeni şifrenizle giriş yapın.</p>
      </SifreKarti>
    );
  }

  return (
    <SifreKarti baslik="Yeni şifrenizi belirleyin" aciklama={`Yeni şifreniz en az ${SIFRE_EN_AZ} karakter olmalı. Uygulamada ve sitede aynı şifreyle giriş yaparsınız.`}>
      {hata && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs font-semibold text-red-700" role="alert">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {hata}
            {baglantiGecersiz && (
              <>
                {' '}
                <Link href="/sifremi-unuttum" className="underline">
                  Yeni bağlantı iste
                </Link>
              </>
            )}
          </span>
        </div>
      )}

      <form onSubmit={gonder} className="space-y-5" noValidate>
        {[
          { id: 'yeni-sifre', etiket: 'Yeni şifre', deger: sifre, degistir: setSifre },
          { id: 'yeni-sifre-tekrar', etiket: 'Yeni şifre (tekrar)', deger: tekrar, degistir: setTekrar },
        ].map((alan) => (
          <div key={alan.id} className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700" htmlFor={alan.id}>
              {alan.etiket}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              </span>
              <input
                id={alan.id}
                type={goster ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={SIFRE_EN_AZ}
                maxLength={128}
                required
                value={alan.deger}
                onChange={(olay) => alan.degistir(olay.target.value)}
                disabled={bekliyor}
                className="w-full bg-zinc-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-zinc-900 focus:bg-white focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] focus:outline-none transition-all"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setGoster((acik) => !acik)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800"
        >
          {goster ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
          {goster ? 'Şifreleri gizle' : 'Şifreleri göster'}
        </button>

        <button
          type="submit"
          disabled={bekliyor}
          className="w-full bg-[#D63F00] hover:bg-[#B83600] disabled:opacity-60 text-white font-black text-sm py-3.5 rounded-2xl transition-colors flex justify-center items-center gap-2"
        >
          {bekliyor && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Şifremi yenile
        </button>
      </form>
    </SifreKarti>
  );
}
