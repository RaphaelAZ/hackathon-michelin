<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('referral_code', 8)->nullable()->unique()->after('token_version');
            $table->foreignId('referred_by_id')
                ->nullable()
                ->nullOnDelete()
                ->after('referral_code')
                ->constrained('users');
        });

        // Generate unique referral codes for existing users.
        User::whereNull('referral_code')->each(function (User $user): void {
            do {
                $code = Str::upper(Str::random(8));
            } while (DB::table('users')->where('referral_code', $code)->exists());

            DB::table('users')->where('id', $user->id)->update(['referral_code' => $code]);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->string('referral_code', 8)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['referred_by_id']);
            $table->dropColumn(['referral_code', 'referred_by_id']);
        });
    }
};
