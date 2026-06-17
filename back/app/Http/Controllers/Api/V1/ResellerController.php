<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResellerResource;
use App\Models\Product;
use App\Models\Reseller;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ResellerController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return ResellerResource::collection(Reseller::with('products')->get());
    }

    public function show(Reseller $reseller): ResellerResource
    {
        return new ResellerResource($reseller->load('products'));
    }

    public function byProduct(string $slug): AnonymousResourceCollection
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        return ResellerResource::collection($product->resellers);
    }
}
