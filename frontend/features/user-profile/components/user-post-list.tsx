"use client";

import { useTranslations } from "next-intl";
import { PostListCard } from "@/features/posts/components/post-card";
import { type Post } from "@/features/posts/types";

export interface UserPostListProps {
  posts: Post[];
  isLoading: boolean;
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
  onPageChange: (page: number) => void;
}

export function UserPostList({ posts, isLoading, meta, onPageChange }: UserPostListProps) {
  const t = useTranslations("profile");
  const commonT = useTranslations("Common");

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
        {t("noPosts", { defaultValue: "Người dùng chưa có bài viết nào." })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {posts.map((post) => (
          <PostListCard key={post.id} post={post} />
        ))}
      </div>

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t dark:border-zinc-800">
          <button
            onClick={() => onPageChange(meta.current_page - 1)}
            disabled={meta.current_page === 1}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
              meta.current_page <= 1
                ? 'opacity-50 pointer-events-none text-zinc-400 border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-700 hover:bg-gray-50 border-gray-200 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-950'
            }`}
          >
            {commonT("prev")}
          </button>

          {Array.from({ length: meta.last_page }).map((_, index) => {
            const p = index + 1;
            const isActive = p === meta.current_page;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3498db] text-white'
                    : 'border border-gray-200 hover:bg-gray-50 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-950'
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
              meta.current_page >= meta.last_page
                ? 'opacity-50 pointer-events-none text-zinc-400 border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-700 hover:bg-gray-50 border-gray-200 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-950'
            }`}
          >
            {commonT("next")}
          </button>
        </div>
      )}
    </div>
  );
}
