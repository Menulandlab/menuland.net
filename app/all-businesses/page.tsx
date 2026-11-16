import { publicApiClient } from '@/src/api/client';
import type { BusinessResponse } from '@/src/api/businessService';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Star, MapPin, Compass, ArrowLeft, Utensils } from 'lucide-react';
import { getBusinessUrl } from '../../lib/utils';
import type { Metadata } from 'next';

// Sayfa başına 24 işletme (16.11.2026). Önce bütün işletmeler tek sayfada çiziliyordu; ülke geneline açılınca
// bu sayfa çok büyürdü.
const SAYFA_BOYU = 24;

interface PageProps {
  searchParams: Promise<{ search?: string; sayfa?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { search, sayfa } = await searchParams;
  const no = Math.max(1, Number(sayfa) || 1);
  return {
    title: no > 1 ? `Tüm Restoran ve Kafeler · Sayfa ${no}` : 'Tüm Restoran ve Kafeler',
    description:
      "Menuland'de listelenen restoran, kafe ve mekânların tamamı: adresler, iletişim bilgileri ve varsa güncel dijital menüler.",
    alternates: { canonical: no > 1 ? `/all-businesses?sayfa=${no}` : '/all-businesses' },
    // Arama sonuçları dizine girmez.
    ...(search ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function AllBusinesses({ searchParams }: PageProps) {
  const { search, sayfa } = await searchParams;
  const sayfaNo = Math.max(1, Number(sayfa) || 1);
  const cookieStore = await cookies();
  const cityId = cookieStore.get('selectedCityId')?.value || null;
  const districtId = cookieStore.get('selectedDistrictId')?.value || null;
  const cityName = cookieStore.get('selectedCityName')?.value || null;
  const districtName = cookieStore.get('selectedDistrictName')?.value || null;

  // Konum ve arama filtrelerini uygula; page gönderilince API sayfalı yanıt verir ({data, total}).
  const businessParams: any = { page: sayfaNo, limit: SAYFA_BOYU, status: 'approved' };
  if (cityId) businessParams.city_id = cityId;
  if (districtId) businessParams.district_id = districtId;
  if (search) businessParams.search = search;

  // İşletmeleri çek
  const yanit = await publicApiClient.get('/businesses', { params: businessParams }).catch(() => null);
  const businesses: BusinessResponse[] = Array.isArray(yanit?.data?.data) ? yanit.data.data : [];
  const toplam = Number(yanit?.data?.total) || businesses.length;
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / SAYFA_BOYU));
  const sayfaAdresi = (no: number) => {
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (no > 1) q.set('sayfa', String(no));
    const metin = q.toString();
    return metin ? `/all-businesses?${metin}` : '/all-businesses';
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Back button */}
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
          {search ? `"${search}" Arama Sonuçları` : 'Tüm Mekanlar'}
        </h1>
        <p className="text-sm text-zinc-500 flex items-center gap-1">
          {cityName ? (
            <>
              <MapPin className="h-4 w-4 text-[#FF4D00]" />
              Şu anda <span className="font-bold text-zinc-800">{districtName ? `${districtName}, ` : ''}{cityName}</span> bölgesindeki mekanları listeliyorsunuz.
            </>
          ) : (
            'Tüm bölgelerdeki mekanlar listelenmektedir.'
          )}
        </p>
      </div>

      {/* Listing */}
      {businesses.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-200 rounded-3xl bg-zinc-50 flex flex-col items-center gap-3">
          <Compass className="h-10 w-10 text-zinc-300" />
          <h3 className="text-lg font-bold text-zinc-950">Mekan Bulunamadı</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            {search 
              ? `"${search}" arama kriterine uygun mekan bulunamadı. Lütfen yazımı kontrol edin veya sol üstten farklı bir konum seçin.`
              : `Seçtiğiniz konumda (${districtName || cityName || 'bölgenizde'}) henüz işletme bulunmuyor. Sol üstten farklı bir konum seçebilirsiniz.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => (
            <Link
              key={biz.id}
              href={getBusinessUrl(biz)}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all"
            >
              {/* Image */}
              <div className="relative h-48 w-full bg-zinc-100 overflow-hidden">
                {biz.image_url_1 ? (
                  <img
                    src={biz.image_url_medium || biz.image_url_1}
                    alt={biz.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-300">
                    <Utensils className="h-10 w-10" />
                  </div>
                )}
                {biz.rating && (
                  <div className="absolute top-4 right-4 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-zinc-900 flex items-center gap-1 shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-[#FF4D00] text-[#FF4D00]" /> {biz.rating}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-2">
                <span className="text-xs font-semibold text-[#FF4D00] uppercase tracking-wider">
                  {biz.category_text || 'Restoran'}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#FF4D00] transition-colors line-clamp-1">
                  {biz.name}
                </h3>
                {biz.description && (
                  <p className="text-sm text-zinc-500 line-clamp-2">
                    {biz.description}
                  </p>
                )}
                {((biz as any).adres || biz.address) && (
                  <span className="text-xs text-zinc-400 truncate mt-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-zinc-400" />
                    {(biz as any).adres || biz.address}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {sayfaSayisi > 1 && (
        <nav aria-label="Sayfalar" className="flex items-center justify-center gap-4 text-sm">
          {sayfaNo > 1 && (
            <Link href={sayfaAdresi(sayfaNo - 1)} rel="prev" className="font-semibold text-[#FF4D00]">
              ← Önceki
            </Link>
          )}
          <span className="text-zinc-500">{`Sayfa ${sayfaNo} / ${sayfaSayisi} (${toplam} mekân)`}</span>
          {sayfaNo < sayfaSayisi && (
            <Link href={sayfaAdresi(sayfaNo + 1)} rel="next" className="font-semibold text-[#FF4D00]">
              Sonraki →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
