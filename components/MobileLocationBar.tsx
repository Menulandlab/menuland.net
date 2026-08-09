'use client';

import { useLocation } from '../context/LocationContext';
import { MapPin } from 'lucide-react';

export default function MobileLocationBar() {
  const { location, cities, districts, selectCity, selectDistrict } = useLocation();

  return (
    <div className="md:hidden w-full bg-white border-b border-gray-100 px-4 py-2.5 sticky top-16 z-40">
      <div className="flex items-center gap-2 max-w-7xl mx-auto">
        <MapPin className="h-4 w-4 text-[#FF4D00] shrink-0" />

        {/* Şehir — native select, iOS kendi picker'ını açar */}
        <select
          value={location.cityId || ''}
          onChange={(e) => {
            const c = cities.find(c => String(c.id) === e.target.value);
            if (c) selectCity(String(c.id), c.name);
          }}
          className="flex-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 focus:border-[#FF4D00] focus:outline-none appearance-none"
          style={{ WebkitAppearance: 'none' }}
        >
          <option value="" disabled>Şehir seçin...</option>
          {cities.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* İlçe — şehir seçildikten sonra göster */}
        {location.cityId && districts.length > 0 && (
          <select
            value={location.districtId || ''}
            onChange={(e) => {
              const d = districts.find(d => String(d.id) === e.target.value);
              if (d) selectDistrict(String(d.id), d.name);
            }}
            className="flex-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 focus:border-[#FF4D00] focus:outline-none appearance-none"
            style={{ WebkitAppearance: 'none' }}
          >
            <option value="" disabled>İlçe seçin...</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}

        {/* Henüz şehir yoksa kısa bilgi */}
        {!location.cityId && (
          <span className="text-xs text-zinc-400 flex-1">
            Konumunuzu seçin
          </span>
        )}
      </div>
    </div>
  );
}
