<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->timestamp('started_at')->nullable()->after('cash_amount');
            $table->decimal('entrance_base_price', 10, 2)->default(0)->after('started_at');
            $table->integer('entrance_base_duration')->default(0)->after('entrance_base_price');
            $table->decimal('entrance_stage1_price', 10, 2)->nullable()->after('entrance_base_duration');
            $table->integer('entrance_stage1_duration')->nullable()->after('entrance_stage1_price');
            $table->decimal('entrance_stage2_price', 10, 2)->nullable()->after('entrance_stage1_duration');
            $table->integer('entrance_stage2_duration')->nullable()->after('entrance_stage2_price');
        });
    }

    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn([
                'started_at',
                'entrance_base_price',
                'entrance_base_duration',
                'entrance_stage1_price',
                'entrance_stage1_duration',
                'entrance_stage2_price',
                'entrance_stage2_duration',
            ]);
        });
    }
};
