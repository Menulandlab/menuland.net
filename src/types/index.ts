// Bu dosya, uygulama genelinde kullanılacak olan ana veri tiplerini barındırır.
export interface Business {
  // Temel bilgiler - Veritabanı kolonları ile aynı isimler
  id: number;
  name: string; // business_name yerine name kullanılıyor
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  instagram_url?: string;
  
  // Görsel bilgileri (Maksimum 10 adet görsel desteklenmektedir)
  image_url_1?: string; // Businesses API'den gelen görsel
  image_url_2?: string;
  image_url_3?: string;
  image_url_4?: string;
  image_url_5?: string;
  image_url_6?: string;
  image_url_7?: string;
  image_url_8?: string;
  image_url_9?: string;
  image_url_10?: string;
  image_url_medium?: string; // 900px WebP — detay sayfası
  image_url_thumb?: string;  // 400px WebP — liste/kart
  image_url?: string; // Places API'den gelen görsel
  
  // Konum bilgileri
  latitude?: string;
  longitude?: string;
  city_id?: number;
  district_id?: number;
  address?: string;
  
  // Kategori ve sınıflandırma
  category_text?: string; // Virgülle ayrılmış kategoriler
  categories?: { id: number; name: string }[]; // Eski kategori sistemi (geriye uyumluluk)
  business_listing_categories?: { id: number; name: string }[]; // Yeni kategori sistemi (geriye uyumluluk)
  
  // Menü bilgileri
  menu_type?: 'link' | 'internal' | 'none';
  menu_url?: string | null;
  slug?: string | null;
  
  // Değerlendirme ve özellikler
  rating: string;
  
  // Ticaret Odası üyeliği (0: üye değil, 1: üye) - API string döndürüyor
  chamber_of_commerce?: number | string;
  
  // Rezervasyon sistemi
  accepts_reservations?: number; // 0: Kapalı, 1: Açık
  
  // Onaylı işletme (mavi tik)
  is_verified?: boolean;
  
  // Uygulama özel alanları
  isFeatured?: boolean;
  distance?: number; // Hesaplanan mesafe
}
