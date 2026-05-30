<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get real-time dashboard analytics and lists.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LeaveRequest::with('user:id,name,department,corporate_id');

        // Dynamic Filtering
        if ($request->filled('department')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('department', $request->department);
            });
        }

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('corporate_id', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('start_date', '<=', $request->date)
                  ->whereDate('end_date', '>=', $request->date);
        }

        $recentApplications = $query->orderBy('created_at', 'desc')->paginate(10);

        // KPI Metrics
        $stats = [
            'pending_approvals' => LeaveRequest::where('status', 'pending')->count(),
            'on_leave_today' => LeaveRequest::where('status', 'approved')
                ->whereDate('start_date', '<=', now())
                ->whereDate('end_date', '>=', now())
                ->count(),
            'upcoming_next_week' => LeaveRequest::where('status', 'approved')
                ->whereDate('start_date', '>', now())
                ->whereDate('start_date', '<=', now()->addDays(7))
                ->count(),
            'total_capacity' => 94, // Simplified for this sprint
        ];

        // Chart Data: Leave Distribution by Department
        $distribution = User::select('department as name', DB::raw('count(*) as count'))
            ->whereHas('leaveRequests', function ($q) {
                $q->where('status', 'approved')
                  ->whereDate('start_date', '<=', now())
                  ->whereDate('end_date', '>=', now());
            })
            ->groupBy('department')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => $stats,
                'applications' => $recentApplications,
                'department_distribution' => $distribution,
                'notifications' => $this->getPendingNotifications(),
            ]
        ]);
    }

    /**
     * Update leave request status (Approve/Decline).
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,declined',
        ]);

        $leaveRequest = LeaveRequest::findOrFail($id);

        $leaveRequest->update([
            'status' => $request->status,
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Request " . ucfirst($request->status) . " successfully.",
            'data' => $leaveRequest->load('user:id,name,department'),
        ]);
    }

    private function calculatePolicyAlerts()
    {
        return LeaveRequest::where('status', 'pending')
            ->join('users', 'leave_requests.user_id', '=', 'users.id')
            ->select('users.department')
            ->groupBy('users.department')
            ->havingRaw('COUNT(*) > 3')
            ->get()
            ->count();
    }

    private function getPendingNotifications()
    {
        return LeaveRequest::with('user:id,name')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'user_name' => $item->user->name,
                    'type' => $item->type,
                    'created_at' => $item->created_at->diffForHumans(),
                ];
            });
    }
}
