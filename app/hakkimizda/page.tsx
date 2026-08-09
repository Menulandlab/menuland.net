import Link from 'next/link';
import { ArrowLeft, Shield, Info } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Info className="h-8 w-8 text-[#FF4D00]" /> Hakkımızda
        </h1>
        <p className="text-sm text-zinc-500">Menuland'in vizyonu, misyonu ve arkasındaki güç.</p>
      </div>

      <article className="prose prose-zinc max-w-none bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 flex flex-col gap-6 text-zinc-700 leading-relaxed text-sm">
        <p>
          <strong>Menuland</strong>, restoranların, kafelerin ve her türlü yeme-içme işletmesinin dijital dünyada hak ettikleri yeri almalarını sağlayan, en son teknolojilerle donatılmış yeni nesil bir dijital menü ve keşif platformudur.
        </p>

        <h2 className="text-lg font-bold text-zinc-950 mt-4 border-b border-gray-100 pb-2">Misyonumuz</h2>
        <p>
          Tüketicilere çevrelerindeki en iyi lezzet noktalarını, en güncel menü içeriklerini, fiyatları ve rezervasyon imkanlarını şeffaf bir şekilde sunmaktır. Aynı zamanda işletmelerin yüksek komisyon oranları ve karmaşık entegrasyonlar altında ezilmeden, müşterilerine doğrudan ve kesintisiz bir dijital deneyim sunmalarına öncülük ediyoruz.
        </p>

        <h2 className="text-lg font-bold text-zinc-950 mt-4 border-b border-gray-100 pb-2">Vizyonumuz</h2>
        <p>
          Teknolojinin sunduğu imkanları yeme-içme sektörüyle kusursuzca harmanlayarak, küresel ölçekte en çok tercih edilen ve güvenilen dijital menü ekosistemi haline gelmektir.
        </p>

        <h2 className="text-lg font-bold text-zinc-950 mt-4 border-b border-gray-100 pb-2">Neden Menuland?</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Güncellik:</strong> Basılı menülerin aksine, fiyat ve içerik değişiklikleri anında yansır.</li>
          <li><strong>Hız ve Kolaylık:</strong> QR kod tabanlı hızlı erişim sayesinde saniyeler içinde menüyü inceleyebilirsiniz.</li>
          <li><strong>Keşif:</strong> Sadece bir menü okuyucu değil; şehrin popüler mekânlarını ve kültürel etkinliklerini bir arada sunan yaşayan bir rehberdir.</li>
        </ul>
      </article>
    </div>
  );
}
