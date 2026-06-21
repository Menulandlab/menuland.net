import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Clipboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  code: string;
  expiresAt: string;       // ISO datetime string
  puanSpent: number;
  campaignName?: string;
  businessName?: string;
}

const PuanCodeModal: React.FC<Props> = ({
  visible,
  onClose,
  code,
  expiresAt,
  puanSpent,
  campaignName,
  businessName,
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [copied, setCopied] = useState(false);

  const calcTimeLeft = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Süre doldu';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [expiresAt]);

  useEffect(() => {
    if (!visible) return;
    setTimeLeft(calcTimeLeft());
    const interval = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, [visible, calcTimeLeft]);

  const handleCopy = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Clipboard.setString(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isExpired = timeLeft === 'Süre doldu';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Başlık */}
          <View style={styles.header}>
            <Ionicons name="star" size={28} color="#FF9500" />
            <Text style={styles.title}>PuanLand Kodu</Text>
          </View>

          {businessName ? <Text style={styles.businessName}>{businessName}</Text> : null}
          {campaignName ? <Text style={styles.campaignName}>{campaignName}</Text> : null}

          {/* Kod */}
          <View style={[styles.codeBox, isExpired && styles.codeBoxExpired]}>
            <Text style={[styles.code, isExpired && styles.codeExpired]}>{code}</Text>
          </View>

          {/* Kopyala */}
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} disabled={isExpired}>
            <Ionicons name={copied ? 'checkmark-circle' : 'copy-outline'} size={18} color={copied ? '#4CAF50' : Colors.primary} />
            <Text style={[styles.copyText, copied && { color: '#4CAF50' }]}>
              {copied ? 'Kopyalandı!' : 'Kodu Kopyala'}
            </Text>
          </TouchableOpacity>

          {/* Geri Sayım */}
          <View style={styles.timerRow}>
            <Ionicons name="time-outline" size={16} color={isExpired ? '#ff4444' : Colors.textLight} />
            <Text style={[styles.timer, isExpired && styles.timerExpired]}>
              {isExpired ? 'Kodun süresi doldu' : `Geçerlilik süresi: ${timeLeft}`}
            </Text>
          </View>

          {/* Harcanan Puan */}
          <View style={styles.puanRow}>
            <Ionicons name="star" size={14} color="#FF9500" />
            <Text style={styles.puanText}>{puanSpent} puan harcandı</Text>
          </View>

          {/* Bilgi */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>
              Bu kodu işletme kasiyerine gösterin. Kod bir kez kullanılabilir ve 24 saat geçerlidir.
            </Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PuanCodeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text, marginLeft: 8 },
  businessName: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  campaignName: { fontSize: 13, color: Colors.textLight, marginBottom: 20 },
  codeBox: {
    backgroundColor: '#FFF8EC',
    borderWidth: 2,
    borderColor: '#FFD580',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginVertical: 16,
  },
  codeBoxExpired: { borderColor: '#ccc', backgroundColor: '#f5f5f5' },
  code: { fontSize: 36, fontWeight: '800', letterSpacing: 8, color: '#FF9500' },
  codeExpired: { color: '#aaa' },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
    marginBottom: 14,
  },
  copyText: { marginLeft: 6, fontSize: 14, color: Colors.primary, fontWeight: '500' },
  timerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  timer: { marginLeft: 6, fontSize: 13, color: Colors.textLight },
  timerExpired: { color: '#ff4444', fontWeight: '600' },
  puanRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  puanText: { marginLeft: 4, fontSize: 13, color: '#FF9500', fontWeight: '500' },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 12, color: Colors.textLight, marginLeft: 8, lineHeight: 18 },
  closeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  closeBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
