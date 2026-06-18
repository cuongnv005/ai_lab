import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProfileRepository, type UserProfile } from "../services/user-profile.repository";

export const USER_PROFILE_KEYS = {
  all: ["user-profile"] as const,
  profile: (id: string | number) => [...USER_PROFILE_KEYS.all, "detail", String(id)] as const,
  posts: (id: string | number, page?: number) => [...USER_PROFILE_KEYS.all, "posts", String(id), { page }] as const,
};

export function useUserProfile(id: string | number, enabled = true) {
  return useQuery({
    queryKey: USER_PROFILE_KEYS.profile(id),
    queryFn: () => UserProfileRepository.getProfile(id),
    enabled: !!id && enabled,
  });
}

export function useUserPosts(id: string | number, page: number = 1, enabled = true) {
  return useQuery({
    queryKey: USER_PROFILE_KEYS.posts(id, page),
    queryFn: () => UserProfileRepository.getUserPosts(id, { page }),
    enabled: !!id && enabled,
    placeholderData: (prev) => prev,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => UserProfileRepository.updateProfile(data),
    onSuccess: (data) => {
      // Invalidate specific user profile cache
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_KEYS.profile(data.id) });
      // Depending on structure, might also want to invalidate current logged-in user context
    },
  });
}
