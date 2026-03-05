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
            'entrance_fee' => 'required|numeric|min:0',
        ]);

        Setting::updateOrCreate(
            ['key' => 'entrance_fee'],
            ['value' => $request->entrance_fee]
        );

        return response()->json(['message' => 'Settings updated successfully.']);
    }
}
