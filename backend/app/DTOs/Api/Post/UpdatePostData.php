<?php

namespace App\DTOs\Api\Post;

final readonly class UpdatePostData
{
    /**
     * @param string[]|null $tags
     */
    public function __construct(
        public ?string $title,
        public ?string $content,
        public ?int $categoryId,
        public ?array $tags = null,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            title: $data['title'] ?? null,
            content: $data['content'] ?? null,
            categoryId: isset($data['category_id']) ? (int) $data['category_id'] : null,
            tags: $data['tags'] ?? null,
        );
    }
}
