<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LogController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\MasterDataController;
use App\Http\Controllers\Api\UploadImageController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\DraftController;
use App\Http\Controllers\Api\EngagementController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\CategoryController;

// Client (frontend) log ingest. Public so errors are captured even before
// login; its own 'log' limiter absorbs batches while still bounding abuse.
Route::post('/logs', [LogController::class, 'store'])
    ->middleware('throttle:log')
    ->name('logs.store');

// Baseline per-IP throttle for every API endpoint (see the 'api' limiter).
Route::middleware('throttle:api')->group(function () {
    Route::get('/master-data', [MasterDataController::class, 'show'])->name('masterData');
    Route::post('/upload-image', [UploadImageController::class, 'upload'])->name('uploadImage');
    Route::get('/users/top-authors', [UserController::class, 'topAuthors'])->name('users.top-authors');
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{id}', [UserProfileController::class, 'show'])->name('users.show');
    Route::get('/users/{id}/posts', [UserProfileController::class, 'posts'])->name('users.posts');
    Route::put('/users/profile', [UserProfileController::class, 'update'])->name('users.profile.update');

    // Category Routes
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/{slug}/posts', [PostController::class, 'categoryPosts'])->name('categories.posts');
    Route::get('/categories/{slug}/threads', [PostController::class, 'categoryThreads'])->name('categories.threads');

    // Tag Post Listing Route
    Route::get('/tags/{slug}/posts', [PostController::class, 'tagPosts'])->name('tags.posts');

    // Post Management Routes
    Route::group(['prefix' => 'posts', 'as' => 'posts.'], function () {
        Route::get('/hot', [PostController::class, 'hot'])->name('hot');
        Route::get('/', [PostController::class, 'index'])->name('index');
        Route::post('/', [PostController::class, 'store'])->name('store');
        Route::get('/{id}', [PostController::class, 'show'])->name('show');
        Route::put('/{id}', [PostController::class, 'update'])->name('update');
        Route::delete('/{id}', [PostController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/promote', [PostController::class, 'promote'])->name('promote');
        Route::get('/{id}/similar', [PostController::class, 'similar'])->name('similar');
        Route::get('/{id}/comments', [EngagementController::class, 'index'])->name('comments.index');
        Route::post('/{id}/comments', [EngagementController::class, 'storeComment'])->name('comments.store');
        Route::post('/{id}/like', [EngagementController::class, 'togglePostLike'])->name('like');
    });

    // Comment Management Routes
    Route::delete('/comments/{id}', [EngagementController::class, 'destroyComment'])->name('comments.destroy');
    Route::post('/comments/{id}/like', [EngagementController::class, 'toggleCommentLike'])->name('comments.like');

    // Draft Management Routes
    Route::group(['prefix' => 'drafts', 'as' => 'drafts.'], function () {
        Route::post('/autosave', [DraftController::class, 'autoSave'])->name('autosave');
        Route::get('/', [DraftController::class, 'show'])->name('show');
        Route::delete('/', [DraftController::class, 'destroy'])->name('destroy');
    });

    // Report Management Routes
    Route::post('/reports', [ReportController::class, 'submit'])->name('reports.submit');
    Route::group(['prefix' => 'admin/reports', 'as' => 'admin.reports.', 'middleware' => 'role:admin|moderator'], function () {
        Route::get('/', [\App\Http\Controllers\Api\Admin\ReportController::class, 'index'])->name('index');
        Route::get('/{id}', [\App\Http\Controllers\Api\Admin\ReportController::class, 'show'])->name('show');
        Route::post('/{id}/resolve', [\App\Http\Controllers\Api\Admin\ReportController::class, 'resolve'])->name('resolve');
        Route::post('/{id}/dismiss', [\App\Http\Controllers\Api\Admin\ReportController::class, 'dismiss'])->name('dismiss');
    });

    // Admin User Management Routes
    Route::group(['prefix' => 'admin/users', 'as' => 'admin.users.', 'middleware' => 'role:admin'], function () {
        Route::get('/', [\App\Http\Controllers\Api\Admin\UserController::class, 'index'])->name('index');
        Route::get('/{id}', [\App\Http\Controllers\Api\Admin\UserController::class, 'show'])->name('show');
        Route::put('/{id}/role', [\App\Http\Controllers\Api\Admin\UserController::class, 'changeRole'])->name('role');
        Route::post('/{id}/ban', [\App\Http\Controllers\Api\Admin\UserController::class, 'ban'])->name('ban');
        Route::post('/{id}/unban', [\App\Http\Controllers\Api\Admin\UserController::class, 'unban'])->name('unban');
        Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\UserController::class, 'destroy'])->name('destroy');
    });

    // Admin Dashboard Analytics Routes
    Route::group(['prefix' => 'admin/dashboard', 'as' => 'admin.dashboard.', 'middleware' => 'role:admin'], function () {
        Route::get('/stats', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'stats'])->name('stats');
        Route::get('/chart', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'chart'])->name('chart');
        Route::get('/top-posts', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'topPosts'])->name('top-posts');
        Route::get('/top-users', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'topUsers'])->name('top-users');
        Route::get('/recent-activity', [\App\Http\Controllers\Api\Admin\AnalyticsController::class, 'recentActivity'])->name('recent-activity');
    });

    // Admin Post Approval Routes
    Route::group(['prefix' => 'admin/posts', 'as' => 'admin.posts.', 'middleware' => 'role:admin|moderator'], function () {
        Route::get('/', [\App\Http\Controllers\Api\Admin\PostController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\Api\Admin\PostController::class, 'store'])->name('store');
        Route::get('/trashed', [\App\Http\Controllers\Api\Admin\PostController::class, 'trashed'])->name('trashed');
        Route::get('/pending', [\App\Http\Controllers\Api\Admin\PostApprovalController::class, 'pending'])->name('pending');
        Route::post('/{id}/approve', [\App\Http\Controllers\Api\Admin\PostApprovalController::class, 'approve'])->name('approve');
        Route::post('/{id}/reject', [\App\Http\Controllers\Api\Admin\PostApprovalController::class, 'reject'])->name('reject');
        Route::get('/rejected', [\App\Http\Controllers\Api\Admin\PostApprovalController::class, 'rejected'])->name('rejected');
        Route::put('/{id}', [\App\Http\Controllers\Api\Admin\PostController::class, 'update'])->name('update');
        Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\PostController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/force-delete', [\App\Http\Controllers\Api\Admin\PostController::class, 'forceDelete'])->name('force-delete');
        Route::post('/{id}/restore', [\App\Http\Controllers\Api\Admin\PostController::class, 'restore'])->name('restore');
    });

    // Admin Category Management Routes
    Route::group(['prefix' => 'admin/categories', 'as' => 'admin.categories.', 'middleware' => 'role:admin'], function () {
        Route::get('/', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'store'])->name('store');
        Route::post('/reorder', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'reorder'])->name('reorder');
        Route::get('/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'show'])->name('show');
        Route::put('/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'update'])->name('update');
        Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/move-posts', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'movePosts'])->name('move-posts');
    });

    Route::group(['as' => 'auth.', 'prefix' => 'auth'], function () {
        // Stricter throttle for credential-sensitive endpoints (see the 'auth'
        // limiter) to curb brute force, registration spam and enumeration.
        Route::middleware('throttle:auth')->group(function () {
            Route::post('/register', [AuthController::class, 'register'])->name('register');
            Route::post('/login', [AuthController::class, 'login'])->name('login');
            Route::post('/change-password', [AuthController::class, 'changePassword'])->name('changePassword');
            Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('forgotPassword');
            Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('verifyOtp');
            Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('resetPassword');
        });

        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('/me', [AuthController::class, 'me'])->name('me');
    });
});
