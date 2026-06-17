<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = User::factory(5)->create();
        $this->call(ProductSeeder::class);
        $this->call(ResellerSeeder::class);

        foreach ($users as $index => $user) {
            if ($index === 0 || ! fake()->boolean()) {
                continue;
            }

            $sponsor = $users->slice(0, $index)->random();
            $user->update(['referred_by_id' => $sponsor->id]);
        }
    }
}
