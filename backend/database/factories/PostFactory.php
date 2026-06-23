<?php

namespace Database\Factories;

use App\Enums\PostStatus;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    protected $model = Post::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraphs(4, true),
            'summary' => $this->faker->paragraph(),
            'status' => PostStatus::PUBLISHED->value,
            'views_count' => $this->faker->numberBetween(0, 500),
            'reject_reason' => null,
        ];
    }

    /**
     * Indicate that the post is pending approval.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PostStatus::PENDING->value,
        ]);
    }

    /**
     * Indicate that the post is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PostStatus::REJECTED->value,
            'reject_reason' => $this->faker->sentence(),
        ]);
    }
}
