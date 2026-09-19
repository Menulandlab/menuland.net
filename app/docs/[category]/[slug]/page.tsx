import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DocsSidebar from '@/components/docs/DocsSidebar';
import DocsArticle from '@/components/docs/DocsArticle';
import {
  getDocArticle,
  getAllDocsArticles,
} from '@/src/data/docs-data';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// 1. Statik Sayfa Parametreleri (SSG - Static Site Generation)
export async function generateStaticParams() {
  const articles = getAllDocsArticles();
  return articles.map((article) => ({
    category: article.categorySlug,
    slug: article.slug,
  }));
}

// 2. Dinamik SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const article = getDocArticle(category, slug);

  if (!article) {
    return {
      title: 'Kılavuz Bulunamadı | Menuland',
    };
  }

  const pageUrl = `https://menuland.net/docs/${article.categorySlug}/${article.slug}`;

  return {
    title: `${article.title} | Menuland Kılavuz`,
    description: article.summary,
    keywords: article.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${article.title} - Menuland Kullanım Kılavuzu`,
      description: article.summary,
      url: pageUrl,
      siteName: 'Menuland',
      locale: 'tr_TR',
      type: 'article',
      publishedTime: '2026-09-01T00:00:00.000Z',
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
    },
  };
}

// 3. Sayfa Bileşeni
export default async function DocDetailPage({ params }: PageProps) {
  const { category, slug } = await params;
  const article = getDocArticle(category, slug);

  if (!article) {
    notFound();
  }

  const pageUrl = `https://menuland.net/docs/${article.categorySlug}/${article.slug}`;

  // JSON-LD Schemas: TechArticle + FAQPage
  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: article.title,
      description: article.summary,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      datePublished: '2026-09-01T00:00:00.000Z',
      dateModified: new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Menuland Ekibi',
        url: 'https://menuland.net',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Menuland',
        url: 'https://menuland.net',
        logo: {
          '@type': 'ImageObject',
          url: 'https://menuland.net/images/menuland-600x200.png',
        },
      },
      keywords: article.keywords.join(', '),
    },
  ];

  // Soru-Cevap varsa FAQPage şeması ekle
  if (article.faq && article.faq.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  // Adımlar varsa HowTo şeması ekle
  const stepSection = article.sections.find((s) => s.steps && s.steps.length > 0);
  if (stepSection && stepSection.steps) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: article.title,
      description: article.summary,
      step: stepSection.steps.map((st) => ({
        '@type': 'HowToStep',
        position: st.number,
        name: st.title,
        text: st.description,
      })),
    });
  }

  return (
    <>
      {/* Yapay Zeka & Google SEO İçin Yapısal Veri */}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="flex min-h-[calc(100vh-4rem)] bg-white">
        {/* Sol Sidebar */}
        <DocsSidebar
          currentCategorySlug={article.categorySlug}
          currentArticleSlug={article.slug}
        />

        {/* Makale İçeriği */}
        <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">
          <DocsArticle article={article} />
        </main>
      </div>
    </>
  );
}
