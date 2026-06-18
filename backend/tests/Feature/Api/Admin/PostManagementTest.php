<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\User;
use App\Enums\PostStatus;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $member;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->member = User::factory()->create();
        $this->member->assignRole('member');

        $this->category = Category::factory()->create();
    }

    public function test_non_admin_cannot_access_post_management(): void
    {
        $this->actingAs($this->member)
            ->getJson('/api/admin/posts')
            ->assertStatus(403);

        $this->actingAs($this->member)
            ->postJson('/api/admin/posts', [])
            ->assertStatus(403);
    }

    public function test_admin_can_list_posts_with_filters_and_search(): void
    {
        $post1 = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'title' => 'Laravel 13 Guide',
            'status' => PostStatus::PENDING,
        ]);

        $post2 = Post::factory()->create([
            'user_id' => $this->admin->id,
            'category_id' => $this->category->id,
            'title' => 'Vue 3 Tutorial',
            'status' => PostStatus::PUBLISHED,
        ]);

        // Search test
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/posts?search=Guide');

        $response->assertStatus(200)
            ->assertJsonPath('data.data.0.id', $post1->id);

        // Filter status test
        $filters = json_encode([
            [
                'key' => 'status',
                'data' => PostStatus::PUBLISHED->value,
            ],
        ]);
        $responseFilter = $this->actingAs($this->admin)
            ->getJson('/api/admin/posts?filters=' . urlencode($filters));

        $responseFilter->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $post2->id);

        // Filter author test
        $filtersAuthor = json_encode([
            [
                'key' => 'author',
                'data' => $this->member->id,
            ],
        ]);
        $responseAuthor = $this->actingAs($this->admin)
            ->getJson('/api/admin/posts?filters=' . urlencode($filtersAuthor));

        $responseAuthor->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $post1->id);
    }

    public function test_admin_can_exclude_staff_posts_using_filter(): void
    {
        $modUser = User::factory()->create();
        $modUser->assignRole('moderator');

        $memberPost = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PUBLISHED,
        ]);

        $adminPost = Post::factory()->create([
            'user_id' => $this->admin->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PUBLISHED,
        ]);

        $modPost = Post::factory()->create([
            'user_id' => $modUser->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PUBLISHED,
        ]);

        $filters = json_encode([
            [
                'key' => 'exclude_staff',
                'data' => '1',
            ],
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/posts?filters=' . urlencode($filters));

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $memberPost->id);
    }

    public function test_admin_can_create_post_without_approval(): void
    {
        $payload = [
            'title' => 'Admin Secret Post',
            'content' => '[preview]Summary[/preview]Body content here',
            'category_id' => $this->category->id,
            'tags' => ['admin', 'important'],
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/posts', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Admin Secret Post')
            ->assertJsonPath('data.status', PostStatus::PUBLISHED->value);

        $this->assertDatabaseHas('posts', [
            'title' => 'Admin Secret Post',
            'status' => PostStatus::PUBLISHED->value,
        ]);
    }

    public function test_admin_can_update_any_post_and_change_status(): void
    {
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING,
        ]);

        $payload = [
            'title' => 'Updated Title By Admin',
            'status' => PostStatus::PUBLISHED->value,
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/posts/{$post->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title By Admin')
            ->assertJsonPath('data.status', PostStatus::PUBLISHED->value);

        $this->assertEquals(PostStatus::PUBLISHED, $post->fresh()->status);
    }

    public function test_admin_cannot_delete_post_with_engagement_without_confirm(): void
    {
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
        ]);

        Comment::factory()->create([
            'user_id' => $this->member->id,
            'post_id' => $post->id,
            'content' => 'Some comment',
        ]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/posts/{$post->id}")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['confirm']);
    }

    public function test_admin_can_delete_post_with_confirm(): void
    {
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
        ]);

        PostLike::create([
            'user_id' => $this->member->id,
            'post_id' => $post->id,
        ]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/posts/{$post->id}", ['confirm' => true])
            ->assertStatus(200);

        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    public function test_admin_can_list_trashed_posts(): void
    {
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
        ]);
        $post->delete();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/posts/trashed');

        $response->assertStatus(200)
            ->assertJsonPath('data.data.0.id', $post->id);
    }

    public function test_admin_can_restore_trashed_post(): void
    {
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
        ]);
        $post->delete();

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/posts/{$post->id}/restore");

        $response->assertStatus(200);
        $this->assertNull($post->fresh()->deleted_at);
    }

    public function test_admin_can_force_delete_non_trashed_post(): void
    {
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/admin/posts/{$post->id}/force-delete")
            ->assertStatus(200);

        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    public function test_admin_can_force_delete_trashed_post(): void
    {
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
        ]);
        $post->delete();

        $this->actingAs($this->admin)
            ->postJson("/api/admin/posts/{$post->id}/force-delete")
            ->assertStatus(200);

        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }
}
