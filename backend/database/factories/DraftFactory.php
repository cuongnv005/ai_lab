<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Draft;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Draft>
 */
class DraftFactory extends Factory
{
    protected $model = Draft::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'post_id' => null,
            'title' => fake()->sentence(),
            'content' => fake()->paragraphs(3, true),
            'tags' => ['chatgpt', 'laravel'],
        ];
    }
}
