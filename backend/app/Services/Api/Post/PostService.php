<?php

namespace App\Services\Api\Post;

use App\DTOs\Api\Post\CreatePostData;
use App\DTOs\Api\Post\UpdatePostData;
use App\DTOs\Api\Admin\Post\AdminCreatePostData;
use App\DTOs\Api\Admin\Post\AdminUpdatePostData;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use App\Enums\PostStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Services\Base\Service;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Factories\ApiFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PostService extends Service
{
    /**
     * List Homepage Published Posts.
     */
    public function listHomepagePosts(int $perPage = 10, int $page = 1, ?int $userId = null, ?string $search = null): LengthAwarePaginator
    {
        $currentUserId = auth()->guard('api')->id();
        $query = Post::query()
            ->fromActiveUser()
            ->select(['id', 'user_id', 'category_id', 'title', 'summary', 'first_image', 'status', 'views_count', 'created_at', 'updated_at'])
            ->with([
                'category',
                'user',
                'tags',
                'likes' => function ($q) use ($currentUserId) {
                    $q->where('user_id', $currentUserId);
                },
            ])
            ->withCount(['likes', 'comments']);

        if ($userId) {
            $query->where('user_id', $userId);
            // If viewing own posts, allow seeing all statuses (Pending, Published, Rejected).
            // If viewing someone else's posts, restrict to Published only.
            if (!$this->user || $this->user->id !== $userId) {
                $query->where('status', PostStatus::APPROVED);
            }
        } else {
            $query->where('status', PostStatus::APPROVED);
        }

        if ($search) {
            $query->whereFullText(['title', 'content'], $search);
        }

        $query->orderByDesc('created_at');

        $total = $query->count();

        $isHomepage = !$userId && !$search;

        if ($isHomepage) {
            // Custom pagination: page 1 has 12, page 2+ has 10
            if ($page == 1) {
                $limit = 12;
                $offset = 0;
                $currentPerPage = 12;
            } else {
                $limit = 10;
                $offset = 12 + ($page - 2) * 10;
                $currentPerPage = 10;
            }

            $items = $query->offset($offset)->limit($limit)->get();

            return new class ($items, $total, $currentPerPage, $page, ['path' => request()->url(), 'query' => request()->query()]) extends LengthAwarePaginator {
                public function lastPage()
                {
                    return 1 + (int) ceil(max(0, $this->total - 12) / 10);
                }
            };
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get top 5 hot posts based on view count (cached for 10 minutes).
     *
     * @return Collection
     */
    public function getHotPosts(): Collection
    {
        return \Illuminate\Support\Facades\Cache::remember('homepage_hot_posts', 600, function () {
            return Post::query()
                ->fromActiveUser()
                ->where('status', PostStatus::APPROVED)
                ->select(['id', 'title'])
                ->orderByDesc('views_count')
                ->limit(5)
                ->get();
        });
    }

    /**
     * List Category discussion posts.
     */
    public function listCategoryPosts(string $categorySlug, int $perPage = 10): LengthAwarePaginator
    {
        $category = Category::where('slug', $categorySlug)->firstOrFail();

        $currentUserId = auth()->guard('api')->id();

        return Post::query()
            ->fromActiveUser()
            ->select(['id', 'user_id', 'category_id', 'title', 'summary', 'first_image', 'status', 'views_count', 'created_at', 'updated_at'])
            ->with([
                'category',
                'user',
                'tags',
                'likes' => function ($q) use ($currentUserId) {
                    $q->where('user_id', $currentUserId);
                },
            ])
            ->withCount(['likes', 'comments'])
            ->where('category_id', $category->id)
            ->whereIn('status', [PostStatus::PUBLISHED, PostStatus::PENDING, PostStatus::APPROVED, PostStatus::REJECTED])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * List Category discussion threads (optimized for listing view).
     */
    public function listCategoryThreads(string $categorySlug, int $perPage = 10): LengthAwarePaginator
    {
        $category = Category::where('slug', $categorySlug)->firstOrFail();

        return Post::query()
            ->fromActiveUser()
            ->select(['id', 'user_id', 'title', 'views_count', 'created_at'])
            ->with([
                'user' => function ($q) {
                    $q->select(['id', 'name']);
                },
            ])
            ->withCount('comments')
            ->where('category_id', $category->id)
            ->whereIn('status', [PostStatus::PUBLISHED, PostStatus::PENDING, PostStatus::APPROVED, PostStatus::REJECTED])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * List posts by tag slug.
     */
    public function listTagPosts(string $tagSlug, int $perPage = 10): LengthAwarePaginator
    {
        $tag = Tag::where('slug', $tagSlug)->firstOrFail();

        $currentUserId = auth()->guard('api')->id();

        return Post::query()
            ->fromActiveUser()
            ->select(['id', 'user_id', 'category_id', 'title', 'summary', 'first_image', 'status', 'views_count', 'created_at', 'updated_at'])
            ->with([
                'category',
                'user',
                'tags',
                'likes' => function ($q) use ($currentUserId) {
                    $q->where('user_id', $currentUserId);
                },
            ])
            ->withCount(['likes', 'comments'])
            ->whereHas('tags', fn ($q) => $q->where('tags.id', $tag->id))
            ->where('status', PostStatus::APPROVED)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Post Details (increments views).
     */
    public function getPostDetails(int $id): Post
    {
        $post = Post::fromActiveUser()->with(['category', 'user', 'tags', 'likes'])->findOrFail($id);
        $post->increment('views_count');

        return $post;
    }

    /**
     * Create a new post.
     *
     * @throws \Throwable
     */
    public function createPost(CreatePostData $dto): Post
    {
        DB::beginTransaction();
        try {
            $parsed = $this->parsePreviewText($dto->content);
            $status = $this->determineInitialStatus();

            $post = Post::create([
                'user_id' => $this->user->id,
                'category_id' => $dto->categoryId,
                'title' => $dto->title,
                'content' => $parsed['content'],
                'summary' => $parsed['summary'],
                'status' => $status,
                'views_count' => 0,
            ]);

            $this->syncPostTags($post, $dto->tags);

            ApiFactory::getDraftService()
                ->withUser($this->user)
                ->deleteDraft($dto->categoryId, null);

            \Illuminate\Support\Facades\Cache::forget('categories_list');

            DB::commit();
            return $post->load(['category', 'user', 'tags']);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing post.
     *
     * @throws \Throwable
     */
    public function updatePost(int $id, UpdatePostData $dto): Post
    {
        DB::beginTransaction();
        try {
            $post = Post::findOrFail($id);
            $updateData = [];

            if ($dto->title !== null) {
                $updateData['title'] = $dto->title;
            }

            if ($dto->categoryId !== null) {
                $updateData['category_id'] = $dto->categoryId;
            }

            if ($dto->content !== null) {
                $parsed = $this->parsePreviewText($dto->content);
                $updateData['content'] = $parsed['content'];
                $updateData['summary'] = $parsed['summary'];
            }

            $post->update($updateData);

            if ($dto->tags !== null) {
                $this->syncPostTags($post, $dto->tags);
            }

            $catId = $dto->categoryId ?? $post->category_id;
            ApiFactory::getDraftService()
                ->withUser($this->user)
                ->deleteDraft($catId, $post->id);

            \Illuminate\Support\Facades\Cache::forget('categories_list');

            DB::commit();
            return $post->load(['category', 'user', 'tags']);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a post.
     *
     * @throws \Throwable
     */
    public function deletePost(int $id): void
    {
        DB::beginTransaction();
        try {
            $post = Post::findOrFail($id);
            $post->update([
                'previous_status' => $post->status,
                'status' => PostStatus::DELETED,
            ]);
            $post->delete();

            \Illuminate\Support\Facades\Cache::forget('categories_list');

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get similar posts based on tag overlap.
     */
    public function getSimilarPosts(int $id, int $limit = 3): Collection
    {
        $post = Post::findOrFail($id);
        $tagIds = $post->tags()->pluck('tags.id');

        $query = Post::query()
            ->where('posts.status', PostStatus::PUBLISHED)
            ->where('posts.id', '!=', $post->id);

        if ($tagIds->isEmpty()) {
            return $query->where('posts.category_id', $post->category_id)
                ->orderByDesc('posts.views_count')
                ->orderByDesc('posts.created_at')
                ->limit($limit)
                ->get();
        }

        $tagIdsStr = $tagIds->implode(',');

        return $query->where(function ($q) use ($tagIds, $post) {
            $q->whereIn('posts.id', function ($sub) use ($tagIds) {
                $sub->select('post_id')
                    ->from('post_tag')
                    ->whereIn('tag_id', $tagIds);
            })->orWhere('posts.category_id', $post->category_id);
        })
        ->selectRaw("posts.*,
            (SELECT COUNT(*) FROM post_tag WHERE post_tag.post_id = posts.id AND post_tag.tag_id IN ({$tagIdsStr})) as matching_tags_count,
            IF(posts.category_id = ?, 1, 0) as same_category
        ", [$post->category_id])
        ->orderByDesc('matching_tags_count')
        ->orderByDesc('same_category')
        ->orderByDesc('posts.views_count')
        ->orderByDesc('posts.created_at')
        ->limit($limit)
        ->get();
    }

    /**
     * Get similar posts by specific tag name/slug.
     */
    public function getSimilarPostsByTag(string $tagKeyword, int $postId, int $limit = 5): Collection
    {
        $tag = Tag::where('slug', $tagKeyword)
            ->orWhere('name', 'like', $tagKeyword)
            ->first();

        $query = Post::query()
            ->fromActiveUser()
            ->where('posts.id', '!=', $postId)
            ->where('posts.status', PostStatus::APPROVED);

        if ($tag) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $tag->id));
        } else {
            $query->where(function ($q) use ($tagKeyword) {
                $q->where('posts.title', 'like', '%' . $tagKeyword . '%')
                  ->orWhereHas('tags', fn ($t) => $t->where('tags.name', 'like', '%' . $tagKeyword . '%'));
            });
        }

        return $query->orderByDesc('posts.views_count')
            ->orderByDesc('posts.created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Parse BBCode preview tags.
     *
     * @return array{content: string, summary: ?string}
     */
    private function parsePreviewText(string $content): array
    {
        $summary = null;
        if (preg_match('/\[preview\](.*?)\[\/preview\]/is', $content, $matches)) {
            $summary = trim($matches[1]);
            $content = str_replace(['[preview]', '[/preview]'], '', $content);
        }

        return [
            'content' => $content,
            'summary' => $summary,
        ];
    }

    /**
     * Determine initial post status based on user role.
     */
    private function determineInitialStatus(): PostStatus
    {
        if ($this->user && $this->user->hasAnyRole([UserRole::ADMIN->value, UserRole::MODERATOR->value])) {
            return PostStatus::APPROVED;
        }

        return PostStatus::PUBLISHED;
    }

    /**
     * Sync tags for a post.
     *
     * @param string[] $tags
     */
    private function syncPostTags(Post $post, array $tags): void
    {
        $tagIds = [];
        foreach ($tags as $tagName) {
            $tagName = trim($tagName);
            if ($tagName === '') {
                continue;
            }

            $tag = Tag::firstOrCreate([
                'name' => $tagName,
            ], [
                'slug' => Str::slug($tagName),
            ]);

            $tagIds[] = $tag->id;
        }

        $post->tags()->sync($tagIds);
    }

    /**
     * List pending posts for admin approval.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function listPendingPosts(int $perPage = 20, ?int $categoryId = null): LengthAwarePaginator
    {
        $query = Post::query()
            ->with(['category', 'user'])
            ->where('status', PostStatus::PENDING);

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    /**
     * Approve a pending post to be published on homepage.
     *
     * @throws \Throwable
     */
    public function approvePost(int $id): Post
    {
        DB::beginTransaction();
        try {
            $post = Post::with(['category', 'user', 'tags'])->findOrFail($id);

            if ($post->status !== PostStatus::PENDING) {
                throw new \RuntimeException(trans('errors.post.not_pending'));
            }

            $post->update([
                'status' => PostStatus::APPROVED,
            ]);

            \Illuminate\Support\Facades\Cache::forget('categories_list');

            DB::commit();
            return $post->fresh(['category', 'user', 'tags']);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Reject a pending post.
     *
     * @throws \Throwable
     */
    public function rejectPost(int $id, string $reason): Post
    {
        DB::beginTransaction();
        try {
            $post = Post::with(['category', 'user', 'tags'])->findOrFail($id);

            if ($post->status !== PostStatus::PENDING) {
                throw new \RuntimeException(trans('errors.post.not_pending'));
            }

            $post->update([
                'status' => PostStatus::REJECTED,
                'reject_reason' => $reason,
            ]);

            \Illuminate\Support\Facades\Cache::forget('categories_list');

            DB::commit();
            return $post->fresh(['category', 'user', 'tags']);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Promote a post to Homepage pending queue.
     *
     * @throws \Throwable
     */
    public function promotePost(int $id): Post
    {
        DB::beginTransaction();
        try {
            $post = Post::with(['category', 'user', 'tags'])->findOrFail($id);

            if ($post->user_id !== $this->user->id) {
                throw new \RuntimeException('Bạn không có quyền đăng bài viết này lên trang chủ.');
            }

            if (!in_array($post->status, [PostStatus::PUBLISHED, PostStatus::REJECTED])) {
                throw new \RuntimeException('Bài viết đã được duyệt hoặc đang chờ duyệt.');
            }

            $post->update([
                'status' => PostStatus::PENDING,
            ]);

            DB::commit();
            return $post->fresh(['category', 'user', 'tags']);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * List rejected posts.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function listRejectedPosts(int $perPage = 20, ?string $fromDate = null, ?string $toDate = null): LengthAwarePaginator
    {
        $query = Post::query()
            ->with(['category', 'user'])
            ->where('status', PostStatus::REJECTED);

        if ($fromDate) {
            $query->whereDate('created_at', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('created_at', '<=', $toDate);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    /**
     * Admin create a post directly (bypass approval).
     *
     * @throws \Throwable
     */
    public function adminCreatePost(AdminCreatePostData $dto, User $admin): Post
    {
        DB::beginTransaction();
        try {
            $parsed = $this->parsePreviewText($dto->content);

            $post = Post::create([
                'user_id' => $admin->id,
                'category_id' => $dto->categoryId,
                'title' => $dto->title,
                'content' => $parsed['content'],
                'summary' => $parsed['summary'],
                'status' => PostStatus::PUBLISHED,
                'views_count' => 0,
            ]);

            $this->syncPostTags($post, $dto->tags);

            \Illuminate\Support\Facades\Cache::forget('categories_list');

            DB::commit();
            return $post->load(['category', 'user', 'tags']);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Admin update any post.
     *
     * @throws \Throwable
     */
    public function adminUpdatePost(int $id, AdminUpdatePostData $dto, User $admin): Post
    {
        DB::beginTransaction();
        try {
            $post = Post::withTrashed()->findOrFail($id);
            $updateData = [];

            if ($dto->title !== null) {
                $updateData['title'] = $dto->title;
            }

            if ($dto->categoryId !== null) {
                $updateData['category_id'] = $dto->categoryId;
            }

            if ($dto->content !== null) {
                $parsed = $this->parsePreviewText($dto->content);
                $updateData['content'] = $parsed['content'];
                $updateData['summary'] = $parsed['summary'];
            }

            if ($dto->status !== null) {
                $updateData['status'] = $dto->status;
            }

            $post->update($updateData);

            if ($dto->tags !== null) {
                $this->syncPostTags($post, $dto->tags);
            }

            \Illuminate\Support\Facades\Cache::forget('categories_list');

            DB::commit();
            return $post->load(['category', 'user', 'tags']);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Admin soft delete a post with engagement warning.
     *
     * @throws \Throwable
     */
    public function adminDeletePost(int $id, ?bool $confirm, User $admin): void
    {
        DB::beginTransaction();
        try {
            $post = Post::findOrFail($id);

            $likesCount = $post->likes()->count();
            $commentsCount = $post->comments()->count();

            if (($likesCount > 0 || $commentsCount > 0) && !$confirm) {
                throw ValidationException::withMessages([
                    'confirm' => [sprintf('Bài viết này đang có %d lượt thích và %d bình luận. Vui lòng xác nhận rằng bạn chắc chắn muốn xóa bài viết này.', $likesCount, $commentsCount)],
                ]);
            }

            $post->update([
                'previous_status' => $post->status,
                'status' => PostStatus::DELETED,
            ]);
            $post->delete();

            \Illuminate\Support\Facades\Cache::forget('categories_list');

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Admin force delete (hard delete) a soft-deleted post.
     *
     * @throws \Throwable
     */
    public function adminForceDeletePost(int $id, User $admin): void
    {
        DB::beginTransaction();
        try {
            $post = Post::withTrashed()->findOrFail($id);

            // Manually log force-delete since Spatie won't log on hard delete easily
            activity()
                ->performedOn($post)
                ->causedBy($admin)
                ->log('force-deleted');

            $post->forceDelete();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Admin restore a soft-deleted post.
     *
     * @throws \Throwable
     */
    public function adminRestorePost(int $id, User $admin): Post
    {
        DB::beginTransaction();
        try {
            $post = Post::onlyTrashed()->findOrFail($id);

            $post->restore();

            $targetStatus = $post->previous_status ? PostStatus::from($post->previous_status) : PostStatus::APPROVED;
            $post->update([
                'status' => $targetStatus,
                'previous_status' => null,
            ]);

            activity()
                ->performedOn($post)
                ->causedBy($admin)
                ->log('restored');

            \Illuminate\Support\Facades\Cache::forget('categories_list');

            DB::commit();
            return $post->load(['category', 'user', 'tags']);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * List all soft-deleted posts.
     */
    public function listTrashedPosts(int $perPage = 20): LengthAwarePaginator
    {
        return Post::onlyTrashed()
            ->with(['category', 'user', 'tags'])
            ->orderByDesc('deleted_at')
            ->paginate($perPage);
    }

    /**
     * Get posts by user ID for profile page.
     */
    public function getPostsByUserId(int $userId, int $perPage = 10): LengthAwarePaginator
    {
        $currentUserId = auth()->guard('api')->id();

        $query = Post::query()
            ->where('user_id', $userId)
            ->with([
                'category',
                'user',
                'tags',
                'likes' => function ($q) use ($currentUserId) {
                    $q->where('user_id', $currentUserId);
                },
            ])
            ->withCount(['likes', 'comments'])
            ->orderByDesc('created_at');

        if (!$this->user || $this->user->id !== $userId) {
            $query->whereIn('status', [PostStatus::PUBLISHED, PostStatus::APPROVED, PostStatus::PENDING]);
        }

        return $query->paginate($perPage);
    }
}
