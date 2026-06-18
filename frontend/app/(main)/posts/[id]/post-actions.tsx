'use client';

import React from 'react';
import type { Post } from '@/features/posts/types';
import type { User } from '@/features/auth/types';
import { Heart, Share2, Flag, MessageCircle } from 'lucide-react';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface PostActionsProps {
  post: Post;
  isAuthenticated: boolean;
  currentUser?: User | null;
  isLiking: boolean;
  onToggleLike: () => Promise<void>;
  onReport: () => void;
  isSidebar?: boolean;
}

export function PostActions({
  post,
  isAuthenticated,
  currentUser,
  isLiking,
  onToggleLike,
  onReport,
  isSidebar = false,
}: PostActionsProps) {
  const t = useTranslations("PostDetail.postActions");
  const isOwner = currentUser?.id === String(post?.user?.id);
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t('copySuccess'));
    } catch {
      toast.error(t('copyError'));
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info(t('loginToLike'));
      return;
    }
    try {
      await onToggleLike();
    } catch {
      toast.error(t('likeError'));
    }
  };

  const scrollToComments = () => {
    const element = document.getElementById('comments-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isSidebar) {
    return (
      <div className="flex flex-col items-center gap-6 py-4">
        {/* Like Button */}
        <div className="flex flex-col items-center gap-1 group">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isLiking ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
              post.is_liked
                ? 'bg-red-500/10 border-red-500/30 text-red-500'
                : 'bg-background hover:bg-zinc-50 border-border hover:border-zinc-300 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800'
            }`}
            title={t('like')}
          >
            <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${post.is_liked ? 'fill-current' : ''}`} />
          </button>
          <span className="text-xs font-semibold text-zinc-500">{post.likes_count || 0}</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center gap-1 group">
          <button
            onClick={handleShare}
            className="w-12 h-12 rounded-full border bg-background hover:bg-zinc-50 border-border hover:border-zinc-300 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-all cursor-pointer"
            title={t('share')}
          >
            <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center gap-1 group">
          <button
            onClick={scrollToComments}
            className="w-12 h-12 rounded-full border bg-background hover:bg-zinc-50 border-border hover:border-zinc-300 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-all cursor-pointer"
            title={t('comment')}
          >
            <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>
          <span className="text-xs font-semibold text-zinc-500">{post.comments_count || 0}</span>
        </div>

        {/* Divider */}
        {isAuthenticated && !isOwner && <div className="w-8 h-[1px] bg-border my-2" />}

        {/* Report Button */}
        {isAuthenticated && !isOwner && (
          <button
            onClick={onReport}
            disabled={post.is_reported}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              post.is_reported 
                ? 'cursor-not-allowed opacity-40 text-zinc-400 dark:text-zinc-600' 
                : 'hover:bg-red-500/10 text-zinc-400 hover:text-red-500 cursor-pointer'
            }`}
            title={post.is_reported ? t('alreadyReported') : t('report')}
          >
            <Flag className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Horizontal version for mobile/inline
  return (
    <div className="flex items-center flex-wrap gap-3 py-6 border-y border-border mt-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLiking}
        className={`flex items-center gap-2 transition-all ${
          post.is_liked
            ? 'text-red-500 hover:text-red-400 font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
        <span>{post.likes_count || 0} {t('likes')}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="text-muted-foreground hover:text-foreground flex items-center gap-2"
      >
        <Share2 className="w-5 h-5" />
        <span>{t('share')}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={scrollToComments}
        className="text-muted-foreground hover:text-foreground flex items-center gap-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{post.comments_count || 0} {t('comments')}</span>
      </Button>

      <div className="flex-1" />

      {isAuthenticated && !isOwner && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReport}
          disabled={post.is_reported}
          className={`text-muted-foreground flex items-center gap-2 ${
            post.is_reported 
              ? 'opacity-40 cursor-not-allowed text-zinc-400 dark:text-zinc-600' 
              : 'hover:text-red-500'
          }`}
          title={post.is_reported ? t('alreadyReported') : t('report')}
        >
          <Flag className="w-5 h-5" />
          <span>{t('report')}</span>
        </Button>
      )}
    </div>
  );
}
