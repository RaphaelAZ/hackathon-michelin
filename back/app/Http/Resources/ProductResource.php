<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => $this->price,
            'category' => $this->category,
            'size' => $this->size,
            'image_url' => $this->image_url,
            'image_urls' => $this->images
                ->pluck('url')
                ->whenEmpty(fn ($images) => $images->push($this->image_url))
                ->values(),
            'in_stock' => $this->in_stock,
            'badge' => $this->badge,
            'features' => $this->features->pluck('name'),
            'average_rating' => $this->whenLoaded('comments', fn () => round((float) $this->comments->avg('rating'), 1)),
            'comments_count' => $this->whenLoaded('comments', fn () => $this->comments->count()),
            'comments' => ProductCommentResource::collection($this->whenLoaded('comments')),
        ];
    }
}
