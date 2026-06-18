<?php

namespace App\Services\Api\Post;

use App\Models\Post;
use App\Services\Base\TableService;
use Illuminate\Database\Eloquent\Builder;

class PostTableService extends TableService
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
    ];

    /**
     * @return Builder
     */
    public function makeNewQuery()
    {
        return Post::query()
            ->with(['category', 'user', 'tags'])
            ->selectRaw($this->getSelectRaw());
    }

    /**
     * @return string
     */
    protected function getSelectRaw(): string
    {
        $fields = [
            'posts.id',
            'posts.title',
            'posts.slug',
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
