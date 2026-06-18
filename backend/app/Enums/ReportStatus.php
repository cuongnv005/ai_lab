<?php

namespace App\Enums;

use App\Traits\Enums\HasEnumStaticMethods;

enum ReportStatus: int
{
    use HasEnumStaticMethods;

    case PENDING = 1;
    case RESOLVED = 2;
    case DISMISSED = 3;

    public function label(): string
    {
        return match ($this) {
            self::PENDING => trans('enums.report_status.pending'),
            self::RESOLVED => trans('enums.report_status.resolved'),
            self::DISMISSED => trans('enums.report_status.dismissed'),
        };
    }
}
