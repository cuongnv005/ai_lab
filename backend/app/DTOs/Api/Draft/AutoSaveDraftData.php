<?php

namespace App\DTOs\Api\Draft;

final readonly class AutoSaveDraftData
{
    /**
     * @param string[]|null $tags
     */
    public function __construct(
        public int $categoryId,
        public ?int $postId,
        public ?string $title,
        public ?string $content,
        public ?array $tags,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            categoryId: (int) $data['category_id'],
            postId: isset($data['post_id']) ? (int) $data['post_id'] : null,
            title: $data['title'] ?? null,
            content: $data['content'] ?? null,
            tags: $data['tags'] ?? null,
        );
    }
}
