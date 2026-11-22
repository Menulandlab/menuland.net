import Link from 'next/link';
import { ArrowLeft, FileKey } from 'lucide-react';

export const metadata = {
  title: 'Gizlilik Politikası',
  description: 'Menuland web sitesi ve mobil uygulamasında hangi verilerin neden işlendiği, çerezler ve haklarınız.',
  alternates: { canonical: '/gizlilik-politikasi' },
};

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
            <li><strong>Kullanım Analitiği:</strong> Yalnızca çerez tercihlerinden onay vermeniz hâlinde, sitenin nasıl kullanıldığını anlamak için Google Analytics ile sayfa ziyaret istatistikleri toplanır.</li>
            <li><strong>Reklam:</strong> Yalnızca çerez tercihlerinden onay vermeniz hâlinde, Google AdSense reklamları gösterilir. Ayrıntılar 4. bölümdedir.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">3. Üçüncü Şahıslarla Paylaşım Yasağı</h2>
          <p className="font-bold text-zinc-900 border-l-4 border-emerald-500 pl-4 py-1 bg-emerald-50/50 rounded-r-xl">
            MLD Yazılım, kullanıcılarının doğrudan kişisel kimlik bilgilerini (ad, soyad, telefon vb.) hiçbir koşul altında veri simsarları veya yetkisiz üçüncü şahıslarla satmaz, kiralamaz veya ticari amaçla paylaşmaz. Verileriniz yalnızca yasal mercilerin resmi kararları doğrultusunda mevzuat sınırları dahilinde paylaşılabilir.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">4. Reklamlar (Google AdSense) ve Reklam Çerezleri</h2>
          <p>
            Web sitemizde reklam göstermek için Google&apos;ın reklam hizmeti <strong>Google AdSense</strong>&apos;i kullanıyoruz. Bu kapsamda:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Google dahil üçüncü taraf satıcılar, sitemize veya internetteki başka sitelere daha önce yaptığınız ziyaretlere dayanarak size reklam göstermek için çerez kullanır.
            </li>
            <li>
              Google&apos;ın reklam çerezlerini kullanması, Google&apos;ın ve iş ortaklarının size sitemize ve/veya internetteki başka sitelere yaptığınız ziyaretlere dayanarak reklam göstermesini sağlar.
            </li>
            <li>
              Kişiselleştirilmiş reklamları <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#FF4D00] font-semibold underline">Google Reklam Ayarları</a> sayfasından kapatabilirsiniz. Üçüncü taraf satıcıların kişiselleştirilmiş reklam için çerez kullanmasını <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-[#FF4D00] font-semibold underline">www.aboutads.info</a> adresinden de kapatabilirsiniz.
            </li>
            <li>
              Reklamlar, Google&apos;ın birlikte çalıştığı başka reklam teknolojisi sağlayıcıları aracılığıyla da gösterilebilir; bu sağlayıcılar da çerez kullanabilir. Google&apos;ın bu bilgileri nasıl kullandığı,{' '}
              <a href="https://policies.google.com/technologies/partner-sites?hl=tr" target="_blank" rel="noopener noreferrer" className="text-[#FF4D00] font-semibold underline">Google&apos;ın iş ortağı sitelerinden gelen bilgileri nasıl kullandığı</a>{' '}
              sayfasında anlatılır. Reklam çerezleriyle toplanan bilgiler Google&apos;ın yurt dışındaki sunucularında işlenebilir.
            </li>
            <li>
              Reklam çerezleri yalnızca onay vermeniz hâlinde kullanılır. Onay vermezseniz Google&apos;ın reklam betiği sayfaya yüklenmez ve sitede reklam gösterilmez. Tercihinizi sayfanın altındaki <strong>Çerez Tercihleri</strong> bağlantısından istediğiniz zaman değiştirebilirsiniz.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">5. Veri Güvenliği ve Altyapı</h2>
          <p>
            Sistemlerimiz, veri sızıntılarını ve yetkisiz müdahaleleri önlemek amacıyla güvenlik duvarları (firewalls), SSL/TLS şifreleme protokolleri ve düzenli güvenlik denetimleri ile korunmaktadır. Ziyaretçi güvenliği bizim için en üst düzey yasal önceliktir.
          </p>
        </section>
      </article>
    </div>
  );
}
