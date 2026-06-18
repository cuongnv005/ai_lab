import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { commentRepository } from '../services/http-comment.repository';
import type { Comment, CommentFilters, CreateCommentInput } from '../types/comment';
import type { Post } from '../types';

export const useComments = (postId: number, filters: CommentFilters = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState<Comment[]>([]);
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['comments', postId, currentPage, filters.perPage || 10],
    queryFn: () => commentRepository.list(postId, { ...filters, page: currentPage }),
    enabled: !!postId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Reset state when postId changes
  useEffect(() => {
    setCurrentPage(1);
    setComments([]);
  }, [postId]);

  // Accumulate/sync comments when query data changes
  useEffect(() => {
    if (commentsQuery.data?.data) {
      if (currentPage === 1) {
        setComments(commentsQuery.data.data);
      } else {
        setComments((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newComments = commentsQuery.data.data.filter((c) => !existingIds.has(c.id));
          return [...prev, ...newComments];
        });
      }
    }
  }, [commentsQuery.data, currentPage]);

  const createMutation = useMutation({
    mutationFn: (input: CreateCommentInput) => commentRepository.create(postId, input),
    onSuccess: (newComment) => {
      // Instantly update local comments state
      setComments((prev) => {
        if (newComment.parent_id) {
          return appendReply(prev, newComment);
        } else {
          // New comment should be on top
          return [newComment, ...prev];
        }
      });

      // Increment comments_count on post cache directly — no refetch needed
      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old;
        return { ...old, comments_count: (old.comments_count ?? 0) + 1 };
      });
    },
  });

  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (commentId: number) => {
      setDeletingCommentId(commentId);
      try {
        await commentRepository.remove(commentId);
      } finally {
        setDeletingCommentId(null);
      }
    },
    onSuccess: (_, commentId) => {
      // Instantly remove from local comments state
      setComments((prev) => removeComment(prev, commentId));

      // Decrement comments_count on post cache directly — no refetch needed
      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old;
        return { ...old, comments_count: Math.max((old.comments_count ?? 0) - 1, 0) };
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (commentId: number) => commentRepository.toggleLike(commentId),
    onMutate: async (commentId: number) => {
      const current = findComment(comments, commentId);
      if (!current) return;
      const liked = !current.is_liked;

      // Optimistically update local comments state
      setComments((prev) => updateCommentLike(prev, commentId, liked));
      return { liked };
    },
    onError: (_err, commentId, context) => {
      if (context) {
        setComments((prev) => updateCommentLike(prev, commentId, !context.liked));
      }
    },
  });

  const loadMore = () => {
    if (commentsQuery.data?.pagination && currentPage < commentsQuery.data.pagination.total_page) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return {
    comments,
    pagination: commentsQuery.data?.pagination,
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    currentPage,
    hasMore: commentsQuery.data?.pagination ? currentPage < commentsQuery.data.pagination.total_page : false,
    loadMore,
    createComment: createMutation.mutateAsync,
    deleteComment: deleteMutation.mutateAsync,
    toggleLike: likeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deletingCommentId !== null,
    deletingCommentId,
    isLiking: likeMutation.isPending,
  };
};

/** Recursively update a comment's like status in a tree structure */
function updateCommentLike(comments: Comment[], commentId: number, liked: boolean): Comment[] {
  return comments.map((c) => {
    if (c.id === commentId) {
      return {
        ...c,
        is_liked: liked,
        likes_count: liked ? (c.likes_count ?? 0) + 1 : Math.max((c.likes_count ?? 0) - 1, 0),
      };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: updateCommentLike(c.replies, commentId, liked) };
    }
    return c;
  });
}

/** Recursively find a comment by ID in a nested tree */
function findComment(comments: Comment[], commentId: number): Comment | undefined {
  for (const c of comments) {
    if (c.id === commentId) return c;
    if (c.replies && c.replies.length > 0) {
      const found = findComment(c.replies, commentId);
      if (found) return found;
    }
  }
  return undefined;
}

/** Recursively append a reply to its parent comment in a tree structure */
function appendReply(comments: Comment[], reply: Comment): Comment[] {
  return comments.map((c) => {
    if (c.id === reply.parent_id) {
      const replies = c.replies || [];
      if (replies.some((r) => r.id === reply.id)) {
        return c;
      }
      return {
        ...c,
        replies: [...replies, reply],
      };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: appendReply(c.replies, reply) };
    }
    return c;
  });
}

/** Recursively remove a comment or a reply from the tree structure */
function removeComment(comments: Comment[], commentId: number): Comment[] {
  return comments
    .filter((c) => c.id !== commentId)
    .map((c) => {
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: removeComment(c.replies, commentId) };
      }
      return c;
    });
}
