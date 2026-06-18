export interface CommentUser {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  avatar_url?: string | null;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user: CommentUser;
  is_liked?: boolean;
  is_reported?: boolean;
  replies?: Comment[];
}

export interface CommentFilters {
  page?: number;
  perPage?: number;
}

export interface CreateCommentInput {
  content: string;
  parent_id?: number | null;
}
