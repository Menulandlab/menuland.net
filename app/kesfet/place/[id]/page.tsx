import { webPublicClient } from '../../../../lib/api';
import Link from 'next/link';
import { Compass, MapPin, ArrowLeft, Landmark, Phone, Globe, Map } from 'lucide-react';
import BusinessGallery from '../../../../components/BusinessGallery';
import ShareButton from './ShareButton';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaceDetail({ params }: PageProps) {
  const { id } = await params;

  // Mekan detaylarını çek
  const placeRes = await webPublicClient.get(`/places/${id}`).catch(() => null);

  if (!placeRes || !placeRes.data) {
    return (
      <div className="text-center py-24 flex flex-col items-center gap-4">
        <Landmark className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold">Mekan Bulunamadı</h1>
        <p className="text-zinc-500">Aradığınız mekan bilgisi mevcut değil veya silinmiş.</p>
        <Link href="/kesfet" className="rounded-full bg-[#FF4D00] px-6 py-2 text-xs font-bold text-white">Keşfet'e Dön</Link>
      </div>
    );
  }

  const place = placeRes.data;

  // Görselleri topla
  const imageUrls = [
    place.image_url_1,
    place.image_url_2,
    place.image_url_3,
    place.image_url_4,
    place.image_url_5,
    place.image_url,
  ].filter(url => url && typeof url === 'string' && url.trim() !== '') as string[];

  if (imageUrls.length === 0) {
    imageUrls.push('/images/menuland-600x200.png');
  }

  // Format URLs
  const formatUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Back button & Share */}
      <div className="flex items-center justify-between">
        <Link href="/kesfet" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Keşfet'e Dön
        </Link>
        <ShareButton name={place.name} />
      </div>

      {/* Main Info Card */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 flex flex-col md:flex-row gap-8">
        <BusinessGallery images={imageUrls} name={place.name} />

        <div className="flex flex-col justify-between flex-1 gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-[#FF4D00] uppercase tracking-wider">
              Gezilecek Yer / Şehir Rehberi
            </span>
            <h1 className="text-3xl font-black text-zinc-900 leading-tight">{place.name}</h1>
            {place.description && (
              <p className="text-sm text-zinc-650 leading-relaxed max-w-2xl whitespace-pre-line">{place.description}</p>
            )}
          </div>

          {/* Contact & Social Links */}
          {(place.phone || place.website || place.instagram_url) && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">İletişim & Sosyal Medya</h4>
              <div className="flex flex-wrap gap-4">
                {place.phone && (
                  <a
                    href={`tel:${place.phone}`}
                    className="flex items-center gap-2 text-sm text-zinc-700 hover:text-[#FF4D00] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-gray-100 flex items-center justify-center text-zinc-550">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{place.phone}</span>
                  </a>
                )}
                {place.website && (
                  <a
                    href={formatUrl(place.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-zinc-700 hover:text-[#FF4D00] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-gray-100 flex items-center justify-center text-zinc-550">
                      <Globe className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Web Sitesi</span>
                  </a>
                )}
                {place.instagram_url && (
                  <a
                    href={formatUrl(place.instagram_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-zinc-700 hover:text-[#FF4D00] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-gray-100 flex items-center justify-center text-zinc-550">
                      <InstagramIcon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Instagram</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {place.address && (
            <div className="border-t border-gray-100 pt-6 flex items-start gap-2 text-xs text-zinc-650">
              <MapPin className="h-4 w-4 text-[#FF4D00] flex-shrink-0" />
              <span>{place.address}</span>
            </div>
          )}
        </div>
      </section>

      {/* Map Embed Section */}
      {place.latitude && place.longitude && (
        <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-zinc-950 flex items-center gap-2">
              <Map className="h-5 w-5 text-[#FF4D00]" /> Konum & Harita
            </h2>
            <p className="text-xs text-zinc-500">Mekanın harita üzerindeki konumunu görebilir ve yol tarifi alabilirsiniz.</p>
          </div>

          <div className="w-full h-[350px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative bg-zinc-50">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${place.latitude},${place.longitude}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4D00] hover:bg-[#E04400] text-white px-5 py-3 text-xs font-bold shadow-md shadow-[#FF4D00]/10 transition-all active:scale-98"
            >
              <Compass className="h-4 w-4" /> Google Haritalar'da Aç
            </a>
            <a
              href={`https://maps.apple.com/?q=${place.name}&ll=${place.latitude},${place.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white px-5 py-3 text-xs font-bold shadow-md transition-all active:scale-98"
            >
              Apple Haritalar'da Aç
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
