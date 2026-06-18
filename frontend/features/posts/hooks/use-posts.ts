import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { UseFormSetError } from 'react-hook-form';
import { mapBackendErrors } from '@/shared/utils/map-backend-errors';
import { shouldShowToast, toast } from '@/shared/lib/toast';
import { postRepository } from '../services/http-post.repository';
import type { PostFilters } from '../types';

// Stable filters serialization for query key
const serializeFilters = (filters: PostFilters): string => {
  const sorted: Record<string, string | number | undefined> = {};
  Object.keys(filters)
    .sort()
    .forEach((key) => {
      const k = key as keyof PostFilters;
      const value = filters[k];
      if (value !== undefined) {
        sorted[key] = value;
      }
    });
  return JSON.stringify(sorted);
};

export const usePosts = (filters: PostFilters = {}) => {
  const postsQuery = useQuery({
    queryKey: ['posts', serializeFilters(filters)],
    queryFn: () => postRepository.list(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    posts: postsQuery.data?.data || [],
    pagination: postsQuery.data
      ? {
          currentPage: postsQuery.data.current_page,
          lastPage: postsQuery.data.last_page || postsQuery.data.total_page || 1,
          total: postsQuery.data.total,
          perPage: postsQuery.data.per_page,
        }
      : null,
    isLoading: postsQuery.isLoading,
    isFetching: postsQuery.isFetching,
    isError: postsQuery.isError,
    error: postsQuery.error,
    refetch: postsQuery.refetch,
  };
};

export const useCategories = () => {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => postRepository.listCategories(),
    staleTime: 0,
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    refetch: categoriesQuery.refetch,
  };
};

export const useCategoryPosts = (categorySlug: string, filters: PostFilters = {}) => {
  const categoryPostsQuery = useQuery({
    queryKey: ['category-posts', categorySlug, serializeFilters(filters)],
    queryFn: () => postRepository.listCategoryPosts(categorySlug, filters),
    enabled: !!categorySlug,
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    posts: categoryPostsQuery.data?.data || [],
    pagination: categoryPostsQuery.data
      ? {
          currentPage: categoryPostsQuery.data.current_page,
          lastPage: categoryPostsQuery.data.last_page || categoryPostsQuery.data.total_page || 1,
          total: categoryPostsQuery.data.total,
          perPage: categoryPostsQuery.data.per_page,
        }
      : null,
    isLoading: categoryPostsQuery.isLoading,
    isFetching: categoryPostsQuery.isFetching,
    isError: categoryPostsQuery.isError,
    error: categoryPostsQuery.error,
    refetch: categoryPostsQuery.refetch,
  };
};

export const useTagPosts = (tagSlug: string, filters: PostFilters = {}) => {
  const query = useQuery({
    queryKey: ['tag-posts', tagSlug, serializeFilters(filters)],
    queryFn: () => postRepository.listTagPosts(tagSlug, filters),
    enabled: !!tagSlug,
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  });

  return {
    posts: query.data?.data || [],
    pagination: query.data
      ? {
          currentPage: query.data.current_page,
          lastPage: query.data.last_page || query.data.total_page || 1,
          total: query.data.total,
          perPage: query.data.per_page,
        }
      : null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};


export const useCreatePost = () => {
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (input: any) => postRepository.create(input),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['category-posts'] });
      if (data?.message && shouldShowToast(data.message)) {
        toast.success(data.message);
      }
    },
  });

  const create = useCallback(
    async (input: any, setError: UseFormSetError<any>) => {
      try {
        const result = await createPostMutation.mutateAsync(input);
        return result;
      } catch (err: unknown) {
        const responseData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
        const status = (err as { response?: { status?: number } })?.response?.status;

        if (status === 422) {
          const rawErrors =
            (responseData?.errors as Record<string, string[]> | null) ??
            (responseData?.data as Record<string, string[]> | null);

          if (rawErrors) {
            mapBackendErrors(rawErrors, setError);
          }
          return null;
        }
        throw err;
      }
    },
    [createPostMutation]
  );

  return {
    createPost: create,
    isSubmitting: createPostMutation.isPending,
  };
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  const updatePostMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: any }) => postRepository.update(id, input),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', data?.id] });
      queryClient.invalidateQueries({ queryKey: ['category-posts'] });
      if (data?.message && shouldShowToast(data.message)) {
        toast.success(data.message);
      }
    },
  });

  const update = useCallback(
    async (id: number, input: any, setError: UseFormSetError<any>) => {
      try {
        const result = await updatePostMutation.mutateAsync({ id, input });
        return result;
      } catch (err: unknown) {
        const responseData = (err as { response?: { data?: Record<string, unknown> } })?.response?.data;
        const status = (err as { response?: { status?: number } })?.response?.status;

        if (status === 422) {
          const rawErrors =
            (responseData?.errors as Record<string, string[]> | null) ??
            (responseData?.data as Record<string, string[]> | null);

          if (rawErrors) {
            mapBackendErrors(rawErrors, setError);
          }
          return null;
        }
        throw err;
      }
    },
    [updatePostMutation]
  );

  return {
    updatePost: update,
    isSubmitting: updatePostMutation.isPending,
  };
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => postRepository.deletePost(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['category-posts'] });
      toast.success(data?.message || 'Xóa bài viết thành công!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Xóa bài viết thất bại!');
    }
  });

  return {
    deletePost: deletePostMutation.mutateAsync,
    isDeleting: deletePostMutation.isPending,
  };
};

export const usePromotePost = () => {
  const queryClient = useQueryClient();

  const promotePostMutation = useMutation({
    mutationFn: (id: number) => postRepository.promote(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(data?.message || 'Yêu cầu đăng lên trang chủ thành công, đang chờ Admin duyệt!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Yêu cầu thất bại!');
    }
  });

  return {
    promotePost: promotePostMutation.mutateAsync,
    isPromoting: promotePostMutation.isPending,
  };
};

export const useHotPosts = () => {
  const hotPostsQuery = useQuery({
    queryKey: ['hot-posts'],
    queryFn: () => postRepository.getHotPosts(),
    staleTime: 5 * 60 * 1000, // Client cache 5 mins
    refetchOnWindowFocus: false,
  });

  return {
    posts: hotPostsQuery.data || [],
    isLoading: hotPostsQuery.isLoading,
    isError: hotPostsQuery.isError,
    error: hotPostsQuery.error,
  };
};

export const useTopAuthors = () => {
  const topAuthorsQuery = useQuery({
    queryKey: ['top-authors'],
    queryFn: () => postRepository.getTopAuthors(),
    staleTime: 5 * 60 * 1000, // Client cache 5 mins
    refetchOnWindowFocus: false,
  });

  return {
    authors: topAuthorsQuery.data || [],
    isLoading: topAuthorsQuery.isLoading,
    isError: topAuthorsQuery.isError,
    error: topAuthorsQuery.error,
  };
};

