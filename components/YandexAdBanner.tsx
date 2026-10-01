'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    yaContextCb?: Array<() => void>;
    Ya?: any;
  }
}

interface YandexAdBannerProps {
  blockId?: string;
  containerId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'fluid';
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

export default function YandexAdBanner({
  blockId = 'R-A-20154632-1',
  containerId,
  className = '',
  style = {},
  label = 'Sponsorlu Reklam',
}: YandexAdBannerProps) {
  const targetId = containerId || `yandex_rtb_${blockId}`;

  useEffect(() => {
    // Next.js SPA içi dinamik sayfa geçişlerinde konteyner boşsa reklamı render et
    try {
      window.yaContextCb = window.yaContextCb || [];
      window.yaContextCb.push(() => {
        const el = document.getElementById(targetId);
        if (el && el.children.length === 0) {
          if (window.Ya?.Context?.AdvManager) {
            window.Ya.Context.AdvManager.render({
              blockId: blockId,
              renderTo: targetId,
            });
          }
        }
      });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Yandex Ads load error:', err);
      }
    }
  }, [blockId, targetId]);

  return (
    <div
      className={`w-full my-6 flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-zinc-50/50 p-3 shadow-xs ${className}`}
    >
      {label && (
        <div className="w-full flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {label}
          </span>
        </div>
      )}
      <div className="w-full block min-h-[90px] overflow-hidden text-center">
        {/* Yandex.RTB {blockId} */}
        <div
          id={targetId}
          className="w-full block min-h-[90px]"
          style={{
            minHeight: '90px',
            width: '100%',
            textAlign: 'center',
            ...style,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.yaContextCb=window.yaContextCb||[];window.yaContextCb.push(function(){if(window.Ya&&window.Ya.Context&&window.Ya.Context.AdvManager){window.Ya.Context.AdvManager.render({"blockId":"${blockId}","renderTo":"${targetId}"});}});`,
          }}
        />
      </div>
    </div>
  );
}
