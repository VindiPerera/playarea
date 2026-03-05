<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\BillService;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BillingController extends Controller
{
    public function index()
    {
        return Bill::with(['items', 'services', 'customer'])->latest()->get();
    }

    /**
     * Get all currently open bills.
     */
    public function openBills()
    {
        return Bill::with(['items', 'services', 'customer'])
            ->where('status', 'open')
            ->latest()
            ->get();
    }

    /**
     * Open a new bill for a customer.
     */
    public function openBill(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        $entranceFee = Setting::where('key', 'entrance_fee')->value('value') ?? 0;
        $billNumber  = 'BILL-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

        $bill = Bill::create([
            'bill_number'    => $billNumber,
            'customer_id'    => $request->customer_id,
            'entrance_fee'   => $entranceFee,
            'total'          => 0,
            'status'         => 'open',
            'payment_method' => null,
            'cash_amount'    => null,
        ]);

        return response()->json($bill->load(['items', 'services', 'customer']), 201);
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

        return response()->json($bill->load(['items', 'services', 'customer']));
    }

    /**
     * Add a service to an open bill (starts the timer).
     */
    public function addService(Request $request, Bill $bill)
    {
        if ($bill->status !== 'open') {
            return response()->json(['message' => 'Bill is already closed.'], 422);
        }

        $request->validate([
            'service_id' => 'required|exists:services,id',
        ]);

        $service = \App\Models\Service::findOrFail($request->service_id);

        $billService = $bill->services()->create([
            'service_id'     => $service->id,
            'service_name'   => $service->name,
            'base_price'     => $service->base_price,
            'base_duration'  => $service->base_duration,
            'stage1_duration' => $service->stage1_duration,
            'stage1_price'   => $service->stage1_price,
            'stage2_duration' => $service->stage2_duration,
            'stage2_price'   => $service->stage2_price,
            'started_at'     => now(),
            'subtotal'       => $service->base_price,
        ]);

        $this->recalculateTotal($bill);

        return response()->json($bill->load(['items', 'services', 'customer']));
    }

    /**
     * Stop a service (end the timer and calculate final cost).
     */
    public function stopService(Request $request, Bill $bill, BillService $billService)
    {
        if ($bill->status !== 'open') {
            return response()->json(['message' => 'Bill is already closed.'], 422);
        }

        if ($billService->bill_id !== $bill->id) {
            return response()->json(['message' => 'Service does not belong to this bill.'], 422);
        }

        $billService->ended_at = now();
        $billService->subtotal = $this->calculateServiceCost($billService);
        $billService->save();

        $this->recalculateTotal($bill);

        return response()->json($bill->load(['items', 'services', 'customer']));
    }

    /**
     * Remove a service from an open bill entirely.
     */
    public function removeService(Request $request, Bill $bill, BillService $billService)
    {
        if ($bill->status !== 'open') {
            return response()->json(['message' => 'Bill is already closed.'], 422);
        }

        if ($billService->bill_id !== $bill->id) {
            return response()->json(['message' => 'Service does not belong to this bill.'], 422);
        }

        $billService->delete();

        $this->recalculateTotal($bill);

        return response()->json($bill->load(['items', 'services', 'customer']));
    }

    /**
     * Close/finalize a bill.
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

        // Stop all running services
        foreach ($bill->services as $bs) {
            if (!$bs->ended_at) {
                $bs->ended_at = now();
                $bs->subtotal = $this->calculateServiceCost($bs);
                $bs->save();
            }
        }

        $this->recalculateTotal($bill);

        $bill->update([
            'status'         => 'closed',
            'payment_method' => $request->payment_method,
            'cash_amount'    => $request->payment_method === 'cash' ? $request->cash_amount : null,
        ]);

        return response()->json($bill->load(['items', 'services', 'customer']));
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
        return $bill->load(['items', 'services', 'customer']);
    }

    public function destroy(Bill $bill)
    {
        $bill->delete();
        return response()->json(null, 204);
    }

    /**
     * Calculate the cost for a service based on elapsed time.
     */
    private function calculateServiceCost(BillService $bs): float
    {
        $start = $bs->started_at;
        $end   = $bs->ended_at ?? now();
        $elapsedMinutes = max(0, $start->diffInMinutes($end));

        $cost = $bs->base_price;
        $remaining = $elapsedMinutes - $bs->base_duration;

        if ($remaining <= 0) {
            return $cost;
        }

        // Stage 1
        if ($bs->stage1_duration && $bs->stage1_price) {
            if ($remaining > 0) {
                $cost += $bs->stage1_price;
                $remaining -= $bs->stage1_duration;
            }
        }

        if ($remaining <= 0) {
            return $cost;
        }

        // Stage 2 (recurring)
        if ($bs->stage2_duration && $bs->stage2_price && $remaining > 0) {
            $stage2Cycles = ceil($remaining / $bs->stage2_duration);
            $cost += $bs->stage2_price * $stage2Cycles;
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
        $serviceTotal = 0;
        foreach ($bill->services as $bs) {
            $serviceTotal += $bs->ended_at ? $bs->subtotal : $this->calculateServiceCost($bs);
        }

        $bill->update([
            'total' => $bill->entrance_fee + $coinTotal + $serviceTotal,
        ]);
    }
}
