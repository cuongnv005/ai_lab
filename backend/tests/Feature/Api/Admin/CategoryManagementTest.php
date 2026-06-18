<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $member;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->member = User::factory()->create();
        $this->member->assignRole('member');
    }

    public function test_non_admin_cannot_access_category_management(): void
    {
        $this->actingAs($this->member)
            ->getJson('/api/admin/categories')
            ->assertStatus(403);

        $this->actingAs($this->member)
            ->postJson('/api/admin/categories', [])
            ->assertStatus(403);
    }

    public function test_admin_can_list_categories_ordered_by_sort_order(): void
    {
        $cat1 = Category::factory()->create(['name' => 'Category B', 'slug' => 'cat-b', 'sort_order' => 2]);
        $cat2 = Category::factory()->create(['name' => 'Category A', 'slug' => 'cat-a', 'sort_order' => 1]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/categories');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.id', $cat2->id)
            ->assertJsonPath('data.1.id', $cat1->id);
    }

    public function test_admin_can_view_category_details(): void
    {
        $category = Category::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/categories/{$category->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.category.id', $category->id)
            ->assertJsonCount(1, 'data.posts')
            ->assertJsonPath('data.posts.0.id', $post->id);
    }

    public function test_admin_can_create_category_with_custom_slug(): void
    {
        $payload = [
            'name' => 'Laravel Framework',
            'slug' => 'laravel-framework',
            'description' => 'Discussions about Laravel development',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/categories', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Laravel Framework')
            ->assertJsonPath('data.slug', 'laravel-framework')
            ->assertJsonPath('data.sort_order', 1);
    }

    public function test_admin_create_category_fails_validation(): void
    {
        $cat = Category::factory()->create(['name' => 'Duplicate Name', 'slug' => 'duplicate-slug']);

        // Invalid regex slug
        $payloadInvalid = [
            'name' => 'Valid Name',
            'slug' => 'Invalid_Slug_With_Underscore',
        ];
        $this->actingAs($this->admin)
            ->postJson('/api/admin/categories', $payloadInvalid)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);

        // Duplicate name
        $payloadDuplicateName = [
            'name' => 'Duplicate Name',
            'slug' => 'unique-slug',
        ];
        $this->actingAs($this->admin)
            ->postJson('/api/admin/categories', $payloadDuplicateName)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);

        // Duplicate slug
        $payloadDuplicateSlug = [
            'name' => 'Unique Name',
            'slug' => 'duplicate-slug',
        ];
        $this->actingAs($this->admin)
            ->postJson('/api/admin/categories', $payloadDuplicateSlug)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_admin_can_update_category(): void
    {
        $category = Category::factory()->create(['name' => 'Old Name', 'slug' => 'old-slug']);

        $payload = [
            'name' => 'New Name',
            'slug' => 'new-slug',
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/categories/{$category->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.slug', 'new-slug');
    }

    public function test_admin_cannot_delete_category_with_posts(): void
    {
        $category = Category::factory()->create();
        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $category->id,
        ]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/categories/{$category->id}")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['category']);
    }

    public function test_admin_can_move_posts_to_another_category(): void
    {
        $sourceCat = Category::factory()->create();
        $targetCat = Category::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $sourceCat->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/categories/{$sourceCat->id}/move-posts", [
                'target_category_id' => $targetCat->id,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.moved_count', 1);

        $this->assertEquals($targetCat->id, $post->fresh()->category_id);
    }

    public function test_admin_can_delete_empty_category(): void
    {
        $category = Category::factory()->create();

        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/categories/{$category->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_admin_can_reorder_categories(): void
    {
        $cat1 = Category::factory()->create(['sort_order' => 1]);
        $cat2 = Category::factory()->create(['sort_order' => 2]);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/categories/reorder', [
                'ids' => [$cat2->id, $cat1->id],
            ]);

        $response->assertStatus(200);

        $this->assertEquals(1, $cat2->fresh()->sort_order);
        $this->assertEquals(2, $cat1->fresh()->sort_order);
    }
}
