<?php

namespace App\DTOs\Api\User;

use App\Enums\Gender;

final readonly class UpdateUserProfileData
{
    public function __construct(
        public string $name,
        public ?string $avatar_url = null,
        public ?string $dob = null,
        public ?string $hometown = null,
        public ?Gender $gender = null,
        public ?string $bio = null,
    ) {
    }

    public static function from(array $data): self
    {
        return new self(
            name: $data['name'],
            avatar_url: (isset($data['avatar_url']) && $data['avatar_url'] !== '') ? $data['avatar_url'] : null,
            dob: (isset($data['dob']) && $data['dob'] !== '') ? $data['dob'] : null,
            hometown: (isset($data['hometown']) && $data['hometown'] !== '') ? $data['hometown'] : null,
            gender: (isset($data['gender']) && $data['gender'] !== '') ? Gender::tryFrom((int) $data['gender']) : null,
            bio: (isset($data['bio']) && $data['bio'] !== '') ? $data['bio'] : null,
        );
    }
}
