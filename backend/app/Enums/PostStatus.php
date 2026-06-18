<?php

namespace App\Enums;

use App\Traits\Enums\HasEnumStaticMethods;

enum PostStatus: int
{
    use HasEnumStaticMethods;

    case PENDING = 1;
    case PUBLISHED = 2;
    case REJECTED = 3;
    case APPROVED = 4;
    case DELETED = 5;

    public function label(): string
    {
        return match ($this) {
            self::PENDING => trans('enums.post_status.pending'),
            self::PUBLISHED => trans('enums.post_status.published'),
            self::REJECTED => trans('enums.post_status.rejected'),
            self::APPROVED => trans('enums.post_status.approved'),
            self::DELETED => trans('enums.post_status.deleted'),
        };
    }
}
