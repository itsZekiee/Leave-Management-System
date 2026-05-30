<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\LeaveManagementController;
use App\Http\Controllers\Api\V1\Admin\EmployeeDirectoryController;
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

            // Employee Directory
            Route::get('/employees', [EmployeeDirectoryController::class, 'index']);
            Route::post('/employees', [EmployeeDirectoryController::class, 'store']);
            Route::post('/employees/validate-import', [EmployeeDirectoryController::class, 'validateImport']);
            Route::post('/employees/batch-store', [EmployeeDirectoryController::class, 'batchStore']);
        });

        // Employee Routes (Role-based access should be handled in controller or additional middleware if needed)
        Route::prefix('employee')->group(function () {
            Route::get('/dashboard', function (Request $request) {
                // Return real-time stats for the logged-in employee
                $user = $request->user();
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'leave_balances' => [
                            'vacation' => 10,
                            'sick' => 5,
                            'emergency' => 2
                        ],
                        'history' => $user->leaveRequests()->latest()->take(5)->get(),
                        'alerts' => [
                            ['title' => 'Holiday Notice', 'body' => 'Independence Day is on June 12.', 'type' => 'info'],
                            ['title' => 'Policy Update', 'body' => 'New leave policy is now active.', 'type' => 'warning']
                        ]
                    ]
                ]);
            });
        });
    });
});
