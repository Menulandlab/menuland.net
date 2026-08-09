// Suggestion Engine - "Ne Yesek/Ne İçsek" için akıllı öneri sistemi

export interface SuggestionOptions {
  userLocation: { lat: number; lon: number };
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  weather?: 'sunny' | 'rainy' | 'cold' | 'hot';
  mood?: 'happy' | 'tired' | 'social' | 'hungry';
  budget?: 'low' | 'medium' | 'high';
}

export interface FoodSuggestion {
  type: 'food' | 'drink';
  category: string;
  suggestion: string;
  description: string;
  nearbyBusinesses?: any[];
  icon: string;
}

class SuggestionEngine {
  
  // Yemek önerileri
  private foodSuggestions = {
    morning: [
      { category: 'Kahvaltı', suggestion: 'Geleneksel Türk Kahvaltısı', description: 'Güne enerjik başla!', icon: '🍳' },
      { category: 'Kahvaltı', suggestion: 'Avokado Toast', description: 'Sağlıklı ve doyurucu', icon: '🥑' },
      { category: 'Tatlı', suggestion: 'Pancake & Waffle', description: 'Tatlı bir başlangıç', icon: '🥞' }
    ],
    afternoon: [
      { category: 'Ana Yemek', suggestion: 'Pizza Margherita', description: 'Klasik İtalyan lezzeti', icon: '🍕' },
      { category: 'Türk Mutfağı', suggestion: 'Döner Kebap', description: 'Vazgeçilmez lezzet', icon: '🥙' },
      { category: 'Salata', suggestion: 'Caesar Salad', description: 'Hafif ve besleyici', icon: '🥗' }
    ],
    evening: [
      { category: 'Et Yemekleri', suggestion: 'Izgara Köfte', description: 'Geleneksel akşam yemeği', icon: '🍖' },
      { category: 'Deniz Ürünleri', suggestion: 'Balık Izgara', description: 'Sağlıklı protein kaynağı', icon: '🐟' },
      { category: 'Makarna', suggestion: 'Penne Arrabbiata', description: 'İtalyan usulü', icon: '🍝' }
    ],
    night: [
      { category: 'Atıştırmalık', suggestion: 'Çiğ Köfte', description: 'Gece keyfi', icon: '🌯' },
      { category: 'Fast Food', suggestion: 'Dürüm', description: 'Pratik ve doyurucu', icon: '🌯' },
      { category: 'Tatlı', suggestion: 'Dondurma', description: 'Gece tatlısı', icon: '🍦' }
    ]
  };

  // İçecek önerileri  
  private drinkSuggestions = {
    morning: [
      { category: 'Kahve', suggestion: 'Cappuccino', description: 'Güne mükemmel başlangıç', icon: '☕' },
      { category: 'Çay', suggestion: 'Earl Grey', description: 'Klasik İngiliz çayı', icon: '🫖' },
      { category: 'Fresh', suggestion: 'Portakal Suyu', description: 'C vitamini deposu', icon: '🍊' }
    ],
    afternoon: [
      { category: 'Soğuk İçecek', suggestion: 'Iced Latte', description: 'Serinletici kahve', icon: '🧊' },
      { category: 'Smoothie', suggestion: 'Meyve Smoothie', description: 'Doğal ve sağlıklı', icon: '🥤' },
      { category: 'Çay', suggestion: 'Yeşil Çay', description: 'Antioksidan zengini', icon: '🍵' }
    ],
    evening: [
      { category: 'Türk Çayı', suggestion: 'Geleneksel Çay', description: 'Sohbetin vazgeçilmezi', icon: '🫖' },
      { category: 'Kokteyl', suggestion: 'Virgin Mojito', description: 'Ferahlatıcı', icon: '🍹' },
      { category: 'Sıcak İçecek', suggestion: 'Sıcak Çikolata', description: 'Rahatlatıcı', icon: '🍫' }
    ],
    night: [
      { category: 'Çay', suggestion: 'Bitki Çayı', description: 'Rahatlatıcı gece çayı', icon: '🫖' },
      { category: 'Sıcak İçecek', suggestion: 'Süt', description: 'Uyku öncesi klasiği', icon: '🥛' },
      { category: 'Kokteyl', suggestion: 'Virgin Cocktail', description: 'Gece keyfi', icon: '🍹' }
    ]
  };

  getSuggestion(type: 'food' | 'drink', options: SuggestionOptions): FoodSuggestion {
    const suggestions = type === 'food' ? this.foodSuggestions : this.drinkSuggestions;
    const timeBasedSuggestions = suggestions[options.timeOfDay];
    
    // Hava durumu ve ruh haline göre filtreleme
    let filteredSuggestions = timeBasedSuggestions;
    
    if (options.weather === 'cold' && type === 'drink') {
      filteredSuggestions = timeBasedSuggestions.filter(s => 
        s.category.includes('Sıcak') || s.category.includes('Çay') || s.category.includes('Kahve')
      );
    }
    
    if (options.weather === 'hot' && type === 'drink') {
      filteredSuggestions = timeBasedSuggestions.filter(s => 
        s.category.includes('Soğuk') || s.category.includes('Fresh') || s.category.includes('Smoothie')
      );
    }

    // Rastgele seçim
    const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
    const selectedSuggestion = filteredSuggestions[randomIndex];

    return {
      type,
      ...selectedSuggestion,
      nearbyBusinesses: [] // Bu kısımda API'den yakın işletmeler çekilecek
    };
  }

  // Yakındaki işletmeleri kategori bazlı getir
  async getNearbyBusinessesByCategory(category: string, location: { lat: number; lon: number }) {
    // Bu fonksiyon API'den kategori bazlı yakın işletmeleri getirecek
    // Implementasyon businessService'e eklenebilir
    return [];
  }
}

export const suggestionEngine = new SuggestionEngine();
