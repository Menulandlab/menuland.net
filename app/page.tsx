import { getBusinesses, getBusinessListingCategories } from '@/src/api/businessService';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Search, Star, MapPin, Utensils, Compass } from 'lucide-react';
import { getBusinessUrl, getCategoryUrl } from '../lib/utils';
import AdSenseBanner from '@/components/AdSenseBanner';

export default async function Home() {
  const cookieStore = await cookies();
  const cityId = cookieStore.get('selectedCityId')?.value || null;
  const districtId = cookieStore.get('selectedDistrictId')?.value || null;
  const cityName = cookieStore.get('selectedCityName')?.value || null;
  const districtName = cookieStore.get('selectedDistrictName')?.value || null;

  // Konum parametrelerini API'ye geç
  const businessParams: any = { limit: 12 };
  if (cityId) businessParams.city_id = cityId;
  if (districtId) businessParams.district_id = districtId;

  // Kategorileri ve seçili konuma özel işletmeleri sunucuda paralel olarak çek
  const [categories, businesses] = await Promise.all([
    getBusinessListingCategories().catch(() => []),
    getBusinesses(businessParams).catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-16 py-8">
      
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-gradient-to-b from-[#FF4D00]/5 to-transparent rounded-3xl">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 max-w-4xl mx-auto leading-tight">
          Aradığınız Lezzetin <br className="sm:hidden" />
          <span className="text-[#FF4D00]">En Güncel Menüsü</span> Menuland'de!
        </h1>
        <p className="mt-6 text-lg text-zinc-600 max-w-2xl mx-auto">
          {cityName ? (
            <span className="block text-zinc-700 text-sm sm:text-base leading-relaxed">
              <MapPin className="inline-block h-4 w-4 sm:h-5 sm:w-5 text-[#FF4D00] mr-1.5 align-text-bottom" />
              Şu anda <span className="font-bold text-zinc-900">{districtName ? `${districtName}, ` : ''}{cityName}</span> bölgesindeki güncel dijital menüleri listeliyorsunuz.
            </span>
          ) : (
            <span>Yüzlerce restoranın güncel dijital menülerini ve yemek fiyatlarını inceleyin.</span>
          )}
        </p>

        {/* Search Bar */}
        <div className="mt-10 max-w-xl mx-auto">
          <form action="/all-businesses" method="GET" className="relative flex items-center">
            <input
              type="text"
              name="search"
              placeholder="Restoran veya lezzet ara... (örn: Burger)"
              className="w-full rounded-full border border-gray-200 bg-white px-6 py-4 pr-16 text-sm shadow-lg shadow-zinc-100 focus:border-[#FF4D00] focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 rounded-full bg-[#FF4D00] p-2.5 text-white hover:bg-[#e04300] transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>
      </section>

      {/* Hero Altı Sponsorlu Reklam Alanı */}
      <div className="max-w-4xl mx-auto w-full -my-6">
        <AdSenseBanner format="horizontal" />
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Kategoriler</h2>
            <Link href="/all-categories" className="text-sm font-semibold text-[#FF4D00] hover:underline">Tümünü Gör</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                href={getCategoryUrl(category)}
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#FF4D00]/30 hover:shadow-lg transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#FF4D00]/10 flex items-center justify-center text-xl text-[#FF4D00] group-hover:bg-[#FF4D00] group-hover:text-white transition-all">
                  <Utensils className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-800 truncate w-full">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Businesses */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            {cityName ? `${cityName} Popüler Mekanlar` : 'Popüler Mekanlar'}
          </h2>
          <Link href="/all-businesses" className="text-sm font-semibold text-[#FF4D00] hover:underline">Tümünü Gör</Link>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 flex flex-col items-center gap-2">
            <Compass className="h-8 w-8 text-zinc-300" />
            <p>Seçtiğiniz konumda ({districtName || cityName || 'bölgenizde'}) henüz işletme bulunmuyor. Sol üstten farklı bir konum seçebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.slice(0, 12).map((biz) => (
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
      </section>

      {/* Sayfa Altı Geniş Sponsorlu Reklam */}
      <section className="w-full">
        <AdSenseBanner format="auto" />
      </section>

    </div>
  );
}
