<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Handle a stateless login request.
     */
    public function login(Request $request)
    {
        $request->validate([
            'login_id' => 'required|string',
            'password' => 'required',
        ]);

        $user = User::where(function($query) use ($request) {
            $query->where('corporate_id', $request->login_id)
                  ->orWhere('email', $request->login_id);
        })->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'login_id' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Role-Based Validation via Corporate ID Prefix
        $isAdmin = str_starts_with($user->corporate_id, 'ad-');
        $isEmployee = str_starts_with($user->corporate_id, 'ep-');

        if (!$isAdmin && !$isEmployee) {
            return response()->json([
                'message' => 'Invalid corporate ID format.'
            ], 403);
        }

        // Issue Sanctum Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'corporate_id' => $user->corporate_id,
                'role' => $isAdmin ? 'admin' : 'employee',
                'department' => $user->department,
            ],
            'redirect' => $isAdmin ? '/admin/dashboard' : '/employee/dashboard'
        ]);
    }

    /**
     * Handle logout.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
}
