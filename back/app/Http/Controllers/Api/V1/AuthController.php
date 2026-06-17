<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $accessToken = auth('api')->login($user);

        return $this->tokenResponse($accessToken);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $accessToken = auth('api')->attempt($credentials);

        if (! $accessToken) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return $this->tokenResponse($accessToken);
    }

    public function logout(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();
        $user->increment('token_version');
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function refresh(): JsonResponse
    {
        try {
            $payload = JWTAuth::parseToken()->getPayload();
        } catch (\Exception) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        if ($payload->get('type') !== 'refresh') {
            return response()->json(['message' => 'A refresh token is required'], 401);
        }

        /** @var User $user */
        $user = User::findOrFail($payload->get('sub'));
        $user->increment('token_version');
        $accessToken = auth('api')->login($user);

        return response()->json([
            'access_token' => $accessToken,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json(auth('api')->user());
    }

    private function tokenResponse(string $accessToken): JsonResponse
    {
        /** @var Authenticatable $user */
        $user = auth('api')->user();

        return response()->json([
            'access_token' => $accessToken,
            'refresh_token' => $this->generateRefreshToken($user),
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }

    private function generateRefreshToken(Authenticatable $user): string
    {
        $factory = JWTAuth::factory();
        $ttl = $factory->getTTL();

        $factory->setTTL(config('jwt.refresh_ttl'));
        $refreshToken = JWTAuth::customClaims(['type' => 'refresh'])->fromUser($user);
        $factory->setTTL($ttl);

        return $refreshToken;
    }
}
