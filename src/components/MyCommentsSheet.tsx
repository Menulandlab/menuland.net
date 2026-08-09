import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { privateApiClient } from '../api/client';

interface Comment {
  id: number;
  content: string;
  rating: number;
  created_at: string;
  business: {
    id: number;
    name: string;
    image_url_1?: string;
    image_url_thumb?: string;
  };
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

const MyCommentsSheet: React.FC<Props> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await privateApiClient.get('/user/comments');
      
      console.log('💬 MyCommentsSheet - Raw response:', response.data);
      console.log('💬 MyCommentsSheet - Response type:', typeof response.data);
      
      // Parse response similar to other API calls
      let responseData;
      if (typeof response.data === 'string') {
        const jsonMatch = response.data.match(/\{.*\}$/s);
        if (jsonMatch) {
          responseData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } else {
        responseData = response.data;
      }

      // API'dan direkt array geliyorsa onu kullan, yoksa success/data yapısını kontrol et
      if (Array.isArray(responseData)) {
        // API direkt array döndürüyor, ama Comment interface'i ile uyumlu hale getir
        const formattedComments = responseData.map((comment: any) => ({
          id: parseInt(comment.id),
          content: comment.comment_text,
          rating: parseInt(comment.rating),
          created_at: comment.created_at,
          business: {
            id: parseInt(comment.business_id),
            name: comment.business_name,
            image_url_1: comment.business_image_url_1 // API'da bu field yoksa undefined olur
          }
        }));
        setComments(formattedComments);
      } else if (responseData.success && Array.isArray(responseData.data)) {
        setComments(responseData.data);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('❌ MyCommentsSheet - Error fetching comments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      // POST metodları ile dene
      const postEndpoints = [
        { url: `/comments/${commentId}/delete`, method: 'POST' },
        { url: `/comments/delete`, method: 'POST', data: { comment_id: commentId } },
        { url: `/comments/delete`, method: 'POST', data: { id: commentId } },
        { url: `/user/comments/delete`, method: 'POST', data: { comment_id: commentId } },
        { url: `/delete-comment`, method: 'POST', data: { comment_id: commentId } },
        { url: `/comments/${commentId}`, method: 'PUT', data: { status: 'deleted' } },
        { url: `/comments/${commentId}`, method: 'PATCH', data: { deleted: true } }
      ];
      
      let response;
      let lastError;
      
      for (const endpoint of postEndpoints) {
        try {
          if (endpoint.method === 'POST') {
            response = await privateApiClient.post(endpoint.url, endpoint.data || {});
          } else if (endpoint.method === 'PUT') {
            response = await privateApiClient.put(endpoint.url, endpoint.data || {});
          } else if (endpoint.method === 'PATCH') {
            response = await privateApiClient.patch(endpoint.url, endpoint.data || {});
          }
          break;
        } catch (error: any) {
          lastError = error;
          continue;
        }
      }
      
      if (!response) {
        // Eğer API'da yorum silme endpoint'i yoksa, sadece UI'dan kaldır
        setComments(comments.filter(comment => comment.id !== commentId));
        Alert.alert('Bilgi', 'Yorum listeden kaldırıldı.\n\nNot: Bu yorum sadece cihazınızda gizlendi, sunucudan silinmedi.');
        return;
      }
      
      let responseData;
      if (typeof response.data === 'string') {
        const jsonMatch = response.data.match(/\{.*\}$/s);
        if (jsonMatch) {
          responseData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } else {
        responseData = response.data;
      }

      // Response başarılı ise
      if (responseData.success || response.status === 200 || response.status === 204) {
        setComments(comments.filter(comment => comment.id !== commentId));
        Alert.alert('Başarılı', 'Yorum silindi.');
      } else {
        throw new Error(responseData.message || 'Yorum silinemedi');
      }
    } catch (error: any) {
      // Eğer herhangi bir endpoint çalışmazsa, kullanıcıya seçenek sun
      Alert.alert(
        'Yorum Silme',
        'Sunucudan yorum silinemiyor. Sadece bu cihazda listeden kaldırmak ister misiniz?',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { 
            text: 'Listeden Kaldır', 
            onPress: () => {
              setComments(comments.filter(comment => comment.id !== commentId));
            }
          }
        ]
      );
    }
  };

  const confirmDeleteComment = (comment: Comment) => {
    Alert.alert(
      'Yorumu Sil',
      'Bu yorumu silmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => deleteComment(comment.id) }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={14}
        color={index < rating ? "#FFD700" : Colors.textLight}
      />
    ));
  };

  const renderCommentItem = (item: Comment) => (
    <View key={item.id} style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.businessInfo}>
          <View style={styles.businessImageContainer}>
              {(item.business.image_url_thumb || item.business.image_url_1) ? (
              <Image source={{ uri: item.business.image_url_thumb || item.business.image_url_1 }} style={styles.businessImage} />
            ) : (
              <View style={styles.businessImagePlaceholder}>
                <Ionicons name="restaurant" size={20} color={Colors.textLight} />
              </View>
            )}
          </View>
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>{item.business.name}</Text>
            <Text style={styles.commentDate}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDeleteComment(item)}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.ratingContainer}>
        {renderStars(item.rating)}
      </View>

      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Yorumlarım</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Yorumlar yükleniyor...</Text>
              </View>
            ) : comments.length > 0 ? (
              <>
                <Text style={styles.subtitle}>
                  {comments.length} yorumunuz var
                </Text>
                {comments.map(renderCommentItem)}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={64} color={Colors.textLight} />
                <Text style={styles.emptyTitle}>Henüz yorumunuz yok</Text>
                <Text style={styles.emptyDescription}>
                  Gittiğiniz mekanlar hakkında yorum yaparak deneyimlerinizi paylaşabilirsiniz.
                </Text>
              </View>
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
    maxHeight: '85%',
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
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 15,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  commentItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  businessImageContainer: {
    marginRight: 12,
  },
  businessImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  businessImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  commentDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  deleteButton: {
    padding: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  commentContent: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});

export default MyCommentsSheet;
