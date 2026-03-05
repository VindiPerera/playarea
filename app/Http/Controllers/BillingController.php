<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BillingController extends Controller
{
    public function index()
    {
        return Bill::with(['items', 'customer'])->latest()->get();
    }

    /**
     * Get all currently open bills.
     */
    public function openBills()
    {
        return Bill::with(['items', 'customer'])
            ->where('status', 'open')
            ->latest()
            ->get();
    }

    /**
     * Open a new bill for a customer. Timer starts now.
     */
    public function openBill(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        // Snapshot entrance fee tier pricing from settings
        $settings = Setting::all()->pluck('value', 'key');
        $basePrice     = floatval($settings['entrance_base_price'] ?? 0);
        $baseDuration  = intval($settings['entrance_base_duration'] ?? 0);
        $stage1Price   = $settings['entrance_stage1_price'] ?? null;
        $stage1Dur     = $settings['entrance_stage1_duration'] ?? null;
        $stage2Price   = $settings['entrance_stage2_price'] ?? null;
        $stage2Dur     = $settings['entrance_stage2_duration'] ?? null;

        $billNumber = 'BILL-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

        $bill = Bill::create([
            'bill_number'             => $billNumber,
            'customer_id'             => $request->customer_id,
            'entrance_fee'            => $basePrice,
            'total'                   => 0,
            'status'                  => 'open',
            'payment_method'          => null,
            'cash_amount'             => null,
            'started_at'              => now(),
            'entrance_base_price'     => $basePrice,
            'entrance_base_duration'  => $baseDuration,
            'entrance_stage1_price'   => $stage1Price,
            'entrance_stage1_duration'=> $stage1Dur,
            'entrance_stage2_price'   => $stage2Price,
            'entrance_stage2_duration'=> $stage2Dur,
        ]);

        $this->recalculateTotal($bill);

        return response()->json($bill->load(['items', 'customer']), 201);
    }

    /**
     * Add coin items to an open bill (and return bill for coin receipt).
     */
    public function addCoins(Request $request, Bill $bill)
    {
        if ($bill->status !== 'open') {
            return response()->json(['message' => 'Bill is already closed.'], 422);
        }

        $request->validate([
            'items'              => 'required|array|min:1',
            'items.*.coin_id'    => 'nullable|integer',
            'items.*.coin_name'  => 'required|string',
            'items.*.coin_price' => 'required|numeric|min:0',
            'items.*.quantity'   => 'required|integer|min:1',
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

        $this->recalculateTotal($bill);

        return response()->json($bill->load(['items', 'customer']));
    }

    /**
     * Close/finalize a bill. Calculate entrance fee based on elapsed time.
     */
    public function closeBill(Request $request, Bill $bill)
    {
        if ($bill->status !== 'open') {
            return response()->json(['message' => 'Bill is already closed.'], 422);
        }

        $request->validate([
            'payment_method' => 'required|in:cash,card',
            'cash_amount'    => 'nullable|numeric|min:0',
        ]);

        // Calculate entrance fee based on elapsed time
        $bill->entrance_fee = $this->calculateEntranceFee($bill);
        $bill->save();

        $this->recalculateTotal($bill);

        $bill->update([
            'status'         => 'closed',
            'payment_method' => $request->payment_method,
            'cash_amount'    => $request->payment_method === 'cash' ? $request->cash_amount : null,
        ]);

        return response()->json($bill->load(['items', 'customer']));
    }

    /**
     * Original store method kept for backward compatibility (coin-only purchase).
     */
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

        $billNumber = 'BILL-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

        $total = collect($request->items)->sum(function ($item) {
            return $item['coin_price'] * $item['quantity'];
        });

        $bill = Bill::create([
            'bill_number'    => $billNumber,
            'customer_id'    => $request->customer_id,
            'entrance_fee'   => 0,
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

    /**
     * Calculate the entrance fee based on elapsed time using 3-tier pricing.
     */
    private function calculateEntranceFee(Bill $bill): float
    {
        $start = $bill->started_at ?? $bill->created_at;
        $end   = now();
        $elapsedMinutes = max(0, $start->diffInMinutes($end));

        $cost = $bill->entrance_base_price;
        $remaining = $elapsedMinutes - $bill->entrance_base_duration;

        if ($remaining <= 0) {
            return $cost;
        }

        // Stage 1
        if ($bill->entrance_stage1_duration && $bill->entrance_stage1_price) {
            $cost += $bill->entrance_stage1_price;
            $remaining -= $bill->entrance_stage1_duration;
        }

        if ($remaining <= 0) {
            return $cost;
        }

        // Stage 2 (recurring)
        if ($bill->entrance_stage2_duration && $bill->entrance_stage2_price && $remaining > 0) {
            $stage2Cycles = ceil($remaining / $bill->entrance_stage2_duration);
            $cost += $bill->entrance_stage2_price * $stage2Cycles;
        }

        return $cost;
    }

    /**
     * Recalculate the total for a bill.
     */
    private function recalculateTotal(Bill $bill): void
    {
        $bill->refresh();

        $coinTotal    = $bill->items->sum('subtotal');
        $entranceFee  = $this->calculateEntranceFee($bill);

        $bill->update([
            'entrance_fee' => $entranceFee,
            'total'        => $entranceFee + $coinTotal,
        ]);
    }
}
