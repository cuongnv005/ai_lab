<?php

namespace App\DTOs\Api\Admin\Category;

final readonly class AdminCreateCategoryData
{
    public function __construct(
        public string $name,
        public string $slug,
        public ?string $description = null,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            name: $data['name'],
            slug: $data['slug'],
            description: $data['description'] ?? null,
        );
    }
}
