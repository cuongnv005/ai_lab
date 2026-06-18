<?php

namespace App\Http\Resources\Post;

use App\Helpers\DateHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Post
 */
class PostThreadResource extends JsonResource
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
            'title' => (string) $this->title,
            'views_count' => (int) $this->views_count,
            'comments_count' => isset($this->comments_count) ? (int) $this->comments_count : ($this->relationLoaded('comments') ? $this->comments->count() : $this->comments()->count()),
            'created_at' => DateHelper::formatDateTime($this->created_at),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => (int) $this->user->id,
                    'name' => (string) $this->user->name,
                    'avatar' => $this->user->avatar ?? null,
                ];
            }),
        ];
    }
}
