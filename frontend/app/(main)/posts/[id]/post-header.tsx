'use client';

import React from 'react';
import Link from 'next/link';
import type { Post } from '@/features/posts/types';
import { Calendar, Eye, Tag } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/format-date';
import { useTranslations } from 'next-intl';

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  const t = useTranslations("PostDetail.postHeader");
  return (
    <header className="space-y-6">
      {/* Category */}
      {post.category && (
        <Link href={`/forum/${post.category.slug}`}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
            <Tag className="w-3 h-3" />
            {post.category.name}
          </span>
        </Link>
      )}

      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
        {post.title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <Link href={`/users/${post.user?.id}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-muted">
              <img
                src={post.user?.avatar_url || post.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user?.id || 'A'}`}
                alt={post.user?.name || t('author')}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-foreground font-medium">{post.user?.name || t('anonymous')}</p>
              <p className="text-xs">{t('author')}</p>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{formatDateTime(post.created_at)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4" />
          <span>{t('views', { count: post.views_count.toLocaleString() })}</span>
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/20 text-xs border border-border transition-all cursor-pointer"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
