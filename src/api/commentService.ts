import { privateApiClient } from './client';
import { Comment } from '../components/CommentListItem';

/**
 * Fetches all comments made by the currently authenticated user.
 */
export const getMyComments = async (): Promise<Comment[]> => {
  try {
    console.log('📝 Kullanıcı yorumları getiriliyor...');
    const response = await privateApiClient.get('/comments/user');
    console.log('📝 Yorumlar API response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error('❌ Kullanıcı yorumları hatası:', error);
    console.error('❌ Response:', error.response?.data);
    console.error('❌ Status:', error.response?.status);
    throw error;
  }
};

/**
 * Deletes a specific comment by its ID.
 */
export const deleteComment = async (commentId: number): Promise<boolean> => {
  try {
    const response = await privateApiClient.delete(`/comments/${commentId}`);
    return response.data?.success ?? false;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};