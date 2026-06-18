<?php

namespace App\Services\Api\Comment;

use App\Models\Comment;
use App\Services\Base\TableService;
use Illuminate\Database\Eloquent\Builder;

class AdminCommentTableService extends TableService
{
    /**
     * @var string[]
     */
    protected $searchables = [
        'comments.content',
    ];

    /**
     * @var string[]
     */
    protected $orderables = [
        'id' => 'comments.id',
        'created_at' => 'comments.created_at',
    ];

    /**
     * @var string[]
     */
    protected $filterables = [
        'post_id' => 'comments.post_id',
        'author' => 'comments.user_id',
    ];

    /**
     * @return Builder
     */
    public function makeNewQuery()
    {
        $query = Comment::query()
            ->with(['user', 'post', 'replies'])
            ->selectRaw($this->getSelectRaw());

        if (request()->filled('from_date')) {
            $query->whereDate('comments.created_at', '>=', request()->input('from_date'));
        }
        if (request()->filled('to_date')) {
            $query->whereDate('comments.created_at', '<=', request()->input('to_date'));
        }

        return $query;
    }

    /**
     * @return string
     */
    protected function getSelectRaw(): string
    {
        $fields = [
            'comments.id',
            'comments.post_id',
            'comments.user_id',
            'comments.parent_id',
            'comments.content',
            'comments.created_at',
            'comments.updated_at',
            'comments.deleted_at',
        ];

        return implode(', ', $fields);
    }
}
