<?php

namespace App\DTOs\Api\Admin\User;

final readonly class BanUserData
{
    public function __construct(
        public string $reason,
        public ?int $duration = null,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            reason: $data['reason'],
            duration: isset($data['duration']) ? (int) $data['duration'] : null,
        );
    }
}
