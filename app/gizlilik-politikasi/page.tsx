import Link from 'next/link';
import { ArrowLeft, FileKey } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <FileKey className="h-8 w-8 text-[#FF4D00]" /> Gizlilik Politikası
        </h1>
        <p className="text-sm text-zinc-500">Verilerinizin nasıl korunduğunu ve işlendiğini şeffaflıkla açıklıyoruz.</p>
      </div>

      <article className="prose prose-zinc max-w-none bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 flex flex-col gap-6 text-zinc-700 leading-relaxed text-sm">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">1. Veri Gizliliği Taahhüdümüz</h2>
          <p>
            MLD Yazılım ("Menuland") olarak, platformumuzu ziyaret eden tüm kullanıcıların kişisel gizlilik haklarına azami saygı gösteriyor ve bu hakları hukuki güvence altına alıyoruz. Web sitemizi ziyaretiniz sırasında veya mobil uygulamamızı kullanımınızda paylaştığınız tüm kişisel veriler, en yüksek uluslararası güvenlik standartlarına sahip sunucularda depolanmakta ve yetkisiz erişimlere karşı şifrelenmektedir.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">2. Hangi Verileri Topluyoruz ve Neden?</h2>
          <p>
            Deneyiminizi özelleştirmek amacıyla aşağıdaki sınırlı verileri topluyoruz:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Konum Bilgisi:</strong> Size en yakın restoranları, popüler mekanları ve kültürel etkinlikleri gösterebilmemiz için konum seçiminize (şehir/ilçe) izin vermeniz halinde lokasyon verileriniz işlenir.</li>
            <li><strong>Çerezler (Cookies):</strong> Dil seçiminiz, konum tercihiniz ve tarayıcı oturumlarınızın stabil çalışması için temel çerezler kullanılır.</li>
            <li><strong>Kullanım Analitiği:</strong> Platform performansını iyileştirmek adına anonimleştirilmiş cihaz bilgileri ve sayfa ziyaret istatistikleri toplanır.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">3. Üçüncü Şahıslarla Paylaşım Yasağı</h2>
          <p className="font-bold text-zinc-900 border-l-4 border-emerald-500 pl-4 py-1 bg-emerald-50/50 rounded-r-xl">
            MLD Yazılım, kullanıcılarının kişisel bilgilerini, e-posta adreslerini, konum verilerini veya kullanım alışkanlıklarını hiçbir koşul altında reklam verenler, veri simsarları veya üçüncü şahıslarla satmaz, kiralamaz veya ticari amaçla paylaşmaz. Verileriniz yalnızca yasal mercilerin resmi kararları doğrultusunda ilgili mevzuat sınırları dahilinde paylaşılabilir.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">4. Veri Güvenliği ve Altyapı</h2>
          <p>
            Sistemlerimiz, veri sızıntılarını ve yetkisiz müdahaleleri önlemek amacıyla güvenlik duvarları (firewalls), SSL/TLS şifreleme protokolleri ve düzenli güvenlik denetimleri ile korunmaktadır. Ziyaretçi güvenliği bizim için en üst düzey yasal önceliktir.
          </p>
        </section>
      </article>
    </div>
  );
}
