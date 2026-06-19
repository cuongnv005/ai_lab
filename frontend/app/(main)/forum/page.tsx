"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCategories } from '@/features/posts/hooks/use-posts';
import type { Category, Post } from '@/features/posts/types';
import { 
  ArrowRight, MessageSquare, BookOpen, Newspaper, Code, 
  Laptop, ChevronDown, ChevronUp, FileText 
} from 'lucide-react';
import { formatDateTime } from '@/shared/lib/format-date';
import { useTranslations } from 'next-intl';




// Category icon selector
const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'news':
    case 'tin-tuc':
      return Newspaper;
    case 'code':
    case 'lap-trinh':
      return Code;
    case 'tech':
    case 'cong-nghe':
      return Laptop;
    default:
      return MessageSquare;
  }
};

// Relative time formatter matching "1 tháng trước đây" format
const getRelativeTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return dateStr;
    
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHr < 24) return `${diffHr} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} tháng trước đây`;
    
    return formatDateTime(dateStr);
  } catch {
    return dateStr;
  }
};

export default function ForumPage() {
  const { categories, isLoading, isError } = useCategories();
  const [collapsedCategories, setCollapsedCategories] = useState<Record<number, boolean>>({});
  const t = useTranslations("ForumPage");

  const toggleCategory = (id: number) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48 mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-muted rounded-xl h-60" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-500 animate-bounce">{t("errorTitle", { defaultValue: "Đã xảy ra lỗi khi tải dữ liệu" })}</h2>
        <p className="text-muted-foreground text-sm">{t("errorMessage", { defaultValue: "Vui lòng thử lại sau hoặc liên hệ ban quản trị." })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-[#E2E8F0] dark:border-[#2d2d30] pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-2">
          <span>💬</span> {t("title", { defaultValue: "Diễn đàn thảo luận" })}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {t("description", { defaultValue: "Chọn một danh mục bên dưới để bắt đầu xem và tham gia thảo luận." })}
        </p>
      </div>

      {/* Categories Wrap List */}
      <div className="space-y-6">
          {categories.map((category: Category) => {
          const IconComponent = getCategoryIcon(category.slug);
          const isCollapsed = collapsedCategories[category.id];
          const latestPosts = category.latest_posts || [];

          return (
            <div
              key={category.id}
              className="bg-card border border-[#E2E8F0] dark:border-[#2d2d30] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
            >
              {/* Category Info Header */}
              <div className="p-5 md:p-6 flex items-start justify-between gap-4 bg-muted/20">
                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div className="shrink-0">
                    <div className="w-11 h-11 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-primary">
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white hover:text-primary transition-colors">
                      <Link href={`/forum/${category.slug}`}>
                        {category.name}
                      </Link>
                    </h2>
                    {category.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                        {category.description}
                      </p>
                    )}
                    <div className="text-[11px] font-semibold text-muted-foreground pt-1 flex items-center gap-1">
                      <span>{t("postsCount", { defaultValue: "Bài viết:" })}</span>
                      <span className="text-foreground">{category.posts_count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Toggle */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0"
                  title={isCollapsed ? t("expand", { defaultValue: "Mở rộng" }) : t("collapse", { defaultValue: "Thu gọn" })}
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Latest Posts List (collapsible) */}
              {!isCollapsed && (
                <div className="border-t border-[#E2E8F0] dark:border-[#2d2d30] bg-card">
                  <div className="p-6 pb-4">
                    <ul className="space-y-3">
                      {latestPosts.map((post: Post) => {
                        const avatarUrl = post.user?.avatar_url || post.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user?.id || 'A'}`;
                        return (
                          <li 
                            key={post.id} 
                            className="grid grid-cols-12 items-center gap-4 py-2 hover:bg-muted/30 rounded-lg px-2 transition-colors border border-transparent hover:border-border"
                          >
                            {/* Left: Title & File icon */}
                            <div className="col-span-10 sm:col-span-8 flex items-center gap-3 min-w-0">
                              {/* File Icon */}
                              <div className="shrink-0 w-8 h-8 rounded border border-border border-dotted flex items-center justify-center text-muted-foreground bg-muted/10">
                                <FileText className="w-4 h-4" />
                              </div>
                              {/* Title and Replies Count */}
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/posts/${post.id}`}
                                  className="text-xs font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                                  title={post.title}
                                >
                                  {post.title}
                                </Link>
                                <span className="text-[10px] text-muted-foreground">{t("repliesCount", { count: post.comments_count || 0, defaultValue: `Phản hồi: ${post.comments_count || 0}` })}</span>
                              </div>
                            </div>

                            {/* Middle: Avatar (Centered) */}
                            <div className="col-span-2 sm:col-span-1 flex justify-center shrink-0">
                              <div className="w-7 h-7 rounded-full overflow-hidden border bg-muted">
                                <img
                                  src={avatarUrl}
                                  alt={post.user?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            {/* Right: Username & Time (Left-aligned, fixed X-axis starting point) */}
                            <div className="col-span-3 text-left text-[10px] hidden sm:block min-w-0">
                              <span className="font-semibold text-foreground text-xs block truncate" title={post.user?.name}>
                                {post.user?.name}
                              </span>
                              <span className="text-muted-foreground">{getRelativeTime(post.created_at)}</span>
                            </div>
                          </li>
                        );
                      })}

                      {latestPosts.length === 0 && (
                        <li className="text-center py-6 text-xs text-muted-foreground">
                          {t("noTopics", { defaultValue: "Chưa có chủ đề nào trong danh mục này." })}
                        </li>
                      )}

                      {/* View All Button */}
                      <li className="pt-3 border-t border-[#E2E8F0] dark:border-[#2d2d30] flex justify-end">
                        <Link
                          href={`/forum/${category.slug}`}
                          className="text-xs font-bold text-primary hover:text-primary/80 hover:underline flex items-center gap-1"
                        >
                          {t("viewAll", { defaultValue: "xem tất cả các chủ đề" })}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="text-center py-12 border rounded-2xl border-dashed">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">{t("noCategories", { defaultValue: "Chưa có danh mục thảo luận nào được tạo." })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
