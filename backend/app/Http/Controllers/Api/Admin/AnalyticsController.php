<?php

namespace App\Http\Controllers\Api\Admin;

use App\Factories\ApiFactory;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\Api\Admin\Analytics\GetStatsRequest;
use App\Http\Requests\Api\Admin\Analytics\GetChartRequest;
use App\Http\Requests\Api\Admin\Analytics\GetTopRequest;
use App\Http\Requests\Api\Admin\Analytics\GetRecentActivityRequest;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends BaseController
{
    /**
     * Get dashboard stats.
     *
     * @param GetStatsRequest $request
     * @return JsonResponse
     */
    public function stats(GetStatsRequest $request): JsonResponse
    {
        $period = $request->input('period', '30days');
        $stats = ApiFactory::getAnalyticsService()->getStats($period);

        return $this->sendSuccessResponse($stats);
    }

    /**
     * Get chart data.
     *
     * @param GetChartRequest $request
     * @return JsonResponse
     */
    public function chart(GetChartRequest $request): JsonResponse
    {
        $period = $request->input('period');
        $type = $request->input('type');
        $data = ApiFactory::getAnalyticsService()->getChartData($period, $type);

        return $this->sendSuccessResponse($data);
    }

    /**
     * Get top posts by views.
     *
     * @param GetTopRequest $request
     * @return JsonResponse
     */
    public function topPosts(GetTopRequest $request): JsonResponse
    {
        $period = $request->input('period', '30days');
        $limit = (int) $request->input('limit', 5);
        $data = ApiFactory::getAnalyticsService()->getTopPosts($period, $limit);

        return $this->sendSuccessResponse($data);
    }

    /**
     * Get top users by contribution.
     *
     * @param GetTopRequest $request
     * @return JsonResponse
     */
    public function topUsers(GetTopRequest $request): JsonResponse
    {
        $period = $request->input('period', '30days');
        $limit = (int) $request->input('limit', 5);
        $data = ApiFactory::getAnalyticsService()->getTopUsers($period, $limit);

        return $this->sendSuccessResponse($data);
    }

    /**
     * Get recent activities.
     *
     * @param GetRecentActivityRequest $request
     * @return JsonResponse
     */
    public function recentActivity(GetRecentActivityRequest $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 10);
        $data = ApiFactory::getAnalyticsService()->getRecentActivities($limit);

        return $this->sendSuccessResponse($data);
    }
}
