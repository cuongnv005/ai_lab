<?php

namespace App\Http\Resources\User;

use App\Helpers\DateHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\User
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array{id: int, name: string, email: string, status: int, status_label: string, role: string, ban_reason: string|null, banned_until: string|null, posts_count: int|null, created_at: string, updated_at: string}
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'name' => (string) $this->name,
            'email' => (string) $this->email,
            'avatar_url' => $this->avatar_url,
            'status' => (int) $this->status->value,
            'status_label' => (string) $this->status->label(),
            'role' => (string) ($this->getRoleNames()->first() ?? 'member'),
            'ban_reason' => $this->ban_reason ? (string) $this->ban_reason : null,
            'banned_until' => $this->banned_until ? DateHelper::formatDateTime($this->banned_until) : null,
            'posts_count' => isset($this->posts_count) ? (int) $this->posts_count : null,
            'created_at' => DateHelper::formatDateTime($this->created_at),
            'updated_at' => DateHelper::formatDateTime($this->updated_at),
        ];
    }
}
