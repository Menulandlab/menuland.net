import Link from 'next/link';
import { ArrowLeft, Shield, Info, Building2, Award, FileText, CheckCircle2 } from 'lucide-react';
import { whatsappBaglantisi } from '@/lib/site';

export const metadata = {
  title: 'Hakkımızda',
  alternates: { canonical: '/hakkimizda' },
  description: "Menuland'in ne olduğu, sitedeki işletme ve menü bilgilerinin nereden geldiği, yanlış bilginin nasıl bildirileceği ve platformu işleten şirketin bilgileri.",
};

const WHATSAPP_ILETISIM = whatsappBaglantisi('Merhaba, Menuland hakkında yazıyorum.', 'WEB-HAKKIMIZDA');

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
          Menuland&apos;in ne olduğu, sitedeki bilgilerin nereden geldiği ve platformu işleten şirketin bilgileri.
        </p>
      </div>

      <article className="prose prose-zinc max-w-none bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 flex flex-col gap-8 text-zinc-700 leading-relaxed text-sm shadow-sm">

        {/* Giriş */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-zinc-950 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#FF4D00]" /> Menuland Nedir?
          </h2>
          <p>
            <strong>Menuland</strong>, restoran ve kafeleri keşfetmeye, menülerine bakmaya, rezervasyon yapmaya ve gel-al siparişi vermeye yarayan bir dijital menü ve keşif platformudur. Menuland&apos;i bu web sitesinden ve iOS ile Android için çıkan Menuland uygulamasından kullanabilirsiniz.
          </p>
          <p>
            İşletmeler Menuland panelinde menülerini kendileri hazırlar ve günceller. Panelde masada QR menü, gel-al sipariş, rezervasyon, garson çağırma ve PuanLand sadakat programı gibi araçlar vardır.
          </p>
        </section>

        {/* Amaç */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
          <div className="p-6 rounded-2xl bg-zinc-50 border border-gray-100 flex flex-col gap-2">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#FF4D00]" /> Ne yapıyoruz?
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Bir işletmeye gitmeden önce menüsünü, adresini ve çalışma saatlerini tek yerde görebilmenizi sağlıyoruz. İşletmelerin de basılı menü yerine kolayca güncellenen dijital menü kullanabilmesini sağlıyoruz.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-50 border border-gray-100 flex flex-col gap-2">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#FF4D00]" /> Hedefimiz
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Türkiye&apos;nin her ilinde işletmelerin menülerine ve güncel bilgilerine güvenilir biçimde ulaşılabilen bir rehber olmak.
            </p>
          </div>
        </section>

        {/* Bilgilerin kaynağı */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-zinc-950 border-b border-gray-100 pb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#FF4D00]" /> Sitedeki Bilgiler Nereden Geliyor?
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>İşletme bilgileri:</strong> Ad, adres, telefon ve çalışma saatleri işletmenin kendisinden, işletmenin kendi web sitesinden ya da sosyal medya hesabından alınır. Zincir işletmelerin şube bilgileri markanın kendi web sitesinden alınır.</li>
            <li><strong>Menüler ve fiyatlar:</strong> Menüsü Menuland&apos;de olan işletmelerde menüyü ve fiyatları işletmenin kendisi girer ve günceller. Menüsü başka bir sitede olan işletmelerde o sayfaya bağlantı verilir; o sayfanın içeriğinden ilgili işletme sorumludur.</li>
            <li><strong>Yorumlar:</strong> Yorumları Menuland uygulamasının kullanıcıları yazar.</li>
            <li><strong>Rehber ve blog yazıları:</strong> Menuland ekibi tarafından hazırlanır.</li>
            <li><strong>Reklamlar:</strong> Sitedeki Google reklamları &quot;Reklam&quot; etiketiyle gösterilir ve yalnızca reklam çerezlerine onay veren ziyaretçilere çıkar. Ayrıntılar <Link href="/gizlilik-politikasi" className="text-[#FF4D00] font-semibold underline">Gizlilik Politikası</Link>&apos;ndadır.</li>
          </ul>
        </section>

        {/* Düzeltme */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-zinc-950 border-b border-gray-100 pb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#FF4D00]" /> Yanlış Bir Bilgi mi Gördünüz?
          </h2>
          <p>
            Her işletme sayfasının altındaki &quot;Bu sayfadaki bilgi yanlış mı?&quot; bağlantısıyla ya da <a href={WHATSAPP_ILETISIM} target="_blank" rel="noopener noreferrer" className="text-[#FF4D00] font-semibold underline">WhatsApp hattımızdan</a> bize yazabilirsiniz. İşletme sahipleri sayfalarındaki bilgilerin düzeltilmesini ya da sayfanın kaldırılmasını isteyebilir.
          </p>
        </section>

        {/* Künye */}
        <section className="flex flex-col gap-3 bg-zinc-50 p-6 rounded-2xl border border-gray-200 not-prose">
          <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Künye ve İletişim
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-650 mt-2">
            <div>
              <span className="font-bold text-zinc-900 block">Platformu işleten:</span>
              <span>MLD Yazılım</span>
            </div>
            <div>
              <span className="font-bold text-zinc-900 block">Yasal adres:</span>
              <span>Durugöl Mah. Atatürk Bulvarı No: 451/211, Altınordu / Ordu</span>
            </div>
            <div>
              <span className="font-bold text-zinc-900 block">E-posta:</span>
              <a href="mailto:info@menuland.net" className="text-[#FF4D00] hover:underline font-semibold">info@menuland.net</a>
            </div>
            <div>
              <span className="font-bold text-zinc-900 block">WhatsApp (Pazartesi–Cumartesi 09.00–18.00):</span>
              <a href={WHATSAPP_ILETISIM} target="_blank" rel="noopener noreferrer" className="text-[#FF4D00] hover:underline font-semibold">0850 840 13 02</a>
            </div>
          </div>
        </section>

      </article>
    </div>
  );
}
