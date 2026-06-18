<?php

namespace App\Http\Controllers\Api;

use App\DTOs\Api\Engagement\CreateCommentData;
use App\Factories\ApiFactory;
use App\Http\Requests\Comment\CreateCommentRequest;
use App\Http\Resources\Comment\CommentResource;
use Illuminate\Http\JsonResponse;

class EngagementController extends BaseController
{
    /**
     * EngagementController constructor.
     */
    public function __construct()
    {
        $this->middleware($this->authMiddleware())->except(['index']);
    }

    /**
     * Get paginated comments for a post.
     */
    public function index(int $postId): JsonResponse
    {
        $comments = ApiFactory::getEngagementService()->getPostComments($postId);

        return $this->sendSuccessResponse(CommentResource::collection($comments));
    }

    /**
     * Add comment to a post.
     */
    public function storeComment(CreateCommentRequest $request, int $postId): JsonResponse
    {
        $dto = CreateCommentData::from($request->validated());

        $comment = ApiFactory::getEngagementService()
            ->withUser($this->guard()->user())
            ->addComment($postId, $dto);

        return $this->sendSuccessResponse(new CommentResource($comment));
    }

    /**
     * Delete a comment.
     */
    public function destroyComment(int $id): JsonResponse
    {
        ApiFactory::getEngagementService()
            ->withUser($this->guard()->user())
            ->deleteComment($id);

        return $this->sendSuccessResponse(['success' => true]);
    }

    /**
     * Toggle post like.
     */
    public function togglePostLike(int $postId): JsonResponse
    {
        $liked = ApiFactory::getEngagementService()
            ->withUser($this->guard()->user())
            ->togglePostLike($postId);

        return $this->sendSuccessResponse(['liked' => $liked]);
    }

    /**
     * Toggle comment like.
     */
    public function toggleCommentLike(int $commentId): JsonResponse
    {
        $liked = ApiFactory::getEngagementService()
            ->withUser($this->guard()->user())
            ->toggleCommentLike($commentId);

        return $this->sendSuccessResponse(['liked' => $liked]);
    }
}
