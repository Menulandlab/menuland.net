'use client';

import React from 'react';
import YandexAdBanner from './YandexAdBanner';

interface AdSenseBannerProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'fluid';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  containerId?: string;
}

/**
 * AdSenseBanner -> YandexAdBanner geçiş köprüsü (Geriye Dönük Uyumluluk)
 * Google AdSense yerine Yandex Partner / Yandex.RTB reklamlarını render eder.
 */
export default function AdSenseBanner({
  className = '',
  style = {},
  label = 'Sponsorlu Reklam',
  containerId,
}: AdSenseBannerProps) {
  return (
    <YandexAdBanner
      className={className}
      style={style}
      label={label}
      containerId={containerId}
    />
  );
}
