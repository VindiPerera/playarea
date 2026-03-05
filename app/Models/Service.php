<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'base_price',
        'base_duration',
        'stage1_duration',
        'stage1_price',
        'stage2_duration',
        'stage2_price',
    ];
}
