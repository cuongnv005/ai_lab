<?php

namespace App\Services\Api;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Report;
use App\Enums\PostStatus;
use App\Services\Base\Service;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsService extends Service
{
    /**
     * Get dashboard stats with cache.
     *
     * @param string $period
     * @return array
     */
    public function getStats(string $period): array
    {
        $cacheKey = "admin_dashboard_stats_{$period}";

        return Cache::remember($cacheKey, 300, function () use ($period) {
            $range = $this->getDateRange($period);
            $start = $range['start'];
            $end = $range['end'];

            // Period-based stats
            $newUsers = User::whereBetween('created_at', [$start, $end])->count();
            $newPosts = Post::whereBetween('created_at', [$start, $end])->count();
            $newComments = Comment::whereBetween('created_at', [$start, $end])->count();
            $totalViewsInPeriod = (int) Post::whereBetween('created_at', [$start, $end])->sum('views_count');

            // Cumulative stats (overall)
            $totalUsers = User::count();
            $totalPosts = Post::count();
            $totalComments = Comment::count();
            $pendingPosts = Post::where('status', PostStatus::PENDING->value)->count();

            return [
                'total_views' => $totalViewsInPeriod,
                'new_posts' => $newPosts,
                'new_users' => $newUsers,
                'new_comments' => $newComments,
                'pending_posts' => $pendingPosts,
                'total_users' => $totalUsers,
                'total_posts' => $totalPosts,
                'total_comments' => $totalComments,
            ];
        });
    }

    /**
     * Get dashboard chart data with cache.
     *
     * @param string $period
     * @param string $type
     * @return array
     */
    public function getChartData(string $period, string $type): array
    {
        $cacheKey = "admin_dashboard_chart_{$period}_{$type}";

        return Cache::remember($cacheKey, 300, function () use ($period, $type) {
            $range = $this->getDateRange($period);
            $start = $range['start'];
            $end = $range['end'];

            $isSqlite = DB::connection()->getDriverName() === 'sqlite';
            $isYear = $period === 'year';

            if ($isYear) {
                $format = $isSqlite ? '%Y-%m' : '%Y-%m';
                $selectExpr = $isSqlite
                    ? "strftime('%Y-%m', created_at) as date_group"
                    : "DATE_FORMAT(created_at, '%Y-%m') as date_group";
            } else {
                $selectExpr = $isSqlite
                    ? "strftime('%Y-%m-%d', created_at) as date_group"
                    : "DATE_FORMAT(created_at, '%Y-%m-%d') as date_group";
            }

            // Determine query target
            $query = match ($type) {
                'users' => User::query(),
                'posts' => Post::query(),
                'comments' => Comment::query(),
                'views' => Post::query(),
            };

            $query->whereBetween('created_at', [$start, $end]);

            if ($type === 'views') {
                $results = $query->select(DB::raw($selectExpr), DB::raw('SUM(views_count) as val'))
                    ->groupBy('date_group')
                    ->pluck('val', 'date_group');
            } else {
                $results = $query->select(DB::raw($selectExpr), DB::raw('COUNT(*) as val'))
                    ->groupBy('date_group')
                    ->pluck('val', 'date_group');
            }

            // Generate filled array for chart
            $chartData = [];
            $current = $start->copy();

            if ($isYear) {
                // Monthly loop for year
                for ($i = 0; $i < 12; $i++) {
                    $key = $current->format('Y-m');
                    $chartData[] = [
                        'date' => $key,
                        'value' => isset($results[$key]) ? (int) $results[$key] : 0,
                    ];
                    $current->addMonth();
                }
            } else {
                // Daily loop
                while ($current->lte($end)) {
                    $key = $current->toDateString();
                    $chartData[] = [
                        'date' => $key,
                        'value' => isset($results[$key]) ? (int) $results[$key] : 0,
                    ];
                    $current->addDay();
                }
            }

            return $chartData;
        });
    }

    /**
     * Get top posts sorted by views.
     *
     * @param string $period
     * @param int $limit
     * @return array
     */
    public function getTopPosts(string $period, int $limit): array
    {
        $range = $this->getDateRange($period);

        $posts = Post::fromActiveUser()
            ->with(['user', 'comments', 'likes'])
            ->whereBetween('created_at', [$range['start'], $range['end']])
            ->orderBy('views_count', 'desc')
            ->limit($limit)
            ->get();

        return $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'views_count' => $post->views_count,
                'likes_count' => $post->likes->count(),
                'comments_count' => $post->comments->count(),
                'author' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                ],
            ];
        })->toArray();
    }

    /**
     * Get top users by activity (posts + comments).
     *
     * @param string $period
     * @param int $limit
     * @return array
     */
    public function getTopUsers(string $period, int $limit): array
    {
        $range = $this->getDateRange($period);
        $start = $range['start'];
        $end = $range['end'];

        // We fetch users with counts of posts and comments in the range.
        // We can do this using subqueries or collection sorting. Collection sorting is database-portable.
        $users = User::where('status', \App\Enums\UserStatus::ACTIVE->value)
            ->withCount([
                'posts' => function ($query) use ($start, $end) {
                    $query->whereBetween('created_at', [$start, $end]);
                },
                'comments' => function ($query) use ($start, $end) {
                    $query->whereBetween('created_at', [$start, $end]);
                },
            ])->get();

        $sorted = $users->sortByDesc(function ($user) {
            return $user->posts_count + $user->comments_count;
        })->take($limit);

        return $sorted->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'posts_count' => $user->posts_count,
                'comments_count' => $user->comments_count,
                'activity_count' => $user->posts_count + $user->comments_count,
            ];
        })->values()->toArray();
    }

    /**
     * Get recent activities (posts, comments, users, reports).
     *
     * @param int $limit
     * @return array
     */
    public function getRecentActivities(int $limit): array
    {
        $activities = [];

        // Recent users
        $users = User::orderBy('created_at', 'desc')->limit($limit)->get();
        foreach ($users as $user) {
            $activities[] = [
                'type' => 'user_registered',
                'description' => "New user registered: {$user->name}",
                'timestamp' => $user->created_at->toIso8601String(),
                'created_at' => $user->created_at,
            ];
        }

        // Recent posts
        $posts = Post::with('user')->orderBy('created_at', 'desc')->limit($limit)->get();
        foreach ($posts as $post) {
            $activities[] = [
                'type' => 'post_created',
                'description' => "New post created: \"{$post->title}\" by {$post->user->name}",
                'timestamp' => $post->created_at->toIso8601String(),
                'created_at' => $post->created_at,
            ];
        }

        // Recent comments
        $comments = Comment::with(['user', 'post'])->orderBy('created_at', 'desc')->limit($limit)->get();
        foreach ($comments as $comment) {
            $postTitle = $comment->post ? "\"{$comment->post->title}\"" : 'deleted post';
            $activities[] = [
                'type' => 'comment_created',
                'description' => "New comment by {$comment->user->name} on {$postTitle}",
                'timestamp' => $comment->created_at->toIso8601String(),
                'created_at' => $comment->created_at,
            ];
        }

        // Recent reports
        $reports = Report::with('user')->orderBy('created_at', 'desc')->limit($limit)->get();
        foreach ($reports as $report) {
            $reporterName = $report->user ? $report->user->name : 'Anonymous';
            $activities[] = [
                'type' => 'report_submitted',
                'description' => "New report submitted by {$reporterName}: \"{$report->reason}\"",
                'timestamp' => $report->created_at->toIso8601String(),
                'created_at' => $report->created_at,
            ];
        }

        // Merge, sort, and slice
        usort($activities, function ($a, $b) {
            return $b['created_at']->timestamp <=> $a['created_at']->timestamp;
        });

        // Clean internal Carbon instance before return
        $result = array_map(function ($item) {
            unset($item['created_at']);
            return $item;
        }, array_slice($activities, 0, $limit));

        return $result;
    }

    /**
     * Helper to parse Carbon range for periods.
     *
     * @param string $period
     * @return array
     */
    private function getDateRange(string $period): array
    {
        $end = Carbon::now();
        $start = match ($period) {
            'today' => Carbon::now()->startOfDay(),
            '7days' => Carbon::now()->subDays(6)->startOfDay(), // 7 days total including today
            'year' => Carbon::now()->startOfYear(),
            default => Carbon::now()->subDays(29)->startOfDay(), // 30days
        };

        return [
            'start' => $start,
            'end' => $end,
        ];
    }
}
