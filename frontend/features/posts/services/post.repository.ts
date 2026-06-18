import type { ListResponse } from '@/shared/types/common';
import type { Post, PostFilters, PostThread } from '../types';

export interface PostRepository {
  list(filters: PostFilters): Promise<ListResponse<Post>>;
  getById(id: number): Promise<Post>;
  listCategories(): Promise<import('../types').Category[]>;
  listCategoryPosts(categorySlug: string, filters: PostFilters): Promise<ListResponse<Post>>;
  listCategoryThreads(categorySlug: string, filters: PostFilters): Promise<ListResponse<PostThread>>;
  toggleLike(id: number): Promise<{ liked: boolean }>;
  getSimilarPosts(id: number, tag?: string): Promise<Post[]>;
  promote(id: number): Promise<Post & { message?: string }>;
  deleteDraft(categoryId: number, postId?: number): Promise<any>;
  getHotPosts(): Promise<Post[]>;
  getTopAuthors(): Promise<any[]>;
}
