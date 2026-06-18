<?php

namespace App\Factories;

use App\Services\Api\AuthService;
use App\Services\Api\UserService;
use App\Services\Api\UserTableService;
use App\Services\Api\User\UserProfileService;
use App\Services\Api\MasterDataService;
use App\Services\Api\Post\PostService;
use App\Services\Api\Post\PostTableService;
use App\Services\Api\Post\AdminPostTableService;
use App\Services\Api\Draft\DraftService;
use App\Services\Api\Engagement\EngagementService;
use App\Services\Api\Comment\AdminCommentTableService;
use App\Services\Api\Category\CategoryService;
use App\Services\Api\Report\ReportService;
use App\Services\Api\Report\ReportTableService;
use App\Services\Api\AnalyticsService;
use Illuminate\Contracts\Container\Container;
use Illuminate\Contracts\Foundation\Application;

class ApiFactory
{
    /**
     * Register User Service
     *
     * @param Application|Container $app
     * @return void
     */
    public static function register($app): void
    {
        $app->scoped(AuthService::class, function ($app) {
            return new AuthService();
        });

        $app->scoped(MasterDataService::class, function ($app) {
            return new MasterDataService();
        });

        $app->scoped(UserService::class, function ($app) {
            return new UserService();
        });

        $app->scoped(UserProfileService::class, function ($app) {
            return new UserProfileService();
        });

        $app->bind(UserTableService::class, function ($app) {
            return new UserTableService();
        });

        $app->scoped(PostService::class, function ($app) {
            return new PostService();
        });

        $app->bind(PostTableService::class, function ($app) {
            return new PostTableService();
        });

        $app->bind(AdminPostTableService::class, function ($app) {
            return new AdminPostTableService();
        });

        $app->scoped(DraftService::class, function ($app) {
            return new DraftService();
        });

        $app->scoped(EngagementService::class, function ($app) {
            return new EngagementService();
        });

        $app->bind(AdminCommentTableService::class, function ($app) {
            return new AdminCommentTableService();
        });

        $app->scoped(CategoryService::class, function ($app) {
            return new CategoryService();
        });

        $app->scoped(ReportService::class, function ($app) {
            return new ReportService();
        });

        $app->bind(ReportTableService::class, function ($app) {
            return new ReportTableService();
        });

        $app->scoped(AnalyticsService::class, function ($app) {
            return new AnalyticsService();
        });
    }

    /**
     * Get Master Data Service
     *
     * @return MasterDataService
     */
    public static function getMasterDataService()
    {
        return app(MasterDataService::class);
    }

    /**
     * Get Auth Service
     *
     * @return AuthService
     */
    public static function getAuthService()
    {
        return app(AuthService::class);
    }

    /**
     * Get User Service
     *
     * @return UserService
     */
    public static function getUserService()
    {
        return app(UserService::class);
    }

    /**
     * Get User Profile Service
     *
     * @return UserProfileService
     */
    public static function getUserProfileService()
    {
        return app(UserProfileService::class);
    }

    /**
     * Get User Table Service
     *
     * @return UserTableService
     */
    public static function getUserTableService()
    {
        return app(UserTableService::class);
    }

    /**
     * Get Post Service
     *
     * @return PostService
     */
    public static function getPostService()
    {
        return app(PostService::class);
    }

    /**
     * Get Post Table Service
     *
     * @return PostTableService
     */
    public static function getPostTableService()
    {
        return app(PostTableService::class);
    }

    /**
     * Get Admin Post Table Service
     *
     * @return AdminPostTableService
     */
    public static function getAdminPostTableService()
    {
        return app(AdminPostTableService::class);
    }

    /**
     * Get Draft Service
     *
     * @return DraftService
     */
    public static function getDraftService()
    {
        return app(DraftService::class);
    }

    /**
     * Get Engagement Service
     *
     * @return EngagementService
     */
    public static function getEngagementService()
    {
        return app(EngagementService::class);
    }

    /**
     * Get Admin Comment Table Service
     *
     * @return AdminCommentTableService
     */
    public static function getAdminCommentTableService()
    {
        return app(AdminCommentTableService::class);
    }

    /**
     * Get Category Service
     *
     * @return CategoryService
     */
    public static function getCategoryService()
    {
        return app(CategoryService::class);
    }

    /**
     * Get Report Service
     *
     * @return ReportService
     */
    public static function getReportService()
    {
        return app(ReportService::class);
    }

    /**
     * Get Report Table Service
     *
     * @return ReportTableService
     */
    public static function getReportTableService()
    {
        return app(ReportTableService::class);
    }

    /**
     * Get Analytics Service
     *
     * @return AnalyticsService
     */
    public static function getAnalyticsService()
    {
        return app(AnalyticsService::class);
    }
}
