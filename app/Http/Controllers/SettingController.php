<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $request->validate([
            'entrance_base_price'     => 'required|numeric|min:0',
            'entrance_base_duration'  => 'required|integer|min:1',
            'entrance_stage1_price'   => 'nullable|numeric|min:0',
            'entrance_stage1_duration'=> 'nullable|integer|min:1',
            'entrance_above10_price'  => 'nullable|numeric|min:0',
        ]);

        $keys = [
            'entrance_base_price',
            'entrance_base_duration',
            'entrance_stage1_price',
            'entrance_stage1_duration',
            'entrance_above10_price',
        ];

        foreach ($keys as $key) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $request->$key ?? null]
            );
        }

        return response()->json(['message' => 'Settings updated successfully.']);
    }
}
