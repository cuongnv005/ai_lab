import { z } from 'zod';

export const CommentUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

export interface CommentType {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    avatar_url?: string | null;
  };
  is_liked?: boolean;
  is_reported?: boolean;
  replies?: CommentType[];
}

export const CommentSchema: z.ZodType<CommentType> = z.object({
  id: z.number(),
  post_id: z.number(),
  user_id: z.number(),
  parent_id: z.number().nullable(),
  content: z.string(),
  likes_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  user: CommentUserSchema,
  is_liked: z.boolean().optional(),
  is_reported: z.boolean().optional(),
  replies: z.lazy(() => z.array(CommentSchema)).optional(),
});

export const CommentListSchema = z.array(CommentSchema);

export const CreateCommentSchema = z.object({
  content: z.string().min(1, 'Nội dung bình luận không được để trống'),
  parent_id: z.number().optional().nullable(),
});
