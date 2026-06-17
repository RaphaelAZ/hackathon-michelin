<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['route', 'ville', 'gravel', 'vtt', 'competition'];
        $name = fake()->words(2, true);

        return [
            'slug' => Str::slug($name).'-'.fake()->numberBetween(20, 50),
            'name' => ucwords($name),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 19.99, 89.99),
            'category' => fake()->randomElement($categories),
            'size' => fake()->randomElement(['700 x 25c', '700 x 28c', '700 x 32c', '700 x 40c', '29 x 2.25']),
            'image_url' => 'assets/images/tire-route.svg',
            'in_stock' => fake()->boolean(80),
            'badge' => fake()->optional(0.3)->randomElement(['Nouveau', 'Best-seller', 'Pro']),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Product $product) {
            $featurePool = ['Anti-crevaison', 'Tubeless Ready', 'Ultra-léger', 'Grip optimal', 'Longue durée de vie'];

            foreach (fake()->randomElements($featurePool, fake()->numberBetween(2, 4)) as $feature) {
                $product->features()->create(['name' => $feature]);
            }
        });
    }
}
