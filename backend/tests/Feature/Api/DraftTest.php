<?php

namespace Tests\Feature\Api;

use App\Enums\PostStatus;
use App\Models\Category;
use App\Models\Draft;
use App\Models\Post;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DraftTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Category $categoryA;
    private Category $categoryB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->user = User::factory()->create();
        $this->categoryA = Category::factory()->create(['name' => 'AI News', 'slug' => 'ai-news']);
        $this->categoryB = Category::factory()->create(['name' => 'Tech Talks', 'slug' => 'tech-talks']);
    }

    public function test_user_can_autosave_draft_successfully(): void
    {
        // Arrange
        $payload = [
            'category_id' => $this->categoryA->id,
            'title' => 'Draft Title',
            'content' => 'Draft Content',
            'tags' => ['tag1', 'tag2'],
        ];

        // Act
        $response = $this->actingAs($this->user)
            ->postJson('/api/drafts/autosave', $payload);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Draft Title')
            ->assertJsonPath('data.tags', ['tag1', 'tag2']);

        $this->assertDatabaseHas('drafts', [
            'user_id' => $this->user->id,
            'category_id' => $this->categoryA->id,
            'title' => 'Draft Title',
        ]);
    }

    public function test_draft_autosave_isolates_by_category(): void
    {
        // Arrange
        $payloadA = [
            'category_id' => $this->categoryA->id,
            'title' => 'Draft A Title',
            'content' => 'Draft A Content',
        ];

        $payloadB = [
            'category_id' => $this->categoryB->id,
            'title' => 'Draft B Title',
            'content' => 'Draft B Content',
        ];

        // Act
        $responseA = $this->actingAs($this->user)->postJson('/api/drafts/autosave', $payloadA);
        $responseB = $this->actingAs($this->user)->postJson('/api/drafts/autosave', $payloadB);

        // Assert
        $responseA->assertStatus(200);
        $responseB->assertStatus(200);

        $this->assertDatabaseHas('drafts', [
            'user_id' => $this->user->id,
            'category_id' => $this->categoryA->id,
            'title' => 'Draft A Title',
        ]);

        $this->assertDatabaseHas('drafts', [
            'user_id' => $this->user->id,
            'category_id' => $this->categoryB->id,
            'title' => 'Draft B Title',
        ]);
    }

    public function test_user_can_load_draft_successfully(): void
    {
        // Arrange
        Draft::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->categoryA->id,
            'title' => 'Saved Draft Title',
            'content' => 'Saved Draft Content',
            'tags' => ['one', 'two'],
        ]);

        // Act
        $response = $this->actingAs($this->user)
            ->getJson("/api/drafts?category_id={$this->categoryA->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Saved Draft Title')
            ->assertJsonPath('data.tags', ['one', 'two']);
    }

    public function test_autosave_fails_when_category_id_is_missing(): void
    {
        // Arrange
        $payload = [
            'title' => 'Draft Title',
        ];

        // Act
        $response = $this->actingAs($this->user)
            ->postJson('/api/drafts/autosave', $payload);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category_id']);
    }

    public function test_autosave_fails_when_unauthenticated(): void
    {
        // Arrange
        $payload = [
            'category_id' => $this->categoryA->id,
            'title' => 'Draft Title',
        ];

        // Act
        $response = $this->postJson('/api/drafts/autosave', $payload);

        // Assert
        $response->assertStatus(401);
    }

    public function test_post_creation_cleans_up_matching_draft(): void
    {
        // Arrange
        Draft::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->categoryA->id,
            'post_id' => null,
            'title' => 'Draft Title',
        ]);

        // Act - Submit post (should trigger deleteDraft(category_id, null))
        $response = $this->actingAs($this->user)
            ->postJson('/api/posts', [
                'title' => 'New Post Title',
                'content' => 'This is a valid long description content for post.',
                'category_id' => $this->categoryA->id,
                'tags' => [],
            ]);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseMissing('drafts', [
            'user_id' => $this->user->id,
            'category_id' => $this->categoryA->id,
            'post_id' => null,
        ]);
    }

    public function test_post_update_cleans_up_matching_draft(): void
    {
        // Arrange
        $post = Post::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->categoryA->id,
            'title' => 'Old Post Title',
            'status' => PostStatus::PUBLISHED->value,
        ]);

        Draft::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->categoryA->id,
            'post_id' => $post->id,
            'title' => 'Draft Update Title',
        ]);

        // Act - Update post (should trigger deleteDraft(category_id, post_id))
        $response = $this->actingAs($this->user)
            ->putJson("/api/posts/{$post->id}", [
                'title' => 'Updated Post Title',
            ]);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseMissing('drafts', [
            'user_id' => $this->user->id,
            'category_id' => $this->categoryA->id,
            'post_id' => $post->id,
        ]);
    }

    public function test_user_can_delete_draft_successfully(): void
    {
        // Arrange
        Draft::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->categoryA->id,
            'title' => 'Draft to Delete',
        ]);

        // Act
        $response = $this->actingAs($this->user)
            ->deleteJson("/api/drafts?category_id={$this->categoryA->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('drafts', [
            'user_id' => $this->user->id,
            'category_id' => $this->categoryA->id,
        ]);
    }
}
