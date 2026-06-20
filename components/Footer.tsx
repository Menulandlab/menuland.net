import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-zinc-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center group relative pr-8 self-start">
              <Image
                src="/images/menuland-600x200.png"
                alt="Menuland Logo"
                width={120}
                height={40}
                className="object-contain"
              />
              <span className="absolute top-1 right-0 text-[8px] font-black tracking-widest text-[#FF4D00]/85 select-none">
                BETA
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Çevrenizdeki restoranların en güncel menülerini, fiyatlarını ve rezervasyon fırsatlarını keşfedin.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Kurumsal</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-650">
              <li><Link href="/hakkimizda" className="hover:text-[#FF4D00] transition-colors">Hakkımızda</Link></li>
              <li><Link href="/kullanim-kosullari" className="hover:text-[#FF4D00] transition-colors">Kullanım Koşulları</Link></li>
              <li><Link href="/gizlilik-politikasi" className="hover:text-[#FF4D00] transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/kvkk" className="hover:text-[#FF4D00] transition-colors">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/iletisim" className="hover:text-[#FF4D00] transition-colors">İletişim</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">İletişim</h3>
            <ul className="mt-4 space-y-3 text-xs text-zinc-650">
              <li className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Kullanıcı Destek</span>
                <a href="mailto:info@menuland.net" className="hover:text-[#FF4D00] font-semibold transition-colors text-sm text-zinc-800">
                  info@menuland.net
                </a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">İşletme Destek</span>
                <a href="mailto:destek@menuland.net" className="hover:text-[#FF4D00] font-semibold transition-colors text-sm text-zinc-800">
                  destek@menuland.net
                </a>
              </li>
            </ul>
          </div>

          {/* Download App Badges */}
          <div id="download-app-footer">
            <h3 className="text-sm font-semibold text-zinc-900">Mobil Uygulamamız</h3>
            <p className="mt-2 text-xs text-zinc-550 leading-relaxed">
              Puan kazanmak ve rezervasyon yapmak için mobil uygulamamızı kullanabilirsiniz.
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              <a
                href="https://apps.apple.com/tr/app/menuland/id6618147785?l=tr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform hover:scale-102 active:scale-98"
              >
                <Image
                  src="/images/app-store-badge.svg"
                  alt="Download on the App Store"
                  width={135}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.mycompany.menuland"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform hover:scale-102 active:scale-98"
              >
                <Image
                  src="/images/google-play-badge.svg"
                  alt="Get it on Google Play"
                  width={135}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </a>
            </div>
          </div>

        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Menuland. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
