<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Generative AI',
                'description' => 'Discussions and tutorials about text, image, video and audio generation models.',
            ],
            [
                'name' => 'Prompts Engineering',
                'description' => 'Best practices, templates, and methods for writing effective AI prompts.',
            ],
            [
                'name' => 'AI Coding Agents',
                'description' => 'Development workflows using AI coding assistants like Cursor, Copilot, and custom agents.',
            ],
            [
                'name' => 'Natural Language Processing',
                'description' => 'Core NLP concepts, LLM training, fine-tuning, and RAG architectures.',
            ],
            [
                'name' => 'Computer Vision',
                'description' => 'Image processing, object detection, segmentation and visual models discussion.',
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate([
                'slug' => Str::slug($category['name']),
            ], [
                'name' => $category['name'],
                'description' => $category['description'],
            ]);
        }
    }
}
