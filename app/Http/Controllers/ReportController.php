<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DailySalesReport;
use App\Models\Game;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Bill;

class ReportController extends Controller
{
    /**
     * Get daily sales reports with optional date filtering
     */
    public function index(Request $request)
    {
        $query = DailySalesReport::with('game.coin');

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->where('report_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('report_date', '<=', $request->end_date);
        }

        // Default to last 30 days if no filter
        if (!$request->has('start_date') && !$request->has('end_date')) {
            $query->where('report_date', '>=', Carbon::now()->subDays(30));
        }

        $reports = $query->orderBy('report_date', 'desc')
                         ->orderBy('game_id', 'asc')
                         ->get();

        return response()->json($reports);
    }

    /**
     * Get today's sales reports for all games
     */
    public function today()
    {
        $today = Carbon::now()->format('Y-m-d');
        $games = Game::with('coin')->get();
        
        $reports = [];
        foreach ($games as $game) {
            $report = DailySalesReport::where('game_id', $game->id)
                ->where('report_date', $today)
                ->first();

            if (!$report) {
                $report = [
                    'id' => null,
                    'game_id' => $game->id,
                    'game' => $game,
                    'report_date' => $today,
                    'coin_count' => 0,
                    'coin_price' => $game->coin ? $game->coin->price : 0,
                    'total_revenue' => 0
                ];
            } else {
                $report->game = $game;
            }

            $reports[] = $report;
        }

        return response()->json($reports);
    }

    /**
     * Save or update daily coin count for a game
     */
    public function saveCoinCount(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'report_date' => 'required|date',
            'coin_count' => 'required|integer|min:0'
        ]);

        // Get game with coin to fetch current coin price
        $game = Game::with('coin')->findOrFail($validated['game_id']);
        
        // Get coin price from the game's coin
        $coinPrice = $game->coin ? $game->coin->price : 0;
        
        // Calculate total revenue
        $totalRevenue = $validated['coin_count'] * $coinPrice;

        // Update or create the daily sales report
        $report = DailySalesReport::updateOrCreate(
            [
                'game_id' => $validated['game_id'],
                'report_date' => $validated['report_date']
            ],
            [
                'coin_count' => $validated['coin_count'],
                'coin_price' => $coinPrice,
                'total_revenue' => $totalRevenue
            ]
        );

        $report->load('game.coin');

        return response()->json([
            'message' => 'Coin count saved successfully',
            'report' => $report
        ]);
    }

    /**
     * Get summary/overview of sales
     */
    public function summary(Request $request)
    {
        $startDate = $request->start_date ?? Carbon::now()->subDays(30)->format('Y-m-d');
        $endDate = $request->end_date ?? Carbon::now()->format('Y-m-d');

        // Overall summary
        $overall = DailySalesReport::whereBetween('report_date', [$startDate, $endDate])
            ->select(
                DB::raw('SUM(coin_count) as total_coins'),
                DB::raw('SUM(total_revenue) as total_revenue')
            )
            ->first();

        // Summary by game
        $byGame = DailySalesReport::with('game.coin')
            ->whereBetween('report_date', [$startDate, $endDate])
            ->select(
                'game_id',
                DB::raw('SUM(coin_count) as total_coins'),
                DB::raw('SUM(total_revenue) as total_revenue'),
                DB::raw('AVG(coin_count) as avg_coins_per_day'),
                DB::raw('COUNT(*) as days_tracked')
            )
            ->groupBy('game_id')
            ->get();

        // Daily totals for chart
        $dailyTotals = DailySalesReport::whereBetween('report_date', [$startDate, $endDate])
            ->select(
                'report_date',
                DB::raw('SUM(coin_count) as total_coins'),
                DB::raw('SUM(total_revenue) as total_revenue')
            )
            ->groupBy('report_date')
            ->orderBy('report_date', 'asc')
            ->get();

        return response()->json([
            'overall' => $overall,
            'by_game' => $byGame,
            'daily_totals' => $dailyTotals,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }

    /**
     * Export sales report as PDF
     */
    public function exportPdf(Request $request)
    {
        $startDate = $request->start_date ?? Carbon::now()->subDays(30)->format('Y-m-d');
        $endDate = $request->end_date ?? Carbon::now()->format('Y-m-d');

        // Overall summary
        $overall = DailySalesReport::whereBetween('report_date', [$startDate, $endDate])
            ->select(
                DB::raw('SUM(coin_count) as total_coins'),
                DB::raw('SUM(total_revenue) as total_revenue')
            )
            ->first();

        // Summary by game
        $byGame = DailySalesReport::with('game.coin')
            ->whereBetween('report_date', [$startDate, $endDate])
            ->select(
                'game_id',
                DB::raw('SUM(coin_count) as total_coins'),
                DB::raw('SUM(total_revenue) as total_revenue'),
                DB::raw('AVG(coin_count) as avg_coins_per_day'),
                DB::raw('COUNT(*) as days_tracked')
            )
            ->groupBy('game_id')
            ->get();

        // Daily totals
        $dailyTotals = DailySalesReport::whereBetween('report_date', [$startDate, $endDate])
            ->select(
                'report_date',
                DB::raw('SUM(coin_count) as total_coins'),
                DB::raw('SUM(total_revenue) as total_revenue')
            )
            ->groupBy('report_date')
            ->orderBy('report_date', 'asc')
            ->get();

        $data = [
            'overall' => $overall,
            'by_game' => $byGame,
            'daily_totals' => $dailyTotals,
            'start_date' => $startDate,
            'end_date' => $endDate
        ];

        $pdf = Pdf::loadView('reports.pdf', $data);
        
        return $pdf->download('sales-report-' . $startDate . '-to-' . $endDate . '.pdf');
    }

    /**
     * Get billing-based revenue report (entrance fees, coin sales, service charges)
     */
    public function billingReport(Request $request)
    {
        $startDate = $request->start_date ?? Carbon::now()->subDays(30)->format('Y-m-d');
        $endDate = $request->end_date ?? Carbon::now()->format('Y-m-d');

        // Only closed bills
        $bills = Bill::with(['items', 'customer'])
            ->where('status', 'closed')
            ->whereDate('updated_at', '>=', $startDate)
            ->whereDate('updated_at', '<=', $endDate)
            ->orderBy('updated_at', 'desc')
            ->get();

        // Aggregate totals
        $totalEntranceFees = $bills->sum('entrance_fee');
        $totalCoinRevenue = $bills->sum(function ($bill) {
            return $bill->items->sum('subtotal');
        });
        $grandTotal = $bills->sum('total');

        // Per-day breakdown
        $dailyBreakdown = $bills->groupBy(function ($bill) {
            return Carbon::parse($bill->updated_at)->format('Y-m-d');
        })->map(function ($dayBills, $date) {
            return [
                'date' => $date,
                'bill_count' => $dayBills->count(),
                'entrance_fees' => $dayBills->sum('entrance_fee'),
                'coin_revenue' => $dayBills->sum(function ($b) { return $b->items->sum('subtotal'); }),
                'total' => $dayBills->sum('total'),
            ];
        })->sortKeysDesc()->values();

        return response()->json([
            'summary' => [
                'total_bills' => $bills->count(),
                'total_entrance_fees' => $totalEntranceFees,
                'total_coin_revenue' => $totalCoinRevenue,
                'grand_total' => $grandTotal,
            ],
            'daily_breakdown' => $dailyBreakdown,
            'bills' => $bills,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
