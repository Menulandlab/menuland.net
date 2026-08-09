import { privateApiClient } from './client';

export interface UserStats {
  comment_count: number;
}

export const getUserStats = async (): Promise<UserStats> => {
  try {
    // Önce /user/stats endpoint'ini dene
    const response = await privateApiClient.get('/user/stats');
    
    // Response parsing (similar to profile update)
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

    if (responseData.success) {
      return responseData.data;
    } else {
      throw new Error(responseData.message || 'Kullanıcı istatistikleri alınamadı');
    }
  } catch (error: any) {
    // Eğer /user/stats çalışmazsa, yorumları çekip sayalım
    try {
      const commentsResponse = await privateApiClient.get('/comments/user');
      
      if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
        const commentCount = commentsResponse.data.length;
        return {
          comment_count: commentCount
        };
      }
    } catch (commentsError) {
      console.error('Failed to fetch comments:', commentsError);
    }
    
    // Her iki endpoint da çalışmazsa varsayılan değer döndür
    return {
      comment_count: 0
    };
  }
};
