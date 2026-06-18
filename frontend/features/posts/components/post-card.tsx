import React from 'react';
import Link from 'next/link';
import { User, Calendar, Eye } from 'lucide-react';
import type { Post } from '../types';
import { formatDateTime } from '@/shared/lib/format-date';

import { cleanBBCode } from '@/shared/lib/bbcode';
import { useTranslations } from 'next-intl';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const commonT = useTranslations('Common');
  // Extract summary text cleanly
  const cleanSummary = cleanBBCode(post.summary || post.content || '').substring(0, 180);

  // Use pre-extracted first_image from the backend
  const imageUrl = post.first_image 
    || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;

  const formattedDate = formatDateTime(post.created_at);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-border overflow-hidden group shadow-xs hover:shadow-md transition-all duration-300">
      {/* Thumbnail Image */}
      <div className="relative overflow-hidden aspect-[16/10] bg-zinc-950">
        <Link href={`/posts/${post.id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Category Badge */}
          <span className="bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded mb-3 inline-block uppercase tracking-wider">
            {post.category?.name || 'Discussion'}
          </span>

          {/* Title */}
          <h4 className="text-base font-bold leading-snug text-zinc-900 dark:text-white hover:text-[#3498db] dark:hover:text-[#e74c3c] transition-colors mb-3 line-clamp-2">
            <Link href={`/posts/${post.id}`}>
              {post.title}
            </Link>
          </h4>

          {/* Summary */}
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
            {cleanSummary}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 border-t border-gray-150 dark:border-zinc-850 pt-3 mt-auto">
          {/* Author */}
          {post.user_id ? (
            <Link href={`/users/${post.user_id}`} className="flex items-center gap-1 hover:text-blue-500 hover:underline">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              {post.user?.name || 'Anonymous'}
            </Link>
          ) : (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              {post.user?.name || 'Anonymous'}
            </span>
          )}

          {/* Created Time */}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            {commonT('at', { date: formattedDate })}
          </span>

          {/* View Count */}
          <span className="flex items-center gap-1 ml-auto text-red-500 dark:text-red-400">
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="font-medium">{post.views_count}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const PostListCard: React.FC<PostCardProps> = ({ post }) => {
  const cleanSummary = cleanBBCode(post.summary || post.content || '').substring(0, 200);

  const imageUrl = post.first_image 
    || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-border overflow-hidden group shadow-xs hover:shadow-md transition-all duration-300">
      {/* Thumbnail Image */}
      <Link href={`/posts/${post.id}`} className="shrink-0 w-full sm:w-[240px] md:w-[280px] overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-36 sm:h-full aspect-video sm:aspect-auto object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow min-w-0">
        <h4 className="text-lg font-bold leading-snug text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 line-clamp-2">
          <Link href={`/posts/${post.id}`}>
            {post.title}
          </Link>
        </h4>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4">
          {cleanSummary}
        </p>

        {/* Footer */}
        {post.user_id ? (
          <Link href={`/users/${post.user_id}`} className="flex items-center gap-2 mt-auto pt-2 group-hover:opacity-80 transition-opacity">
            <img 
              src={post.user?.avatar_url || post.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user_id || 'U'}`} 
              alt={post.user?.name || 'User'} 
              className="w-6 h-6 rounded-full bg-muted object-cover" 
            />
            <span className="text-sm font-bold text-muted-foreground dark:text-zinc-400 group-hover:text-blue-500 truncate transition-colors">
              {post.user?.name || 'Anonymous'}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 mt-auto pt-2">
            <img 
              src={post.user?.avatar_url || post.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user_id || 'U'}`} 
              alt={post.user?.name || 'User'} 
              className="w-6 h-6 rounded-full bg-muted object-cover" 
            />
            <span className="text-sm font-bold text-muted-foreground dark:text-zinc-400 truncate">
              {post.user?.name || 'Anonymous'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
