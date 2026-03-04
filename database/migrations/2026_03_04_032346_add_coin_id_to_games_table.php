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
        Schema::table('games', function (Blueprint $table) {
            // Add coin_id foreign key
            $table->foreignId('coin_id')->nullable()->after('name')->constrained()->onDelete('restrict');
            
            // Remove coin_price column
            $table->dropColumn('coin_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            // Restore coin_price column
            $table->decimal('coin_price', 10, 2)->nullable()->after('name');
            
            // Remove coin_id foreign key
            $table->dropForeign(['coin_id']);
            $table->dropColumn('coin_id');
        });
    }
};
