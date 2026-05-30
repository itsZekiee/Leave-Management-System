<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'demoAdmin@vr.lms.com.ph'],
            [
                'id' => (string) Str::uuid(),
                'corporate_id' => 'ad-2026-001-01',
                'name' => 'admin demo',
                'password' => Hash::make('vr-admin-demo-1234'),
                'role' => 'admin',
                'department' => 'Management Console',
            ]
        );
    }
}
