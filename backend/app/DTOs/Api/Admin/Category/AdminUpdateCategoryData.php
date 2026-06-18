<?php

namespace App\DTOs\Api\Admin\Category;

final readonly class AdminUpdateCategoryData
{
    public function __construct(
        public ?string $name = null,
        public ?string $slug = null,
        public ?string $description = null,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            name: $data['name'] ?? null,
            slug: $data['slug'] ?? null,
            description: $data['description'] ?? null,
        );
    }
}
