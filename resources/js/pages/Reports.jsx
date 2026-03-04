import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';

export default function Reports() {
    const [activeTab, setActiveTab] = useState('today');
    const [todayReports, setTodayReports] = useState([]);
    const [summary, setSummary] = useState(null);
    const [dailyReports, setDailyReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [editingCounts, setEditingCounts] = useState({});

    useEffect(() => {
        // Set default dates (last 7 days)
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(weekAgo.toISOString().split('T')[0]);
        
        loadTodayReports();
    }, []);

    useEffect(() => {
        if (activeTab === 'summary' && startDate && endDate) {
            loadSummary();
        } else if (activeTab === 'history' && startDate && endDate) {
            loadDailyReports();
        }
    }, [activeTab, startDate, endDate]);

    const loadTodayReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/reports/today');
            setTodayReports(res.data);
            
            // Initialize editing counts
            const counts = {};
            res.data.forEach(report => {
                counts[report.game_id] = report.coin_count || 0;
            });
            setEditingCounts(counts);
        } catch (error) {
            console.error('Error loading today reports:', error);
        }
        setLoading(false);
    };

    const loadSummary = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/reports/summary', {
                params: { start_date: startDate, end_date: endDate }
            });
            setSummary(res.data);
        } catch (error) {
            console.error('Error loading summary:', error);
        }
        setLoading(false);
    };

    const loadDailyReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/reports', {
                params: { start_date: startDate, end_date: endDate }
            });
            setDailyReports(res.data);
        } catch (error) {
            console.error('Error loading daily reports:', error);
        }
        setLoading(false);
    };

    const handleCoinCountChange = (gameId, value) => {
        setEditingCounts(prev => ({
            ...prev,
            [gameId]: parseInt(value) || 0
        }));
    };

    const saveCoinCount = async (gameId) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await axios.post('/api/reports/save-coin-count', {
                game_id: gameId,
                report_date: today,
                coin_count: editingCounts[gameId]
            });
            
            // Reload today's reports to show updated data
            loadTodayReports();
            alert('Coin count saved successfully!');
        } catch (error) {
            console.error('Error saving coin count:', error);
            alert('Error saving coin count');
        }
    };

    const resetFilters = () => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(weekAgo.toISOString().split('T')[0]);
    };

    const exportPdf = async () => {
        try {
            const response = await axios.get('/api/reports/export-pdf', {
                params: { start_date: startDate, end_date: endDate },
                responseType: 'blob'
            });
            
            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales-report-${startDate}-to-${endDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error generating PDF report');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Sales Reports</h1>

                {/* Tab Navigation */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('today')}
                            className={`${
                                activeTab === 'today'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Today's Entry
                        </button>
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`${
                                activeTab === 'summary'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Summary
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`${
                                activeTab === 'history'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            History
                        </button>
                    </nav>
                </div>

                {/* Date Range Filter (for Summary and History) */}
                {(activeTab === 'summary' || activeTab === 'history') && (
                    <div className="mb-6 bg-white p-4 rounded-lg shadow">
                        <div className="flex gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border rounded px-3 py-2"
                                />
                            </div>
                            <button
                                onClick={resetFilters}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                            >
                                Reset
                            </button>
                            <button
                                onClick={exportPdf}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export PDF
                            </button>
                        </div>
                    </div>
                )}

                {/* Today's Entry Tab */}
                {activeTab === 'today' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Enter Today's Coin Counts
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Manually enter the coin count for each game at the end of the day
                            </p>
                        </div>
                        
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Game Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Coin Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Coin Count
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {todayReports.map((report) => {
                                    const coinCount = editingCounts[report.game_id] || 0;
                                    const coinPrice = parseFloat(report.coin_price || report.game?.coin?.price || 0);
                                    const revenue = (coinCount * coinPrice).toFixed(2);
                                    
                                    return (
                                        <tr key={report.game_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {report.game?.name || report.game_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                LKR {coinPrice.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={coinCount}
                                                    onChange={(e) => handleCoinCountChange(report.game_id, e.target.value)}
                                                    className="border rounded px-3 py-1 w-24"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                LKR {revenue}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => saveCoinCount(report.game_id)}
                                                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                                                >
                                                    Save
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {todayReports.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No games found. Please add games first.
                            </div>
                        )}
                    </div>
                )}

                {/* Summary Tab */}
                {activeTab === 'summary' && summary && (
                    <div className="space-y-6">
                        {/* Overall Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Coins</h3>
                                <p className="text-3xl font-bold text-gray-900">
                                    {parseInt(summary.overall?.total_coins || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                                <p className="text-3xl font-bold text-green-600">
                                    LKR {parseFloat(summary.overall?.total_revenue || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Summary by Game */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Sales by Game</h2>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Game
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Coins
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Revenue
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Coins/Day
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Days Tracked
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {summary.by_game?.map((game) => (
                                        <tr key={game.game_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {game.game?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {parseInt(game.total_coins).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                LKR {parseFloat(game.total_revenue).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {parseFloat(game.avg_coins_per_day).toFixed(1)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {game.days_tracked}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Daily Totals */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Daily Totals</h2>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Coins
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Revenue
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {summary.daily_totals?.map((day, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Date(day.report_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {parseInt(day.total_coins).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                LKR {parseFloat(day.total_revenue).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Sales History</h2>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Game
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Coin Count
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Coin Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dailyReports.map((report) => (
                                    <tr key={report.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(report.report_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {report.game?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {report.coin_count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            LKR {parseFloat(report.coin_price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                            LKR {parseFloat(report.total_revenue).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {dailyReports.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No sales data found for the selected period.
                            </div>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="text-center py-8 text-gray-500">
                        Loading...
                    </div>
                )}
            </div>
        </div>
    );
}
