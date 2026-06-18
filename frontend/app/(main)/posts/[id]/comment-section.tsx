'use client';

import React, { useState } from 'react';
import type { Comment } from '@/features/posts/types/comment';
import type { User } from '@/features/auth/types';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
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
    <div className="bg-card border border-border rounded-2xl p-3 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-foreground">{t('title')}</h2>
        <span className="text-muted-foreground text-sm">({totalCount})</span>
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
        <div className="mb-8 p-4 rounded-xl bg-muted border border-border text-center">
          <p className="text-muted-foreground mb-3">{t('loginPrompt')}</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            {t('loginBtn')}
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
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
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('noComments')}</p>
            <p className="text-muted-foreground text-sm mt-1">{t('firstComment')}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="border-border text-foreground hover:bg-muted"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('loading')}
              </>
            ) : (
              t('loadMore')
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
