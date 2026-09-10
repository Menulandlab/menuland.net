'use client';

import React, { useEffect } from 'react';

export default function ProtectionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Google AdSense ve kalite inceleme sürecinde human reviewer ve botları engellememek için
    // koruma yalnızca açıkça NEXT_PUBLIC_ENABLE_CONTENT_PROTECTION='true' olduğunda çalışır.
    const isProtectionExplicitlyEnabled = process.env.NEXT_PUBLIC_ENABLE_CONTENT_PROTECTION === 'true';
    if (!isProtectionExplicitlyEnabled) {
      return;
    }

    // Localhost veya geliştirme ortamındaysak korumayı devre dışı bırak
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname.startsWith('172.');

    if (isLocalhost) {
      return;
    }

    // CSS sınıfını aktif et
    document.body.classList.add('protected-mode');

    // 1. Sağ tıklamayı (Context Menu) engelleme
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Görsellerin sürüklenmesini engelleme
    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // 3. Klavye kısayollarını engelleme
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') e.preventDefault();
      if (e.key === 'F12') e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('protected-mode');
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <>{children}</>;
}
