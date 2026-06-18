<?php

namespace App\Http\Controllers\Api\Admin;

use App\Factories\ApiFactory;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\Report\ReportResource;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends BaseController
{
    /**
     * List all reports with filtering and pagination.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->input('search');
        $orders = $this->parseOrders($request->input('orders'));
        $filters = $this->parseFilters($request->input('filters'));
        $perPage = $request->input('per_page', 20);

        $tableService = ApiFactory::getReportTableService();
        $paginator = $tableService->data($search, $orders, $filters, $perPage);

        return response()->json([
            'success' => true,
            'status_code' => 200,
            'message' => '',
            'errors' => null,
            'data' => [
                'data' => ReportResource::collection($paginator->items()),
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
     * Get a single report by ID.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $report = Report::with(['user', 'resolver', 'reportable'])->findOrFail($id);

        return $this->sendSuccessResponse(
            new ReportResource($report),
        );
    }

    /**
     * Resolve a report by deleting the reported content.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function resolve(Request $request, int $id): JsonResponse
    {
        ApiFactory::getReportService()->withUser($request->user())->resolveReport($id);

        return $this->sendSuccessResponse(
            null,
            __('messages.report.resolved'),
        );
    }

    /**
     * Dismiss a report without deleting content.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function dismiss(Request $request, int $id): JsonResponse
    {
        ApiFactory::getReportService()->withUser($request->user())->dismissReport($id);

        return $this->sendSuccessResponse(
            null,
            __('messages.report.dismissed'),
        );
    }

    /**
     * Parse orders from request.
     *
     * @param mixed $orders
     * @return array
     */
    private function parseOrders(mixed $orders): array
    {
        if (is_string($orders)) {
            return json_decode($orders, true) ?? [];
        }

        return is_array($orders) ? $orders : [];
    }

    /**
     * Parse filters from request.
     *
     * @param mixed $filters
     * @return array
     */
    private function parseFilters(mixed $filters): array
    {
        if (is_string($filters)) {
            return json_decode($filters, true) ?? [];
        }

        return is_array($filters) ? $filters : [];
    }
}
