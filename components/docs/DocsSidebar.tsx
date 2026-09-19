'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Smartphone,
  UtensilsCrossed,
  HelpCircle,
  Search,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import { docsCategories } from '@/src/data/docs-data';

interface DocsSidebarProps {
  currentCategorySlug?: string;
  currentArticleSlug?: string;
}

const iconMap: Record<string, any> = {
  Smartphone,
  UtensilsCrossed,
  HelpCircle,
};

export default function DocsSidebar({
  currentCategorySlug,
  currentArticleSlug,
}: DocsSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'musteri-rehberi': true,
    'isletme-rehberi': true,
    'sss': true,
  });

  const toggleCategory = (slug: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  // Arama filtresi
  const filteredCategories = docsCategories
    .map((category) => {
      const matchingArticles = category.articles.filter((art) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          art.title.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          art.keywords.some((k) => k.toLowerCase().includes(q))
        );
      });

      return {
        ...category,
        articles: matchingArticles,
      };
    })
    .filter((category) => category.articles.length > 0);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Üst Başlık & Arama */}
      <div className="p-4 sm:p-5 border-b border-zinc-100">
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/docs"
            className="flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-[#FF4D00] transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF4D00]/10 text-[#FF4D00]">
              <BookOpen className="h-4 w-4" />
            </div>
            <span>Menuland Rehber</span>
          </Link>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
            v2.3
          </span>
        </div>

        {/* Canlı Arama Kutusu */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rehberde konu ara..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF4D00] focus:bg-white focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Navigasyon Listesi */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            Eşleşen rehber bulunamadı.
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || BookOpen;
            const isOpen = openCategories[cat.slug] ?? true;

            return (
              <div key={cat.slug} className="space-y-1.5">
                {/* Kategori Başlığı / Accordion Butonu */}
                <button
                  onClick={() => toggleCategory(cat.slug)}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-[#FF4D00]" />
                    <span>{cat.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </button>

                {/* Kategori Makaleleri */}
                {isOpen && (
                  <ul className="space-y-0.5 border-l-2 border-zinc-100 ml-3.5 pl-2.5">
                    {cat.articles.map((art) => {
                      const isActive =
                        currentCategorySlug === cat.slug &&
                        currentArticleSlug === art.slug;

                      return (
                        <li key={art.slug}>
                          <Link
                            href={`/docs/${cat.slug}/${art.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                              isActive
                                ? 'bg-orange-50 font-semibold text-[#FF4D00] border-l-2 border-[#FF4D00] -ml-[11px] pl-[9px]'
                                : 'text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900'
                            }`}
                          >
                            <span className="truncate">{art.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* Alt Alan / Ana Sayfaya Dön */}
      <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Menuland Ana Sayfaya Dön</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobil Üst Bar & Menü Aç Butonu */}
      <div className="lg:hidden sticky top-16 z-30 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#FF4D00]" />
          <span className="text-xs font-bold text-zinc-800">Menuland Rehber</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <Menu className="h-3.5 w-3.5" />
          <span>Konular</span>
        </button>
      </div>

      {/* Mobil Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl">
            <div className="flex items-center justify-end p-3 border-b border-zinc-100">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Masaüstü Sabit Sidebar */}
      <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] w-72 shrink-0 border-r border-zinc-200 bg-white">
        {sidebarContent}
      </aside>
    </>
  );
}
