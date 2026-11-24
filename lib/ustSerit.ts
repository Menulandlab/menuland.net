/**
 * Sitenin en üstündeki dönen duyuru şeridinin mesajları (components/UstSerit.tsx).
 * Mesaj eklemek, çıkarmak ya da sırasını değiştirmek için yalnızca bu listeyi düzenleyin.
 *
 * Kurallar:
 * - Depo herkese açık; buraya iç sayı (görüntülenme, işletme sayısı vb.) yazılmaz.
 * - Satış cümleleri doğrulanmış olmalı: menü girişi şu an ücretsiz (kurucu kararı, Kasım 2026).
 *   PuanLand puanı sunucuda yorum, "Buradayım", profil paylaşımı ve video izleme için veriliyor;
 *   rezervasyon için puan verilmiyor, bu yüzden metin yalnızca yorumdan söz ediyor.
 * - Telefon metni (kisaMetin) 360 px genişlikte tek satıra sığmalı: en çok 29 karakter.
 * - Gel-Al'a açık işletme olana kadar Gel-Al mesajı eklenmez.
 */

export type UstSeritIkon = 'takvim' | 'telefon' | 'hediye' | 'dukkan' | 'konum';

export type UstSeritHedef =
  /** iPhone'da App Store, Android'de Google Play, diğer cihazlarda alttaki indirme bölümü. */
  | { tur: 'uygulama' }
  /** WhatsApp destek hattı; kod mesajın sonuna eklenir ve mesajın şeritten geldiğini gösterir. */
  | { tur: 'whatsapp'; mesaj: string; kod: string }
  /** Site içi sayfa. */
  | { tur: 'sayfa'; adres: string };

export interface UstSeritMesaji {
  /** Google Analytics olayında görünen kısa ad. */
  id: string;
  ikon: UstSeritIkon;
  /** 640 px ve üstü ekranlarda görünen metin. */
  metin: string;
  /** Telefonda görünen metin. */
  kisaMetin: string;
  dugme: string;
  kisaDugme: string;
  hedef: UstSeritHedef;
}

export const UST_SERIT_MESAJLARI: UstSeritMesaji[] = [
  {
    id: 'rezervasyon',
    ikon: 'takvim',
    metin: 'Masanızı Menuland uygulamasından ayırtın',
    kisaMetin: 'Masanızı uygulamadan ayırtın',
    dugme: 'Uygulamayı indir',
    kisaDugme: 'İndir',
    hedef: { tur: 'uygulama' },
  },
  {
    id: 'menuler',
    ikon: 'telefon',
    metin: 'Menüler ve güncel fiyatlar cebinizde',
    kisaMetin: 'Menüler ve fiyatlar cebinizde',
    dugme: 'Uygulamayı indir',
    kisaDugme: 'İndir',
    hedef: { tur: 'uygulama' },
  },
  {
    id: 'puanland',
    ikon: 'hediye',
    metin: 'Yorum yazın, PuanLand puanı kazanın',
    kisaMetin: 'Yorum yazın, puan kazanın',
    dugme: 'Uygulamayı indir',
    kisaDugme: 'İndir',
    hedef: { tur: 'uygulama' },
  },
  {
    id: 'isletme',
    ikon: 'dukkan',
    metin: "İşletmeniz mi var? Menünüzü Menuland'e ücretsiz ekleyelim",
    kisaMetin: 'Menünüzü ücretsiz ekleyelim',
    dugme: "WhatsApp'tan yazın",
    kisaDugme: 'Yazın',
    hedef: {
      tur: 'whatsapp',
      mesaj: "Merhaba, işletmemin menüsünü Menuland'e ücretsiz eklemek istiyorum.",
      kod: 'WEB-SERIT',
    },
  },
  {
    id: 'sehirler',
    ikon: 'konum',
    metin: 'Şehrinizdeki lezzetleri keşfedin',
    kisaMetin: 'Şehrinizdeki lezzetler',
    dugme: 'Keşfet',
    kisaDugme: 'Keşfet',
    hedef: { tur: 'sayfa', adres: '/sehirler' },
  },
];
