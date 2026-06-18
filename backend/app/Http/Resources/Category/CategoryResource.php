<?php

namespace App\Http\Resources\Category;

use App\Helpers\DateHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Category
 */
class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'name' => (string) $this->name,
            'slug' => (string) $this->slug,
            'description' => $this->description ? (string) $this->description : null,
            'sort_order' => isset($this->sort_order) ? (int) $this->sort_order : 0,
            'posts_count' => $this->relationLoaded('posts') || isset($this->posts_count)
                ? (int) ($this->posts_count ?? $this->posts->count())
                : (int) $this->posts()->whereIn('status', [
                    \App\Enums\PostStatus::PUBLISHED,
                    \App\Enums\PostStatus::PENDING,
                    \App\Enums\PostStatus::APPROVED,
                    \App\Enums\PostStatus::REJECTED,
                ])->count(),
            'latest_posts' => $this->relationLoaded('latest_posts')
                ? \App\Http\Resources\Post\PostResource::collection($this->latest_posts)
                : [],
            'created_at' => DateHelper::formatDateTime($this->created_at),
            'updated_at' => DateHelper::formatDateTime($this->updated_at),
        ];
    }
}
