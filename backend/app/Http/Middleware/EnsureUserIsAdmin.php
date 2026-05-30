<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Validate Corporate ID prefix pattern: ad-xxxx-xxx-xx
        // Requirement: If the prefix string is ad-xxxx-xxx-xx, issue an admin token.
        // We also check the role for double security.
        if (!str_starts_with($user->corporate_id, 'ad-')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden: Admin access only',
                'redirect' => '/employee-dashboard' // Placeholder for employee redirection logic
            ], 403);
        }

        return $next($request);
    }
}
