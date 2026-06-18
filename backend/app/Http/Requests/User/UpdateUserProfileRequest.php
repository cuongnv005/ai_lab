<?php

namespace App\Http\Requests\User;

use App\Enums\Gender;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:' . config('validate.max_length.name', 50)],
            'avatar_url' => ['nullable', 'url', 'max:2048'],
            'dob' => ['nullable', 'date', 'before_or_equal:today'],
            'hometown' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', Rule::enum(Gender::class)],
            'bio' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
