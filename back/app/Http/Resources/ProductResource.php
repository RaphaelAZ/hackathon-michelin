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
            'in_stock' => $this->in_stock,
            'badge' => $this->badge,
            'features' => $this->features->pluck('name'),
        ];
    }
}
