"use client";

import React, { use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTagPosts } from '@/features/posts/hooks/use-posts';
import { PostListTable } from '@/features/posts/components/post-list-table';
import { Tag, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TagPostsPageProps {
  params: Promise<{ tagSlug: string }>;
}

export default function TagPostsPage({ params }: TagPostsPageProps) {
  const { tagSlug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') || '1');
  const t = useTranslations("TagPage");

  const { posts, pagination, isLoading, isFetching, isError } = useTagPosts(tagSlug, {
    page,
    perPage: 10,
  });

  if (isLoading || isFetching) {
    return (
      <div className="space-y-6 py-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-32 mb-4" />
        <div className="border-b pb-6 space-y-3">
          <div className="h-5 bg-muted rounded w-28" />
          <div className="h-8 bg-muted rounded w-56" />
        </div>
        <div className="border border-border rounded-xl overflow-hidden bg-card divide-y divide-border shadow-xs">
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
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("back", { defaultValue: "Quay lại" })}</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div className="space-y-2">
          <span className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
            {t("tagLabel", { defaultValue: "Thẻ chủ đề" })}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-500" />
            #{tagSlug}
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            {t("subtitle", { tagSlug: `#${tagSlug}`, defaultValue: `Danh sách bài viết được gắn thẻ #${tagSlug}.` })}
            {pagination && <span> {t("totalPosts", { count: pagination.total, defaultValue: `(${pagination.total} bài viết)` })}</span>}
          </p>
        </div>
      </div>

      <PostListTable
        posts={posts}
        pagination={pagination}
        basePath={`/tags/${tagSlug}`}
        emptyTitle={t("emptyTitle", { tagSlug: `#${tagSlug}`, defaultValue: `Chưa có bài viết nào với thẻ #${tagSlug}.` })}
        emptyDescription={t("emptyDescription", { defaultValue: "Hãy khám phá các chủ đề khác!" })}
      />
    </div>
  );
}
