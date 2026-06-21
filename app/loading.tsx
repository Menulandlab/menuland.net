'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-white border border-gray-100 shadow-xl max-w-xs w-full text-center">
        {/* Animated Brand Spinner */}
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-[#FF4D00] animate-spin" />
          <span className="absolute text-[9px] font-black text-[#FF4D00] uppercase tracking-wider animate-pulse">
            ML
          </span>
        </div>
        
        <div>
          <h3 className="text-sm font-black text-zinc-900 tracking-tight">Menuland Yükleniyor</h3>
          <p className="text-[10px] text-zinc-500 font-medium mt-1">
            En güncel lezzetler hazırlanıyor...
          </p>
        </div>
      </div>
    </div>
  );
}
