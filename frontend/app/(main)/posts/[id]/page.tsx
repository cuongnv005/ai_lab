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

import { SimilarPosts } from './similar-posts';

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
    isLoading: isLoadingComments,
    hasMore,
    loadMore,
    createComment,
    deleteComment,
    toggleLike: toggleCommentLike,
    isCreating,
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

  // Extract similar tag query and remove the [similar] tag from the article content
  const similarMatch = contentWithoutFirstImage.match(/\[similar\]([\s\S]*?)\[\/similar\]/i);
  const tagQuery = similarMatch ? similarMatch[1]?.trim() : undefined;
  const contentWithoutSimilar = contentWithoutFirstImage.replace(/\[similar\][\s\S]*?\[\/similar\]/gi, '');

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-4 md:pt-24 pb-20">
        {/* First Grid Container: Sidebars and Article Content only */}
        <div className="px-4 md:px-8 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Social/Utility Sidebar Left (Fixed-like behavior) */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center gap-6 pt-12">
            <PostActions
              post={post}
              isAuthenticated={!!user}
              currentUser={user}
              isLiking={isLiking}
              onToggleLike={async () => { await toggleLike(); }}
              onReport={() => setReportModalOpen(true)}
              isSidebar={true}
            />
          </div>

          {/* Article Section */}
          <article className="lg:col-span-8">
            {/* Back & Edit Action Header */}
            <div className="mb-6 flex items-center justify-between">
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

            {/* Hero Image */}
            <figure className="mb-8 relative rounded-xl overflow-hidden aspect-video border border-[#E2E8F0] dark:border-[#2d2d30] bg-zinc-950">
              <img
                src={imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </figure>

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
            <ArticleBody content={contentWithoutSimilar} postId={postId} />
          </article>

          {/* Sidebar Right */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-6 md:pt-13">
              <AuthorWidget user={post.user} userId={post.user_id} />
            </div>
          </aside>
        </div>

        {/* Second Grid Container: Similar Posts & Comment Section */}
        <div className="px-4 md:px-8 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Offset spacer to align with the Article section */}
          <div className="hidden lg:block lg:col-span-1" />
          
          <div className="lg:col-span-8">
            {/* Similar Posts */}
            <SimilarPosts postId={postId} tagQuery={tagQuery} />

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
        </div>
      </main>

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
