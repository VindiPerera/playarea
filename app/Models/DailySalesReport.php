<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DailySalesReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'report_date',
        'coin_count',
        'coin_price',
        'total_revenue'
    ];

    protected $casts = [
        'report_date' => 'date',
        'coin_count' => 'integer',
        'coin_price' => 'decimal:2',
        'total_revenue' => 'decimal:2'
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
