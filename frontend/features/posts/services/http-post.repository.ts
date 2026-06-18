import { BaseRepository } from '@/infra/api/base-repository';
import { HttpService } from '@/infra/api/http-service';
import type { IHttpAdapter } from '@/infra/api/http-adapter';
import type { ListResponse, ResponseData } from '@/shared/types/common';
import type { Post, Category, PostFilters, PostThread } from '../types';
import { PostRepository } from './post.repository';
import { PostSchema, PostListSchema, CategoryListSchema, PostThreadListSchema, HotPostListSchema } from '../schemas/post.schema';
import type { AxiosResponse } from 'axios';

interface RawPostListResponse {
  status_code: number;
  message: string;
  errors: Record<string, string[]> | null;
  data: {
    data: Post[];
    per_page: number;
    total_page: number;
    current_page: number;
    total: number;
  };
}

interface RawPostThreadListResponse {
  status_code: number;
  message: string;
  errors: Record<string, string[]> | null;
  data: {
    data: PostThread[];
    per_page: number;
    total_page: number;
    current_page: number;
    total: number;
  };
}

// Helper to extract posts array from wrapped response
const extractPosts = (response: RawPostListResponse): Post[] => {
  return response.data?.data ?? [];
};

export class HttpPostRepository extends BaseRepository implements PostRepository {
  constructor(http: IHttpAdapter = HttpService) {
    super(http);
  }

  // ─── MANDATORY: HTTP 200 Fake-Error Guard ────────────────────────────────
  private validateResponse(res: AxiosResponse<ResponseData<unknown>> | any) {
    const data = res?.data;
    const statusCode = (data as unknown as Record<string, unknown>)?.status_code as number | undefined
      || res?.status;
    const isError = statusCode === 422 || data?.success === false;

    if (isError || statusCode === 401) {
      const error = new Error(data?.message || 'Request failed') as Error & {
        response?: { data?: unknown; status?: number }
      };
      error.response = { data, status: statusCode };
      throw error;
    }
  }

  async list(filters: PostFilters): Promise<ListResponse<Post>> {
    const params: Record<string, string> = {};
    if (filters.page) params.page = String(filters.page);
    if (filters.perPage) params.per_page = String(filters.perPage);
    if (filters.search) params.search = filters.search;
    if (filters.user_id) params.user_id = String(filters.user_id);

    const response = await this.get<RawPostListResponse>('/api/posts', params);
    const postsData = extractPosts(response);
    const validatedPosts = PostListSchema.parse(postsData);
    
    const pagination = response.data;
    
    return {
      data: validatedPosts,
      total: pagination.total,
      per_page: pagination.per_page,
      current_page: pagination.current_page,
      last_page: pagination.total_page,
    };
  }

  async getById(id: number): Promise<Post> {
    const response = await this.get<ResponseData<Post>>(`/api/posts/${id}`);
    const validatedPost = PostSchema.parse(response.data);
    return validatedPost;
  }

  async listCategories(): Promise<Category[]> {
    const response = await this.get<ResponseData<Category[]>>('/api/categories');
    const validatedCategories = CategoryListSchema.parse(response.data || []);
    return validatedCategories;
  }

  async listCategoryPosts(categorySlug: string, filters: PostFilters): Promise<ListResponse<Post>> {
    const params: Record<string, string> = {};
    if (filters.page) params.page = String(filters.page);
    if (filters.perPage) params.per_page = String(filters.perPage);

    const response = await this.get<RawPostListResponse>(
      `/api/categories/${categorySlug}/posts`,
      params
    );
    const postsData = extractPosts(response);
    const validatedPosts = PostListSchema.parse(postsData);
    
    const pagination = response.data;
    
    return {
      data: validatedPosts,
      total: pagination.total,
      per_page: pagination.per_page,
      current_page: pagination.current_page,
      last_page: pagination.total_page,
    };
  }

  async listCategoryThreads(categorySlug: string, filters: PostFilters): Promise<ListResponse<PostThread>> {
    const params: Record<string, string> = {};
    if (filters.page) params.page = String(filters.page);
    if (filters.perPage) params.per_page = String(filters.perPage);

    const response = await this.get<RawPostThreadListResponse>(
      `/api/categories/${categorySlug}/threads`,
      params
    );
    const postsData = response.data?.data ?? [];
    const validatedPosts = PostThreadListSchema.parse(postsData);
    
    const pagination = response.data;
    
    return {
      data: validatedPosts as unknown as PostThread[],
      total: pagination.total,
      per_page: pagination.per_page,
      current_page: pagination.current_page,
      last_page: pagination.total_page,
    };
  }

  async listTagPosts(tagSlug: string, filters: PostFilters): Promise<ListResponse<Post>> {
    const params: Record<string, string> = {};
    if (filters.page) params.page = String(filters.page);
    if (filters.perPage) params.per_page = String(filters.perPage);

    const response = await this.get<RawPostListResponse>(
      `/api/tags/${tagSlug}/posts`,
      params
    );
    const postsData = extractPosts(response);
    const validatedPosts = PostListSchema.parse(postsData);

    const pagination = response.data;

    return {
      data: validatedPosts,
      total: pagination.total,
      per_page: pagination.per_page,
      current_page: pagination.current_page,
      last_page: pagination.total_page,
    };
  }

  async toggleLike(id: number): Promise<{ liked: boolean }> {
    const response = await this.post<ResponseData<{ liked: boolean }>>(`/api/posts/${id}/like`, {});
    return response.data;
  }

  async getSimilarPosts(id: number, tag?: string): Promise<Post[]> {
    const params = tag ? { tag } : undefined;
    const response = await this.get<ResponseData<Post[]>>(`/api/posts/${id}/similar`, params);
    return response.data || [];
  }

  async create(input: any): Promise<Post> {
    const response = await this.http.post<any, AxiosResponse<ResponseData<Post>>>('/api/posts', input);
    this.validateResponse(response);
    return PostSchema.parse(response.data.data);
  }

  async update(id: number, input: any): Promise<Post> {
    const response = await this.http.put<any, AxiosResponse<ResponseData<Post>>>(`/api/posts/${id}`, input);
    this.validateResponse(response);
    return PostSchema.parse(response.data.data);
  }

  async deletePost(id: number): Promise<{ message?: string }> {
    const response = await this.http.delete<AxiosResponse<ResponseData<void>>>(`/api/posts/${id}`);
    this.validateResponse(response);
    return { message: response.data.message };
  }

  async autoSaveDraft(input: any): Promise<any> {
    const response = await this.http.post<any, AxiosResponse<ResponseData<any>>>('/api/drafts/autosave', input);
    this.validateResponse(response);
    return response.data.data;
  }

  async getDraft(categoryId: number, postId?: number): Promise<any> {
    const params: Record<string, string> = { category_id: String(categoryId) };
    if (postId) {
      params.post_id = String(postId);
    }
    const response = await this.get<ResponseData<any>>('/api/drafts', params);
    return response;
  }

  async deleteDraft(categoryId: number, postId?: number): Promise<any> {
    let url = `/api/drafts?category_id=${categoryId}`;
    if (postId) {
      url += `&post_id=${postId}`;
    }
    const response = await this.http.delete<AxiosResponse<ResponseData<any>>>(url);
    this.validateResponse(response);
    return response.data;
  }

  async promote(id: number): Promise<Post & { message?: string }> {
    const response = await this.http.post<unknown, AxiosResponse<ResponseData<Post>>>(`/api/posts/${id}/promote`, {});
    this.validateResponse(response);
    const parsed = PostSchema.parse(response.data.data);
    return {
      ...parsed,
      message: response.data.message,
    };
  }

  async getHotPosts(): Promise<Post[]> {
    const response = await this.get<ResponseData<Post[]>>('/api/posts/hot');
    const validatedPosts = HotPostListSchema.parse(response.data || []);
    return validatedPosts as unknown as Post[];
  }

  async getTopAuthors(): Promise<any[]> {
    const response = await this.get<ResponseData<any[]>>('/api/users/top-authors');
    return response.data || [];
  }
}

export const postRepository = new HttpPostRepository();
