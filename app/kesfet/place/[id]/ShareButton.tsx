'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  name: string;
}

export default function ShareButton({ name }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} - Menuland`,
          text: `${name} gezilecek yer detaylarını Menuland'de inceleyin!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Paylaşım iptal edildi veya hata oluştu:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Kopyalama başarısız:', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-zinc-50 transition-all text-xs font-semibold text-zinc-700 active:scale-95 shadow-sm"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          Kopyalandı!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 text-[#FF4D00]" />
          Paylaş
        </>
      )}
    </button>
  );
}
