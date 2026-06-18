<?php

namespace App\Http\Controllers\Api\Admin;

use App\DTOs\Api\Admin\RejectPostData;
use App\Factories\ApiFactory;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Api\Admin\RejectPostRequest;
use App\Http\Resources\Post\PostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostApprovalController extends BaseController
{
    /**
     * Get pending posts list.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function pending(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 20);
        $categoryId = $request->integer('category_id') ?: null;

        $posts = ApiFactory::getPostService()
            ->listPendingPosts($perPage, $categoryId);

        return response()->json([
            'status_code' => 200,
            'message' => '',
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
     * Approve a pending post.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function approve(int $id): JsonResponse
    {
        try {
            $post = ApiFactory::getPostService()->approvePost($id);

            return $this->sendSuccessResponse(
                new PostResource($post),
                __('messages.post.approved'),
            );
        } catch (\RuntimeException $e) {
            return $this->sendErrorResponse($e->getMessage(), null, null, 422);
        }
    }

    /**
     * Reject a pending post.
     *
     * @param int $id
     * @param RejectPostRequest $request
     * @return JsonResponse
     */
    public function reject(int $id, RejectPostRequest $request): JsonResponse
    {
        $data = RejectPostData::from($request->validated());

        $post = ApiFactory::getPostService()->rejectPost($id, $data->reason);

        return $this->sendSuccessResponse(
            new PostResource($post),
            __('messages.post.rejected'),
        );
    }

    /**
     * Get rejected posts list.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function rejected(Request $request): JsonResponse
    {
        $perPage = $request->integer('per_page', 20);
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        $posts = ApiFactory::getPostService()
            ->listRejectedPosts($perPage, $fromDate, $toDate);

        return response()->json([
            'status_code' => 200,
            'message' => '',
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
}
