<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            'ChatGPT',
            'Midjourney',
            'Claude',
            'Cursor',
            'Laravel',
            'NextJS',
            'Stable Diffusion',
            'LLM',
            'Fine-Tuning',
            'RAG',
        ];

        foreach ($tags as $tagName) {
            Tag::firstOrCreate([
                'slug' => Str::slug($tagName),
            ], [
                'name' => $tagName,
            ]);
        }
    }
}
