<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Return aggregate analytics metrics for the Admin Dashboard.
     */
    public function index(): JsonResponse
    {
        // Simulated metrics based on Dashboard.png requirements
        $metrics = [
            'stats' => [
                'pending_approvals' => 12,
                'on_leave_today' => 5,
                'total_employees' => 48,
                'policy_alerts' => 2,
            ],
            'department_distribution' => [
                ['name' => 'IT', 'count' => 15],
                ['name' => 'HR', 'count' => 8],
                ['name' => 'Finance', 'count' => 10],
                ['name' => 'Operations', 'count' => 15],
            ],
            'recent_requests' => [
                [
                    'id' => 'l-001',
                    'employee' => 'John Doe',
                    'type' => 'Vacation',
                    'start_date' => '2026-06-01',
                    'end_date' => '2026-06-05',
                    'status' => 'pending',
                ],
                [
                    'id' => 'l-002',
                    'employee' => 'Jane Smith',
                    'type' => 'Sick Leave',
                    'start_date' => '2026-05-30',
                    'end_date' => '2026-05-30',
                    'status' => 'approved',
                ],
            ]
        ];

        return response()->json([
            'status' => 'success',
            'data' => $metrics
        ]);
    }
}
