import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postRepository } from '../services/http-post.repository';
import type { Post } from '../types';

export const usePostDetail = (postId: number) => {
  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postRepository.getById(postId),
    enabled: !!postId,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const likeMutation = useMutation({
    mutationFn: () => postRepository.toggleLike(postId),
    onMutate: async () => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      // Snapshot current value for rollback
      const previousPost = queryClient.getQueryData<Post>(['post', postId]);

      // Optimistically update UI immediately
      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old;
        const liked = !old.is_liked;
        const updatedUser = old.user ? {
          ...old.user,
          rating_value: liked 
            ? (old.user.rating_value ?? 0) + 1 
            : Math.max((old.user.rating_value ?? 0) - 1, 0),
        } : undefined;

        return {
          ...old,
          is_liked: liked,
          likes_count: liked ? (old.likes_count ?? 0) + 1 : Math.max((old.likes_count ?? 0) - 1, 0),
          user: updatedUser,
        };
      });

      return { previousPost };
    },
    onError: (_err, _vars, context) => {
      // Rollback to previous value on failure
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
    },
    onSuccess: ({ liked }) => {
      // Sync is_liked with the actual server response (in case of race conditions)
      queryClient.setQueryData<Post>(['post', postId], (old) => {
        if (!old) return old;
        if (old.is_liked === liked) return old;
        const updatedUser = old.user ? {
          ...old.user,
          rating_value: liked 
            ? (old.user.rating_value ?? 0) + 1 
            : Math.max((old.user.rating_value ?? 0) - 1, 0),
        } : undefined;

        return {
          ...old,
          is_liked: liked,
          likes_count: liked ? (old.likes_count ?? 0) + 1 : Math.max((old.likes_count ?? 0) - 1, 0),
          user: updatedUser,
        };
      });
    },
  });

  return {
    post: postQuery.data,
    isLoading: postQuery.isLoading,
    isError: postQuery.isError,
    error: postQuery.error,
    refetch: postQuery.refetch,
    toggleLike: likeMutation.mutateAsync,
    isLiking: likeMutation.isPending,
  };
};

