<?php

namespace App\DTOs\Api\Admin;

readonly class RejectPostData
{
    public function __construct(
        public string $reason,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            reason: $data['reason'],
        );
    }
}
