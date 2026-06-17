<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ReferralController extends Controller
{
    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $sponsoredUsers = $user->sponsoredUsers()
            ->select(['name', 'email', 'created_at'])
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'referral_code' => $user->referral_code,
            'sponsored_users' => $sponsoredUsers,
        ]);
    }
}
