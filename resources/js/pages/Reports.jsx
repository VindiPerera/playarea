import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Reports() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [activeTab, setActiveTab] = useState('today');
    const [todayReports, setTodayReports] = useState([]);
    const [summary, setSummary] = useState(null);
    const [billingReport, setBillingReport] = useState(null);
    const [selectedBill, setSelectedBill] = useState(null);
    const [dailyReports, setDailyReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [editingCounts, setEditingCounts] = useState({});
    const [savingId, setSavingId] = useState(null);
    const [savedIds, setSavedIds] = useState([]);

    const authHeaders = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(weekAgo.toISOString().split('T')[0]);
        loadTodayReports();
    }, []);

    useEffect(() => {
        if (!startDate || !endDate) return;
        if (activeTab === 'arcade') loadSummary();
        else if (activeTab === 'history') loadDailyReports();
        else if (activeTab === 'billing') loadBillingReport();
    }, [activeTab, startDate, endDate]);

    const authFetch = (url, opts = {}) =>
        fetch(url, { ...opts, headers: { ...authHeaders, ...(opts.headers || {}) } });

    const loadTodayReports = async () => {
        setLoading(true);
        try {
            const res = await authFetch('/api/reports/today');
            const data = await res.json();
            setTodayReports(data);
            const counts = {};
            data.forEach(r => { counts[r.game_id] = r.coin_count || 0; });
            setEditingCounts(counts);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const loadSummary = async () => {
        setLoading(true);
        try {
            const res = await authFetch(`/api/reports/summary?start_date=${startDate}&end_date=${endDate}`);
            setSummary(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const loadDailyReports = async () => {
        setLoading(true);
        try {
            const res = await authFetch(`/api/reports?start_date=${startDate}&end_date=${endDate}`);
            setDailyReports(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const loadBillingReport = async () => {
        setLoading(true);
        try {
            const res = await authFetch(`/api/reports/billing?start_date=${startDate}&end_date=${endDate}`);
            setBillingReport(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleCoinCountChange = (gameId, value) => {
        setEditingCounts(prev => ({ ...prev, [gameId]: parseInt(value) || 0 }));
    };

    const saveCoinCount = async (gameId) => {
        setSavingId(gameId);
        try {
            const today = new Date().toISOString().split('T')[0];
            await authFetch('/api/reports/save-coin-count', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ game_id: gameId, report_date: today, coin_count: editingCounts[gameId] }),
            });
            setSavedIds(prev => [...prev, gameId]);
            setTimeout(() => setSavedIds(prev => prev.filter(id => id !== gameId)), 2000);
            loadTodayReports();
        } catch (e) { console.error(e); }
        setSavingId(null);
    };

    const exportPdf = async () => {
        try {
            const res = await authFetch(`/api/reports/export-pdf?start_date=${startDate}&end_date=${endDate}`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `arcade-report-${startDate}-to-${endDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) { console.error(e); }
    };

    const fmt = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const TABS = [
        { key: 'today',   label: "Today's Entry" },
        { key: 'billing', label: 'Billing Revenue' },
        { key: 'arcade',  label: 'Arcade Summary' },
        { key: 'history', label: 'History' },
    ];

    const showDateFilter = activeTab !== 'today';

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Page Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-3xl font-light text-gray-400 hover:text-gray-600 leading-none"
                    >‹</button>
                    <h1 className="text-2xl font-extrabold tracking-wide text-gray-800 uppercase">
                        Reports
                    </h1>
                </div>

                {/* Tab Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="flex">
                        {TABS.map((tab, i) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors
                                    ${i < TABS.length - 1 ? 'border-r border-gray-200' : ''}
                                    ${activeTab === tab.key
                                        ? 'bg-[#2e7d32] text-white'
                                        : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Range Filter */}
                {showDateFilter && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                            </div>
                            {activeTab === 'arcade' && (
                                <button
                                    onClick={exportPdf}
                                    className="flex items-center gap-2 bg-[#2e7d32] hover:bg-green-800 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export PDF
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TODAY'S ENTRY TAB ── */}
                {activeTab === 'today' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-[#2e7d32] px-6 py-4">
                            <h2 className="text-base font-bold text-white uppercase tracking-wider">
                                Enter Today's Arcade Coin Counts
                            </h2>
                            <p className="text-xs text-green-100 mt-0.5">
                                Record coins collected per game at end of day
                            </p>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-400 font-medium">Loading…</div>
                        ) : todayReports.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">No games configured. Add games first.</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        {['Game', 'Coin Price', 'Coins Today', 'Revenue', ''].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {todayReports.map(report => {
                                        const count = editingCounts[report.game_id] || 0;
                                        const price = parseFloat(report.coin_price || report.game?.coin?.price || 0);
                                        return (
                                            <tr key={report.game_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-800 text-sm">
                                                    {report.game?.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    LKR {fmt(price)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={count}
                                                        onChange={e => handleCoinCountChange(report.game_id, e.target.value)}
                                                        className="border border-gray-200 rounded-xl px-3 py-1.5 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-green-700">
                                                    LKR {fmt(count * price)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => saveCoinCount(report.game_id)}
                                                        disabled={savingId === report.game_id}
                                                        className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors
                                                            ${savedIds.includes(report.game_id)
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-[#2e7d32] hover:bg-green-800 text-white'}`}
                                                    >
                                                        {savedIds.includes(report.game_id) ? '✓ Saved' : savingId === report.game_id ? 'Saving…' : 'Save'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* ── BILLING REVENUE TAB ── */}
                {activeTab === 'billing' && (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="text-center py-12 text-gray-400 font-medium">Loading…</div>
                        ) : billingReport ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Bills Closed', value: billingReport.summary.total_bills, prefix: '', color: 'text-blue-700', bg: 'bg-blue-50' },
                                        { label: 'Entrance Fees', value: fmt(billingReport.summary.total_entrance_fees), prefix: 'LKR ', color: 'text-indigo-700', bg: 'bg-indigo-50' },
                                        { label: 'Coin Revenue', value: fmt(billingReport.summary.total_coin_revenue), prefix: 'LKR ', color: 'text-purple-700', bg: 'bg-purple-50' },
                                    ].map(card => (
                                        <div key={card.label} className={`${card.bg} rounded-2xl border border-gray-200 p-5`}>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                                            <p className={`text-2xl font-extrabold ${card.color}`}>
                                                {card.prefix}{card.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Grand Total Banner */}
                                <div className="bg-[#1a237e] rounded-2xl p-5 text-white flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider opacity-80">Grand Total Revenue</p>
                                        <p className="text-3xl font-extrabold mt-1">LKR {fmt(billingReport.summary.grand_total)}</p>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>

                                {/* Daily Breakdown */}
                                {billingReport.daily_breakdown.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="bg-[#2e7d32] px-6 py-4">
                                            <h2 className="text-base font-bold text-white uppercase tracking-wider">Daily Breakdown</h2>
                                        </div>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    {['Date', 'Bills', 'Entrance Fees', 'Coin Revenue', 'Day Total'].map(h => (
                                                        <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {billingReport.daily_breakdown.map(day => (
                                                    <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                                            {new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{day.bill_count}</td>
                                                        <td className="px-6 py-4 text-sm text-indigo-700 font-semibold">LKR {fmt(day.entrance_fees)}</td>
                                                        <td className="px-6 py-4 text-sm text-purple-700 font-semibold">LKR {fmt(day.coin_revenue)}</td>
                                                        <td className="px-6 py-4 text-sm text-green-700 font-extrabold">LKR {fmt(day.total)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {billingReport.daily_breakdown.length === 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-200 text-center py-12 text-gray-400">
                                        No closed bills found for the selected period.
                                    </div>
                                )}

                                {/* Individual Bills List */}
                                {billingReport.bills?.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="bg-[#1a237e] px-6 py-4">
                                            <h2 className="text-base font-bold text-white uppercase tracking-wider">All Bills</h2>
                                        </div>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    {['Bill #', 'Customer', 'Date', 'Entrance', 'Coins', 'Total', 'Payment', ''].map(h => (
                                                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {billingReport.bills.map(bill => (
                                                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 text-xs font-bold text-gray-700">{bill.bill_number}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{bill.customer?.name ?? '—'}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-500">
                                                            {new Date(bill.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-indigo-700 font-semibold">LKR {fmt(bill.entrance_fee)}</td>
                                                        <td className="px-4 py-3 text-sm text-purple-700 font-semibold">LKR {fmt(bill.items?.reduce((s, i) => s + parseFloat(i.subtotal || 0), 0))}</td>
                                                        <td className="px-4 py-3 text-sm font-extrabold text-green-700">LKR {fmt(bill.total)}</td>
                                                        <td className="px-4 py-3 text-xs text-gray-500 capitalize">{bill.payment_method ?? '—'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={() => setSelectedBill(bill)}
                                                                className="text-xs font-bold text-[#1a237e] hover:underline uppercase tracking-wider"
                                                            >View</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-400">No data. Select a date range above.</div>
                        )}
                    </div>
                )}

                {/* ── ARCADE SUMMARY TAB ── */}
                {activeTab === 'arcade' && (
                    <div className="space-y-6">
                        {loading ? (
                            <div className="text-center py-12 text-gray-400 font-medium">Loading…</div>
                        ) : summary ? (
                            <>
                                {/* Overall Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Coins</p>
                                        <p className="text-3xl font-extrabold text-gray-800">
                                            {parseInt(summary.overall?.total_coins || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
                                        <p className="text-3xl font-extrabold text-green-700">
                                            LKR {fmt(summary.overall?.total_revenue)}
                                        </p>
                                    </div>
                                </div>

                                {/* By Game */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-[#2e7d32] px-6 py-4">
                                        <h2 className="text-base font-bold text-white uppercase tracking-wider">Revenue by Game</h2>
                                    </div>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                {['Game', 'Total Coins', 'Total Revenue', 'Avg Coins/Day', 'Days'].map(h => (
                                                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {summary.by_game?.map(game => (
                                                <tr key={game.game_id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{game.game?.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{parseInt(game.total_coins).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-green-700">LKR {fmt(game.total_revenue)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{parseFloat(game.avg_coins_per_day).toFixed(1)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{game.days_tracked}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!summary.by_game?.length && (
                                        <div className="text-center py-8 text-gray-400">No arcade data for this period.</div>
                                    )}
                                </div>

                                {/* Daily Totals */}
                                {summary.daily_totals?.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="bg-[#2e7d32] px-6 py-4">
                                            <h2 className="text-base font-bold text-white uppercase tracking-wider">Daily Totals</h2>
                                        </div>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    {['Date', 'Total Coins', 'Revenue'].map(h => (
                                                        <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {summary.daily_totals.map((day, i) => (
                                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                                            {new Date(day.report_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{parseInt(day.total_coins).toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-green-700">LKR {fmt(day.total_revenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-400">Select a date range to view arcade summary.</div>
                        )}
                    </div>
                )}

                {/* ── HISTORY TAB ── */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-[#2e7d32] px-6 py-4">
                            <h2 className="text-base font-bold text-white uppercase tracking-wider">Arcade Game History</h2>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-400 font-medium">Loading…</div>
                        ) : dailyReports.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">No records for selected period.</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        {['Date', 'Game', 'Coin Count', 'Coin Price', 'Revenue'].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {dailyReports.map(report => (
                                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(report.report_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-800">{report.game?.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{report.coin_count}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">LKR {fmt(report.coin_price)}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-green-700">LKR {fmt(report.total_revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

            </div>

            {/* ── BILL DETAIL MODAL ── */}
            {selectedBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setSelectedBill(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-[#1a237e] px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Bill Details</p>
                                <p className="text-lg font-extrabold text-white mt-0.5">{selectedBill.bill_number}</p>
                            </div>
                            <button onClick={() => setSelectedBill(null)} className="text-indigo-200 hover:text-white text-2xl font-light leading-none">×</button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Meta */}
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Customer: <span className="font-semibold text-gray-800">{selectedBill.customer?.name ?? '—'}</span></span>
                                <span>{new Date(selectedBill.updated_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>

                            {/* Entrance Fee */}
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-sm font-semibold text-gray-700">Entrance Fee</span>
                                <span className="text-sm font-bold text-indigo-700">LKR {fmt(selectedBill.entrance_fee)}</span>
                            </div>

                            {/* Coin Items */}
                            {selectedBill.items?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Coins</p>
                                    <div className="space-y-1.5">
                                        {selectedBill.items.map(item => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-gray-700">{item.coin_name} <span className="text-gray-400">× {item.quantity}</span></span>
                                                <span className="font-semibold text-purple-700">LKR {fmt(item.subtotal)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Total */}
                            <div className="bg-[#1a237e] rounded-xl px-5 py-4 flex justify-between items-center">
                                <span className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Total</span>
                                <span className="text-xl font-extrabold text-white">LKR {fmt(selectedBill.total)}</span>
                            </div>

                            {/* Payment */}
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Payment: <span className="font-semibold text-gray-700 capitalize">{selectedBill.payment_method ?? '—'}</span></span>
                                {selectedBill.cash_amount && (
                                    <span>Cash given: <span className="font-semibold text-gray-700">LKR {fmt(selectedBill.cash_amount)}</span></span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


