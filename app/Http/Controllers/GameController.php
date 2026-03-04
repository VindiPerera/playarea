<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function index()
    {
        return response()->json(Game::with('coin')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'coin_id' => 'required|exists:coins,id',
        ]);

        $game = Game::create($validated);
        $game->load('coin');

        return response()->json($game, 201);
    }

    public function update(Request $request, Game $game)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'coin_id' => 'required|exists:coins,id',
        ]);

        $game->update($validated);
        $game->load('coin');

        return response()->json($game);
    }

    public function destroy(Game $game)
    {
        $game->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
