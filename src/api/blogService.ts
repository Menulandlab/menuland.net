import { publicApiClient } from './client';
import { blogPosts as fallbackBlogPosts, BlogPost } from '@/src/data/blog-posts';

export interface BlogPostItem {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  date: string;
  published_at?: string;
  image: string;
  category: string;
  readTime: string;
  read_time?: string;
  view_count?: number;
}

export interface BlogCategoryCount {
  category: string;
  post_count: number;
}

/**
 * Normalizes an API post or fallback post to ensure consistent fields
 */
function normalizePost(post: any): BlogPostItem {
  const rawReadTime = String(post.read_time || post.readTime || '5 dk').trim();
  const readTime = rawReadTime.endsWith('dk') ? rawReadTime : `${rawReadTime} dk`;
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    content: post.content || '',
    author: post.author || 'Menuland Ekibi',
    date: post.published_at || post.date || new Date().toISOString(),
    published_at: post.published_at || post.date,
    image: post.image || '/img/blog/default.jpg',
    category: post.category || 'Gastronomi',
    readTime: readTime,
    read_time: readTime,
    view_count: Number(post.view_count || 0),
  };
}

/**
 * Tüm yayınlanmış blog yazılarını çeker (API + Fallback güvencesi)
 */
export async function getBlogPosts(params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<BlogPostItem[]> {
  try {
    const res = await publicApiClient.get('/blog-posts', {
      params: {
        category: params?.category,
        search: params?.search,
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
      timeout: 8000,
    });

    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data.map(normalizePost);
    }
  } catch (error: any) {
    console.warn('[blogService] API call failed, falling back to static blog posts:', error?.message || 'Network/Server Error');
  }

  // Fallback to static articles
  let filtered = [...fallbackBlogPosts];
  if (params?.category) {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === params.category!.toLowerCase()
    );
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    );
  }

  return filtered.map(normalizePost);
}

/**
 * Slug değerine göre tekil bir makale detayını çeker
 */
export async function getBlogPostBySlug(slug: string): Promise<{
  post: BlogPostItem | null;
  related: BlogPostItem[];
}> {
  try {
    const res = await publicApiClient.get(`/blog-posts/${slug}`, {
      timeout: 8000,
    });

    if (res.data?.success && res.data?.data) {
      const normalized = normalizePost(res.data.data);
      const related = Array.isArray(res.data.related)
        ? res.data.related.map(normalizePost)
        : [];
      return { post: normalized, related };
    }
  } catch (error: any) {
    console.warn(`[blogService] API call failed for slug ${slug}, falling back to static post`);
  }

  // Fallback to static articles
  const post = fallbackBlogPosts.find((p) => p.slug === slug);
  if (!post) {
    return { post: null, related: [] };
  }

  const normalized = normalizePost(post);
  const related = fallbackBlogPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map(normalizePost);

  return { post: normalized, related };
}

/**
 * Aktif kategorileri çeker
 */
export async function getBlogCategories(): Promise<BlogCategoryCount[]> {
  try {
    const res = await publicApiClient.get('/blog-posts/categories', {
      timeout: 5000,
    });
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('[blogService] API categories failed, fallback to defaults');
  }

  // Static fallback categories calculation
  const counts: Record<string, number> = {};
  fallbackBlogPosts.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });

  return Object.entries(counts).map(([category, count]) => ({
    category,
    post_count: count,
  }));
}
