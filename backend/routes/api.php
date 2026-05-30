<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\LeaveManagementController;
use App\Http\Middleware\EnsureUserIsAdmin;

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/auth/login', [LoginController::class, 'login']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // Admin Routes
        Route::middleware(EnsureUserIsAdmin::class)->prefix('admin')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index']);
            Route::patch('/leave-requests/{id}/status', [DashboardController::class, 'updateStatus']);

            // Leave Management
            Route::get('/leave-requests', [LeaveManagementController::class, 'index']);
            Route::post('/leave-requests/bulk-update', [LeaveManagementController::class, 'bulkUpdate']);
            Route::get('/leave-requests/export', [LeaveManagementController::class, 'exportCsv']);
        });
    });
});
