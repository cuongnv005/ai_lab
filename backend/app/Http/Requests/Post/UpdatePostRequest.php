<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:' . config('validate.max_length.string')],
            'content' => ['sometimes', 'required', 'string', 'max:65000'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'tags' => ['sometimes', 'nullable', 'array'],
            'tags.*' => ['required', 'string', 'max:50'],
        ];
    }
}
