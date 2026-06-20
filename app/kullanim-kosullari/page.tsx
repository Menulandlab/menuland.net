import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Scale className="h-8 w-8 text-[#FF4D00]" /> Kullanım Koşulları
        </h1>
        <p className="text-sm text-zinc-500">Lütfen sitemizi ve uygulamamızı kullanmadan önce bu yasal koşulları dikkatlice okuyunuz.</p>
      </div>

      <article className="prose prose-zinc max-w-none bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 flex flex-col gap-6 text-zinc-700 leading-relaxed text-sm">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">1. Taraflar ve Kabul</h2>
          <p>
            Bu yasal Kullanım Koşulları sözleşmesi, Menuland platformunun ("Platform") sunduğu tüm web, mobil ve dijital menü servislerini kullanan her bir bireysel veya kurumsal ziyaretçi ("Kullanıcı") ile MLD Yazılım ("Şirket") arasında akdedilmiştir. Platformu ziyaret ederek, tarayarak, herhangi bir sayfaya erişerek veya içeriklerden faydalanarak bu koşulların tamamını gayrikabilirücu, eksiksiz ve koşulsuz olarak kabul etmiş sayılırsınız. Yasal şartları kabul etmiyorsanız, Platformu derhal terk etmeniz yasal bir zorunluluktur.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">2. Fikri ve Sınai Mülkiyet Haklarının Mutlak Koruması</h2>
          <p>
            Platformun tasarımı, yazılım kodları, veritabanı yapıları, logoları, grafik tasarımları, arayüz elementleri, metinleri, görsel içerikleri ve tescilli markaları dahil ancak bunlarla sınırlı olmamak üzere tüm unsurların fikri mülkiyet hakları münhasıran MLD Yazılım'a aittir. 
          </p>
          <p className="font-bold text-zinc-900 border-l-4 border-red-500 pl-4 py-1 bg-red-50/50 rounded-r-xl">
            Tüm içerik, kod, görsel veya metinlerin; kazıma (scraping), otomatik botlar, ekran resmi alma, kopyalama, tersine mühendislik (reverse engineering), ayrıştırma (decompiling) veya herhangi bir analog ya da dijital yöntemle kopyalanması, çoğaltılması, depolanması veya üçüncü şahıslarla paylaşılması yasa dışı olup, uluslararası telif hakları yasaları ve Türk Ceza Kanunu kapsamında en ağır hukuki ve cezai yaptırımlara tabidir. İhlal tespit edildiğinde, MLD Yazılım tarafından kanunun tanıdığı en geniş sınırlar çerçevesinde tazminat ve ceza davaları açılacaktır.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">3. Sorumluluk Sınırları ve Garanti Reddi</h2>
          <p>
            Platformda yer alan restoran menüleri, fiyatlar, içerik bilgileri, görseller ve kampanya detayları ilgili üye işletmeler tarafından sağlanmaktadır. MLD Yazılım, bu bilgilerin doğruluğu, eksiksizliği, güncelliği veya içeriğinde alerjen madde bulunup bulunmadığı hususunda doğrudan veya dolaylı hiçbir yasal sorumluluk üstlenmez. Fiyat ve içerik tutarsızlıklarından doğabilecek tüm uyuşmazlıklar doğrudan ilgili işletme ile Kullanıcı arasındadır.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">4. Hizmet Değişiklikleri</h2>
          <p>
            MLD Yazılım, önceden haber vermeksizin Platform özelliklerini değiştirme, askıya alma veya durdurma hakkını saklı tutar. Kullanım Koşulları gerektiğinde güncellenebilir ve güncel koşullar yayınlandığı andan itibaren yürürlüğe girer.
          </p>
        </section>
      </article>
    </div>
  );
}
