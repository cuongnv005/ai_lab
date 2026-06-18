<?php

namespace Tests\Feature\Api;

use App\Enums\PostStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostTest extends TestCase
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

    public function test_member_can_create_post_resulting_in_published_status(): void
    {
        // Arrange & Act
        $response = $this->actingAs($this->member)
            ->postJson('/api/posts', [
                'title' => 'Test Post Title',
                'content' => 'This is a test post content with long character requirements.',
                'category_id' => $this->category->id,
                'tags' => ['laravel', 'php'],
            ]);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.status', PostStatus::PUBLISHED->value)
            ->assertJsonPath('data.title', 'Test Post Title');

        $this->assertDatabaseHas('posts', [
            'title' => 'Test Post Title',
            'status' => PostStatus::PUBLISHED->value,
            'user_id' => $this->member->id,
        ]);
    }

    public function test_admin_can_create_post_resulting_in_approved_status(): void
    {
        // Arrange & Act
        $response = $this->actingAs($this->admin)
            ->postJson('/api/posts', [
                'title' => 'Admin Test Post',
                'content' => 'Content here works as expected.',
                'category_id' => $this->category->id,
                'tags' => ['news'],
            ]);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.status', PostStatus::APPROVED->value);

        $this->assertDatabaseHas('posts', [
            'title' => 'Admin Test Post',
            'status' => PostStatus::APPROVED->value,
        ]);
    }

    public function test_bbcode_preview_extraction(): void
    {
        // Arrange & Act
        $response = $this->actingAs($this->member)
            ->postJson('/api/posts', [
                'title' => 'Preview Post',
                'content' => 'This is a [preview]cool preview summary[/preview] body description.',
                'category_id' => $this->category->id,
                'tags' => [],
            ]);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.summary', 'cool preview summary')
            ->assertJsonPath('data.content', 'This is a cool preview summary body description.');

        $this->assertDatabaseHas('posts', [
            'title' => 'Preview Post',
            'summary' => 'cool preview summary',
            'content' => 'This is a cool preview summary body description.',
        ]);
    }

    public function test_homepage_shows_only_approved_posts(): void
    {
        // Arrange
        // 1 approved post
        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::APPROVED->value,
        ]);

        // 1 pending post
        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        // Act
        $response = $this->getJson('/api/posts');

        // Assert
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.data'));
    }

    public function test_category_list_shows_both_published_and_pending(): void
    {
        // Arrange
        // 1 published post
        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PUBLISHED->value,
        ]);

        // 1 pending post
        Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PENDING->value,
        ]);

        // Act
        $response = $this->getJson("/api/categories/{$this->category->slug}/posts");

        // Assert
        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data.data'));
    }

    public function test_post_details_increases_view_count(): void
    {
        // Arrange
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PUBLISHED->value,
            'views_count' => 5,
        ]);

        // Act
        $response = $this->getJson("/api/posts/{$post->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('data.views_count', 6);

        $this->assertEquals(6, $post->fresh()->views_count);
    }

    public function test_similar_posts_ordering(): void
    {
        // Arrange
        $mainPost = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PUBLISHED->value,
        ]);

        $tag1 = Tag::create(['name' => 'Laravel', 'slug' => 'laravel']);
        $tag2 = Tag::create(['name' => 'PHP', 'slug' => 'php']);
        $mainPost->tags()->sync([$tag1->id, $tag2->id]);

        // Post with 2 matching tags
        $postA = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PUBLISHED->value,
        ]);
        $postA->tags()->sync([$tag1->id, $tag2->id]);

        // Post with 1 matching tag
        $postB = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PUBLISHED->value,
        ]);
        $postB->tags()->sync([$tag1->id]);

        // Post with 0 matching tag but same category
        $postC = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'status' => PostStatus::PUBLISHED->value,
        ]);

        // Act
        $response = $this->getJson("/api/posts/{$mainPost->id}/similar");

        // Assert
        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertCount(3, $data);
        $this->assertEquals($postA->id, $data[0]['id']); // Most matching tags
        $this->assertEquals($postB->id, $data[1]['id']); // Second
        $this->assertEquals($postC->id, $data[2]['id']); // Third (fallback same category)
    }

    public function test_member_can_update_own_post(): void
    {
        // Arrange
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'title' => 'Original Title',
        ]);

        // Act
        $response = $this->actingAs($this->member)
            ->putJson("/api/posts/{$post->id}", [
                'title' => 'Updated Title',
            ]);

        // Assert
        $response->assertStatus(200);
        $this->assertEquals('Updated Title', $post->fresh()->title);
    }

    public function test_member_cannot_update_others_post(): void
    {
        // Arrange
        $otherMember = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $otherMember->id,
            'category_id' => $this->category->id,
            'title' => 'Original Title',
        ]);

        // Act
        $response = $this->actingAs($this->member)
            ->putJson("/api/posts/{$post->id}", [
                'title' => 'Hack Attempt',
            ]);

        // Assert
        $response->assertStatus(403);
    }

    public function test_moderator_can_update_others_post(): void
    {
        // Arrange
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $this->category->id,
            'title' => 'Original Title',
        ]);

        // Act
        $response = $this->actingAs($this->moderator)
            ->putJson("/api/posts/{$post->id}", [
                'title' => 'Mod Edit',
            ]);

        // Assert
        $response->assertStatus(200);
        $this->assertEquals('Mod Edit', $post->fresh()->title);
    }

    public function test_category_list_api(): void
    {
        // Act
        $response = $this->getJson('/api/categories');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'status_code',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'description',
                    ],
                ],
            ]);
    }
}
