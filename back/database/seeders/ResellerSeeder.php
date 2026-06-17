<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Reseller;
use Illuminate\Database\Seeder;

class ResellerSeeder extends Seeder
{
    public function run(): void
    {
        $resellers = [
            [
                'name' => 'Cycles & Co',
                'email' => 'contact@cycles-co.fr',
                'phone' => '01 23 45 67 89',
                'address' => '12 rue de la Paix, 75001 Paris',
                'website' => 'https://www.cycles-co.fr',
                'is_recommended' => true,
            ],
            [
                'name' => 'Sport Vélo Pro',
                'email' => 'info@sportvelo-pro.fr',
                'phone' => '04 56 78 90 12',
                'address' => '45 avenue Jean Jaurès, 69007 Lyon',
                'website' => 'https://www.sportvelo-pro.fr',
                'is_recommended' => true,
            ],
            [
                'name' => 'Roue Libre Distribution',
                'email' => 'vente@rouelibre.fr',
                'phone' => '05 34 12 78 56',
                'address' => '8 allée des Sports, 31000 Toulouse',
                'website' => null,
                'is_recommended' => false,
            ],
            [
                'name' => 'Michelin Partner Nantes',
                'email' => 'contact@michelin-partner-nantes.fr',
                'phone' => '02 40 55 66 77',
                'address' => '3 boulevard de la Beaujoire, 44300 Nantes',
                'website' => 'https://www.michelin-partner-nantes.fr',
                'is_recommended' => true,
            ],
            [
                'name' => 'Le Comptoir du Pneu',
                'email' => 'bonjour@comptoirpneu.fr',
                'phone' => '03 88 44 22 11',
                'address' => '27 rue du Marché, 67000 Strasbourg',
                'website' => null,
                'is_recommended' => false,
            ],
        ];

        $productIds = Product::pluck('id')->toArray();

        foreach ($resellers as $data) {
            $reseller = Reseller::updateOrCreate(['email' => $data['email']], $data);

            $assignedProducts = collect($productIds)->shuffle()->take(fake()->numberBetween(2, 4))->all();
            $reseller->products()->sync($assignedProducts);
        }
    }
}
