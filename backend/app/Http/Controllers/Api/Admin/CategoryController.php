<?php

namespace App\Http\Controllers\Api\Admin;

use App\Factories\ApiFactory;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Api\Admin\Category\AdminCreateCategoryRequest;
use App\Http\Requests\Api\Admin\Category\AdminUpdateCategoryRequest;
use App\Http\Requests\Api\Admin\Category\AdminMovePostsRequest;
use App\Http\Requests\Api\Admin\Category\AdminReorderCategoriesRequest;
use App\DTOs\Api\Admin\Category\AdminCreateCategoryData;
use App\DTOs\Api\Admin\Category\AdminUpdateCategoryData;
use App\Http\Resources\Category\CategoryResource;
use App\Http\Resources\Post\PostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends BaseController
{
    /**
     * List all categories.
     */
    public function index(): JsonResponse
    {
        $categories = ApiFactory::getCategoryService()->listCategories();

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => '',
            'errors' => null,
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Show a category with its posts paginated.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $result = ApiFactory::getCategoryService()->getCategoryDetails($id, $perPage);

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => '',
            'errors' => null,
            'data' => [
                'category' => new CategoryResource($result['category']),
                'posts' => PostResource::collection($result['posts']->items()),
                'pagination' => [
                    'current_page' => $result['posts']->currentPage(),
                    'last_page' => $result['posts']->lastPage(),
                    'per_page' => $result['posts']->perPage(),
                    'total' => $result['posts']->total(),
                ],
            ],
        ]);
    }

    /**
     * Create a new category.
     */
    public function store(AdminCreateCategoryRequest $request): JsonResponse
    {
        $dto = AdminCreateCategoryData::from($request->validated());
        $category = ApiFactory::getCategoryService()->createCategory($dto);

        return $this->sendSuccessResponse(
            new CategoryResource($category),
            trans('response.created', ['object' => trans('response.label.category')]),
            201,
        );
    }

    /**
     * Update category.
     */
    public function update(AdminUpdateCategoryRequest $request, int $id): JsonResponse
    {
        $dto = AdminUpdateCategoryData::from($request->validated());
        $category = ApiFactory::getCategoryService()->updateCategory($id, $dto);

        return $this->sendSuccessResponse(
            new CategoryResource($category),
            trans('response.updated', ['object' => trans('response.label.category')]),
        );
    }

    /**
     * Delete a category (only if empty).
     */
    public function destroy(int $id): JsonResponse
    {
        ApiFactory::getCategoryService()->deleteCategory($id);

        return $this->sendSuccessResponse(
            null,
            trans('response.deleted', ['object' => trans('response.label.category')]),
        );
    }

    /**
     * Move posts from this category to another.
     */
    public function movePosts(AdminMovePostsRequest $request, int $id): JsonResponse
    {
        $targetCategoryId = (int) $request->input('target_category_id');
        $movedCount = ApiFactory::getCategoryService()->movePosts($id, $targetCategoryId);

        return $this->sendSuccessResponse(
            ['moved_count' => $movedCount],
            trans('response.posts_moved_success', ['count' => $movedCount]),
        );
    }

    /**
     * Reorder categories.
     */
    public function reorder(AdminReorderCategoriesRequest $request): JsonResponse
    {
        ApiFactory::getCategoryService()->reorderCategories($request->input('ids'));

        return $this->sendSuccessResponse(
            null,
            trans('response.order_updated_success', ['object' => trans('response.label.category')]),
        );
    }
}
