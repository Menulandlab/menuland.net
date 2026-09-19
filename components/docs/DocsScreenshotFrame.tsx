'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Smartphone, Monitor, ZoomIn, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { DocScreenshot } from '@/src/data/docs-data';
import DocsQrMenuPreview from './DocsQrMenuPreview';

interface DocsScreenshotFrameProps {
  screenshot: DocScreenshot;
}

export default function DocsScreenshotFrame({ screenshot }: DocsScreenshotFrameProps) {
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isQrMockup = screenshot.filename === 'mobil-qr-menu-okutma.png';
  const imageSrc = `/screenshots/docs/${screenshot.filename}`;
  const isMobile = screenshot.deviceType === 'mobile';

  return (
    <>
      <div className="my-8 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 sm:p-6 transition-all">
        <div className="mx-auto flex flex-col items-center">
          
          {/* Cihaz Çerçevesi */}
          {isMobile ? (
            // Mobil Cihaz Çerçevesi (iPhone / Modern Smartphone Mockup)
            <div className="relative w-full max-w-[280px] sm:max-w-[300px] rounded-[36px] border-[6px] border-zinc-800 bg-zinc-900 p-2 shadow-xl ring-1 ring-zinc-900/10">
              {/* Üst Hoparlör & Kamera Çentiği */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 h-4 w-20 rounded-full bg-zinc-950 z-20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-zinc-800 mr-2" />
                <div className="h-1.5 w-6 rounded-full bg-zinc-800" />
              </div>

              {/* Ekran Alanı */}
              <div className="relative aspect-[9/18.5] w-full overflow-hidden rounded-[26px] bg-white">
                {isQrMockup ? (
                  <div className="relative h-full w-full">
                    <DocsQrMenuPreview />
                    <button
                      type="button"
                      onClick={() => setIsOpen(true)}
                      className="absolute bottom-2.5 right-2.5 z-20 rounded-full bg-zinc-900/70 p-1.5 text-white hover:bg-zinc-900 transition-colors shadow-xs"
                      title="Büyüt / Detaylı İncele"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : !hasError ? (
                  <div className="group relative h-full w-full cursor-zoom-in" onClick={() => setIsOpen(true)}>
                    <Image
                      src={imageSrc}
                      alt={screenshot.caption}
                      fill
                      sizes="(max-width: 768px) 280px, 320px"
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      onError={() => setHasError(true)}
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center">
                      <div className="rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <ZoomIn className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                ) : (

                  // Placeholder (Görsel henüz yüklenmemişken gösterilen şık durum)
                  <div className="flex h-full w-full flex-col items-center justify-between p-5 text-center bg-gradient-to-b from-zinc-50 to-orange-50/30">
                    <div className="pt-8">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF4D00]/10 text-[#FF4D00]">
                        <Smartphone className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-900">
                        {screenshot.placeholderTitle}
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                        {screenshot.placeholderDesc}
                      </p>
                    </div>

                    <div className="w-full rounded-xl border border-dashed border-orange-200 bg-white/80 p-3 text-left">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FF4D00]">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Görsel Yuvası:
                      </div>
                      <code className="mt-1 block truncate rounded bg-zinc-100 px-1.5 py-1 text-[10px] font-mono text-zinc-700">
                        {screenshot.filename}
                      </code>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        Dosyayı <span className="font-mono">/public/screenshots/docs/</span> klasörüne atabilirsiniz.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Alt Home Çubuğu */}
              <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-zinc-700" />
            </div>
          ) : (
            // Masaüstü / Panel Tarayıcı Çerçevesi (Browser Frame)
            <div className="w-full max-w-2xl rounded-xl border border-zinc-300/80 bg-white shadow-lg overflow-hidden">
              {/* Tarayıcı Başlığı ve Kontrol Noktaları */}
              <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100/90 px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2 rounded-md bg-white border border-zinc-200 px-3 py-0.5 text-[11px] font-mono text-zinc-500">
                  <span>isletme.menuland.net</span>
                </div>

                <div className="w-10" />
              </div>

              {/* Ekran Alanı */}
              <div className="relative aspect-[16/9] w-full bg-zinc-50">
                {!hasError ? (
                  <div className="group relative h-full w-full cursor-zoom-in" onClick={() => setIsOpen(true)}>
                    <Image
                      src={imageSrc}
                      alt={screenshot.caption}
                      fill
                      sizes="(max-width: 1024px) 100vw, 768px"
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-102"
                      onError={() => setHasError(true)}
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center">
                      <div className="rounded-full bg-black/60 p-2.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <ZoomIn className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Placeholder
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-zinc-50 to-orange-50/20">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF4D00]/10 text-[#FF4D00]">
                      <Monitor className="h-7 w-7" />
                    </div>
                    <h4 className="text-base font-semibold text-zinc-900">
                      {screenshot.placeholderTitle}
                    </h4>
                    <p className="mt-1.5 max-w-md text-xs sm:text-sm text-zinc-500">
                      {screenshot.placeholderDesc}
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-orange-200 bg-white/90 px-3 py-2 text-left">
                      <span className="text-[11px] font-semibold text-[#FF4D00]">Görsel Yuvası:</span>
                      <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-mono text-zinc-800">
                        {screenshot.filename}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Açıklama Alt Yazısı */}
          <div className="mt-3 flex flex-col items-center gap-1.5 text-center">
            <p className="text-xs text-zinc-500 font-medium">
              {screenshot.caption}
            </p>
            {isQrMockup && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 text-[10px] font-semibold text-[#FF4D00]">
                <Sparkles className="h-3 w-3" />
                İnteraktif Görünüm: Filtrelere ve detay butonlarına tıklayabilirsiniz.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Büyütülmüş Modal */}
      {isOpen && (isQrMockup || !hasError) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-[92vh] max-w-[95vw] overflow-hidden rounded-2xl bg-zinc-950 p-3 sm:p-5 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-30 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {isQrMockup ? (
              <div className="relative w-[320px] sm:w-[350px] aspect-[9/18.5] rounded-[32px] border-[6px] border-zinc-800 bg-white overflow-hidden shadow-2xl">
                <DocsQrMenuPreview />
              </div>
            ) : (
              <img
                src={imageSrc}
                alt={screenshot.caption}
                className="max-h-[85vh] w-auto object-contain rounded-lg"
              />
            )}

            <div className="mt-3 text-center text-xs text-zinc-300">
              {screenshot.caption}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

