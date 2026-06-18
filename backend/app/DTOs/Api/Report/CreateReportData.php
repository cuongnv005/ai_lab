<?php

namespace App\DTOs\Api\Report;

final readonly class CreateReportData
{
    public function __construct(
        public string $reportableType,
        public int $reportableId,
        public string $reason,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            reportableType: $data['reportable_type'],
            reportableId: (int) $data['reportable_id'],
            reason: $data['reason'],
        );
    }
}
