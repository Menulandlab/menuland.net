'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Building2,
  Share2,
  Check
} from 'lucide-react';
import { DocArticle, getAllDocsArticles } from '@/src/data/docs-data';
import DocsScreenshotFrame from './DocsScreenshotFrame';

interface DocsArticleProps {
  article: DocArticle;
}

export default function DocsArticle({ article }: DocsArticleProps) {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const [copied, setCopied] = useState(false);

  // Önceki ve sonraki makaleleri bul
  const allArticles = getAllDocsArticles();
  const currentIndex = allArticles.findIndex(
    (a) => a.categorySlug === article.categorySlug && a.slug === article.slug
  );
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < allArticles.length - 1
      ? allArticles[currentIndex + 1]
      : null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isBusiness = article.categorySlug === 'isletme-rehberi';

  return (
    <article className="max-w-3xl pb-20">
      {/* 1. Breadcrumb (Ekmek Kırıntısı) */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 font-medium">
        <Link href="/docs" className="hover:text-[#FF4D00] transition-colors">
          Rehber
        </Link>
        <ChevronRight className="h-3 w-3 text-zinc-300" />
        <span className="text-zinc-600">{article.category}</span>
        <ChevronRight className="h-3 w-3 text-zinc-300" />
        <span className="text-zinc-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {article.title}
        </span>
      </nav>

      {/* 2. Başlık ve Üst Meta Bilgisi */}
      <header className="mb-8 border-b border-zinc-100 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#FF4D00]/10 px-2.5 py-0.5 text-xs font-semibold text-[#FF4D00]">
            {article.category}
          </span>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {article.lastUpdated}
            </span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors"
              title="Bağlantıyı Kopyala"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Kopyalandı</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Paylaş</span>
                </>
              )}
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">
          {article.title}
        </h1>
        <p className="mt-3 text-base sm:text-lg leading-relaxed text-zinc-600 font-normal">
          {article.summary}
        </p>
      </header>

      {/* 3. Öne Çıkan Özet Kutusu (Highlights) */}
      {article.highlights && article.highlights.length > 0 && (
        <div className="mb-8 rounded-xl border border-orange-100 bg-orange-50/40 p-4 sm:p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#FF4D00] mb-3">
            Önemli Noktalar
          </h2>
          <ul className="space-y-2">
            {article.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FF4D00] mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Ekran Görüntüsü / Cihaz Çerçevesi */}
      {article.screenshot && (
        <DocsScreenshotFrame screenshot={article.screenshot} />
      )}

      {/* 5. Ana Bölümler ve Adımlar */}
      <div className="space-y-10">
        {article.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 mb-3 flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#FF4D00]" />
              {section.title}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-zinc-700 whitespace-pre-line">
              {section.content}
            </p>

            {/* Adım Adım Liste (Varsa) */}
            {section.steps && section.steps.length > 0 && (
              <div className="mt-6 space-y-4">
                {section.steps.map((step) => (
                  <div
                    key={step.number}
                    className="flex items-start gap-3.5 rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF4D00] text-xs font-bold text-white shadow-xs">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* İpucu Kutusu */}
            {section.tip && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs sm:text-sm text-emerald-900">
                <Lightbulb className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold block mb-0.5 text-emerald-950">İpucu</strong>
                  {section.tip}
                </div>
              </div>
            )}

            {/* Uyarı Kutusu */}
            {section.warning && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs sm:text-sm text-amber-900">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold block mb-0.5 text-amber-950">Önemli Bilgi</strong>
                  {section.warning}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* 6. Sıkça Sorulan Sorular (FAQ) */}
      {article.faq && article.faq.length > 0 && (
        <section className="mt-12 pt-8 border-t border-zinc-200">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-[#FF4D00]" />
            <h2 className="text-xl font-bold text-zinc-900">
              Sıkça Sorulan Sorular
            </h2>
          </div>
          <div className="space-y-3">
            {article.faq.map((faqItem, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5"
              >
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 mb-2">
                  {faqItem.question}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-600">
                  {faqItem.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Geri Bildirim Kutusu (Helpful Widget) */}
      <div className="mt-12 rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-zinc-900">
            Bu rehber yardımcı oldu mu?
          </h4>
          <p className="text-xs text-zinc-500 mt-0.5">
            Geri bildiriminiz Menuland dokümantasyonunu geliştirmemize yardımcı olur.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 flex items-center justify-center gap-2">
          {feedback ? (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              ✓ Teşekkürler!
            </span>
          ) : (
            <>
              <button
                onClick={() => setFeedback('yes')}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Evet</span>
              </button>
              <button
                onClick={() => setFeedback('no')}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50/50 transition-colors"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                <span>Hayır</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 8. Önceki / Sonraki Sayfa Navigasyonu */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevArticle ? (
          <Link
            href={`/docs/${prevArticle.categorySlug}/${prevArticle.slug}`}
            className="flex flex-col rounded-xl border border-zinc-200 p-4 hover:border-[#FF4D00]/60 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 group-hover:text-[#FF4D00]">
              <ArrowLeft className="h-3 w-3" />
              <span>Önceki Konu</span>
            </div>
            <span className="mt-1 text-sm font-semibold text-zinc-800 group-hover:text-zinc-950 line-clamp-1">
              {prevArticle.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextArticle && (
          <Link
            href={`/docs/${nextArticle.categorySlug}/${nextArticle.slug}`}
            className="flex flex-col items-end text-right rounded-xl border border-zinc-200 p-4 hover:border-[#FF4D00]/60 hover:shadow-xs transition-all group sm:ml-auto w-full"
          >
            <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 group-hover:text-[#FF4D00]">
              <span>Sonraki Konu</span>
              <ArrowRight className="h-3 w-3" />
            </div>
            <span className="mt-1 text-sm font-semibold text-zinc-800 group-hover:text-zinc-950 line-clamp-1">
              {nextArticle.title}
            </span>
          </Link>
        )}
      </div>

      {/* 9. Kurumsal Eyleme Çağrı (Call To Action) */}
      <div className="mt-12 rounded-2xl bg-zinc-900 p-6 text-white sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF4D00] uppercase tracking-wider mb-1">
            {isBusiness ? (
              <>
                <Building2 className="h-4 w-4" />
                <span>Restoran İşletmecileri İçin</span>
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4" />
                <span>Lezzet Severler İçin</span>
              </>
            )}
          </div>
          <h3 className="text-lg font-bold">
            {isBusiness
              ? 'Menuland ile Menünüzü ve Siparişlerinizi Büyütün'
              : 'Menuland Mobil Uygulamasıyla Sıra Beklemeyin'}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-md leading-relaxed">
            {isBusiness
              ? 'Masa QR menüsü, yeni mevzuat uyumu ve Gel Al siparişleri için işletme başvurunuzu hemen yapın.'
              : 'iOS ve Android cihazınızda Menuland ile Gel Al siparişi verin, her siparişte PuanLand kazanın.'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 shrink-0">
          {isBusiness ? (
            <a
              href="https://isletme.menuland.net/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF4D00] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#e04400] transition-colors shadow-sm"
            >
              <span>Ücretsiz Başvur</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          ) : (
            <Link
              href="/#download"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF4D00] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#e04400] transition-colors shadow-sm"
            >
              <span>Uygulamayı İndir</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
