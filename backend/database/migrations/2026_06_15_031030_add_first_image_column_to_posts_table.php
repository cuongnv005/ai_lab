<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('first_image')->nullable()->after('summary');
        });

        // Recalculate and populate values for existing posts
        $posts = \Illuminate\Support\Facades\DB::table('posts')->get();
        foreach ($posts as $post) {
            $firstImage = null;
            $content = $post->content;

            // 1. BBCode
            if (preg_match('/\[img\](.*?)\[\/img\]/is', $content, $matches)) {
                $firstImage = trim($matches[1]);
            }
            // 2. HTML img
            elseif (preg_match('/<img[^>]+src=["\'](.*?)["\']/is', $content, $matches)) {
                $firstImage = trim($matches[1]);
            }
            // 3. Markdown
            elseif (preg_match('/!\[.*?\]\((.*?)\)/is', $content, $matches)) {
                $firstImage = trim($matches[1]);
            }

            // Always regenerate summary to clean up image URLs and handle preview/prebreak tags
            $cleanContent = $content;
            // Remove BBCode image tags including their content
            $cleanContent = preg_replace('/\[img\].*?\[\/img\]/is', '', $cleanContent);
            // Remove HTML image tags
            $cleanContent = preg_replace('/<img[^>]*>/is', '', $cleanContent);
            // Remove Markdown image tags
            $cleanContent = preg_replace('/!\[.*?\]\(.*?\)/is', '', $cleanContent);

            // Split by preview / prebreak tags to get only the preview part if present
            $parts = preg_split('/\[\/?(?:preview|prebreak|prebeak)\]/i', $cleanContent);
            if ($parts && count($parts) > 0) {
                $cleanContent = $parts[0];
            }

            // Remove other BBCode tags (only the tags, keeping text)
            $cleanContent = preg_replace('/\[.*?\]/is', '', $cleanContent);

            $cleanContent = trim(preg_replace('/\s+/', ' ', $cleanContent));
            $summary = mb_substr($cleanContent, 0, 180);
            if (mb_strlen($cleanContent) > 180) {
                $summary .= '...';
            }

            \Illuminate\Support\Facades\DB::table('posts')
                ->where('id', $post->id)
                ->update([
                    'first_image' => $firstImage,
                    'summary' => $summary ?: null,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('first_image');
        });
    }
};
