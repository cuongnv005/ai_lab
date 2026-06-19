'use client';

import React from 'react';
import type { Post } from '@/features/posts/types';
import type { User } from '@/features/auth/types';
import { Heart, Share2, Flag, MessageCircle } from 'lucide-react';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@bks/ds-system-sdk/components/ui/tooltip';

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
      <div className="sticky top-28 flex flex-col gap-4 items-center">
        {/* Like Button */}
        <button 
          onClick={handleLike}
          disabled={isLiking}
          className="flex flex-col items-center group cursor-pointer focus:outline-none"
        >
          <div className={`w-10 h-10 rounded-full glass-card flex items-center justify-center transition-all ${
            post.is_liked
              ? 'bg-red-500/10 text-red-500 border-red-500/30'
              : 'group-hover:bg-primary/5 dark:group-hover:bg-primary-container dark:group-hover:text-on-primary-container text-on-surface-variant'
          }`}>
            <Heart size={18} className={`${post.is_liked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[11px] font-medium mt-1 text-on-surface-variant">
            {post.likes_count || 0}
          </span>
        </button>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="flex flex-col items-center group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center group-hover:bg-surface-container-highest text-on-surface-variant transition-all">
            <Share2 size={18} />
          </div>
        </button>

        {/* Comment Button */}
        <button 
          onClick={scrollToComments}
          className="flex flex-col items-center group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center group-hover:bg-surface-container-highest text-on-surface-variant transition-all">
            <MessageCircle size={18} />
          </div>
          <span className="text-[11px] font-medium mt-1 text-on-surface-variant">
            {post.comments_count || 0}
          </span>
        </button>

        {/* Report Button */}
        {isAuthenticated && !isOwner && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <div
                    className={`flex flex-col items-center group mt-2 ${
                      post.is_reported ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <button
                      onClick={post.is_reported ? undefined : onReport}
                      className="focus:outline-none"
                    >
                      <div className={`w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface-variant/60 transition-all ${
                        post.is_reported ? '' : 'group-hover:bg-red-500/10 group-hover:text-red-500'
                      }`}>
                        <Flag size={18} />
                      </div>
                    </button>
                  </div>
                }
              />
              <TooltipContent side="left">
                {post.is_reported ? t('alreadyReported') : t('report')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  // Horizontal version for mobile/inline
  return (
    <div className="flex items-center flex-wrap gap-4 py-4 border-y border-[#E2E8F0] dark:border-[#2d2d30] mt-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLiking}
        className={`flex items-center gap-2 transition-all cursor-pointer ${
          post.is_liked
            ? 'text-red-500 hover:text-red-400 font-semibold'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <Heart size={18} className={`${post.is_liked ? 'fill-current' : ''}`} />
        <span>{post.likes_count || 0}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 cursor-pointer"
      >
        <Share2 size={18} />
        <span>Chia sẻ</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={scrollToComments}
        className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 cursor-pointer"
      >
        <MessageCircle size={18} />
        <span>{post.comments_count || 0}</span>
      </Button>

      <div className="flex-grow" />

      {isAuthenticated && !isOwner && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReport}
          disabled={post.is_reported}
          className={`flex items-center gap-2 cursor-pointer ${
            post.is_reported 
              ? 'opacity-40 cursor-not-allowed text-on-surface-variant/40' 
              : 'text-on-surface-variant hover:text-red-500'
          }`}
        >
          <Flag size={18} />
          <span>{t('report')}</span>
        </Button>
      )}
    </div>
  );
}
