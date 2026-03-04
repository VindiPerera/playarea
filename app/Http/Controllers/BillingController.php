<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BillingController extends Controller
{
    public function index()
    {
        return Bill::with('items')->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'items'               => 'required|array|min:1',
            'items.*.coin_id'     => 'nullable|integer',
            'items.*.coin_name'   => 'required|string',
            'items.*.coin_price'  => 'required|numeric|min:0',
            'items.*.quantity'    => 'required|integer|min:1',
            'payment_method'      => 'nullable|in:cash,card',
            'cash_amount'         => 'nullable|numeric|min:0',
            'customer_id'         => 'nullable|exists:customers,id',
        ]);

        // Generate a unique bill number: BILL-YYYYMMDD-XXXX
        $billNumber = 'BILL-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

        $total = collect($request->items)->sum(function ($item) {
            return $item['coin_price'] * $item['quantity'];
        });

        $bill = Bill::create([
            'bill_number'    => $billNumber,
            'customer_id'    => $request->customer_id,
            'total'          => $total,
            'status'         => 'paid',
            'payment_method' => $request->payment_method ?? 'cash',
            'cash_amount'    => $request->cash_amount,
        ]);

        foreach ($request->items as $item) {
            $bill->items()->create([
                'coin_id'    => $item['coin_id'] ?? null,
                'coin_name'  => $item['coin_name'],
                'coin_price' => $item['coin_price'],
                'quantity'   => $item['quantity'],
                'subtotal'   => $item['coin_price'] * $item['quantity'],
            ]);
        }

        return response()->json($bill->load(['items', 'customer']), 201);
    }

    public function show(Bill $bill)
    {
        return $bill->load(['items', 'customer']);
    }

    public function destroy(Bill $bill)
    {
        $bill->delete();
        return response()->json(null, 204);
    }
}
