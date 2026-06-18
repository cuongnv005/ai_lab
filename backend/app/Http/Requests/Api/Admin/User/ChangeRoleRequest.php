<?php

namespace App\Http\Requests\Api\Admin\User;

use Illuminate\Foundation\Http\FormRequest;

class ChangeRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => [
                'required',
                'string',
                'in:member,moderator,admin',
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'role' => __('attributes.user.role'),
        ];
    }
}
