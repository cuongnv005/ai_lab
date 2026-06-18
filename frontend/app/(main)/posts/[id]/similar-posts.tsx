'use client';

import React from 'react';
import Link from 'next/link';
import { useSimilarPosts } from '@/features/posts/hooks/use-similar-posts';
import { Loader2, ArrowRight } from 'lucide-react';
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
    <div className="my-10 p-6 bg-muted/30 border border-border rounded-xl">
      <h3 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
        <span>{t('title')}</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => {
          const imageUrl = (post.content || '').match(/\[img\]\s*(.*?)\s*\[\/img\]/i)?.[1] 
            || (post.content || '').match(/src=["'](.*?)["']/i)?.[1]
            || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;

          return (
            <Link 
              key={post.id} 
              href={`/posts/${post.id}`}
              className="group flex flex-col bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all hover:shadow-md"
            >
              <div className="h-32 relative bg-zinc-950">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h4 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDateTime(post.created_at)}</span>
                  <span className="flex items-center gap-1 group-hover:text-primary">
                    {t('readMore')}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
