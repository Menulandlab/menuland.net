import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from '@/src/data/blog-posts';
import { Clock, Calendar, ArrowRight, BookOpen, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog & Lezzet Rehberi | Menuland',
  description: 'Gastronomi dünyası, restoran trendleri, dijital menü teknolojileri ve şehir lezzet rehberleri.',
  openGraph: {
    title: 'Blog & Lezzet Rehberi | Menuland',
    description: 'Gastronomi dünyası, restoran trendleri ve şehir lezzet rehberleri.',
    type: 'website',
  },
};

export default function BlogPage() {
  return (
    <div className="flex flex-col gap-10 py-6 max-w-6xl mx-auto">
      {/* Geri Dön Linki */}
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      {/* Başlık Alanı */}
      <div className="flex flex-col gap-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 self-center sm:self-start bg-[#FF4D00]/10 text-[#FF4D00] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" />
          Menuland Rehber
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-tight">
          Lezzet & Gastronomi Dünyası
        </h1>
        <p className="text-base text-zinc-500 max-w-2xl">
          Şehirlerin en popüler gezi noktaları, restoran teknolojileri, dijital menü trendleri ve gastronomi rehberleri.
        </p>
      </div>

      {/* Makale Listesi Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:border-[#FF4D00]/20"
          >
            {/* Görsel */}
            <Link href={`/blog/${post.slug}`} className="relative h-52 w-full bg-zinc-100 overflow-hidden block">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-zinc-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {post.category}
              </span>
            </Link>

            {/* İçerik Gövdesi */}
            <div className="p-6 flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2.5">
                {/* Meta Bilgiler */}
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>

                {/* Başlık */}
                <h2 className="text-lg font-bold text-zinc-900 group-hover:text-[#FF4D00] transition-colors line-clamp-2 leading-snug">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                {/* Özet Metin */}
                <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              {/* Devamını Oku Linki */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  {post.author}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs font-bold text-[#FF4D00] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  Yazıyı Oku <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
