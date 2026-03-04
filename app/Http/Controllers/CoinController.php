<?php

namespace App\Http\Controllers;

use App\Models\Coin;
use Illuminate\Http\Request;

class CoinController extends Controller
{
    public function index()
    {
        return response()->json(Coin::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $coin = Coin::create($validated);

        return response()->json($coin, 201);
    }

    public function destroy(Coin $coin)
    {
        $coin->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
