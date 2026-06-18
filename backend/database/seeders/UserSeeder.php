<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    use WithoutModelEvents;

    public const DEFAULT_PASSWORD = '123456xX@';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => self::DEFAULT_PASSWORD,
        ]);
        $adminUser->assignRole(UserRole::ADMIN->value);

        $moderatorUser = User::factory()->create([
            'name' => 'Moderator User',
            'email' => 'moderator@example.com',
            'password' => self::DEFAULT_PASSWORD,
        ]);
        $moderatorUser->assignRole(UserRole::MODERATOR->value);

        $memberUser1 = User::factory()->create([
            'name' => 'Member One',
            'email' => 'member1@example.com',
            'password' => self::DEFAULT_PASSWORD,
        ]);
        $memberUser1->assignRole(UserRole::MEMBER->value);

        $memberUser2 = User::factory()->create([
            'name' => 'Member Two',
            'email' => 'member2@example.com',
            'password' => self::DEFAULT_PASSWORD,
        ]);
        $memberUser2->assignRole(UserRole::MEMBER->value);
    }
}
