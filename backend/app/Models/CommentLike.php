<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $comment_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 */
class CommentLike extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $table = 'comment_likes';

    // Disable updated_at since the table only tracks created_at
    public const UPDATED_AT = null;

    protected $fillable = [
        'comment_id',
        'user_id',
    ];

    /**
     * Get the comment that was liked.
     */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }

    /**
     * Get the user who liked the comment.
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
