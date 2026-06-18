"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePosts, useCategories, useHotPosts, useTopAuthors } from '@/features/posts/hooks/use-posts';
import { PostCard, PostListCard } from '@/features/posts/components/post-card';
import { Calendar, User, Eye, ArrowRight, BookOpen, Grid, List } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/format-date';
import { useTranslations } from 'next-intl';

function HomePageContent() {
  const t = useTranslations("HomePage");
  const common = useTranslations("Common");
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') || '1');
  const userId = searchParams.get('user_id') ? Number(searchParams.get('user_id')) : undefined;
  const search = searchParams.get('search') || undefined;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const { posts, pagination, isLoading, isFetching, isError, error } = usePosts({
    page,
    perPage: page === 1 ? (userId || search ? 10 : 12) : 10,
    user_id: userId,
    search,
  });
  const { categories } = useCategories();

  if (isLoading || isFetching) {
    return (
      <div className="space-y-8 py-6 animate-pulse">
        {/* Hero Banner Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
          <div className="lg:col-span-2 bg-muted rounded-2xl h-full" />
          <div className="space-y-4 h-full flex flex-col justify-between">
            <div className="bg-muted rounded-xl h-28" />
            <div className="bg-muted rounded-xl h-28" />
            <div className="bg-muted rounded-xl h-28" />
          </div>
        </div>

        {/* Section title skeleton */}
        <div className="h-8 bg-muted rounded w-48" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-muted rounded-xl h-80" />
          ))}
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

  // Zaira style layout data extraction
  const bigPost = page === 1 && !userId && !search ? posts[0] : undefined;
  const smallPosts = page === 1 && !userId && !search ? posts.slice(1, 4) : [];
  const recentPosts = page === 1 && !userId && !search ? posts.slice(4) : posts;

  // Fallback images for demonstration
  const getPostImage = (post: typeof bigPost) => {
    if (!post) return '';
    return post.first_image
      || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;
  };

  return (
    <div className="space-y-12 py-6">
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
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      {/* 1. Hero Banner Section (Zaira Style) */}
      {bigPost && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Big Featured Post (70% width on Desktop) */}
          <div className="lg:col-span-2 relative group overflow-hidden rounded-2xl aspect-[16/10] bg-zinc-950 border dark:border-border shadow-xs hover:shadow-md transition-all duration-300">
            <img
              src={getPostImage(bigPost)}
              alt={bigPost.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-4 text-white">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                {bigPost.category?.name || 'Technology'}
              </span>
              <h2 className="text-xl md:text-3xl font-extrabold leading-tight hover:underline">
                <Link href={`/posts/${bigPost.id}`} className="hover:text-white">
                  {bigPost.title}
                </Link>
              </h2>
              <div className="flex items-center gap-4 text-xs text-zinc-300">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {t("byAuthor", { name: bigPost.user?.name || t("admin", { defaultValue: "Admin" }) })}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDateTime(bigPost.created_at)}
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <Eye className="w-3.5 h-3.5" /> {t("viewsCount", { count: bigPost.views_count })}
                </span>
              </div>
            </div>
          </div>

          {/* Small Posts Stack (30% width on Desktop) */}
          <div className="space-y-4 flex flex-col justify-between">
            {smallPosts.map((post) => (
              <div
                key={post.id}
                className="relative group overflow-hidden rounded-xl h-[31%] min-h-[110px] bg-zinc-950 border dark:border-border shadow-xs hover:shadow-sm transition-all duration-300"
              >
                <img
                  src={getPostImage(post)}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-60"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 text-white">
                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {post.category?.name || 'Mobile'}
                  </span>
                  <h3 className="text-xs md:text-sm font-bold leading-snug line-clamp-2 hover:underline">
                    <Link href={`/posts/${post.id}`} className="hover:text-white">
                      {post.title}
                    </Link>
                  </h3>
                </div>
              </div>
            ))}
            {smallPosts.length === 0 && (
              <div className="flex items-center justify-center h-full border rounded-xl border-dashed p-6 text-center text-muted-foreground">
                {t("updatingFeatured", { defaultValue: "Đang cập nhật các bài viết tiêu điểm..." })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Main Portal Area: Recent Posts + Sidebar */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Posts List (User layout grid) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h2 className="text-lg font-bold text-muted-foreground dark:text-primary uppercase tracking-wider relative">
              {t("latestPosts", { defaultValue: "Bài viết mới nhất" })}
            </h2>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border">
              <button
                onClick={() => setViewMode('grid')}
                title="Dạng lưới"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="Dạng danh sách"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {recentPosts.length > 0 && (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-6"}>
              {recentPosts.map((post) => (
                viewMode === 'grid' 
                  ? <PostCard key={post.id} post={post} /> 
                  : <PostListCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t dark:border-zinc-800">
              {/* Previous Button */}
              <Link
                href={page > 1 ? `/?page=${page - 1}` : '#'}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 ${
                  page <= 1
                    ? 'opacity-50 pointer-events-none text-zinc-400 border-zinc-200 dark:border-zinc-800'
                    : 'text-zinc-700 hover:bg-gray-50 border-gray-200 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-950'
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
                    className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#3498db] text-white'
                        : 'border border-gray-200 hover:bg-gray-50 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-950'
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
                    ? 'opacity-50 pointer-events-none text-zinc-400 border-zinc-200 dark:border-zinc-800'
                    : 'text-zinc-700 hover:bg-gray-50 border-gray-200 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-950'
                }`}
              >
                {common("next", { defaultValue: "Sau" })}
              </Link>
            </div>
          )}

          {posts.length === 0 && (
            <div className="text-center py-12 border rounded-2xl border-dashed">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">{t("noPosts", { defaultValue: "Hiện tại chưa có bài viết nào được xuất bản." })}</p>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          {/* Sidebar Hot Categories Widget */}
          <div className="rounded-xl border bg-card p-6 shadow-xs">
            <h3 className="text-sm font-bold text-muted-foreground dark:text-primary uppercase tracking-wider pb-2 border-b mb-4">
              {t("hotCategories", { defaultValue: "Danh mục nổi bật" })}
            </h3>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/forum/${cat.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-all group"
                >
                  <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 group-hover:text-primary">
                    {cat.name}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">{t("loadingCategories", { defaultValue: "Đang tải danh mục..." })}</p>
              )}
            </div>
          </div>

          {/* Hot Posts Async Widget */}
          <HotPostsWidget />

          {/* Top Authors Async Widget */}
          <TopAuthorsWidget />
        </div>
      </section>
    </div>
  );
}

function HotPostsWidget() {
  const { posts, isLoading } = useHotPosts();
  const t = useTranslations("HomePage");

  return (
    <div className="rounded-xl border bg-card p-6 shadow-xs">
      <h3 className="text-sm font-bold text-muted-foreground dark:text-primary uppercase tracking-wider pb-2 border-b mb-4 flex items-center gap-1.5">
        <span>🔥</span> {t("hotPosts", { defaultValue: "Bài viết đang HOT" })}
      </h3>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-6 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="flex items-center gap-3 group text-xs text-muted-foreground dark:text-zinc-300 hover:text-primary transition-colors"
            >
              <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded-md font-black italic text-xs bg-muted text-muted-foreground">
                {index + 1}
              </div>
              <span className="font-semibold line-clamp-2 min-w-0">
                {post.title}
              </span>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">{t("noHotPosts", { defaultValue: "Chưa có bài viết nổi bật." })}</p>
          )}
        </div>
      )}
    </div>
  );
}

function TopAuthorsWidget() {
  const { authors, isLoading } = useTopAuthors();
  const t = useTranslations("HomePage");

  return (
    <div className="rounded-xl border bg-card p-6 shadow-xs">
      <h3 className="text-sm font-bold text-muted-foreground dark:text-primary uppercase tracking-wider pb-2 border-b mb-4 flex items-center gap-1.5">
        <span>👑</span> {t("topAuthors", { defaultValue: "Tác giả yêu thích" })}
      </h3>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-10 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {authors.map((author: any) => (
            <Link
              key={author.id}
              href={`/users/${author.id}`}
              className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={author.avatar_url || author.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${author.id || 'U'}`}
                  alt={author.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-muted-foreground dark:text-zinc-200 group-hover:text-primary transition-colors truncate">
                    {author.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {t("postsCount", { count: author.posts_count, defaultValue: `${author.posts_count} bài viết` })}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#e5127d] bg-[#e5127d]/5 px-2 py-0.5 rounded-full shrink-0">
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
      <div className="space-y-8 py-6 animate-pulse">
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
