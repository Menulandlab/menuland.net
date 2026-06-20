import { webPublicClient } from '../../../../lib/api';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { MapPin, Compass, ArrowLeft, Landmark } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ title?: string }>;
}

export default async function DiscoveryCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { title } = await searchParams;
  
  const cookieStore = await cookies();
  const cityId = cookieStore.get('selectedCityId')?.value || null;
  const cityName = cookieStore.get('selectedCityName')?.value || null;
  const districtId = cookieStore.get('selectedDistrictId')?.value || null;
  const districtName = cookieStore.get('selectedDistrictName')?.value || null;

  // Filtre parametrelerini oluştur
  const paramsList: any = { category_slug: slug };
  if (cityId) paramsList.city_id = cityId;
  if (districtId) paramsList.district_id = districtId;

  // Mekanları çek
  const placesRes = await webPublicClient.get('/places', { params: paramsList }).catch(() => ({ data: [] }));
  const places = Array.isArray(placesRes.data) ? placesRes.data : [];

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Back button */}
      <div>
        <Link href="/kesfet" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Keşfet Sayfasına Dön
        </Link>
      </div>

      {/* Page Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Landmark className="h-8 w-8 text-[#FF4D00]" />
          {title || 'Mekanlar'}
        </h1>
        <p className="text-sm text-zinc-500 flex items-center gap-1">
          {cityName ? (
            <>
              <MapPin className="h-4 w-4 text-[#FF4D00]" />
              Şu anda <span className="font-bold text-zinc-800">{districtName ? `${districtName}, ` : ''}{cityName}</span> bölgesindeki mekanları görüntülüyorsunuz.
            </>
          ) : (
            'Tüm bölgelerdeki sonuçlar listelenmektedir.'
          )}
        </p>
      </div>

      {/* List Grid */}
      {places.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-200 rounded-3xl bg-zinc-50 flex flex-col items-center gap-3">
          <Compass className="h-10 w-10 text-zinc-300" />
          <h3 className="text-lg font-bold text-zinc-950">Mekan Bulunamadı</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            Seçtiğiniz konumda ({districtName || cityName || 'bölgenizde'}) bu kategoriye ait henüz mekan bulunmuyor. Sol üstten farklı bir konum seçebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place: any) => (
            <Link
              key={place.id}
              href={`/kesfet/place/${place.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all"
            >
              {/* Image */}
              <div className="relative h-48 w-full bg-zinc-100 overflow-hidden">
                {place.image_url ? (
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-300">
                    <Landmark className="h-10 w-10" />
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#FF4D00] transition-colors line-clamp-1">
                  {place.name}
                </h3>
                {place.description && (
                  <p className="text-sm text-zinc-500 line-clamp-2">
                    {place.description}
                  </p>
                )}
                {place.address && (
                  <span className="text-xs text-zinc-400 truncate mt-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-zinc-400" />
                    {place.address}
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
