<?php

namespace App\Services\Api\Engagement;

use App\DTOs\Api\Engagement\CreateCommentData;
use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\Post;
use App\Models\PostLike;
use App\Services\Base\Service;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class EngagementService extends Service
{
    /**
     * Get paginated comments for a post in a tree structure.
     */
    public function getPostComments(int $postId): LengthAwarePaginator
    {
        // First verify that the post exists
        Post::findOrFail($postId);

        return Comment::query()
            ->where('post_id', $postId)
            ->whereNull('parent_id')
            ->withCount('likes')
            ->with([
                'user.roles',
                'likedByCurrentUser',
                'replies' => function ($query) {
                    $query->withCount('likes')
                        ->orderBy('created_at', 'asc');
                },
                'replies.user.roles',
                'replies.likedByCurrentUser',
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
    }

    /**
     * Add a comment/reply to a post.
     *
     * @throws \Throwable
     */
    public function addComment(int $postId, CreateCommentData $dto): Comment
    {
        // Check if post exists
        Post::findOrFail($postId);

        // If parent_id is provided, verify it belongs to the same post
        if ($dto->parentId !== null) {
            $parent = Comment::findOrFail($dto->parentId);
            if ($parent->post_id !== $postId) {
                throw new \InvalidArgumentException('Parent comment does not belong to the same post.');
            }
        }

        DB::beginTransaction();
        try {
            $comment = Comment::create([
                'post_id' => $postId,
                'user_id' => $this->user->id,
                'parent_id' => $dto->parentId,
                'content' => $dto->content,
            ]);

            DB::commit();

            // Load relationships for response
            $comment->load(['user.roles']);
            $comment->setRelation('replies', collect());
            $comment->setRelation('likedByCurrentUser', collect());
            $comment->likes_count = 0;

            return $comment;
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a comment.
     *
     * @throws AuthorizationException
     * @throws \Throwable
     */
    public function deleteComment(int $id): void
    {
        $comment = Comment::findOrFail($id);

        // Authorization check: Owner, Moderator, or Admin
        if ($comment->user_id !== $this->user->id && !$this->user->hasRole('admin') && !$this->user->hasRole('moderator')) {
            throw new AuthorizationException(__('This action is unauthorized.'));
        }

        DB::beginTransaction();
        try {
            // Delete all replies first or let ON DELETE CASCADE handle it?
            // Since there is no cascading delete specified on the comments table by default in our migration (or maybe there is),
            // let's delete replies explicitly to be safe.
            Comment::where('parent_id', $comment->id)->delete();
            $comment->delete();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Toggle like/unlike on a post.
     *
     * @throws \Throwable
     */
    public function togglePostLike(int $postId): bool
    {
        Post::findOrFail($postId);

        DB::beginTransaction();
        try {
            $like = PostLike::where('post_id', $postId)
                ->where('user_id', $this->user->id)
                ->first();

            if ($like) {
                $like->delete();
                DB::commit();
                return false;
            }

            try {
                PostLike::create([
                    'post_id' => $postId,
                    'user_id' => $this->user->id,
                ]);
            } catch (\Illuminate\Database\UniqueConstraintViolationException|\Illuminate\Database\QueryException $e) {
                // If unique constraint violation occurs due to concurrent requests, it means it's already liked.
            }

            DB::commit();
            return true;
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Toggle like/unlike on a comment.
     *
     * @throws \Throwable
     */
    public function toggleCommentLike(int $commentId): bool
    {
        Comment::findOrFail($commentId);

        DB::beginTransaction();
        try {
            $like = CommentLike::where('comment_id', $commentId)
                ->where('user_id', $this->user->id)
                ->first();

            if ($like) {
                $like->delete();
                DB::commit();
                return false;
            }

            try {
                CommentLike::create([
                    'comment_id' => $commentId,
                    'user_id' => $this->user->id,
                ]);
            } catch (\Illuminate\Database\UniqueConstraintViolationException|\Illuminate\Database\QueryException $e) {
                // Ignore unique constraint violations
            }

            DB::commit();
            return true;
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Admin view comment details.
     */
    public function adminGetCommentDetails(int $id): Comment
    {
        return Comment::withTrashed()
            ->with(['user', 'post', 'replies.user', 'likes'])
            ->findOrFail($id);
    }

    /**
     * Admin soft delete a comment and cascade soft delete its replies.
     *
     * @throws \Throwable
     */
    public function adminDeleteComment(int $id, User $admin): void
    {
        DB::beginTransaction();
        try {
            $comment = Comment::findOrFail($id);

            // Cascade soft delete replies
            Comment::where('parent_id', $comment->id)->delete();

            $comment->delete();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Admin permanently delete a soft-deleted comment and its replies.
     *
     * @throws \Throwable
     */
    public function adminForceDeleteComment(int $id, User $admin): void
    {
        DB::beginTransaction();
        try {
            $comment = Comment::withTrashed()->findOrFail($id);

            if (!$comment->trashed()) {
                throw ValidationException::withMessages([
                    'id' => ['Only soft-deleted comments can be permanently deleted.'],
                ]);
            }

            activity()
                ->performedOn($comment)
                ->causedBy($admin)
                ->log('force-deleted');

            // Cascade force delete replies
            Comment::withTrashed()->where('parent_id', $comment->id)->forceDelete();

            $comment->forceDelete();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Admin restore a soft-deleted comment and its replies.
     *
     * @throws \Throwable
     */
    public function adminRestoreComment(int $id, User $admin): Comment
    {
        DB::beginTransaction();
        try {
            $comment = Comment::onlyTrashed()->findOrFail($id);

            $comment->restore();

            activity()
                ->performedOn($comment)
                ->causedBy($admin)
                ->log('restored');

            // Cascade restore replies
            Comment::onlyTrashed()->where('parent_id', $comment->id)->restore();

            DB::commit();
            return $comment->load(['user', 'post', 'replies']);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * List all soft-deleted comments.
     */
    public function listTrashedComments(int $perPage = 20): LengthAwarePaginator
    {
        return Comment::onlyTrashed()
            ->with(['user', 'post'])
            ->orderByDesc('deleted_at')
            ->paginate($perPage);
    }
}
