'use client';

import React from 'react';
import Link from 'next/link';
import type { Post } from '@/features/posts/types';
import { Calendar, Eye } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/format-date';
import { useTranslations } from 'next-intl';

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  const t = useTranslations("PostDetail.postHeader");
  
  return (
    <header className="mb-8 text-left">
      {/* Category & Tags Row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {post.category && (
          <Link href={`/forum/${post.category.slug}`}>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer font-label-sm">
              #{post.category.name}
            </span>
          </Link>
        )}
        {post.tags && post.tags.map((tag) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            <span className="bg-secondary/10 text-on-secondary dark:text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold border border-[#E2E8F0] dark:border-[#2d2d30] hover:bg-secondary/20 transition-all cursor-pointer font-label-sm">
              #{tag.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Title */}
      <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-6 leading-tight text-on-surface">
        {post.title}
      </h1>

      {/* Author & Meta Row */}
      <div className="flex items-center gap-4 border-y border-[#E2E8F0] dark:border-[#2d2d30] py-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
          <img
            src={post.user?.avatar_url || post.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user?.id || 'A'}`}
            alt={post.user?.name || t('author')}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {post.user_id ? (
              <Link href={`/users/${post.user_id}`} className="font-bold text-on-surface hover:text-primary transition-colors text-base hover:underline">
                {post.user?.name || t('anonymous')}
              </Link>
            ) : (
              <span className="font-bold text-on-surface text-base">
                {post.user?.name || t('anonymous')}
              </span>
            )}
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">
              {t('author')}
            </span>
          </div>
          <div className="flex items-center gap-4 text-on-secondary/80 dark:text-on-surface-variant text-xs mt-1 font-label-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{formatDateTime(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>{t('views', { count: post.views_count.toLocaleString() })}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
