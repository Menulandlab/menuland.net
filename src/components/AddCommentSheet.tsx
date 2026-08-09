import React, { forwardRef, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import Colors from '../constants/Colors';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { privateApiClient } from '../api/client';
import { Comment } from './CommentListItem';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';

export type Ref = BottomSheetModal;

interface Props {
  businessId: number;
  onCommentAdded: (newComment: Comment) => void;
  isWithinRange: boolean;
}

const AddCommentSheet = forwardRef<Ref, Props>(({ businessId, onCommentAdded, isWithinRange }, ref) => {
  const snapPoints = useMemo(() => isWithinRange ? ['55%', '65%'] : ['50%', '60%'], [isWithinRange]);
  const [rating, setRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshPuanBalance } = useAuth();

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Eksik Bilgi", "Lütfen 1-5 arası bir puan verin.");
      return;
    }
    setLoading(true);
    try {
      const response = await privateApiClient.post('/comments', {
        business_id: businessId,
        rating: rating,
        comment_text: commentText.trim() !== '' ? commentText.trim() : null,
        is_verified_visit: isWithinRange ? 1 : 0,
      });

      if (response.data && response.data.success && response.data.comment) {
        onCommentAdded(response.data.comment);
        if (response.data.puan_earned && response.data.puan_earned > 0) {
          await refreshPuanBalance();
          Alert.alert('Puan Kazandınız!', `Yorumunuz için ${response.data.puan_earned} puan hesabınıza eklendi.`);
        }
      }
      
      if (ref && typeof ref !== 'function') {
        ref.current?.dismiss();
      }
      
      setRating(0);
      setCommentText('');
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Yorum gönderilemedi:", axiosError.response?.status, JSON.stringify(axiosError.response?.data));
      Alert.alert("Hata", "Yorumunuz gönderilirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: Colors.background }}
      handleIndicatorStyle={{ backgroundColor: Colors.textLight }}
      enablePanDownToClose={true}
      enableOverDrag={false}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Yorum Yap & Puanla</Text>
        {isWithinRange && (
          <View style={styles.verifiedBanner}>
            <Ionicons name="location" size={18} color="#059669" />
            <Text style={styles.verifiedBannerText}>
              Konumunuz doğrulandı. Bu yorumdan ekstra puan kazanacaksınız!
            </Text>
          </View>
        )}
        <Text style={styles.label}>Puanınız</Text>
        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <FontAwesome name={star <= rating ? 'star' : 'star-o'} size={36} color="#FFD700" style={styles.star} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Yorumunuz (isteğe bağlı)</Text>
        <BottomSheetTextInput
          style={styles.input}
          multiline
          placeholder="Mekan hakkındaki düşüncelerinizi paylaşın..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? ( <ActivityIndicator color={Colors.white} /> ) : ( <Text style={styles.submitButtonText}>Yorumu Gönder</Text> )}
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

AddCommentSheet.displayName = "AddCommentSheet";

const styles = StyleSheet.create({
  contentContainer: { flex: 1, padding: 24, },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: Colors.text, },
  label: { fontSize: 16, fontWeight: '600', color: Colors.textLight, marginBottom: 12, },
  starContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, },
  star: { marginHorizontal: 8, },
  input: { backgroundColor: Colors.backgroundLight, borderRadius: 12, padding: 16, height: 120, textAlignVertical: 'top', fontSize: 16, marginBottom: 24, },
  submitButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', },
  submitButtonText: { color: Colors.white, fontSize: 18, fontWeight: 'bold', },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F0',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  verifiedBannerText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
});

export default AddCommentSheet;

