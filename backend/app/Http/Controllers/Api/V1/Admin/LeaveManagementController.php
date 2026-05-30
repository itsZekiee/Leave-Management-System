<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;

class LeaveManagementController extends Controller
{
    /**
     * Handles advanced server-side data fetching.
     */
    public function index(Request $request): JsonResponse
    {
        $query = LeaveRequest::with('user:id,name,department,corporate_id');

        // Filter by Category
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', strtolower($request->status));
        }

        // Filter by Keyword Search
        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('corporate_id', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by Date Range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('start_date', [$request->start_date, $request->end_date]);
        }

        // Sorting
        $query->orderBy('created_at', 'desc');

        $requests = $query->paginate($request->input('per_page', 10));

        // Aggregate analytics for the Leave Requests page
        $urgentCount = LeaveRequest::where('status', 'pending')
            ->whereDate('start_date', '<=', now()->addHours(48))
            ->count();

        $departmentalTrends = DB::table('leave_requests')
            ->join('users', 'leave_requests.user_id', '=', 'users.id')
            ->select('users.department', DB::raw('count(*) as count'))
            ->groupBy('users.department')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'requests' => $requests,
                'urgent_count' => $urgentCount,
                'departmental_trends' => $departmentalTrends
            ]
        ]);
    }

    /**
     * Batch update leave request status.
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:leave_requests,id',
            'target_status' => 'required|in:approved,declined,pending'
        ]);

        DB::transaction(function () use ($request) {
            LeaveRequest::whereIn('id', $request->ids)->update([
                'status' => $request->target_status,
                'processed_by' => $request->user()->id,
                'processed_at' => now(),
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => "Successfully updated " . count($request->ids) . " records to " . $request->target_status
        ]);
    }

    /**
     * Generates and streams a CSV download.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $query = LeaveRequest::with('user');

        if ($startDate && $endDate) {
            $query->whereBetween('start_date', [$startDate, $endDate]);
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="leave_requests_export.csv"',
        ];

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Employee Name', 'Corporate ID', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Status', 'Applied Date']);

            $query->chunk(100, function ($requests) use ($file) {
                foreach ($requests as $req) {
                    fputcsv($file, [
                        $req->user->name,
                        $req->user->corporate_id,
                        $req->user->department,
                        $req->type,
                        $req->start_date,
                        $req->end_date,
                        $req->status,
                        $req->created_at->format('Y-m-d'),
                    ]);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
