<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resellers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('address');
            $table->string('website')->nullable();
            $table->boolean('is_recommended')->default(false);
            $table->timestamps();
        });

        Schema::create('product_reseller', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reseller_id')->constrained()->cascadeOnDelete();
            $table->primary(['product_id', 'reseller_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reseller');
        Schema::dropIfExists('resellers');
    }
};
