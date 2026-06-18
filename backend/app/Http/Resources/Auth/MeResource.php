<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        $data = $this->resource;

        return [
            'id' => $data->id,
            'name' => $data->name,
            'avatar_url' => $data->avatar_url,
            'email' => $data->email,
            'status' => $data->status,
            'roles' => $data->roles->pluck('name')->toArray(),
            'permissions' => $data->getAllPermissions()->pluck('name')->toArray(),
        ];
    }
}
