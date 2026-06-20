import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, ShieldAlert } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-8 py-4 max-w-4xl mx-auto">
      <div>
        <Link href="/" className="text-sm font-semibold text-[#FF4D00] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Ana Sayfaya Dön
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Mail className="h-8 w-8 text-[#FF4D00]" /> İletişim
        </h1>
        <p className="text-sm text-zinc-500">Her türlü soru, geri bildirim ve destek talepleriniz için bize ulaşın.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kullanıcı Destek */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 flex flex-col gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FF4D00]/10 flex items-center justify-center text-[#FF4D00]">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-950">Ziyaretçi & Kullanıcı Destek</h2>
            <p className="text-xs text-zinc-500 mt-1">Uygulama kullanımı, görüş ve önerileriniz için.</p>
          </div>
          <a
            href="mailto:info@menuland.net"
            className="mt-4 w-full text-center rounded-xl bg-zinc-550 hover:bg-[#FF4D00] hover:text-white py-3 text-xs font-bold text-zinc-700 bg-zinc-50 transition-all border border-gray-100 block"
          >
            info@menuland.net
          </a>
        </div>

        {/* İşletme Destek */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 flex flex-col gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/10 flex items-center justify-center text-zinc-900">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-950">İşletme & Ortaklık Destek</h2>
            <p className="text-xs text-zinc-500 mt-1">Dijital QR menü, sipariş sistemi ve işletme paneli soruları için.</p>
          </div>
          <a
            href="mailto:destek@menuland.net"
            className="mt-4 w-full text-center rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 py-3 text-xs font-bold transition-all block"
          >
            destek@menuland.net
          </a>
        </div>
      </div>
    </div>
  );
}
