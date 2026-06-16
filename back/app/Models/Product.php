<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $with = ['features'];

    protected $fillable = [
        'slug',
        'name',
        'short_description',
        'description',
        'price',
        'category',
        'size',
        'image_url',
        'in_stock',
        'badge',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'in_stock' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function features(): HasMany
    {
        return $this->hasMany(ProductFeature::class);
    }
}
