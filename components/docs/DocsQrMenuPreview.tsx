'use client';

import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Bell,
  Receipt,
  ShieldCheck,
  Flame,
  Scale,
  Search,
  Sparkles,
  QrCode,
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: string;
  calories: number;
  weight: string;
  description: string;
  ingredients: string;
  allergens: string[];
  isGlutenFree: boolean;
  isVegan: boolean;
  isLactoseFree: boolean;
  popular?: boolean;
}

const SAMPLE_ITEMS: MenuItem[] = [
  {
    id: 'kahvalti-tabagi',
    name: 'Kahvaltı Tabağı',
    category: 'Kahvaltı',
    price: '200.00 ₺',
    calories: 690,
    weight: '420g',
    description: 'Ezine beyaz peynir, eski kaşar, domates, salatalık, siyah/yeşil zeytin, bal-kaymak ve haşlanmış organik yumurta.',
    ingredients: 'İnek peynirleri, tereyağı, çiçek balı, kaymak, köy yumurtası, ceviz içi, simit parçaları.',
    allergens: ['Gluten', 'Süt Ürünü (Laktoz)', 'Yumurta', 'Sert Kabuklu Yemiş'],
    isGlutenFree: false,
    isVegan: false,
    isLactoseFree: false,
    popular: true,
  },
  {
    id: 'izgara-somon',
    name: 'Izgara Somon Bowl',
    category: 'Ana Yemek',
    price: '420.00 ₺',
    calories: 520,
    weight: '350g',
    description: 'Taze ızgara somon dilimi, kinoa, avokado, edamame, salatalık, taze nane ve nar ekşili zeytinyağı sosu.',
    ingredients: 'Norveç somon fileto, beyaz kinoa, taze avokado, soya fasulyesi (edamame), sızma zeytinyağı.',
    allergens: ['Balık', 'Soya'],
    isGlutenFree: true,
    isVegan: false,
    isLactoseFree: true,
    popular: true,
  },
  {
    id: 'patates-kizartmasi',
    name: 'Baharatlı Patates Kızartması',
    category: 'Atıştırmalık',
    price: '80.00 ₺',
    calories: 400,
    weight: '200g',
    description: 'Özel baharat harmanlı çıtır elma dilim patates, ev yapımı vegan trüflü dip sos eşliğinde.',
    ingredients: 'Taze patates, bitkisel kızartma yağı, kekik, tatlı toz biber, deniz tuzu.',
    allergens: [],
    isGlutenFree: true,
    isVegan: true,
    isLactoseFree: true,
  },
  {
    id: 'avokado-kinoa-salata',
    name: 'Avokado & Kinoa Salatası',
    category: 'Salata',
    price: '290.00 ₺',
    calories: 340,
    weight: '260g',
    description: 'Roka, kuzu kulağı, chia tohumu, küp avokado, nar taneleri ve limon-hardal sosu.',
    ingredients: 'Akdeniz yeşillikleri, haşlanmış kinoa, avokado, chia tohumu, dijon hardal, sızma zeytinyağı.',
    allergens: ['Hardal'],
    isGlutenFree: true,
    isVegan: true,
    isLactoseFree: true,
  },
];

type FilterType = 'all' | 'gluten_free' | 'vegan' | 'lactose_free';

export default function DocsQrMenuPreview() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>('kahvalti-tabagi');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const filteredItems = SAMPLE_ITEMS.filter((item) => {
    // Alerjen filtresi
    if (filter === 'gluten_free' && !item.isGlutenFree) return false;
    if (filter === 'vegan' && !item.isVegan) return false;
    if (filter === 'lactose_free' && !item.isLactoseFree) return false;

    // Arama
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.allergens.some((a) => a.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="relative h-full w-full flex flex-col bg-white select-none text-zinc-900 font-sans text-xs">
      
      {/* 1. Üst Durum Çubuğu (iOS Style Status Bar) */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-semibold text-zinc-800 shrink-0">
        <span>01:15</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="font-mono">5G</span>
          <div className="flex items-center gap-0.5">
            <span className="h-2 w-0.5 rounded-full bg-zinc-800" />
            <span className="h-2.5 w-0.5 rounded-full bg-zinc-800" />
            <span className="h-3 w-0.5 rounded-full bg-zinc-800" />
            <span className="h-3.5 w-0.5 rounded-full bg-zinc-800" />
          </div>
          <div className="h-2.5 w-5 rounded-[3px] border border-zinc-700 p-0.5 flex items-center">
            <div className="h-full w-4/5 rounded-[1px] bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* 2. Restoran & Masa Bilgi Başlığı */}
      <div className="bg-white border-b border-zinc-100 px-3.5 pt-2 pb-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white font-bold text-xs shadow-xs">
              M
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-[13px] text-zinc-900 leading-tight">Menuland Cafe</span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                <span>Temassız QR Menü</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">Resmi Fiyatlar</span>
              </div>
            </div>
          </div>

          {/* Masa Rozeti */}
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Masa 4
          </div>
        </div>

        {/* Bilgilendirme Notu */}
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-orange-50/80 border border-orange-200/60 px-2 py-1 text-[10px] text-[#FF4D00]">
          <QrCode className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium">QR kod okutuldu • Masanıza özel canlı menü</span>
        </div>
      </div>

      {/* 3. Arama Çubuğu */}
      <div className="px-3 pt-2 pb-1.5 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Yemek veya alerjen ara (örn: kinoa, gluten)..."
            className="w-full rounded-xl bg-zinc-100 pl-8 pr-3 py-1.5 text-[11px] text-zinc-800 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all border border-transparent focus:border-orange-200"
          />
        </div>
      </div>

      {/* 4. Canlı Alerjen & Tercih Filtreleri (İnteraktif) */}
      <div className="px-3 py-1.5 shrink-0">
        <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
          <Sparkles className="h-2.5 w-2.5 text-[#FF4D00]" />
          <span>Alerjen & Beslenme Filtresi:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
              filter === 'all'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Tümü ({SAMPLE_ITEMS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('gluten_free')}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              filter === 'gluten_free'
                ? 'bg-[#FF4D00] text-white shadow-xs'
                : 'bg-orange-50 text-orange-800 border border-orange-200/60 hover:bg-orange-100'
            }`}
          >
            🌾 Glutensiz
          </button>
          <button
            type="button"
            onClick={() => setFilter('vegan')}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              filter === 'vegan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
            }`}
          >
            🌱 Vegan
          </button>
          <button
            type="button"
            onClick={() => setFilter('lactose_free')}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              filter === 'lactose_free'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 border border-blue-200/60 hover:bg-blue-100'
            }`}
          >
            🥛 Laktozsuz
          </button>
        </div>
      </div>

      {/* 5. Menü Listesi (Kaydırılabilir İçerik Alanı) */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-zinc-400">
            <p className="text-xs font-medium">Bu filtreye uygun ürün bulunamadı.</p>
            <button
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 text-[11px] text-[#FF4D00] font-semibold underline"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-200/80 bg-white p-2.5 shadow-2xs hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-[12px] font-bold text-zinc-900 leading-snug">
                        {item.name}
                      </h4>
                      {item.popular && (
                        <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                          Popüler
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-zinc-500 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[12px] font-extrabold text-zinc-900 block">
                      {item.price}
                    </span>
                  </div>
                </div>

                {/* Kalori, Gramaj ve Rozet Satırı */}
                <div className="mt-2 flex items-center gap-2 pt-1.5 border-t border-zinc-100 flex-wrap">
                  <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-medium">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span>{item.calories} kcal</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-medium">
                    <Scale className="h-3 w-3 text-zinc-400" />
                    <span>{item.weight}</span>
                  </div>

                  {item.isGlutenFree && (
                    <span className="rounded-md bg-orange-100/70 px-1.5 py-0.5 text-[9px] font-semibold text-orange-800">
                      Glutensiz
                    </span>
                  )}
                  {item.isVegan && (
                    <span className="rounded-md bg-emerald-100/70 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800">
                      Vegan
                    </span>
                  )}

                  {/* Detay Aç / Kapa Butonu */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="ml-auto flex items-center gap-0.5 text-[10px] font-semibold text-[#FF4D00] hover:text-orange-700 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Kapat' : 'Alerjen Detayı'}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {/* Genişletilmiş Mevzuat ve Alerjen Bilgisi */}
                {isExpanded && (
                  <div className="mt-2 rounded-lg bg-zinc-50 p-2 border border-zinc-200/70 space-y-1.5 text-[10px] animate-fadeIn">
                    <div>
                      <span className="font-semibold text-zinc-700 block">İçindekiler:</span>
                      <p className="text-zinc-500 leading-relaxed">{item.ingredients}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-zinc-700 block">
                        Alerjen Uyarısı (Resmi Tebliğ):
                      </span>
                      {item.allergens.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.allergens.map((a, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-red-100 text-red-700 px-1.5 py-0.5 text-[9px] font-bold"
                            >
                              ⚠️ {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-emerald-700 font-medium mt-0.5">
                          ✓ Belirtilen 14 temel alerjen içermez.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. Alt Garson & Hesap Çağırma Çubuğu (Masada Servis) */}
      <div className="bg-white border-t border-zinc-200 px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('Masa 4 için Garson Çağrısı İletildi! 🔔')}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white py-2 text-[11px] font-bold text-zinc-800 hover:bg-zinc-50 active:scale-98 transition-all cursor-pointer shadow-2xs"
          >
            <Bell className="h-3.5 w-3.5 text-[#FF4D00]" />
            Garson Çağır
          </button>
          <button
            type="button"
            onClick={() => showToast('Masa 4 için Hesap İstendi! 🧾')}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#FF4D00] py-2 text-[11px] font-bold text-white hover:bg-orange-600 active:scale-98 transition-all cursor-pointer shadow-xs"
          >
            <Receipt className="h-3.5 w-3.5" />
            Hesap İste
          </button>
        </div>
      </div>

      {/* Toast Bildirim Simülasyonu */}
      {toastMessage && (
        <div className="absolute top-12 left-3 right-3 z-30 rounded-xl bg-zinc-900/95 text-white px-3 py-2 text-center text-[11px] font-semibold shadow-lg backdrop-blur-xs flex items-center justify-center gap-1.5 transition-all">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
