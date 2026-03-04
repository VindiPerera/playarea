<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillItem extends Model
{
    protected $fillable = ['bill_id', 'coin_id', 'coin_name', 'coin_price', 'quantity', 'subtotal'];
}
