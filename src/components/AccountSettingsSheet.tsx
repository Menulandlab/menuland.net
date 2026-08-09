import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../api/userService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AccountSettingsSheet: React.FC<Props> = ({ visible, onClose }) => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');
  const [editedBirthDate, setEditedBirthDate] = useState(user?.birth_date || '');
  const [editedGender, setEditedGender] = useState(user?.gender || '');
  const [editedCity, setEditedCity] = useState(user?.city || '');
  const [editedBio, setEditedBio] = useState(user?.bio || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedName(user.name || '');
      setEditedEmail(user.email || '');
      setEditedPhone(user.phone || '');
      setEditedBirthDate(user.birth_date || '');
      setEditedGender(user.gender || '');
      setEditedCity(user.city || '');
      setEditedBio(user.bio || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('Hata', 'Ad Soyad alanı zorunludur.');
      return;
    }

    if (!editedEmail.trim()) {
      Alert.alert('Hata', 'E-posta alanı zorunludur.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedEmail.trim())) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
      return;
    }

    setIsLoading(true);
    
    let updateData: any = {
      name: editedName.trim(),
      email: editedEmail.trim(),
    };

    // Sadece değişen alanları gönder
    if (editedPhone.trim() !== (user?.phone || '')) {
      updateData.phone = editedPhone.trim();
    }
    if (editedBirthDate.trim() !== (user?.birth_date || '')) {
      updateData.birth_date = editedBirthDate.trim();
    }
    if (editedGender !== (user?.gender || '')) {
      updateData.gender = editedGender;
    }
    if (editedCity.trim() !== (user?.city || '')) {
      updateData.city = editedCity.trim();
    }
    if (editedBio.trim() !== (user?.bio || '')) {
      updateData.bio = editedBio.trim();
    }

    try {
      console.log('Sending update data:', updateData);
      
      // Use the userService which handles local storage fallback
      const response = await updateUserProfile(updateData);
      console.log('Profile update response:', response);
      
      // Update local user data in context
      if (response.data) {
        setUser(response.data);
        setIsEditing(false);
        Alert.alert('Başarılı', response.message || 'Profil bilgileriniz güncellendi.');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      let errorMessage = 'Profil güncellenirken bir hata oluştu.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setEditedEmail(user?.email || '');
    setEditedPhone(user?.phone || '');
    setEditedBirthDate(user?.birth_date || '');
    setEditedGender(user?.gender || '');
    setEditedCity(user?.city || '');
    setEditedBio(user?.bio || '');
    setIsEditing(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Hesap Bilgileri</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profil Başlığı */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.username}>@{user?.username}</Text>
              <Text style={styles.userRole}>
                {user?.role === 'business' ? 'İşletme Hesabı' : 'Bireysel Hesap'}
              </Text>
            </View>

            {/* Form Alanları */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ad Soyad *</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={editedName}
                onChangeText={setEditedName}
                editable={isEditing}
                placeholder="Ad Soyad"
                clearButtonMode="while-editing"
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>E-posta *</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={editedEmail}
                onChangeText={setEditedEmail}
                editable={isEditing}
                placeholder="E-posta"
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
                clearButtonMode="while-editing"
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={editedPhone}
                onChangeText={setEditedPhone}
                editable={isEditing}
                placeholder="Telefon numarası"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                clearButtonMode="while-editing"
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Doğum Tarihi</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={editedBirthDate}
                onChangeText={setEditedBirthDate}
                editable={isEditing}
                placeholder="YYYY-MM-DD"
                clearButtonMode="while-editing"
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cinsiyet</Text>
              {isEditing ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={editedGender}
                    onValueChange={(itemValue) => setEditedGender(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Seçiniz" value="" />
                    <Picker.Item label="Erkek" value="male" />
                    <Picker.Item label="Kadın" value="female" />
                    <Picker.Item label="Belirtmek istemiyorum" value="other" />
                  </Picker>
                </View>
              ) : (
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={editedGender === 'male' ? 'Erkek' : editedGender === 'female' ? 'Kadın' : editedGender === 'other' ? 'Belirtmek istemiyorum' : ''}
                  editable={false}
                  placeholder="Cinsiyet"
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Şehir</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={editedCity}
                onChangeText={setEditedCity}
                editable={isEditing}
                placeholder="Şehir"
                clearButtonMode="while-editing"
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Hakkımda</Text>
              <TextInput
                style={[styles.textArea, !isEditing && styles.inputDisabled]}
                value={editedBio}
                onChangeText={setEditedBio}
                editable={isEditing}
                placeholder="Kendiniz hakkında kısa bir açıklama..."
                multiline
                numberOfLines={4}
                returnKeyType="default"
              />
            </View>

            {/* Butonlar */}
            {isEditing ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={20} color={Colors.white} style={styles.buttonIcon} />
                <Text style={styles.editButtonText}>Bilgileri Düzenle</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: Colors.textLight,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: Colors.textLight,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: Colors.primary,
    marginTop: 30,
    marginBottom: 40,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    marginLeft: 10,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default AccountSettingsSheet;
