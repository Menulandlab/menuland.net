import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { useRouter } from 'expo-router';

const PRIVACY_CONSENT_KEY = 'privacy_consent_accepted';

interface PrivacyConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(visible);
  const [infoAcknowledged, setInfoAcknowledged] = useState(false);
  const [explicitConsent, setExplicitConsent] = useState(false);

  // Modal görünürlüğünü props ile senkronize et
  useEffect(() => {
    setModalVisible(visible);
  }, [visible]);

  const handleAccept = () => {
    onAccept();
    // Burada ileride explicitConsent değerini de backend'e gönderebiliriz
  };

  const handleDecline = () => {
    Alert.alert(
      'Gizlilik Onayı Gerekli',
      'Uygulamayı kullanabilmek için gizlilik politikamızı ve kullanım şartlarımızı kabul etmeniz gerekmektedir.',
      [
        {
          text: 'Politikaları İncele',
          onPress: () => handleLegalDocumentNavigation('/privacy-policy'),
        },
        {
          text: 'Tamam',
          style: 'cancel',
        },
      ]
    );
  };

  const handleLegalDocumentNavigation = (route: string) => {
    Alert.alert(
      'Yasal Dokümana Yönlendiriliyor',
      'Yasal dokümanı inceledikten sonra buraya geri döneceksiniz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Devam Et',
          onPress: () => {
            // Önce modalı kapat
            setModalVisible(false);
            
            // Hemen navigation yap
            setTimeout(() => {
              router.push(route as any);
            }, 50);
          },
        },
      ]
    );
  };

  return (
    <Modal visible={modalVisible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.modalContainer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={60} color={Colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Gizlilik ve Güvenlik</Text>
              <Text style={styles.modalSubtitle}>
                Size daha iyi hizmet verebilmek için bazı bilgilere ihtiyacımız var
              </Text>
            </View>

          <View style={styles.contentSection}>
            <View style={styles.dataTypeContainer}>
              <View style={styles.dataTypeHeader}>
                <Ionicons name="location" size={24} color={Colors.primary} />
                <Text style={styles.dataTypeTitle}>Konum Bilgileri</Text>
              </View>
              <Text style={styles.dataTypeDescription}>
                Yakınınızdaki işletmeleri gösterebilmek ve hava durumu önerilerinde bulunabilmek için konum bilginizi kullanırız.
              </Text>
            </View>

            <View style={styles.dataTypeContainer}>
              <View style={styles.dataTypeHeader}>
                <Ionicons name="person" size={24} color={Colors.primary} />
                <Text style={styles.dataTypeTitle}>Hesap Bilgileri</Text>
              </View>
              <Text style={styles.dataTypeDescription}>
                Ad, e-posta ve tercihlerinizi hatırlamak için hesap bilgilerinizi güvenli şekilde saklarız.
              </Text>
            </View>

            <View style={styles.dataTypeContainer}>
              <View style={styles.dataTypeHeader}>
                <Ionicons name="analytics" size={24} color={Colors.primary} />
                <Text style={styles.dataTypeTitle}>Kullanım Verileri</Text>
              </View>
              <Text style={styles.dataTypeDescription}>
                Uygulamayı iyileştirmek için anonim kullanım istatistikleri toplarız.
              </Text>
            </View>

            <View style={styles.legalSection}>
              <Text style={styles.legalTitle}>Yasal Dokümanlar</Text>
              <View style={styles.legalLinksContainer}>
                <TouchableOpacity
                  style={styles.legalLink}
                  onPress={() => handleLegalDocumentNavigation('/privacy-policy')}
                >
                  <Ionicons name="document-text" size={20} color={Colors.primary} />
                  <Text style={styles.legalLinkText}>Gizlilik Politikası</Text>
                  <Ionicons name="open-outline" size={16} color={Colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.legalLink}
                  onPress={() => handleLegalDocumentNavigation('/terms-of-service')}
                >
                  <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                  <Text style={styles.legalLinkText}>Kullanım Şartları</Text>
                  <Ionicons name="open-outline" size={16} color={Colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.legalLink}
                  onPress={() => handleLegalDocumentNavigation('/kvkk')}
                >
                  <Ionicons name="lock-closed" size={20} color={Colors.primary} />
                  <Text style={styles.legalLinkText}>KVKK Bildirimi</Text>
                  <Ionicons name="open-outline" size={16} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.consentSection}>
              <View style={styles.checkboxRow}>
                <TouchableOpacity 
                  style={styles.checkbox} 
                  onPress={() => setInfoAcknowledged(!infoAcknowledged)}
                >
                  <Ionicons 
                    name={infoAcknowledged ? 'checkbox' : 'square-outline'} 
                    size={24} 
                    color={infoAcknowledged ? Colors.primary : Colors.textLight} 
                  />
                </TouchableOpacity>
                <Text style={styles.consentText}>
                  <Text style={styles.bold}>Aydınlatma Metni'ni</Text> okudum ve kişisel verilerimin işlenmesine ilişkin bilgilendirildim. (Zorunlu)
                </Text>
              </View>

              <View style={[styles.checkboxRow, { marginTop: 16 }]}>
                <TouchableOpacity 
                  style={styles.checkbox} 
                  onPress={() => setExplicitConsent(!explicitConsent)}
                >
                  <Ionicons 
                    name={explicitConsent ? 'checkbox' : 'square-outline'} 
                    size={24} 
                    color={explicitConsent ? Colors.primary : Colors.textLight} 
                  />
                </TouchableOpacity>
                <Text style={styles.consentText}>
                  Konum verilerimin işlenmesine ve <Text style={styles.bold}>Açık Rıza Metni</Text> kapsamında veri işlenmesine onay veriyorum. (İsteğe Bağlı)
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
            <Text style={styles.declineButtonText}>Reddet</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.acceptButton, !infoAcknowledged && styles.acceptButtonDisabled]} 
            onPress={handleAccept}
            disabled={!infoAcknowledged}
          >
            <Text style={styles.acceptButtonText}>Kabul Et ve Devam Et</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  </Modal>
  );
};

export const usePrivacyConsent = () => {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    checkConsentStatus();
  }, []);

  const checkConsentStatus = async () => {
    try {
      const consent = await AsyncStorage.getItem(PRIVACY_CONSENT_KEY);
      setConsentGiven(consent === 'true');
    } catch (error) {
      console.error('Error checking consent status:', error);
      setConsentGiven(false);
    }
  };

  const giveConsent = async () => {
    try {
      await AsyncStorage.setItem(PRIVACY_CONSENT_KEY, 'true');
      setConsentGiven(true);
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  };

  const revokeConsent = async () => {
    try {
      await AsyncStorage.removeItem(PRIVACY_CONSENT_KEY);
      setConsentGiven(false);
    } catch (error) {
      console.error('Error revoking consent:', error);
    }
  };

  return {
    consentGiven,
    giveConsent,
    revokeConsent,
    checkConsentStatus,
  };
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  modalHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  contentSection: {
    paddingHorizontal: 24,
  },
  dataTypeContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.backgroundLight,
  },
  dataTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  dataTypeDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  legalSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  legalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  legalLinksContainer: {
    gap: 8,
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.backgroundLight,
  },
  legalLinkText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  consentSection: {
    backgroundColor: Colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  consentText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 24,
    gap: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundLight,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.textLight,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  acceptButtonDisabled: {
    backgroundColor: Colors.lightGray,
    opacity: 0.7,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    marginTop: 2,
  },
});

export default PrivacyConsentModal;
