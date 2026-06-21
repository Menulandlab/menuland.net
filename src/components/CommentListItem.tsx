import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'; // Added TouchableOpacity
import Colors from '@/src/constants/Colors';
import { FontAwesome, Ionicons } from '@expo/vector-icons'; // Added Ionicons
import VerifiedBadge from './VerifiedBadge'; // Mavi tik komponenti

export interface Comment {
  id: number;
  comment_text: string;
  rating: number;
  created_at: string;
  username?: string; // Backend'den gelen alan adı
  user_name?: string; // Alternatif alan adı
  user?: {
    name?: string;
    username?: string;
    is_verified?: boolean; // Doğrulanmış kullanıcı
  };
  is_verified?: boolean; // Doğrulanmış kullanıcı (direkt alan)
  business_name?: string; // Yorumlarım sayfası için
  is_verified_visit?: boolean | number | string; // Konum doğrulamalı ziyaret
}

interface CommentListItemProps {
  comment: Comment;
  onDelete?: (commentId: number) => void; // Yeni prop
  showDeleteButton?: boolean; // Yeni prop
}

const CommentListItem: React.FC<CommentListItemProps> = ({ comment, onDelete, showDeleteButton }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= rating ? 'star' : 'star-o'}
          size={16}
          color="#FFD700"
          style={styles.star}
        />
      );
    }
    return <View style={styles.starContainer}>{stars}</View>;
  };

  // Kullanıcı adını belirle - farklı API formatlarını destekle
  const getUserName = () => {
    if (comment.user?.name) return comment.user.name;
    if (comment.user?.username) return comment.user.username;
    if (comment.user_name) return comment.user_name;
    if (comment.username) return comment.username;
    if (comment.business_name) return comment.business_name; // Yorumlarım sayfası için
    return 'Anonim Kullanıcı';
  };

  // Kullanıcının doğrulanmış olup olmadığını kontrol et
  const isUserVerified = () => {
    if (comment.user?.is_verified) return true;
    if (comment.is_verified) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.author}>{getUserName()}</Text>
          {isUserVerified() && <VerifiedBadge size={16} />}
        </View>
        <View style={styles.headerRight}>
          {showDeleteButton && onDelete && (
            <TouchableOpacity onPress={() => onDelete(comment.id)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          )}
          <Text style={styles.date}>{new Date(comment.created_at).toLocaleDateString('tr-TR')}</Text>
        </View>
      </View>
      <View style={styles.ratingContainer}>{renderStars(comment.rating)}</View>
      {(comment.is_verified_visit === true || comment.is_verified_visit === 1 || comment.is_verified_visit === '1') && (
        <View style={styles.verifiedVisitBadge}>
          <Ionicons name="location" size={14} color="#10B981" />
          <Text style={styles.verifiedVisitText}>Konum Doğrulandı</Text>
        </View>
      )}
      <Text style={styles.commentText}>{comment.comment_text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerRight: { // New style for grouping date and delete button
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Space between date and delete button
  },
  author: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 1,
  },
  commentText: {
    fontSize: 15,
    color: Colors.textLight,
    lineHeight: 22,
  },
  deleteButton: { // New style for delete button
    padding: 5,
    borderRadius: 5,
    backgroundColor: Colors.backgroundLight,
  },
  verifiedVisitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F0', // Very light emerald green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  verifiedVisitText: {
    fontSize: 12,
    color: '#059669', // Emerald dark text
    fontWeight: '600',
  }
});

export default CommentListItem;
