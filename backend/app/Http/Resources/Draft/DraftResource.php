<?php

namespace App\Http\Resources\Draft;

use App\Helpers\DateHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Draft
 */
class DraftResource extends JsonResource
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
            'user_id' => (int) $this->user_id,
            'category_id' => (int) $this->category_id,
            'post_id' => $this->post_id ? (int) $this->post_id : null,
            'title' => $this->title,
            'content' => $this->content,
            'tags' => $this->tags ?? [],
            'created_at' => DateHelper::formatDateTime($this->created_at),
            'updated_at' => DateHelper::formatDateTime($this->updated_at),
        ];
    }
}
