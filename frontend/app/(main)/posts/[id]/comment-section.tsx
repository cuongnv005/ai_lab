'use client';

import React, { useState } from 'react';
import type { Comment } from '@/features/posts/types/comment';
import type { User } from '@/features/auth/types';
import { MessageSquare, Loader2 } from 'lucide-react';
import { MemoizedCommentItem } from './comment-item';
import { CommentForm } from './comment-form';
import { useTranslations } from 'next-intl';

interface CommentSectionProps {
  comments: Comment[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  onCreateComment: (input: { content: string; parent_id?: number | null }) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onToggleLike: (commentId: number) => Promise<void>;
  isCreating: boolean;
  deletingCommentId: number | null;
  isLiking: boolean;
  totalCount?: number;
}

export function CommentSection({
  comments,
  isLoading,
  hasMore,
  onLoadMore,
  isAuthenticated,
  currentUser,
  onCreateComment,
  onDeleteComment,
  onToggleLike,
  isCreating,
  deletingCommentId,
  isLiking,
  totalCount = 0,
}: CommentSectionProps) {
  const t = useTranslations('PostDetail.comments');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // Group comments by parent - API returns replies nested in each comment
  const rootComments = comments.filter((c) => !c.parent_id);
  const getReplies = (comment: Comment) => comment.replies || [];

  return (
    <section className="border-t border-[#E2E8F0] dark:border-[#2d2d30] mt-12 pt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 text-left">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-headline-md text-lg md:text-xl text-on-surface">
          {t('title')} <span className="text-on-surface-variant font-normal opacity-60">({totalCount})</span>
        </h3>
      </div>

      {/* Comment Form for Authenticated Users */}
      {isAuthenticated ? (
        <div className="mb-8">
          <CommentForm
            onSubmit={onCreateComment}
            placeholder={t('placeholder')}
          />
        </div>
      ) : (
        <div className="mb-8 p-6 rounded-xl glass-card text-center">
          <p className="text-on-surface-variant mb-3">{t('loginPrompt')}</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-lg text-xs font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[#E2E8F0] dark:border-[#2d2d30] bg-surface-container-low hover:bg-surface-container-highest text-on-surface h-9 px-4 py-2 cursor-pointer"
          >
            {t('loginBtn')}
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6 text-left">
        {rootComments.map((comment) => (
          <MemoizedCommentItem
            key={comment.id}
            comment={comment}
            replies={getReplies(comment)}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            replyingTo={replyingTo}
            onReplyClick={(commentId) => setReplyingTo(replyingTo === commentId ? null : commentId)}
            onDelete={onDeleteComment}
            onToggleLike={onToggleLike}
            onCreateComment={onCreateComment}
            deletingCommentId={deletingCommentId}
            isLiking={isLiking}
            isCreating={isCreating}
          />
        ))}

        {comments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
            <p className="text-on-surface-variant">{t('noComments')}</p>
            <p className="text-on-surface-variant/60 text-xs mt-1">{t('firstComment')}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="border border-[#E2E8F0] dark:border-[#2d2d30] text-on-surface hover:bg-surface-container-highest px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin inline-block" />
                {t('loading')}
              </>
            ) : (
              t('loadMore')
            )}
          </button>
        </div>
      )}
    </section>
  );
}
