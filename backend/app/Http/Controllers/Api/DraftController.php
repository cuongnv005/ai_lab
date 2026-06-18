<?php

namespace App\Http\Controllers\Api;

use App\DTOs\Api\Draft\AutoSaveDraftData;
use App\Factories\ApiFactory;
use App\Http\Requests\Draft\AutoSaveDraftRequest;
use App\Http\Requests\Draft\GetDraftRequest;
use App\Http\Resources\Draft\DraftResource;
use Illuminate\Http\JsonResponse;

class DraftController extends BaseController
{
    /**
     * DraftController constructor.
     */
    public function __construct()
    {
        $this->middleware($this->authMiddleware());
    }

    /**
     * Auto-save draft.
     */
    public function autoSave(AutoSaveDraftRequest $request): JsonResponse
    {
        $dto = AutoSaveDraftData::from($request->validated());

        $draft = ApiFactory::getDraftService()
            ->withUser($this->guard()->user())
            ->autoSave($dto);

        return $this->sendSuccessResponse(new DraftResource($draft));
    }

    /**
     * Load current draft.
     */
    public function show(GetDraftRequest $request): JsonResponse
    {
        $categoryId = (int) $request->input('category_id');
        $postId = $request->input('post_id') ? (int) $request->input('post_id') : null;

        $draft = ApiFactory::getDraftService()
            ->withUser($this->guard()->user())
            ->getDraft($categoryId, $postId);

        if (!$draft) {
            return $this->sendSuccessResponse(null);
        }

        return $this->sendSuccessResponse(new DraftResource($draft));
    }

    /**
     * Delete draft.
     */
    public function destroy(GetDraftRequest $request): JsonResponse
    {
        $categoryId = (int) $request->input('category_id');
        $postId = $request->input('post_id') ? (int) $request->input('post_id') : null;

        ApiFactory::getDraftService()
            ->withUser($this->guard()->user())
            ->deleteDraft($categoryId, $postId);

        return $this->sendSuccessResponse(null, trans('response.deleted', ['object' => trans('response.label.draft')]));
    }
}
