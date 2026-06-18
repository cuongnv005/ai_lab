<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use App\Enums\PostStatus;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $member;
    private Post $post;
    private Comment $comment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->member = User::factory()->create();
        $this->member->assignRole('member');

        $category = Category::factory()->create();
        $this->post = Post::factory()->create([
            'user_id' => $this->member->id,
            'category_id' => $category->id,
            'views_count' => 150,
            'status' => PostStatus::PENDING->value,
        ]);

        $this->comment = Comment::factory()->create([
            'user_id' => $this->member->id,
            'post_id' => $this->post->id,
        ]);
    }

    public function test_non_admin_cannot_access_analytics(): void
    {
        $this->actingAs($this->member)
            ->getJson('/api/admin/dashboard/stats')
            ->assertStatus(403);
    }

    public function test_admin_can_get_dashboard_stats(): void
    {
        Cache::flush();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard/stats?period=30days');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJson([
                'data' => [
                    'total_views' => 150,
                    'new_posts' => 1,
                    'new_users' => 2, // admin and member
                    'new_comments' => 1,
                    'pending_posts' => 1,
                    'total_users' => 2,
                    'total_posts' => 1,
                    'total_comments' => 1,
                ],
            ]);

        $this->assertTrue(Cache::has('admin_dashboard_stats_30days'));
    }

    public function test_admin_can_get_chart_data(): void
    {
        Cache::flush();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard/chart?period=7days&type=posts');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertCount(7, $data);
        $this->assertEquals(now()->toDateString(), $data[6]['date']);
        $this->assertEquals(1, $data[6]['value']); // 1 post created today
    }

    public function test_admin_can_get_top_posts(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard/top-posts?period=30days&limit=5');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'views_count',
                        'likes_count',
                        'comments_count',
                        'author' => [
                            'id',
                            'name',
                        ],
                    ],
                ],
            ]);
    }

    public function test_admin_can_get_top_users(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard/top-users?period=30days&limit=5');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        // Member should be at the top because of 1 post + 1 comment
        $this->assertEquals($this->member->id, $data[0]['id']);
        $this->assertEquals(2, $data[0]['activity_count']);
    }

    public function test_admin_can_get_recent_activities(): void
    {
        // Add a report
        Report::factory()->create([
            'user_id' => $this->member->id,
            'reportable_type' => Post::class,
            'reportable_id' => $this->post->id,
            'reason' => 'Inappropriate content',
            'created_at' => now()->addMinute(),
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/dashboard/recent-activity?limit=10');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertEquals('report_submitted', $data[0]['type']); // The latest activity
    }
}
