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
        Schema::table('bills', function (Blueprint $table) {
            // Number of standard-age and above-10 people on this bill
            $table->unsignedSmallInteger('people_standard')->default(1)->after('customer_id');
            $table->unsignedSmallInteger('people_above10')->default(0)->after('people_standard');
            // Snapshot of above-10 flat entrance fee at bill open time
            $table->decimal('entrance_above10_price', 10, 2)->nullable()->after('entrance_stage2_duration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn(['people_standard', 'people_above10', 'entrance_above10_price']);
        });
    }
};
