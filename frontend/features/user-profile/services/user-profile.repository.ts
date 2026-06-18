import { HttpService } from "@/infra/api/http-service";
import type { AxiosResponse } from "axios";
import { type Post } from "@/features/posts/types";

export interface UserProfile {
  id: number;
  name: string;
  avatar?: string | null;
  avatar_url?: string | null;
  gender?: number | null;
  gender_label?: string | null;
  dob?: string | null;
  hometown?: string | null;
  bio?: string | null;
  created_at: string;
}

export interface UserPostsResponse {
  data: Post[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const UserProfileRepository = {
  getProfile: async (id: number | string): Promise<UserProfile> => {
    const response = await HttpService.get<any, AxiosResponse<{ data: UserProfile }>>(`/api/users/${id}`);
    return response.data.data;
  },

  getUserPosts: async (id: number | string, params?: { page?: number }): Promise<UserPostsResponse> => {
    const response = await HttpService.get<any, AxiosResponse<any>>(`/api/users/${id}/posts`, params);
    const resData = response.data.data;
    return {
      data: resData.data,
      meta: {
        current_page: resData.current_page,
        last_page: resData.total_page,
        per_page: resData.per_page,
        total: resData.total,
      }
    };
  },

  updateProfile: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await HttpService.put<any, AxiosResponse<{ data: UserProfile }>>("/api/users/profile", payload);
    return response.data.data;
  },
};
