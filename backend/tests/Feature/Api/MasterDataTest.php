<?php

namespace Tests\Feature\Api;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['status' => UserStatus::ACTIVE->value]);
    }

    public function test_can_get_user_statuses(): void
    {
        $response = $this->getJson('/api/master-data?resources[user_statuses]={}');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'user_statuses' => [
                        '*' => ['id', 'name'],
                    ],
                ],
            ]);
    }

    public function test_can_get_date_formats(): void
    {
        $response = $this->getJson('/api/master-data?resources[date_formats]={}');

        $response->assertStatus(200)
            ->assertJsonPath('data.date_formats.fe_date_format', 'Y-m-d');
    }

    public function test_can_get_genders(): void
    {
        $response = $this->getJson('/api/master-data?resources[genders]={}');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'genders' => [
                        '*' => ['id', 'name'],
                    ],
                ],
            ]);
    }

    public function test_authenticated_user_can_get_users(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/master-data?resources[users]={}');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'users' => [
                        '*' => ['id', 'name'],
                    ],
                ],
            ]);
    }

    public function test_authenticated_user_can_get_active_users(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/master-data?resources[active_users]={}');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'active_users' => [
                        '*' => ['id', 'name', 'email'],
                    ],
                ],
            ]);
    }

    public function test_guest_cannot_get_users(): void
    {
        $response = $this->getJson('/api/master-data?resources[users]={}');

        $response->assertStatus(200)
            ->assertJsonPath('data.users', null);
    }

    public function test_guest_cannot_get_active_users(): void
    {
        $response = $this->getJson('/api/master-data?resources[active_users]={}');

        $response->assertStatus(200)
            ->assertJsonPath('data.active_users', null);
    }

    public function test_can_get_countries(): void
    {
        $response = $this->getJson('/api/master-data?resources[countries]={}');

        $response->assertStatus(200)
            ->assertJsonPath('data.countries.vn', 'Vietnam');
    }

    public function test_returns_empty_for_unknown_resource(): void
    {
        $response = $this->getJson('/api/master-data?resources[unknown_resource]={}');

        $response->assertStatus(200)
            ->assertExactJson([
                'success' => true,
                'status_code' => 200,
                'message' => '',
                'errors' => null,
                'data' => [],
            ]);
    }

    public function test_returns_empty_when_no_resources_param(): void
    {
        $response = $this->getJson('/api/master-data');

        $response->assertStatus(200)
            ->assertExactJson([
                'success' => true,
                'status_code' => 200,
                'message' => '',
                'errors' => null,
                'data' => [],
            ]);
    }
}
