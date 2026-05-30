<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegularEmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'id' => (string) Str::uuid(),
            'corporate_id' => 'ep-2026-001-05',
            'name' => 'regular employee demo',
            'email' => 'demoEmployee@vr.lms.com.ph',
            'password' => Hash::make('vr-employee-demo-1234'),
            'role' => 'employee',
            'department' => 'Engineering',
            'position' => 'Senior Developer',
            'phone' => '+63 912 345 6789',
            'join_date' => '2023-01-15',
            'status' => 'Active',
            'leave_balance' => 15,
            'attendance_stats' => ['lates' => 0, 'perfect_record' => true],
            'avatar' => 'https://ui-avatars.com/api/?name=Regular+Employee&background=4CAF50&color=fff'
        ]);
    }
}
