<?php

namespace App\Http\Requests\Api\Admin\User;

use Illuminate\Foundation\Http\FormRequest;

class BanUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => [
                'required',
                'string',
                'min:10',
                'max:1000',
            ],
            'duration' => [
                'nullable',
                'integer',
                'min:1',
                'max:3650',
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'reason' => __('attributes.user.ban_reason'),
            'duration' => __('attributes.user.ban_duration'),
        ];
    }
}
