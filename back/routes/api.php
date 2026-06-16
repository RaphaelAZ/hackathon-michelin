<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\OpenApiController;
use Illuminate\Support\Facades\Route;

Route::get('/openapi.json', [OpenApiController::class, 'spec']);

Route::prefix('v1')->group(function (): void {
    Route::get('/health', fn () => response()->json(['status' => 'ok']));

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    Route::prefix('auth')->group(function (): void {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/refresh', [AuthController::class, 'refresh']);

        Route::middleware(['auth:api', 'token.version'])->group(function (): void {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });
    });
});
