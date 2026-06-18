<?php

namespace App\Services\Api\User;

use App\DTOs\Api\User\UpdateUserProfileData;
use App\Models\User;
use App\Enums\UserStatus;
use App\Exceptions\InputException;
use App\Services\Base\Service;
use Illuminate\Support\Facades\DB;

class UserProfileService extends Service
{
    /**
     * Lấy thông tin profile của user bằng ID.
     *
     * @param int $id
     * @return User
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getProfile(int $id): User
    {
        return User::where('status', UserStatus::ACTIVE)
            ->with(['roles' => function ($query) {
                $query->select('id', 'name');
            }])
            ->findOrFail($id);
    }

    /**
     * Cập nhật thông tin profile của user hiện tại.
     *
     * @param UpdateUserProfileData $dto
     * @return User
     * @throws InputException
     * @throws \Throwable
     */
    public function updateProfile(UpdateUserProfileData $dto): User
    {
        $user = $this->user;
        if (!$user) {
            throw new InputException(trans('response.unauthenticated'), 401);
        }

        if ($user->status !== UserStatus::ACTIVE) {
            throw new InputException(trans('response.invalid'), 403);
        }

        DB::beginTransaction();
        try {
            $updateData = [
                'name' => $dto->name,
                'avatar_url' => $dto->avatar_url,
                'dob' => $dto->dob,
                'hometown' => $dto->hometown,
                'bio' => $dto->bio,
            ];

            if ($dto->gender !== null) {
                $updateData['gender'] = $dto->gender;
            } else {
                $updateData['gender'] = null; // Hoặc bỏ qua nếu ko muốn set null
            }

            $user->update($updateData);

            // Ghi log (theo Pattern B của bks-be-api-standard)
            activity()
                ->performedOn($user)
                ->causedBy($user)
                ->log('updated-profile');

            DB::commit();

            return $user->refresh();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
