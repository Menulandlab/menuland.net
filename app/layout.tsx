import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProtectionProvider from "../components/ProtectionProvider";
import { LocationProvider } from "../context/LocationContext";
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.menuland.net'),
  title: {
    default: "Menuland - Dijital Menü, Keşif ve Sadakat Platformu",
    template: "%s | Menuland",
  },
  description: "En yakın restoranların güncel menülerini, fiyatlarını keşfedin, rezervasyon yapın, lezzet rehberlerini inceleyin ve PuanLand ile indirim kazanın.",
  keywords: ["dijital menü", "qr menü", "restoran menüleri", "lezzet rehberi", "istanbul kahvaltı mekanları", "menuland", "menü fiyatları"],
  openGraph: {
    title: "Menuland - Dijital Menü, Keşif ve Sadakat Platformu",
    description: "En yakın restoranların güncel menülerini, fiyatlarını keşfedin ve lezzet rehberlerini inceleyin.",
    url: "https://www.menuland.net",
    siteName: "Menuland",
    locale: "tr_TR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// iOS Safari'de doğru viewport ölçeklendirmesi için
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-white text-zinc-900">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3776725197972523"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ProtectionProvider>
          <AuthProvider>
            <LocationProvider>
              <Header />
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
              <Footer />
            </LocationProvider>
          </AuthProvider>
        </ProtectionProvider>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
