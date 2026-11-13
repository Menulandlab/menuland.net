import type { Metadata } from 'next';
import { cache } from 'react';
import { getWebPrivateClient, webPublicClient } from '../../../lib/api';
import { fetchMenuMode, fetchFixedMenu } from '@/src/api/menuService';
import BusinessActions from '../../../components/BusinessActions';
import ReservationSection from '../../../components/ReservationSection';
import Link from 'next/link';
import Image from 'next/image';
import BusinessGallery from '../../../components/BusinessGallery';
import { Star, MapPin, Phone, Globe, Calendar, Tag, ShieldCheck, Heart, Share2, AlertTriangle, AlertCircle, ShoppingBag, Utensils, Compass } from 'lucide-react';
import { extractIdFromSlug, getBusinessUrl } from '../../../lib/utils';
import { SITE_URL, DEFAULT_OG_IMAGE, KURUMSAL_URL, jsonLd, kisalt } from '@/lib/site';
import YandexAdBanner from '@/components/YandexAdBanner';
import { isletmeninSayfalari } from '@/lib/sehirSayfalari';

interface PageProps {
  params: Promise<{ id: string }>;
}

// generateMetadata ve sayfa aynı istekte aynı veriyi kullanır; API'ye her kayıt için bir kez gidilir.
const getBusinessData = cache(async (id: string) => {
  const res = await webPublicClient.get(`/businesses/${id}`).catch(() => null);
  return res && res.data ? res.data : null;
});

const getMenuMode = cache(async (id: number, slug: string) => {
  try {
    return await fetchMenuMode(id, slug);
  } catch {
    return null;
  }
});

const getFixedMenu = cache(async (id: number, slug: string) => {
  try {
    return await fetchFixedMenu(id, slug);
  } catch {
    return null;
  }
});

/** İl ve ilçe adları (başlık, açıklama ve yapılandırılmış veri için); bulunamazsa boş döner. */
const getPlaceNames = cache(async (cityId?: number | string | null, districtId?: number | string | null) => {
  let il = '';
  let ilce = '';
  try {
    if (cityId) {
      const sehirler = await webPublicClient.get('/cities');
      const liste = Array.isArray(sehirler.data) ? sehirler.data : sehirler.data?.data || [];
      il = liste.find((s: any) => Number(s.id) === Number(cityId))?.name || '';
      if (districtId) {
        const ilceler = await webPublicClient.get('/districts', { params: { city_id: cityId } });
        const ilceListesi = Array.isArray(ilceler.data) ? ilceler.data : ilceler.data?.data || [];
        ilce = ilceListesi.find((d: any) => Number(d.id) === Number(districtId))?.name || '';
      }
    }
  } catch {
    // Ad bulunamazsa başlık yalnızca işletme adıyla kurulur.
  }
  return { il, ilce };
});

/** İşletmenin Menuland'de gösterilen bir menüsü var mı (günlük menüde ürün ya da sabit menüde kategori)? */
async function menuVarMi(business: any): Promise<boolean> {
  const mod = await getMenuMode(business.id, business.slug);
  if (mod?.menu_mode === 'daily') return Array.isArray(mod.today_items) && mod.today_items.length > 0;
  if (mod?.menu_mode === 'fixed') {
    const sabit = await getFixedMenu(business.id, business.slug);
    return Array.isArray(sabit?.data?.categories) && sabit.data.categories.length > 0;
  }
  return false;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: urlParam } = await params;
  const business = await getBusinessData(extractIdFromSlug(urlParam));
  if (!business?.name) {
    return { title: 'İşletme Bulunamadı', robots: { index: false, follow: true } };
  }
  const [{ il, ilce }, menuVar] = await Promise.all([
    getPlaceNames(business.city_id, business.district_id),
    menuVarMi(business),
  ]);
  const yer = [ilce, il].filter(Boolean).join(', ');
  // Menüsü olmayan işletmede başlık menü vaat etmez; sayfa yine dizinde kalır.
  const title = menuVar
    ? `${business.name} Menü ve Fiyatları${yer ? ` · ${yer}` : ''}`
    : `${business.name}${yer ? ` · ${yer}` : ''}`;
  const kategoriler = (Array.isArray(business.categories) ? business.categories : [])
    .map((k: any) => k?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ');
  const description = kisalt(
    `${business.name}${yer ? ` (${yer})` : ''}${kategoriler ? `: ${kategoriler}` : ''}. ` +
      (menuVar
        ? "Güncel dijital menü ve fiyatlar, adres, telefon ve fotoğraflar Menuland'de."
        : "Adres, telefon ve fotoğraflar Menuland'de."),
    158
  );
  const url = getBusinessUrl(business);
  const gorsel = business.image_url_1 || business.image_url_medium || business.image_url;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Menuland',
      locale: 'tr_TR',
      images: gorsel ? [{ url: gorsel, alt: business.name }] : [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function BusinessDetail({ params }: PageProps) {
  const { id: urlParam } = await params;
  const id = extractIdFromSlug(urlParam);

  // Tüm bilgileri paralel olarak çek
  const [businessData, commentsRes, campaignsRes] = await Promise.all([
    getBusinessData(id),
    webPublicClient.get(`/comments/${id}`).catch(() => ({ data: [] })),
    webPublicClient.get(`/businesses/${id}/campaigns`).catch(() => ({ data: [] })),
  ]);

  if (!businessData) {
    return (
      <div className="text-center py-24 flex flex-col items-center gap-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold">İşletme Bulunamadı</h1>
        <p className="text-zinc-500">Aradığınız işletme sisteme kayıtlı değil veya silinmiş.</p>
        <Link href="/" className="rounded-full bg-[#FF4D00] px-6 py-2 text-xs font-bold text-white">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  const business = businessData;
  const comments = Array.isArray(commentsRes.data) ? commentsRes.data : [];
  const campaigns = Array.isArray(campaignsRes.data) ? campaignsRes.data : [];

  // Menü verilerini çek
  let menuMode: 'daily' | 'fixed' | 'none' = 'none';
  let dailyMenuData: any = null;
  let fixedMenuData: any = null;

  try {
    const modeRes = await getMenuMode(business.id, business.slug);
    menuMode = modeRes?.menu_mode || 'none';

    if (menuMode === 'daily') {
      dailyMenuData = modeRes;
    } else if (menuMode === 'fixed') {
      const fixedRes = await getFixedMenu(business.id, business.slug);
      fixedMenuData = fixedRes?.data;
    }
  } catch (e) {
    console.log('Menü yüklenirken hata oluştu:', e);
  }

  const businessImages = [
    business.image_url_1,
    business.image_url_2,
    business.image_url_3,
    business.image_url_4,
    business.image_url_5,
    business.image_url_6,
    business.image_url_7,
    business.image_url_8,
    business.image_url_9,
    business.image_url_10,
  ].filter(Boolean) as string[];

  if (businessImages.length === 0) {
    if (business.image_url_medium) {
      businessImages.push(business.image_url_medium);
    } else if (business.image_url_1) {
      businessImages.push(business.image_url_1);
    } else if (business.image_url) {
      businessImages.push(business.image_url);
    }
  }

  // Yapılandırılmış veri: arama motorları ve yapay zekâ modelleri sayfanın bir yeme-içme mekânını anlattığını anlasın.
  const [{ il, ilce }, bulunduguSayfalar] = await Promise.all([
    getPlaceNames(business.city_id, business.district_id),
    isletmeninSayfalari(business),
  ]);
  const sayfaUrl = `${SITE_URL}${getBusinessUrl(business)}`;
  // Gezinti izi: şehir ve ilçe sayfası varsa Ana Sayfa > Ordu > Altınordu > İşletme; yoksa eskisi gibi Tüm Mekanlar.
  const izParcalari: Array<{ ad: string; url: string }> = [{ ad: 'Ana Sayfa', url: `${SITE_URL}/` }];
  if (bulunduguSayfalar.sehir) {
    izParcalari.push({ ad: bulunduguSayfalar.sehir.ad, url: `${SITE_URL}${bulunduguSayfalar.sehir.yol}` });
    if (bulunduguSayfalar.ilce) {
      izParcalari.push({ ad: bulunduguSayfalar.ilce.ad, url: `${SITE_URL}${bulunduguSayfalar.ilce.yol}` });
    }
  } else {
    izParcalari.push({ ad: 'Tüm Mekanlar', url: `${SITE_URL}/all-businesses` });
  }
  izParcalari.push({ ad: business.name, url: sayfaUrl });
  const menuVar =
    (menuMode === 'daily' && Array.isArray(dailyMenuData?.today_items) && dailyMenuData.today_items.length > 0) ||
    (menuMode === 'fixed' && Array.isArray(fixedMenuData?.categories) && fixedMenuData.categories.length > 0);
  const enlem = Number(business.latitude);
  const boylam = Number(business.longitude);
  const konumVar = Number.isFinite(enlem) && Number.isFinite(boylam) && enlem !== 0 && boylam !== 0;
  const fiyatAraligi = Number(business.price_range);
  const isletmeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FoodEstablishment',
        '@id': `${sayfaUrl}#isletme`,
        name: business.name,
        url: sayfaUrl,
        description: business.description || undefined,
        image: businessImages.length > 0 ? businessImages : undefined,
        telephone: business.phone || undefined,
        address: business.address
          ? {
              '@type': 'PostalAddress',
              streetAddress: business.address,
              addressLocality: ilce || undefined,
              addressRegion: il || undefined,
              addressCountry: 'TR',
            }
          : undefined,
        geo: konumVar ? { '@type': 'GeoCoordinates', latitude: enlem, longitude: boylam } : undefined,
        priceRange: fiyatAraligi >= 1 && fiyatAraligi <= 4 ? '₺'.repeat(fiyatAraligi) : undefined,
        hasMenu: menuVar ? `${sayfaUrl}#menu` : undefined,
        sameAs: business.instagram_url ? [business.instagram_url] : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: izParcalari.map((p, sira) => ({
          '@type': 'ListItem',
          position: sira + 1,
          name: p.ad,
          item: p.url,
        })),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(isletmeJsonLd) }} />
      {/* Back button & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          &larr; Geri Dön
        </Link>
        <BusinessActions businessId={business.id} businessName={business.name} />
      </div>

      {/* Hero Header Card */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 flex flex-col md:flex-row gap-8">
        <BusinessGallery images={businessImages} name={business.name} rating={business.rating} />

        <div className="flex flex-col justify-between flex-1 gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#FF4D00] uppercase tracking-wider">
                {business.category_text || 'Restoran'}
              </span>
              {business.is_verified && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                  <ShieldCheck className="h-3.5 w-3.5" /> Onaylı İşletme
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-zinc-900 leading-tight">{business.name}</h1>
            {business.description && (
              <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">{business.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            {business.address && (
              <div className="flex items-start gap-2 text-xs text-zinc-600">
                <MapPin className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <span className="line-clamp-2">{business.address}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <Phone className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.instagram_url && (
              <a
                href={business.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-zinc-600 hover:text-[#FF4D00]"
              >
                <Globe className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <span>Instagram'da Gör</span>
              </a>
            )}
            {konumVar && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${enlem},${boylam}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-zinc-600 hover:text-[#FF4D00]"
              >
                <MapPin className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <span>Haritada Gör</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout (Menu & Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar Actions (Right col on desktop, but shows first on mobile) */}
        <div className="lg:col-span-1 lg:order-2 flex flex-col gap-8">
          {/* Reservation Call To Action */}
          {(business.accepts_reservations === 1 || business.accepts_reservations === '1' || business.accepts_reservations === true) && (
            <ReservationSection
              businessId={business.id}
              businessName={business.name}
              businessSlug={urlParam}
            />
          )}

          {/* Sidebar Sponsorlu Reklam Alanı */}
          <div className="w-full">
            <YandexAdBanner containerId="yandex_rtb_R-A-20154632-1" />
          </div>
        </div>

        {/* Menu & Details (Left col on desktop, second on mobile) */}
        <div className="lg:col-span-2 lg:order-1 flex flex-col gap-8">
          
          {/* Menu Section */}
          <section id="menu" className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <Utensils className="h-6 w-6 text-[#FF4D00]" /> Dijital QR Menü
            </h2>

            {menuMode === 'fixed' && fixedMenuData && (
              <div className="flex flex-col gap-8">
                {fixedMenuData.categories?.map((category: any) => {
                  if (!category.is_active || category.items?.length === 0) return null;
                  return (
                    <div key={category.id} className="flex flex-col gap-4">
                      <div className="border-b border-gray-100 pb-2">
                        <h3 className="text-lg font-bold text-zinc-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-xs text-zinc-400 mt-0.5">{category.description}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {category.items?.map((item: any) => {
                          if (!item.is_available) return null;
                          const hasAlcohol = item.contains_alcohol === true || item.contains_alcohol === 1 || item.contains_alcohol === '1' || item.contains_alcohol === 'true';
                          const hasPork = item.contains_pork === true || item.contains_pork === 1 || item.contains_pork === '1' || item.contains_pork === 'true';
                          
                          return (
                            <div key={item.id} className="flex items-start justify-between gap-4 p-3 rounded-2xl hover:bg-zinc-50 transition-all">
                              <div className="flex-1 flex flex-col gap-1">
                                <h4 className="text-sm font-bold text-zinc-900">{item.name}</h4>
                                {item.description && (
                                  <p className="text-xs text-zinc-500 leading-relaxed">{item.description}</p>
                                )}
                                {(hasAlcohol || hasPork || item.calories) && (
                                  <div className="flex gap-2 mt-2 flex-wrap">
                                    {item.calories && (
                                      <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                                        {item.calories} kcal
                                      </span>
                                    )}
                                    {hasAlcohol && (
                                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded flex items-center gap-0.5">
                                        <AlertTriangle className="h-3 w-3" /> Alkol içerir
                                      </span>
                                    )}
                                    {hasPork && (
                                      <span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded flex items-center gap-0.5">
                                        <AlertTriangle className="h-3 w-3" /> Domuz ürünü içerir
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-bold text-[#FF4D00]">
                                {Number(item.price).toFixed(2)} ₺
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {menuMode === 'daily' && dailyMenuData && (
              <div className="flex flex-col gap-6">
                <div className="bg-[#FF4D00]/5 p-4 rounded-2xl border border-[#FF4D00]/10 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Günün Menüsü</h3>
                    <p className="text-xs text-zinc-500">Haftalık değişen taze lezzetler</p>
                  </div>
                  <span className="text-xs font-semibold bg-[#FF4D00]/10 text-[#FF4D00] px-3 py-1 rounded-full">
                    Aktif
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {dailyMenuData.today_items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-start justify-between gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-all border border-gray-50">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-bold text-zinc-900">{item.name}</h4>
                        {item.description && (
                          <p className="text-xs text-zinc-500">{item.description}</p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-[#FF4D00]">
                        {Number(item.price).toFixed(2)} ₺
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menü yoksa ya da boşsa (kategori veya ürün yoksa) bilgi ve işletme sahibine davet gösterilir. */}
            {!menuVar && (
              <div className="text-center py-12 text-zinc-500 flex flex-col items-center gap-2">
                <Compass className="h-8 w-8 text-zinc-300" />
                <p>Bu işletmenin menüsü henüz yüklenmedi veya güncelleniyor.</p>
                <a
                  href={`${KURUMSAL_URL}/?utm_source=menuland.net&utm_medium=isletme-sayfasi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-xs font-semibold text-[#FF4D00] hover:underline"
                >
                  Bu işletmenin sahibi misiniz? Menünüzü Menuland&apos;e ekleyin.
                </a>
              </div>
            )}
          </section>

          {/* Menü Altı / Yorumlar Üstü Sponsorlu Reklam */}
          <div className="w-full -my-2">
            <YandexAdBanner containerId="yandex_rtb_R-A-20154632-1-menu" />
          </div>

          {/* Comments Section */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Yorumlar ({comments.length})</h2>
            </div>
            
            {comments.length === 0 ? (
              <p className="text-sm text-zinc-500">Mekana henüz yorum yapılmamış. İlk yorumu mobil uygulamamız üzerinden yapabilirsiniz.</p>
            ) : (
              <div className="flex flex-col gap-6 divide-y divide-gray-100">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex flex-col gap-2 pt-6 first:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-800">{comment.user_name || 'Anonim'}</span>
                      <div className="flex items-center gap-0.5 text-xs text-zinc-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{comment.rating} / 5</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{comment.comment}</p>
                    <span className="text-[10px] text-zinc-400">{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* App Promotion CTA for commenting */}
            <div className="mt-4 rounded-2xl bg-zinc-50 border border-gray-100 p-4 text-center">
              <p className="text-xs text-zinc-650 leading-relaxed">
                Bu mekana yorum yazmak, favorilerinize eklemek ve sadakat puanları biriktirmek için **Menuland mobil uygulamasını** indirebilirsiniz.
              </p>
            </div>
          </section>

        </div>

      </div>

      {/* Bu mekânın yer aldığı ilçe, kategori ve şehir sayfaları */}
      {bulunduguSayfalar.sehir && (
        <nav aria-label="Bu mekânın yer aldığı sayfalar" className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-6">
          <h2 className="text-base font-bold text-zinc-900">Bu mekânın yer aldığı sayfalar</h2>
          <ul className="flex flex-wrap gap-2">
            {[
              ...(bulunduguSayfalar.ilce ? [{ ad: `${bulunduguSayfalar.ilce.ad} Mekanları`, yol: bulunduguSayfalar.ilce.yol }] : []),
              ...bulunduguSayfalar.kategoriler.slice(0, 6).map((k) => ({ ad: k.baslik, yol: k.yol })),
              { ad: `${bulunduguSayfalar.sehir.ad} Mekanları`, yol: bulunduguSayfalar.sehir.yol },
            ].map((b) => (
              <li key={b.yol}>
                <Link
                  href={b.yol}
                  className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                >
                  {b.ad}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

    </div>
  );
}
