'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AdSenseBannerProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'fluid';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

export default function AdSenseBanner({
  slotId = '5806276232',
  format = 'auto',
  responsive = true,
  className = '',
  style = {},
  label = 'Sponsorlu Reklam',
}: AdSenseBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  const [isAdFilled, setIsAdFilled] = useState(false);

  useEffect(() => {
    // React StrictMode çift çağrıyı engelle
    if (!pushedRef.current) {
      try {
        if (typeof window !== 'undefined') {
          const adsbygoogle = (window as any).adsbygoogle || [];
          adsbygoogle.push({});
          pushedRef.current = true;
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('AdSense load error:', e);
        }
      }
    }

    // Reklamın dolup dolmadığını (Google tarafından içerik yerleştirildiğini) gözlemle
    const currentAd = adRef.current;
    if (!currentAd) return;

    const observer = new MutationObserver(() => {
      const status = currentAd.getAttribute('data-ad-status');
      // Google reklamı doldurduysa veya içine iframe/içerik geldiyse
      if (status === 'filled' || currentAd.innerHTML.includes('<iframe')) {
        setIsAdFilled(true);
      } else if (status === 'unfilled') {
        setIsAdFilled(false);
      }
    });

    observer.observe(currentAd, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
      childList: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isAdFilled
          ? `my-6 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-zinc-50/60 p-3 shadow-xs ${className}`
          : 'hidden'
      }`}
    >
      {isAdFilled && label && (
        <div className="w-full flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {label}
          </span>
        </div>
      )}
      <div className="w-full flex justify-center items-center overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            ...style,
          }}
          data-ad-client="ca-pub-3776725197972523"
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}
