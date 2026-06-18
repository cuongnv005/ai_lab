<?php

namespace App\Http\Controllers\Api\Admin;

use App\Factories\ApiFactory;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Api\Admin\Post\AdminCreatePostRequest;
use App\Http\Requests\Api\Admin\Post\AdminUpdatePostRequest;
use App\Http\Requests\Api\Admin\Post\AdminDeletePostRequest;
use App\DTOs\Api\Admin\Post\AdminCreatePostData;
use App\DTOs\Api\Admin\Post\AdminUpdatePostData;
use App\Http\Resources\Post\PostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends BaseController
{
    /**
     * List all posts with filtering, searching, sorting and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->input('search');
        $orders = $this->parseOrders($request->input('orders'));
        $filters = $this->parseFilters($request->input('filters'));
        $perPage = $request->input('per_page', 20);

        $tableService = ApiFactory::getAdminPostTableService();
        $paginator = $tableService->data($search, $orders, $filters, $perPage);

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => '',
            'errors' => null,
            'data' => [
                'data' => PostResource::collection($paginator->items()),
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
     * Create a new post directly (auto PUBLISHED).
     */
    public function store(AdminCreatePostRequest $request): JsonResponse
    {
        $data = AdminCreatePostData::from($request->validated());
        $post = ApiFactory::getPostService()
            ->withUser($request->user())
            ->adminCreatePost($data, $request->user());

        return $this->sendSuccessResponse(
            new PostResource($post),
            trans('response.created', ['object' => trans('response.label.post')]),
            201,
        );
    }

    /**
     * Update any post.
     */
    public function update(AdminUpdatePostRequest $request, int $id): JsonResponse
    {
        $data = AdminUpdatePostData::from($request->validated());
        $post = ApiFactory::getPostService()
            ->withUser($request->user())
            ->adminUpdatePost($id, $data, $request->user());

        return $this->sendSuccessResponse(
            new PostResource($post),
            trans('response.updated', ['object' => trans('response.label.post')]),
        );
    }

    /**
     * Soft delete a post.
     */
    public function destroy(AdminDeletePostRequest $request, int $id): JsonResponse
    {
        $confirm = $request->boolean('confirm');
        ApiFactory::getPostService()
            ->withUser($request->user())
            ->adminDeletePost($id, $confirm, $request->user());

        return $this->sendSuccessResponse(
            null,
            trans('response.hidden', ['object' => trans('response.label.post')]),
        );
    }

    /**
     * Force delete (permanently delete) a soft-deleted post.
     */
    public function forceDelete(Request $request, int $id): JsonResponse
    {
        ApiFactory::getPostService()
            ->withUser($request->user())
            ->adminForceDeletePost($id, $request->user());

        return $this->sendSuccessResponse(
            null,
            trans('response.post_force_deleted'),
        );
    }

    /**
     * Restore a soft-deleted post.
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        $post = ApiFactory::getPostService()
            ->withUser($request->user())
            ->adminRestorePost($id, $request->user());

        return $this->sendSuccessResponse(
            new PostResource($post),
            trans('response.restored', ['object' => trans('response.label.post')]),
        );
    }

    /**
     * List all soft-deleted posts.
     */
    public function trashed(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $paginator = ApiFactory::getPostService()->listTrashedPosts($perPage);

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => '',
            'errors' => null,
            'data' => [
                'data' => PostResource::collection($paginator->items()),
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
