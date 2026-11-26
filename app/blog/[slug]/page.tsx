import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogPostBySlug, getBlogPosts, formatBlogContent } from '@/src/api/blogService';
import { ArrowLeft, Calendar, Clock, User, Share2, Tag, BookOpen } from 'lucide-react';
import ReklamAlani from '@/components/ReklamAlani';
import BlogCtaCard from '@/components/BlogCtaCard';
import { SITE_URL, jsonLd } from '@/lib/site';

// Yazılar derlemede hazırlanır ve bir saat önbellekten sunulur; derlemeden sonra eklenen yazı ilk istendiğinde
// hazırlanır.
export const dynamicParams = true;
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Google'da çok gösterilip az tıklanan yazıların arama başlığı ve açıklaması (24.11.2026, Search Console:
 * plajlar yazısı 6. sırada 764 gösterim, 1 tıklama). Sayfadaki başlık değişmez; yalnızca Google'da ve
 * paylaşım kartında görünen metin kısalır ve aranan sözle başlar. Metinler yazının içeriğinden alındı.
 */
const ARAMA_METNI: Record<string, { baslik: string; aciklama?: string }> = {
  'orduda-deniz-keyfi-bedava-ilce-ilce-ucretsiz-en-guzel-sahiller-ve-plajlar': {
    baslik: 'Ordu Plajları: İlçe İlçe Ücretsiz Halk Plajları ve Sahiller',
    aciklama:
      "Ordu'da ücretsiz denize girilecek halk plajları ilçe ilçe: Kumbaşı, Mavi Dünya, Çaka ve diğerleri. Giriş ücreti ve yüzerken dikkat edilecekler.",
  },
  'ordu-yason-burnu-gezi-rehberi': {
    baslik: 'Yason Burnu Nerede? Efsanesi, Kilisesi ve Gezi Rehberi',
  },
};

/** Yazının anlattığı yerlerin şehir sayfaları; yazının altında bağlantı olarak durur. */
const ILGILI_SAYFALAR: Record<string, Array<{ ad: string; yol: string }>> = {
  'orduda-deniz-keyfi-bedava-ilce-ilce-ucretsiz-en-guzel-sahiller-ve-plajlar': [
    { ad: 'Altınordu Mekanları', yol: '/ordu/altinordu' },
    { ad: 'Gülyalı Mekanları', yol: '/ordu/gulyali' },
    { ad: 'Perşembe Mekanları', yol: '/ordu/persembe' },
    { ad: 'Fatsa Mekanları', yol: '/ordu/fatsa' },
    { ad: 'Ünye Mekanları', yol: '/ordu/unye' },
    { ad: "Ordu'da Gezilecek Yerler", yol: '/ordu/gezilecek-yerler' },
  ],
  'ordu-yason-burnu-gezi-rehberi': [
    { ad: 'Perşembe Mekanları', yol: '/ordu/persembe' },
    { ad: "Ordu'da Gezilecek Yerler", yol: '/ordu/gezilecek-yerler' },
    { ad: 'Ordu Mekanları', yol: '/ordu' },
  ],
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Yazı Bulunamadı',
      robots: { index: false, follow: true },
    };
  }

  const arama = ARAMA_METNI[post.slug];
  const baslik = arama?.baslik || post.title;
  const aciklama = arama?.aciklama || post.excerpt;
  return {
    title: baslik,
    alternates: { canonical: `/blog/${post.slug}` },
    description: aciklama,
    openGraph: {
      title: baslik,
      description: aciklama,
      images: [post.image],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

/** Yazı gövdesinin biçimi (yazı içi reklamla ikiye bölününce iki parça da aynı sınıfı alır). */
const YAZI_SINIFI = `prose prose-zinc sm:prose-lg max-w-none text-zinc-700 leading-relaxed
  [&>p]:mb-6 [&>p]:leading-relaxed
  [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-zinc-950 [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:tracking-tight
  [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-zinc-900 [&>h3]:mt-6 [&>h3]:mb-3
  [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:space-y-2
  [&>ul>li]:text-zinc-700
  [&>strong]:text-zinc-950 [&>strong]:font-bold`;

/**
 * Yazıyı ortadaki ara başlıktan (h2) önce ikiye böler; yazı içi reklam araya girer (26.11.2026). Yazıların bütün
 * ara başlıkları en üst düzeyde olduğu için bölünen parçalar geçerli HTML kalır. Üçten az ara başlık ya da 300'den
 * az kelime varsa bölmez; kısa yazıda yalnızca yazı sonundaki reklam kalır.
 */
function ortadanBol(html: string): [string, string] | null {
  const basliklar = [...html.matchAll(/<h2[\s>]/gi)].map((m) => m.index ?? 0).filter((i) => i > 0);
  if (basliklar.length < 3) return null;
  const kelime = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  if (kelime < 300) return null;
  const kesme = basliklar[Math.floor(basliklar.length / 2)];
  return [html.slice(0, kesme), html.slice(kesme)];
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const { post, related: relatedPosts } = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const yaziGovdesi = formatBlogContent(post.content);
  const yaziParcalari = ortadanBol(yaziGovdesi);
  const yaziUrl = `${SITE_URL}/blog/${post.slug}`;
  const yaziJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: ARAMA_METNI[post.slug]?.baslik || post.title,
    description: post.excerpt || undefined,
    image: post.image ? [post.image] : undefined,
    datePublished: post.date || undefined,
    author: { '@type': 'Organization', name: post.author || 'Menuland Ekibi', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Menuland',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/menuland-600x200.png` },
    },
    mainEntityOfPage: yaziUrl,
    inLanguage: 'tr-TR',
  };

  return (
    <div className="flex flex-col gap-10 py-6 max-w-4xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(yaziJsonLd) }} />
      {/* Navigasyon */}
      <div className="flex items-center justify-between">
        <Link
          href="/blog"
          className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1.5 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Tüm Rehber Yazılarına Dön
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
          {post.category}
        </span>
      </div>

      {/* Makale Başlık & Meta */}
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-500 pt-2 border-b border-gray-100 pb-6">
          <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
            <User className="h-4 w-4 text-[#FF4D00]" />
            {post.author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <time dateTime={new Date(post.date).toISOString()}>
              {new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-zinc-400" />
            {post.readTime} okuma süresi
          </span>
        </div>
      </header>

      {/* Kapak Görseli */}
      <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden bg-zinc-100 shadow-md">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Makale Gövdesi: yeterince uzun yazıda ortadaki ara başlıktan önce bir reklam (26.11.2026) */}
      <article className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xs">
        {yaziParcalari ? (
          <>
            <div className={YAZI_SINIFI} dangerouslySetInnerHTML={{ __html: yaziParcalari[0] }} />
            <ReklamAlani yer="blog-yazi-ici" className="my-8" />
            <div className={YAZI_SINIFI} dangerouslySetInnerHTML={{ __html: yaziParcalari[1] }} />
          </>
        ) : (
          <div className={YAZI_SINIFI} dangerouslySetInnerHTML={{ __html: yaziGovdesi }} />
        )}
      </article>

      {ILGILI_SAYFALAR[post.slug] && (
        <nav aria-label="Bu yazıyla ilgili sayfalar" className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-6">
          <h2 className="text-base font-bold text-zinc-900">Bu yazıyla ilgili sayfalar</h2>
          <ul className="flex flex-wrap gap-2">
            {ILGILI_SAYFALAR[post.slug].map((s) => (
              <li key={s.yol}>
                <Link
                  href={s.yol}
                  className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                >
                  {s.ad}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Yazı Sonu Çağrı Kartı (CTA Card - İşletmeler veya Kullanıcılar İçin) */}
      <BlogCtaCard type={post.cta_card} />

      <ReklamAlani yer="blog-yazi-sonu" />

      {/* İlgili / Önerilen Yazılar */}
      {relatedPosts.length > 0 && (
        <section className="mt-8 flex flex-col gap-6 pt-10 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#FF4D00]" /> İlginizi Çekebilecek Diğer Rehberler
            </h2>
            <Link href="/blog" className="text-xs font-bold text-[#FF4D00] hover:underline">
              Tümünü Gör
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-32 w-full bg-zinc-100 overflow-hidden">
                  <img
                    src={related.image}
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[#FF4D00] uppercase tracking-wider">
                    {related.category}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#FF4D00] transition-colors line-clamp-2 leading-snug">
                    {related.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
