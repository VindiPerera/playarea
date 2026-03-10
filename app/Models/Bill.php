<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = [
        'bill_number', 'customer_id', 'entrance_fee',
        'total', 'status', 'payment_method', 'cash_amount',
        'started_at',
        'people_standard', 'people_above10',
        'entrance_base_price', 'entrance_base_duration',
        'entrance_stage1_price', 'entrance_stage1_duration',
        'entrance_stage2_price', 'entrance_stage2_duration',
        'entrance_above10_price',
    ];

    protected $casts = [
        'started_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(BillItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
