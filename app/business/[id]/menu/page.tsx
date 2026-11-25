import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { webPublicClient } from '@/lib/api';
import { extractIdFromSlug, getBusinessUrl } from '@/lib/utils';
import { APP_STORE_URL, GOOGLE_PLAY_URL, KURUMSAL_URL, whatsappBaglantisi } from '@/lib/site';
import { disMenu } from '@/lib/disMenu';
import DisMenuYonlendirme from '@/components/DisMenuYonlendirme';

/**
 * Dış menü yönlendirme sayfası (20.11.2026). Menüsü Menuland'de olmayan, ama kendi sitesinde ya da başka bir
 * QR menü sağlayıcısında menüsü bulunan işletmeye gitmeden önce açılır: yasal bilgilendirme, işletme sahibine
 * davet ve uygulama daveti gösterilir, birkaç saniye sonra menüye geçilir. Arama motorlarına kapalıdır.
 */

// İşletme sayfasıyla aynı önbellek kuralı: ilk istekte hazırlanır, bir saat önbellekten sunulur.
export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// İşletme sayfasıyla aynı kural: API bilinmeyen işletmede 200 ile {success: false} döndürüyor
const getBusinessData = cache(async (id: string) => {
  const res = await webPublicClient.get(`/businesses/${id}`).catch(() => null);
  const veri = res && res.data ? res.data : null;
  return veri && veri.success !== false && veri.name ? veri : null;
});

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
    // il ve ilçe adı olmadan da sayfa açılır
  }
  return { il, ilce };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const business = await getBusinessData(extractIdFromSlug(id));
  return {
    title: business ? `${business.name} menüsüne yönlendiriliyorsunuz` : 'Menüye yönlendirme',
    description: 'Menuland dışındaki bir menü sayfasına yönlendirme.',
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export default async function DisMenuSayfasi({ params }: PageProps) {
  const { id: urlParam } = await params;
  const business = await getBusinessData(extractIdFromSlug(urlParam));
  if (!business) {
    notFound();
  }

  const isletmeYolu = getBusinessUrl(business);
  const menu = disMenu(business.menu_url);
  // Bağlantı yoksa işletme sayfasına dönülür; Menuland'in kendi QR menüsüne bilgilendirmesiz gidilir.
  if (!menu) {
    redirect(isletmeYolu);
  }
  if (menu.menuland) {
    redirect(menu.adres);
  }

  const { il, ilce } = await getPlaceNames(business.city_id, business.district_id);
  const konum = [ilce, il].filter(Boolean).join(', ');
  const gorsel: string | null = business.image_url_medium || business.image_url_1 || business.image_url || null;

  return (
    <DisMenuYonlendirme
      isletme={{ id: Number(business.id), ad: business.name, yol: isletmeYolu, konum, gorsel }}
      menu={{ adres: menu.adres, alanAdi: menu.alanAdi }}
      baglantilar={{
        sahibiyim: whatsappBaglantisi(
          `Merhaba, ${business.name} (#${business.id}) işletmesinin sahibiyim. Menümü Menuland'e taşımak istiyorum.`,
          'WEB-DISMENU'
        ),
        duzelt: whatsappBaglantisi(
          `Merhaba, ${business.name} (#${business.id}) işletmesinin Menuland'deki menü bağlantısıyla (${menu.alanAdi}) ilgili yazıyorum.`,
          'WEB-DISMENU-DUZELT'
        ),
        kurumsal: `${KURUMSAL_URL}/?utm_source=menuland.net&utm_medium=dis-menu-yonlendirme`,
        appStore: APP_STORE_URL,
        googlePlay: GOOGLE_PLAY_URL,
      }}
    />
  );
}
