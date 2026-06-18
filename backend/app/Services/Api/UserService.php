<?php

namespace App\Services\Api;

use App\Models\User;
use App\Enums\UserStatus;
use App\DTOs\Api\Admin\User\ChangeRoleData;
use App\DTOs\Api\Admin\User\BanUserData;
use App\Services\Base\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class UserService extends Service
{
    /**
     * Change user role.
     *
     * @param User $targetUser
     * @param ChangeRoleData $data
     * @param User $currentUser
     * @return User
     * @throws ValidationException
     */
    public function changeRole(User $targetUser, ChangeRoleData $data, User $currentUser): User
    {
        if ($targetUser->id === $currentUser->id) {
            throw ValidationException::withMessages([
                'role' => ['You cannot change your own role.'],
            ]);
        }

        $rolesWeight = [
            'admin' => 3,
            'moderator' => 2,
            'member' => 1,
        ];

        $currentRoleName = $currentUser->roles->first()?->name ?? 'member';
        $currentWeight = $rolesWeight[$currentRoleName] ?? 1;
        $targetWeight = $rolesWeight[$data->role] ?? 1;

        if ($targetWeight > $currentWeight) {
            throw ValidationException::withMessages([
                'role' => ['You cannot assign a role higher than your own.'],
            ]);
        }

        DB::transaction(function () use ($targetUser, $data) {
            $targetUser->syncRoles([$data->role]);
        });

        Log::info('User role updated successfully', [
            'target_user_id' => $targetUser->id,
            'new_role' => $data->role,
            'updated_by' => $currentUser->id,
        ]);

        return $targetUser->load('roles');
    }

    /**
     * Ban a user.
     *
     * @param User $targetUser
     * @param BanUserData $data
     * @param User $currentUser
     * @return User
     */
    public function banUser(User $targetUser, BanUserData $data, User $currentUser): User
    {
        if ($targetUser->hasRole(\App\Enums\UserRole::ADMIN->value)) {
            throw ValidationException::withMessages([
                'user' => ['Không thể ban quản trị viên.'],
            ]);
        }

        $targetUser->status = UserStatus::BANNED;
        $targetUser->ban_reason = $data->reason;
        $targetUser->banned_until = $data->duration ? now()->addDays($data->duration) : null;
        $targetUser->save();

        // Soft delete and update status of all posts of the banned user to DELETED (Hidden)
        DB::transaction(function () use ($targetUser) {
            $targetUser->posts()->each(function ($post) {
                $post->update([
                    'previous_status' => $post->status,
                    'status' => \App\Enums\PostStatus::DELETED,
                ]);
                $post->delete();
            });
        });

        \Illuminate\Support\Facades\Cache::forget('categories_list');

        Log::info('User banned successfully', [
            'target_user_id' => $targetUser->id,
            'reason' => $data->reason,
            'banned_until' => $targetUser->banned_until?->toDateTimeString(),
            'banned_by' => $currentUser->id,
        ]);

        return $targetUser;
    }

    /**
     * Unban a user.
     *
     * @param User $targetUser
     * @param User $currentUser
     * @return User
     */
    public function unbanUser(User $targetUser, User $currentUser): User
    {
        $targetUser->status = UserStatus::ACTIVE;
        $targetUser->ban_reason = null;
        $targetUser->banned_until = null;
        $targetUser->save();

        // Restore all posts of the unbanned user to their previous status
        DB::transaction(function () use ($targetUser) {
            $targetUser->posts()->onlyTrashed()->each(function ($post) {
                $post->restore();

                $targetStatus = $post->previous_status ? \App\Enums\PostStatus::from($post->previous_status) : \App\Enums\PostStatus::APPROVED;
                $post->update([
                    'status' => $targetStatus,
                    'previous_status' => null,
                ]);
            });
        });

        \Illuminate\Support\Facades\Cache::forget('categories_list');

        Log::info('User unbanned successfully', [
            'target_user_id' => $targetUser->id,
            'unbanned_by' => $currentUser->id,
        ]);

        return $targetUser;
    }

    /**
     * Delete a user (soft delete user, their posts, and comments).
     *
     * @param User $targetUser
     * @param User $currentUser
     * @return void
     * @throws ValidationException
     */
    public function deleteUser(User $targetUser, User $currentUser): void
    {
        if ($targetUser->id === $currentUser->id) {
            throw ValidationException::withMessages([
                'user' => ['You cannot delete your own account.'],
            ]);
        }

        if ($targetUser->hasRole('admin')) {
            throw ValidationException::withMessages([
                'user' => ['You cannot delete another administrator account.'],
            ]);
        }

        DB::transaction(function () use ($targetUser) {
            $targetUser->delete();
            $targetUser->posts()->delete();
            $targetUser->comments()->delete();
        });

        Log::info('User soft deleted successfully', [
            'target_user_id' => $targetUser->id,
            'deleted_by' => $currentUser->id,
        ]);
    }

    /**
     * Get top 5 authors based on cumulative likes (cached for 10 minutes).
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTopAuthors(): \Illuminate\Database\Eloquent\Collection
    {
        return \Illuminate\Support\Facades\Cache::remember('homepage_top_authors', 600, function () {
            return User::query()
                ->where('status', UserStatus::ACTIVE)
                ->select(['id', 'name', 'email', 'avatar_url', 'status', 'total_likes', 'posts_count', 'created_at', 'updated_at'])
                ->orderByDesc('total_likes')
                ->limit(5)
                ->get();
        });
    }
}
