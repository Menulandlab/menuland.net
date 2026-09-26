import Link from 'next/link';
import { ArrowLeft, Shield, Info, Building2, Award, FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Hakkımızda - Kurumsal Bilgiler ve Vizyonumuz',
  description: 'Menuland platformunun kurumsal yapısı, yayıncılık ilkeleri, misyonu ve yeme-içme sektöründeki teknolojik vizyonu hakkında detaylı bilgiler.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Info className="h-8 w-8 text-[#FF4D00]" /> Hakkımızda
        </h1>
        <p className="text-sm text-zinc-500">
          Menuland'in kurumsal yapısı, yayıncılık ilkeleri ve gastronomi ekosistemindeki dijital vizyonu.
        </p>
      </div>

      <article className="prose prose-zinc max-w-none bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 flex flex-col gap-8 text-zinc-700 leading-relaxed text-sm shadow-sm">
        
        {/* Giriş */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-zinc-950 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#FF4D00]" /> Menuland Nedir?
          </h2>
          <p>
            <strong>Menuland</strong>, yeme-içme ve gastronomi sektörünü modernize etmek; tüketiciler ile restoran, kafe ve sosyal mekanlar arasındaki iletişimi dijitalleştirmek amacıyla geliştirilmiş yeni nesil bir <strong>dijital menü, mekan keşfi ve gastronomi içerik platformudur</strong>.
          </p>
          <p>
            Platformumuz, tüketicilerin çevrelerindeki en iyi mekanları, gerçek menü fiyatlarını, zengin gastronomi içeriklerini ve kullanıcı yorumlarını tek bir çatı altında incelemelerini sağlarken; işletmelerin de masada QR menü, gel-al sipariş yönetimi ve sadakat programlarıyla dijitalleşmesine öncülük eder.
          </p>
        </section>

        {/* Misyon & Vizyon */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
          <div className="p-6 rounded-2xl bg-zinc-50 border border-gray-100 flex flex-col gap-2">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#FF4D00]" /> Misyonumuz
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Tüketicilere şeffaf, güncel ve sansürsüz mekan ve menü verisi sunmak; basılı menülerin maliyet ve çevre yükünü ortadan kaldırarak hem işletmelere hem de ziyaretçilere hızlı, güvenilir bir dijital yemek kültürü deneyimi yaşatmaktır.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-50 border border-gray-100 flex flex-col gap-2">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#FF4D00]" /> Vizyonumuz
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Türkiye'den başlayarak küresel ölçekte gastronomi turizmini destekleyen, lezzet rotalarını ve coğrafi işaretli değerleri tanıtan en kapsamlı ve güvenilir dijital lezzet rehberi ekosistemi haline gelmektir.
            </p>
          </div>
        </section>

        {/* Editöryal & Yayın İlkeleri (E-E-A-T) */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-zinc-950 border-b border-gray-100 pb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#FF4D00]" /> Yayıncılık ve Editöryal İlkelerimiz
          </h2>
          <p>
            Menuland bünyesinde yer alan <strong>Blog & Lezzet Rehberi</strong> sayfalarındaki içeriklerimiz, Google Arama Kalite Standartları (E-E-A-T) ve gazetecilik etik kurallarına uygun olarak hazırlanmaktadır:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Özgünlük ve Araştırma:</strong> Yayınlanan tüm makale, mekan incelemesi ve şehir rehberleri editör kadromuz tarafından birincil kaynaklar, yerinde gözlemler ve resmi veriler ışığında özgün olarak üretilir. Yapay zeka tarafından doğrudan kopyalanmış veya yüzeysel içeriklere yer verilmez.</li>
            <li><strong>Şeffaflık ve Doğruluk:</strong> Menü fiyatları, adres ve çalışma saatleri gibi bilgiler düzenli olarak güncellenir. Tüketicileri yanıltıcı, doğrulanmamış veya sponsorlu olduğu gizlenen hiçbir tanıtım yayınlanmaz.</li>
            <li><strong>Kullanıcı Odaklılık:</strong> İçeriklerimizin öncelikli amacı ziyaretçilerimizin doğru kararlar vermesini, bütçelerine uygun lezzetleri keşfetmesini ve gastronomi kültürüne dair doyurucu bilgi edinmesini sağlamaktır.</li>
          </ul>
        </section>

        {/* Kurumsal Künye Bilgileri */}
        <section className="flex flex-col gap-3 bg-zinc-50 p-6 rounded-2xl border border-gray-200 not-prose">
          <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Kurumsal Künye & İletişim Bilgileri
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-650 mt-2">
            <div>
              <span className="font-bold text-zinc-900 block">Platform Sahibi & Yayıncı:</span>
              <span>MLD Yazılım ve Bilişim Teknolojileri</span>
            </div>
            <div>
              <span className="font-bold text-zinc-900 block">Tescilli Marka:</span>
              <span>Menuland®</span>
            </div>
            <div>
              <span className="font-bold text-zinc-900 block">Genel Merkez:</span>
              <span>Altınordu, Ordu / Türkiye</span>
            </div>
            <div>
              <span className="font-bold text-zinc-900 block">Resmi E-Posta:</span>
              <a href="mailto:info@menuland.net" className="text-[#FF4D00] hover:underline font-semibold">info@menuland.net</a>
            </div>
          </div>
        </section>

      </article>
    </div>
  );
}
