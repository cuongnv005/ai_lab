<?php

namespace App\Http\Requests\Report;

use Illuminate\Foundation\Http\FormRequest;

class CreateReportRequest extends FormRequest
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
            'reportable_type' => ['required', 'string', 'in:post,comment,App\Models\Post,App\Models\Comment'],
            'reportable_id' => ['required', 'integer'],
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
