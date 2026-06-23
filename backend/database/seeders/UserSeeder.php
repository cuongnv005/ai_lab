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
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => self::DEFAULT_PASSWORD,
            'remember_token' => \Illuminate\Support\Str::random(10),
        ]);
        $adminUser->assignRole(UserRole::ADMIN->value);

        $moderatorUser = User::create([
            'name' => 'Moderator User',
            'email' => 'moderator@example.com',
            'email_verified_at' => now(),
            'password' => self::DEFAULT_PASSWORD,
            'remember_token' => \Illuminate\Support\Str::random(10),
        ]);
        $moderatorUser->assignRole(UserRole::MODERATOR->value);

        $memberUser1 = User::create([
            'name' => 'Member One',
            'email' => 'member1@example.com',
            'email_verified_at' => now(),
            'password' => self::DEFAULT_PASSWORD,
            'remember_token' => \Illuminate\Support\Str::random(10),
        ]);
        $memberUser1->assignRole(UserRole::MEMBER->value);

        $memberUser2 = User::create([
            'name' => 'Member Two',
            'email' => 'member2@example.com',
            'email_verified_at' => now(),
            'password' => self::DEFAULT_PASSWORD,
            'remember_token' => \Illuminate\Support\Str::random(10),
        ]);
        $memberUser2->assignRole(UserRole::MEMBER->value);
    }
}
