import { getBusinesses, getBusinessListingCategories } from '@/src/api/businessService';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Star, MapPin, Compass, ArrowLeft, Utensils } from 'lucide-react';
import { getBusinessUrl } from '../../../lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const cityId = cookieStore.get('selectedCityId')?.value || null;
  const districtId = cookieStore.get('selectedDistrictId')?.value || null;
  const cityName = cookieStore.get('selectedCityName')?.value || null;
  const districtName = cookieStore.get('selectedDistrictName')?.value || null;

  // Tüm kategorileri çekerek mevcut kategori adını öğrenelim
  const categories = await getBusinessListingCategories().catch(() => []);
  const activeCategory = categories.find(c => String(c.id) === id);

  // Filtreleme parametrelerini ayarla
  const businessParams: any = { category_id: Number(id), limit: 24 };
  if (cityId) businessParams.city_id = cityId;
  if (districtId) businessParams.district_id = districtId;

  // Seçili kategoriye ve konuma özel işletmeleri çek
  const businesses = await getBusinesses(businessParams).catch(() => []);

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Back button */}
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      {/* Page Title & Location Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Utensils className="h-8 w-8 text-[#FF4D00]" />
          {activeCategory?.name || 'Mekanlar'}
        </h1>
        <p className="text-sm text-zinc-500 flex items-center gap-1">
          {cityName ? (
            <>
              <MapPin className="h-4 w-4 text-[#FF4D00]" />
              Şu anda <span className="font-bold text-zinc-800">{districtName ? `${districtName}, ` : ''}{cityName}</span> bölgesindeki sonuçları görüntülüyorsunuz.
            </>
          ) : (
            'Tüm bölgelerdeki sonuçlar listelenmektedir.'
          )}
        </p>
      </div>

      {/* Business Listing */}
      {businesses.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-200 rounded-3xl bg-zinc-50 flex flex-col items-center gap-3">
          <Compass className="h-10 w-10 text-zinc-300" />
          <h3 className="text-lg font-bold text-zinc-950">Mekan Bulunamadı</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            Seçtiğiniz konumda ({districtName || cityName || 'bölgenizde'}) bu kategoriye ait henüz işletme bulunmuyor. Farklı bir konum seçmeyi deneyebilirsiniz.
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
                {biz.address && (
                  <span className="text-xs text-zinc-400 truncate mt-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-zinc-400" />
                    {biz.address}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
