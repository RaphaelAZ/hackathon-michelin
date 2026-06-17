<?php

use App\Models\Product;
use App\Models\ProductComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('product detail payload includes comments and ratings', function (): void {
    $product = Product::factory()->create();
    $user = User::factory()->create();

    ProductComment::create([
        'product_id' => $product->id,
        'user_id' => $user->id,
        'rating' => 4,
        'comment' => 'Bon grip et bonne tenue sur route humide.',
    ]);

    $response = $this->getJson("/api/v1/products/{$product->slug}");

    $response->assertOk();
    $response->assertJsonPath('data.comments_count', 1);
    $response->assertJsonPath('data.average_rating', 4);
    $response->assertJsonPath('data.comments.0.author_name', $user->name);
});

test('authenticated users can create a product comment', function (): void {
    $product = Product::factory()->create();
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'api')->postJson("/api/v1/products/{$product->slug}/comments", [
        'rating' => 5,
        'comment' => 'Excellent pneu, très confortable.',
    ]);

    $response->assertCreated();
    $response->assertJsonPath('data.rating', 5);
    $response->assertJsonPath('data.author_name', $user->name);

    $this->assertDatabaseHas('product_comments', [
        'product_id' => $product->id,
        'user_id' => $user->id,
        'rating' => 5,
        'comment' => 'Excellent pneu, très confortable.',
    ]);
});
