import { describe, it, expect } from 'vitest';
import { PostListSchema } from '../../features/posts/schemas/post.schema';

describe('Post validation', () => {
  it('should validate backend payload', () => {
    const payload = [
        {
            "id": 1,
            "title": "Bài viết chính thức",
            "slug": "",
            "summary": null,
            "content": "Nội dung chính thức...",
            "status": 2,
            "status_label": "Đã đăng",
            "views_count": 0,
            "reject_reason": null,
            "created_at": "2026-06-08 02:42:17",
            "updated_at": "2026-06-08 02:42:17",
            "category": {
                "id": 1,
                "name": "Generative AI",
                "slug": "generative-ai"
            },
            "user": {
                "id": 1,
                "name": "Admin User",
                "email": "admin@example.com"
            },
            "tags": [
                {
                    "id": 8,
                    "name": "LLM",
                    "slug": "llm"
                },
                {
                    "id": 11,
                    "name": "Generative AI",
                    "slug": "generative-ai"
                }
            ]
        }
    ];

    const result = PostListSchema.safeParse(payload);
    if (!result.success) {
      console.log("VALIDATION ERRORS:", JSON.stringify(result.error.format(), null, 2));
    }
    expect(result.success).toBe(true);
  });
});
