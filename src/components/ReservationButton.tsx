import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../constants/Colors';

interface ReservationButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

/**
 * Rezervasyon butonu komponenti
 * İşletme detay sayfasında kullanılır
 * 
 * NOT: Bu buton HER ZAMAN gösterilir.
 * accepts_reservations kontrolü tıklandığında yapılır.
 */
const ReservationButton: React.FC<ReservationButtonProps> = ({
  onPress,
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        REZERVASYON YAP
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    flex: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: Colors.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  textDisabled: {
    color: Colors.gray,
  },
});

export default ReservationButton;
