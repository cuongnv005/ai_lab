<?php

namespace App\Services\Api\Report;

use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Services\Base\TableService;
use Illuminate\Database\Eloquent\Builder;

class ReportTableService extends TableService
{
    /**
     * @var string[]
     */
    protected $searchables = [
        'reports.reason',
    ];

    /**
     * @var string[]
     */
    protected $orderables = [
        'id' => 'reports.id',
        'created_at' => 'reports.created_at',
    ];

    /**
     * @var string[]
     */
    protected $filterables = [
        'status' => 'reports.status',
        'type' => 'filterByType',
    ];

    /**
     * @return Builder
     */
    public function makeNewQuery()
    {
        return Report::query()
            ->with(['user', 'resolver', 'reportable'])
            ->selectRaw($this->getSelectRaw());
    }

    /**
     * @return string
     */
    protected function getSelectRaw(): string
    {
        $fields = [
            'reports.id',
            'reports.user_id',
            'reports.reportable_type',
            'reports.reportable_id',
            'reports.reason',
            'reports.status',
            'reports.resolved_by',
            'reports.resolved_at',
            'reports.created_at',
            'reports.updated_at',
        ];

        return implode(', ', $fields);
    }

    /**
     * Filter by reportable type (post or comment).
     *
     * @param Builder $query
     * @param array $filter
     * @param array $filters
     * @return Builder
     */
    protected function filterByType(Builder $query, array $filter, array $filters): Builder
    {
        $type = strtolower($filter['data']);

        $typeMap = [
            'post' => Post::class,
            'comment' => Comment::class,
        ];

        if (isset($typeMap[$type])) {
            $query->where('reports.reportable_type', $typeMap[$type]);
        }

        return $query;
    }
}
