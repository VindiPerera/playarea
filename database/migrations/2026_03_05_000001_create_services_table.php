<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('base_price', 10, 2);
            $table->integer('base_duration');          // in minutes
            $table->integer('stage1_duration')->nullable();   // in minutes
            $table->decimal('stage1_price', 10, 2)->nullable();
            $table->integer('stage2_duration')->nullable();   // in minutes
            $table->decimal('stage2_price', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
