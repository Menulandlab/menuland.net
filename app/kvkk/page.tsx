import Link from 'next/link';
import { ArrowLeft, Landmark } from 'lucide-react';

export default function KvkkPage() {
  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Landmark className="h-8 w-8 text-[#FF4D00]" /> KVKK Aydınlatma Metni
        </h1>
        <p className="text-sm text-zinc-500">6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki haklarınız ve bilgilendirmeler.</p>
      </div>

      <article className="prose prose-zinc max-w-none bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 flex flex-col gap-6 text-zinc-700 leading-relaxed text-sm">
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Menuland platformu bünyesindeki kişisel verileriniz, veri sorumlusu sıfatıyla MLD Yazılım tarafından aşağıda açıklanan kapsamda işlenecektir.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">2. Kişisel Verilerin İşlenme Amacı ve Hukuki Sebepleri</h2>
          <p>
            Toplanan kişisel verileriniz (seçilen şehir/ilçe konumu, cihaz IP adresi ve kullanım analiz verileri);
          </p>
          <ul className="list-style-decimal pl-5 space-y-1.5 list-decimal">
            <li>Platformumuzda konumunuza en uygun restoran menülerini ve yakın çevredeki kültürel etkinlikleri size listeleyebilmek,</li>
            <li>Hizmet kalitemizi artırmak ve kullanıcı deneyimini optimize etmek,</li>
            <li>Bilgi güvenliği süreçlerinin yürütülmesi ve yasal mevzuattan kaynaklanan yükümlülüklerin yerine getirilmesi</li>
          </ul>
          <p>amacıyla, KVKK'nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları dahilinde hukuka uygun olarak işlenmektedir.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">3. İşlenen Kişisel Verilerin Aktarılması</h2>
          <p>
            Kişisel verileriniz, üçüncü tarafların ticari çıkarları için asla aktarılmaz. Yalnızca yasal yükümlülüklerimizin yerine getirilmesi amacıyla, yetkili kamu kurum ve kuruluşları ile yargı mercilerine talepleri doğrultusunda KVKK kanuni sınırları çerçevesinde aktarılabilecektir.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-zinc-950 border-b border-gray-100 pb-2">4. Veri Sahibi Olarak Haklarınız (Madde 11)</h2>
          <p>
            KVKK'nın 11. maddesi kapsamında, dilediğiniz zaman veri sorumlusuna başvurarak kişisel verilerinizin;
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>İşlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme,</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
            <li>Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
            <li>Kanunun 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
          </ul>
          <p>haklarına sahipsiniz. Başvurularınızı yasal iletişim kanallarımız üzerinden yazılı olarak tarafımıza iletebilirsiniz.</p>
        </section>
      </article>
    </div>
  );
}
