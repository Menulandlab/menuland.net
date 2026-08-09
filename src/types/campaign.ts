// Kampanya tipi, backend ile uyumlu şekilde tanımlanmıştır.
export interface Campaign {
  id: number;
  image_url: string;
  product_name: string;
  current_price: number;
  discounted_price: number;
  // PuanLand alanları (mapping sonrası normalize edilmiş)
  puan_enabled?: boolean;          // "1"/"0" string'den parse edilir
  puan_required?: number | null;   // Harcama için gereken puan
  puan_price?: number | null;      // 1 puanın TL karşılığı
}
