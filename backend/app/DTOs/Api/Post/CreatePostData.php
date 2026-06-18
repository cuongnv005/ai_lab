<?php

namespace App\DTOs\Api\Post;

final readonly class CreatePostData
{
    /**
     * @param string[] $tags
     */
    public function __construct(
        public string $title,
        public string $content,
        public int $categoryId,
        public array $tags = [],
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            title: $data['title'],
            content: $data['content'],
            categoryId: (int) $data['category_id'],
            tags: $data['tags'] ?? [],
        );
    }
}
