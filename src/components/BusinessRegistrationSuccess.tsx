// src/components/BusinessRegistrationSuccess.tsx
// İşletme kaydı başarılı sonrası admin panel bilgileri

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { businessOwnerService } from '../api/businessOwnerService';

interface Props {
  registrationData: {
    id: number;
    registration_number: string;
    estimated_approval_time: string;
    admin_panel_info?: {
      panel_url: string;
      temp_password: string;
      login_instructions: string;
    };
  };
  ownerEmail: string;
  onClose: () => void;
}

export default function BusinessRegistrationSuccess({ 
  registrationData, 
  ownerEmail, 
  onClose 
}: Props) {
  
  const { admin_panel_info } = registrationData;

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Kopyalandı', `${label} panoya kopyalandı.`);
  };

  const openAdminPanel = () => {
    const url = admin_panel_info?.panel_url || businessOwnerService.getAdminPanelUrl();
    Linking.openURL(url);
  };

  const sendEmailInstructions = () => {
    Alert.alert(
      'Email Talimatları',
      'Admin panel giriş bilgileri email adresinize gönderilecek. Email\'inizi kontrol etmeyi unutmayın.',
      [
        { text: 'Tamam' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={60} color={Colors.success} />
        </View>
        <Text style={styles.successTitle}>Başvurunuz Alındı!</Text>
        <Text style={styles.successSubtitle}>
          İşletme kaydınız başarıyla oluşturuldu
        </Text>
      </View>

      {/* Registration Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Başvuru Numarası</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{registrationData.registration_number}</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(registrationData.registration_number, 'Başvuru numarası')}
            >
              <Ionicons name="copy-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Tahmini Onay Süresi</Text>
          <Text style={styles.infoValue}>{registrationData.estimated_approval_time}</Text>
        </View>
      </View>

      {/* Admin Panel Section */}
      {admin_panel_info && (
        <View style={styles.adminSection}>
          <View style={styles.adminHeader}>
            <Ionicons name="settings-outline" size={24} color={Colors.primary} />
            <Text style={styles.adminTitle}>Yönetim Paneli Erişimi</Text>
          </View>
          
          <Text style={styles.adminDescription}>
            İşletmeniz onaylandıktan sonra aşağıdaki bilgilerle yönetim panelinize giriş yapabilirsiniz:
          </Text>

          <View style={styles.credentialsCard}>
            <View style={styles.credentialRow}>
              <Text style={styles.credentialLabel}>Email:</Text>
              <View style={styles.credentialValue}>
                <Text style={styles.credentialText}>{ownerEmail}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(ownerEmail, 'Email adresi')}
                >
                  <Ionicons name="copy-outline" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.credentialRow}>
              <Text style={styles.credentialLabel}>Geçici Şifre:</Text>
              <View style={styles.credentialValue}>
                <Text style={styles.credentialText}>{admin_panel_info.temp_password}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(admin_panel_info.temp_password, 'Geçici şifre')}
                >
                  <Ionicons name="copy-outline" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Önemli Notlar:</Text>
            <Text style={styles.instructionsText}>
              • İlk girişte şifrenizi değiştirmeniz önerilir{'\n'}
              • Panel erişimi işletme onayı sonrası aktif olacaktır{'\n'}
              • Giriş bilgileri email adresinize de gönderilecektir
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.panelButton} onPress={openAdminPanel}>
              <Ionicons name="globe-outline" size={20} color="white" />
              <Text style={styles.panelButtonText}>Yönetim Panelini Aç</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.emailButton} onPress={sendEmailInstructions}>
              <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              <Text style={styles.emailButtonText}>Email Gönder</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Next Steps */}
      <View style={styles.nextStepsSection}>
        <Text style={styles.nextStepsTitle}>Sonraki Adımlar</Text>
        <View style={styles.stepsList}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Başvurunuz 1-2 iş günü içinde incelenecek</Text>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Onay sonrası yönetim paneliniz aktif hale gelecek</Text>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Menü ve işletme bilgilerinizi düzenleyebilirsiniz</Text>
          </View>
        </View>
      </View>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Ana Sayfaya Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIcon: {
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  adminSection: {
    backgroundColor: Colors.primary + '08',
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  adminDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 20,
  },
  credentialsCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  credentialLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
    width: 100,
  },
  credentialValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  credentialText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 10,
  },
  instructionsCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  panelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  panelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  emailButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  nextStepsSection: {
    marginBottom: 30,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    flex: 1,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
