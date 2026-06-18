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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('posts_count')->default(0)->after('status');
            $table->unsignedInteger('total_likes')->default(0)->after('posts_count');
        });

        // Recalculate and populate initial values for existing users
        $users = \Illuminate\Support\Facades\DB::table('users')->get();
        foreach ($users as $user) {
            $postsCount = \Illuminate\Support\Facades\DB::table('posts')
                ->where('user_id', $user->id)
                ->count();

            $totalLikes = \Illuminate\Support\Facades\DB::table('post_likes')
                ->join('posts', 'post_likes.post_id', '=', 'posts.id')
                ->where('posts.user_id', $user->id)
                ->count();

            \Illuminate\Support\Facades\DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'posts_count' => $postsCount,
                    'total_likes' => $totalLikes,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['posts_count', 'total_likes']);
        });
    }
};
