import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

// Dynamic badge colour by game name
function gameBadgeClass(name) {
    const n = (name ?? '').toLowerCase();
    if (n.includes('car'))   return 'bg-red-100 text-red-700';
    if (n.includes('bike'))  return 'bg-blue-100 text-blue-700';
    if (n.includes('teddy')) return 'bg-pink-100 text-pink-700';
    return 'bg-gray-100 text-gray-700';
}
function gameEmoji(name) {
    const n = (name ?? '').toLowerCase();
    if (n.includes('car'))   return '🚗';
    if (n.includes('bike'))  return '🏍️';
    if (n.includes('teddy')) return '🧸';
    return '🎮';
}

// ── Add Customer Modal ────────────────────────────────────────────────────────
function AddCustomerModal({ token, games, onClose, onSaved }) {
    const [form,    setForm]    = useState({ name: '', phone: '' });
    const [errors,  setErrors]  = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const res  = await fetch('/api/customers', {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept:          'application/json',
                    Authorization:  `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrors(data.errors ?? { general: [data.message ?? 'Error'] });
            } else {
                onSaved(data);
                onClose();
            }
        } catch (_) {
            setErrors({ general: ['Network error. Please try again.'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Add Customer</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {errors.general && (
                    <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        {errors.general[0]}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. John Smith"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            placeholder="e.g. +60123456789"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone[0]}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2.5 text-sm font-semibold transition"
                        >
                            {loading ? 'Saving…' : 'Add Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Customer Card ─────────────────────────────────────────────────────────────
function CustomerCard({ customer }) {
    const initials = customer.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                            {initials}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Game:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${gameBadgeClass(customer.game)}`}>
                            {gameEmoji(customer.game)} {customer.game}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Joined:</span>
                        <span className="text-gray-700 font-medium">
                            {new Date(customer.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 flex items-center justify-center py-3">
                <button className="text-gray-400 hover:text-white transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ── Customers Page ────────────────────────────────────────────────────────────
export default function Customers() {
    const { token }                     = useAuth();
    const navigate                      = useNavigate();
    const [customers, setCustomers]     = useState([]);
    const [games,     setGames]         = useState([]);
    const [loading,   setLoading]       = useState(true);
    const [search,    setSearch]        = useState('');
    const [filterGame, setFilterGame]   = useState('');
    const [showModal, setShowModal]     = useState(false);

    useEffect(() => {
        if (!token) return;
        
        const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
        Promise.all([
            fetch('/api/customers', { headers }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch customers');
                return r.json();
            }),
            fetch('/api/games', { headers }).then(r => {
                if (!r.ok) throw new Error('Failed to fetch games');
                return r.json();
            }),
        ]).then(([cData, gData]) => {
            setCustomers(Array.isArray(cData) ? cData : []);
            setGames(Array.isArray(gData) ? gData : []);
        }).catch(err => {
            console.error('Error loading data:', err);
            setCustomers([]);
            setGames([]);
        }).finally(() => setLoading(false));
    }, [token]);

    const handleSaved = (customer) => {
        setCustomers(prev => [customer, ...prev]);
    };

    const filtered = customers.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                            c.phone.includes(search);
        const matchGame   = filterGame ? c.game === filterGame : true;
        return matchSearch && matchGame;
    });

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* Page header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-500 hover:text-gray-700 transition text-xl font-bold"
                        >
                            ‹
                        </button>
                        <h1 className="text-2xl font-extrabold tracking-wide text-gray-800 uppercase">
                            Customer
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-900 text-white rounded-full px-4 py-1.5">
                            <span className="text-sm font-bold">{customers.length}</span>
                            <span className="text-xs text-gray-400">/ Total Customers</span>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition"
                        >
                            + Add Customer
                        </button>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or phone number..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <select
                        value={filterGame}
                        onChange={e => setFilterGame(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[180px]"
                    >
                        <option value="">Filter by Game</option>
                        {games.map(g => (
                            <option key={g.id} value={g.name}>{g.name}</option>
                        ))}
                    </select>
                </div>

                {/* Cards grid */}
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading customers…</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">
                        <p className="text-4xl mb-3">👥</p>
                        <p className="font-medium">No customers found.</p>
                        {customers.length === 0 && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                            >
                                Add your first customer
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {filtered.map(c => (
                            <CustomerCard key={c.id} customer={c} />
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <AddCustomerModal
                    token={token}
                    games={games}
                    onClose={() => setShowModal(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
