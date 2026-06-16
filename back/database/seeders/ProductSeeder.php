<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $products = [
            [
                'slug' => 'power-road-28',
                'name' => 'Power Road',
                'short_description' => 'Pneu route haute performance pour cyclistes exigeants.',
                'description' => 'Le Power Road offre une adhérence exceptionnelle sur asphalte sec ou humide. Sa bande de roulement optimisée réduit la résistance au roulement tout en garantissant une tenue de route remarquable dans les virages.',
                'price' => 54.99,
                'category' => 'route',
                'size' => '700 x 28c',
                'image_url' => 'assets/images/tire-route.svg',
                'in_stock' => true,
                'badge' => 'Best-seller',
                'features' => ['Faible résistance au roulement', 'Grip optimal par temps humide', 'Protection anti-crevaison'],
            ],
            [
                'slug' => 'protek-city-32',
                'name' => 'Protek City',
                'short_description' => 'Confort et durabilité pour vos trajets quotidiens en ville.',
                'description' => 'Conçu pour les cyclistes urbains, le Protek City combine confort, robustesse et protection renforcée. Sa structure résistante aux débris urbains vous accompagne au quotidien en toute sérénité.',
                'price' => 39.99,
                'category' => 'ville',
                'size' => '700 x 32c',
                'image_url' => 'assets/images/tire-ville.svg',
                'in_stock' => true,
                'badge' => null,
                'features' => ['Protection anti-crevaison renforcée', 'Confort accru', 'Longue durée de vie'],
            ],
            [
                'slug' => 'wild-racer-gravel-40',
                'name' => 'Wild Racer Gravel',
                'short_description' => 'Polyvalence gravel pour routes et chemins.',
                'description' => 'Le Wild Racer Gravel excelle sur tous les terrains mixtes. Son profil agressif assure une excellente traction sur gravier, terre et asphalte, pour explorer sans limites.',
                'price' => 49.99,
                'category' => 'gravel',
                'size' => '700 x 40c',
                'image_url' => 'assets/images/tire-gravel.svg',
                'in_stock' => true,
                'badge' => 'Nouveau',
                'features' => ['Traction multi-terrains', 'Structure renforcée', 'Tubeless Ready'],
            ],
            [
                'slug' => 'country-rock-29',
                'name' => 'Country Rock',
                'short_description' => 'Pneu VTT tout-terrain pour sentiers techniques.',
                'description' => 'Le Country Rock est le compagnon idéal des sentiers exigeants. Ses crampons profonds offrent une adhérence maximale sur roche, boue et racines.',
                'price' => 44.99,
                'category' => 'vtt',
                'size' => '29 x 2.25',
                'image_url' => 'assets/images/tire-vtt.svg',
                'in_stock' => true,
                'badge' => null,
                'features' => ['Crampons profonds', 'Résistance aux impacts', 'Tubeless Ready'],
            ],
            [
                'slug' => 'power-cup-comp-25',
                'name' => 'Power Cup Competition',
                'short_description' => 'Pneu compétition ultra-léger pour la performance pure.',
                'description' => 'Développé avec les athlètes professionnels, le Power Cup Competition maximise la vitesse et la précision en course. Chaque gramme compte.',
                'price' => 69.99,
                'category' => 'competition',
                'size' => '700 x 25c',
                'image_url' => 'assets/images/tire-competition.svg',
                'in_stock' => true,
                'badge' => 'Pro',
                'features' => ['Ultra-léger', 'Grip maximal en virage', 'Technologie Gum-X'],
            ],
            [
                'slug' => 'dynamic-sport-30',
                'name' => 'Dynamic Sport',
                'short_description' => 'Excellent rapport qualité-prix pour le cyclisme loisir.',
                'description' => 'Le Dynamic Sport est le choix parfait pour les cyclistes loisir. Fiable, confortable et abordable, il couvre tous vos besoins du week-end.',
                'price' => 29.99,
                'category' => 'route',
                'size' => '700 x 30c',
                'image_url' => 'assets/images/tire-route.svg',
                'in_stock' => false,
                'badge' => null,
                'features' => ['Excellent rapport qualité-prix', 'Confortable', 'Facile à monter'],
            ],
        ];

        foreach ($products as $data) {
            $features = $data['features'];
            unset($data['features']);

            $product = Product::updateOrCreate(['slug' => $data['slug']], $data);
            $product->features()->delete();

            foreach ($features as $feature) {
                $product->features()->create(['name' => $feature]);
            }
        }
    }
}
