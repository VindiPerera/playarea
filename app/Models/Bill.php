<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = ['bill_number', 'customer_id', 'total', 'status', 'payment_method', 'cash_amount'];

    public function items()
    {
        return $this->hasMany(BillItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
