<?php

namespace App\Enums;

use App\Traits\Enums\HasEnumStaticMethods;

enum Gender: int
{
    use HasEnumStaticMethods;

    case MALE = 1;
    case FEMALE = 2;
    case OTHER = 3;

    public function label(): string
    {
        return trans('enums.gender.' . strtolower($this->name));
    }
}
