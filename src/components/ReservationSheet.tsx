import React, { forwardRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { createReservation } from '../api/reservationService';
import { useAuth } from '../context/AuthContext';
import { formatDateForBackend, validateReservationDate } from '../utils/dateFormatter';

interface ReservationSheetProps {
  businessId: number;
  businessName: string;
}

/**
 * Rezervasyon formu bottom sheet komponenti
 * İşletme detay sayfasında kullanılır
 */
const ReservationSheet = forwardRef<BottomSheetModal, ReservationSheetProps>(
  ({ businessId, businessName }, ref) => {
    const { user } = useAuth();
    const snapPoints = useMemo(() => ['85%', '95%'], []);

    // Form state
    const [customerName, setCustomerName] = useState(user?.name || '');
    const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [personCount, setPersonCount] = useState('2');
    const [customerNote, setCustomerNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = useMemo(() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }, []);

    const maxDate = useMemo(() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d;
    }, []);

    const formatDisplayDate = (date: Date) =>
      date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const formatDisplayTime = (date: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    // Reset form
    const resetForm = useCallback(() => {
      setCustomerName(user?.name || '');
      setCustomerPhone(user?.phone || '');
      setSelectedDate(null);
      setSelectedTime(null);
      setPersonCount('2');
      setCustomerNote('');
      setIsSubmitting(false);
    }, [user]);

    // Backdrop component
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    // Handle dismiss
    const handleDismiss = useCallback(() => {
      resetForm();
    }, [resetForm]);

    // Validate form
    const validateForm = (): string | null => {
      if (!customerName.trim()) {
        return 'Lütfen adınızı giriniz';
      }
      if (!customerPhone.trim()) {
        return 'Lütfen telefon numaranızı giriniz';
      }
      const phoneDigits = customerPhone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        return 'Geçerli bir telefon numarası giriniz';
      }
      if (!selectedDate) {
        return 'Lütfen tarih seçiniz';
      }
      if (!selectedTime) {
        return 'Lütfen saat seçiniz';
      }

      const combined = new Date(selectedDate);
      combined.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      if (combined <= new Date()) {
        return 'Geçmiş bir tarih/saat seçemezsiniz';
      }

      const count = parseInt(personCount);
      if (isNaN(count) || count < 1 || count > 50) {
        return 'Kişi sayısı 1-50 arasında olmalıdır';
      }

      return null;
    };

    // Handle submit
    const handleSubmit = async () => {
      const error = validateForm();
      if (error) {
        Alert.alert('Hata', error);
        return;
      }

      setIsSubmitting(true);

      try {
        const combined = new Date(selectedDate!);
        combined.setHours(selectedTime!.getHours(), selectedTime!.getMinutes(), 0, 0);

        const pad = (n: number) => String(n).padStart(2, '0');
        const dateTimeStr = `${combined.getFullYear()}-${pad(combined.getMonth() + 1)}-${pad(combined.getDate())} ${pad(combined.getHours())}:${pad(combined.getMinutes())}:00`;
        const formattedDateTime = formatDateForBackend(dateTimeStr);

        const response = await createReservation({
          business_id: businessId,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          reservation_time: formattedDateTime,
          person_count: parseInt(personCount),
          customer_note: customerNote.trim() || undefined,
          user_id: user?.id,
        });

        if (response.success) {
          Alert.alert(
            'Başarılı',
            'Rezervasyonunuz alındı. İşletme size geri dönüş yapacaktır.\n\n⭐ Rezervasyonunuz onaylandığında PuanLand puanı kazanacaksınız!',
            [
              {
                text: 'Tamam',
                onPress: () => {
                  if (ref && typeof ref !== 'function') {
                    ref.current?.dismiss();
                  }
                  resetForm();
                },
              },
            ]
          );
        } else {
          Alert.alert('Hata', response.message || 'Rezervasyon oluşturulamadı.');
        }
      } catch (error: any) {
        console.error('Rezervasyon hatası:', error);
        Alert.alert('Hata', error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <>
        <BottomSheetModal
          ref={ref}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          onDismiss={handleDismiss}
          enablePanDownToClose
          handleIndicatorStyle={styles.indicator}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
        >
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="calendar" size={28} color={Colors.primary} />
            <Text style={styles.title}>Rezervasyon Yap</Text>
            <Text style={styles.businessName}>{businessName}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Ad Soyad */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Ad Soyad <Text style={styles.required}>*</Text>
              </Text>
              <BottomSheetTextInput
                style={styles.input}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Adınız ve soyadınız"
                placeholderTextColor={Colors.gray}
                autoCapitalize="words"
              />
            </View>

            {/* Telefon */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Telefon <Text style={styles.required}>*</Text>
              </Text>
              <BottomSheetTextInput
                style={styles.input}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="5XX XXX XX XX"
                placeholderTextColor={Colors.gray}
                keyboardType="phone-pad"
              />
            </View>

            {/* Tarih ve Saat */}
            <View style={styles.row}>
              {/* Tarih Seçici */}
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  Tarih <Text style={styles.required}>*</Text>
                </Text>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={selectedDate || today}
                    mode="date"
                    display="default"
                    minimumDate={today}
                    maximumDate={maxDate}
                    locale="tr-TR"
                    onChange={(_: DateTimePickerEvent, date?: Date) => {
                      if (date) setSelectedDate(date);
                    }}
                    style={{ alignSelf: 'flex-start', marginLeft: -10 }}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      setShowTimePicker(false);
                      setShowDatePicker(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar-outline" size={17} color={Colors.primary} />
                    <Text style={[styles.pickerText, !selectedDate && styles.pickerPlaceholder]}>
                      {selectedDate ? formatDisplayDate(selectedDate) : 'Tarih Seç'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Saat Seçici */}
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  Saat <Text style={styles.required}>*</Text>
                </Text>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={selectedTime || new Date()}
                    mode="time"
                    display="default"
                    locale="tr-TR"
                    onChange={(_: DateTimePickerEvent, date?: Date) => {
                      if (date) setSelectedTime(date);
                    }}
                    style={{ alignSelf: 'flex-start', marginLeft: -10 }}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => {
                      setShowDatePicker(false);
                      setShowTimePicker(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="time-outline" size={17} color={Colors.primary} />
                    <Text style={[styles.pickerText, !selectedTime && styles.pickerPlaceholder]}>
                      {selectedTime ? formatDisplayTime(selectedTime) : 'Saat Seç'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Android Date Picker - system dialog */}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={selectedDate || today}
                mode="date"
                display="default"
                minimumDate={today}
                maximumDate={maxDate}
                onChange={(_: DateTimePickerEvent, date?: Date) => {
                  setShowDatePicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            {Platform.OS === 'android' && showTimePicker && (
              <DateTimePicker
                value={selectedTime || new Date()}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={(_: DateTimePickerEvent, date?: Date) => {
                  setShowTimePicker(false);
                  if (date) setSelectedTime(date);
                }}
              />
            )}

            {/* Kişi Sayısı */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Kişi Sayısı <Text style={styles.required}>*</Text>
              </Text>
              <BottomSheetTextInput
                style={styles.input}
                value={personCount}
                onChangeText={setPersonCount}
                placeholder="1-50 arası"
                placeholderTextColor={Colors.gray}
                keyboardType="number-pad"
              />
            </View>

            {/* Not */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Not (Opsiyonel)</Text>
              <BottomSheetTextInput
                style={[styles.input, styles.textArea]}
                value={customerNote}
                onChangeText={setCustomerNote}
                placeholder="Özel bir isteğiniz varsa buraya yazabilirsiniz"
                placeholderTextColor={Colors.gray}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>
                Rezervasyonunuz işletme tarafından onaylandıktan sonra size bilgi verilecektir. Profil - Rezervasyonlarım alanını kontrol ediniz.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Gönderiliyor...' : 'Rezervasyon Yap'}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
      </>
    );
  }
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  indicator: {
    backgroundColor: Colors.gray,
    width: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  businessName: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.primary,
  },
  input: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 70,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pickerText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  pickerPlaceholder: {
    color: Colors.gray,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  iosPickerCancel: {
    fontSize: 16,
    color: Colors.gray,
  },
  iosPickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  iosPicker: {
    height: 215,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

ReservationSheet.displayName = 'ReservationSheet';

export default ReservationSheet;
