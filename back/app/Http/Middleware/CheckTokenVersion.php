<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;

class CheckTokenVersion
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $payload = JWTAuth::parseToken()->getPayload();

        /** @var User $user */
        $user = auth('api')->user();

        if ($payload->get('version') !== $user->token_version) {
            return response()->json(['message' => 'Token has been revoked'], 401);
        }

        return $next($request);
    }
}
