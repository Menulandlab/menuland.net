const mockStorage = {
  getItem: async (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    
    // Server-side: read cookies via next/headers
    try {
      const { cookies } = require('next/headers');
      const cookieStore = await cookies();
      if (key === '@authToken') {
        return cookieStore.get('authToken')?.value || null;
      }
      if (key === '@authUser') {
        return cookieStore.get('authUser')?.value || null;
      }
    } catch (e) {
      // In build/prerender phase, next/headers might not be available or throw
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  multiRemove: async (keys: string[]) => {
    if (typeof window !== 'undefined') {
      keys.forEach(key => localStorage.removeItem(key));
    }
  }
};

export default mockStorage;
