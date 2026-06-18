<?php

namespace Tests\Feature\Api\Admin;

use App\Enums\PostStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostApprovalTest extends TestCase
{
    use RefreshDatabase;

    private User $member;
    private User $moderator;
    private User $admin;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->member = User::factory()->create();
        $this->member->assignRole(UserRole::MEMBER->value);

        $this->moderator = User::factory()->create();
        $this->moderator->assignRole(UserRole::MODERATOR->value);

        $this->admin = User::factory()->create();
        $this->admin->assignRole(UserRole::ADMIN->value);

        $this->category = Category::factory()->create([
            'name' => 'General Discussion',
            'slug' => 'general-discussion',
        ]);
    }

    public function test_admin_can_list_pending_posts(): void
    {
        // Arrange
        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
            'title' => 'Pending Post',
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/posts/pending');

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.data.0.title', 'Pending Post')
            ->assertJsonPath('data.data.0.status', PostStatus::PENDING->value);
    }

    public function test_pending_posts_list_includes_author_and_category(): void
    {
        // Arrange
        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/posts/pending');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'title',
                            'content',
                            'status',
                            'created_at',
                            'user' => ['id', 'name', 'email'],
                            'category' => ['id', 'name', 'slug'],
                        ],
                    ],
                ],
            ]);
    }

    public function test_pending_posts_list_can_filter_by_category(): void
    {
        // Arrange
        $category2 = Category::factory()->create([
            'name' => 'Second Category',
            'slug' => 'second-category',
        ]);

        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
            'title' => 'First Category Post',
        ]);

        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $category2->id,
            'status' => PostStatus::PENDING->value,
            'title' => 'Second Category Post',
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/posts/pending?category_id={$this->category->id}");

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('First Category Post', $data[0]['title']);
    }

    public function test_admin_can_approve_pending_post(): void
    {
        // Arrange
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/posts/{$post->id}/approve");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.status', PostStatus::APPROVED->value)
            ->assertJsonPath('message', __('messages.post.approved'));

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'status' => PostStatus::APPROVED->value,
        ]);
    }

    public function test_approve_returns_error_for_non_pending_post(): void
    {
        // Arrange
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::APPROVED->value,
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/posts/{$post->id}/approve");

        // Assert
        $response->assertStatus(422);
    }

    public function test_admin_can_reject_pending_post_with_reason(): void
    {
        // Arrange
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/posts/{$post->id}/reject", [
                'reason' => 'This post violates community guidelines',
            ]);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.status', PostStatus::REJECTED->value)
            ->assertJsonPath('data.reject_reason', 'This post violates community guidelines')
            ->assertJsonPath('message', __('messages.post.rejected'));

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'status' => PostStatus::REJECTED->value,
            'reject_reason' => 'This post violates community guidelines',
        ]);
    }

    public function test_reject_requires_reason_with_minimum_10_characters(): void
    {
        // Arrange
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        // Act - Too short
        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/posts/{$post->id}/reject", [
                'reason' => 'Too short',
            ]);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['reason']);
    }

    public function test_reject_requires_reason_field(): void
    {
        // Arrange
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/posts/{$post->id}/reject", []);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['reason']);
    }

    public function test_member_cannot_access_approval_endpoints(): void
    {
        // Arrange
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        // Act & Assert - List pending
        $response = $this->actingAs($this->member)
            ->getJson('/api/admin/posts/pending');
        $response->assertStatus(403);

        // Act & Assert - Approve
        $response = $this->actingAs($this->member)
            ->postJson("/api/admin/posts/{$post->id}/approve");
        $response->assertStatus(403);

        // Act & Assert - Reject
        $response = $this->actingAs($this->member)
            ->postJson("/api/admin/posts/{$post->id}/reject", [
                'reason' => 'Valid rejection reason here',
            ]);
        $response->assertStatus(403);
    }

    public function test_moderator_can_access_approval_endpoints(): void
    {
        // Arrange
        $post1 = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        $post2 = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        // Act & Assert - List pending
        $response = $this->actingAs($this->moderator)
            ->getJson('/api/admin/posts/pending');
        $response->assertStatus(200);

        // Act & Assert - Approve
        $response = $this->actingAs($this->moderator)
            ->postJson("/api/admin/posts/{$post1->id}/approve");
        $response->assertStatus(200);

        // Act & Assert - Reject
        $response = $this->actingAs($this->moderator)
            ->postJson("/api/admin/posts/{$post2->id}/reject", [
                'reason' => 'Reason for rejection by moderator',
            ]);
        $response->assertStatus(200);
    }

    public function test_admin_can_list_rejected_posts(): void
    {
        // Arrange
        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::REJECTED->value,
            'reject_reason' => 'Spam content',
            'title' => 'Rejected Post',
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/posts/rejected');

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.data.0.title', 'Rejected Post')
            ->assertJsonPath('data.data.0.status', PostStatus::REJECTED->value)
            ->assertJsonPath('data.data.0.reject_reason', 'Spam content');
    }

    public function test_rejected_posts_list_can_filter_by_date_range(): void
    {
        // Arrange
        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::REJECTED->value,
            'created_at' => now()->subDays(1),
            'title' => 'Recent Rejected',
        ]);

        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::REJECTED->value,
            'created_at' => now()->subDays(10),
            'title' => 'Old Rejected',
        ]);

        // Act
        $fromDate = now()->subDays(5)->format('Y-m-d');
        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/posts/rejected?from_date={$fromDate}");

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Recent Rejected', $data[0]['title']);
    }

    public function test_pending_posts_paginated_with_20_per_page_by_default(): void
    {
        // Arrange
        Post::factory()->count(25)->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/posts/pending');

        // Assert
        $response->assertStatus(200);
        $this->assertCount(20, $response->json('data.data'));
    }

    public function test_guest_cannot_access_approval_endpoints(): void
    {
        // Act & Assert
        $response = $this->getJson('/api/admin/posts/pending');
        $response->assertStatus(403);
    }
}
