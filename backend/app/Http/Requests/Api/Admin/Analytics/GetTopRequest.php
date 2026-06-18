<?php

namespace App\Http\Requests\Api\Admin\Analytics;

use Illuminate\Foundation\Http\FormRequest;

class GetTopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'period' => [
                'nullable',
                'string',
                'in:today,7days,30days,year',
            ],
            'limit' => [
                'nullable',
                'integer',
                'min:1',
                'max:50',
            ],
        ];
    }
}
