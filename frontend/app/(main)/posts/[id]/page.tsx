'use client';

import React, { useCallback } from 'react';
import { useParams } from 'next/navigation';
import { usePostDetail } from '@/features/posts/hooks/use-post-detail';
import { useComments } from '@/features/posts/hooks/use-comments';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ArticleBody } from './article-body';
import { CommentSection } from './comment-section';
import { PostHeader } from './post-header';
import { PostActions } from './post-actions';
import { AuthorWidget } from './author-widget';
import { ReportModal } from './report-modal';
import { ArrowLeft, Loader2, Edit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function PostDetailPage() {
  const t = useTranslations("PostDetailPage");
  const params = useParams();
  const postId = Number(params.id);
  const { user } = useAuth();
  const router = useRouter();
  const {
    post,
    isLoading,
    isError,
    error,
    toggleLike,
    isLiking,
    refetch,
  } = usePostDetail(postId);

  // Scroll to top when post loading finishes to fix scroll restoration issues
  const lastScrolledPostIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!isLoading && post && post.id === postId && lastScrolledPostIdRef.current !== postId) {
      lastScrolledPostIdRef.current = postId;
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTo({ top: 0 });
      }
      window.scrollTo({ top: 0 });
    }
  }, [isLoading, post, postId]);

  // Update browser title
  React.useEffect(() => {
    if (post?.title) {
      document.title = t("pageTitle", { title: post.title, defaultValue: `${post.title} | AI Lab` });
    } else {
      document.title = t("fallbackPageTitle", { defaultValue: 'Chi tiết bài viết | AI Lab' });
    }
    
    // Cleanup on unmount
    return () => {
      document.title = t("baseTitle", { defaultValue: 'AI Lab' });
    };
  }, [post?.title, t]);

  const {
    comments,
    pagination,
    isLoading: isLoadingComments,
    hasMore,
    loadMore,
    createComment,
    deleteComment,
    toggleLike: toggleCommentLike,
    isCreating,
    isDeleting,
    deletingCommentId,
    isLiking: isLikingComment,
  } = useComments(postId);

  const [reportModalOpen, setReportModalOpen] = React.useState(false);

  // Memoize callbacks để tránh re-render liên tục
  const handleCreateComment = useCallback(
    async (input: { content: string; parent_id?: number | null }) => {
      await createComment(input);
    },
    [createComment]
  );

  const handleDeleteComment = useCallback(
    async (id: number) => {
      await deleteComment(id);
    },
    [deleteComment]
  );

  const handleToggleCommentLike = useCallback(
    async (id: number) => {
      await toggleCommentLike(id);
    },
    [toggleCommentLike]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-red-500">{t("errorTitle", { defaultValue: "Đã xảy ra lỗi khi tải bài viết" })}</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToHome", { defaultValue: "Quay lại trang chủ" })}
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === String(post?.user?.id);
  const isAdmin = user?.roles?.includes('admin');
  const isModerator = user?.roles?.includes('moderator');
  const canEdit = isOwner || isAdmin || isModerator;

  const imageUrl = (post.content || '').match(/\[img\]\s*(.*?)\s*\[\/img\]/i)?.[1] 
    || (post.content || '').match(/src=["'](.*?)["']/i)?.[1]
    || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;

  // Remove the first image from the content so it is not duplicated in ArticleBody
  let contentWithoutFirstImage = post.content || '';
  const firstImgRegex = /(?:\[center\]|\[left\]|\[right\])?\s*\[img\][\s\S]*?\[\/img\]\s*(?:\[\/center\]|\[\/left\]|\[\/right\])?/i;
  const imgMatch = (post.content || '').match(firstImgRegex);
  if (imgMatch) {
    contentWithoutFirstImage = (post.content || '').replace(imgMatch[0], '');
  } else {
    const htmlImgMatch = (post.content || '').match(/<img[^>]*>/i);
    if (htmlImgMatch) {
      contentWithoutFirstImage = (post.content || '').replace(htmlImgMatch[0], '');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto md:px-4 py-8">
        {/* Back & Edit Action Header */}
        <div className="mb-6 lg:pl-24 lg:pr-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("back", { defaultValue: "Quay lại" })}</span>
          </button>

          {canEdit && (
            <Link href={`/dashboard/posts/${post.id}/edit`}>
              <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5 cursor-pointer">
                <Edit className="w-3.5 h-3.5" />
                {t("editPost", { defaultValue: "Chỉnh sửa bài viết" })}
              </Button>
            </Link>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative lg:items-start">
          {/* Sticky Actions Sidebar (Desktop only) */}
          <aside className="hidden lg:block sticky top-24 w-16 flex-shrink-0 lg:mt-80">
            <PostActions
              post={post}
              isAuthenticated={!!user}
              currentUser={user}
              isLiking={isLiking}
              onToggleLike={async () => { await toggleLike(); }}
              onReport={() => setReportModalOpen(true)}
              isSidebar={true}
            />
          </aside>

          {/* Main content wrapper */}
          <div className="w-full flex-1 min-w-0 lg:max-w-3xl">
            {/* Article Card */}
            <article className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              {/* Featured Image */}
              <div className="relative h-64 md:h-80 bg-zinc-950">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              </div>

              <div className="p-6 md:p-10 xl:-mt-20 relative">
                {/* Post Header */}
                <PostHeader post={post} />

                {/* Post Actions (Mobile/Tablet only) */}
                <div className="lg:hidden">
                  <PostActions
                    post={post}
                    isAuthenticated={!!user}
                    currentUser={user}
                    isLiking={isLiking}
                    onToggleLike={async () => { await toggleLike(); }}
                    onReport={() => setReportModalOpen(true)}
                  />
                </div>

                {/* Article Content */}
                <ArticleBody content={contentWithoutFirstImage} postId={postId} />
              </div>
            </article>

            {/* Author Info (Mobile/Tablet only) */}
            <div className="mt-8 lg:hidden">
              <AuthorWidget user={post.user} userId={post.user_id} />
            </div>

            {/* Comments Section */}
            <div id="comments-section" className="mt-8">
              <CommentSection
                comments={comments}
                totalCount={post.comments_count || 0}
                isLoading={isLoadingComments}
                hasMore={hasMore}
                onLoadMore={loadMore}
                isAuthenticated={!!user}
                currentUser={user}
                onCreateComment={handleCreateComment}
                onDeleteComment={handleDeleteComment}
                onToggleLike={handleToggleCommentLike}
                isCreating={isCreating}
                deletingCommentId={deletingCommentId}
                isLiking={isLikingComment}
              />
            </div>
          </div>

          {/* Right Sidebar (Desktop only) */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
            <AuthorWidget user={post.user} userId={post.user_id} />
          </aside>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        reportableType="post"
        reportableId={postId}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
