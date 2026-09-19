export interface DocScreenshot {
  filename: string;
  caption: string;
  deviceType: "mobile" | "desktop";
  placeholderTitle: string;
  placeholderDesc: string;
}

export interface DocStep {
  number: number;
  title: string;
  description: string;
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  tip?: string;
  warning?: string;
  steps?: DocStep[];
}

export interface DocFAQ {
  question: string;
  answer: string;
}

export interface DocArticle {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  summary: string;
  readTime: string;
  lastUpdated: string;
  screenshot: DocScreenshot;
  highlights: string[];
  sections: DocSection[];
  faq: DocFAQ[];
  keywords: string[];
}

export interface DocCategory {
  title: string;
  slug: string;
  description: string;
  icon: string;
  articles: DocArticle[];
}

export const docsCategories: DocCategory[] = [
  {
    "title": "Müşteri & Mobil Uygulama",
    "slug": "musteri-rehberi",
    "description": "Menuland mobil uygulaması (iOS & Android) ile sipariş, sadakat puanları ve masa menüsü deneyimi.",
    "icon": "Smartphone",
    "articles": [
      {
        "slug": "gel-al-nasil-calisir",
        "title": "Gel Al Sipariş Rehberi: Sıra Beklemeden Teslim Alma",
        "category": "Müşteri & Mobil Uygulama",
        "categorySlug": "musteri-rehberi",
        "summary": "Menuland mobil uygulaması üzerinden restoran ve kafelerden sıra beklemeden Gel Al (Al-Götür) siparişi verme, takip etme ve teslim alma adımları.",
        "readTime": "4 dk okuma",
        "lastUpdated": "Eylül 2026",
        "screenshot": {
          "filename": "mobil-gel-al-siparis.png",
          "caption": "Menuland mobil uygulamasında Gel Al sipariş ve sepet onay ekranı",
          "deviceType": "mobile",
          "placeholderTitle": "Gel Al Sipariş Ekranı",
          "placeholderDesc": "Menuland uygulamasında sepet, tahmini hazırlanma süresi ve sipariş onayı adımları."
        },
        "highlights": [
          "Restorana varmadan önce sipariş verip sıra beklemeden teslim alabilirsiniz.",
          "Mutfak hazırlık aşamasını canlı olarak telefonunuzdan izleyebilirsiniz.",
          "Her Gel Al siparişinizde PuanLand sadakat puanı kazanırsınız."
        ],
        "sections": [
          {
            "id": "gel-al-nedir",
            "title": "Gel Al Hizmeti Nedir?",
            "content": "Menuland Gel Al, favori restoran veya kafenizden dilediğiniz lezzetleri telefonunuzdan seçip sipariş verdiğiniz; siparişiniz mutfakta hazırlanırken yoldayken veya yakındayken zaman kaybetmeden tam zamanında teslim aldığınız modern bir al-götür deneyimidir. Kasa kuyruğunda beklemez, ödemenizi uygulama üzerinden güvenle tamamlarsınız.",
            "tip": "Özellikle öğle arası yoğunluklarında veya sabah kahvenizi alırken Gel Al kullanarak dakikalarca süren kasa kuyruklarından kurtulabilirsiniz."
          },
          {
            "id": "adim-adim-siparis",
            "title": "Adım Adım Gel Al Siparişi Nasıl Verilir?",
            "content": "Menuland mobil uygulamasında Gel Al siparişi vermek yalnızca birkaç saniyenizi alır:",
            "steps": [
              {
                "number": 1,
                "title": "Mekanı ve Ürünleri Seçin",
                "description": "Menuland uygulamasını açın, Gel Al hizmeti sunan restoran veya kafeler arasından dilediğinizi seçin. Menüden ürünlerinizi, porsiyon ve özel isteklerinizi belirleyerek sepete ekleyin."
              },
              {
                "number": 2,
                "title": "Siparişinizi Kontrol Edin ve Onaylayın",
                "description": "Sepetinizde tahmini hazırlanma süresini ve ürün detaylarını inceleyin. Varsa PuanLand indirim kuponunuzu uygulayarak siparişinizi iletin."
              },
              {
                "number": 3,
                "title": "Hazırlanma Bildirimini Bekleyin",
                "description": "Siparişiniz işletmeye ulaştığında mutfak onayı verilir ve 'Hazırlanıyor' durumuna geçer. Siparişiniz paketlendiğinde telefonunuza 'Siparişiniz Hazır!' bildirimi gelir."
              },
              {
                "number": 4,
                "title": "Sıra Beklemeden Teslim Alın",
                "description": "Mekana giderek Menuland Gel Al teslimat noktasından veya kasadan sipariş numaranızı / isminizi söyleyerek sıcacık teslim alın."
              }
            ]
          },
          {
            "id": "odeme-ve-guvenlik",
            "title": "Ödeme ve Sipariş İptali",
            "content": "Siparişleriniz güvenli ödeme altyapısıyla şifrelenmiş olarak işlenir. İşletme siparişinizi onaylamadan önce siparişinizi iptal edebilirsiniz. Sipariş mutfakta hazırlanmaya başladıktan sonra ürün israfını önlemek adına iptal işlemi kısıtlanabilir.",
            "warning": "Siparişiniz 'Hazır' bildiriminden itibaren sıcak/soğuk tazeliğini koruması için makul süre içerisinde restorandan teslim alınmalıdır."
          }
        ],
        "faq": [
          {
            "question": "Gel Al siparişi için ek bir hizmet ücreti öder miyim?",
            "answer": "Hayır. Menuland Gel Al siparişlerinde menü fiyatları geçerlidir, herhangi bir ekstra kurye veya teslimat ücreti ödemezsiniz."
          },
          {
            "question": "Gel Al ile sipariş verirsem restoranda oturabilir miyim?",
            "answer": "Gel Al hizmeti paketi alıp gitmek üzere kurgulanmıştır. Restoranda masa servisi almak isterseniz masadaki QR kodu okutarak yerinde sipariş veya servis talep edebilirsiniz."
          },
          {
            "question": "Siparişimin durumunu nereden görebilirim?",
            "answer": "Menuland mobil uygulamasında alt menüdeki Siparişlerim sekmesinden siparişinizin onay, hazırlanma ve hazır olma aşamalarını anlık olarak takip edebilirsiniz."
          }
        ],
        "keywords": [
          "menuland gel al",
          "gel al sipariş",
          "restoran al götür",
          "sıra beklemeden sipariş",
          "menuland mobil"
        ]
      },
      {
        "slug": "puanland-sadakat-programi",
        "title": "PuanLand Sadakat Programı: Puan Kazanma ve Harcama",
        "category": "Müşteri & Mobil Uygulama",
        "categorySlug": "musteri-rehberi",
        "summary": "Menuland ekosisteminde sipariş verdikçe, mekan ziyaret ettikçe ve değerlendirme yaptıkça PuanLand puanı kazanma ve indirim kuponuna dönüştürme rehberi.",
        "readTime": "3 dk okuma",
        "lastUpdated": "Eylül 2026",
        "screenshot": {
          "filename": "mobil-puanland-cuzdan.png",
          "caption": "PuanLand cüzdanı, kazanılan puanlar ve aktif indirim kuponları",
          "deviceType": "mobile",
          "placeholderTitle": "PuanLand Cüzdanım",
          "placeholderDesc": "Toplam kazanılan sadakat puanı, kupon çevirme butonu ve kullanım geçmişi."
        },
        "highlights": [
          "Her sipariş tutarınızın belirli bir yüzdesi anında PuanLand puanı olarak hesabınıza yüklenir.",
          "Biriken puanlarınızı sonraki siparişlerinizde nakit indirim kuponu olarak kullanabilirsiniz.",
          "Yorum yaparak, mekan keşfederek ve kampanyalara katılarak ekstra puan toplayabilirsiniz."
        ],
        "sections": [
          {
            "id": "puanland-nedir",
            "title": "PuanLand Nedir?",
            "content": "PuanLand, Menuland mobil uygulaması kullanıcılarına özel hazırlanmış akıllı bir sadakat ve ödül programıdır. Amacı; lezzet tutkunlarının dışarıda yeme-içme ve paket sipariş deneyimlerini ödüllendirerek her harcamada kazandırmaktır.",
            "tip": "PuanLand puanlarınız doğrudan dijital cüzdanınızda saklanır ve son kullanma tarihi yaklaşmadan önce uygulama tarafından hatırlatılır."
          },
          {
            "id": "nasil-puan-kazanilir",
            "title": "Nasıl Puan Kazanılır?",
            "content": "PuanLand sisteminde puan toplamanın birden fazla kolay yolu vardır:",
            "steps": [
              {
                "number": 1,
                "title": "Gel Al ve Masa Siparişleri",
                "description": "Menuland üzerinden verdiğiniz her onaylı siparişin tutarına göre otomatik olarak sadakat puanı kazanırsınız."
              },
              {
                "number": 2,
                "title": "Değerlendirme ve Yorum Yazma",
                "description": "Ziyaret ettiğiniz veya sipariş verdiğiniz işletmelere yapıcı yorum ve yıldız değerlendirmesi bırakarak ekstra puan toplayabilirsiniz."
              },
              {
                "number": 3,
                "title": "Özel Gün ve Kampanyalar",
                "description": "Haftalık lezzet günleri, yeni üye bonusları ve sürpriz mekan kampanyaları ile 2 kat puan kazanma fırsatları sunulur."
              }
            ]
          },
          {
            "id": "puan-harcama",
            "title": "Puanlarımı Nasıl Harcarım?",
            "content": "Profilim > PuanLand Cüzdanım sayfasına girerek birikmiş puanlarınızı tek tıkla indirim kuponuna çevirebilirsiniz. Bir sonraki sepetinizde bu kuponu seçtiğinizde sipariş tutarınız otomatik olarak indirimli hesaplanır."
          }
        ],
        "faq": [
          {
            "question": "Kazanılan PuanLand puanlarının geçerlilik süresi var mı?",
            "answer": "Kazanılan puanlar takvim yılı sonuna kadar veya kampanya koşullarında belirtilen süre boyunca geçerlidir."
          },
          {
            "question": "Puanlarımı nakit paraya çevirebilir miyim?",
            "answer": "PuanLand puanları nakit olarak çekilemez; Menuland anlaşmalı işletmelerinde indirim kuponu olarak kullanılır."
          }
        ],
        "keywords": [
          "puanland",
          "menuland puan",
          "restoran sadakat programı",
          "indirim kuponu yemek",
          "menuland ödül"
        ]
      },
      {
        "slug": "masada-qr-menu-kullanimi",
        "title": "Masada QR Menü: Temassız, Hızlı ve Alerjen Dostu",
        "category": "Müşteri & Mobil Uygulama",
        "categorySlug": "musteri-rehberi",
        "summary": "Restoran ve kafelerde masadaki QR kodu telefonunuzla okutarak güncel fiyatları, porsiyon detaylarını ve alerjen bilgilerini görüntüleme rehberi.",
        "readTime": "3 dk okuma",
        "lastUpdated": "Eylül 2026",
        "screenshot": {
          "filename": "mobil-qr-menu-okutma.png",
          "caption": "Masada QR kod tarama ve ürün alerjen filtreleme ekranı",
          "deviceType": "mobile",
          "placeholderTitle": "QR Menü Deneyimi",
          "placeholderDesc": "Kamera ile karekod tarama, kategori sekmesi ve alerjen/kalori bilgi kartı."
        },
        "highlights": [
          "Eski basılı menüler yerine anlık güncellenen resmi ve onaylı fiyatları görürsünüz.",
          "Kalori, gramaj ve alerjen (gluten, fıstık, laktoz vb.) filtreleri ile güvenle sipariş verirsiniz.",
          "Uygulama yüklemeden tarayıcıdan da hızlıca açılabilir."
        ],
        "sections": [
          {
            "id": "masada-kullanim",
            "title": "Masadaki QR Kod Nasıl Okutulur?",
            "content": "Menuland anlaşmalı bir restorana gittiğinizde masanızda bulunan Menuland QR kodunu telefonunuzun normal kamerasıyla veya Menuland mobil uygulaması içerisindeki QR okuyucu ile taratmanız yeterlidir. Saniyeler içinde o masaya özel dijital menü açılır.",
            "tip": "Telefonunuzun kamerasını QR koda 15-20 cm mesafeden tuttuğunuzda ekranda beliren menü bağlantısına dokunarak doğrudan ulaşabilirsiniz."
          },
          {
            "id": "alerjen-ve-kalori",
            "title": "Alerjen, Kalori ve Gramaj Şeffaflığı",
            "content": "Menuland dijital menülerinde her ürünün altında porsiyon ağırlığı (gram), tahmini kalori değeri ve 14 temel alerjen uyarısı yer alır. Özel beslenme düzenine sahip olanlar (Vegan, Çölyak, Laktoz intoleransı) ürün filtrelerini kullanarak kendilerine uygun yiyecekleri anında listeleyebilir."
          }
        ],
        "faq": [
          {
            "question": "QR menüyü açmak için uygulama indirmek şart mı?",
            "answer": "Hayır. QR menü telefonunuzun standart web tarayıcısında da kusursuz çalışır. Ancak Gel Al siparişi vermek ve PuanLand kazanmak için mobil uygulama önerilir."
          }
        ],
        "keywords": [
          "qr menü nasıl kullanılır",
          "masada karekod",
          "dijital restoran menüsü",
          "alerjen filtreli menü",
          "menuland qr"
        ]
      },
      {
        "slug": "mekan-kesfi-ve-karar-carki",
        "title": "Mekan Keşfi & Karar Çarkı: Ne Yesem / Ne İçsem?",
        "category": "Müşteri & Mobil Uygulama",
        "categorySlug": "musteri-rehberi",
        "summary": "Şehrinizdeki en iyi kafe ve restoranları filtreleyerek keşfetme ve kararsız kaldığınızda eğlenceli karar çarkını çevirme rehberi.",
        "readTime": "3 dk okuma",
        "lastUpdated": "Eylül 2026",
        "screenshot": {
          "filename": "mobil-karar-carki.png",
          "caption": "Menuland mobil uygulamasında lezzet karar çarkı",
          "deviceType": "mobile",
          "placeholderTitle": "Karar Çarkı Arayüzü",
          "placeholderDesc": "Kategori seçimi, döndürme butonu ve kazanan lezzetin mekan önerisi."
        },
        "highlights": [
          "İl ve ilçe bazında açık mekanları, teraslı yerleri ve popüler noktaları listeleyin.",
          "Yemek kararsızlığını eğlenceli lezzet çarkıyla saniyeler içinde çözün.",
          "Gerçek kullanıcı yorumları ve puanlarına göre rota oluşturun."
        ],
        "sections": [
          {
            "id": "mekan-kesfi",
            "title": "Şehrin En İyi Mekanlarını Keşfedin",
            "content": "Menuland Keşfet sekmesi; bulunduğunuz konuma veya seçtiğiniz ilçeye en yakın restoran, kafe, kahvaltıcı ve tatlıcıları sıralar. Çalışma saatleri, açık/kapalı durumu ve güncel menü fiyatları tek ekranda sunulur."
          },
          {
            "id": "karar-carki-nasil-calisir",
            "title": "Karar Çarkı Nasıl Çalışır?",
            "content": "Kararsız kaldığınız anlarda Keşfet sekmesindeki Karar Çarkı ikonuna dokunun. İster Yemek, ister Tatlı / Kahve modunu seçerek çarkı çevirin. Çark durduğunda çıkan lezzeti yapan en yakın ve en yüksek puanlı Menuland işletmeleri harita üzerinde önünüze gelir!",
            "tip": "Arkadaş grubunuzla dışarı çıktığınızda ne yiyeceğinize karar veremiyorsanız çarkı çevirerek eğlenceli ve demokratik bir seçim yapabilirsiniz."
          }
        ],
        "faq": [
          {
            "question": "Karar çarkında filtreleme yapabilir miyim?",
            "answer": "Evet; bütçenize, mutfak türüne (örneğin Burger, Dünya Mutfağı, Ev Yemekleri) veya sadece tatlı/kahve seçeneklerine göre çarkı özelleştirebilirsiniz."
          }
        ],
        "keywords": [
          "ne yesem çarkı",
          "menuland mekan keşfi",
          "restoran önerisi",
          "yakındaki kafeler",
          "yemek kararsızlığı"
        ]
      }
    ]
  },
  {
    "title": "İşletme & Restoran Yönetimi",
    "slug": "isletme-rehberi",
    "description": "Restoran ve kafeler için işletme hesabı açma, yeni yönetmeliğe uygun QR menü ve Gel Al sipariş yönetimi.",
    "icon": "UtensilsCrossed",
    "articles": [
      {
        "slug": "isletme-basvurusu-ve-kurulum",
        "title": "İşletme Başvurusu & Hesap Aktivasyon Rehberi",
        "category": "İşletme & Restoran Yönetimi",
        "categorySlug": "isletme-rehberi",
        "summary": "Menuland İşletme Portalı'na başvuru yapma, mekan profili oluşturma ve menüyü dakikalar içinde canlıya alma süreci.",
        "readTime": "4 dk okuma",
        "lastUpdated": "Eylül 2026",
        "screenshot": {
          "filename": "isletme-kayit-onay.png",
          "caption": "Menuland İşletme Portalı başvuru ve mekan bilgi formu",
          "deviceType": "desktop",
          "placeholderTitle": "İşletme Kayıt Ekranı",
          "placeholderDesc": "Mekan adı, kategori, adres ve iletişim bilgilerinin tanımlandığı panel."
        },
        "highlights": [
          "Kredi kartsız ve taahhütsüz hızlı başvuru imkanı.",
          "Aynı gün içinde menü kurulumu ve karekod üretimi.",
          "Müşteri arama sonuçlarında ve mobil uygulamada hemen listelenme."
        ],
        "sections": [
          {
            "id": "basvuru-sureci",
            "title": "Menuland İşletme Başvurusu Nasıl Yapılır?",
            "content": "Restoran veya kafe işletmecileri işletme kayıt sayfasından yalnızca işletme adı, telefon ve yetkili kişi bilgilerini girerek hesaplarını anında oluşturabilirler. Başvuru ardından Menuland destek ekibi işletmenizin menü aktarımını kolaylaştırmak için sizinle iletişime geçer.",
            "steps": [
              {
                "number": 1,
                "title": "Hesap Oluşturun",
                "description": "Menuland İşletme Portalına e-posta ve şifrenizle kayıt olun."
              },
              {
                "number": 2,
                "title": "Mekan Bilgilerini Doldurun",
                "description": "Mekanınızın çalışma saatlerini, konumunu, logosunu ve kapak görselini sisteme yükleyin."
              },
              {
                "number": 3,
                "title": "Menünüzü Ekleyin veya İletin",
                "description": "Mevcut menünüzü panelden kategori ve ürün olarak girin veya ekibimize ileterek profesyonel aktarım talep edin."
              },
              {
                "number": 4,
                "title": "QR Kodlarınızı İndirip Masalarınıza Koyun",
                "description": "Sistem tarafından otomatik üretilen yüksek kaliteli QR kodları bastırarak masalarınıza yerleştirin."
              }
            ]
          }
        ],
        "faq": [
          {
            "question": "Menümü aktarmak için ek bir ücret öder miyim?",
            "answer": "Hayır. Menuland ilk kurulum ve menü aktarım desteğini işletmelere ücretsiz olarak sağlamaktadır."
          }
        ],
        "keywords": [
          "menuland işletme kaydı",
          "restoran menü başvurusu",
          "dijital menü üyelik",
          "kafe qr kod al"
        ]
      },
      {
        "slug": "yeni-yonetmelik-menuleri",
        "title": "Yeni Yönetmeliğe Uygun Menü: Gramaj, Kalori ve Alerjen",
        "category": "İşletme & Restoran Yönetimi",
        "categorySlug": "isletme-rehberi",
        "summary": "T.C. Ticaret Bakanlığı Fiyat ve Menü Yönetmeliği gereğince zorunlu olan gramaj, kalori, alerjen ve servis süresi bilgilerini Menuland ile eksiksiz girme rehberi.",
        "readTime": "5 dk okuma",
        "lastUpdated": "Eylül 2026",
        "screenshot": {
          "filename": "isletme-yonetmelik-kalori-alerjen.png",
          "caption": "Ürün yönetiminde gramaj, kalori, 14 alerjen ve servis süresi giriş paneli",
          "deviceType": "desktop",
          "placeholderTitle": "Mevzuata Uygun Ürün Paneli",
          "placeholderDesc": "Ürün kartında gramaj (gr/ml), kalori (kcal), alerjen ikonları ve servis süresi alanları."
        },
        "highlights": [
          "Ticaret Bakanlığı'nın yeme-içme sektörü denetimlerine %100 uyumluluk sağlar.",
          "14 zorunlu alerjen listesi tek tıkla seçilebilir hazır ikonlarla sunulur.",
          "Fiziksel menüleri yeniden bastırma masrafını tamamen ortadan kaldırır."
        ],
        "sections": [
          {
            "id": "mevzuat-gereklilikleri",
            "title": "Yönetmelik Ne Gerektiriyor?",
            "content": "Resmi Gazete’de yayımlanan Fiyat Etiketi ve Menü Yönetmeliği uyarınca; lokanta, restoran, kafe, pastane gibi işletmelerin müşteriye sundukları ürünlerin porsiyon gramajını, içerdikleri alerjen maddeleri ve net satış fiyatlarını kapıda ve masada açıkça sergilemesi zorunludur. Eksik veya yanıltıcı bilgi sunulması idari para cezalarına yol açabilmektedir.",
            "warning": "Basılı menülerde gramaj veya fiyat değiştirmek yüksek matbaa maliyeti yaratırken, Menuland üzerinden yapacağınız güncellemeler anında devreye girer ve cezai riskleri önler."
          },
          {
            "id": "panelde-tanimlama",
            "title": "Menuland Panelinde Nasıl Tanımlanır?",
            "content": "İşletme panelinde Ürünler sekmesine gidin. Herhangi bir ürünü düzenlerken karşınıza çıkan özel alanları doldurun:",
            "steps": [
              {
                "number": 1,
                "title": "Porsiyon / Gramaj Miktarı",
                "description": "Örn: 220 gr, 330 ml, 2 Kişilik (500 gr) şeklinde porsiyon bilgisini belirtin."
              },
              {
                "number": 2,
                "title": "Alerjen Maddeleri İşaretleyin",
                "description": "Gluten, Yumurta, Balık, Süt/Laktoz, Soya, Fıstık gibi 14 resmi alerjen ikonundan üründe bulunanları tek tıkla seçin."
              },
              {
                "number": 3,
                "title": "Kalori ve Servis Süresi",
                "description": "Tahmini kalori değerini (kcal) ve müşteriye hazırlanış süresini (örn: 15-20 dk) ekleyin."
              }
            ]
          }
        ],
        "faq": [
          {
            "question": "Alerjen bilgilerini girmek zorunlu mu?",
            "answer": "Evet. Müşteri sağlığı ve resmi gıda denetimleri gereğince menüde alerjen uyarısı bulunması yasal zorunluluktur."
          }
        ],
        "keywords": [
          "fiyat etiketi yönetmeliği",
          "menü alerjen bilgisi zorunlu mu",
          "menüde gramaj zorunluluğu",
          "menuland mevzuat uyumu"
        ]
      },
      {
        "slug": "gel-al-siparis-yonetimi",
        "title": "Gel Al Sipariş Karşılama Paneli ve Mutfak Yönetimi",
        "category": "İşletme & Restoran Yönetimi",
        "categorySlug": "isletme-rehberi",
        "summary": "Müşterilerden gelen paket ve Gel Al siparişlerini işletme panelinden anlık sesli bildirimle karşılama, mutfağa iletme ve teslim etme rehberi.",
        "readTime": "4 dk okuma",
        "lastUpdated": "Eylül 2026",
        "screenshot": {
          "filename": "isletme-gel-al-paneli.png",
          "caption": "İşletme panelinde canlı sipariş karşılama ve durum yönetimi ekranı",
          "deviceType": "desktop",
          "placeholderTitle": "Gel Al Sipariş Paneli",
          "placeholderDesc": "Gelen yeni siparişler, Onaylandı, Hazırlanıyor ve Teslim Edildi kolonları."
        },
        "highlights": [
          "Yeni sipariş düştüğünde tarayıcıdan ve tabletten sesli uyarı zili çalar.",
          "Mutfak durumuna göre tahmini hazırlanma dakikası girilebilir.",
          "Sipariş Hazır butonuna basıldığı an müşteriye anlık bildirim gider."
        ],
        "sections": [
          {
            "id": "siparis-akisi",
            "title": "Gel Al Sipariş Akışı Nasıl Yönetilir?",
            "content": "İşletmenizde açık olan Menuland yönetim ekranında yeni bir sipariş belirdiğinde ekran yanıp söner ve sesli ikaz verilir. Kasa veya mutfak görevlisi sipariş detaylarını (ürünler, müşteri notu, teslimat saati) kontrol ederek tek tıkla onaylar.",
            "steps": [
              {
                "number": 1,
                "title": "Siparişi Onaylayın",
                "description": "Mutfak durumuna göre siparişi onaylayın. Müşteriye 'Siparişiniz onaylandı, hazırlanıyor' bildirimi iletilir."
              },
              {
                "number": 2,
                "title": "Sipariş Hazır Butonuna Basın",
                "description": "Ürünler paketlendiğinde 'Hazır' butonuna basın. Müşterinin telefonuna teslim alabileceğine dair push bildirim gider."
              },
              {
                "number": 3,
                "title": "Teslimatı Tamamlayın",
                "description": "Müşteri sipariş numarasını veya ismini ibraz ettiğinde paketi teslim ederek işlemi başarıyla kapatın."
              }
            ]
          }
        ],
        "faq": [
          {
            "question": "Sipariş karşılama için özel bir POS cihazı gerekli mi?",
            "answer": "Hayır. İşletmenizdeki herhangi bir tablet, bilgisayar veya akıllı telefondan web tarayıcısı üzerinden anında kullanabilirsiniz."
          }
        ],
        "keywords": [
          "gel al restoran paneli",
          "menuland sipariş karşılama",
          "al götür mutfak yönetimi",
          "restoran paket sistemi"
        ]
      },
      {
        "slug": "masa-ve-karekod-yonetimi",
        "title": "Masa & Karekod (QR Kod) Oluşturma ve Bastırma",
        "category": "İşletme & Restoran Yönetimi",
        "categorySlug": "isletme-rehberi",
        "summary": "Mekanınızdaki masa düzenine göre QR kodlar üretme, masa isimlerini belirleme ve yüksek çözünürlüklü baskı formatında indirme rehberi.",
        "readTime": "3 dk okuma",
        "lastUpdated": "Eylül 2026",
        "screenshot": {
          "filename": "isletme-qr-kod-yonetimi.png",
          "caption": "Masa listesi, masa numarası oluşturma ve toplu QR kod indirme ekranı",
          "deviceType": "desktop",
          "placeholderTitle": "QR Kod Yönetim Alanı",
          "placeholderDesc": "Masa ekleme, masa adı/numarası ve yüksek kaliteli PDF/PNG QR kod indirme butonları."
        },
        "highlights": [
          "Masa 1, Bahçe 4, Teras 12 gibi mekanınıza özel masa isimleri verebilirsiniz.",
          "Matbaa ve pleksi baskı için vektörel/yüksek çözünürlüklü QR kod indirebilirsiniz.",
          "Tek bir genel menü QR kodu veya masaya özel kodlar üretebilirsiniz."
        ],
        "sections": [
          {
            "id": "karekod-uretimi",
            "title": "Masalar İçin QR Kod Nasıl Alınır?",
            "content": "İşletme panelinde Masalar sekmesine girin. Masa sayınızı belirleyin (örn: 1-50) veya Bahçe, Salon, Balkon gibi bölümler açın. QR Kodları İndir seçeneği ile tüm masaların karekodlarını tek bir ZIP dosyası veya PDF tablosu halinde anında bilgisayarınıza indirin."
          }
        ],
        "faq": [
          {
            "question": "Menüde fiyat değiştirdiğimde masadaki QR kodları yeniden bastırmam gerekir mi?",
            "answer": "Kesinlikle hayır! QR kodlar dinamiktir. Masadaki kodu bir kez bastırırsınız, menüde yaptığınız tüm değişiklikler anında koda yansır."
          }
        ],
        "keywords": [
          "restoran masa qr kod",
          "karekod menü bastırma",
          "menuland masa yönetimi",
          "dijital karekod"
        ]
      },
      {
        "slug": "fiyat-ve-kategori-guncelleme",
        "title": "Hızlı & Toplu Fiyat ve Kategori Yönetimi",
        "category": "İşletme & Restoran Yönetimi",
        "categorySlug": "isletme-rehberi",
        "summary": "Menüdeki ürün fiyatlarını tek tek veya toplu yüzde artışı/indirimi ile saniyeler içinde güncelleme, tükenen ürünleri gizleme rehberi.",
        "readTime": "3 dk okuma",
        "lastUpdated": "Eylül 2026",
        "screenshot": {
          "filename": "isletme-toplu-fiyat.png",
          "caption": "Toplu fiyat güncelleme, kategori sıralama ve stok durumu aracı",
          "deviceType": "desktop",
          "placeholderTitle": "Toplu Fiyat Güncelleme Ekranı",
          "placeholderDesc": "Kategori seçimi, yüzde artış oranı (%) ve tek tıkla tüm fiyatları güncelleme butonu."
        },
        "highlights": [
          "Maliyet artışlarında tüm kategoriye tek hamlede %10 veya %15 zam uygulayabilirsiniz.",
          "Günlük tükenen ürünleri 'Tükendi / Stok Dışı' yaparak siparişe kapatabilirsiniz.",
          "Kategorilerin ekrandaki sırasını sürükle-bırak ile dilediğiniz gibi düzenleyebilirsiniz."
        ],
        "sections": [
          {
            "id": "fiyat-guncelleme",
            "title": "Toplu Fiyat Güncelleme Nasıl Yapılır?",
            "content": "İşletme panelinde Menü > Fiyat Güncelleme aracına girin. Tüm menüyü veya seçtiğiniz bir kategoriyi (örn: İçecekler) seçip yüzde (%) artış ya da sabit tutar ekleme kuralı belirleyin. 'Uygula' dediğiniz anda tüm masalardaki dijital menü fiyatları anında güncellenir."
          }
        ],
        "faq": [
          {
            "question": "Geçici olarak biten bir ürünü menüden silmem gerekir mi?",
            "answer": "Hayır. Ürünü silmek yerine anahtarını 'Pasif' veya 'Tükendi' yapmanız yeterlidir; böylece ürün bilgileri kaybolmaz, sadece müşteriye görünmez."
          }
        ],
        "keywords": [
          "toplu menü fiyat güncelleme",
          "restoran fiyat değiştirme",
          "menü kategori yönetimi",
          "menuland fiyat"
        ]
      }
    ]
  },
  {
    "title": "Sıkça Sorulan Sorular",
    "slug": "sss",
    "description": "Hem müşterilerin hem de işletme sahiplerinin Menuland hakkında en çok merak ettiği sorular ve yanıtları.",
    "icon": "HelpCircle",
    "articles": [
      {
        "slug": "sikca-sorulan-sorular",
        "title": "Menuland Genel Sıkça Sorulan Sorular (SSS)",
        "category": "Sıkça Sorulan Sorular",
        "categorySlug": "sss",
        "summary": "Menuland mobil uygulaması, Gel Al siparişleri, PuanLand sadakat sistemi ve işletme üyeliği hakkında tüm merak edilen soruların detaylı yanıtları.",
        "readTime": "5 dk okuma",
        "lastUpdated": "Eylül 2026",
        "screenshot": {
          "filename": "mobil-gel-al-siparis.png",
          "caption": "Menuland müşteri ve işletme destek kanalları",
          "deviceType": "mobile",
          "placeholderTitle": "Sıkça Sorulan Sorular",
          "placeholderDesc": "Sistem, siparişler, ödeme ve işletme kayıt detayları."
        },
        "highlights": [
          "Müşteri ve restoranlar için en sık iletilen sorular tek çatı altında.",
          "Yapay zeka modelleri ve arama motorları için tam uyumlu soru-cevap veri şeması."
        ],
        "sections": [
          {
            "id": "musteri-sorulari",
            "title": "Müşteriler İçin Sıkça Sorulan Sorular",
            "content": "Menuland mobil uygulamasını kullanırken en çok merak edilen konular:"
          },
          {
            "id": "isletme-sorulari",
            "title": "İşletmeler İçin Sıkça Sorulan Sorular",
            "content": "Restoran ve kafe işletmecilerinin kayıt ve yönetim süreçleri hakkında merak ettikleri:"
          }
        ],
        "faq": [
          {
            "question": "Menuland nedir ve nasıl çalışır?",
            "answer": "Menuland; kullanıcıların şehirdeki popüler mekanları keşfettiği, masada temassız QR menü incelediği, Gel Al (Al-Götür) ile sıra beklemeden sipariş verdiği ve her harcamasında PuanLand sadakat puanı kazandığı çift taraflı modern bir gastronomi platformudur."
          },
          {
            "question": "Menuland mobil uygulamasını indirmek ücretsiz mi?",
            "answer": "Evet! Menuland mobil uygulaması iOS (App Store) ve Android (Google Play Store) platformlarında tamamen ücretsizdir."
          },
          {
            "question": "Gel Al siparişi verdiğimde ek ücret öder miyim?",
            "answer": "Hayır. Menuland üzerinden verilen Gel Al siparişlerinde işletmenin kendi menü fiyatları geçerlidir; ekstra servis veya komisyon ücreti yansıtılmaz."
          },
          {
            "question": "İşletmemi Menuland sistemine nasıl dahil edebilirim?",
            "answer": "İşletme sahipleri https://isletme.menuland.net adresi üzerinden veya kurumsal sitemizden başvuru formunu doldurarak aynı gün içinde dijital menülerini ve sipariş karşılama panellerini aktif edebilirler."
          },
          {
            "question": "Menuland yeni Fiyat ve Menü Yönetmeliği ile uyumlu mu?",
            "answer": "Evet, %100 uyumludur. Menuland sisteminde ürünlerin gramaj, kalori, porsiyon ve 14 zorunlu alerjen bilgileri mevzuat gerekliliklerine uygun şekilde kayıt altına alınır ve müşterilere şeffafça sunulur."
          },
          {
            "question": "Menuland ile nasıl iletişime geçebilirim?",
            "answer": "Her türlü soru ve destek talebiniz için destek@menuland.net e-posta adresinden veya web sitemizdeki iletişim formundan bize 7/24 ulaşabilirsiniz."
          }
        ],
        "keywords": [
          "menuland sss",
          "menuland nedir",
          "menuland iletişim",
          "menuland yardım",
          "menuland rehber"
        ]
      }
    ]
  }
];

export function getAllDocsArticles(): DocArticle[] {
  return docsCategories.flatMap((cat) => cat.articles);
}

export function getDocArticle(categorySlug: string, slug: string): DocArticle | undefined {
  const category = docsCategories.find((cat) => cat.slug === categorySlug);
  if (!category) return undefined;
  return category.articles.find((art) => art.slug === slug);
}
