<?php

namespace App\Http\Resources\Comment;

use App\Helpers\DateHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Comment
 */
class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currentUserId = auth()->guard('api')->id();

        $isLiked = false;
        if ($currentUserId) {
            if ($this->relationLoaded('likedByCurrentUser')) {
                $isLiked = $this->likedByCurrentUser->isNotEmpty();
            } elseif ($this->relationLoaded('likes')) {
                $isLiked = $this->likes->contains('user_id', $currentUserId);
            } else {
                $isLiked = $this->likes()->where('user_id', $currentUserId)->exists();
            }
        }

        $likesCount = $this->likes_count ?? ($this->relationLoaded('likes') ? $this->likes->count() : $this->likes()->count());

        return [
            'id' => (int) $this->id,
            'post_id' => (int) $this->post_id,
            'user_id' => (int) $this->user_id,
            'parent_id' => $this->parent_id ? (int) $this->parent_id : null,
            'content' => (string) $this->content,
            'likes_count' => $likesCount,
            'is_liked' => $isLiked,
            'is_reported' => auth()->guard('api')->check()
                ? \App\Models\Report::where('user_id', auth()->guard('api')->id())
                    ->where('reportable_type', \App\Models\Comment::class)
                    ->where('reportable_id', $this->id)
                    ->where('status', \App\Enums\ReportStatus::PENDING->value)
                    ->exists()
                : false,
            'created_at' => DateHelper::formatDateTime($this->created_at),
            'updated_at' => DateHelper::formatDateTime($this->updated_at),
            'user' => $this->relationLoaded('user') && $this->user ? [
                'id' => (int) $this->user->id,
                'name' => (string) $this->user->name,
                'avatar_url' => $this->user->avatar_url,
                'email' => (string) $this->user->email,
                'roles' => $this->user->roles->map(fn ($role) => [
                    'id' => (int) $role->id,
                    'name' => (string) $role->name,
                ]),
            ] : null,
            'replies' => self::collection($this->whenLoaded('replies')),
            'post' => $this->whenLoaded('post', function () {
                return [
                    'id' => (int) $this->post->id,
                    'title' => (string) $this->post->title,
                ];
            }),
            'deleted_at' => $this->deleted_at ? DateHelper::formatDateTime($this->deleted_at) : null,
            'deleted_by' => $this->when($this->deleted_at !== null, function () {
                $activity = \Spatie\Activitylog\Models\Activity::forSubject($this->resource)
                    ->where('description', 'deleted')
                    ->latest()
                    ->first();
                return $activity?->causer ? [
                    'id' => (int) $activity->causer->id,
                    'name' => (string) $activity->causer->name,
                ] : null;
            }),
        ];
    }
}
