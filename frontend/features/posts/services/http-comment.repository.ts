import { BaseRepository } from '@/infra/api/base-repository';
import { HttpService } from '@/infra/api/http-service';
import type { IHttpAdapter } from '@/infra/api/http-adapter';
import type { ResponseData } from '@/shared/types/common';
import type { Comment, CommentFilters, CreateCommentInput } from '../types/comment';
import { CommentListSchema, CommentSchema } from '../schemas/comment.schema';

interface RawCommentListResponse {
  status_code: number;
  message: string;
  errors: Record<string, string[]> | null;
  data: Comment[]; // API trả về data trực tiếp, không wrap trong data.data
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export class HttpCommentRepository extends BaseRepository {
  constructor(http: IHttpAdapter = HttpService) {
    super(http);
  }

  async list(postId: number, filters: CommentFilters = {}): Promise<{ data: Comment[]; pagination: { total: number; per_page: number; current_page: number; total_page: number } }> {
    const params: Record<string, string> = {};
    if (filters.page) params.page = String(filters.page);
    if (filters.perPage) params.per_page = String(filters.perPage);

    const response = await this.get<RawCommentListResponse>(`/api/posts/${postId}/comments`, params);
    
    // API trả về data trực tiếp, meta chứa pagination
    const validatedComments = CommentListSchema.parse(response.data);
    
    return {
      data: validatedComments,
      pagination: {
        total: response.meta.total,
        per_page: response.meta.per_page,
        current_page: response.meta.current_page,
        total_page: response.meta.last_page, // API dùng last_page
      },
    };
  }

  async create(postId: number, input: CreateCommentInput): Promise<Comment> {
    const response = await this.post<ResponseData<Comment>>(`/api/posts/${postId}/comments`, input);
    const validatedComment = CommentSchema.parse(response.data);
    return validatedComment;
  }

  async remove(commentId: number): Promise<void> {
    await this.delete<void>(`/api/comments/${commentId}`);
  }

  async toggleLike(commentId: number): Promise<{ liked: boolean }> {
    const response = await this.post<ResponseData<{ liked: boolean }>>(
      `/api/comments/${commentId}/like`,
      {}
    );
    return response.data;
  }
}

export const commentRepository = new HttpCommentRepository();
