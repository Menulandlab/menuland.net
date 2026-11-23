import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { AltSayfa, altSayfaMetadata } from '../AltSayfa';

// Şehir × kategori ve ilçe sayfalarının 2. ve sonraki sayfaları (örneğin /istanbul/fast-food/2). Derlemede üretilmez;
// ilk ziyarette üretilir ve saatte bir yenilenir. 1. sayfa ana adrestir; /istanbul/fast-food/1 oraya kalıcı olarak
// yönlenir. Sayı olmayan ya da var olmayan sayfa numarası gerçek 404 alır.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ sehir: string; alt: string; sayfa: string }>;
}

function sayfaNumarasi(ham: string): number | null {
  return /^[1-9][0-9]{0,3}$/.test(ham) ? Number(ham) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sehir, alt, sayfa } = await params;
  const no = sayfaNumarasi(sayfa);
  if (!no || no < 2) return {};
  return altSayfaMetadata(sehir, alt, no);
}

export default async function SehirAltSayfasiDevami({ params }: PageProps) {
  const { sehir, alt, sayfa } = await params;
  const no = sayfaNumarasi(sayfa);
  if (no === null) notFound();
  if (no === 1) permanentRedirect(`/${encodeURIComponent(sehir)}/${encodeURIComponent(alt)}`);
  return <AltSayfa sehir={sehir} alt={alt} no={no} />;
}
