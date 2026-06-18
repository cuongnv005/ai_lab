import { useQuery } from '@tanstack/react-query';
import { postRepository } from '../services/http-post.repository';

export const useSimilarPosts = (postId: number, tag?: string) => {
  const query = useQuery({
    queryKey: ['posts', 'similar', postId, tag],
    queryFn: () => postRepository.getSimilarPosts(postId, tag),
    enabled: !!postId,
  });

  return {
    posts: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};
