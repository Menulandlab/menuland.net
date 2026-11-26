'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Flag, Loader2, ShieldCheck, Star, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { yorumBildir, yorumGonder, yorumSil } from '@/app/actions/yorum';
import { girisAdresi } from '@/lib/guvenliYol';
import {
  BILDIRIM_NEDENLERI,
  YORUM_EN_AZ,
  YORUM_EN_COK,
  karakterSayisi,
  yorumTarihi,
  type Yorum,
} from '@/lib/yorumlar';

/**
 * İşletme sayfasındaki yorumlar: liste, yorum yazma, kendi yorumunu silme ve bildirme (26.11.2026).
 *
 * Liste sunucuda da çizilir (arama motorları yorumları görür). Yorum yazma kutusu herkese görünür; giriş yapmamış
 * ziyaretçi yazıp gönder'e basınca taslak bu sekmede saklanır ve giriş sayfasına gidilir. Girişten dönünce taslak
 * kutuda hazırdır.
 */

type Props = {
  isletmeId: number;
  isletmeAdi: string;
  yorumlar: Yorum[];
  /** Pasif işletmeye yeni yorum yazılmaz. */
  yazilabilir: boolean;
};

const PUAN_ADLARI = ['', 'Kötü', 'İdare eder', 'İyi', 'Çok iyi', 'Mükemmel'];

function taslakAnahtari(isletmeId: number) {
  return `menuland-yorum-taslagi-${isletmeId}`;
}

function taslagiOku(isletmeId: number): { puan: number; metin: string } | null {
  try {
    const ham = sessionStorage.getItem(taslakAnahtari(isletmeId));
    if (!ham) return null;
    const veri = JSON.parse(ham) as { puan?: unknown; metin?: unknown };
    const puan = Number(veri.puan);
    return {
      puan: Number.isInteger(puan) && puan >= 1 && puan <= 5 ? puan : 0,
      metin: typeof veri.metin === 'string' ? veri.metin.slice(0, YORUM_EN_COK + 200) : '',
    };
  } catch {
    return null;
  }
}

function taslagiYaz(isletmeId: number, puan: number, metin: string) {
  try {
    if (puan === 0 && metin.trim() === '') sessionStorage.removeItem(taslakAnahtari(isletmeId));
    else sessionStorage.setItem(taslakAnahtari(isletmeId), JSON.stringify({ puan, metin }));
  } catch {
    // Gizli sekme ya da kapalı depolama: taslak saklanmaz, yorum yine de yazılabilir.
  }
}

function Yildizlar({ puan, kucuk = true }: { puan: number; kucuk?: boolean }) {
  const boyut = kucuk ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`5 üzerinden ${puan} puan`}>
      {[1, 2, 3, 4, 5].map((sira) => (
        <Star
          key={sira}
          aria-hidden="true"
          className={`${boyut} ${sira <= puan ? 'fill-amber-400 text-amber-400' : 'fill-zinc-100 text-zinc-300'}`}
        />
      ))}
    </span>
  );
}

function PuanSecici({ deger, degistir, kapali }: { deger: number; degistir: (puan: number) => void; kapali: boolean }) {
  const [uzerinde, setUzerinde] = useState(0);
  const gosterilen = uzerinde || deger;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <div role="radiogroup" aria-label="Puanınız" className="flex items-center" onMouseLeave={() => setUzerinde(0)}>
        {[1, 2, 3, 4, 5].map((sira) => (
          <button
            key={sira}
            type="button"
            role="radio"
            aria-checked={deger === sira}
            aria-label={`${sira} yıldız: ${PUAN_ADLARI[sira]}`}
            disabled={kapali}
            onClick={() => degistir(sira)}
            onMouseEnter={() => setUzerinde(sira)}
            onFocus={() => setUzerinde(sira)}
            onBlur={() => setUzerinde(0)}
            className="rounded-lg p-1 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF4D00] disabled:cursor-not-allowed"
          >
            <Star
              aria-hidden="true"
              className={`h-7 w-7 ${sira <= gosterilen ? 'fill-amber-400 text-amber-400' : 'fill-white text-zinc-300'}`}
            />
          </button>
        ))}
      </div>
      <span className="min-w-[5.5rem] text-xs font-semibold text-zinc-500" aria-hidden="true">
        {gosterilen ? PUAN_ADLARI[gosterilen] : 'Puan seçin'}
      </span>
    </div>
  );
}

function YorumFormu({
  isletmeId,
  isletmeAdi,
  eklendi,
  oturumMesaji,
  oturumDustu,
}: {
  isletmeId: number;
  isletmeAdi: string;
  eklendi: (yorum: Yorum) => void;
  oturumMesaji: string | null;
  oturumDustu: (mesaj: string) => void;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const yol = usePathname();
  const [puan, setPuan] = useState(0);
  const [metin, setMetin] = useState('');
  const [hata, setHata] = useState<string | null>(null);
  const [bilgi, setBilgi] = useState<string | null>(null);
  const [taslakGeldi, setTaslakGeldi] = useState(false);
  const [bekliyor, baslat] = useTransition();

  // Girişten dönüldüğünde taslağı geri koy. Taslak tarayıcı deposunda durur; sunucuda okunamadığı için sayfa
  // canlandıktan sonra yüklenir (ilk çizimde okunsaydı sunucu ve tarayıcı çıktısı uyuşmazdı).
  useEffect(() => {
    const taslak = taslagiOku(isletmeId);
    if (taslak && (taslak.puan || taslak.metin)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- dış depodan (sessionStorage) tek seferlik yükleme
      setPuan(taslak.puan);
      setMetin(taslak.metin);
      setTaslakGeldi(true);
      // Girişten dönen kullanıcı taslağını görsün: sayfa yorum bölümüne kayar (yönlendirmede #yorumlar düşebiliyor).
      requestAnimationFrame(() => document.getElementById('yorumlar')?.scrollIntoView({ block: 'start' }));
    }
  }, [isletmeId]);

  const uzunluk = karakterSayisi(metin.trim());
  const donusYolu = `${yol}#yorumlar`;

  function puanDegisti(yeni: number) {
    setPuan(yeni);
    setHata(null);
    taslagiYaz(isletmeId, yeni, metin);
  }

  function metinDegisti(yeni: string) {
    setMetin(yeni);
    setHata(null);
    taslagiYaz(isletmeId, puan, yeni);
  }

  function gonder(olay: React.FormEvent) {
    olay.preventDefault();
    setHata(null);
    setBilgi(null);
    if (puan === 0) return setHata('Lütfen 1 ile 5 arasında bir puan seçin.');
    if (uzunluk < YORUM_EN_AZ) return setHata(`Yorumunuz en az ${YORUM_EN_AZ} karakter olmalı.`);
    if (uzunluk > YORUM_EN_COK) return setHata(`Yorumunuz en çok ${YORUM_EN_COK} karakter olabilir.`);

    if (!isAuthenticated) {
      taslagiYaz(isletmeId, puan, metin);
      router.push(girisAdresi(donusYolu));
      return;
    }

    baslat(async () => {
      const sonuc = await yorumGonder({ isletmeId, puan, metin });
      if (sonuc.ok) {
        if (sonuc.yorum) eklendi(sonuc.yorum);
        setPuan(0);
        setMetin('');
        setTaslakGeldi(false);
        taslagiYaz(isletmeId, 0, '');
        setBilgi(
          sonuc.kazanilanPuan > 0
            ? `Yorumunuz yayımlandı. Hesabınıza ${sonuc.kazanilanPuan} PuanLand puanı eklendi.`
            : 'Yorumunuz yayımlandı. Teşekkür ederiz!',
        );
        if (!sonuc.yorum) router.refresh();
        return;
      }
      if (sonuc.neden === 'giris') {
        oturumDustu(sonuc.mesaj);
        return;
      }
      setHata(sonuc.mesaj);
    });
  }

  const sayacRengi = uzunluk > YORUM_EN_COK ? 'text-red-600' : uzunluk >= YORUM_EN_AZ ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <form onSubmit={gonder} className="flex flex-col gap-3 rounded-2xl border border-[#F6D3BD] bg-[#FFF8F3] p-4 sm:p-5" noValidate>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-bold text-zinc-900">{isletmeAdi} hakkında ne düşünüyorsunuz?</h3>
        {isAuthenticated && user ? (
          <p className="text-xs text-zinc-500">
            <span className="font-semibold text-zinc-700">{user.username}</span> olarak yazıyorsunuz.
          </p>
        ) : (
          <p className="text-xs text-zinc-500">
            Göndermek için Menuland hesabınızla giriş yapmanız gerekir; yazdıklarınız kaybolmaz.
          </p>
        )}
      </div>

      {(oturumMesaji || taslakGeldi) && !bilgi && (
        <p className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-700" role="status">
          {oturumMesaji ?? (isAuthenticated ? 'Taslağınız hazır. Göz atıp “Yorumu gönder”e basın.' : 'Taslağınız saklandı.')}
        </p>
      )}

      <PuanSecici deger={puan} degistir={puanDegisti} kapali={bekliyor} />

      <div className="flex flex-col gap-1">
        <label htmlFor={`yorum-metni-${isletmeId}`} className="sr-only">
          Yorumunuz
        </label>
        <textarea
          id={`yorum-metni-${isletmeId}`}
          value={metin}
          onChange={(olay) => metinDegisti(olay.target.value)}
          disabled={bekliyor}
          rows={4}
          maxLength={YORUM_EN_COK + 200}
          placeholder="Neler yediniz, nasıl buldunuz? Lezzet, hizmet, ortam…"
          className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF4D00] focus:outline-none focus:ring-1 focus:ring-[#FF4D00]"
        />
        <div className="flex items-center justify-between gap-3 text-[11px]">
          <span className="text-zinc-500">En az {YORUM_EN_AZ} karakter.</span>
          <span className={sayacRengi}>
            {uzunluk} / {YORUM_EN_COK}
          </span>
        </div>
      </div>

      {hata && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700" role="alert">
          {hata}
        </p>
      )}
      {bilgi && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800" role="status">
          {bilgi}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={bekliyor || isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D63F00] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#B83600] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bekliyor && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isAuthenticated ? 'Yorumu gönder' : 'Giriş yapıp gönder'}
        </button>
        {!isAuthenticated && !isLoading && (
          <span className="text-xs text-zinc-500">
            Hesabınız yok mu?{' '}
            <Link href={girisAdresi(donusYolu, '/register')} className="font-semibold text-[#D63F00] hover:underline">
              Ücretsiz hesap oluşturun
            </Link>
          </span>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-zinc-500">
        Yorumunuz kullanıcı adınızla birlikte bu sayfada herkese açık yayımlanır. Hakaret, kişisel bilgi, reklam ya da
        yanıltıcı içerik taşıyan yorumlar kaldırılır. Ayrıntılar:{' '}
        <Link href="/kullanim-kosullari" className="font-semibold text-zinc-700 hover:underline">
          Kullanım Koşulları
        </Link>
        .
      </p>
    </form>
  );
}

function YorumSatiri({
  yorum,
  isletmeId,
  silindi,
  oturumDustu,
}: {
  yorum: Yorum;
  isletmeId: number;
  silindi: (yorumId: number) => void;
  oturumDustu: (mesaj: string) => void;
}) {
  const { user, isAuthenticated } = useAuth();
  const yol = usePathname();
  const [bildirimAcik, setBildirimAcik] = useState(false);
  const [neden, setNeden] = useState('');
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [bekliyor, baslat] = useTransition();
  const benim = Boolean(user && yorum.kullaniciNo !== null && Number(user.id) === yorum.kullaniciNo);
  const tarih = yorumTarihi(yorum.tarih);

  function sil() {
    if (!window.confirm('Yorumunuzu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;
    setMesaj(null);
    baslat(async () => {
      const sonuc = await yorumSil({ yorumId: yorum.id, isletmeId });
      if (sonuc.ok) return silindi(yorum.id);
      if (sonuc.neden === 'giris') oturumDustu(sonuc.mesaj);
      setMesaj(sonuc.mesaj);
    });
  }

  function bildir(olay: React.FormEvent) {
    olay.preventDefault();
    if (!neden) return setMesaj('Lütfen bir neden seçin.');
    setMesaj(null);
    baslat(async () => {
      const sonuc = await yorumBildir({ yorumId: yorum.id, neden });
      setMesaj(sonuc.mesaj);
      if (sonuc.ok) setBildirimAcik(false);
      else if (sonuc.neden === 'giris') oturumDustu(sonuc.mesaj);
    });
  }

  return (
    <li className="flex flex-col gap-2 pt-5 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-bold text-zinc-800">{yorum.kullaniciAdi ?? 'Menuland kullanıcısı'}</span>
          {yorum.dogrulanmisZiyaret && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
              title="Uygulamada işletmede “Buradayım” denilerek yazılmış yorum"
            >
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Doğrulanmış ziyaret
            </span>
          )}
        </div>
        <Yildizlar puan={yorum.puan} />
      </div>

      {yorum.metin && <p className="whitespace-pre-line break-words text-sm leading-relaxed text-zinc-700">{yorum.metin}</p>}

      {yorum.fotograflar.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {yorum.fotograflar.map((adres, sira) => (
            <a key={adres} href={adres} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-gray-100">
              {/* Kullanıcı fotoğrafları API'nin görsel adresinden gelir; küçük önizleme, tıklayınca tam boy. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={adres}
                alt={`${yorum.kullaniciAdi ?? 'Kullanıcı'} yorumundaki fotoğraf ${sira + 1}`}
                loading="lazy"
                decoding="async"
                width={80}
                height={80}
                className="h-20 w-20 object-cover"
              />
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400">
        {tarih && <span>{tarih}</span>}
        {benim ? (
          <button
            type="button"
            onClick={sil}
            disabled={bekliyor}
            className="inline-flex items-center gap-1 font-semibold text-zinc-500 hover:text-red-600 disabled:opacity-60"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Yorumumu sil
          </button>
        ) : isAuthenticated ? (
          <button
            type="button"
            onClick={() => {
              setBildirimAcik((acik) => !acik);
              setMesaj(null);
            }}
            aria-expanded={bildirimAcik}
            className="inline-flex items-center gap-1 font-semibold text-zinc-500 hover:text-zinc-800"
          >
            <Flag className="h-3 w-3" aria-hidden="true" />
            Bildir
          </button>
        ) : (
          <Link href={girisAdresi(`${yol}#yorumlar`)} className="inline-flex items-center gap-1 font-semibold text-zinc-500 hover:text-zinc-800">
            <Flag className="h-3 w-3" aria-hidden="true" />
            Bildir
          </Link>
        )}
      </div>

      {bildirimAcik && (
        <form onSubmit={bildir} className="flex flex-wrap items-center gap-2 rounded-xl bg-zinc-50 p-3">
          <label htmlFor={`bildirim-${yorum.id}`} className="text-xs font-semibold text-zinc-700">
            Neden bildiriyorsunuz?
          </label>
          <select
            id={`bildirim-${yorum.id}`}
            value={neden}
            onChange={(olay) => setNeden(olay.target.value)}
            disabled={bekliyor}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-zinc-800"
          >
            <option value="">Seçin</option>
            {BILDIRIM_NEDENLERI.map((secenek) => (
              <option key={secenek} value={secenek}>
                {secenek}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={bekliyor}
            className="rounded-full bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            Gönder
          </button>
        </form>
      )}

      {mesaj && (
        <p className="text-[11px] font-semibold text-zinc-600" role="status">
          {mesaj}
        </p>
      )}
    </li>
  );
}

export default function YorumBolumu({ isletmeId, isletmeAdi, yorumlar, yazilabilir }: Props) {
  const { oturumuYenile } = useAuth();
  const [eklenenler, setEklenenler] = useState<Yorum[]>([]);
  const [silinenler, setSilinenler] = useState<number[]>([]);
  const [oturumMesaji, setOturumMesaji] = useState<string | null>(null);

  // Sunucudan gelen liste (yorum gönderilince sayfa yeniden hazırlanır ve yeni yorumu içerir) ile bu sekmede
  // eklenen ve silinenler birleştirilir; aynı yorum iki kez görünmez.
  const liste = useMemo(() => {
    const sunucudakiler = new Set(yorumlar.map((yorum) => yorum.id));
    return [...eklenenler.filter((yorum) => !sunucudakiler.has(yorum.id)), ...yorumlar].filter(
      (yorum) => !silinenler.includes(yorum.id),
    );
  }, [yorumlar, eklenenler, silinenler]);

  const ortalama = liste.length ? liste.reduce((toplam, yorum) => toplam + yorum.puan, 0) / liste.length : 0;

  // Sunucu eylemi çerezleri zaten sildi; burada yalnızca oturum yeniden okunur.
  function oturumDustu(mesaj: string) {
    setOturumMesaji(mesaj);
    oturumuYenile();
  }

  return (
    <section id="yorumlar" className="flex scroll-mt-24 flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">Yorumlar ({liste.length})</h2>
        {liste.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span>{ortalama.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
            <span className="text-xs font-normal text-zinc-500">/ 5</span>
          </div>
        )}
      </div>

      {yazilabilir ? (
        <YorumFormu
          isletmeId={isletmeId}
          isletmeAdi={isletmeAdi}
          eklendi={(yorum) => {
            setOturumMesaji(null);
            setEklenenler((onceki) => [yorum, ...onceki.filter((eski) => eski.id !== yorum.id)]);
          }}
          oturumMesaji={oturumMesaji}
          oturumDustu={oturumDustu}
        />
      ) : (
        <p className="rounded-2xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500">Bu işletme şu anda yeni yorum almıyor.</p>
      )}

      {liste.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {yazilabilir ? 'Bu işletmeye henüz yorum yazılmadı. İlk yorumu siz yazın.' : 'Bu işletmeye henüz yorum yazılmadı.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-5 divide-y divide-gray-100">
          {liste.map((yorum) => (
            <YorumSatiri
              key={yorum.id}
              yorum={yorum}
              isletmeId={isletmeId}
              silindi={(yorumId) => setSilinenler((onceki) => [...onceki, yorumId])}
              oturumDustu={oturumDustu}
            />
          ))}
        </ul>
      )}

      <p className="text-[11px] leading-relaxed text-zinc-500">
        Fotoğraflı yorum yazmak ve “Doğrulanmış ziyaret” rozeti almak için{' '}
        <a href="#download-app-footer" className="font-semibold text-zinc-700 hover:underline">
          Menuland uygulamasını
        </a>{' '}
        kullanabilirsiniz.
      </p>
    </section>
  );
}
