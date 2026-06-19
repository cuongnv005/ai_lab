import React from 'react';
import Link from 'next/link';
import type { Post } from '../types';
import { formatDateTime } from '@/shared/lib/format-date';
import { cleanBBCode } from '@/shared/lib/bbcode';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  // Extract summary text cleanly
  const cleanSummary = cleanBBCode(post.summary || post.content || '').substring(0, 150);

  // Use pre-extracted first_image from the backend
  const imageUrl = post.first_image 
    || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;

  const formattedDate = formatDateTime(post.created_at);

  return (
    <div className="flex flex-col group cursor-pointer glass-card rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300">
      {/* Thumbnail Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-zinc-950">
        <Link href={`/posts/${post.id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4">
        {/* Category Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block w-fit px-3 bg-primary dark:bg-[#0047ab] text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
            {post.category?.name || 'Discussion'}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-lg font-bold leading-snug text-on-surface group-hover:text-primary transition-colors mb-2 line-clamp-2">
          <Link href={`/posts/${post.id}`}>
            {post.title}
          </Link>
        </h4>

        {/* Summary */}
        <p className="text-sm text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">
          {cleanSummary}
        </p>

        {/* Author Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/30">
          <div className="flex items-center gap-3">
            <img 
              src={post.user?.avatar_url || post.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user_id || 'U'}`} 
              alt={post.user?.name || 'User'} 
              className="w-6 h-6 rounded-full bg-muted object-cover border border-outline-variant/50" 
            />
            {post.user_id ? (
              <Link href={`/users/${post.user_id}`} className="text-xs font-semibold text-on-surface hover:text-primary hover:underline transition-colors truncate">
                {post.user?.name || 'Anonymous'}
              </Link>
            ) : (
              <span className="text-xs font-semibold text-on-surface truncate">
                {post.user?.name || 'Anonymous'}
              </span>
            )}
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PostListCard: React.FC<PostCardProps> = ({ post }) => {
  const cleanSummary = cleanBBCode(post.summary || post.content || '').substring(0, 180);

  const imageUrl = post.first_image 
    || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;

  const formattedDate = formatDateTime(post.created_at);

  return (
    <article className="flex flex-col md:flex-row gap-6 group cursor-pointer glass-card rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-primary/20 transition-all duration-300">
      {/* Thumbnail Image */}
      <div className="md:w-[45%] aspect-[3/2] rounded-xl overflow-hidden shrink-0 bg-zinc-950">
        <Link href={`/posts/${post.id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="md:w-[65%] flex flex-col justify-between py-1">
        <div>
          <div className="flex items-center gap-3 mb-2.5">
            <span className="inline-block w-fit px-3 bg-primary dark:bg-[#0047ab] text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
              {post.category?.name || 'Discussion'}
            </span>
          </div>

          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-3">
            <Link href={`/posts/${post.id}`}>
              {post.title}
            </Link>
          </h3>

          <p className="text-sm text-on-surface-variant mb-4 line-clamp-3 leading-relaxed">
            {cleanSummary}
          </p>
        </div>

        {/* Author Footer */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <img 
              src={post.user?.avatar_url || post.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user_id || 'U'}`} 
              alt={post.user?.name || 'User'} 
              className="w-6 h-6 rounded-full bg-muted object-cover border border-outline-variant/50" 
            />
            {post.user_id ? (
              <Link href={`/users/${post.user_id}`} className="text-xs font-semibold text-on-surface hover:text-primary hover:underline transition-colors">
                {post.user?.name || 'Anonymous'}
              </Link>
            ) : (
              <span className="text-xs font-semibold text-on-surface">
                {post.user?.name || 'Anonymous'}
              </span>
            )}
          </div>
          
          <span className="text-xs text-on-surface-variant font-medium">
            {formattedDate}
          </span>
        </div>
      </div>
    </article>
  );
};
