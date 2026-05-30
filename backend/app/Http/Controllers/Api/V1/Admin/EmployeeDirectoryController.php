<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmployeeDirectoryController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('corporate_id', 'like', "%{$search}%");
            });
        }

        if ($request->has('department') && $request->department !== 'All Departments') {
            $query->where('department', $request->department);
        }

        if ($request->has('role') && $request->role !== 'All Roles') {
            $query->where('role', $request->role);
        }

        $employees = $query->latest()->paginate(10);

        // Calculate summary stats
        $totalWorkforce = User::count();
        $avgLeaveBalance = User::avg('leave_balance') ?? 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'employees' => $employees,
                'stats' => [
                    'total_workforce' => $totalWorkforce,
                    'punctuality_rate' => 94.2, // Simulated
                    'avg_leave_balance' => round($avgLeaveBalance, 1)
                ]
            ]
        ]);
    }

    public function validateImport(Request $request)
    {
        $rows = $request->input('rows', []);
        $cleanRows = [];
        $corruptRows = [];

        foreach ($rows as $index => $row) {
            $errors = [];

            // Required fields
            if (empty($row['name'])) $errors[] = "Name is required.";
            if (empty($row['email'])) $errors[] = "Email is required.";
            if (empty($row['corporate_id'])) $errors[] = "Corporate ID is required.";

            // Format validations
            if (!empty($row['email']) && !filter_var($row['email'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Invalid email format.";
            }

            // Duplicate checks
            if (!empty($row['email']) && User::where('email', $row['email'])->exists()) {
                $errors[] = "Email already exists in database.";
            }
            if (!empty($row['corporate_id']) && User::where('corporate_id', $row['corporate_id'])->exists()) {
                $errors[] = "Corporate ID already exists in database.";
            }

            if (empty($errors)) {
                $cleanRows[] = $row;
            } else {
                $row['errors'] = $errors;
                $corruptRows[] = $row;
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'clean_rows' => $cleanRows,
                'corrupt_rows' => $corruptRows
            ]
        ]);
    }

    public function batchStore(Request $request)
    {
        $employees = $request->input('employees', []);

        DB::beginTransaction();
        try {
            foreach ($employees as $emp) {
                User::create([
                    'id' => (string) Str::uuid(),
                    'corporate_id' => $emp['corporate_id'],
                    'name' => $emp['name'],
                    'email' => $emp['email'],
                    'password' => Hash::make($emp['password'] ?? 'welcome123'),
                    'role' => $emp['role'] ?? 'employee',
                    'department' => $emp['department'] ?? 'General',
                    'position' => $emp['position'] ?? 'Staff',
                    'phone' => $emp['phone'] ?? null,
                    'join_date' => $emp['join_date'] ?? now(),
                    'status' => 'Active',
                    'leave_balance' => 15,
                    'attendance_stats' => ['lates' => 0, 'perfect_record' => true]
                ]);
            }
            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'Employees imported successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'corporate_id' => 'required|string|unique:users',
            'department' => 'required|string',
            'role' => 'required|string',
            'position' => 'nullable|string',
            'phone' => 'nullable|string',
            'join_date' => 'nullable|date',
        ]);

        $user = User::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'corporate_id' => $validated['corporate_id'],
            'password' => Hash::make('password123'),
            'department' => $validated['department'],
            'role' => $validated['role'],
            'position' => $validated['position'] ?? 'Staff',
            'phone' => $validated['phone'] ?? null,
            'join_date' => $validated['join_date'] ?? now(),
            'status' => 'Active',
            'leave_balance' => 15,
            'attendance_stats' => ['lates' => 0, 'perfect_record' => true]
        ]);

        return response()->json(['status' => 'success', 'data' => $user]);
    }
}
