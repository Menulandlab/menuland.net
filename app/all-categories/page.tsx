import { getBusinessListingCategories } from '@/src/api/businessService';
import Link from 'next/link';
import { ArrowLeft, Utensils } from 'lucide-react';
import { getCategoryUrl } from '../../lib/utils';

export default async function AllCategories() {
  const categories = await getBusinessListingCategories().catch(() => []);

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Back button */}
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Tüm Kategoriler</h1>
        <p className="text-sm text-zinc-500">Mekan türlerine göre aramayı daraltın</p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">Kategoriler yüklenemedi.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={getCategoryUrl(category)}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 hover:border-[#FF4D00]/30 hover:shadow-lg transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#FF4D00]/10 flex items-center justify-center text-2xl text-[#FF4D00] group-hover:bg-[#FF4D00] group-hover:text-white transition-all">
                <Utensils className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-zinc-850 truncate w-full">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
