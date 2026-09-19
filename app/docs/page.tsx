import { Metadata } from 'next';
import Link from 'next/link';
import {
  Smartphone,
  UtensilsCrossed,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  Search,
  CheckCircle2,
  FileText
} from 'lucide-react';
import DocsSidebar from '@/components/docs/DocsSidebar';
import { docsCategories, getAllDocsArticles } from '@/src/data/docs-data';

export const metadata: Metadata = {
  title: 'Kullanım Kılavuzu ve Bilgi Merkezi | Menuland',
  description:
    'Menuland mobil uygulaması kullanımı, Gel Al sipariş verme, PuanLand sadakat puanı ve restoranlar için yeni yönetmeliğe uygun dijital QR menü yönetim rehberi.',
  keywords: [
    'menuland rehber',
    'menuland kullanım kılavuzu',
    'gel al nasıl kullanılır',
    'puanland nedir',
    'restoran qr menü yönetimi',
    'fiyat etiketi yönetmeliği',
    'dijital menü nasıl açılır',
  ],
  alternates: {
    canonical: 'https://menuland.net/docs',
  },
  openGraph: {
    title: 'Menuland Kullanım Kılavuzu ve Bilgi Merkezi',
    description:
      'Hem müşteriler hem de restoranlar için adım adım rehberler, Gel Al sipariş süreçleri ve QR menü yönetimi.',
    url: 'https://menuland.net/docs',
    siteName: 'Menuland',
    locale: 'tr_TR',
    type: 'website',
  },
};

const categoryIcons: Record<string, any> = {
  Smartphone,
  UtensilsCrossed,
  HelpCircle,
};

export default function DocsHubPage() {
  const allArticles = getAllDocsArticles();

  // JSON-LD Schema (WebSite / CollectionPage / FAQPage)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Menuland Kullanım Kılavuzu ve Bilgi Merkezi',
    description:
      'Menuland mobil uygulama özellikleri, Gel Al siparişleri ve restoran QR menü mevzuat rehberleri.',
    url: 'https://menuland.net/docs',
    publisher: {
      '@type': 'Organization',
      name: 'Menuland',
      url: 'https://menuland.net',
      logo: 'https://menuland.net/images/menuland-600x200.png',
    },
    hasPart: allArticles.map((art) => ({
      '@type': 'TechArticle',
      name: art.title,
      headline: art.title,
      description: art.summary,
      url: `https://menuland.net/docs/${art.categorySlug}/${art.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex min-h-[calc(100vh-4rem)] bg-white">
        {/* Sol Sabit Sidebar */}
        <DocsSidebar />

        {/* Ana İçerik Alanı */}
        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12 max-w-5xl">
          {/* Hero Karşılama */}
          <div className="mb-12 border-b border-zinc-100 pb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/60 px-3 py-1 text-xs font-semibold text-[#FF4D00] mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Resmi Bilgi ve Dokümantasyon Portalı</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              Menuland Kullanım Kılavuzu &amp; Bilgi Merkezi
            </h1>
            <p className="mt-3 text-base sm:text-lg text-zinc-600 max-w-2xl font-normal leading-relaxed">
              İster sıra beklemeden lezzet siparişi veren bir müşteri, ister menüsünü dijitale taşıyan bir restoran sahibi olun; aradığınız tüm cevaplar ve adım adım rehberler burada.
            </p>
          </div>

          {/* İki Ana Kategori Kartı (Müşteri vs İşletme) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {/* 1. Müşteri Rehberi */}
            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/50 p-6 shadow-2xs hover:border-[#FF4D00]/50 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-[#FF4D00] mb-4">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 group-hover:text-[#FF4D00] transition-colors">
                  Müşteri &amp; Mobil Uygulama Rehberi
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Menuland iOS ve Android uygulamasıyla Gel Al siparişi verme, PuanLand sadakat puanı kazanma, masada QR menü inceleme ve lezzet çarkı adımları.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100">
                <ul className="space-y-2 mb-4">
                  <li className="text-xs text-zinc-700 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#FF4D00]" />
                    <span>Gel Al ile sıra beklemeden teslimat</span>
                  </li>
                  <li className="text-xs text-zinc-700 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#FF4D00]" />
                    <span>PuanLand ile indirim kuponları</span>
                  </li>
                  <li className="text-xs text-zinc-700 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#FF4D00]" />
                    <span>Masada kalori ve alerjen filtreli menü</span>
                  </li>
                </ul>
                <Link
                  href="/docs/musteri-rehberi/gel-al-nasil-calisir"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF4D00] hover:text-[#e04400]"
                >
                  <span>Rehberi İncele</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* 2. İşletme Rehberi */}
            <div className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/50 p-6 shadow-2xs hover:border-[#FF4D00]/50 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white mb-4">
                  <UtensilsCrossed className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 group-hover:text-[#FF4D00] transition-colors">
                  Restoran &amp; İşletme Yönetim Rehberi
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Restoran kaydı, Ticaret Bakanlığı yeni menü yönetmeliğine (gramaj, kalori, alerjen) tam uyum, Gel Al sipariş karşılama ve karekod yönetimi.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100">
                <ul className="space-y-2 mb-4">
                  <li className="text-xs text-zinc-700 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-900" />
                    <span>Yeni mevzuat uyumlu QR menü kurulumu</span>
                  </li>
                  <li className="text-xs text-zinc-700 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-900" />
                    <span>Canlı mutfak ve Gel Al karşılama paneli</span>
                  </li>
                  <li className="text-xs text-zinc-700 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-zinc-900" />
                    <span>Masalara özel karekod üretme ve indirme</span>
                  </li>
                </ul>
                <Link
                  href="/docs/isletme-rehberi/isletme-basvurusu-ve-kurulum"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 hover:text-[#FF4D00]"
                >
                  <span>Rehberi İncele</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Tüm Rehber Makaleleri Grid */}
          <div className="space-y-10 mb-14">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#FF4D00]" />
              <span>Tüm Dokümantasyon Konuları</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/docs/${article.categorySlug}/${article.slug}`}
                  className="group rounded-xl border border-zinc-200 p-5 hover:border-[#FF4D00]/50 hover:shadow-xs transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#FF4D00]">
                        {article.category}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {article.readTime}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#FF4D00] transition-colors line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-900">
                    <span>Okumaya Başla</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* İletişim & Yardım Kartı */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                Sorunuza cevap bulamadınız mı?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 max-w-md">
                Menuland ekibi hem müşterilere hem de restoran ortaklarımıza 7/24 destek sağlamaktadır.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/iletisim"
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors shadow-2xs"
              >
                Bize Ulaşın
              </Link>
              <a
                href="mailto:destek@menuland.net"
                className="rounded-xl bg-[#FF4D00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e04400] transition-colors shadow-2xs"
              >
                E-posta Gönder
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
