<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function index()
    {
        return response()->json(Game::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'coin_price' => 'required|numeric|min:0',
        ]);

        $game = Game::create($validated);

        return response()->json($game, 201);
    }

    public function destroy(Game $game)
    {
        $game->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
