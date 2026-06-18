<?php

namespace App\DTOs\Api\Admin\User;

final readonly class ChangeRoleData
{
    public function __construct(
        public string $role,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            role: $data['role'],
        );
    }
}
