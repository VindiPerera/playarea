<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->decimal('entrance_fee', 10, 2)->default(0)->after('customer_id');
        });

        // Update status enum: change from pending|paid to open|closed
        // We'll use string instead of enum for flexibility
        Schema::table('bills', function (Blueprint $table) {
            $table->string('status')->default('open')->change();
        });
    }

    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn('entrance_fee');
        });
    }
};
