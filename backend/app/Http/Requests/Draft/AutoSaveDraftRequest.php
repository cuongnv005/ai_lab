<?php

namespace App\Http\Requests\Draft;

use Illuminate\Foundation\Http\FormRequest;

class AutoSaveDraftRequest extends FormRequest
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
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'post_id' => ['nullable', 'integer', 'exists:posts,id'],
            'title' => ['nullable', 'string', 'max:' . config('validate.max_length.string')],
            'content' => ['nullable', 'string', 'max:65000'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['required', 'string', 'max:50'],
        ];
    }
}
