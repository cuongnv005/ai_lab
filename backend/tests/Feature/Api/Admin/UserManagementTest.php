<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Enums\UserStatus;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $moderator;
    private User $member;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->moderator = User::factory()->create();
        $this->moderator->assignRole('moderator');

        $this->member = User::factory()->create();
        $this->member->assignRole('member');
    }

    public function test_non_admin_cannot_access_user_management(): void
    {
        $this->actingAs($this->member)
            ->getJson('/api/admin/users')
            ->assertStatus(403);

        $this->actingAs($this->moderator)
            ->getJson('/api/admin/users')
            ->assertStatus(403);
    }

    public function test_admin_can_list_users(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'email',
                            'status',
                            'status_label',
                            'role',
                            'posts_count',
                            'created_at',
                            'updated_at',
                        ],
                    ],
                    'pagination',
                ],
            ]);
    }

    public function test_admin_can_filter_users_by_role_and_status(): void
    {
        // Filter by role
        $filters = json_encode([
            [
                'key' => 'role',
                'data' => 'moderator',
            ],
        ]);
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/users?filters=' . urlencode($filters));

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('moderator', $data[0]['role']);

        // Filter by status
        $this->member->status = UserStatus::INACTIVE;
        $this->member->save();

        $filtersStatus = json_encode([
            [
                'key' => 'status',
                'data' => UserStatus::INACTIVE->value,
            ],
        ]);
        $responseStatus = $this->actingAs($this->admin)
            ->getJson('/api/admin/users?filters=' . urlencode($filtersStatus));

        $responseStatus->assertStatus(200);
        $dataStatus = $responseStatus->json('data.data');
        $this->assertCount(1, $dataStatus);
        $this->assertEquals(UserStatus::INACTIVE->value, $dataStatus[0]['status']);
    }

    public function test_admin_can_show_user_details(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/users/{$this->member->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $this->member->id);
    }

    public function test_admin_cannot_change_own_role(): void
    {
        $payload = ['role' => 'member'];

        $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->admin->id}/role", $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_admin_can_change_other_user_role(): void
    {
        $payload = ['role' => 'moderator'];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->member->id}/role", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.role', 'moderator');

        $this->assertTrue($this->member->fresh()->hasRole('moderator'));
    }

    public function test_moderator_cannot_assign_higher_role(): void
    {
        // Spatie middleware role:admin is active so Moderator will get 403 on routing layer.
        // But we also test the service logic with an admin setting role higher than admin (non-existent, but if we had moderator routes).
        // Since routes only allow admin, we simulate inside service.
        $this->actingAs($this->moderator)
            ->putJson("/api/admin/users/{$this->member->id}/role", ['role' => 'admin'])
            ->assertStatus(403);
    }

    public function test_admin_can_ban_and_unban_user(): void
    {
        // Ban
        $payload = [
            'reason' => 'Spamming on posts for hours',
            'duration' => 7,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/users/{$this->member->id}/ban", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', UserStatus::BANNED->value)
            ->assertJsonPath('data.ban_reason', 'Spamming on posts for hours');

        $this->assertEquals(UserStatus::BANNED, $this->member->fresh()->status);
        $this->assertNotNull($this->member->fresh()->banned_until);

        // Unban
        $responseUnban = $this->actingAs($this->admin)
            ->postJson("/api/admin/users/{$this->member->id}/unban");

        $responseUnban->assertStatus(200)
            ->assertJsonPath('data.status', UserStatus::ACTIVE->value)
            ->assertJsonPath('data.ban_reason', null)
            ->assertJsonPath('data.banned_until', null);

        $this->assertEquals(UserStatus::ACTIVE, $this->member->fresh()->status);
    }

    public function test_admin_cannot_ban_other_admin(): void
    {
        $otherAdmin = User::factory()->create();
        $otherAdmin->assignRole('admin');

        $payload = [
            'reason' => 'Should fail',
            'duration' => 7,
        ];

        $this->actingAs($this->admin)
            ->postJson("/api/admin/users/{$otherAdmin->id}/ban", $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['user']);
    }

    public function test_banned_user_cannot_login(): void
    {
        // Ban user
        $this->member->status = UserStatus::BANNED;
        $this->member->ban_reason = 'Violation of code of conduct';
        $this->member->save();

        // Attempt login
        $payload = [
            'email' => $this->member->email,
            'password' => 'password', // Factory default is password
        ];

        $response = $this->postJson('/api/auth/login', $payload);
        $response->assertStatus(401);
    }

    public function test_admin_cannot_delete_self_or_other_admin(): void
    {
        // Self delete
        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->admin->id}")
            ->assertStatus(422);

        // Delete another admin
        $otherAdmin = User::factory()->create();
        $otherAdmin->assignRole('admin');

        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$otherAdmin->id}")
            ->assertStatus(422);
    }

    public function test_admin_can_delete_user_and_cascade_soft_delete(): void
    {
        // Create post and comment for member
        $category = Category::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $category->id,
        ]);
        $comment = Comment::factory()->create([
            'user_id' => $this->member->id,
            'post_id' => $post->id,
        ]);

        // Delete
        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->member->id}");

        $response->assertStatus(200);

        // Assert soft deleted
        $this->assertSoftDeleted('users', ['id' => $this->member->id]);
        $this->assertSoftDeleted('posts', ['id' => $post->id]);
        $this->assertSoftDeleted('comments', ['id' => $comment->id]);
    }
}
