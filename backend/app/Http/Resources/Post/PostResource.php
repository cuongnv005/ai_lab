<?php

namespace App\Http\Resources\Post;

use App\Helpers\DateHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Post
 */
class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'title' => (string) $this->title,
            'slug' => (string) $this->slug,
            'summary' => $this->summary,
            'first_image' => $this->first_image,
            'content' => $this->when(array_key_exists('content', $this->resource->getAttributes()), function () {
                return (string) $this->content;
            }),
            'status' => (int) $this->status->value,
            'status_label' => (string) $this->status->label(),
            'views_count' => (int) $this->views_count,
            'reject_reason' => $this->reject_reason,
            'created_at' => DateHelper::formatDateTime($this->created_at),
            'updated_at' => DateHelper::formatDateTime($this->updated_at),
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => (int) $this->category->id,
                    'name' => (string) $this->category->name,
                    'slug' => (string) $this->category->slug,
                ];
            }),
            'user' => $this->whenLoaded('user', function () {
                if (!$this->user) {
                    return null;
                }
                return [
                    'id' => (int) $this->user->id,
                    'name' => (string) $this->user->name,
                    'avatar_url' => $this->user->avatar_url,
                    'email' => (string) $this->user->email,
                    'posts_count' => (int) $this->user->posts_count,
                    'rating_value' => (int) $this->user->total_likes,
                    'created_at' => DateHelper::formatDateTime($this->user->created_at),
                ];
            }),
            'tags' => $this->whenLoaded('tags', function () {
                return $this->tags->map(function ($tag) {
                    return [
                        'id' => (int) $tag->id,
                        'name' => (string) $tag->name,
                        'slug' => (string) $tag->slug,
                      ];
                });
            }),
            'likes_count' => isset($this->likes_count) ? (int) $this->likes_count : ($this->relationLoaded('likes') ? $this->likes->count() : $this->likes()->count()),
            'is_liked' => $this->relationLoaded('likes')
                ? $this->likes->contains('user_id', auth()->guard('api')->id())
                : $this->likes()->where('user_id', auth()->guard('api')->id())->exists(),
            'is_reported' => auth()->guard('api')->check()
                ? \App\Models\Report::where('user_id', auth()->guard('api')->id())
                    ->where('reportable_type', \App\Models\Post::class)
                    ->where('reportable_id', $this->id)
                    ->where('status', \App\Enums\ReportStatus::PENDING->value)
                    ->exists()
                : false,
            'comments_count' => isset($this->comments_count) ? (int) $this->comments_count : ($this->relationLoaded('comments') ? $this->comments->count() : $this->comments()->count()),
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
