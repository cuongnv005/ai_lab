<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RejectPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'moderator']) ?? false;
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
        ];
    }

    public function attributes(): array
    {
        return [
            'reason' => trans('attributes.post.reject_reason'),
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => trans('validation.post.reject_reason_required'),
            'reason.min' => trans('validation.post.reject_reason_min', ['min' => 10]),
            'reason.max' => trans('validation.post.reject_reason_max', ['max' => 1000]),
        ];
    }
}
