<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'cost_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'discount'   => 'nullable|numeric|min:0|max:100',
        ]);

        $validated['discount'] = $validated['discount'] ?? 0;

        return response()->json(Product::create($validated), 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'cost_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'discount'   => 'nullable|numeric|min:0|max:100',
        ]);

        $validated['discount'] = $validated['discount'] ?? 0;
        $product->update($validated);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
