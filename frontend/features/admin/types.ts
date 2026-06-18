/**
 * Admin feature — shared TypeScript interfaces & enums.
 * All backend entity shapes mirror the API resources defined in routes/api.php.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type AdminPeriod = 'today' | '7days' | '30days' | 'year'
export type AdminChartType = 'views' | 'posts' | 'users' | 'comments'
export type AdminReportStatus = 'pending' | 'resolved' | 'dismissed'
export type AdminReportType = 'post' | 'comment'
export type AdminUserRole = 'member' | 'moderator' | 'admin'
export type AdminPostStatus = 'pending' | 'published' | 'rejected' | 'deleted' | 'all' | 'approved'

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_views: number
  new_posts: number
  new_users: number
  new_comments: number
  pending_posts: number
  total_users: number
  total_posts: number
  total_comments: number
}

export interface AdminChartDataPoint {
  date: string
  value: number
}

export interface AdminTopPost {
  id: number
  title: string
  author: string | { id: number; name: string }
  views_count: number
  likes_count: number
  comments_count: number
}

export interface AdminTopUser {
  id: number
  name: string
  posts_count: number
  comments_count: number
}

export interface AdminActivity {
  type: 'post' | 'user' | 'comment' | 'report'
  message: string
  timestamp: string
  actor?: string
}

// ─── Approval ─────────────────────────────────────────────────────────────────

export interface AdminPendingPost {
  id: number
  title: string
  content: string
  status: number
  created_at: string
  updated_at: string
  reject_reason?: string | null
  user?: { id: number; name: string; email: string }
  category?: { id: number; name: string; slug: string }
}

export interface AdminApprovalFilters {
  page?: number
  per_page?: number
  category_id?: number
  search?: string
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface AdminReport {
  id: number
  reportable_type: AdminReportType
  reportable_id: number
  reason: string
  status: number
  created_at: string
  reporter?: { id: number; name: string; email: string }
  reportable?: {
    id: number
    content?: string
    title?: string
    author?: { id: number; name: string }
  }
  resolved_by?: number | null
  resolved_at?: string | null
}

export interface AdminReportFilters {
  page?: number
  per_page?: number
  status?: AdminReportStatus | ''
  type?: AdminReportType | ''
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  status: number // 1=active, 2=banned
  created_at: string
  posts_count?: number
  ban_reason?: string | null
  banned_until?: string | null
}

export interface AdminUserFilters {
  page?: number
  per_page?: number
  role?: AdminUserRole | ''
  status?: 'active' | 'banned' | ''
  search?: string
}

export interface BanUserInput {
  reason: string
  duration?: number
}

export interface ChangeRoleInput {
  role: AdminUserRole
}

// ─── Admin Posts ──────────────────────────────────────────────────────────────

export interface AdminPost {
  id: number
  title: string
  content: string
  status: number
  views_count: number
  reject_reason?: string | null
  deleted_at?: string | null
  created_at: string
  updated_at: string
  user?: { id: number; name: string; email: string }
  category?: { id: number; name: string; slug: string }
  tags?: Array<{ id: number; name: string; slug: string }>
  likes_count?: number
  comments_count?: number
}

export interface AdminPostFilters {
  page?: number
  per_page?: number
  search?: string
  status?: AdminPostStatus
  category_id?: number
  author?: string
  exclude_staff?: string
}

export interface AdminPostCreateInput {
  title: string
  content: string
  category_id: number
  tags?: string[]
}

export interface AdminPostUpdateInput {
  title?: string
  content?: string
  category_id?: number
  tags?: string[]
  status?: number
}

// ─── Admin Comments ───────────────────────────────────────────────────────────

export interface AdminComment {
  id: number
  content: string
  post_id: number
  user_id: number
  parent_id?: number | null
  likes_count: number
  deleted_at?: string | null
  created_at: string
  updated_at: string
  user?: { id: number; name: string; email: string }
  post?: { id: number; title: string }
}

export interface AdminCommentFilters {
  page?: number
  per_page?: number
  search?: string
  post_id?: number
  author?: string
}

// ─── Admin Categories ─────────────────────────────────────────────────────────

export interface AdminCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  sort_order: number
  posts_count?: number
  created_at?: string
  updated_at?: string
}

export interface AdminCategoryCreateInput {
  name: string
  slug: string
  description?: string
}

export interface AdminCategoryUpdateInput {
  name?: string
  slug?: string
  description?: string
}

export interface AdminCategoryReorderInput {
  orders: Array<{ id: number; sort_order: number }>
}

// ─── Paginated Response ───────────────────────────────────────────────────────

export interface AdminPaginatedResponse<T> {
  data: T[]
  pagination?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  current_page?: number
  per_page?: number
  total?: number
  last_page?: number
  total_page?: number
}
