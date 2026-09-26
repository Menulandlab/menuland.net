import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center min-h-[40vh] text-center" aria-live="polite">
      <div className="relative flex items-center justify-center mb-4">
        <div className="h-9 w-9 rounded-full border-3 border-[#FF4D00]/20 border-t-[#FF4D00] animate-spin" />
        <span className="absolute text-[9px] font-black text-[#FF4D00] uppercase tracking-wider">
          ML
        </span>
      </div>
      <p className="text-xs font-semibold text-zinc-500">İçerik yükleniyor...</p>
    </div>
  );
}
