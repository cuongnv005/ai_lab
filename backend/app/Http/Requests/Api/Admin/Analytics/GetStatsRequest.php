<?php

namespace App\Http\Requests\Api\Admin\Analytics;

use Illuminate\Foundation\Http\FormRequest;

class GetStatsRequest extends FormRequest
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
        ];
    }
}
