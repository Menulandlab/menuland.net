import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogPostBySlug, getBlogPosts, formatBlogContent } from '@/src/api/blogService';
import { ArrowLeft, Calendar, Clock, User, Share2, Tag, BookOpen } from 'lucide-react';
import AdSenseBanner from '@/components/AdSenseBanner';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
      title: 'Yazı Bulunamadı | Menuland',
    };
  }

  return {
    title: `${post.title} | Menuland Rehber`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const { post, related: relatedPosts } = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-10 py-6 max-w-4xl mx-auto">
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
            {new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
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

      {/* Makale Gövdesi */}
      <article className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xs">
        <div
          className="prose prose-zinc sm:prose-lg max-w-none text-zinc-700 leading-relaxed 
                     [&>p]:mb-6 [&>p]:leading-relaxed
                     [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-zinc-950 [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:tracking-tight
                     [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-zinc-900 [&>h3]:mt-6 [&>h3]:mb-3
                     [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:space-y-2
                     [&>ul>li]:text-zinc-700
                     [&>strong]:text-zinc-950 [&>strong]:font-bold"
          dangerouslySetInnerHTML={{ __html: formatBlogContent(post.content) }}
        />
      </article>

      {/* Makale Sonu Sponsorlu Reklam Alanı */}
      <div className="w-full -my-2">
        <AdSenseBanner format="auto" />
      </div>

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
