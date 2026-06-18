<?php

namespace App\Services\Api\Draft;

use App\DTOs\Api\Draft\AutoSaveDraftData;
use App\Models\Draft;
use App\Services\Base\Service;
use Illuminate\Support\Facades\DB;

class DraftService extends Service
{
    /**
     * Auto-save draft (UPSERT).
     *
     * @throws \Throwable
     */
    public function autoSave(AutoSaveDraftData $dto): Draft
    {
        DB::beginTransaction();
        try {
            $draft = Draft::updateOrCreate(
                [
                    'user_id' => $this->user->id,
                    'category_id' => $dto->categoryId,
                    'post_id' => $dto->postId,
                ],
                [
                    'title' => $dto->title,
                    'content' => $dto->content,
                    'tags' => $dto->tags,
                ],
            );

            DB::commit();
            return $draft;
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Load current draft.
     */
    public function getDraft(int $categoryId, ?int $postId = null): ?Draft
    {
        return Draft::query()
            ->where('user_id', $this->user->id)
            ->where('category_id', $categoryId)
            ->where('post_id', $postId)
            ->first();
    }

    /**
     * Delete draft (Cleanup).
     *
     * @throws \Throwable
     */
    public function deleteDraft(int $categoryId, ?int $postId = null): void
    {
        DB::beginTransaction();
        try {
            Draft::query()
                ->where('user_id', $this->user->id)
                ->where('category_id', $categoryId)
                ->where('post_id', $postId)
                ->delete();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
