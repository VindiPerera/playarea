import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

// ── Receipt Modal ─────────────────────────────────────────────────────────────
function ReceiptModal({ bill, onClose }) {
    const printRef = useRef();

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const win = window.open('', '_blank', 'width=480,height=700');
        win.document.write(`
            <html><head><title>Receipt ${bill.bill_number}</title>
            <style>
              body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; font-size: 13px; }
              .center { text-align: center; }
              .divider { border-top: 1px dashed #999; margin: 10px 0; }
              table { width: 100%; border-collapse: collapse; }
              td, th { padding: 4px 2px; }
              .right { text-align: right; }
              .bold { font-weight: bold; }
              .title { font-size: 20px; font-weight: bold; }
              .sub { font-size: 11px; color: #555; }
              .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #333; }
            </style></head>
            <body>${content}</body></html>
        `);
        win.document.close();
        win.focus();
        win.onafterprint = () => win.close();
        setTimeout(() => win.print(), 300);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800">Receipt</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8">&times;</button>
                    </div>
                </div>
                <div className="overflow-y-auto p-6">
                    <div ref={printRef} className="font-mono text-sm">
                        <div className="text-center mb-4">
                            <p className="text-xl font-extrabold tracking-widest">PLAYAREA</p>
                            <p className="text-xs text-gray-500 tracking-wide">Games Platform</p>
                            <div className="border-t border-dashed border-gray-300 my-3" />
                            <p className="text-xs text-gray-500">BILL RECEIPT</p>
                            <p className="font-bold text-base mt-1">{bill.bill_number}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{new Date(bill.created_at).toLocaleString()}</p>
                        </div>
                        <div className="border-t border-dashed border-gray-300 my-3" />
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-gray-500">
                                    <th className="text-left py-1 font-semibold">Item</th>
                                    <th className="text-center py-1 font-semibold">Qty</th>
                                    <th className="text-right py-1 font-semibold">Price</th>
                                    <th className="text-right py-1 font-semibold">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.items.map((item, i) => (
                                    <tr key={i} className="border-t border-gray-100">
                                        <td className="py-1.5 font-medium text-gray-800 pr-2">🪙 {item.coin_name}</td>
                                        <td className="text-center py-1.5 text-gray-600">×{item.quantity}</td>
                                        <td className="text-right py-1.5 text-gray-600">LKR {parseFloat(item.coin_price).toFixed(2)}</td>
                                        <td className="text-right py-1.5 font-semibold text-gray-800">LKR {parseFloat(item.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="border-t-2 border-gray-800 mt-3 pt-3 flex justify-between items-center">
                            <span className="font-extrabold text-gray-800 text-sm tracking-wide uppercase">TOTAL</span>
                            <span className="font-extrabold text-xl text-gray-900">LKR {parseFloat(bill.total).toFixed(2)}</span>
                        </div>
                        {bill.payment_method && (
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                <span>Payment</span>
                                <span className="font-semibold">{bill.payment_method === 'card' ? '💳 Card' : '💵 Cash'}</span>
                            </div>
                        )}
                        <div className="border-t border-dashed border-gray-300 my-4" />
                        <p className="text-center text-xs text-gray-400">Thank you for your purchase!</p>
                        <p className="text-center text-xs text-gray-300 mt-1">www.playarea.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Billing Page ───────────────────────────────────────────────────────────────
export default function Billing() {
    const { token }                   = useAuth();
    const navigate                    = useNavigate();
    const [coins,      setCoins]      = useState([]);
    const [selections, setSelections] = useState({});
    const [payMethod,  setPayMethod]  = useState('cash');
    const [loading,    setLoading]    = useState(false);
    const [pageLoad,   setPageLoad]   = useState(true);
    const [error,      setError]      = useState(null);
    const [receipt,    setReceipt]    = useState(null);

    const toggle = (coin) => {
        setSelections(prev => {
            const copy = { ...prev };
            if (copy[coin.id]) { delete copy[coin.id]; }
            else { copy[coin.id] = { coin, qty: 1 }; }
            return copy;
        });
    };

    const setQty = (coinId, delta) => {
        setSelections(prev => {
            const cur = prev[coinId]?.qty ?? 1;
            const next = Math.max(1, cur + delta);
            return { ...prev, [coinId]: { ...prev[coinId], qty: next } };
        });
    };

    const selectedItems = Object.values(selections);
    const grandTotal    = selectedItems.reduce((s, { coin, qty }) => s + parseFloat(coin.price) * qty, 0);

    const handleConfirm = async () => {
        if (selectedItems.length === 0) { setError('Please select at least one coin.'); return; }
        setError(null); setLoading(true);
        try {
            const res = await fetch('/api/bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    payment_method: payMethod,
                    items: selectedItems.map(({ coin, qty }) => ({
                        coin_id: coin.id, coin_name: coin.name, coin_price: coin.price, quantity: qty,
                    })),
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? 'Failed to create bill.'); }
            else { setSelections({}); setReceipt(data); }
        } catch (_) { setError('Network error. Please try again.'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetch('/api/coins', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
            .then(r => r.json())
            .then(d => setCoins(Array.isArray(d) ? d : []))
            .finally(() => setPageLoad(false));
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="max-w-6xl mx-auto px-6 py-8">

                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 text-xl font-bold transition">‹</button>
                    <h1 className="text-2xl font-extrabold tracking-wide text-gray-800 uppercase">Billing</h1>
                </div>

                {pageLoad ? (
                    <div className="text-center text-gray-500 py-20">Loading…</div>
                ) : (
                    <div className="flex gap-6 items-start">

                        {/* ── LEFT: Coins Grid ─────────────────────────────── */}
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 bg-[#1a237e]">
                                    <p className="text-white font-bold text-sm uppercase tracking-wider">Available Coins</p>
                                    <p className="text-blue-300 text-xs mt-0.5">Select coins to add to the order</p>
                                </div>

                                <div className="p-5">
                                    {coins.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-10">No coins found. Add some coins first.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {coins.map(coin => {
                                                const sel = selections[coin.id];
                                                return (
                                                    <div
                                                        key={coin.id}
                                                        onClick={() => toggle(coin)}
                                                        className={`relative rounded-2xl border-2 cursor-pointer transition-all select-none overflow-hidden
                                                            ${sel ? 'border-[#1a237e] shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                                                    >
                                                        {/* Selected badge */}
                                                        {sel && (
                                                            <div className="absolute top-2 right-2 w-5 h-5 bg-[#1a237e] rounded-full flex items-center justify-center z-10">
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                                                                </svg>
                                                            </div>
                                                        )}

                                                        {/* Coin visual */}
                                                        <div className={`flex flex-col items-center pt-5 pb-3 px-3 ${sel ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-2xl shadow-md mb-2">
                                                                🪙
                                                            </div>
                                                            <p className="font-bold text-gray-800 text-sm text-center leading-tight">{coin.name}</p>
                                                            <p className="text-xs font-semibold text-[#1a237e] mt-1">LKR {parseFloat(coin.price).toFixed(2)}</p>
                                                        </div>

                                                        {/* Qty stepper (visible when selected) */}
                                                        {sel ? (
                                                            <div
                                                                className="flex items-center justify-center gap-3 bg-[#1a237e] py-2"
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                <button
                                                                    onClick={() => setQty(coin.id, -1)}
                                                                    className="w-6 h-6 rounded-full bg-white text-[#1a237e] font-bold text-sm flex items-center justify-center hover:bg-blue-100 transition"
                                                                >−</button>
                                                                <span className="text-white font-bold text-sm w-5 text-center">{sel.qty}</span>
                                                                <button
                                                                    onClick={() => setQty(coin.id, +1)}
                                                                    className="w-6 h-6 rounded-full bg-white text-[#1a237e] font-bold text-sm flex items-center justify-center hover:bg-blue-100 transition"
                                                                >+</button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center bg-gray-100 py-2">
                                                                <span className="text-xs text-gray-400">Tap to add</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Order Summary ───────────────────────────── */}
                        <div className="w-80 flex-shrink-0 flex flex-col gap-4">

                            {/* Order items */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Order Summary</p>
                                    {selectedItems.length > 0 && (
                                        <span className="bg-[#1a237e] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {selectedItems.length}
                                        </span>
                                    )}
                                </div>

                                <div className="p-4 min-h-[120px]">
                                    {selectedItems.length === 0 ? (
                                        <div className="text-center py-6">
                                            <p className="text-3xl mb-2">🛒</p>
                                            <p className="text-xs text-gray-400">No coins selected yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedItems.map(({ coin, qty }) => (
                                                <div key={coin.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-sm flex-shrink-0">🪙</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-gray-800 truncate">{coin.name}</p>
                                                        <p className="text-xs text-gray-400">LKR {parseFloat(coin.price).toFixed(2)} × {qty}</p>
                                                    </div>
                                                    <p className="text-sm font-extrabold text-gray-900">LKR {(parseFloat(coin.price) * qty).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Total */}
                                {selectedItems.length > 0 && (
                                    <div className="mx-4 mb-4 bg-[#1a237e] rounded-xl px-4 py-3 flex justify-between items-center">
                                        <span className="text-white font-bold text-sm">Total</span>
                                        <span className="text-white font-extrabold text-lg">LKR {grandTotal.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Payment Method</p>
                                </div>
                                <div className="p-4 flex gap-3">
                                    {/* Cash */}
                                    <button
                                        onClick={() => setPayMethod('cash')}
                                        className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all
                                            ${payMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all
                                            ${payMethod === 'cash' ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-gray-200'}`}>
                                            💵
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wide ${payMethod === 'cash' ? 'text-green-700' : 'text-gray-400'}`}>
                                            Cash
                                        </span>
                                        {payMethod === 'cash' && (
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        )}
                                    </button>

                                    {/* Card */}
                                    <button
                                        onClick={() => setPayMethod('card')}
                                        className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all
                                            ${payMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all
                                            ${payMethod === 'card' ? 'bg-blue-500 shadow-lg shadow-blue-200' : 'bg-gray-200'}`}>
                                            💳
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wide ${payMethod === 'card' ? 'text-blue-700' : 'text-gray-400'}`}>
                                            Card
                                        </span>
                                        {payMethod === 'card' && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-200">{error}</p>}

                            {/* Confirm */}
                            <button
                                onClick={handleConfirm}
                                disabled={loading || selectedItems.length === 0}
                                className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-2xl py-4 text-sm font-extrabold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                        </svg>
                                        Processing…
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                        </svg>
                                        Confirm Order
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {receipt && <ReceiptModal bill={receipt} onClose={() => setReceipt(null)} />}
        </div>
    );
}
