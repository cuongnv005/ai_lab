<?php

namespace App\Http\Controllers\Api;

use App\DTOs\Api\Post\CreatePostData;
use App\DTOs\Api\Post\UpdatePostData;
use App\Factories\ApiFactory;
use App\Http\Requests\Post\CreatePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Http\Resources\Post\PostResource;
use App\Http\Resources\Post\PostThreadResource;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Http\Resources\Post\PostHotResource;

class PostController extends BaseController
{
    /**
     * PostController constructor.
     */
    public function __construct()
    {
        $this->middleware($this->authMiddleware())->only(['store', 'update', 'destroy', 'promote']);
    }

    /**
     * List Homepage Published Posts.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 10);
        $page = (int) $request->input('page', 1);
        $userId = $request->input('user_id') ? (int) $request->input('user_id') : null;
        $search = $request->input('search') ?: null;
        $posts = ApiFactory::getPostService()
            ->withUser($this->guard()->user())
            ->listHomepagePosts($perPage, $page, $userId, $search);

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
     * List Category discussion posts.
     */
    public function categoryPosts(Request $request, string $slug): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 10);
        $posts = ApiFactory::getPostService()->listCategoryPosts($slug, $perPage);

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
     * List Category discussion threads (optimized for lightweight listing).
     */
    public function categoryThreads(Request $request, string $slug): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 10);
        $posts = ApiFactory::getPostService()->listCategoryThreads($slug, $perPage);

        return response()->json([
            'status_code' => 200,
            'message' => '',
            'errors' => null,
            'data' => [
                'data' => PostThreadResource::collection($posts),
                'per_page' => $posts->perPage(),
                'total_page' => $posts->lastPage(),
                'current_page' => $posts->currentPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * List posts by tag slug.
     */
    public function tagPosts(Request $request, string $slug): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 10);
        $posts = ApiFactory::getPostService()->listTagPosts($slug, $perPage);

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
     * Get top 5 hot posts based on view count.
     */
    public function hot(): JsonResponse
    {
        $posts = ApiFactory::getPostService()->getHotPosts();

        return $this->sendSuccessResponse(PostHotResource::collection($posts));
    }

    /**
     * Post Details (increments views).
     */
    public function show(int $id): JsonResponse
    {
        $post = ApiFactory::getPostService()->getPostDetails($id);

        return $this->sendSuccessResponse(new PostResource($post));
    }

    /**
     * Get similar posts based on tag overlap.
     */
    public function similar(Request $request, int $id): JsonResponse
    {
        $tag = $request->query('tag');
        if ($tag) {
            $posts = ApiFactory::getPostService()->getSimilarPostsByTag($tag, $id, 5);
        } else {
            $posts = ApiFactory::getPostService()->getSimilarPosts($id, 5);
        }

        return $this->sendSuccessResponse(PostResource::collection($posts));
    }

    /**
     * Create Post.
     */
    public function store(CreatePostRequest $request): JsonResponse
    {
        $dto = CreatePostData::from($request->validated());

        $post = ApiFactory::getPostService()
            ->withUser($this->guard()->user())
            ->createPost($dto);

        return $this->sendSuccessResponse(new PostResource($post));
    }

    /**
     * Update Post.
     */
    public function update(UpdatePostRequest $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        Gate::authorize('update', $post);

        $dto = UpdatePostData::from($request->validated());

        $updatedPost = ApiFactory::getPostService()
            ->withUser($this->guard()->user())
            ->updatePost($id, $dto);

        return $this->sendSuccessResponse(new PostResource($updatedPost));
    }

    /**
     * Delete Post.
     */
    public function destroy(int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        Gate::authorize('delete', $post);

        ApiFactory::getPostService()->deletePost($id);

        return $this->sendSuccessResponse(null, trans('response.deleted', ['object' => trans('response.label.post')]));
    }

    /**
     * Promote Post to Homepage.
     */
    public function promote(int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        Gate::authorize('update', $post);

        $promotedPost = ApiFactory::getPostService()
            ->withUser($this->guard()->user())
            ->promotePost($id);

        return $this->sendSuccessResponse(new PostResource($promotedPost), trans('response.post_promoted_success'));
    }
}
