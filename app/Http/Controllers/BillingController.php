<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;

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
            'customer_id'     => 'nullable|exists:customers,id',
            'people_standard' => 'nullable|integer|min:0',
            'people_above10'  => 'nullable|integer|min:0',
        ]);

        // Snapshot entrance fee tier pricing from settings
        $settings = Setting::all()->pluck('value', 'key');
        $basePrice     = floatval($settings['entrance_base_price'] ?? 0);
        $baseDuration  = intval($settings['entrance_base_duration'] ?? 0);
        $stage1Price   = $settings['entrance_stage1_price'] ?? null;
        $stage1Dur     = $settings['entrance_stage1_duration'] ?? null;
        $above10Price  = $settings['entrance_above10_price'] ?? null;

        $peopleStandard = max(0, intval($request->people_standard ?? 1));
        $peopleAbove10  = max(0, intval($request->people_above10  ?? 0));

        $billNumber = $this->generateBillNumber();

        $bill = Bill::create([
            'bill_number'             => $billNumber,
            'customer_id'             => $request->customer_id,
            'entrance_fee'            => $basePrice,
            'total'                   => 0,
            'status'                  => 'open',
            'payment_method'          => null,
            'cash_amount'             => null,
            'started_at'              => now(),
            'people_standard'         => $peopleStandard,
            'people_above10'          => $peopleAbove10,
            'entrance_base_price'     => $basePrice,
            'entrance_base_duration'  => $baseDuration,
            'entrance_stage1_price'   => $stage1Price,
            'entrance_stage1_duration'=> $stage1Dur,
            'entrance_above10_price'  => $above10Price,
        ]);

        $this->recalculateTotal($bill);

        return response()->json($bill->load(['items', 'customer']), 201);
    }

    /**
     * Update people counts on an open bill.
     */
    public function updatePeople(Request $request, Bill $bill)
    {
        if ($bill->status !== 'open') {
            return response()->json(['message' => 'Bill is already closed.'], 422);
        }

        $request->validate([
            'people_standard' => 'required|integer|min:0',
            'people_above10'  => 'required|integer|min:0',
        ]);

        $bill->update([
            'people_standard' => $request->people_standard,
            'people_above10'  => $request->people_above10,
        ]);

        $this->recalculateTotal($bill);

        return response()->json($bill->load(['items', 'customer']));
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
     * Add product items to an open bill.
     */
    public function addProducts(Request $request, Bill $bill)
    {
        if ($bill->status !== 'open') {
            return response()->json(['message' => 'Bill is already closed.'], 422);
        }

        $request->validate([
            'items'                  => 'required|array|min:1',
            'items.*.product_id'     => 'required|exists:products,id',
            'items.*.quantity'       => 'required|integer|min:1',
        ]);

        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $discount       = floatval($product->discount);
            $effectivePrice = round($product->sell_price * (1 - $discount / 100), 2);

            $bill->items()->create([
                'item_type'  => 'product',
                'product_id' => $product->id,
                'coin_name'  => $product->name,   // stored for display / receipt
                'coin_price' => $effectivePrice,  // price after discount
                'discount'   => $discount,
                'quantity'   => $item['quantity'],
                'subtotal'   => $effectivePrice * $item['quantity'],
            ]);
        }

        $this->recalculateTotal($bill);

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

        $billNumber = $this->generateBillNumber();

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

        // --- Standard (time-based) fee per person ---
        $cost = floatval($bill->entrance_base_price);
        $remaining = $elapsedMinutes - intval($bill->entrance_base_duration);

        if ($remaining > 0) {
            // Stage 1 — Recurring
            if ($bill->entrance_stage1_duration && $bill->entrance_stage1_price) {
                $stage1Cycles = ceil($remaining / $bill->entrance_stage1_duration);
                $cost += floatval($bill->entrance_stage1_price) * $stage1Cycles;
            }
        }

        $standardCount = max(0, intval($bill->people_standard ?? 1));
        $above10Count  = max(0, intval($bill->people_above10  ?? 0));
        $above10Price  = floatval($bill->entrance_above10_price ?? 0);

        return ($cost * $standardCount) + ($above10Price * $above10Count);
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

    /**
     * Generate a sequential daily bill number in YYMMDD-NNNN format.
     */
    private function generateBillNumber(): string
    {
        $prefix = now()->format('ymd');

        $lastBill = Bill::where('bill_number', 'like', $prefix . '-%')
            ->orderByDesc('bill_number')
            ->first();

        $nextSeq = 1;
        if ($lastBill) {
            $parts = explode('-', $lastBill->bill_number);
            $nextSeq = intval(end($parts)) + 1;
        }

        return $prefix . '-' . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
    }
}
