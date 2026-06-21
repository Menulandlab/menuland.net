import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { suggestionEngine, SuggestionOptions, FoodSuggestion } from '../utils/suggestionEngine';
import { useLocation } from '../context/LocationContext';

interface SuggestionModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'food' | 'drink';
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ visible, onClose, type }) => {
  const { location } = useLocation();
  const [currentSuggestion, setCurrentSuggestion] = useState<FoodSuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestion = () => {
    setLoading(true);
    
    const currentHour = new Date().getHours();
    let timeOfDay: SuggestionOptions['timeOfDay'];
    
    if (currentHour < 12) timeOfDay = 'morning';
    else if (currentHour < 17) timeOfDay = 'afternoon';
    else if (currentHour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const options: SuggestionOptions = {
      userLocation: { 
        lat: typeof location.latitude === 'string' ? parseFloat(location.latitude) : (location.latitude || 0), 
        lon: typeof location.longitude === 'string' ? parseFloat(location.longitude) : (location.longitude || 0) 
      },
      timeOfDay,
      // İleride hava durumu API'si eklenebilir
      weather: 'sunny'
    };

    setTimeout(() => {
      const suggestion = suggestionEngine.getSuggestion(type, options);
      setCurrentSuggestion(suggestion);
      setLoading(false);
    }, 800); // Biraz suspense için
  };

  React.useEffect(() => {
    if (visible) {
      generateSuggestion();
    }
  }, [visible, type]);

  const title = type === 'food' ? '🍽️ Ne Yesek?' : '🥤 Ne İçsek?';
  const subtitle = type === 'food' ? 'Bugün için özel yemek önerim:' : 'Bugün için özel içecek önerim:';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={50} style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>🎲 Düşünüyorum...</Text>
            </View>
          ) : currentSuggestion ? (
            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionIcon}>{currentSuggestion.icon}</Text>
              <Text style={styles.suggestionTitle}>{currentSuggestion.suggestion}</Text>
              <Text style={styles.suggestionCategory}>{currentSuggestion.category}</Text>
              <Text style={styles.suggestionDescription}>{currentSuggestion.description}</Text>
              
              <TouchableOpacity 
                style={styles.findButton}
                onPress={() => {
                  // Burada kategoriye göre işletme arama sayfasına yönlendir
                  onClose();
                }}
              >
                <Ionicons name="search" size={20} color="white" />
                <Text style={styles.findButtonText}>Yakınımda Bul</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity style={styles.regenerateButton} onPress={generateSuggestion}>
            <Ionicons name="refresh" size={20} color={Colors.primary} />
            <Text style={styles.regenerateText}>Başka Öneri</Text>
          </TouchableOpacity>

          <View style={styles.tipContainer}>
            <Ionicons name="bulb-outline" size={16} color={Colors.textLight} />
            <Text style={styles.tipText}>
              {type === 'food' 
                ? 'İpucu: Hava durumu ve saate göre öneriler değişir!' 
                : 'İpucu: Günün farklı saatlerinde farklı içecekler öneriyorum!'
              }
            </Text>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 320,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  suggestionCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary + '20',
  },
  suggestionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  suggestionCategory: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  findButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  findButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
    gap: 6,
    marginBottom: 16,
  },
  regenerateText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
  },
});

export default SuggestionModal;
