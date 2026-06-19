"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCategoryPosts, useCategories } from '@/features/posts/hooks/use-posts';
import { PostListTable } from '@/features/posts/components/post-list-table';
import { useAuth } from '@/features/auth';
import { MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CategoryDetailPageProps {
  params: Promise<{ categorySlug: string }>;
}

export default function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { categorySlug } = use(params);
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') || '1');
  const t = useTranslations("CategoryPage");

  const { posts, pagination, isLoading, isFetching, isError } = useCategoryPosts(categorySlug, {
    page,
    perPage: 10,
  });
  const { categories } = useCategories();
  const { isAuthenticated } = useAuth();

  const currentCategory = categories.find((c) => c.slug === categorySlug);

  if (isLoading || isFetching) {
    return (
      <div className="space-y-6 py-6 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-4 bg-muted rounded w-32 mb-4" />

        {/* Category Header skeleton */}
        <div className="border-b border-[#E2E8F0] dark:border-[#2d2d30] pb-6 space-y-3">
          <div className="h-5 bg-muted rounded w-28" />
          <div className="h-8 bg-muted rounded w-56" />
          <div className="h-4 bg-muted rounded w-full max-w-xl" />
        </div>

        {/* XenForo-style list skeleton */}
        <div className="border border-[#E2E8F0] dark:border-[#2d2d30] rounded-xl overflow-hidden bg-card divide-y divide-border shadow-xs">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center p-4 gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1.5 w-28 pr-4">
                <div className="h-3 bg-muted rounded w-16" />
                <div className="h-3 bg-muted rounded w-12" />
              </div>
              <div className="hidden md:flex items-center gap-3 w-44 pl-2">
                <div className="h-7 w-7 rounded-full bg-muted flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-3 bg-muted rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-500">{t("errorTitle", { defaultValue: "Đã xảy ra lỗi khi tải dữ liệu" })}</h2>
        <p className="text-muted-foreground">{t("errorMessage", { defaultValue: "Vui lòng thử lại sau hoặc liên hệ ban quản trị." })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Back Link */}
      <div>
        <Link
          href="/forum"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("backToForum", { defaultValue: "Quay lại diễn đàn" })}</span>
        </Link>
      </div>

      {/* Category Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6">
        <div className="space-y-2">
          <span className="bg-primary/10 text-primary dark:bg-primary/20 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
            {t("categoryDiscussion", { defaultValue: "Thảo luận chuyên mục" })}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase">
            {currentCategory?.name || t("categoryFallback", { defaultValue: "Chuyên mục" })}
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            {currentCategory?.description ||
              t("descriptionFallback", { defaultValue: 'Tham gia viết bài, đưa ra các câu hỏi, prompts hoặc thảo luận về chủ đề công nghệ này.' })}
          </p>
        </div>

        {isAuthenticated && (
          <Link
            href={`/dashboard/write?category_id=${currentCategory?.id || ''}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white px-5 py-3 text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-200"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{t("writePost", { defaultValue: "Viết bài thảo luận" })}</span>
          </Link>
        )}
      </div>

      <PostListTable
        posts={posts}
        pagination={pagination}
        basePath={`/forum/${categorySlug}`}
        emptyTitle={t("emptyTitle", { defaultValue: "Chưa có bài thảo luận nào trong danh mục này." })}
        emptyDescription={t("emptyDescription", { defaultValue: "Hãy là người đầu tiên khơi dậy cuộc hội thoại!" })}
      />
    </div>
  );
}
