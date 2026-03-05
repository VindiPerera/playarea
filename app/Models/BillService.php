<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillService extends Model
{
    protected $fillable = [
        'bill_id',
        'service_id',
        'service_name',
        'base_price',
        'base_duration',
        'stage1_duration',
        'stage1_price',
        'stage2_duration',
        'stage2_price',
        'started_at',
        'ended_at',
        'subtotal',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at'   => 'datetime',
    ];

    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
