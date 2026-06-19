<?php

namespace App\Services\Api;

use App\DTOs\Api\Auth\ChangePasswordData;
use App\DTOs\Api\Auth\LoginData;
use App\DTOs\Api\Auth\RegisterData;
use App\DTOs\Api\Auth\UpdateProfileData;
use App\Exceptions\InputException;
use App\Models\User;
use App\Enums\UserStatus;
use App\Enums\UserRole;
use App\Services\Base\Service;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService extends Service
{
    /**
     * Attempt a first-party SPA login against the session (web) guard.
     *
     * Returns the authenticated user on success, or null on bad credentials /
     * a deactivated account (both yield the same response, so disabled accounts
     * are not enumerable). The caller is responsible for regenerating the session.
     *
     * @param LoginData $dto
     * @return User|null
     */
    public function attemptLogin(LoginData $dto): ?User
    {
        $credentials = [
            'email' => Str::lower($dto->email),
            'password' => $dto->password,
        ];

        // Login always uses 'web' guard for session-based authentication
        if (! Auth::guard('web')->attempt($credentials)) {
            return null;
        }

        /** @var User $user */
        $user = Auth::guard('web')->user();

        if ($user->status === UserStatus::INACTIVE) {
            Auth::guard('web')->logout();

            throw new InputException(__('auth.deactivated'), 401);
        }

        if ($user->status === UserStatus::BANNED) {
            if ($user->banned_until && $user->banned_until->isPast()) {
                $user->status = UserStatus::ACTIVE;
                $user->ban_reason = null;
                $user->banned_until = null;
                $user->save();
            } else {
                Auth::guard('web')->logout();

                throw new InputException(__('auth.banned'), 401);
            }
        }

        return $user;
    }

    /**
     * Register
     *
     * @param RegisterData $dto
     * @return User
     * @throws InputException
     */
    public function register(RegisterData $dto): User
    {
        $newUser = User::query()->create([
            'name' => $dto->name,
            'email' => Str::lower($dto->email),
            'password' => Hash::make($dto->password),
            'status' => UserStatus::ACTIVE,
        ]);

        if (!$newUser) {
            throw new InputException(trans('auth.register_fail'));
        }

        $roleName = UserRole::MEMBER->value;
        $role = \Spatie\Permission\Models\Role::where('name', $roleName)->first();
        if ($role) {
            $newUser->assignRole($role);
        }

        return $newUser;
    }

    /**
     * Update profile
     *
     * @param UpdateProfileData $dto
     * @return int
     * @throws InputException
     */
    public function update(UpdateProfileData $dto): int
    {
        $user = $this->user;
        if (!$user) {
            throw new InputException(trans('response.not_found'));
        }

        if ($user->status == UserStatus::INACTIVE) {
            throw new InputException(trans('response.invalid'));
        }

        return User::query()
            ->where('id', '=', $user->id)
            ->update(['name' => $dto->name]);
    }

    /**
     * Change Password
     *
     * @param ChangePasswordData $dto
     * @return bool
     * @throws InputException
     */
    public function changePassword(ChangePasswordData $dto): bool
    {
        $user = $this->user;
        if (!$user) {
            throw new InputException(trans('response.not_found'));
        }

        if (!Hash::check($dto->currentPassword, $user->password)) {
            throw new InputException(trans('auth.password'));
        }

        $user->update([
            'password' => Hash::make($dto->password),
        ]);

        // Revoke every existing access token so any session opened with the old
        // password (including a stolen one) can no longer authenticate.
        $user->tokens()->delete();

        return true;
    }
}
