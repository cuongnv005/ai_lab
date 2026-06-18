<?php

namespace App\Http\Resources;

use App\Helpers\DateHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            // 'email' => $this->email, // Email is intentionally excluded as per requirements
            'avatar_url' => $this->avatar_url,
            'dob' => $this->dob ? DateHelper::formatDate($this->dob) : null,
            'hometown' => $this->hometown,
            'gender' => $this->gender ? $this->gender->value : null,
            'gender_label' => $this->gender ? $this->gender->label() : null,
            'bio' => $this->bio,
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->pluck('name');
            }),
            'created_at' => DateHelper::formatDateTime($this->created_at),
            'updated_at' => DateHelper::formatDateTime($this->updated_at),
        ];
    }
}
