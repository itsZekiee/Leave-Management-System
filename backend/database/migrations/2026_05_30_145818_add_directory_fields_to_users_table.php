<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar')->nullable()->after('name');
            $table->date('join_date')->nullable()->after('department');
            $table->string('position')->nullable()->after('name');
            $table->json('attendance_stats')->nullable(); // e.g. {"lates": 2, "perfect_record": false}
            $table->integer('leave_balance')->default(15);
            $table->string('status')->default('Active'); // Active, On Leave, Inactive
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'avatar',
                'join_date',
                'position',
                'attendance_stats',
                'leave_balance',
                'status'
            ]);
        });
    }
};
