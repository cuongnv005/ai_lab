<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $post_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 */
class PostLike extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $table = 'post_likes';

    // Disable updated_at since the table only tracks created_at
    public const UPDATED_AT = null;

    /**
     * Booted method to register model events.
     */
    protected static function booted(): void
    {
        static::created(function (PostLike $postLike) {
            $post = $postLike->post;
            if ($post && $post->user) {
                $post->user->increment('total_likes');
            }
        });

        static::deleted(function (PostLike $postLike) {
            $post = $postLike->post;
            if ($post && $post->user) {
                $post->user->decrement('total_likes');
            }
        });
    }

    protected $fillable = [
        'post_id',
        'user_id',
    ];

    /**
     * Get the post that was liked.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user who liked the post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Configure Spatie activity log.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
