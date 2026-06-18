<?php

namespace App\Enums;

use App\Traits\Enums\HasEnumStaticMethods;

enum UserRole: string
{
    use HasEnumStaticMethods;

    case ADMIN = 'admin';
    case MODERATOR = 'moderator';
    case MEMBER = 'member';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => trans('enums.user_role.admin'),
            self::MODERATOR => trans('enums.user_role.moderator'),
            self::MEMBER => trans('enums.user_role.member'),
        };
    }
}
