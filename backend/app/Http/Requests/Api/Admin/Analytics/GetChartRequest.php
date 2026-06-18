<?php

namespace App\Http\Requests\Api\Admin\Analytics;

use Illuminate\Foundation\Http\FormRequest;

class GetChartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'period' => [
                'required',
                'string',
                'in:today,7days,30days,year',
            ],
            'type' => [
                'required',
                'string',
                'in:views,posts,users,comments',
            ],
        ];
    }
}
