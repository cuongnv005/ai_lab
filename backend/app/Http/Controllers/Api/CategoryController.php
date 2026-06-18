<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\Category\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends BaseController
{
    /**
     * List all categories.
     */
    public function index(): JsonResponse
    {
        $categories = \Illuminate\Support\Facades\Cache::remember('categories_list', 300, function () {
            $cats = Category::withCount(['posts' => function ($query) {
                $query->fromActiveUser()->whereIn('status', [
                    \App\Enums\PostStatus::PUBLISHED,
                    \App\Enums\PostStatus::PENDING,
                    \App\Enums\PostStatus::APPROVED,
                    \App\Enums\PostStatus::REJECTED,
                ]);
            }])->get();

            foreach ($cats as $category) {
                $category->setRelation('latest_posts', $category->posts()
                    ->fromActiveUser()
                    ->whereIn('status', [
                        \App\Enums\PostStatus::PUBLISHED,
                        \App\Enums\PostStatus::PENDING,
                        \App\Enums\PostStatus::APPROVED,
                        \App\Enums\PostStatus::REJECTED,
                    ])
                    ->with('user')
                    ->latest()
                    ->limit(5)
                    ->get());
            }

            return $cats;
        });

        return $this->sendSuccessResponse(CategoryResource::collection($categories));
    }
}
