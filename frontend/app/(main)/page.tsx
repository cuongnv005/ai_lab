"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePosts, useCategories, useHotPosts, useTopAuthors } from '@/features/posts/hooks/use-posts';
import { PostCard, PostListCard } from '@/features/posts/components/post-card';
import { Calendar, User, Eye, ArrowRight, BookOpen, Grid, List, Flame, TrendingUp, Mail } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/format-date';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

function HomePageContent() {
  const t = useTranslations("HomePage");
  const common = useTranslations("Common");
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') || '1');
  const userId = searchParams.get('user_id') ? Number(searchParams.get('user_id')) : undefined;
  const search = searchParams.get('search') || undefined;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error(t("newsletter.invalidEmail", { defaultValue: "Địa chỉ email không hợp lệ!" }));
      return;
    }
    toast.success(t("newsletter.success", { defaultValue: "Đăng ký nhận tin thành công!" }));
    setEmail('');
  };

  const { posts, pagination, isLoading, isFetching, isError, error } = usePosts({
    page,
    perPage: page === 1 ? (userId || search ? 10 : 12) : 10,
    user_id: userId,
    search,
  });
  const { categories } = useCategories();

  if (isLoading || isFetching) {
    return (
      <div className="space-y-16 py-6 animate-pulse text-left">
        {/* Hero Banner Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-muted rounded-2xl aspect-[16/10]" />
          <div className="lg:col-span-1 flex flex-col gap-8 h-full">
            <div className="flex-1 bg-muted rounded-xl min-h-[180px]" />
            <div className="flex-1 bg-muted rounded-xl min-h-[180px]" />
          </div>
        </div>

        {/* Main Body Skeleton */}
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Main Content Area Skeleton */}
          <div className={cn("space-y-12", search ? "w-full" : "lg:w-[68%]")}>
            <div className="h-8 bg-muted rounded-xl w-48 mb-8" />
            <div className="space-y-12">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-60 h-40 bg-muted rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-4 py-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Area Skeleton */}
          {!search && (
            <div className="lg:w-[32%] space-y-12">
              {/* Categories Widget Skeleton */}
              <div className="bg-muted/20 rounded-2xl p-8 space-y-6">
                <div className="h-6 bg-muted rounded w-1/2" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-8 bg-muted rounded-xl w-full" />
                  ))}
                </div>
              </div>

              {/* Hot Posts Widget Skeleton */}
              <div className="bg-muted/20 rounded-2xl p-6 space-y-6">
                <div className="h-6 bg-muted rounded w-1/2" />
                <div className="space-y-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-4">
                      <div className="h-9 bg-muted rounded-lg w-9 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('Posts error:', error);
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-500">{t("errorTitle", { defaultValue: "Đã xảy ra lỗi khi tải dữ liệu" })}</h2>
        <p className="text-muted-foreground">{t("errorMessage", { defaultValue: "Vui lòng thử lại sau hoặc liên hệ quản trị viên." })}</p>
      </div>
    );
  }

  // Extract hero layout data
  const bigPost = page === 1 && !userId && !search ? posts[0] : undefined;
  const smallPosts = page === 1 && !userId && !search ? posts.slice(1, 3) : [];
  const recentPosts = page === 1 && !userId && !search ? posts.slice(3) : posts;

  const getPostImage = (post: typeof bigPost) => {
    if (!post) return '';
    return post.first_image
      || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;
  };

  return (
    <div className="space-y-16 py-6 text-left">
      {/* Author Filter Header */}
      {userId && posts.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("filterByAuthor", { defaultValue: "Đang lọc theo tác giả" })}</span>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground mt-1">
              {t("postsByAuthor", { name: posts[0].user?.name || '', defaultValue: `Bài viết của @${posts[0].user?.name || ''}` })}
            </h2>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors w-fit"
          >
            {t("clearFilter", { defaultValue: "Xóa bộ lọc" })}
          </Link>
        </div>
      )}

      {userId && posts.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-2xl space-y-4">
          <p className="text-muted-foreground">{t("noAuthorPosts", { defaultValue: "Tác giả này chưa có bài viết nào." })}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {t("backToHome", { defaultValue: "Quay lại trang chủ" })}
          </Link>
        </div>
      )}

      {/* Search Filter Header */}
      {search && posts.length > 0 && (
        <div className="bg-card border border-[#E2E8F0] dark:border-[#2d2d30]  rounded-2xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("searchResults", { defaultValue: "Kết quả tìm kiếm" })}</span>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground mt-1">
              {t("searchFor", { search, defaultValue: `Tìm kiếm cho từ khóa "${search}"` })}
            </h2>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors w-fit"
          >
            {t("clearFilter", { defaultValue: "Xóa bộ lọc" })}
          </Link>
        </div>
      )}

      {search && posts.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-2xl space-y-4">
          <p className="text-muted-foreground">{t("noSearchResults", { search, defaultValue: `Không tìm thấy bài viết nào chứa từ khóa "${search}".` })}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {t("backToHome", { defaultValue: "Quay lại trang chủ" })}
          </Link>
        </div>
      )}

      {/* Hero Section */}
      {bigPost && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Big Featured Card */}
          <article className="lg:col-span-2 relative group overflow-hidden rounded-2xl aspect-[16/10] bg-zinc-950 border dark:border-border shadow-xs hover:shadow-md transition-all duration-300">
            <img
              src={getPostImage(bigPost)}
              alt={bigPost.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full max-w-4xl text-left">
              <span className="inline-block w-fit px-3 bg-primary dark:bg-[#0047ab] text-white text-[10px] font-bold rounded-md mb-3 uppercase tracking-wider">
                {bigPost.category?.name || 'Generative AI'}
              </span>
              <h1 className="text-white text-2xl md:text-3xl font-extrabold mb-3 leading-tight">
                <Link href={`/posts/${bigPost.id}`} className="hover:underline hover:text-white text-white transition-colors line-clamp-3">
                  {bigPost.title}
                </Link>
              </h1>
              <div className="hidden md:flex items-center gap-6 text-white/80 text-xs">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" /> {bigPost.user?.name || 'Anonymous'}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {formatDateTime(bigPost.created_at)}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" /> {bigPost.views_count} lượt xem
                </span>
              </div>
            </div>
          </article>

          {/* Small Feature Stack */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {smallPosts.map((post) => (
              <article key={post.id} className="relative flex-1 rounded-xl overflow-hidden shadow-lg group cursor-pointer min-h-[240px] bg-zinc-950">
                <img
                  src={getPostImage(post)}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                <div className="relative h-full p-8 flex flex-col justify-end text-left">
                  <span className="inline-block w-fit px-3 bg-primary dark:bg-[#0047ab] text-white text-[10px] font-bold rounded-md mb-3 uppercase tracking-wider">
                    {post.category?.name || 'Generative AI'}
                  </span>
                  <h3 className="text-white text-base md:text-lg font-bold leading-snug line-clamp-2">
                    <Link href={`/posts/${post.id}`} className="hover:text-white">
                      {post.title}
                    </Link>
                  </h3>
                </div>
              </article>
            ))}
            {smallPosts.length === 0 && (
              <div className="flex items-center justify-center h-full border rounded-xl border-dashed border-outline-variant p-6 text-center text-muted-foreground">
                {t("updatingFeatured", { defaultValue: "Đang cập nhật các bài viết tiêu điểm..." })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Body Layout */}
      <div className="flex flex-col lg:flex-row gap-20">
        {/* Main Content Area */}
        <section className={cn(search ? "w-full text-left" : "lg:w-[68%] text-left")}>
          <div className="flex justify-between items-end mb-8 border-b border-[#E2E8F0] dark:border-[#2d2d30] pb-4">
            <div>
              <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight mb-2">
                {t("latestPosts", { defaultValue: "Bài viết mới nhất" })}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {t("latestPostsSub", { defaultValue: "Cập nhật những chuyển động mới nhất của giới công nghệ" })}
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg border border-transparent transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-primary dark:bg-[#0047ab] text-white shadow-lg shadow-primary/20 dark:shadow-[#0047ab]/20'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary dark:hover:text-[#0047ab] hover:border-outline-variant'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg border border-transparent transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-primary dark:bg-[#0047ab] text-white shadow-lg shadow-primary/20 dark:shadow-[#0047ab]/20'
                    : 'bg-surface-container text-on-surface-variant hover:text-primary dark:hover:text-[#0047ab] hover:border-outline-variant'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {recentPosts.length > 0 ? (
            <div className="w-full">
              {/* Desktop/Tablet List View */}
              <div className={`hidden md:flex flex-col gap-12 ${viewMode === 'grid' ? 'md:hidden' : ''}`}>
                {recentPosts.map((post) => (
                  <PostListCard key={post.id} post={post} />
                ))}
              </div>
              
              {/* Desktop Grid View OR Mobile View (Always Card) */}
              <div className={`grid grid-cols-1 gap-8 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'md:hidden'}`}>
                {recentPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          ) : (
            posts.length === 0 && (
              <div className="text-center py-12 border rounded-2xl border-dashed">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">{t("noPosts", { defaultValue: "Hiện tại chưa có bài viết nào được xuất bản." })}</p>
              </div>
            )
          )}

          {/* Pagination Controls */}
          {pagination && pagination.lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 pt-12">
              {/* Previous Button */}
              <Link
                href={page > 1 ? `/?page=${page - 1}` : '#'}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 ${
                  page <= 1
                    ? 'opacity-50 pointer-events-none text-zinc-400 border-[#E2E8F0] dark:border-[#2d2d30]'
                    : 'text-zinc-700 hover:bg-muted/50 border-[#E2E8F0] dark:text-zinc-300 dark:border-[#2d2d30]'
                }`}
              >
                {common("prev", { defaultValue: "Trước" })}
              </Link>
              
              {/* Page Numbers */}
              {Array.from({ length: pagination.lastPage }).map((_, index) => {
                const p = index + 1;
                const isActive = p === page;
                return (
                  <Link
                    key={p}
                    href={`/?page=${p}`}
                    className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all border ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'border-[#E2E8F0] hover:bg-muted/50 text-zinc-700 dark:border-[#2d2d30] dark:text-zinc-300'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}

              {/* Next Button */}
              <Link
                href={page < pagination.lastPage ? `/?page=${page + 1}` : '#'}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 ${
                  page >= pagination.lastPage
                    ? 'opacity-50 pointer-events-none text-zinc-400 border-[#E2E8F0] dark:border-[#2d2d30]'
                    : 'text-zinc-700 hover:bg-muted/50 border-[#E2E8F0] dark:text-zinc-300 dark:border-[#2d2d30]'
                }`}
              >
                {common("next", { defaultValue: "Sau" })}
              </Link>
            </div>
          )}
        </section>

        {/* Sidebar Area */}
        {!search && (
          <aside className="lg:w-[32%] space-y-12 text-left">
            {/* Categories Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-outline-variant shadow-sm">
              <h3 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                {t("hotCategories", { defaultValue: "DANH MỤC NỔI BẬT" })}
              </h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/forum/${cat.slug}`}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-low transition-all border border-transparent hover:border-outline-variant group"
                  >
                    <span className="text-on-surface-variant font-semibold group-hover:text-primary transition-colors text-sm">
                      {cat.name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-outline-variant group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">{t("loadingCategories", { defaultValue: "Đang tải danh mục..." })}</p>
                )}
              </div>
            </div>

            {/* Hot Posts Widget */}
            <HotPostsWidget />

            {/* Top Authors Widget */}
            <TopAuthorsWidget />

            {/* Newsletter Section */}
            <div className="bg-primary dark:bg-[#0047ab] rounded-2xl p-10 text-white shadow-2xl shadow-primary/30 dark:shadow-[#0047ab]/30 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <h3 className="text-2xl font-black mb-4">
                {t("newsletter.title", { defaultValue: "AI Daily Brief" })}
              </h3>
              <p className="text-white/80 text-sm mb-8 leading-relaxed">
                {t("newsletter.description", { defaultValue: "Cập nhật những tin tức AI quan trọng nhất, được tổng hợp gọn gàng trong hộp thư của bạn mỗi sáng." })}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <input
                  className="w-full bg-white/15 border border-white/20 rounded-xl py-3 px-5 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none transition-all text-sm"
                  placeholder={t("newsletter.placeholder", { defaultValue: "Email của bạn..." })}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={100}
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-white text-primary dark:text-[#0047ab] font-black py-3 rounded-xl hover:bg-primary-container hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                  {t("newsletter.button", { defaultValue: "Đăng ký ngay" })}
                </button>
              </form>
              <p className="text-[10px] text-center mt-6 text-white/50">
                {t("newsletter.disclaimer", { defaultValue: "Chúng tôi cam kết bảo mật thông tin và không spam." })}
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function HotPostsWidget() {
  const { posts, isLoading } = useHotPosts();
  const t = useTranslations("HomePage");

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-outline-variant shadow-sm overflow-hidden relative text-left">
      <div className="absolute -top-4 -right-4 opacity-5 rotate-12 pointer-events-none select-none text-red-500">
        <Flame size={120} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3 relative z-10">
        <span className="w-1.5 h-8 bg-red-500 rounded-full"></span>
        {t("hotPosts", { defaultValue: "BÀI VIẾT ĐANG HOT" })}
      </h3>
      {isLoading ? (
        <div className="space-y-4 relative z-10 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-4 bg-muted rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-8 relative z-10">
          {posts.map((post, index) => (
            <div key={post.id} className="flex gap-4 group cursor-pointer">
              <span className="text-4xl font-black text-outline-variant/30 group-hover:text-primary transition-colors italic">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm font-bold leading-snug group-hover:text-primary transition-colors text-on-surface line-clamp-2">
                <Link href={`/posts/${post.id}`}>
                  {post.title}
                </Link>
              </p>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">{t("noHotPosts", { defaultValue: "Chưa có bài viết nổi bật." })}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface TopAuthor {
  id: number;
  name: string;
  avatar_url?: string | null;
  avatar?: string | null;
  posts_count: number;
  total_likes?: number;
}

function TopAuthorsWidget() {
  const { authors, isLoading } = useTopAuthors();
  const t = useTranslations("HomePage");

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-outline-variant shadow-sm text-left">
      <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3">
        <span className="w-1.5 h-8 bg-amber-500 rounded-full"></span>
        {t("topAuthors", { defaultValue: "TÁC GIẢ YÊU THÍCH" })}
      </h3>
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-muted rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {authors.map((author: TopAuthor) => (
            <Link
              key={author.id}
              href={`/users/${author.id}`}
              className="flex items-center justify-between p-1 rounded-xl border border-transparent hover:border-outline-variant hover:bg-surface-container-low transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={author.avatar_url || author.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${author.id || 'U'}`}
                  alt={author.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-outline-variant"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                    {author.name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant font-medium truncate">
                    {t("postsCount", { count: author.posts_count, defaultValue: `${author.posts_count} bài viết` })}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#e5127d] bg-[#e5127d]/5 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                ❤️ {author.total_likes}
              </span>
            </Link>
          ))}
          {authors.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">{t("noTopAuthors", { defaultValue: "Chưa có tác giả nổi bật." })}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="space-y-8 py-6 animate-pulse text-left">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
          <div className="lg:col-span-2 bg-muted rounded-2xl h-full" />
          <div className="space-y-4 h-full flex flex-col justify-between">
            <div className="bg-muted rounded-xl h-28" />
            <div className="bg-muted rounded-xl h-28" />
            <div className="bg-muted rounded-xl h-28" />
          </div>
        </div>
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-muted rounded-xl h-80" />
          ))}
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
