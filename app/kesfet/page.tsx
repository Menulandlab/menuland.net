import { webPublicClient } from '../../lib/api';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Calendar, Compass, MapPin, Map, ArrowLeft, Ticket, Landmark, Music, TreePine, GlassWater, Landmark as Museum } from 'lucide-react';
import AdSenseBanner from '@/components/AdSenseBanner';

interface DiscoveryCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

// Keşfet ikon haritalaması (Lucide Icons)
const ICON_MAP: Record<string, any> = {
  'map-outline': Map,
  'landmark-outline': Landmark,
  'musical-notes-outline': Music,
  'wine-outline': GlassWater,
  'images-outline': Museum,
  'leaf-outline': TreePine,
};

// Tarih formatlama yardımcısı
function formatEventDate(dateString: string) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export default async function DiscoverPage() {
  const cookieStore = await cookies();
  const cityId = cookieStore.get('selectedCityId')?.value || null;
  const cityName = cookieStore.get('selectedCityName')?.value || null;

  // Kültürel Etkinlikleri ve Keşfet Kategorilerini çek
  const [eventsRes, categoriesRes] = await Promise.all([
    cityId ? webPublicClient.get(`/events?city_id=${cityId}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    webPublicClient.get('/discovery-categories').catch(() => ({ data: [] })),
  ]);

  const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];
  const categories = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

  return (
    <div className="flex flex-col gap-12 py-4">
      {/* Back button */}
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      {/* Page Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Compass className="h-8 w-8 text-[#FF4D00]" /> Keşfet
        </h1>
        <p className="text-sm text-zinc-500 flex items-center gap-1">
          {cityName ? (
            <>
              <MapPin className="h-4 w-4 text-[#FF4D00]" />
              Şu anda <span className="font-bold text-zinc-800">{cityName}</span> şehrindeki etkinlikleri ve mekanları keşfediyorsunuz.
            </>
          ) : (
            'Etkinlikleri ve mekan rehberlerini görmek için sol üstten bir şehir seçin.'
          )}
        </p>
      </div>

      {/* 1. Kültürel Etkinlikler Bölümü (Afiş Izgara Yapısı) */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
          <Ticket className="h-6 w-6 text-[#FF4D00]" /> Kültürel Etkinlikler
        </h2>

        {!cityId ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-3xl bg-zinc-50 text-zinc-500 text-sm">
            Etkinlikleri listelemek için lütfen üst menüden bir şehir seçin.
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-3xl bg-zinc-50 text-zinc-500 text-sm">
            {cityName} şehrinde yakın zamanda planlanmış bir etkinlik bulunmuyor.
          </div>
        ) : (
          /* Afiş şeklinde yan yana ve alt alta duran Grid yapısı */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {events.map((event: any) => (
              <div 
                key={event.id} 
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-all"
              >
                {/* Afiş Görseli (Portrait Boyut 3:4 Oranı) */}
                <div className="relative aspect-[3/4] w-full bg-zinc-50 overflow-hidden border-b border-gray-50 p-2">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="h-full w-full object-cover rounded-xl group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-300">
                      <Calendar className="h-10 w-10" />
                    </div>
                  )}
                  {event.category_name && (
                    <div className="absolute top-4 left-4 rounded-lg bg-[#FF4D00] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                      {event.category_name}
                    </div>
                  )}
                </div>

                {/* Afiş Alt Bilgileri */}
                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#FF4D00] transition-colors leading-snug line-clamp-2 min-h-[40px]">
                      {event.title}
                    </h3>
                    <span className="text-[11px] text-zinc-550 font-semibold flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#FF4D00] flex-shrink-0" />
                      {formatEventDate(event.event_date)}
                    </span>
                  </div>
                  
                  {/* Detay Butonu */}
                  {event.description && (
                    <a
                      href={event.description}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center rounded-xl bg-zinc-50 py-2 text-[10px] font-bold text-zinc-700 hover:bg-[#FF4D00] hover:text-white transition-all border border-gray-100"
                    >
                      Bilet / Detay
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Keşfet Sponsorlu Reklam Alanı */}
      <div className="w-full -my-4">
        <AdSenseBanner format="horizontal" />
      </div>

      {/* 2. Şehri Keşfet Bölümü */}
      {categories.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <Map className="h-6 w-6 text-[#FF4D00]" /> Şehri Keşfet
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat: any) => {
              const IconComp = ICON_MAP[cat.icon] || Map;
              return (
                <Link
                  key={cat.id}
                  href={`/kesfet/kategori/${cat.slug}?title=${encodeURIComponent(cat.name)}`}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-[#FF4D00]/20 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FF4D00]/10 flex items-center justify-center text-[#FF4D00] flex-shrink-0 group-hover:bg-[#FF4D00] group-hover:text-white transition-all">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-zinc-950 group-hover:text-[#FF4D00] transition-colors">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-xs text-zinc-500 leading-relaxed">{cat.description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
