export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  posts_count?: number | null;
  latest_posts?: Post[];
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  avatar_url?: string | null;
  posts_count?: number;
  rating_value?: number;
  role?: string;
  created_at?: string;
}

export interface UserThreadSummary {
  id: number;
  name: string;
  avatar?: string | null;
  avatar_url?: string | null;
}

export interface PostThread {
  id: number;
  title: string;
  views_count: number;
  comments_count?: number;
  created_at: string;
  user?: UserThreadSummary;
}

export interface Post {
  id: number;
  user_id?: number;
  category_id?: number;
  title: string;
  content?: string;
  summary?: string | null;
  first_image?: string | null;
  status: number; // 1: Pending, 2: Published, 3: Rejected
  views_count: number;
  reject_reason?: string | null;
  created_at: string;
  updated_at: string;
  user?: UserSummary;
  category?: Category;
  tags?: Tag[];
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_reported?: boolean;
}

export interface PostFilters {
  page?: number;
  perPage?: number;
  search?: string;
  category_id?: number;
  status?: number;
  user_id?: number;
}
