'use client';

import React from 'react';
import Link from 'next/link';
import { useSimilarPosts } from '@/features/posts/hooks/use-similar-posts';
import { Loader2 } from 'lucide-react';
import { formatDateTime } from '@/shared/lib/format-date';
import { useTranslations } from 'next-intl';

interface SimilarPostsProps {
  postId: number;
  tagQuery?: string;
}

export function SimilarPosts({ postId, tagQuery }: SimilarPostsProps) {
  const t = useTranslations("PostDetail.similarPosts");
  const { posts, isLoading, isError } = useSimilarPosts(postId, tagQuery);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-6 border-t border-[#E2E8F0] dark:border-[#2d2d30] text-left">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
          {t('title')}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map((post) => {
          const imageUrl = (post.content || '').match(/\[img\]\s*(.*?)\s*\[\/img\]/i)?.[1] 
            || (post.content || '').match(/src=["'](.*?)["']/i)?.[1]
            || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;

          return (
            <Link 
              key={post.id} 
              href={`/posts/${post.id}`}
              className="glass-card rounded-xl p-4 flex gap-4 hover:bg-surface-container-highest/20 transition-all group"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-950">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="font-body-md font-bold text-on-surface line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
                <span className="text-xs text-on-surface-variant/60">
                  {formatDateTime(post.created_at)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
