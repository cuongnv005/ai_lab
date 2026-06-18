<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy extends BasePolicy
{
    /**
     * Determine whether the user can update the post.
     */
    public function update(User $user, Post $post): bool
    {
        if ($this->isAdmin($user) || $this->hasRole($user, 'moderator')) {
            return true;
        }

        return $user->id === $post->user_id;
    }

    /**
     * Determine whether the user can delete the post.
     */
    public function delete(User $user, Post $post): bool
    {
        if ($this->isAdmin($user) || $this->hasRole($user, 'moderator')) {
            return true;
        }

        return $user->id === $post->user_id;
    }
}
