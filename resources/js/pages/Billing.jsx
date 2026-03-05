import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

// ── Print Coin Receipt ─────────────────────────────────────────────────────────
function printCoinReceipt(bill, coinItems) {
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
            <div class="logo-container">
                <img src="/images/logo.png" alt="PlayArea Logo" class="logo" />
                <p class="title">PLAY AREA</p>
                <p class="bill-date">Tel : 077 306 3000</p>
            </div>
            <div class="center">
                <p class="bill-label">COIN RECEIPT</p>
                <p class="bill-number">${bill.bill_number}</p>
                <p class="bill-date">${new Date().toLocaleString()}</p>
            </div>
            ${bill.customer ? `
            <div class="customer-box">
                <p class="customer-label">Customer Details</p>
                <p class="customer-name">${bill.customer.name}</p>
                <p class="customer-phone">Tel: ${bill.customer.phone}</p>
            </div>` : ''}
            <div class="divider"></div>
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
                    ${coinItems.map(item => `
                        <tr class="item-row">
                            <td class="item-name">${item.coin_name}</td>
                            <td class="item-detail" style="text-align: center;">x${item.quantity}</td>
                            <td class="item-detail" style="text-align: right;">LKR ${parseFloat(item.coin_price).toFixed(2)}</td>
                            <td class="item-detail" style="text-align: right; font-weight: bold;">LKR ${parseFloat(item.subtotal).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total-section">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="total-label">Coins Total</span>
                    <span class="total-amount">LKR ${coinItems.reduce((s, i) => s + parseFloat(i.subtotal), 0).toFixed(2)}</span>
                </div>
            </div>
            <div class="footer">
                <p class="footer-text">Bill is still open. Final bill will be printed upon checkout.</p>
            </div>
        </body>
        </html>
    `);
    win.document.close();
    win.focus();
    win.onafterprint = () => win.close();
    setTimeout(() => win.print(), 300);
}

// ── Print Final Bill ───────────────────────────────────────────────────────────
function printFinalBill(bill) {
    const win = window.open('', '_blank', 'width=800,height=900');

    const coinTotal    = bill.items.reduce((s, i) => s + parseFloat(i.subtotal), 0);
    const serviceTotal = bill.services.reduce((s, sv) => s + parseFloat(sv.subtotal), 0);
    const entranceFee  = parseFloat(bill.entrance_fee) || 0;

    win.document.write(`
        <html>
        <head>
            <title>Final Bill ${bill.bill_number}</title>
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
                .section-title {
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                    color: #000;
                    margin: 10px 0 5px;
                    padding-bottom: 3px;
                    border-bottom: 1px solid #000;
                }
                .subtotal-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    margin: 3px 0;
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
            <div class="logo-container">
                <img src="/images/logo.png" alt="PlayArea Logo" class="logo" />
                <p class="title">PLAY AREA</p>
                <p class="bill-date">Tel : 077 306 3000</p>
            </div>
            <div class="center">
                <p class="bill-label">FINAL BILL</p>
                <p class="bill-number">${bill.bill_number}</p>
                <p class="bill-date">${new Date(bill.updated_at).toLocaleString()}</p>
            </div>
            ${bill.customer ? `
            <div class="customer-box">
                <p class="customer-label">Customer Details</p>
                <p class="customer-name">${bill.customer.name}</p>
                <p class="customer-phone">Tel: ${bill.customer.phone}</p>
            </div>` : ''}
            <div class="divider"></div>

            ${entranceFee > 0 ? `
            <p class="section-title">Entrance Fee</p>
            <div class="subtotal-row">
                <span>Entrance</span>
                <span style="font-weight:bold;">LKR ${entranceFee.toFixed(2)}</span>
            </div>
            ` : ''}

            ${bill.items.length > 0 ? `
            <p class="section-title">Coins</p>
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
            <div class="subtotal-row" style="font-weight:bold; margin-top:5px;">
                <span>Coins Subtotal</span>
                <span>LKR ${coinTotal.toFixed(2)}</span>
            </div>
            ` : ''}

            ${bill.services.length > 0 ? `
            <p class="section-title">Services</p>
            ${bill.services.map(sv => {
                const elapsed = sv.started_at && sv.ended_at
                    ? Math.max(0, Math.round((new Date(sv.ended_at) - new Date(sv.started_at)) / 60000))
                    : 0;
                return `
                <div style="margin: 8px 0; padding: 6px 0; border-bottom: 1px solid #ccc;">
                    <div class="subtotal-row">
                        <span style="font-weight:bold;">${sv.service_name}</span>
                        <span style="font-weight:bold;">LKR ${parseFloat(sv.subtotal).toFixed(2)}</span>
                    </div>
                    <div style="font-size:11px; color:#000; margin-top:2px;">
                        Base: LKR ${parseFloat(sv.base_price).toFixed(2)} (${sv.base_duration} mins)
                        ${elapsed > sv.base_duration && sv.stage1_price ? ` | 1st Stage: +LKR ${parseFloat(sv.stage1_price).toFixed(2)}` : ''}
                        ${elapsed > sv.base_duration + (sv.stage1_duration || 0) && sv.stage2_price ? ` | 2nd Stage: +LKR ${parseFloat(sv.stage2_price).toFixed(2)}/every ${sv.stage2_duration} mins` : ''}
                    </div>
                    <div style="font-size:11px; color:#000;">Duration: ${elapsed} mins</div>
                </div>`;
            }).join('')}
            <div class="subtotal-row" style="font-weight:bold; margin-top:5px;">
                <span>Services Subtotal</span>
                <span>LKR ${serviceTotal.toFixed(2)}</span>
            </div>
            ` : ''}

            <div class="total-section">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="total-label">Grand Total</span>
                    <span class="total-amount">LKR ${parseFloat(bill.total).toFixed(2)}</span>
                </div>
            </div>

            ${bill.payment_method ? `
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
            </div>` : ''}

            <div class="footer">
                <p class="footer-text">We hope you enjoyed the play area! Come again for more fun times.</p>
            </div>
        </body>
        </html>
    `);
    win.document.close();
    win.focus();
    win.onafterprint = () => win.close();
    setTimeout(() => win.print(), 300);
}

// ── Helper: Calculate service cost client-side for live display ────────────────
function calcServiceCost(bs) {
    const start = new Date(bs.started_at);
    const end   = bs.ended_at ? new Date(bs.ended_at) : new Date();
    const elapsed = Math.max(0, Math.floor((end - start) / 60000));

    let cost = parseFloat(bs.base_price);
    let remaining = elapsed - bs.base_duration;

    if (remaining <= 0) return cost;

    if (bs.stage1_duration && bs.stage1_price) {
        cost += parseFloat(bs.stage1_price);
        remaining -= bs.stage1_duration;
    }

    if (remaining <= 0) return cost;

    if (bs.stage2_duration && bs.stage2_price && remaining > 0) {
        const cycles = Math.ceil(remaining / bs.stage2_duration);
        cost += parseFloat(bs.stage2_price) * cycles;
    }

    return cost;
}

// ── Helper: Format elapsed time ───────────────────────────────────────────────
function formatElapsed(startedAt) {
    const start = new Date(startedAt);
    const now   = new Date();
    const diff  = Math.max(0, Math.floor((now - start) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
}

// ── Helper: Get stage label ───────────────────────────────────────────────────
function getStageLabel(bs) {
    const start = new Date(bs.started_at);
    const now   = bs.ended_at ? new Date(bs.ended_at) : new Date();
    const elapsed = Math.max(0, Math.floor((now - start) / 60000));

    if (elapsed <= bs.base_duration) return { label: 'Base', color: 'bg-green-100 text-green-800' };
    const afterBase = elapsed - bs.base_duration;
    if (bs.stage1_duration && afterBase <= bs.stage1_duration) return { label: '1st Stage', color: 'bg-amber-100 text-amber-800' };
    return { label: '2nd Stage', color: 'bg-red-100 text-red-800' };
}

// ── Billing Page ───────────────────────────────────────────────────────────────
export default function Billing() {
    const { token }  = useAuth();
    const navigate   = useNavigate();

    // Data
    const [coins, setCoins]           = useState([]);
    const [services, setServices]     = useState([]);
    const [openBills, setOpenBills]   = useState([]);
    const [activeBill, setActiveBill] = useState(null);

    // Coin selection for active bill
    const [selections, setSelections] = useState({});

    // Service selection
    const [showServicePicker, setShowServicePicker] = useState(false);

    // Payment
    const [payMethod, setPayMethod]   = useState('cash');
    const [cashAmount, setCashAmount] = useState('');
    const [showCloseBill, setShowCloseBill] = useState(false);

    // Customer for new bill
    const [customerSearch, setCustomerSearch]     = useState('');
    const [customerResults, setCustomerResults]   = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [customerForm, setCustomerForm]         = useState({ name: '', phone: '' });
    const [customerError, setCustomerError]       = useState('');

    // UI
    const [loading, setLoading]   = useState(false);
    const [pageLoad, setPageLoad] = useState(true);
    const [error, setError]       = useState(null);
    const [tick, setTick]         = useState(0);

    // Timer for live updates
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch data
    const fetchData = useCallback(async () => {
        if (!token) return;
        try {
            const [coinsRes, servicesRes, billsRes] = await Promise.all([
                fetch('/api/coins', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
                fetch('/api/services', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
                fetch('/api/bills/open', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
            ]);
            const [coinsData, servicesData, billsData] = await Promise.all([
                coinsRes.json(), servicesRes.json(), billsRes.json(),
            ]);
            setCoins(Array.isArray(coinsData) ? coinsData : []);
            setServices(Array.isArray(servicesData) ? servicesData : []);
            setOpenBills(Array.isArray(billsData) ? billsData : []);

            // Update active bill data
            if (activeBill) {
                const updated = (Array.isArray(billsData) ? billsData : []).find(b => b.id === activeBill.id);
                if (updated) setActiveBill(updated);
            }
        } catch (_) {}
        finally { setPageLoad(false); }
    }, [token, activeBill?.id]);

    useEffect(() => { fetchData(); }, [token]);

    // Refresh active bill
    const refreshBill = async (billId) => {
        try {
            const res = await fetch(`/api/bills/${billId}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            setActiveBill(data);
            // Also refresh open bills list
            const billsRes = await fetch('/api/bills/open', {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const billsData = await billsRes.json();
            setOpenBills(Array.isArray(billsData) ? billsData : []);
        } catch (_) {}
    };

    // Open new bill
    const handleOpenBill = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/bills/open', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ customer_id: selectedCustomer?.id || null }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? 'Failed to open bill.'); }
            else {
                setActiveBill(data);
                setSelectedCustomer(null);
                setCustomerSearch('');
                await fetchData();
            }
        } catch (_) { setError('Network error.'); }
        finally { setLoading(false); }
    };

    // Add coins to active bill
    const selectedItems = Object.values(selections);
    const coinTotal = selectedItems.reduce((s, { coin, qty }) => s + parseFloat(coin.price) * qty, 0);

    const toggle = (coin) => {
        setSelections(prev => {
            const copy = { ...prev };
            if (copy[coin.id]) delete copy[coin.id];
            else copy[coin.id] = { coin, qty: 1 };
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

    const handleAddCoins = async () => {
        if (!activeBill || selectedItems.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const items = selectedItems.map(({ coin, qty }) => ({
                coin_id: coin.id, coin_name: coin.name, coin_price: coin.price, quantity: qty,
            }));
            const res = await fetch(`/api/bills/${activeBill.id}/coins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ items }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? 'Failed to add coins.'); }
            else {
                // Find the newly added items for coin receipt
                const prevItemIds = new Set(activeBill.items.map(i => i.id));
                const newItems = data.items.filter(i => !prevItemIds.has(i.id));
                printCoinReceipt(data, newItems.length > 0 ? newItems : items.map(i => ({ ...i, subtotal: i.coin_price * i.quantity })));
                setActiveBill(data);
                setSelections({});
                await fetchData();
            }
        } catch (_) { setError('Network error.'); }
        finally { setLoading(false); }
    };

    // Add service to active bill
    const handleAddService = async (serviceId) => {
        if (!activeBill) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/bills/${activeBill.id}/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ service_id: serviceId }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? 'Failed to add service.'); }
            else {
                setActiveBill(data);
                setShowServicePicker(false);
                await fetchData();
            }
        } catch (_) { setError('Network error.'); }
        finally { setLoading(false); }
    };

    // Remove a service entirely
    const handleRemoveService = async (billServiceId) => {
        if (!activeBill) return;
        if (!window.confirm('Remove this service from the bill?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/bills/${activeBill.id}/services/${billServiceId}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setActiveBill(data);
                await fetchData();
            }
        } catch (_) {}
        finally { setLoading(false); }
    };

    // Stop a service
    const handleStopService = async (billServiceId) => {
        if (!activeBill) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/bills/${activeBill.id}/services/${billServiceId}/stop`, {
                method: 'POST',
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setActiveBill(data);
                await fetchData();
            }
        } catch (_) {}
        finally { setLoading(false); }
    };

    // Close bill
    const handleCloseBill = async () => {
        if (!activeBill) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/bills/${activeBill.id}/close`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    payment_method: payMethod,
                    cash_amount: payMethod === 'cash' ? (parseFloat(cashAmount) || 0) : null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? 'Failed to close bill.'); }
            else {
                printFinalBill(data);
                setActiveBill(null);
                setShowCloseBill(false);
                setPayMethod('cash');
                setCashAmount('');
                await fetchData();
            }
        } catch (_) { setError('Network error.'); }
        finally { setLoading(false); }
    };

    // Customer search
    const handleCustomerSearch = async () => {
        if (!customerSearch.trim()) { setCustomerResults([]); return; }
        try {
            const res = await fetch('/api/customers', {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            const filtered = Array.isArray(data) ? data.filter(c =>
                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                c.phone.includes(customerSearch)
            ) : [];
            setCustomerResults(filtered);
        } catch (_) { setCustomerResults([]); }
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setCustomerResults([]);
        setCustomerSearch('');
        setShowCustomerForm(false);
    };

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
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(customerForm),
            });
            const data = await res.json();
            if (!res.ok) { setCustomerError(data.message || 'Failed to create customer'); }
            else {
                setSelectedCustomer(data);
                setCustomerForm({ name: '', phone: '' });
                setShowCustomerForm(false);
            }
        } catch (_) { setCustomerError('Network error.'); }
    };

    // Calculate live totals for active bill
    const liveEntranceFee  = activeBill ? parseFloat(activeBill.entrance_fee) || 0 : 0;
    const liveCoinTotal    = activeBill ? activeBill.items.reduce((s, i) => s + parseFloat(i.subtotal), 0) : 0;
    const liveServiceTotal = activeBill ? activeBill.services.reduce((s, bs) => s + calcServiceCost(bs), 0) : 0;
    const liveGrandTotal   = liveEntranceFee + liveCoinTotal + liveServiceTotal;

    const cashGiven = parseFloat(cashAmount) || 0;
    const balance   = cashGiven - liveGrandTotal;

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
                ) : !activeBill ? (
                    /* ── No Active Bill: Show open bills list + create new ── */
                    <div className="space-y-6">
                        {/* Open Bills */}
                        {openBills.length > 0 && (
                            <div>
                                <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Open Bills</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {openBills.map(bill => (
                                        <div key={bill.id}
                                            onClick={() => setActiveBill(bill)}
                                            className="bg-white rounded-2xl shadow-sm border-2 border-green-400 p-5 cursor-pointer hover:shadow-md hover:border-green-500 transition">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-bold text-sm text-gray-800">{bill.bill_number}</p>
                                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">OPEN</span>
                                            </div>
                                            {bill.customer && (
                                                <p className="text-xs text-gray-500">{bill.customer.name} — {bill.customer.phone}</p>
                                            )}
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-xs text-gray-400">{bill.items.length} coins, {bill.services.length} services</span>
                                                <span className="text-sm font-bold text-gray-800">LKR {parseFloat(bill.total).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Create New Bill */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-md">
                            <div className="px-5 py-4 bg-[#1a237e]">
                                <p className="text-white font-bold text-sm uppercase tracking-wider">Open New Bill</p>
                                <p className="text-blue-300 text-xs mt-0.5">Select a customer and open a new bill</p>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* Customer */}
                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Customer (Optional)</p>
                                {selectedCustomer ? (
                                    <div className="bg-white border-2 border-green-500 rounded-xl p-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{selectedCustomer.name}</p>
                                            <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
                                        </div>
                                        <button onClick={() => setSelectedCustomer(null)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Remove</button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input type="text" value={customerSearch}
                                                onChange={e => setCustomerSearch(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && handleCustomerSearch()}
                                                placeholder="Search by name or phone..."
                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            <button onClick={handleCustomerSearch}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                Search
                                            </button>
                                            <button onClick={() => setShowCustomerForm(!showCustomerForm)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">+ New</button>
                                        </div>
                                        {customerResults.length > 0 && (
                                            <div className="bg-white border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                                                {customerResults.map(c => (
                                                    <button key={c.id} onClick={() => handleSelectCustomer(c)}
                                                        className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition">
                                                        <p className="font-semibold text-sm text-gray-800">{c.name}</p>
                                                        <p className="text-xs text-gray-500">{c.phone}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showCustomerForm && (
                                            <div className="bg-white border border-gray-300 rounded-lg p-4">
                                                <p className="text-sm font-bold text-gray-700 mb-3">Add New Customer</p>
                                                <form onSubmit={handleCreateCustomer} className="space-y-3">
                                                    <input type="text" value={customerForm.name}
                                                        onChange={e => setCustomerForm(p => ({ ...p, name: e.target.value }))}
                                                        placeholder="Full Name" required
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                                    <input type="text" value={customerForm.phone}
                                                        onChange={e => setCustomerForm(p => ({ ...p, phone: e.target.value }))}
                                                        placeholder="Phone Number" required
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                                    {customerError && <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{customerError}</p>}
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => { setShowCustomerForm(false); setCustomerForm({ name: '', phone: '' }); setCustomerError(''); }}
                                                            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                                                        <button type="submit"
                                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-semibold transition">Add Customer</button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-200">{error}</p>}

                                <button onClick={handleOpenBill} disabled={loading}
                                    className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-2xl py-4 text-sm font-extrabold uppercase tracking-widest transition">
                                    {loading ? 'Opening…' : 'Open New Bill'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── Active Bill View ── */
                    <div className="flex gap-6 items-start">

                        {/* ── LEFT: Coins + Services ─── */}
                        <div className="flex-1 space-y-5">

                            {/* Active bill header */}
                            <div className="bg-white rounded-2xl shadow-sm border-2 border-green-400 p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-sm text-gray-800">{activeBill.bill_number}</p>
                                    {activeBill.customer && <p className="text-xs text-gray-500">{activeBill.customer.name} — {activeBill.customer.phone}</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">OPEN</span>
                                    <button onClick={() => { setActiveBill(null); setSelections({}); setShowServicePicker(false); setShowCloseBill(false); setError(null); }}
                                        className="text-xs text-gray-500 hover:text-gray-700 font-semibold">← Back to Bills</button>
                                </div>
                            </div>

                            {/* Coins Grid */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 bg-[#1a237e]">
                                    <p className="text-white font-bold text-sm uppercase tracking-wider">Available Coins</p>
                                    <p className="text-blue-300 text-xs mt-0.5">Select coins to add to the bill</p>
                                </div>
                                <div className="p-5">
                                    {coins.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-10">No coins found. Add some coins first.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {coins.map(coin => {
                                                const sel = selections[coin.id];
                                                return (
                                                    <div key={coin.id} onClick={() => toggle(coin)}
                                                        className={`relative rounded-2xl border-2 cursor-pointer transition-all select-none overflow-hidden
                                                            ${sel ? 'border-[#1a237e] shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                                                        {sel && (
                                                            <div className="absolute top-2 right-2 w-5 h-5 bg-[#1a237e] rounded-full flex items-center justify-center z-10">
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className={`flex flex-col items-center pt-5 pb-3 px-3 ${sel ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-2xl shadow-md mb-2">🪙</div>
                                                            <p className="font-bold text-gray-800 text-sm text-center leading-tight">{coin.name}</p>
                                                            <p className="text-xs font-semibold text-[#1a237e] mt-1">LKR {parseFloat(coin.price).toFixed(2)}</p>
                                                        </div>
                                                        {sel ? (
                                                            <div className="flex items-center justify-center gap-3 bg-[#1a237e] py-2" onClick={e => e.stopPropagation()}>
                                                                <button onClick={() => setQty(coin.id, -1)}
                                                                    className="w-6 h-6 rounded-full bg-white text-[#1a237e] font-bold text-sm flex items-center justify-center hover:bg-blue-100 transition">−</button>
                                                                <span className="text-white font-bold text-sm w-5 text-center">{sel.qty}</span>
                                                                <button onClick={() => setQty(coin.id, +1)}
                                                                    className="w-6 h-6 rounded-full bg-white text-[#1a237e] font-bold text-sm flex items-center justify-center hover:bg-blue-100 transition">+</button>
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

                                    {selectedItems.length > 0 && (
                                        <div className="mt-4 flex justify-end">
                                            <button onClick={handleAddCoins} disabled={loading}
                                                className="bg-[#1a237e] hover:bg-[#0d1654] disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                                Add & Print Coin Receipt (LKR {coinTotal.toFixed(2)})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Active Services */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 bg-[#00838f] flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-bold text-sm uppercase tracking-wider">Active Services</p>
                                        <p className="text-teal-200 text-xs mt-0.5">
                                            {activeBill.services.length === 0 ? 'No services added yet' : `${activeBill.services.length} service(s)`}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowServicePicker(!showServicePicker)}
                                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                                        + Add Service
                                    </button>
                                </div>

                                {/* Service picker */}
                                {showServicePicker && (
                                    <div className="p-4 bg-teal-50 border-b border-teal-200">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {services.map(svc => (
                                                <button key={svc.id} onClick={() => handleAddService(svc.id)}
                                                    className="bg-white border border-teal-300 rounded-xl p-3 text-left hover:border-teal-500 hover:shadow-sm transition">
                                                    <p className="font-bold text-sm text-gray-800">{svc.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        LKR {parseFloat(svc.base_price).toFixed(2)} / {svc.base_duration} mins
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-5">
                                    {activeBill.services.length === 0 ? (
                                        <div className="text-center py-6">
                                            <p className="text-3xl mb-2">🎯</p>
                                            <p className="text-xs text-gray-400">No services added to this bill</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {activeBill.services.map(bs => {
                                                const running = !bs.ended_at;
                                                const stage   = getStageLabel(bs);
                                                const cost    = calcServiceCost(bs);
                                                return (
                                                    <div key={bs.id} className={`rounded-xl border-2 p-4 transition ${running ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-gray-50'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-sm text-gray-800">{bs.service_name}</p>
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.color}`}>{stage.label}</span>
                                                            </div>
                                                            <p className="text-sm font-extrabold text-gray-900">LKR {cost.toFixed(2)}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                                            <span>
                                                                {running
                                                                    ? `⏱ ${formatElapsed(bs.started_at)}`
                                                                    : `Duration: ${Math.max(0, Math.round((new Date(bs.ended_at) - new Date(bs.started_at)) / 60000))} mins`
                                                                }
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                {running && (
                                                                    <button onClick={() => handleStopService(bs.id)}
                                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition">
                                                                        Stop
                                                                    </button>
                                                                )}
                                                                {!running && (
                                                                    <span className="text-xs font-semibold text-gray-400">Completed</span>
                                                                )}
                                                                <button onClick={() => handleRemoveService(bs.id)}
                                                                    className="bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-500 px-2 py-1 rounded-lg text-xs font-bold transition">
                                                                    ✕ Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-400">
                                                            Base: LKR {parseFloat(bs.base_price).toFixed(2)} ({bs.base_duration}m)
                                                            {bs.stage1_price && ` → 1st: +LKR ${parseFloat(bs.stage1_price).toFixed(2)} (${bs.stage1_duration}m)`}
                                                            {bs.stage2_price && ` → 2nd: +LKR ${parseFloat(bs.stage2_price).toFixed(2)} (every ${bs.stage2_duration}m)`}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Bill Summary ─── */}
                        <div className="w-80 flex-shrink-0 flex flex-col gap-4">

                            {/* Bill Breakdown */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Bill Summary</p>
                                </div>
                                <div className="p-4 space-y-3 min-h-[120px]">

                                    {/* Entrance Fee */}
                                    {liveEntranceFee > 0 && (
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-sm flex-shrink-0 text-white">🎫</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-800">Entrance Fee</p>
                                            </div>
                                            <p className="text-sm font-extrabold text-gray-900">LKR {liveEntranceFee.toFixed(2)}</p>
                                        </div>
                                    )}

                                    {/* Coin Items */}
                                    {activeBill.items.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-sm flex-shrink-0">🪙</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-800 truncate">{item.coin_name}</p>
                                                <p className="text-xs text-gray-400">LKR {parseFloat(item.coin_price).toFixed(2)} × {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-extrabold text-gray-900">LKR {parseFloat(item.subtotal).toFixed(2)}</p>
                                        </div>
                                    ))}

                                    {/* Services */}
                                    {activeBill.services.map(bs => {
                                        const cost = calcServiceCost(bs);
                                        const running = !bs.ended_at;
                                        return (
                                            <div key={bs.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${running ? 'bg-teal-50' : 'bg-gray-50'}`}>
                                                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-sm flex-shrink-0 text-white">🎯</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 truncate">{bs.service_name}</p>
                                                    <p className="text-xs text-gray-400">{running ? '⏱ Running' : 'Completed'}</p>
                                                </div>
                                                <p className="text-sm font-extrabold text-gray-900">LKR {cost.toFixed(2)}</p>
                                            </div>
                                        );
                                    })}

                                    {activeBill.items.length === 0 && activeBill.services.length === 0 && liveEntranceFee === 0 && (
                                        <div className="text-center py-6">
                                            <p className="text-3xl mb-2">🛒</p>
                                            <p className="text-xs text-gray-400">No items yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="mx-4 mb-4 bg-[#1a237e] rounded-xl px-4 py-3 flex justify-between items-center">
                                    <span className="text-white font-bold text-sm">Total</span>
                                    <span className="text-white font-extrabold text-lg">LKR {liveGrandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Close Bill Section */}
                            {!showCloseBill ? (
                                <button onClick={() => setShowCloseBill(true)}
                                    className="w-full bg-gray-900 hover:bg-gray-700 text-white rounded-2xl py-4 text-sm font-extrabold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                    </svg>
                                    Close & Print Final Bill
                                </button>
                            ) : (
                                <>
                                    {/* Payment Method */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-100">
                                            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Payment Method</p>
                                        </div>
                                        <div className="p-4 flex gap-3">
                                            <button onClick={() => setPayMethod('cash')}
                                                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all
                                                    ${payMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all
                                                    ${payMethod === 'cash' ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-gray-200'}`}>💵</div>
                                                <span className={`text-xs font-bold uppercase tracking-wide ${payMethod === 'cash' ? 'text-green-700' : 'text-gray-400'}`}>Cash</span>
                                                {payMethod === 'cash' && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                            </button>
                                            <button onClick={() => setPayMethod('card')}
                                                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all
                                                    ${payMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all
                                                    ${payMethod === 'card' ? 'bg-blue-500 shadow-lg shadow-blue-200' : 'bg-gray-200'}`}>💳</div>
                                                <span className={`text-xs font-bold uppercase tracking-wide ${payMethod === 'card' ? 'text-blue-700' : 'text-gray-400'}`}>Card</span>
                                                {payMethod === 'card' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cash Amount */}
                                    {payMethod === 'cash' && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="px-5 py-4 border-b border-gray-100">
                                                <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Cash Payment</p>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-2">Cash Amount</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">LKR</span>
                                                        <input type="number" min="0" step="0.01" value={cashAmount}
                                                            onChange={e => setCashAmount(e.target.value)} placeholder="0.00"
                                                            className="w-full border-2 border-gray-300 rounded-xl pl-16 pr-4 py-3 text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
                                                    </div>
                                                </div>
                                                {cashAmount && cashGiven >= liveGrandTotal && (
                                                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-semibold text-green-700">Balance (Change)</span>
                                                            <span className="text-lg font-extrabold text-green-700">LKR {balance.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {cashAmount && cashGiven < liveGrandTotal && (
                                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                                                        <p className="text-xs font-semibold text-red-700">Insufficient amount. Need LKR {(liveGrandTotal - cashGiven).toFixed(2)} more.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-200">{error}</p>}

                                    <div className="flex gap-3">
                                        <button onClick={() => { setShowCloseBill(false); setError(null); }}
                                            className="flex-1 border-2 border-gray-300 text-gray-700 rounded-2xl py-3 text-sm font-bold hover:bg-gray-50 transition">
                                            Cancel
                                        </button>
                                        <button onClick={handleCloseBill}
                                            disabled={loading || (payMethod === 'cash' && cashGiven < liveGrandTotal)}
                                            className="flex-1 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-2xl py-3 text-sm font-extrabold uppercase tracking-widest transition shadow-lg">
                                            {loading ? 'Closing…' : 'Confirm & Print'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
