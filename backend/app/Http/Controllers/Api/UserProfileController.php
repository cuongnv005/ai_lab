<?php

namespace App\Http\Controllers\Api;

use App\DTOs\Api\User\UpdateUserProfileData;
use App\Factories\ApiFactory;
use App\Http\Requests\User\UpdateUserProfileRequest;
use App\Http\Resources\Post\PostResource;
use App\Http\Resources\UserProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserProfileController extends BaseController
{
    /**
     * UserProfileController constructor.
     */
    public function __construct()
    {
        $this->middleware($this->authMiddleware())->only(['update']);
    }

    /**
     * Get user profile by ID.
     * @unauthenticated
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $user = ApiFactory::getUserProfileService()->getProfile($id);

        return $this->sendSuccessResponse(
            new UserProfileResource($user),
            trans('response.get_success', ['object' => trans('response.label.user_profile')]),
        );
    }

    /**
     * Get recent posts of a user.
     * @unauthenticated
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function posts(int $id, Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $posts = ApiFactory::getPostService()
            ->withGuard($this->getGuard())
            ->getPostsByUserId($id, $perPage);

        return response()->json([
            'status_code' => 200,
            'message' => trans('response.get_success', ['object' => trans('response.label.post')]),
            'errors' => null,
            'data' => [
                'data' => PostResource::collection($posts),
                'per_page' => $posts->perPage(),
                'total_page' => $posts->lastPage(),
                'current_page' => $posts->currentPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Update current user's profile.
     *
     * @param UpdateUserProfileRequest $request
     * @return JsonResponse
     */
    public function update(UpdateUserProfileRequest $request): JsonResponse
    {
        $dto = UpdateUserProfileData::from($request->validated());

        $user = ApiFactory::getUserProfileService()
            ->withGuard($this->getGuard())
            ->withUser($this->guard()->user())
            ->updateProfile($dto);

        return $this->sendSuccessResponse(
            new UserProfileResource($user),
            trans('response.update_successfully'),
        );
    }
}
