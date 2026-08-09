import { Alert } from 'react-native';

/**
 * Basic notification utilities
 * Push notifications removed - using only local alerts
 */

/**
 * Show a simple alert notification
 */
export function showAlert(title: string, message: string, buttons?: any[]) {
  Alert.alert(title, message, buttons);
}

/**
 * Show success message
 */
export function showSuccess(message: string) {
  Alert.alert('Başarılı', message, [{ text: 'Tamam' }]);
}

/**
 * Show error message
 */
export function showError(message: string) {
  Alert.alert('Hata', message, [{ text: 'Tamam' }]);
}

/**
 * Show confirmation dialog
 */
export function showConfirmation(
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel?: () => void
) {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'İptal',
        onPress: onCancel,
        style: 'cancel',
      },
      {
        text: 'Onayla',
        onPress: onConfirm,
      },
    ]
  );
}