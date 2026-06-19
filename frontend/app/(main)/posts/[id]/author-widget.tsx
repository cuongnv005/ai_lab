'use client';

import React from 'react';
import Link from 'next/link';
import { UserSummary } from '@/features/posts/types';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AuthorWidgetProps {
  user?: UserSummary;
  userId?: number;
}

export function AuthorWidget({ user, userId = 1 }: AuthorWidgetProps) {
  const t = useTranslations("PostDetail.authorWidget");
  
  if (!user) return null;

  const getMemberSince = (dateStr?: string) => {
    if (!dateStr) return t('newMember');
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (isNaN(diffMs) || diffMs < 0) return t('newMember');

      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffDays < 1) return t('today');
      if (diffDays < 30) return t('daysAgo', { days: diffDays });

      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) return t('monthsAgo', { months: diffMonths });

      const diffYears = Math.floor(diffMonths / 12);
      return t('yearsAgo', { years: diffYears });
    } catch {
      return t('newMember');
    }
  };

  const postsCount = user.posts_count !== undefined ? user.posts_count : (((userId * 13) % 150) + 12);
  const ratingValue = user.rating_value !== undefined ? user.rating_value : (((userId * 7) % 25) + 3);
  const avatarUrl = user.avatar_url || user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`;

  return (
    <div className="glass-card rounded-xl overflow-hidden text-center border border-[#E2E8F0] dark:border-[#2d2d30]">
      {/* Background Banner */}
      <div className="h-20 bg-gradient-to-r from-primary/10 dark:from-primary/20 to-surface-container-high"></div>
      
      <div className="px-6 pb-6 -mt-10 flex flex-col items-center text-center">
        {/* Avatar Container */}
        <div className="w-20 h-20 rounded-full border-4 border-white dark:border-background overflow-hidden mb-3 bg-muted shrink-0 shadow-sm flex items-center justify-center">
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name */}
        <Link href={`/users/${user.id}`}>
          <h4 className="font-bold text-on-surface hover:text-primary transition-colors text-lg cursor-pointer">
            {user.name}
          </h4>
        </Link>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 mb-4 tracking-wider transition-all ${
          user.role === 'admin'
            ? 'bg-red-500/15 text-red-800 dark:text-red-300 border border-red-500/20'
            : user.role === 'moderator'
            ? 'bg-primary/10 text-primary dark:text-blue-400 border border-blue-500/20' 
            : 'bg-muted text-muted-foreground border border-outline-variant/30'
        }`}>
          {user.role === 'admin' ? '@admin' : user.role === 'moderator' ? '@mod' : '@member'}
        </span>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 mb-2">
          <div className="bg-surface-container-high dark:bg-surface-container-low rounded-lg p-1 border border-[#E2E8F0] dark:border-[#2d2d30] flex flex-col items-center">
            <span className="text-[11px] text-on-secondary/80 dark:text-on-surface-variant font-medium">
              {t('posts', { defaultValue: 'Bài viết' })}
            </span>
            <span className="font-bold text-on-surface mt-0.5 text-base">
              {postsCount}
            </span>
          </div>
          <div className="bg-surface-container-high dark:bg-surface-container-low rounded-lg p-1 border border-[#E2E8F0] dark:border-[#2d2d30] flex flex-col items-center">
            <span className="text-[11px] text-on-secondary/80 dark:text-on-surface-variant font-medium">
              {t('likes', { defaultValue: 'Yêu thích' })}
            </span>
            <span className="font-bold text-on-surface mt-0.5 text-base">
              {ratingValue}
            </span>
          </div>
        </div>

        {/* Membership Info */}
        <div className="pt-4 w-full text-left">
          <div className="flex items-center gap-2 text-on-secondary/80 dark:text-on-surface-variant text-xs font-medium">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>
              {t('joined')} {getMemberSince(user.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
