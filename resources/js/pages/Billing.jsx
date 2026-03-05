import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

// ── Print Receipt Function ───────────────────────────────────────────────────
function printReceipt(bill) {
    const win = window.open('', '_blank', 'width=800,height=900');

    win.document.write(`
        <html>
        <head>
            <title>Receipt ${bill.bill_number}</title>
            <style>
                @page {
                    size: 90mm auto;
                    margin: 12mm;
                }
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0 auto;
                    padding: 10mm 5mm;
                    max-width: 90mm;
                    font-size: 14px;

                    color: #000;
                    background: #fff;
                }
                .logo-container {
                    text-align: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #000;
                }
                .logo {
                    max-width: 200px;
                    height: auto;
                    margin: 0 auto 8px;
                    display: block;
                }
                .center { text-align: center; }
                .divider {
                    border-top: 1px dashed #000;
                    margin: 12px 0;
                }
                .section-divider {
                    border-top: 2px solid #000;
                    margin: 15px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 12px 0;
                }
                td, th {
                    padding: 6px 4px;
                    text-align: left;
                    color: #000;
                    font-size: 13px;
                }
                th {
                    border-bottom: 1px solid #000;
                    font-weight: bold;
                }
                .right { text-align: right; }
                .bold { font-weight: bold; }
                .title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #000;
                    margin-bottom: 4px;
                }
                .subtitle {
                    font-size: 13px;
                    color: #000;
                    margin-bottom: 3px;
                }
                .bill-label {
                    font-size: 13px;
                    color: #000;
                    font-weight: bold;
                    margin-top: 10px;
                }
                .bill-number {
                    font-size: 14px;
                    font-weight: bold;
                    color: #000;
                    margin: 5px 0;
                }
                .bill-date {
                    font-size: 13px;
                    color: #000;
                    margin-bottom: 8px;
                }
                .customer-box {
                    border: 2px solid #000;
                    padding: 10px;
                    margin: 12px 0;
                    background: #fff;
                }
                .customer-label {
                    font-size: 12px;
                    font-weight: bold;
                    color: #000;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                .customer-name {
                    font-size: 14px;
                    font-weight: bold;
                    color: #000;
                    margin-bottom: 3px;
                }
                .customer-phone {
                    font-size: 13px;
                    color: #000;
                }
                .item-row {
                    border-bottom: 1px solid #ccc;
                      font-weight: 600;
                }
                .item-name {

                    color: #000;
                    font-size: 12px;
                }
                .item-detail {
                    color: #000;
                    font-size: 12px;
                }
                .total-section {
                    border-top: 2px solid #000;
                    margin-top: 15px;
                    padding-top: 12px;
                }
                .total-label {
                    font-weight: bold;
                    font-size: 13px;
                    text-transform: uppercase;
                    color: #000;
                }
                .total-amount {
                    font-weight: bold;
                    font-size: 14px;
                    color: #000;
                    text-align: right;
                }
                .payment-section {
                    margin-top: 12px;
                    padding: 10px;
                    border: 1px solid #000;
                    background: #f9f9f9;
                }
                .payment-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                    font-size: 13px;
                    color: #000;
                }
                .balance-row {
                    border-top: 1px solid #000;
                    padding-top: 8px;
                    margin-top: 8px;
                }
                .balance-label {
                    font-weight: bold;
                    font-size: 13px;
                    color: #000;
                }
                .balance-amount {
                    font-weight: bold;
                    font-size: 12px;
                    color: #000;
                }
                .footer {
                    margin-top: 20px;
                    padding-top: 12px;
                    border-top: 1px dashed #000;
                    text-align: center;
                }
                .footer-text {
                    font-size: 10px;
                    color: #000;
                    margin: 4px 0;
                    font-weight: 600;
                }
                .footer-url {
                    font-size: 10px;
                    color: #000;
                    margin-top: 6px;
                }
                @media print {
                    @page {
                        size: 90mm auto;
                        margin: 12mm;
                    }
                    body {
                        margin: 0;
                        padding: 5mm 6mm 12mm;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Logo and Header -->
            <div class="logo-container">
                <img src="/images/logo.png" alt="PlayArea Logo" class="logo" />
                <p class="title">PLAY AREA</p>

            </div>

            <!-- Bill Details -->
            <div class="center">
                <p class="bill-label">BILL RECEIPT</p>
                <p class="bill-number">${bill.bill_number}</p>
                <p class="bill-date">${new Date(bill.created_at).toLocaleString()}</p>
            </div>

            ${bill.customer ? `
            <!-- Customer Information -->
            <div class="customer-box">
                <p class="customer-label">Customer Details</p>
                <p class="customer-name">${bill.customer.name}</p>
                <p class="customer-phone">Tel: ${bill.customer.phone}</p>
            </div>
            ` : ''}

            <div class="divider"></div>

            <!-- Items Table -->
            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;">Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${bill.items.map(item => `
                        <tr class="item-row">
                            <td class="item-name">${item.coin_name}</td>
                            <td class="item-detail" style="text-align: center;">x${item.quantity}</td>
                            <td class="item-detail" style="text-align: right;">LKR ${parseFloat(item.coin_price).toFixed(2)}</td>
                            <td class="item-detail" style="text-align: right; font-weight: bold;">LKR ${parseFloat(item.subtotal).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Total Section -->
            <div class="total-section">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="total-label">Grand Total</span>
                    <span class="total-amount">LKR ${parseFloat(bill.total).toFixed(2)}</span>
                </div>
            </div>

            ${bill.payment_method ? `
            <!-- Payment Details -->
            <div class="payment-section">
                <div class="payment-row">
                    <span style="font-weight: bold;">Payment Method:</span>
                    <span>${bill.payment_method === 'card' ? 'Card' : 'Cash'}</span>
                </div>
                ${bill.payment_method === 'cash' && bill.cash_amount ? `
                    <div class="payment-row">
                        <span>Cash Given:</span>
                        <span style="font-weight: bold;">LKR ${parseFloat(bill.cash_amount).toFixed(2)}</span>
                    </div>
                    <div class="payment-row balance-row">
                        <span class="balance-label">Balance:</span>
                        <span class="balance-amount">LKR ${(parseFloat(bill.cash_amount) - parseFloat(bill.total)).toFixed(2)}</span>
                    </div>
                ` : ''}
            </div>
            ` : ''}

            <!-- Footer -->
            <div class="footer">
                <p class="footer-text">
                We hope you enjoyed the play area! Come again for more fun times.
                </p>

            </div>
        </body>
        </html>
    `);

    win.document.close();
    win.focus();
    win.onafterprint = () => win.close();
    setTimeout(() => win.print(), 300);
}

// ── Billing Page ───────────────────────────────────────────────────────────────
export default function Billing() {
    const { token }                   = useAuth();
    const navigate                    = useNavigate();
    const [coins,      setCoins]      = useState([]);
    const [selections, setSelections] = useState({});
    const [payMethod,  setPayMethod]  = useState('cash');
    const [cashAmount, setCashAmount] = useState('');
    const [loading,    setLoading]    = useState(false);
    const [pageLoad,   setPageLoad]   = useState(true);
    const [error,      setError]      = useState(null);

    // Customer states
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerResults, setCustomerResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [customerForm, setCustomerForm] = useState({ name: '', phone: '' });
    const [customerError, setCustomerError] = useState('');

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
    const cashGiven     = parseFloat(cashAmount) || 0;
    const balance       = cashGiven - grandTotal;

    // Customer search function
    const handleCustomerSearch = async () => {
        if (!customerSearch.trim()) {
            setCustomerResults([]);
            return;
        }

        try {
            const res = await fetch(`/api/customers`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            const data = await res.json();

            // Filter customers by name or phone
            const filtered = Array.isArray(data) ? data.filter(c =>
                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                c.phone.includes(customerSearch)
            ) : [];

            setCustomerResults(filtered);
        } catch (err) {
            console.error('Error searching customers:', err);
            setCustomerResults([]);
        }
    };

    // Select customer from search results
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setCustomerResults([]);
        setCustomerSearch('');
        setShowCustomerForm(false);
    };

    // Create new customer
    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        setCustomerError('');

        if (!customerForm.name || !customerForm.phone) {
            setCustomerError('Name and phone are required');
            return;
        }

        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(customerForm)
            });

            const data = await res.json();

            if (!res.ok) {
                setCustomerError(data.message || 'Failed to create customer');
            } else {
                setSelectedCustomer(data);
                setCustomerForm({ name: '', phone: '' });
                setShowCustomerForm(false);
                setCustomerError('');
            }
        } catch (err) {
            setCustomerError('Network error. Please try again.');
        }
    };

    const handleConfirm = async () => {
        if (selectedItems.length === 0) { setError('Please select at least one coin.'); return; }
        if (payMethod === 'cash' && cashGiven < grandTotal) {
            setError('Cash amount must be greater than or equal to total.');
            return;
        }
        setError(null); setLoading(true);
        try {
            const res = await fetch('/api/bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    customer_id: selectedCustomer?.id || null,
                    payment_method: payMethod,
                    cash_amount: payMethod === 'cash' ? cashGiven : null,
                    items: selectedItems.map(({ coin, qty }) => ({
                        coin_id: coin.id, coin_name: coin.name, coin_price: coin.price, quantity: qty,
                    })),
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? 'Failed to create bill.'); }
            else {
                setSelections({});
                setCashAmount('');
                setSelectedCustomer(null);
                printReceipt(data);
            }
        } catch (_) { setError('Network error. Please try again.'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!token) return;

        fetch('/api/coins', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
            .then(r => {
                if (!r.ok) throw new Error('Failed to fetch coins');
                return r.json();
            })
            .then(d => setCoins(Array.isArray(d) ? d : []))
            .catch(err => {
                console.error('Error loading coins:', err);
                setCoins([]);
            })
            .finally(() => setPageLoad(false));
    }, [token]);

    // Clear cash amount when switching to card payment
    useEffect(() => {
        if (payMethod === 'card') {
            setCashAmount('');
        }
    }, [payMethod]);

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

                                {/* Customer Search/Create Section */}
                                <div className="p-5 bg-gray-50 border-b border-gray-200">
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Customer (Optional)</p>

                                    {selectedCustomer ? (
                                        <div className="bg-white border-2 border-green-500 rounded-xl p-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{selectedCustomer.name}</p>
                                                <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedCustomer(null)}
                                                className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Search Bar */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customerSearch}
                                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleCustomerSearch()}
                                                    placeholder="Search by name or phone..."
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={handleCustomerSearch}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    Search
                                                </button>
                                                <button
                                                    onClick={() => setShowCustomerForm(!showCustomerForm)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                                                >
                                                    + New
                                                </button>
                                            </div>

                                            {/* Search Results */}
                                            {customerResults.length > 0 && (
                                                <div className="bg-white border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                                                    {customerResults.map(customer => (
                                                        <button
                                                            key={customer.id}
                                                            onClick={() => handleSelectCustomer(customer)}
                                                            className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition"
                                                        >
                                                            <p className="font-semibold text-sm text-gray-800">{customer.name}</p>
                                                            <p className="text-xs text-gray-500">{customer.phone}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Create Customer Form */}
                                            {showCustomerForm && (
                                                <div className="bg-white border border-gray-300 rounded-lg p-4">
                                                    <p className="text-sm font-bold text-gray-700 mb-3">Add New Customer</p>
                                                    <form onSubmit={handleCreateCustomer} className="space-y-3">
                                                        <div>
                                                            <input
                                                                type="text"
                                                                value={customerForm.name}
                                                                onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                                                                placeholder="Full Name"
                                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="text"
                                                                value={customerForm.phone}
                                                                onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                                                                placeholder="Phone Number"
                                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                                required
                                                            />
                                                        </div>
                                                        {customerError && (
                                                            <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{customerError}</p>
                                                        )}
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setShowCustomerForm(false);
                                                                    setCustomerForm({ name: '', phone: '' });
                                                                    setCustomerError('');
                                                                }}
                                                                className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-semibold transition"
                                                            >
                                                                Add Customer
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    )}
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

                            {/* Cash Amount Input - Only show when cash is selected */}
                            {payMethod === 'cash' && selectedItems.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Cash Payment</p>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-2">Cash Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">LKR</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={cashAmount}
                                                    onChange={(e) => setCashAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full border-2 border-gray-300 rounded-xl pl-16 pr-4 py-3 text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                                />
                                            </div>
                                        </div>
                                        {cashAmount && cashGiven >= grandTotal && (
                                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-semibold text-green-700">Balance (Change)</span>
                                                    <span className="text-lg font-extrabold text-green-700">LKR {balance.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                        {cashAmount && cashGiven < grandTotal && (
                                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                                                <p className="text-xs font-semibold text-red-700">⚠️ Insufficient amount. Need LKR {(grandTotal - cashGiven).toFixed(2)} more.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

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
        </div>
    );
}
