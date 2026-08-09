'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface BusinessGalleryProps {
  images: string[];
  name: string;
  rating?: string;
}

export default function BusinessGallery({ images, name, rating }: BusinessGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || '/images/menuland-600x200.png');

  if (images.length === 0) {
    return (
      <div className="relative h-64 w-full md:w-80 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 flex items-center justify-center">
        <img src="/images/menuland-600x200.png" alt={name} className="h-12 object-contain opacity-50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:w-80 flex-shrink-0">
      
      {/* Active Main Image */}
      <div className="relative h-64 rounded-2xl overflow-hidden bg-zinc-100 shadow-sm border border-gray-100">
        <img
          src={activeImage}
          alt={name}
          className="h-full w-full object-cover transition-all duration-300"
        />
        {rating && (
          <div className="absolute top-4 right-4 rounded-lg bg-white/95 px-2.5 py-1 text-sm font-black text-zinc-950 flex items-center gap-1 shadow-sm">
            <Star className="h-4 w-4 fill-[#FF4D00] text-[#FF4D00]" /> {rating}
          </div>
        )}
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((imgUrl, index) => {
            const isActive = imgUrl === activeImage;
            return (
              <button
                key={index}
                onClick={() => setActiveImage(imgUrl)}
                className={`relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 border bg-zinc-50 transition-all ${
                  isActive ? 'border-[#FF4D00] ring-2 ring-[#FF4D00]/10 scale-95' : 'border-gray-200 hover:border-zinc-400'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${name} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
