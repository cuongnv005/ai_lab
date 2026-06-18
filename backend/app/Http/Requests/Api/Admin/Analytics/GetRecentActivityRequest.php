<?php

namespace App\Http\Requests\Api\Admin\Analytics;

use Illuminate\Foundation\Http\FormRequest;

class GetRecentActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'limit' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ];
    }
}
