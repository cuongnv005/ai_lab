<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EngagementTest extends TestCase
{
    use RefreshDatabase;

    private User $member;
    private User $moderator;
    private User $admin;
    private Post $post;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->member = User::factory()->create();
        $this->member->assignRole('member');

        $this->moderator = User::factory()->create();
        $this->moderator->assignRole('moderator');

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $category = Category::factory()->create(['name' => 'AI News', 'slug' => 'ai-news']);
        $this->post = Post::factory()->create([
            'user_id' => $this->admin->id,
            'category_id' => $category->id,
        ]);
    }

    public function test_guest_can_view_post_comments_paginated_in_tree(): void
    {
        // Arrange
        $parentComments = Comment::factory()->count(12)->create([
            'post_id' => $this->post->id,
            'parent_id' => null,
        ]);

        // Create a reply for the first comment
        $reply = Comment::factory()->create([
            'post_id' => $this->post->id,
            'parent_id' => $parentComments[0]->id,
        ]);

        // Act
        $response = $this->getJson("/api/posts/{$this->post->id}/comments?page=1");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'post_id',
                        'user_id',
                        'parent_id',
                        'content',
                        'likes_count',
                        'is_liked',
                        'created_at',
                        'updated_at',
                        'user' => ['id', 'name', 'email', 'roles'],
                        'replies' => [
                            '*' => [
                                'id',
                                'parent_id',
                                'content',
                            ],
                        ],
                    ],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        // Verify pagination (10 per page)
        $this->assertCount(10, $response->json('data'));

        // Verify that the reply is nested within its parent comment
        $data = $response->json('data');
        $parentIndex = collect($data)->search(fn ($c) => $c['id'] === $parentComments[0]->id);

        $this->assertNotFalse($parentIndex);
        $this->assertCount(1, $data[$parentIndex]['replies']);
        $this->assertEquals($reply->id, $data[$parentIndex]['replies'][0]['id']);
    }

    public function test_authenticated_user_can_add_comment(): void
    {
        // Arrange
        $payload = [
            'content' => 'This is a test comment content.',
            'parent_id' => null,
        ];

        // Act
        $response = $this->actingAs($this->member)
            ->postJson("/api/posts/{$this->post->id}/comments", $payload);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.content', 'This is a test comment content.')
            ->assertJsonPath('data.user_id', $this->member->id);

        $this->assertDatabaseHas('comments', [
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
            'content' => 'This is a test comment content.',
            'parent_id' => null,
        ]);
    }

    public function test_authenticated_user_can_reply_to_comment(): void
    {
        // Arrange
        $parent = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->admin->id,
        ]);

        $payload = [
            'content' => 'Replying to parent comment.',
            'parent_id' => $parent->id,
        ];

        // Act
        $response = $this->actingAs($this->member)
            ->postJson("/api/posts/{$this->post->id}/comments", $payload);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.parent_id', $parent->id);

        $this->assertDatabaseHas('comments', [
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
            'parent_id' => $parent->id,
            'content' => 'Replying to parent comment.',
        ]);
    }

    public function test_comment_fails_validation_when_fields_are_missing(): void
    {
        // Arrange
        $payload = [
            'content' => '',
        ];

        // Act
        $response = $this->actingAs($this->member)
            ->postJson("/api/posts/{$this->post->id}/comments", $payload);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_guest_cannot_comment(): void
    {
        // Arrange
        $payload = [
            'content' => 'Guest comment.',
        ];

        // Act
        $response = $this->postJson("/api/posts/{$this->post->id}/comments", $payload);

        // Assert
        $response->assertStatus(401);
    }

    public function test_owner_can_delete_own_comment(): void
    {
        // Arrange
        $comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
        ]);

        // Act
        $response = $this->actingAs($this->member)
            ->deleteJson("/api/comments/{$comment->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('comments', ['id' => $comment->id]);
    }

    public function test_moderator_or_admin_can_delete_others_comment(): void
    {
        // Arrange
        $comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
        ]);

        // Act 1 - Delete as Moderator
        $responseMod = $this->actingAs($this->moderator)
            ->deleteJson("/api/comments/{$comment->id}");

        // Assert
        $responseMod->assertStatus(200);
        $this->assertSoftDeleted('comments', ['id' => $comment->id]);

        // Arrange 2
        $comment2 = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
        ]);

        // Act 2 - Delete as Admin
        $responseAdmin = $this->actingAs($this->admin)
            ->deleteJson("/api/comments/{$comment2->id}");

        // Assert
        $responseAdmin->assertStatus(200);
        $this->assertSoftDeleted('comments', ['id' => $comment2->id]);
    }

    public function test_member_cannot_delete_others_comment(): void
    {
        // Arrange
        $otherMember = User::factory()->create();
        $otherMember->assignRole('member');

        $comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $otherMember->id,
        ]);

        // Act
        $response = $this->actingAs($this->member)
            ->deleteJson("/api/comments/{$comment->id}");

        // Assert
        $response->assertStatus(403);
        $this->assertDatabaseHas('comments', ['id' => $comment->id]);
    }

    public function test_guest_cannot_delete_comment(): void
    {
        // Arrange
        $comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
        ]);

        // Act
        $response = $this->deleteJson("/api/comments/{$comment->id}");

        // Assert
        $response->assertStatus(401);
        $this->assertDatabaseHas('comments', ['id' => $comment->id]);
    }

    public function test_user_can_toggle_post_like(): void
    {
        // Arrange
        $this->assertDatabaseMissing('post_likes', [
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
        ]);

        // Act 1 - Like the post
        $responseLike = $this->actingAs($this->member)
            ->postJson("/api/posts/{$this->post->id}/like");

        // Assert 1
        $responseLike->assertStatus(200)
            ->assertJsonPath('data.liked', true);

        $this->assertDatabaseHas('post_likes', [
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
        ]);

        // Act 2 - Unlike the post (send request again)
        $responseUnlike = $this->actingAs($this->member)
            ->postJson("/api/posts/{$this->post->id}/like");

        // Assert 2
        $responseUnlike->assertStatus(200)
            ->assertJsonPath('data.liked', false);

        $this->assertDatabaseMissing('post_likes', [
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
        ]);
    }

    public function test_user_can_toggle_comment_like(): void
    {
        // Arrange
        $comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
        ]);

        $this->assertDatabaseMissing('comment_likes', [
            'comment_id' => $comment->id,
            'user_id' => $this->member->id,
        ]);

        // Act 1 - Like comment
        $responseLike = $this->actingAs($this->member)
            ->postJson("/api/comments/{$comment->id}/like");

        // Assert 1
        $responseLike->assertStatus(200)
            ->assertJsonPath('data.liked', true);

        $this->assertDatabaseHas('comment_likes', [
            'comment_id' => $comment->id,
            'user_id' => $this->member->id,
        ]);

        // Act 2 - Unlike comment
        $responseUnlike = $this->actingAs($this->member)
            ->postJson("/api/comments/{$comment->id}/like");

        // Assert 2
        $responseUnlike->assertStatus(200)
            ->assertJsonPath('data.liked', false);

        $this->assertDatabaseMissing('comment_likes', [
            'comment_id' => $comment->id,
            'user_id' => $this->member->id,
        ]);
    }

    public function test_guest_cannot_toggle_like(): void
    {
        // Act
        $response = $this->postJson("/api/posts/{$this->post->id}/like");

        // Assert
        $response->assertStatus(401);
    }
}
