<?php

namespace App\Domains\LeaveManagement\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\LeaveManagement\Services\LeaveManagementService;
use App\Domains\LeaveManagement\DTOs\LeaveApplicationDTO;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LeaveController extends Controller
{
    protected $leaveService;

    public function __construct(LeaveManagementService $leaveService)
    {
        $this->leaveService = $leaveService;
    }

    /**
     * Store a newly created leave application.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        $userId = $request->get('user_id'); // From Firebase Middleware
        $dto = LeaveApplicationDTO::fromRequest($request->all(), $userId);

        try {
            $result = $this->leaveService->applyForLeave($dto);
            return response()->json([
                'status' => 'success',
                'message' => 'Leave application submitted successfully',
                'data' => $result
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Display the user's leave history.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->get('user_id');
        $history = $this->leaveService->getUserLeaveHistory($userId);

        return response()->json([
            'status' => 'success',
            'data' => $history
        ]);
    }
}
