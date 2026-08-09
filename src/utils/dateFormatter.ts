/**
 * Tarih ve saat formatlamaları
 * Rezervasyon sistemi için özelleştirilmiş
 */

/**
 * Backend'e gönderilecek tarih formatı
 * Format: YYYY-MM-DD HH:MM:SS
 * 
 * @param date - JavaScript Date objesi veya date string
 * @returns Backend formatında string
 * @example formatDateForBackend(new Date()) => "2026-01-12 14:30:00"
 */
export function formatDateForBackend(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Kullanıcıya gösterilecek tarih formatı
 * Format: 14 Şubat 2026, 19:30
 * 
 * @param dateString - Backend'den gelen tarih string'i
 * @returns Türkçe okunabilir format
 */
export function formatDateForDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
}

/**
 * Sadece tarih (gün-ay-yıl)
 * Format: 14 Şubat 2026
 */
export function formatDateOnly(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Sadece saat
 * Format: 19:30
 */
export function formatTimeOnly(dateString: string): string {
  try {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Tarihin geçmişte olup olmadığını kontrol et
 */
export function isPastDate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  } catch (error) {
    return false;
  }
}

/**
 * Tarihin gelecekte olup olmadığını kontrol et
 */
export function isFutureDate(dateString: string): boolean {
  return !isPastDate(dateString);
}

/**
 * Göreli zaman (Örn: "2 saat sonra", "Dün")
 */
export function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 0) {
      // Geçmiş
      if (Math.abs(diffMins) < 60) return `${Math.abs(diffMins)} dakika önce`;
      if (Math.abs(diffHours) < 24) return `${Math.abs(diffHours)} saat önce`;
      if (Math.abs(diffDays) === 1) return 'Dün';
      return `${Math.abs(diffDays)} gün önce`;
    } else {
      // Gelecek
      if (diffMins < 60) return `${diffMins} dakika sonra`;
      if (diffHours < 24) return `${diffHours} saat sonra`;
      if (diffDays === 0) return 'Bugün';
      if (diffDays === 1) return 'Yarın';
      return `${diffDays} gün sonra`;
    }
  } catch (error) {
    return dateString;
  }
}

/**
 * Rezervasyon tarihini validate et
 * Geçmişte olamaz, format doğru olmalı
 * 
 * @param dateTimeString - Format: "YYYY-MM-DD HH:MM" veya "YYYY-MM-DD HH:MM:SS"
 * @returns Validasyon sonucu
 */
export function validateReservationDate(dateTimeString: string): {
  isValid: boolean;
  message?: string;
} {
  try {
    // Format kontrolü
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/;
    if (!regex.test(dateTimeString)) {
      return {
        isValid: false,
        message: 'Geçersiz tarih formatı. Format: YYYY-MM-DD HH:MM',
      };
    }

    // Tarih objesi oluştur
    const reservationDate = new Date(dateTimeString);

    // Geçerli tarih mi?
    if (isNaN(reservationDate.getTime())) {
      return {
        isValid: false,
        message: 'Geçersiz tarih',
      };
    }

    // Geçmişte mi?
    const now = new Date();
    if (reservationDate < now) {
      return {
        isValid: false,
        message: 'Rezervasyon tarihi geçmişte olamaz',
      };
    }

    // Çok ileri tarih mi? (1 yıl sonrasına kadar)
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    if (reservationDate > oneYearLater) {
      return {
        isValid: false,
        message: 'Rezervasyon en fazla 1 yıl sonrası için yapılabilir',
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      message: 'Tarih doğrulanamadı',
    };
  }
}
