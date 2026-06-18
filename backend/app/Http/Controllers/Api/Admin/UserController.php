<?php

namespace App\Http\Controllers\Api\Admin;

use App\Factories\ApiFactory;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Api\Admin\User\ChangeRoleRequest;
use App\Http\Requests\Api\Admin\User\BanUserRequest;
use App\DTOs\Api\Admin\User\ChangeRoleData;
use App\DTOs\Api\Admin\User\BanUserData;
use App\Http\Resources\User\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends BaseController
{
    /**
     * List all users with filtering and pagination.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->input('search');
        $orders = $this->parseOrders($request->input('orders'));
        $filters = $this->parseFilters($request->input('filters'));
        $perPage = $request->input('per_page', 20);

        $tableService = ApiFactory::getUserTableService();
        $paginator = $tableService->data($search, $orders, $filters, $perPage);

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => '',
            'errors' => null,
            'data' => [
                'data' => UserResource::collection($paginator->items()),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ],
        ]);
    }

    /**
     * Show a single user details.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $user = User::withCount('posts')
            ->findOrFail($id);

        return $this->sendSuccessResponse(
            new UserResource($user),
        );
    }

    /**
     * Change user role.
     *
     * @param ChangeRoleRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function changeRole(ChangeRoleRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $data = ChangeRoleData::from($request->validated());

        $updatedUser = ApiFactory::getUserService()->changeRole($user, $data, $request->user());

        return $this->sendSuccessResponse(
            new UserResource($updatedUser),
            trans('response.updated', ['object' => trans('response.label.role')]),
        );
    }

    /**
     * Ban a user.
     *
     * @param BanUserRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function ban(BanUserRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $data = BanUserData::from($request->validated());

        $updatedUser = ApiFactory::getUserService()->banUser($user, $data, $request->user());

        return $this->sendSuccessResponse(
            new UserResource($updatedUser),
            trans('response.user_banned'),
        );
    }

    /**
     * Unban a user.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function unban(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $updatedUser = ApiFactory::getUserService()->unbanUser($user, $request->user());

        return $this->sendSuccessResponse(
            new UserResource($updatedUser),
            trans('response.user_unbanned'),
        );
    }

    /**
     * Delete a user (soft delete).
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        ApiFactory::getUserService()->deleteUser($user, $request->user());

        return $this->sendSuccessResponse(
            null,
            trans('response.deleted', ['object' => trans('response.label.user_account')]),
        );
    }

    /**
     * Parse orders.
     */
    private function parseOrders(mixed $orders): array
    {
        if (is_string($orders)) {
            return json_decode($orders, true) ?? [];
        }
        return is_array($orders) ? $orders : [];
    }

    /**
     * Parse filters.
     */
    private function parseFilters(mixed $filters): array
    {
        if (is_string($filters)) {
            return json_decode($filters, true) ?? [];
        }
        return is_array($filters) ? $filters : [];
    }
}
