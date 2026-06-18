<?php

namespace App\Models;

use App\Enums\PostStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $user_id
 * @property int $category_id
 * @property string $title
 * @property string $content
 * @property string|null $summary
 * @property string|null $first_image
 * @property PostStatus $status
 * @property int $views_count
 * @property string|null $reject_reason
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 */
class Post extends Model
{
    use HasFactory;
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'content',
        'summary',
        'first_image',
        'status',
        'previous_status',
        'views_count',
        'reject_reason',
    ];

    /**
     * Booted method to register model events.
     */
    protected static function booted(): void
    {
        static::saving(function (Post $post) {
            if ($post->isDirty('content')) {
                $post->first_image = $post->extractFirstImage($post->content);

                if (empty($post->summary)) {
                    $cleanContent = $post->content;
                    // Remove BBCode image tags including their content
                    $cleanContent = preg_replace('/\[img\].*?\[\/img\]/is', '', $cleanContent);
                    // Remove HTML image tags
                    $cleanContent = preg_replace('/<img[^>]*>/is', '', $cleanContent);
                    // Remove Markdown image tags
                    $cleanContent = preg_replace('/!\[.*?\]\(.*?\)/is', '', $cleanContent);

                    // Split by preview / prebreak tags to get only the preview part if present
                    $parts = preg_split('/\[\/?(?:preview|prebreak|prebeak)\]/i', $cleanContent);
                    if ($parts && count($parts) > 0) {
                        $cleanContent = $parts[0];
                    }

                    // Remove other BBCode tags (only the tags, keeping text)
                    $cleanContent = preg_replace('/\[.*?\]/is', '', $cleanContent);

                    $cleanContent = trim(preg_replace('/\s+/', ' ', $cleanContent));
                    $summary = mb_substr($cleanContent, 0, 180);
                    if (mb_strlen($cleanContent) > 180) {
                        $summary .= '...';
                    }
                    $post->summary = $summary ?: null;
                }
            }
        });

        static::created(function (Post $post) {
            if ($post->user) {
                $post->user->increment('posts_count');
            }
        });

        static::deleted(function (Post $post) {
            // Only decrement if the post was not already soft-deleted (original deleted_at was null)
            if ($post->getOriginal('deleted_at') === null) {
                if ($post->user) {
                    $post->user->decrement('posts_count');

                    $likesCount = $post->likes()->count();
                    if ($likesCount > 0) {
                        $post->user->decrement('total_likes', $likesCount);
                    }
                }
            }
        });

        static::restored(function (Post $post) {
            if ($post->user) {
                $post->user->increment('posts_count');

                $likesCount = $post->likes()->count();
                if ($likesCount > 0) {
                    $post->user->increment('total_likes', $likesCount);
                }
            }
        });
    }

    /**
     * Extract the first image URL from content.
     */
    public function extractFirstImage(?string $content): ?string
    {
        if (empty($content)) {
            return null;
        }

        if (preg_match('/\[img\](.*?)\[\/img\]/is', $content, $matches)) {
            return trim($matches[1]);
        }

        if (preg_match('/<img[^>]+src=["\'](.*?)["\']/is', $content, $matches)) {
            return trim($matches[1]);
        }

        if (preg_match('/!\[.*?\]\((.*?)\)/is', $content, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    /**
     * Get attributes cast mapping.
     */
    protected function casts(): array
    {
        return [
            'status' => PostStatus::class,
            'views_count' => 'integer',
        ];
    }

    /**
     * Get the author of the post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category of the post.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the tags associated with the post.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tag');
    }

    /**
     * Get the comments for the post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the likes on this post.
     */
    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    /**
     * Scope a query to only include posts from active (non-banned/non-inactive) users.
     */
    public function scopeFromActiveUser($query)
    {
        return $query->whereHas('user', function ($q) {
            $q->where('status', \App\Enums\UserStatus::ACTIVE->value);
        });
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
