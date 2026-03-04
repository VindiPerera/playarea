<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sales Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #1a1a1a;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .summary-box {
            background-color: #f3f4f6;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .summary-grid {
            display: table;
            width: 100%;
        }
        .summary-item {
            display: table-cell;
            width: 50%;
            padding: 10px;
        }
        .summary-label {
            font-size: 11px;
            color: #666;
            margin-bottom: 5px;
        }
        .summary-value {
            font-size: 20px;
            font-weight: bold;
            color: #1a1a1a;
        }
        .summary-value.revenue {
            color: #059669;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #e5e7eb;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            color: #374151;
            border-bottom: 2px solid #d1d5db;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        tr:last-child td {
            border-bottom: none;
        }
        .text-right {
            text-align: right;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin: 25px 0 10px 0;
            color: #1a1a1a;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PlayArea - Sales Report</h1>
        <p>Report Period: {{ date('d M Y', strtotime($start_date)) }} to {{ date('d M Y', strtotime($end_date)) }}</p>
        <p style="font-size: 10px; color: #999;">Generated on {{ date('d M Y H:i:s') }}</p>
    </div>

    <!-- Overall Summary -->
    <div class="summary-box">
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Coins Collected</div>
                <div class="summary-value">{{ number_format($overall->total_coins ?? 0) }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Revenue</div>
                <div class="summary-value revenue">LKR {{ number_format($overall->total_revenue ?? 0, 2) }}</div>
            </div>
        </div>
    </div>

    <!-- Sales by Game -->
    <div class="section-title">Sales by Game</div>
    <table>
        <thead>
            <tr>
                <th>Game</th>
                <th class="text-right">Total Coins</th>
                <th class="text-right">Total Revenue</th>
                <th class="text-right">Avg Coins/Day</th>
                <th class="text-right">Days Tracked</th>
            </tr>
        </thead>
        <tbody>
            @foreach($by_game as $game)
            <tr>
                <td>{{ $game->game->name ?? 'N/A' }}</td>
                <td class="text-right">{{ number_format($game->total_coins) }}</td>
                <td class="text-right" style="color: #059669; font-weight: bold;">LKR {{ number_format($game->total_revenue, 2) }}</td>
                <td class="text-right">{{ number_format($game->avg_coins_per_day, 1) }}</td>
                <td class="text-right">{{ $game->days_tracked }}</td>
            </tr>
            @endforeach
            @if(count($by_game) === 0)
            <tr>
                <td colspan="5" style="text-align: center; color: #999;">No data available</td>
            </tr>
            @endif
        </tbody>
    </table>

    <!-- Daily Totals -->
    <div class="section-title">Daily Totals</div>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th class="text-right">Total Coins</th>
                <th class="text-right">Total Revenue</th>
            </tr>
        </thead>
        <tbody>
            @foreach($daily_totals as $day)
            <tr>
                <td>{{ date('d M Y', strtotime($day->report_date)) }}</td>
                <td class="text-right">{{ number_format($day->total_coins) }}</td>
                <td class="text-right" style="color: #059669; font-weight: bold;">LKR {{ number_format($day->total_revenue, 2) }}</td>
            </tr>
            @endforeach
            @if(count($daily_totals) === 0)
            <tr>
                <td colspan="3" style="text-align: center; color: #999;">No data available</td>
            </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        <p>This is a computer-generated report and does not require a signature.</p>
        <p>&copy; {{ date('Y') }} PlayArea - Games Platform. All rights reserved.</p>
    </div>
</body>
</html>
