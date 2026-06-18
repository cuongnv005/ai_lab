<?php

namespace App\Services\Api\Category;

use App\DTOs\Api\Admin\Category\AdminCreateCategoryData;
use App\DTOs\Api\Admin\Category\AdminUpdateCategoryData;
use App\Models\Category;
use App\Models\Post;
use App\Services\Base\Service;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CategoryService extends Service
{
    /**
     * List all categories sorted by sort_order asc.
     */
    public function listCategories(): Collection
    {
        return Category::query()
            ->withCount(['posts' => function ($q) {
                $q->fromActiveUser();
            }])
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();
    }

    /**
     * Get category details and its posts paginated.
     *
     * @return array{category: Category, posts: LengthAwarePaginator}
     */
    public function getCategoryDetails(int $id, int $perPage = 20): array
    {
        $category = Category::findOrFail($id);

        $posts = Post::query()
            ->fromActiveUser()
            ->where('category_id', $id)
            ->with(['category', 'user', 'tags'])
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return [
            'category' => $category,
            'posts' => $posts,
        ];
    }

    /**
     * Create a new category.
     *
     * @throws \Throwable
     */
    public function createCategory(AdminCreateCategoryData $dto): Category
    {
        DB::beginTransaction();
        try {
            $maxSortOrder = Category::max('sort_order') ?? 0;

            $category = Category::create([
                'name' => $dto->name,
                'slug' => $dto->slug,
                'description' => $dto->description,
                'sort_order' => $maxSortOrder + 1,
            ]);

            DB::commit();
            return $category;
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update category.
     *
     * @throws \Throwable
     */
    public function updateCategory(int $id, AdminUpdateCategoryData $dto): Category
    {
        DB::beginTransaction();
        try {
            $category = Category::findOrFail($id);
            $updateData = [];

            if ($dto->name !== null) {
                $updateData['name'] = $dto->name;
            }

            if ($dto->slug !== null) {
                $updateData['slug'] = $dto->slug;
            }

            if ($dto->description !== null) {
                $updateData['description'] = $dto->description;
            }

            $category->update($updateData);

            DB::commit();
            return $category;
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a category.
     *
     * @throws \Throwable
     */
    public function deleteCategory(int $id): void
    {
        DB::beginTransaction();
        try {
            $category = Category::findOrFail($id);

            // Check if there are posts belonging to this category (including soft-deleted posts to be safe)
            $postsCount = Post::withTrashed()->where('category_id', $id)->count();

            if ($postsCount > 0) {
                $samplePosts = Post::withTrashed()
                    ->where('category_id', $id)
                    ->limit(5)
                    ->get(['id', 'title']);

                throw ValidationException::withMessages([
                    'category' => ['Cannot delete category containing posts. Please move posts first.'],
                    'posts' => $samplePosts->toArray(),
                ]);
            }

            $category->delete();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Move posts from one category to another.
     *
     * @throws \Throwable
     */
    public function movePosts(int $id, int $targetCategoryId): int
    {
        if ($id === $targetCategoryId) {
            throw ValidationException::withMessages([
                'target_category_id' => ['Target category must be different from the source category.'],
            ]);
        }

        // Verify categories exist
        Category::findOrFail($id);
        Category::findOrFail($targetCategoryId);

        DB::beginTransaction();
        try {
            // Move posts including soft-deleted posts to prevent database inconsistency
            $movedCount = Post::withTrashed()
                ->where('category_id', $id)
                ->update(['category_id' => $targetCategoryId]);

            DB::commit();
            return $movedCount;
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Reorder categories.
     *
     * @throws \Throwable
     */
    public function reorderCategories(array $ids): void
    {
        DB::beginTransaction();
        try {
            foreach ($ids as $index => $id) {
                Category::where('id', $id)->update(['sort_order' => $index + 1]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
