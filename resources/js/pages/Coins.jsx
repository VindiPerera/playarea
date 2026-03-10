import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

// ── Add / Edit Coin Modal ─────────────────────────────────────────────────────
function CoinModal({ token, coin, onClose, onSaved }) {
    const isEdit = !!coin;
    const [form,    setForm]    = useState({ name: coin?.name ?? '', price: coin?.price ?? '' });
    const [errors,  setErrors]  = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const res = await fetch(isEdit ? `/api/coins/${coin.id}` : '/api/coins', {
                method:  isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept:         'application/json',
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">{isEdit ? 'Edit Coin' : 'Add Coin'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>

                {errors.general && (
                    <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errors.general[0]}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Coin Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Gold Coin"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (LKR) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">LKR</span>
                            <input
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                                required
                                placeholder="0.00"
                                className="w-full border border-gray-300 rounded-lg pl-14 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                            />
                        </div>
                        {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price[0]}</p>}
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
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg py-2.5 text-sm font-semibold transition"
                        >
                            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Coin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Coin Card ─────────────────────────────────────────────────────────────────
const COIN_COLORS = [
    'bg-yellow-500', 'bg-purple-600', 'bg-blue-600',
    'bg-emerald-600', 'bg-orange-500', 'bg-pink-600',
];

function CoinCard({ coin, index, token, onEdited, onDeleted }) {
    const bg         = COIN_COLORS[index % COIN_COLORS.length];
    const [confirming, setConfirming] = useState(false);

    const handleDelete = async () => {
        try {
            await fetch(`/api/coins/${coin.id}`, {
                method:  'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            onDeleted(coin.id);
        } catch (_) {}
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className={`${bg} flex flex-col items-center justify-center py-7 gap-1`}>
                <span className="text-4xl">🪙</span>
                <span className="text-white font-bold text-sm mt-1 tracking-wide uppercase">{coin.name}</span>
            </div>

            <div className="p-5">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-bold text-gray-800 text-base">LKR {parseFloat(coin.price).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Added:</span>
                        <span className="text-gray-700 font-medium">{new Date(coin.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 flex items-center justify-center py-3 gap-4">
                {confirming ? (
                    <>
                        <span className="text-xs text-gray-300">Delete?</span>
                        <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-xs font-semibold transition">Yes</button>
                        <button onClick={() => setConfirming(false)} className="text-gray-400 hover:text-white text-xs transition">No</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => onEdited(coin)} className="text-gray-400 hover:text-white transition" title="Edit coin">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <div className="w-px h-4 bg-gray-700"></div>
                        <button onClick={() => setConfirming(true)} className="text-gray-400 hover:text-red-400 transition" title="Delete coin">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Coins Page ────────────────────────────────────────────────────────────────
export default function Coins() {
    const { token }                 = useAuth();
    const navigate                  = useNavigate();
    const [coins,       setCoins]       = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [search,      setSearch]      = useState('');
    const [showModal,   setShowModal]   = useState(false);
    const [editingCoin, setEditingCoin] = useState(null);

    useEffect(() => {
        if (!token) return;
        
        fetch('/api/coins', {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
            .then(r => {
                if (!r.ok) throw new Error('Failed to fetch coins');
                return r.json();
            })
            .then(data => setCoins(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error('Error loading coins:', err);
                setCoins([]);
            })
            .finally(() => setLoading(false));
    }, [token]);

    const handleSaved   = (coin) => setCoins(prev => [coin, ...prev]);
    const handleUpdated = (coin) => setCoins(prev => prev.map(c => c.id === coin.id ? coin : c));
    const handleDeleted = (id)   => setCoins(prev => prev.filter(c => c.id !== id));

    const filtered = coins.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

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
                            Coins
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-900 text-white rounded-full px-4 py-1.5">
                            <span className="text-sm font-bold">{coins.length}</span>
                            <span className="text-xs text-gray-400">/ Total Coins</span>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition"
                        >
                            + Add Coin
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by coin name..."
                        className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    />
                </div>

                {/* Cards */}
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading coins…</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">
                        <p className="text-4xl mb-3">🪙</p>
                        <p className="font-medium">No coins found.</p>
                        {coins.length === 0 && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                            >
                                Add your first coin
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {filtered.map((c, i) => (
                            <CoinCard
                                key={c.id}
                                coin={c}
                                index={i}
                                token={token}
                                onEdited={setEditingCoin}
                                onDeleted={handleDeleted}
                            />
                        ))}
                    </div>
                )}
            </main>

            {(showModal || editingCoin) && (
                <CoinModal
                    token={token}
                    coin={editingCoin}
                    onClose={() => { setShowModal(false); setEditingCoin(null); }}
                    onSaved={editingCoin ? handleUpdated : handleSaved}
                />
            )}
        </div>
    );
}
