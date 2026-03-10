<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillItem extends Model
{
    protected $fillable = [
        'bill_id', 'item_type',
        'coin_id', 'coin_name', 'coin_price',
        'product_id', 'discount',
        'quantity', 'subtotal',
    ];
}
