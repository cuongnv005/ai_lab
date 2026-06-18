<?php

namespace App\Http\Requests\Api\Admin\Post;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:' . config('validate.max_length.string', 255)],
            'content' => ['nullable', 'string', 'max:65000'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['required', 'string', 'max:50'],
            'status' => ['nullable', 'integer', 'in:1,2,3'], // PostStatus values (1=Pending, 2=Published, 3=Rejected)
        ];
    }
}
