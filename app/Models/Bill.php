<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = ['bill_number', 'total', 'status', 'payment_method'];

    public function items()
    {
        return $this->hasMany(BillItem::class);
    }
}
