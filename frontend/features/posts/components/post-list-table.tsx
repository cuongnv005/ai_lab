"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/format-date';
import type { Post } from '../types';
import { useTranslations } from 'next-intl';

interface Pagination {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

interface PostListTableProps {
  posts: Post[];
  pagination: Pagination | null;
  /** Base path for pagination links, e.g. /forum/my-category or /tags/ai */
  basePath: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function PostListTable({
  posts,
  pagination,
  basePath,
  emptyTitle = 'Chưa có bài viết nào.',
  emptyDescription = 'Hãy là người đầu tiên đăng bài!',
}: PostListTableProps) {
  const commonT = useTranslations('Common');
  const page = pagination?.currentPage ?? 1;

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 border rounded-2xl border-dashed">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground font-medium mb-1">{emptyTitle}</p>
        <p className="text-xs text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thread list */}
      <div className="border border-border rounded-xl overflow-hidden bg-card divide-y divide-border shadow-xs">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center p-4 hover:bg-muted/30 transition-all gap-4">
            {/* Avatar Cell */}
            <div className="flex-shrink-0">
              <Link
                href={`/user/${post.user?.id || ''}`}
                className="block h-10 w-10 overflow-hidden rounded-full border bg-muted"
              >
                <img
                  src={
                    post.user?.avatar_url || post.user?.avatar ||
                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user?.id || 'U'}`
                  }
                  alt={post.user?.name || 'User'}
                  className="h-full w-full object-cover"
                />
              </Link>
            </div>

            {/* Main Info Cell */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground leading-snug hover:underline truncate">
                <Link href={`/posts/${post.id}`}>{post.title}</Link>
              </div>
              {post.category && (
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  <Link
                    href={`/forum/${post.category.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {post.category.name}
                  </Link>
                </div>
              )}
            </div>

            {/* Meta Stats Cell */}
            <div className="hidden sm:flex flex-col items-end justify-center w-28 text-right text-xs gap-1 border-r border-border/50 pr-4">
              <div className="flex justify-between w-full text-muted-foreground">
                <span>{commonT('replies', { defaultValue: 'Lượt trả lời' })}</span>
                <span className="font-semibold text-foreground">{post.comments_count || 0}</span>
              </div>
              <div className="flex justify-between w-full text-muted-foreground">
                <span>{commonT('views', { defaultValue: 'Lượt xem' })}</span>
                <span className="font-semibold text-foreground">{post.views_count || 0}</span>
              </div>
            </div>

            {/* Latest Activity Cell */}
            <div className="hidden md:flex items-center gap-3 w-44 pl-2 text-xs">
              <div className="h-7 w-7 overflow-hidden rounded-full border bg-muted flex-shrink-0">
                <img
                  src={
                    post.user?.avatar_url || post.user?.avatar ||
                    `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user?.id || 'U'}`
                  }
                  alt="Latest"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-muted-foreground truncate">{formatDateTime(post.created_at)}</span>
                <span className="font-semibold text-foreground truncate">{post.user?.name || 'User'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t dark:border-zinc-800">
          <Link
            href={page > 1 ? `${basePath}?page=${page - 1}` : '#'}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 ${
              page <= 1
                ? 'opacity-50 pointer-events-none text-zinc-400 border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-700 hover:bg-gray-50 border-gray-200 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-950'
            }`}
          >
            {commonT('prev', { defaultValue: 'Trước' })}
          </Link>

          {Array.from({ length: pagination.lastPage }).map((_, index) => {
            const p = index + 1;
            const isActive = p === page;
            return (
              <Link
                key={p}
                href={`${basePath}?page=${p}`}
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

          <Link
            href={page < pagination.lastPage ? `${basePath}?page=${page + 1}` : '#'}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 ${
              page >= pagination.lastPage
                ? 'opacity-50 pointer-events-none text-zinc-400 border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-700 hover:bg-gray-50 border-gray-200 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-950'
            }`}
          >
            {commonT('next', { defaultValue: 'Sau' })}
          </Link>
        </div>
      )}
    </div>
  );
}
