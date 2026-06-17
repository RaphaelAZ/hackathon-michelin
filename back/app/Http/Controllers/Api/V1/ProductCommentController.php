<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCommentResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductCommentController extends Controller
{
    public function store(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $product = Product::where('slug', $slug)->firstOrFail();

        $comment = $product->comments()->create([
            'user_id' => $request->user('api')->id,
            'rating' => $data['rating'],
            'comment' => $data['comment'],
        ]);

        $comment->load('user');

        return (new ProductCommentResource($comment))
            ->response()
            ->setStatusCode(201);
    }
}
