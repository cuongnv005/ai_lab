<?php

namespace App\Services\Api;

use App\Models\User;
use App\Services\Base\TableService;

class UserTableService extends TableService
{
    /**
     * @var string[]
     */
    protected $searchables = [
        'users.name',
        'users.email',
    ];

    /**
     * @var string[]
     */
    protected $orderables = [
        'id' => 'users.id',
        'name' => 'users.name',
        'email' => 'users.email',
        'created_at' => 'users.created_at',
    ];

    /**
     * @var string[]
     */
    protected $filterables = [
        'status' => 'users.status',
        'role' => 'filterRole',
        'created_from' => 'filterCreatedFrom',
        'created_to' => 'filterCreatedTo',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function makeNewQuery()
    {
        return User::query()
            ->selectRaw($this->getSelectRaw())
            ->withCount('posts');
    }

    /**
     * @return string
     */
    protected function getSelectRaw(): string
    {
        $fields = [
            'users.id',
            'users.name',
            'users.email',
            'users.status',
            'users.ban_reason',
            'users.banned_until',
            'users.created_at',
            'users.updated_at',
        ];

        return implode(', ', $fields);
    }

    /**
     * Filter Created From
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filter
     * @return void
     */
    protected function filterCreatedFrom($query, $filter)
    {
        $query->where('users.created_at', '>=', $filter['data']);
    }

    /**
     * Filter Created To
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filter
     * @return void
     */
    protected function filterCreatedTo($query, $filter)
    {
        $query->where('users.created_at', '<=', $filter['data']);
    }

    /**
     * Filter by Role
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filter
     * @return void
     */
    protected function filterRole($query, $filter)
    {
        $role = $filter['data'];
        $query->whereHas('roles', function ($q) use ($role) {
            $q->where('name', $role);
        });
    }
}
