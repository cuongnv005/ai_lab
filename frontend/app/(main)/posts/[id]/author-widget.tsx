'use client';

import React from 'react';
import Link from 'next/link';
import { UserSummary } from '@/features/posts/types';
import { Award, Calendar, FileText } from 'lucide-react';
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

  // Use backend stats if available, otherwise fallback to deterministic mock stats
  const postsCount = user.posts_count !== undefined ? user.posts_count : (((userId * 13) % 150) + 12);
  const ratingValue = user.rating_value !== undefined ? user.rating_value : (((userId * 7) % 25) + 3);

  // Placeholder avatar if none provided
  const avatarUrl = user.avatar_url || user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`;

  return (
    <div className="w-full bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center shadow-xs">
      {/* Avatar Container */}
      <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-border shadow-inner bg-muted flex items-center justify-center">
        <img
          src={avatarUrl}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Username / Name */}
      <Link href={`/users/${user.id}`}>
        <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors mb-4 cursor-pointer">
          {user.name}
        </h3>
      </Link>

      {/* Divider */}
      <div className="w-full border-t border-border/60 my-2" />

      {/* Stats and Membership Info */}
      <div className="w-full space-y-3 py-3 text-xs text-left">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>
            {t('joined')} <strong className="text-foreground">{getMemberSince(user.created_at)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <FileText className="w-4 h-4 text-emerald-500" />
          <span>
            {t('postsCount')} <strong className="text-foreground">{postsCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <Award className="w-4 h-4 text-amber-500" />
          <span>
            {t('likesCount')} <strong className="text-foreground">{ratingValue}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
