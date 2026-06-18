<?php

namespace App\DTOs\Api\Engagement;

final readonly class CreateCommentData
{
    public function __construct(
        public string $content,
        public ?int $parentId,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            content: $data['content'],
            parentId: isset($data['parent_id']) ? (int) $data['parent_id'] : null,
        );
    }
}
