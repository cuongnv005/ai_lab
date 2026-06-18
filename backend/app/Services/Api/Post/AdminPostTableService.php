<?php

namespace App\Services\Api\Post;

use App\Models\Post;
use App\Services\Base\TableService;
use Illuminate\Database\Eloquent\Builder;

class AdminPostTableService extends TableService
{
    /**
     * @var string[]
     */
    protected $searchables = [
        'posts.title',
        'posts.content',
    ];

    /**
     * @var string[]
     */
    protected $orderables = [
        'id' => 'posts.id',
        'title' => 'posts.title',
        'views_count' => 'posts.views_count',
        'created_at' => 'posts.created_at',
    ];

    /**
     * @var string[]
     */
    protected $filterables = [
        'status' => 'posts.status',
        'category_id' => 'posts.category_id',
        'author' => 'posts.user_id',
        'exclude_staff' => 'filterExcludeStaff',
    ];

    /**
     * @return Builder
     */
    public function makeNewQuery()
    {
        return Post::withTrashed()
            ->with(['category', 'user', 'tags'])
            ->whereHas('user')
            ->selectRaw($this->getSelectRaw());
    }

    /**
     * Filter out posts by admin and moderator.
     *
     * @param Builder $query
     * @param array $filter
     * @param array $filters
     * @return Builder
     */
    protected function filterExcludeStaff(Builder $query, array $filter, array $filters)
    {
        if ($filter['data'] === '1' || $filter['data'] === 'true' || $filter['data'] === true) {
            return $query->whereHas('user', function ($q) {
                $q->whereDoesntHave('roles', function ($qr) {
                    $qr->whereIn('name', ['admin', 'moderator']);
                });
            });
        }
        return $query;
    }

    /**
     * @return string
     */
    protected function getSelectRaw(): string
    {
        $fields = [
            'posts.id',
            'posts.title',
            'posts.summary',
            'posts.content',
            'posts.status',
            'posts.views_count',
            'posts.user_id',
            'posts.category_id',
            'posts.created_at',
            'posts.updated_at',
        ];

        return implode(', ', $fields);
    }
}
