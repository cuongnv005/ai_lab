import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  posts_count: z.number().nullable().optional(),
  latest_posts: z.array(z.any()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const TagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const UserSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  posts_count: z.number().optional(),
  rating_value: z.number().optional(),
  created_at: z.string().optional(),
});

export const PostSchema = z.object({
  id: z.number(),
  user_id: z.number().optional(),
  category_id: z.number().optional(),
  title: z.string(),
  content: z.string().optional(),
  summary: z.string().nullable().optional(),
  first_image: z.string().nullable().optional(),
  status: z.number(),
  views_count: z.number(),
  reject_reason: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  user: UserSummarySchema.optional(),
  category: CategorySchema.optional(),
  tags: z.array(TagSchema).optional(),
  likes_count: z.number().optional(),
  comments_count: z.number().optional(),
  is_liked: z.boolean().optional(),
  is_reported: z.boolean().optional(),
});

export const PostListSchema = z.array(PostSchema);
export const CategoryListSchema = z.array(CategorySchema);

export const HotPostSchema = z.object({
  id: z.number(),
  title: z.string(),
});
export const HotPostListSchema = z.array(HotPostSchema);

export const UserThreadSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

export const PostThreadSchema = z.object({
  id: z.number(),
  title: z.string(),
  views_count: z.number(),
  comments_count: z.number().optional(),
  created_at: z.string(),
  user: UserThreadSummarySchema.optional(),
});

export const PostThreadListSchema = z.array(PostThreadSchema);

export const usePostSchemas = () => {
  const t = useTranslations('Post.validation');
  
  const schema = useMemo(() => z.object({
    title: z.string()
      .min(5, { message: t('titleMin') })
      .max(255, { message: t('titleMax') }),
    category_id: z.number({ message: t('categoryRequired') }),
    content: z.string()
      .min(10, { message: t('contentMin') }),
    tags: z.array(z.string())
      .refine(
        (tags) => !tags || tags.every((tag) => tag.length <= 20),
        { message: t('tagMax') }
      )
      .optional(),
  }), [t]);

  return { schema };
};

export type CreatePostInput = z.infer<ReturnType<typeof usePostSchemas>['schema']>;
export type UpdatePostInput = Partial<CreatePostInput>;
