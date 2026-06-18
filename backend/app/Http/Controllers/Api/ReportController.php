<?php

namespace App\Http\Controllers\Api;

use App\DTOs\Api\Report\CreateReportData;
use App\Factories\ApiFactory;
use App\Http\Requests\Report\CreateReportRequest;
use App\Http\Resources\Report\ReportResource;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;

class ReportController extends BaseController
{
    /**
     * ReportController constructor.
     */
    public function __construct()
    {
        $this->middleware($this->authMiddleware());
    }

    /**
     * Submit abuse report.
     *
     * @throws \Throwable
     */
    public function submit(CreateReportRequest $request): JsonResponse
    {
        $dto = CreateReportData::from($request->validated());

        $report = ApiFactory::getReportService()
            ->withUser($this->guard()->user())
            ->submitReport($dto);

        $report->load('reportable');

        return $this->sendSuccessResponse(new ReportResource($report));
    }

    /**
     * List pending reports (Admin only).
     *
     * @throws AuthorizationException
     */
    public function indexPending(): JsonResponse
    {
        $this->checkAdmin();

        $reports = ApiFactory::getReportService()
            ->withUser($this->guard()->user())
            ->listPendingReports();

        return $this->sendSuccessResponse(ReportResource::collection($reports));
    }

    /**
     * Resolve report (Admin only).
     *
     * @throws AuthorizationException
     * @throws \Throwable
     */
    public function resolve(int $id): JsonResponse
    {
        $this->checkAdmin();

        ApiFactory::getReportService()
            ->withUser($this->guard()->user())
            ->resolveReport($id);

        return $this->sendSuccessResponse(['success' => true]);
    }

    /**
     * Dismiss report (Admin only).
     *
     * @throws AuthorizationException
     * @throws \Throwable
     */
    public function dismiss(int $id): JsonResponse
    {
        $this->checkAdmin();

        ApiFactory::getReportService()
            ->withUser($this->guard()->user())
            ->dismissReport($id);

        return $this->sendSuccessResponse(['success' => true]);
    }

    /**
     * Helper to verify admin role.
     *
     * @throws AuthorizationException
     */
    private function checkAdmin(): void
    {
        $user = $this->guard()->user();
        if (!$user || !$user->hasRole('admin')) {
            throw new AuthorizationException(__('This action is unauthorized.'));
        }
    }
}
