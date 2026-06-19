'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Comment } from '@/features/posts/types/comment';
import type { User } from '@/features/auth/types';
import { Heart, Reply, Trash2, Loader2, Flag } from 'lucide-react';
import { CommentForm } from './comment-form';
import { formatDateTime } from '@/shared/lib/format-date';
import { useTranslations } from 'next-intl';
import { ReportModal } from './report-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@bks/ds-system-sdk/components/ui/alert-dialog';

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  isAuthenticated: boolean;
  currentUser: User | null;
  replyingTo: number | null;
  onReplyClick: (commentId: number, userName: string) => void;
  onDelete: (commentId: number) => Promise<void>;
  onToggleLike: (commentId: number) => Promise<void>;
  onCreateComment: (input: { content: string; parent_id?: number | null }) => Promise<void>;
  deletingCommentId?: number | null;
  isLiking: boolean;
  isCreating?: boolean;
  parentUserName?: string;
}

export function CommentItem({
  comment,
  replies = [],
  isAuthenticated,
  currentUser,
  replyingTo,
  onReplyClick,
  onDelete,
  onToggleLike,
  onCreateComment,
  deletingCommentId,
  isLiking,
  isCreating = false,
  parentUserName,
}: CommentItemProps) {
  const t = useTranslations('PostDetail.comments');
  const [isLikingLocal, setIsLikingLocal] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isReportedLocal, setIsReportedLocal] = useState(comment.is_reported);

  // Synchronize state with prop changes without using useEffect to avoid setState in effect lint errors
  const [prevIsReported, setPrevIsReported] = useState(comment.is_reported);
  if (comment.is_reported !== prevIsReported) {
    setIsReportedLocal(comment.is_reported);
    setPrevIsReported(comment.is_reported);
  }

  const isOwner = currentUser?.id === String(comment.user_id);
  const canDelete = isOwner || currentUser?.role === 'moderator' || currentUser?.role === 'admin';
  const isRootComment = !comment.parent_id; // Chỉ comment gốc mới được trả lời
  const isDeleting = deletingCommentId === comment.id;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Process the content to extract tagged user @[UserName] 
  let taggedUser = null;
  let rawContent = comment.content;
  const tagMatch = rawContent.match(/^@\[(.*?)\]\s+([\s\S]*)/);
  if (tagMatch) {
    taggedUser = tagMatch[1];
    rawContent = tagMatch[2];
  } else if (!isRootComment && parentUserName) {
    // Fallback for old comments
    taggedUser = parentUserName;
  }

  const charLimit = isMobile ? 400 : 600;
  const isLong = rawContent.length > charLimit;
  const displayContent = isLong && !isExpanded
    ? rawContent.slice(0, charLimit) + '…'
    : rawContent;

  const handleLike = async () => {
    if (!isAuthenticated) return;
    setIsLikingLocal(true);
    try {
      await onToggleLike(comment.id);
    } finally {
      setIsLikingLocal(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(comment.id);
  };

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4 md:p-5 border border-[#E2E8F0] dark:border-[#2d2d30]">
        <div className="flex gap-3 md:gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Link href={`/users/${comment.user.id}`}>
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface-container-low border border-[#E2E8F0] dark:border-[#2d2d30] hover:opacity-80 transition-opacity">
                <img
                  src={comment.user.avatar_url || comment.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.user.id}`}
                  alt={comment.user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>

          {/* Content & Actions */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className={`flex ${isRootComment ? 'flex-row items-center' : 'flex-col md:flex-row md:items-center'} gap-2 min-w-0`}>
                <Link href={`/users/${comment.user.id}`}>
                  <span className="font-headline-md text-sm md:text-base font-bold text-on-surface hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px] block" title={comment.user.name}>
                    {comment.user.name}
                  </span>
                </Link>
                <span className="text-on-surface-variant/60 text-xs flex-shrink-0">{formatDateTime(comment.created_at)}</span>
              </div>
            </div>

            {/* Body */}
            <p className="text-sm md:text-base text-on-surface-variant whitespace-pre-wrap leading-relaxed">
              {taggedUser && (
                <span className="text-primary font-bold mr-1 text-sm">@{taggedUser}</span>
              )}
              {displayContent}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="mt-1 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                {isExpanded ? t('hide') : t('showMore')}
              </button>
            )}

            {/* Actions */}
            <div className="flex items-center flex-wrap gap-8 mt-4">
              <button
                onClick={handleLike}
                disabled={!isAuthenticated || isLikingLocal}
                className={`flex items-center gap-1 text-xs transition-colors cursor-pointer ${
                  comment.is_liked
                    ? 'text-red-400 font-semibold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <Heart size={16} className={comment.is_liked ? 'fill-current' : ''} />
                <span>{comment.likes_count || 0}</span>
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => onReplyClick(comment.id, comment.user.name)}
                  className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  <Reply size={16} />
                  <span>{t('reply')}</span>
                </button>
              )}

              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <button
                        disabled={isDeleting}
                        className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        <span>{isDeleting ? t('deleting') : t('delete')}</span>
                      </button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteConfirmDesc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel variant="outline">{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-rose-500 hover:bg-rose-600 text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete();
                        }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null}
                        {t('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {isAuthenticated && !isOwner && (
                <button
                  onClick={() => setReportModalOpen(true)}
                  disabled={isReportedLocal}
                  className={`flex items-center gap-1 text-xs text-on-surface-variant transition-colors cursor-pointer ${
                    isReportedLocal 
                      ? 'opacity-40 cursor-not-allowed text-zinc-400 dark:text-zinc-600' 
                      : 'hover:text-red-500'
                  }`}
                  title={isReportedLocal ? t('alreadyReported') : t('report')}
                >
                  <Flag size={16} />
                  <span>{t('report')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {replyingTo === comment.id && isAuthenticated && (
        <div className="mt-3 ml-4">
          <CommentForm
            onSubmit={async (input) => {
              const targetParentId = isRootComment ? comment.id : comment.parent_id;
              const contentWithTag = `@[${comment.user.name}] ${input.content}`;
              await onCreateComment({ content: contentWithTag, parent_id: targetParentId });
              onReplyClick(comment.id, comment.user.name); // Close the reply form after submitting
            }}
            placeholder={t('replyPlaceholder', { name: comment.user.name })}
          />
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-6 pl-3 md:ml-10 space-y-6 border-l-2 border-gray-200 dark:border-[#2d2d30]/50 md:pl-4">
          {replies.map((reply) => (
            <MemoizedCommentItem
              key={reply.id}
              comment={reply}
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              replyingTo={replyingTo}
              onReplyClick={onReplyClick}
              onDelete={onDelete}
              onToggleLike={onToggleLike}
              onCreateComment={onCreateComment}
              deletingCommentId={deletingCommentId}
              isLiking={isLiking}
              isCreating={isCreating}
              parentUserName={comment.user.name}
            />
          ))}
        </div>
      )}

      {/* Report Modal */}
      {isAuthenticated && !isOwner && (
        <ReportModal
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
          reportableType="comment"
          reportableId={comment.id}
          onSuccess={() => setIsReportedLocal(true)}
        />
      )}
    </div>
  );
}

// Export memoized version để tránh re-render không cần thiết
export const MemoizedCommentItem = React.memo(CommentItem);
export default MemoizedCommentItem;
