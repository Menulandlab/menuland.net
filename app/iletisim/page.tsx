import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, ShieldAlert, MapPin, Clock, PhoneCall, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'İletişim - Bize Ulaşın | Menuland',
  description: 'Menuland kullanıcı ve işletme destek ekibi iletişim kanalları, kurumsal adres ve geri bildirim bilgileri.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Mail className="h-8 w-8 text-[#FF4D00]" /> İletişim & Destek
        </h1>
        <p className="text-sm text-zinc-500">
          Uygulama kullanımı, içerik geri bildirimleri, işletme ortaklıkları ve reklam iş birlikleri için bize ulaşın.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kullanıcı Destek */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 flex flex-col justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF4D00]/10 flex items-center justify-center text-[#FF4D00]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950">Ziyaretçi & Kullanıcı Destek</h2>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Mekan bilgileri, menü geri bildirimleri, öneriler ve mobil uygulama kullanımı ile ilgili tüm sorularınız için.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Doğrudan E-Posta</span>
            <a
              href="mailto:info@menuland.net"
              className="w-full text-center rounded-xl bg-zinc-50 hover:bg-[#FF4D00] hover:text-white py-3.5 text-xs font-bold text-zinc-800 transition-all border border-gray-150 block"
            >
              info@menuland.net
            </a>
          </div>
        </div>

        {/* İşletme Destek */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 flex flex-col justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900/10 flex items-center justify-center text-zinc-900">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950">İşletme & Kurumsal Çözümler</h2>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Restoran kayıtları, QR menü kurulumu, yönetim paneli desteği ve kurumsal paketler için.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kurumsal Destek Hattı</span>
            <a
              href="mailto:destek@menuland.net"
              className="w-full text-center rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 py-3.5 text-xs font-bold transition-all block"
            >
              destek@menuland.net
            </a>
          </div>
        </div>
      </div>

      {/* Şirket Künyesi ve Fiziksel Bilgiler */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
        <h3 className="text-base font-bold text-zinc-950 border-b border-gray-100 pb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Kurumsal Bilgiler & Çalışma Saatleri
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-600">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900">
              <MapPin className="h-4 w-4 text-[#FF4D00]" /> Genel Merkez
            </div>
            <p className="text-zinc-500 leading-relaxed">
              MLD Yazılım ve Bilişim Teknolojileri<br />
              Altınordu, Ordu / Türkiye
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900">
              <Clock className="h-4 w-4 text-[#FF4D00]" /> Destek Saatleri
            </div>
            <p className="text-zinc-500 leading-relaxed">
              Pazartesi – Cuma: 09:00 – 18:00<br />
              Cumartesi: 10:00 – 15:00<br />
              (Pazar günleri e-posta yanıtlanır)
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900">
              <PhoneCall className="h-4 w-4 text-[#FF4D00]" /> Yanıt Taahhüdü
            </div>
            <p className="text-zinc-500 leading-relaxed">
              İletişim kanallarımıza iletilen tüm mesaj ve destek talepleri azami <strong>24 saat</strong> içinde yetkili temsilcilerimiz tarafından yanıtlanmaktadır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
