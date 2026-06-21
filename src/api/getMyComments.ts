import { privateApiClient } from './client';
import { Comment } from '../components/CommentListItem';

export const getMyComments = async (): Promise<Comment[]> => {
  try {
    const response = await privateApiClient.get('/comments/my');
    if (response.data && Array.isArray(response.data)) {
      // API'den gelen veriyi Comment[] tipine dönüştür
      const comments: Comment[] = response.data.map((item: any) => ({
        id: item.id,
        comment_text: item.comment_text, // API yanıtına göre düzeltildi
        rating: item.rating,
        created_at: item.created_at,
        user_name: item.user?.name || 'Kullanıcı',
        business_name: item.business_name, // API yanıtına göre düzeltildi
      }));
      return comments;
    }
    return [];
  } catch (err) {
    // Hata detayını logla
    console.error('getMyComments API error:', err);
    // Hata durumunda boş array dönmek yerine hatayı yukarıya fırlat
    // ki UI tarafında doğru şekilde karşılansın.
    throw err;
  }
};
