import type { Metadata } from 'next';
import { acikSehirler, sehirVerisi } from '@/lib/sehirSayfalari';
import { AltSayfa, altSayfaMetadata } from './AltSayfa';

// Şehir × kategori (örneğin /ordu/kahvalti) ya da ilçe (örneğin /ordu/altinordu) sayfasının 1. sayfası. İçerik ve
// sayfalama AltSayfa.tsx'te; 2. ve sonraki sayfalar [sayfa]/page.tsx'te. Veri saatte bir yenilenir.
export const revalidate = 3600;
// Derlemede bilinen sayfalar üretilir; eşiği sonradan geçen ilçe ya da kategori sayfası (ör. Samsun'a 17.11.2026'da
// toplu yüklenen işletmeler) ilk ziyarette üretilir ve saatte bir yenilenir, yeniden yayın beklemez. Bilinmeyen adres
// gerçek 404 alır: kök app/loading.tsx 18.11.2026'da kaldırıldı, çünkü yükleniyor ekranı yanıtı akış olarak başlattığı
// için notFound() durum kodunu 200 bırakıyor ve olmayan adresler dizine açık sayfa gibi görünüyordu.
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ sehir: string; alt: string }>;
}

// API derleme sırasında hata verirse derleme durur: sayfaları boşaltarak yayına çıkmaktansa önceki yayın kalır.
export async function generateStaticParams() {
  const sehirler = await acikSehirler();
  const sonuc: Array<{ sehir: string; alt: string }> = [];
  for (const s of sehirler) {
    const veri = await sehirVerisi(s.slug);
    if (!veri) continue;
    for (const d of veri.ilceler) sonuc.push({ sehir: s.slug, alt: d.slug });
    for (const k of veri.kategoriler) sonuc.push({ sehir: s.slug, alt: k.slug });
  }
  return sonuc;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sehir, alt } = await params;
  return altSayfaMetadata(sehir, alt, 1);
}

export default async function SehirAltSayfasi({ params }: PageProps) {
  const { sehir, alt } = await params;
  return <AltSayfa sehir={sehir} alt={alt} no={1} />;
}
