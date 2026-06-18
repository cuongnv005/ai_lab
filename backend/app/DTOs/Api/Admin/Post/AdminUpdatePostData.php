<?php

namespace App\DTOs\Api\Admin\Post;

use App\Enums\PostStatus;

final readonly class AdminUpdatePostData
{
    /**
     * @param string[]|null $tags
     */
    public function __construct(
        public ?string $title,
        public ?string $content,
        public ?int $categoryId,
        public ?array $tags = null,
        public ?PostStatus $status = null,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            title: $data['title'] ?? null,
            content: $data['content'] ?? null,
            categoryId: isset($data['category_id']) ? (int) $data['category_id'] : null,
            tags: $data['tags'] ?? null,
            status: isset($data['status']) ? PostStatus::from((int) $data['status']) : null,
        );
    }
}
