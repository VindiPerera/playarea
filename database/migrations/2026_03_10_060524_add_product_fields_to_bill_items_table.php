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
        Schema::table('bill_items', function (Blueprint $table) {
            $table->string('item_type')->default('coin')->after('bill_id'); // 'coin' or 'product'
            $table->unsignedBigInteger('product_id')->nullable()->after('coin_id');
            $table->decimal('discount', 5, 2)->nullable()->after('coin_price'); // discount % applied
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bill_items', function (Blueprint $table) {
            $table->dropColumn(['item_type', 'product_id', 'discount']);
        });
    }
};
