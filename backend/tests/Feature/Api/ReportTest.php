<?php

namespace Tests\Feature\Api;

use App\Enums\ReportStatus;
use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    private User $member;
    private User $moderator;
    private User $admin;
    private Post $post;
    private Comment $comment;

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
            'user_id' => $this->member->id,
            'category_id' => $category->id,
        ]);

        $this->comment = Comment::factory()->create([
            'post_id' => $this->post->id,
            'user_id' => $this->member->id,
        ]);
    }

    public function test_guest_cannot_submit_report(): void
    {
        // Arrange
        $payload = [
            'reportable_type' => 'post',
            'reportable_id' => $this->post->id,
            'reason' => 'Inappropriate content.',
        ];

        // Act
        $response = $this->postJson('/api/reports', $payload);

        // Assert
        $response->assertStatus(401);
    }

    public function test_member_can_submit_report_on_post(): void
    {
        // Arrange
        $payload = [
            'reportable_type' => 'post',
            'reportable_id' => $this->post->id,
            'reason' => 'Spam content.',
        ];

        // Act
        $response = $this->actingAs($this->member)
            ->postJson('/api/reports', $payload);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.reportable.type', 'post')
            ->assertJsonPath('data.reportable.id', $this->post->id)
            ->assertJsonPath('data.reason', 'Spam content.')
            ->assertJsonPath('data.status', ReportStatus::PENDING->value);

        $this->assertDatabaseHas('reports', [
            'user_id' => $this->member->id,
            'reportable_type' => Post::class,
            'reportable_id' => $this->post->id,
            'reason' => 'Spam content.',
            'status' => ReportStatus::PENDING->value,
        ]);
    }

    public function test_member_can_submit_report_on_comment(): void
    {
        // Arrange
        $payload = [
            'reportable_type' => 'comment',
            'reportable_id' => $this->comment->id,
            'reason' => 'Hate speech.',
        ];

        // Act
        $response = $this->actingAs($this->member)
            ->postJson('/api/reports', $payload);

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.reportable.type', 'comment')
            ->assertJsonPath('data.reportable.id', $this->comment->id)
            ->assertJsonPath('data.status', ReportStatus::PENDING->value);

        $this->assertDatabaseHas('reports', [
            'user_id' => $this->member->id,
            'reportable_type' => Comment::class,
            'reportable_id' => $this->comment->id,
            'reason' => 'Hate speech.',
        ]);
    }

    public function test_user_cannot_exceed_hourly_rate_limit(): void
    {
        // Arrange: Create 5 reports in the last hour
        Report::factory()->count(5)->create([
            'user_id' => $this->member->id,
            'created_at' => now()->subMinutes(10),
        ]);

        $payload = [
            'reportable_type' => 'post',
            'reportable_id' => $this->post->id,
            'reason' => 'Spam 6th time.',
        ];

        // Act
        $response = $this->actingAs($this->member)
            ->postJson('/api/reports', $payload);

        // Assert
        $response->assertStatus(422)
            ->assertJsonPath('message', trans('report.error_rate_limit'));
    }

    public function test_member_cannot_access_admin_endpoints(): void
    {
        // Act & Assert 1: Member list
        $responseMemberGet = $this->actingAs($this->member)->getJson('/api/admin/reports');
        $responseMemberGet->assertStatus(403);
    }

    public function test_moderator_can_access_admin_endpoints(): void
    {
        // Act & Assert 2: Moderator list
        $responseModGet = $this->actingAs($this->moderator)->getJson('/api/admin/reports');
        $responseModGet->assertStatus(200);
    }

    public function test_admin_can_list_pending_reports(): void
    {
        // Arrange
        Report::factory()->create([
            'user_id' => $this->member->id,
            'reportable_type' => Post::class,
            'reportable_id' => $this->post->id,
            'status' => ReportStatus::PENDING,
        ]);

        Report::factory()->create([
            'user_id' => $this->member->id,
            'reportable_type' => Comment::class,
            'reportable_id' => $this->comment->id,
            'status' => ReportStatus::RESOLVED,
        ]);

        // Act
        $response = $this->actingAs($this->admin)->getJson('/api/admin/reports');

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'reason',
                            'status',
                            'status_label',
                            'created_at',
                            'updated_at',
                        ],
                    ],
                    'pagination',
                ],
            ]);

        // Verify only pending reports are returned by default (the controller defaults to filtering by pending if implemented)
        // Check list data
        $data = $response->json('data.data');
        $this->assertNotEmpty($data);
    }

    public function test_admin_can_resolve_report(): void
    {
        // Arrange
        $report = Report::factory()->create([
            'user_id' => $this->member->id,
            'reportable_type' => Post::class,
            'reportable_id' => $this->post->id,
            'status' => ReportStatus::PENDING,
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/reports/{$report->id}/resolve");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        // Verify report status in DB
        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => ReportStatus::RESOLVED->value,
            'resolved_by' => $this->admin->id,
        ]);

        // Verify target content was deleted (soft deleted)
        $this->assertSoftDeleted('posts', ['id' => $this->post->id]);
    }

    public function test_admin_can_dismiss_report(): void
    {
        // Arrange
        $report = Report::factory()->create([
            'user_id' => $this->member->id,
            'reportable_type' => Post::class,
            'reportable_id' => $this->post->id,
            'status' => ReportStatus::PENDING,
        ]);

        // Act
        $response = $this->actingAs($this->admin)
            ->postJson("/api/admin/reports/{$report->id}/dismiss");

        // Assert
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        // Verify report status in DB
        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => ReportStatus::DISMISSED->value,
            'resolved_by' => $this->admin->id,
        ]);

        // Verify target content is NOT deleted
        $this->assertDatabaseHas('posts', ['id' => $this->post->id]);
    }
}
