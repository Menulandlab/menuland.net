import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import React, { forwardRef, useMemo, useState, useCallback, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';

export type Ref = BottomSheetModal;

interface Suggestion {
  item_name: string;
  item_image_url: string;
  category_id: number;
  category_name: string;
  excludeHours?: number[];
}

// Genişletilmiş Öneri Veritabanı
// excludeHours: Bu saatlerde bu öneri gösterilmez
const SUGGESTIONS_DATA = {
  food: [
    // Sabah önerileri (excludeHours: gece yok)
    { item_name: "Serpme Kahvaltı", category_id: 38, category_name: "Serpme Kahvaltı", item_image_url: "https://images.unsplash.com/photo-1533089862017-566be580c8ca?w=400", excludeHours: [21,22,23,0,1,2,3,4,5] },
    { item_name: "Menemen", category_id: 40, category_name: "Menemen & Omlet", item_image_url: "https://images.unsplash.com/photo-1594833918641-fc0218151523?w=400", excludeHours: [21,22,23,0,1,2,3,4,5] },
    { item_name: "Waffle", category_id: 59, category_name: "Waffle & Pancake", item_image_url: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400", excludeHours: [23,0,1,2,3,4] },
    { item_name: "Börek", category_id: 57, category_name: "Mantı & Hamur İşleri", item_image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400", excludeHours: [23,0,1,2,3,4] },
    // Öğle & akşam
    { item_name: "Adana Kebap", category_id: 10, category_name: "Döner & Kebap", item_image_url: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54511?w=400" },
    { item_name: "İskender", category_id: 10, category_name: "Döner & Kebap", item_image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
    { item_name: "Döner", category_id: 10, category_name: "Döner & Kebap", item_image_url: "https://images.unsplash.com/photo-1634563845899-0d322c34d400?w=400" },
    { item_name: "Lahmacun", category_id: 56, category_name: "Lahmacun & Pide", item_image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400" },
    { item_name: "Pide", category_id: 56, category_name: "Lahmacun & Pide", item_image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400" },
    { item_name: "Pizza", category_id: 3, category_name: "Pizza", item_image_url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400" },
    { item_name: "Hamburger", category_id: 43, category_name: "Burger", item_image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { item_name: "Sushi", category_id: 12, category_name: "Uzak Doğu", item_image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400" },
    { item_name: "Makarna", category_id: 48, category_name: "İtalyan Mutfağı", item_image_url: "https://images.unsplash.com/photo-1551183053-bf91b1d3116c?w=400" },
    { item_name: "Risotto", category_id: 48, category_name: "İtalyan Mutfağı", item_image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400" },
    { item_name: "Izgara Köfte", category_id: 8, category_name: "Izgara", item_image_url: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400" },
    { item_name: "Tavuk Şiş", category_id: 55, category_name: "Tavuk Ürünleri", item_image_url: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400" },
    { item_name: "Kanat", category_id: 55, category_name: "Tavuk Ürünleri", item_image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400" },
    { item_name: "Mantı", category_id: 57, category_name: "Mantı & Hamur İşleri", item_image_url: "https://images.unsplash.com/photo-1626777553634-6c0b38025255?q=80&w=400" },
    { item_name: "Ev Yemeği", category_id: 13, category_name: "Ev Yemekleri", item_image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" },
    { item_name: "Çorba", category_id: 13, category_name: "Ev Yemekleri", item_image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400" },
    { item_name: "Balık Izgara", category_id: 9, category_name: "Balık Ürünleri", item_image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400" },
    { item_name: "Balık Ekmek", category_id: 9, category_name: "Balık Ürünleri", item_image_url: "https://images.unsplash.com/photo-1529312266912-b33cf6227e2f?w=400" },
    { item_name: "Midye", category_id: 9, category_name: "Balık Ürünleri", item_image_url: "https://images.unsplash.com/photo-1610427907572-88f615555c88?w=400", excludeHours: [6,7,8,9] },
    { item_name: "Vegan Menü", category_id: 7, category_name: "Vegan & Vejetaryen", item_image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
    { item_name: "Falafel", category_id: 7, category_name: "Vegan & Vejetaryen", item_image_url: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=400" },
    { item_name: "Tost", category_id: 44, category_name: "Tost & Sandviç", item_image_url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400" },
    { item_name: "Dürüm", category_id: 47, category_name: "Wrap & Dürüm", item_image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400" },
    { item_name: "Çiğ Köfte", category_id: 76, category_name: "Çiğ Köfte", item_image_url: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400" },
    { item_name: "Kumpir", category_id: 45, category_name: "Patates & Atıştırmalık", item_image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { item_name: "Hot Dog", category_id: 46, category_name: "Hot Dog", item_image_url: "https://images.unsplash.com/photo-1612392062631-9bdd77727644?w=400" },
    { item_name: "Noodle", category_id: 12, category_name: "Uzak Doğu", item_image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400" },
    { item_name: "Taco", category_id: 49, category_name: "Meksika Mutfağı", item_image_url: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400" },
    { item_name: "Patlıcan Kebabı", category_id: 10, category_name: "Döner & Kebap", item_image_url: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54511?w=400" },
    { item_name: "Tava Böreği", category_id: 57, category_name: "Mantı & Hamur İşleri", item_image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400" },
    // Tatlılar
    { item_name: "Baklava", category_id: 6, category_name: "Tatlı", item_image_url: "https://images.unsplash.com/photo-1596752765377-5089e24f4645?w=400" },
    { item_name: "Künefe", category_id: 6, category_name: "Tatlı", item_image_url: "https://images.unsplash.com/photo-1582255740685-612089b37805?w=400" },
    { item_name: "Profiterol", category_id: 6, category_name: "Tatlı", item_image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400" },
  ],
  drink: [
    { item_name: "Türk Kahvesi", category_id: 73, category_name: "Kahve", item_image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400" },
    { item_name: "Filtre Kahve", category_id: 73, category_name: "Kahve", item_image_url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400" },
    { item_name: "Latte", category_id: 73, category_name: "Kahve", item_image_url: "https://images.unsplash.com/photo-1570968995847-d34905729db5?w=400" },
    { item_name: "Cappuccino", category_id: 73, category_name: "Kahve", item_image_url: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400" },
    { item_name: "Espresso", category_id: 73, category_name: "Kahve", item_image_url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400" },
    { item_name: "Soğuk Kahve", category_id: 16, category_name: "Zincir Kahve Dükkanları", item_image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400" },
    { item_name: "Frappe", category_id: 73, category_name: "Kahve", item_image_url: "https://images.unsplash.com/photo-1572490122747-3968bad0568c?w=400", excludeHours: [20,21,22,23,0,1,2,3,4,5] },
    { item_name: "Çay", category_id: 15, category_name: "Çay Bahçesi", item_image_url: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400" },
    { item_name: "Bitki Çayı", category_id: 15, category_name: "Çay Bahçesi", item_image_url: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400" },
    { item_name: "Smoothie", category_id: 64, category_name: "Smoothie Bowl", item_image_url: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400", excludeHours: [21,22,23,0,1,2,3,4,5] },
    { item_name: "Fresh Juice", category_id: 14, category_name: "Kafe", item_image_url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400", excludeHours: [21,22,23,0,1,2,3,4,5] },
    { item_name: "Bubble Tea", category_id: 14, category_name: "Kafe", item_image_url: "https://images.unsplash.com/photo-1534044439077-789a5e886d3e?w=400" },
    { item_name: "Milkshake", category_id: 14, category_name: "Kafe", item_image_url: "https://images.unsplash.com/photo-1572490122747-3968bad0568c?w=400" },
    { item_name: "Limonata", category_id: 14, category_name: "Kafe", item_image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400" },
    { item_name: "Ayran", category_id: 10, category_name: "Döner & Kebap", item_image_url: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400" },
    { item_name: "Şalgam", category_id: 10, category_name: "Döner & Kebap", item_image_url: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400" },
    { item_name: "Meyve Suyu", category_id: 14, category_name: "Kafe", item_image_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400" },
    { item_name: "Soda", category_id: 14, category_name: "Kafe", item_image_url: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400" },
    { item_name: "Salep", category_id: 15, category_name: "Çay Bahçesi", item_image_url: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400", excludeHours: [10,11,12,13,14,15,16,17,18] },
    { item_name: "Boza", category_id: 15, category_name: "Çay Bahçesi", item_image_url: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400", excludeHours: [6,7,8,9,10,11,12,13] },
  ]
};

const SuggestionCard: React.FC<{
  item: Suggestion;
  onPress: (item: Suggestion) => void;
  label?: string;
}> = ({ item, onPress, label }) => (
  <TouchableOpacity style={styles.suggestionCard} onPress={() => onPress(item)}>
    <Image
      source={{ uri: item.item_image_url }}
      style={styles.suggestionImage}
      contentFit="cover"
      cachePolicy="memory"
      transition={200}
    />
    <View style={styles.suggestionTextContainer}>
      {label ? <Text style={styles.suggestionLabel}>{label}</Text> : null}
      <Text style={styles.suggestionItemName}>{item.item_name}</Text>
      <Text style={styles.suggestionCategory}>{item.category_name} · Mekanları Gör →</Text>
    </View>
  </TouchableOpacity>
);

const SuggestionSheet = forwardRef<Ref>((props, ref) => {
  const snapPoints = useMemo(() => ['55%'], []);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [comboSuggestion, setComboSuggestion] = useState<{ food: Suggestion; drink: Suggestion } | null>(null);
  const [activeMode, setActiveMode] = useState<'food' | 'drink' | 'combo' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const lastShownRef = useRef<{ food: string[]; drink: string[] }>({ food: [], drink: [] });

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    []
  );

  const pickRandom = (type: 'food' | 'drink'): Suggestion => {
    const currentHour = new Date().getHours();
    const list = type === 'food' ? SUGGESTIONS_DATA.food : SUGGESTIONS_DATA.drink;
    // Saate göre uygunsuz önerileri çıkar
    const available = list.filter(
      (item) => !item.excludeHours || !item.excludeHours.includes(currentHour)
    );
    // Son 3 gösterileni hariç tut (aynı öneri tekrar gelmesin)
    const lastShown = lastShownRef.current[type];
    const pool = available.filter((item) => !lastShown.includes(item.item_name));
    const finalPool = pool.length > 0 ? pool : available;
    const picked = finalPool[Math.floor(Math.random() * finalPool.length)];
    // Son gösterilenleri güncelle (max 3)
    lastShownRef.current[type] = [...lastShown.slice(-2), picked.item_name];
    return picked;
  };

  const fetchSuggestion = (type: 'food' | 'drink') => {
    setIsLoading(true);
    setSuggestion(null);
    setComboSuggestion(null);
    setActiveMode(type);
    setTimeout(() => {
      setSuggestion(pickRandom(type));
      setIsLoading(false);
    }, 500);
  };

  const fetchCombo = () => {
    setIsLoading(true);
    setSuggestion(null);
    setComboSuggestion(null);
    setActiveMode('combo');
    setTimeout(() => {
      setComboSuggestion({ food: pickRandom('food'), drink: pickRandom('drink') });
      setIsLoading(false);
    }, 500);
  };

  const handleRefresh = () => {
    if (activeMode === 'combo') fetchCombo();
    else if (activeMode) fetchSuggestion(activeMode);
  };

  const handleSuggestionPress = (item: Suggestion) => {
    (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    router.push({
      pathname: `/(details)/businesses-by-category/${item.category_id}`,
      params: { name: item.category_name },
    });
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: Colors.background }}
      handleIndicatorStyle={{ backgroundColor: Colors.textLight }}
      onDismiss={() => {
        setSuggestion(null);
        setComboSuggestion(null);
        setActiveMode(null);
      }}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Kararsız mı Kaldın?</Text>
        <Text style={styles.subtitle}>Sana özel bir önerimiz var</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.suggestionButton, activeMode === 'food' && styles.activeButton, isLoading && styles.buttonDisabled]}
            onPress={() => fetchSuggestion('food')}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Ne Yesek?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.suggestionButton, activeMode === 'drink' && styles.activeButton, isLoading && styles.buttonDisabled]}
            onPress={() => fetchSuggestion('drink')}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Ne İçsek?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.comboButton, activeMode === 'combo' && styles.activeComboButton, isLoading && styles.buttonDisabled]}
          onPress={fetchCombo}
          disabled={isLoading}
        >
          <Text style={styles.comboButtonText}>İkisi Birden Öner</Text>
        </TouchableOpacity>

        <View style={styles.resultContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : comboSuggestion ? (
            <View style={styles.comboResultContainer}>
              <SuggestionCard item={comboSuggestion.food} onPress={handleSuggestionPress} label="Yemek" />
              <SuggestionCard item={comboSuggestion.drink} onPress={handleSuggestionPress} label="İçecek" />
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Text style={styles.refreshText}>Başka Öneri</Text>
              </TouchableOpacity>
            </View>
          ) : suggestion ? (
            <View style={styles.singleResultContainer}>
              <SuggestionCard item={suggestion} onPress={handleSuggestionPress} />
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Text style={styles.refreshText}>Başka Öneri</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

SuggestionSheet.displayName = "SuggestionSheet";

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
    marginBottom: 10
  },
  suggestionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeButton: {
    opacity: 0.82,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600'
  },
  comboButton: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  activeComboButton: {
    backgroundColor: Colors.primary + '28',
  },
  comboButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  singleResultContainer: {
    width: '100%',
  },
  comboResultContainer: {
    width: '100%',
    gap: 8,
  },
  refreshButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary + '12',
  },
  refreshText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: Colors.lightGray,
  },
  suggestionTextContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  suggestionLabel: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  suggestionItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4
  },
  suggestionCategory: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600'
  }
});

export default SuggestionSheet;